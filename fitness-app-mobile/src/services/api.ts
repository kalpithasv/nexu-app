// ============================================
// FitPulse AI - API Service Layer
// ============================================

import { API_BASE_URL, API_TIMEOUT } from '../utils/constants';
import type { ApiResponse, AuthResponse, User, Workout, Meal, DailyProgress } from '../types';

// ============== HTTP CLIENT ==============
class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.timeout = API_TIMEOUT;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    return headers;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const config: RequestInit = {
        method,
        headers: this.getHeaders(),
        signal: controller.signal,
      };

      if (data && method !== 'GET') {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      clearTimeout(timeoutId);

      const json = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: json.message || 'An error occurred',
        };
      }

      return {
        success: true,
        data: json.data || json,
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Request timeout' };
      }
      return { success: false, error: error.message || 'Network error' };
    }
  }

  get<T>(endpoint: string) {
    return this.request<T>('GET', endpoint);
  }

  post<T>(endpoint: string, data?: any) {
    return this.request<T>('POST', endpoint, data);
  }

  put<T>(endpoint: string, data?: any) {
    return this.request<T>('PUT', endpoint, data);
  }

  delete<T>(endpoint: string) {
    return this.request<T>('DELETE', endpoint);
  }
}

export const apiClient = new ApiClient();

// ============== AUTH SERVICE ==============
export const AuthService = {
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    if (response.success && response.data?.token) {
      apiClient.setAuthToken(response.data.token);
    }
    return response;
  },

  async signup(email: string, password: string, name: string): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/signup', { email, password, name });
    if (response.success && response.data?.token) {
      apiClient.setAuthToken(response.data.token);
    }
    return response;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
    apiClient.setAuthToken(null);
  },

  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post('/auth/reset-password', { token, password });
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string }>> {
    return apiClient.post('/auth/refresh', { refreshToken });
  },

  async getProfile(): Promise<ApiResponse<User>> {
    return apiClient.get('/auth/profile');
  },

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return apiClient.put('/auth/profile', data);
  },
};

// ============== WORKOUT SERVICE ==============
export const WorkoutService = {
  async getWorkouts(category?: string): Promise<ApiResponse<Workout[]>> {
    const endpoint = category ? `/workouts?category=${category}` : '/workouts';
    return apiClient.get(endpoint);
  },

  async getWorkoutById(id: string): Promise<ApiResponse<Workout>> {
    return apiClient.get(`/workouts/${id}`);
  },

  async getWorkoutCategories(): Promise<ApiResponse<{ id: string; name: string; count: number }[]>> {
    return apiClient.get('/workouts/categories');
  },

  async startWorkout(workoutId: string): Promise<ApiResponse<{ sessionId: string }>> {
    return apiClient.post(`/workouts/${workoutId}/start`);
  },

  async completeWorkout(sessionId: string, data: {
    duration: number;
    caloriesBurned: number;
    exercises: { id: string; completed: boolean }[];
  }): Promise<ApiResponse<DailyProgress>> {
    return apiClient.post(`/workouts/sessions/${sessionId}/complete`, data);
  },

  async getTodayWorkout(): Promise<ApiResponse<Workout>> {
    return apiClient.get('/workouts/today');
  },

  async getRecommendedWorkouts(): Promise<ApiResponse<Workout[]>> {
    return apiClient.get('/workouts/recommended');
  },
};

// ============== DIET SERVICE ==============
export const DietService = {
  async getTodayMeals(): Promise<ApiResponse<Meal[]>> {
    return apiClient.get('/diet/today');
  },

  async getMealById(id: string): Promise<ApiResponse<Meal>> {
    return apiClient.get(`/diet/meals/${id}`);
  },

  async logMeal(mealId: string, data: {
    consumed: boolean;
    portions?: number;
  }): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post(`/diet/meals/${mealId}/log`, data);
  },

  async getNutritionSummary(date?: string): Promise<ApiResponse<{
    targetCalories: number;
    consumedCalories: number;
    protein: { target: number; consumed: number };
    carbs: { target: number; consumed: number };
    fat: { target: number; consumed: number };
  }>> {
    const endpoint = date ? `/diet/summary?date=${date}` : '/diet/summary';
    return apiClient.get(endpoint);
  },

  async getMealPlan(weekStart?: string): Promise<ApiResponse<{
    date: string;
    meals: Meal[];
  }[]>> {
    const endpoint = weekStart ? `/diet/plan?week=${weekStart}` : '/diet/plan';
    return apiClient.get(endpoint);
  },

  async regenerateMealPlan(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post('/diet/plan/regenerate');
  },
};

// ============== PROGRESS SERVICE ==============
export const ProgressService = {
  async getDailyProgress(date?: string): Promise<ApiResponse<DailyProgress>> {
    const endpoint = date ? `/progress/daily?date=${date}` : '/progress/daily';
    return apiClient.get(endpoint);
  },

  async getWeeklyProgress(): Promise<ApiResponse<DailyProgress[]>> {
    return apiClient.get('/progress/weekly');
  },

  async getMonthlyProgress(month?: string): Promise<ApiResponse<DailyProgress[]>> {
    const endpoint = month ? `/progress/monthly?month=${month}` : '/progress/monthly';
    return apiClient.get(endpoint);
  },

  async logWater(amount: number): Promise<ApiResponse<{ total: number }>> {
    return apiClient.post('/progress/water', { amount });
  },

  async logSteps(steps: number): Promise<ApiResponse<{ total: number }>> {
    return apiClient.post('/progress/steps', { steps });
  },

  async logSleep(hours: number): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post('/progress/sleep', { hours });
  },

  async getStreak(): Promise<ApiResponse<{ current: number; longest: number }>> {
    return apiClient.get('/progress/streak');
  },
};

// ============== SUBSCRIPTION SERVICE ==============
export const SubscriptionService = {
  async getPlans(): Promise<ApiResponse<{
    id: string;
    name: string;
    price: number;
    features: string[];
  }[]>> {
    return apiClient.get('/subscriptions/plans');
  },

  async subscribe(planId: string, paymentMethod: string): Promise<ApiResponse<{
    subscriptionId: string;
    expiresAt: string;
  }>> {
    return apiClient.post('/subscriptions/subscribe', { planId, paymentMethod });
  },

  async cancelSubscription(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post('/subscriptions/cancel');
  },

  async getCurrentSubscription(): Promise<ApiResponse<{
    planId: string;
    planName: string;
    expiresAt: string;
    autoRenew: boolean;
  }>> {
    return apiClient.get('/subscriptions/current');
  },
};
