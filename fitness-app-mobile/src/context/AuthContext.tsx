import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../services/api';
import { API_BASE_URL } from '../utils/constants';

// ============================================
// DEMO MODE - Set to false to use real API
// ============================================
const DEMO_MODE = false; // Now using real API!

const DEMO_USER: User = {
  id: 'demo-user-001',
  email: 'sarah@fitpulse.ai',
  name: 'Sarah Johnson',
  subscriptionPlan: 'premium',
  isOnboarded: true,
};

interface User {
  id: string;
  email: string;
  name: string;
  subscriptionPlan: string;
  isOnboarded: boolean;
  profile?: any;
  stats?: any;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const bootstrapAsync = async () => {
      // DEMO MODE: Auto-login with demo user for quick testing
      if (DEMO_MODE) {
        setTimeout(() => {
          dispatch({ type: 'LOGIN', payload: DEMO_USER });
        }, 1000);
        return;
      }

      try {
        // Check for stored user & token
        const userJson = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('token');
        
        if (userJson && token) {
          const user = JSON.parse(userJson);
          apiClient.setAuthToken(token);
          
          // Verify token is still valid
          const response = await apiClient.get<{ user: User }>('/auth/verify');
          if (response.success && response.data) {
            dispatch({ type: 'RESTORE_TOKEN', payload: response.data.user });
          } else {
            // Token expired, clear storage
            await AsyncStorage.multiRemove(['user', 'token']);
            dispatch({ type: 'RESTORE_TOKEN', payload: null });
          }
        } else {
          dispatch({ type: 'RESTORE_TOKEN', payload: null });
        }
      } catch (e) {
        console.error('Failed to restore session', e);
        dispatch({ type: 'RESTORE_TOKEN', payload: null });
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await apiClient.post<{ user: User; token: string }>('/auth/login', {
        email,
        password,
      });

      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Store user and token
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('token', token);
        apiClient.setAuthToken(token);
        
        dispatch({ type: 'LOGIN', payload: user });
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await apiClient.post<{ user: User; token: string }>('/auth/signup', {
        email,
        password,
        name,
      });

      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Store user and token
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('token', token);
        apiClient.setAuthToken(token);
        
        dispatch({ type: 'LOGIN', payload: user });
      } else {
        throw new Error(response.error || 'Signup failed');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // Ignore logout API errors
    }
    
    await AsyncStorage.multiRemove(['user', 'token']);
    apiClient.setAuthToken(null);
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = async (data: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: data });
    
    // Persist locally
    if (state.user) {
      const updatedUser = { ...state.user, ...data };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Also update on server
      try {
        await apiClient.put(`/users/${state.user.id}`, data);
      } catch (e) {
        console.error('Failed to sync user update', e);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user: state.user, isLoading: state.isLoading, login, signup, logout, updateUser }}>
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
