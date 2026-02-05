// ============================================
// Nexu Fitness - TypeScript Types & Interfaces
// ============================================

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: SubscriptionPlan;
  profile: UserProfile;
  createdAt: Date;
}

export interface UserProfile {
  age: number;
  height: number;
  weight: number;
  goal: FitnessGoal;
  activityLevel: ActivityLevel;
  conditions?: string[];
}

export type FitnessGoal = 'lose_weight' | 'build_muscle' | 'get_fit' | 'maintain';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';

// Subscription Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  popular?: boolean;
}

// Workout Types
export interface WorkoutCategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
  workoutCount?: number;
  color?: string;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  calories?: number;
  exercises: Exercise[];
  videoUrl?: string;
  thumbnailUrl?: string;
}

export interface Exercise {
  id: string;
  name: string;
  duration: number; // in seconds
  reps?: number;
  sets?: number;
  restTime: number;
  videoUrl?: string;
  instructions: string[];
  muscleGroups?: string[];
  equipment?: string;
  caloriesPerMinute?: number;
}

export interface SetData {
  setNumber: number;
  reps: number;
  weight?: number;
  completed: boolean;
  timestamp?: string;
}

export interface WorkoutSession {
  id: string;
  workoutId: string;
  workoutName?: string;
  userId: string;
  startTime: string;
  endTime?: string;
  completedAt?: string;
  status: 'active' | 'completed' | 'cancelled';
  currentExerciseIndex?: number;
  exercises: {
    exerciseId: string;
    sets: SetData[];
    setsCompleted?: SetData[];
    completed: boolean;
  }[];
  caloriesBurned?: number;
  duration?: number;
  totalDuration?: number;
}

// Diet Types
export interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  category?: string; // Alias for type for compatibility
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  recipe?: string;
  imageUrl?: string;
}

export interface MealLogEntry {
  id: string;
  mealId?: string;
  meal?: Meal;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  mealType?: string; // Alias for type
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedAt: string;
  isCustom?: boolean;
}

export interface DailyMealLog {
  date: string;
  meals: MealLogEntry[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  waterGlasses: number;
}

export interface MacroGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DietPlan {
  id: string;
  name: string;
  description?: string;
  days: {
    day: number;
    meals: Meal[];
  }[];
  caloriesPerDay: number;
  macroGoals?: MacroGoals;
}

export interface WaterLog {
  date: string;
  glasses: number;
  target: number;
}

export interface DailyNutrition {
  date: string;
  targetCalories: number;
  consumedCalories: number;
  protein: { target: number; consumed: number };
  carbs: { target: number; consumed: number };
  fat: { target: number; consumed: number };
  meals: Meal[];
}

// Progress Types
export interface DailyProgress {
  date: string;
  workoutCompleted: boolean;
  workoutDuration: number;
  caloriesBurned: number;
  steps: number;
  water: number; // in ml
  sleep: number; // in hours
}

// Navigation Types
export type ScreenName = 
  | 'splash'
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'assessment'
  | 'plans'
  | 'payment'
  | 'main'
  | 'workout-detail'
  | 'meal-detail';

export type TabName = 'home' | 'workout' | 'diet' | 'profile';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}
