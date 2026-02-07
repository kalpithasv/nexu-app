// ============================================
// Firebase Authentication + Firestore Context
// ============================================

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// ============== TYPES ==============

export interface FitnessProfile {
  age: number;
  height: number;       // cm
  weight: number;       // kg
  gender?: string;      // male | female | other
  goal: string;         // lose_weight | build_muscle | get_fit | maintain
  activityLevel: string; // sedentary | light | moderate | active
}

export interface User {
  id: string;
  email: string;
  name: string;
  subscriptionPlan: string;
  isOnboarded: boolean;
  fitnessProfile?: FitnessProfile;
  profile?: any;
  stats?: any;
  createdAt?: any;
  updatedAt?: any;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  resetPassword: (email: string) => Promise<void>;
  saveFitnessProfile: (profile: FitnessProfile) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_TOKEN'; payload: User | null }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_LOADING'; payload: boolean };

interface State {
  isLoading: boolean;
  user: User | null;
}

const initialState: State = {
  isLoading: true,
  user: null,
};

const authReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isLoading: false };
    case 'LOGOUT':
      return { ...state, user: null, isLoading: false };
    case 'RESTORE_TOKEN':
      return { ...state, user: action.payload, isLoading: false };
    case 'UPDATE_USER':
      return { ...state, user: state.user ? { ...state.user, ...action.payload } : null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

// ============== FIRESTORE HELPERS ==============

// Fetch user document from Firestore
const fetchUserDoc = async (uid: string): Promise<Partial<User> | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data() as Partial<User>;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user doc:', error);
    return null;
  }
};

// Create or update user document in Firestore
const saveUserDoc = async (uid: string, data: Record<string, any>) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // Update existing doc
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } else {
      // Create new doc
      await setDoc(userRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error saving user doc:', error);
  }
};

// Build full User object from Firebase Auth + Firestore data
const buildUser = (firebaseUser: FirebaseUser, firestoreData: Partial<User> | null): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firestoreData?.name || firebaseUser.displayName || 'User',
    subscriptionPlan: firestoreData?.subscriptionPlan || 'free',
    isOnboarded: firestoreData?.isOnboarded || false,
    fitnessProfile: firestoreData?.fitnessProfile || undefined,
    profile: firestoreData?.profile || undefined,
    stats: firestoreData?.stats || undefined,
  };
};

// ============== AUTH PROVIDER ==============

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Show user immediately with basic auth data (no loading wait)
        const basicUser = buildUser(firebaseUser, null);
        dispatch({ type: 'RESTORE_TOKEN', payload: basicUser });

        // Then enrich with Firestore data in the background
        try {
          const firestoreData = await fetchUserDoc(firebaseUser.uid);
          if (firestoreData) {
            const fullUser = buildUser(firebaseUser, firestoreData);
            dispatch({ type: 'RESTORE_TOKEN', payload: fullUser });
          }
        } catch {
          // Firestore unavailable — basic user data is enough
        }
      } else {
        dispatch({ type: 'RESTORE_TOKEN', payload: null });
      }
    });

    return unsubscribe;
  }, []);

  // ---- LOGIN ----
  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firestoreData = await fetchUserDoc(userCredential.user.uid);
      const user = buildUser(userCredential.user, firestoreData);
      dispatch({ type: 'LOGIN', payload: user });
    } catch (error: any) {
      dispatch({ type: 'SET_LOADING', payload: false });

      let errorMessage = 'Login failed';
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password';
          break;
        default:
          errorMessage = error.message || 'Login failed';
      }

      throw new Error(errorMessage);
    }
  };

  // ---- SIGNUP ----
  const signup = async (email: string, password: string, name: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update Firebase Auth display name
      await updateProfile(userCredential.user, { displayName: name });

      const userData: Partial<User> = {
        email,
        name,
        subscriptionPlan: 'free',
        isOnboarded: false,
      };

      // Save to Firestore
      await saveUserDoc(userCredential.user.uid, userData);

      const user: User = {
        id: userCredential.user.uid,
        email,
        name,
        subscriptionPlan: 'free',
        isOnboarded: false,
      };

      dispatch({ type: 'LOGIN', payload: user });
    } catch (error: any) {
      dispatch({ type: 'SET_LOADING', payload: false });

      let errorMessage = 'Signup failed';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Use at least 6 characters';
          break;
        default:
          errorMessage = error.message || 'Signup failed';
      }

      throw new Error(errorMessage);
    }
  };

  // ---- LOGOUT ----
  const logout = async () => {
    try {
      await signOut(auth);
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // ---- UPDATE USER (general) ----
  const updateUser = async (data: Partial<User>) => {
    if (!state.user) return;

    dispatch({ type: 'UPDATE_USER', payload: data });

    // Persist to Firestore
    try {
      await saveUserDoc(state.user.id, data);

      // If name changed, also update Firebase Auth profile
      if (data.name && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: data.name });
      }
    } catch (e) {
      console.error('Failed to update user in Firestore:', e);
    }
  };

  // ---- SAVE FITNESS PROFILE (does NOT mark onboarded) ----
  const saveFitnessProfile = async (profile: FitnessProfile) => {
    if (!state.user) return;

    dispatch({ type: 'UPDATE_USER', payload: { fitnessProfile: profile } });

    // Save fitness profile to Firestore (but don't set isOnboarded yet)
    try {
      await saveUserDoc(state.user.id, {
        fitnessProfile: profile,
      });
    } catch (e) {
      console.error('Failed to save fitness profile:', e);
    }
  };

  // ---- COMPLETE ONBOARDING (marks user as onboarded) ----
  const completeOnboarding = async () => {
    if (!state.user) return;

    dispatch({ type: 'UPDATE_USER', payload: { isOnboarded: true } });

    try {
      await saveUserDoc(state.user.id, { isOnboarded: true });
    } catch (e) {
      console.error('Failed to complete onboarding:', e);
    }
  };

  // ---- RESET PASSWORD ----
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      let errorMessage = 'Failed to send reset email';
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        default:
          errorMessage = error.message || 'Failed to send reset email';
      }
      throw new Error(errorMessage);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isLoading: state.isLoading,
        login,
        signup,
        logout,
        updateUser,
        resetPassword,
        saveFitnessProfile,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
