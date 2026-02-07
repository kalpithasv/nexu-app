// ============================================
// Nexu Fitness - Application Constants
// ============================================

// API Configuration
export const API_BASE_URL = __DEV__ 
  ? 'http://192.168.29.100:3000/api' 
  : 'https://api.fitpulse.ai/api';

export const API_TIMEOUT = 30000; // 30 seconds

// App Configuration
export const APP_CONFIG = {
  name: 'Nexu Fitness',
  tagline: 'Unleash Your Potential',
  version: '1.0.0',
  supportEmail: 'support@fitpulse.ai',
};

// Subscription Plans
export const SUBSCRIPTION_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    currency: '₹',
    period: '',
    features: [
      'Basic video workouts',
      'Simple diet plans',
      'Progress tracking',
      'Community access',
    ],
    color: '#E5E7EB',
    popular: false,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 200,
    currency: '₹',
    period: '/mo',
    features: [
      'All Basic features',
      'AI-powered diet plans',
      'Timer & rest periods',
      'Progress analytics',
      'Exercise library',
    ],
    color: '#FCD34D',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 500,
    currency: '₹',
    period: '/mo',
    features: [
      'All Standard features',
      'Personal AI Coach',
      'Custom workout plans',
      'Progress analytics',
      'Priority support',
    ],
    color: '#FFD60A',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 1000,
    currency: '₹',
    period: '/mo',
    features: [
      'All Pro features',
      '1-on-1 coaching',
      'Video consultations',
      'Nutrition consultation',
      'Custom meal prep',
      '24/7 priority support',
    ],
    color: '#FFA500',
    popular: false,
  },
];

// Razorpay Configuration (Test/Sandbox mode)
// Replace with your Razorpay Test Key ID from https://dashboard.razorpay.com/app/keys
export const RAZORPAY_KEY_ID = 'rzp_test_SD6PpOOPzKuPhg';  // e.g. 'rzp_test_xxxxxxxxxx'
export const RAZORPAY_CURRENCY = 'INR';

// Workout Categories
export const WORKOUT_CATEGORIES = [
  { id: 'chest', name: 'Chest', icon: '💪', count: 12, color: '#FF6B6B' },
  { id: 'back', name: 'Back', icon: '🔥', count: 15, color: '#4ECDC4' },
  { id: 'legs', name: 'Legs', icon: '🏃', count: 10, color: '#45B7D1' },
  { id: 'cardio', name: 'Cardio', icon: '❤️', count: 8, color: '#F06292' },
  { id: 'fullbody', name: 'Full Body', icon: '⚡', count: 20, color: '#FFD60A' },
  { id: 'core', name: 'Abs & Core', icon: '🎯', count: 14, color: '#9B59B6' },
  { id: 'yoga', name: 'Yoga', icon: '🧘', count: 6, color: '#2ECC71' },
];

// Fitness Goals
export const FITNESS_GOALS = [
  { id: 'lose_weight', label: 'Lose Weight', icon: '🔥', description: 'Burn fat and slim down' },
  { id: 'build_muscle', label: 'Build Muscle', icon: '💪', description: 'Gain strength and size' },
  { id: 'get_fit', label: 'Get Fit', icon: '🏃', description: 'Improve overall fitness' },
  { id: 'maintain', label: 'Maintain Health', icon: '⚖️', description: 'Keep current physique' },
];

// Activity Levels
export const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', description: 'Little to no exercise', multiplier: 1.2 },
  { id: 'light', label: 'Lightly Active', description: 'Light exercise 1-3 days/week', multiplier: 1.375 },
  { id: 'moderate', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week', multiplier: 1.55 },
  { id: 'active', label: 'Very Active', description: 'Hard exercise 6-7 days/week', multiplier: 1.725 },
];

// Default Meal Times
export const MEAL_TIMES = {
  breakfast: '08:00 AM',
  lunch: '12:30 PM',
  dinner: '07:00 PM',
  snack: '03:30 PM',
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@fitpulse_auth_token',
  USER_DATA: '@fitpulse_user_data',
  ONBOARDING_COMPLETE: '@fitpulse_onboarding',
  THEME_PREFERENCE: '@fitpulse_theme',
};

// Validation Rules
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MIN_AGE: 13,
  MAX_AGE: 100,
  MIN_HEIGHT_CM: 100,
  MAX_HEIGHT_CM: 250,
  MIN_WEIGHT_KG: 30,
  MAX_WEIGHT_KG: 300,
};
