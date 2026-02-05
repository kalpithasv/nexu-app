// ============================================
// FitPulse AI - App Constants
// ============================================

export const APP_CONFIG = {
  name: 'FitPulse AI',
  version: '1.0.0',
  tagline: 'Unleash Your Potential',
  description: 'Premium AI Coaching & Diet Planning',
};

export const SUBSCRIPTION_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    currency: '$',
    period: 'month',
    features: [
      'Basic workout plans',
      'Limited diet suggestions',
      'Progress tracking',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 19.99,
    currency: '$',
    period: 'month',
    features: [
      'All workout plans',
      'Full diet plans',
      'Progress tracking',
      'Weekly reports',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 29.99,
    currency: '$',
    period: 'month',
    popular: true,
    features: [
      'Everything in Standard',
      'AI Personal Coach',
      'Video consultations',
      'Priority support',
      'Custom meal prep',
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 49.99,
    currency: '$',
    period: 'month',
    features: [
      'Everything in Premium',
      '1-on-1 live coaching',
      'Dedicated nutritionist',
      'VIP support 24/7',
      'Exclusive content',
    ],
  },
];

export const FITNESS_GOALS = [
  { id: 'lose_weight', label: 'Lose Weight', icon: '🏃' },
  { id: 'build_muscle', label: 'Build Muscle', icon: '💪' },
  { id: 'get_fit', label: 'Get Fit', icon: '🎯' },
  { id: 'maintain', label: 'Maintain Health', icon: '❤️' },
];

export const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', description: 'Little or no exercise' },
  { id: 'light', label: 'Lightly Active', description: 'Exercise 1-3 days/week' },
  { id: 'moderate', label: 'Moderately Active', description: 'Exercise 3-5 days/week' },
  { id: 'active', label: 'Very Active', description: 'Exercise 6-7 days/week' },
];

export const WORKOUT_CATEGORIES = [
  { id: 'hiit', name: 'HIIT', icon: '🔥', count: 24 },
  { id: 'strength', name: 'Strength', icon: '💪', count: 32 },
  { id: 'cardio', name: 'Cardio', icon: '🏃', count: 18 },
  { id: 'yoga', name: 'Yoga', icon: '🧘', count: 15 },
  { id: 'pilates', name: 'Pilates', icon: '🤸', count: 12 },
  { id: 'stretching', name: 'Stretching', icon: '🙆', count: 10 },
];

export const API_BASE_URL = 'http://localhost:3000/api';
