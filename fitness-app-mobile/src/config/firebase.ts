// ============================================
// Firebase Configuration
// ============================================

import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCNJHSN8iguME5DFeRwwaXaYvEsJW8kd9Y",
  authDomain: "nexu-e48b8.firebaseapp.com",
  projectId: "nexu-e48b8",
  storageBucket: "nexu-e48b8.firebasestorage.app",
  messagingSenderId: "241995769650",
  appId: "1:241995769650:web:9dcf86ebe0373b30ddd92b",
  measurementId: "G-YD1Q24CQSP"
};

// Initialize Firebase (prevent double-init)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with AsyncStorage persistence
let auth: ReturnType<typeof initializeAuth>;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // Auth already initialized, get existing instance
  auth = getAuth(app) as any;
}

// Initialize Firestore with settings for React Native
let db: ReturnType<typeof initializeFirestore>;
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true, // Required for React Native
  });
} catch (e) {
  // Firestore already initialized, get existing instance
  db = getFirestore(app) as any;
}

export { auth, db };
export default app;
