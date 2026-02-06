// ============================================
// Auth Context - Re-exports from Firebase Auth
// ============================================
// All authentication is now handled by Firebase.
// This file re-exports from AuthContext.firebase.tsx
// so existing imports throughout the app continue to work.

export { AuthProvider, useAuth } from './AuthContext.firebase';
