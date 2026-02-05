// ============================================
// FitPulse AI - Diet/Nutrition Context & State
// ============================================

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { apiClient } from '../services/api';
import type { Meal, MealLogEntry, DailyMealLog, MacroGoals, DietPlan, WaterLog } from '../types';

interface DietState {
  dietPlan: DietPlan | null;
  todaysMeals: MealLogEntry[];
  todaysTotals: { calories: number; protein: number; carbs: number; fat: number; fiber: number };
  macroGoals: MacroGoals | null;
  availableMeals: Meal[];
  waterLog: WaterLog | null;
  weeklyProgress: any[];
  isLoading: boolean;
  error: string | null;
}

type DietAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DIET_PLAN'; payload: DietPlan }
  | { type: 'SET_TODAYS_MEALS'; payload: { meals: MealLogEntry[]; totals: any } }
  | { type: 'ADD_MEAL_LOG'; payload: { entry: MealLogEntry; totals: any } }
  | { type: 'REMOVE_MEAL_LOG'; payload: { entryId: string; totals: any } }
  | { type: 'SET_MACRO_GOALS'; payload: MacroGoals }
  | { type: 'SET_AVAILABLE_MEALS'; payload: Meal[] }
  | { type: 'SET_WATER_LOG'; payload: WaterLog }
  | { type: 'UPDATE_WATER'; payload: number }
  | { type: 'SET_WEEKLY_PROGRESS'; payload: any[] };

const initialState: DietState = {
  dietPlan: null,
  todaysMeals: [],
  todaysTotals: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  macroGoals: null,
  availableMeals: [],
  waterLog: null,
  weeklyProgress: [],
  isLoading: false,
  error: null,
};

const dietReducer = (state: DietState, action: DietAction): DietState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_DIET_PLAN':
      return { 
        ...state, 
        dietPlan: action.payload, 
        macroGoals: action.payload.macroGoals || state.macroGoals 
      };
    case 'SET_TODAYS_MEALS':
      return { ...state, todaysMeals: action.payload.meals, todaysTotals: action.payload.totals };
    case 'ADD_MEAL_LOG':
      return {
        ...state,
        todaysMeals: [...state.todaysMeals, action.payload.entry],
        todaysTotals: action.payload.totals,
      };
    case 'REMOVE_MEAL_LOG':
      return {
        ...state,
        todaysMeals: state.todaysMeals.filter(m => m.id !== action.payload.entryId),
        todaysTotals: action.payload.totals,
      };
    case 'SET_MACRO_GOALS':
      return { ...state, macroGoals: action.payload };
    case 'SET_AVAILABLE_MEALS':
      return { ...state, availableMeals: action.payload };
    case 'SET_WATER_LOG':
      return { ...state, waterLog: action.payload };
    case 'UPDATE_WATER':
      if (!state.waterLog) return state;
      return {
        ...state,
        waterLog: { ...state.waterLog, glasses: state.waterLog.glasses + action.payload },
      };
    case 'SET_WEEKLY_PROGRESS':
      return { ...state, weeklyProgress: action.payload };
    default:
      return state;
  }
};

interface DietContextType extends DietState {
  fetchDietPlan: (userId: string) => Promise<void>;
  fetchTodaysLog: (userId: string) => Promise<void>;
  logMeal: (userId: string, mealId: string, mealType: string, servings?: number) => Promise<boolean>;
  logCustomMeal: (userId: string, meal: Partial<Meal>, mealType: string) => Promise<boolean>;
  removeMealLog: (userId: string, entryId: string) => Promise<void>;
  fetchAvailableMeals: (category?: string) => Promise<void>;
  logWater: (userId: string, glasses?: number) => Promise<void>;
  fetchWaterLog: (userId: string) => Promise<void>;
  fetchWeeklyProgress: (userId: string) => Promise<void>;
}

const DietContext = createContext<DietContextType | undefined>(undefined);

export const DietProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dietReducer, initialState);

  const fetchDietPlan = useCallback(async (userId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiClient.get<DietPlan>(`/diet/${userId}`);
      if (response.success && response.data) {
        dispatch({ type: 'SET_DIET_PLAN', payload: response.data });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load diet plan' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const fetchTodaysLog = useCallback(async (userId: string) => {
    try {
      const response = await apiClient.get<{ log: DailyMealLog; goals: MacroGoals }>(
        `/diet/${userId}/log`
      );
      if (response.success && response.data) {
        dispatch({
          type: 'SET_TODAYS_MEALS',
          payload: { meals: response.data.log.meals, totals: response.data.log.totals },
        });
        dispatch({ type: 'SET_MACRO_GOALS', payload: response.data.goals });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load today\'s meals' });
    }
  }, []);

  const logMeal = useCallback(async (
    userId: string,
    mealId: string,
    mealType: string,
    servings: number = 1
  ): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiClient.post<{ entry: MealLogEntry; dailyTotals: any }>(
        `/diet/${userId}/log-meal`,
        { mealId, mealType, servings }
      );
      if (response.success && response.data) {
        dispatch({
          type: 'ADD_MEAL_LOG',
          payload: { entry: response.data.entry, totals: response.data.dailyTotals },
        });
        return true;
      }
      return false;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to log meal' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const logCustomMeal = useCallback(async (
    userId: string,
    meal: Partial<Meal>,
    mealType: string
  ): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiClient.post<{ entry: MealLogEntry; dailyTotals: any }>(
        `/diet/${userId}/log-meal`,
        { customMeal: meal, mealType }
      );
      if (response.success && response.data) {
        dispatch({
          type: 'ADD_MEAL_LOG',
          payload: { entry: response.data.entry, totals: response.data.dailyTotals },
        });
        return true;
      }
      return false;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to log meal' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const removeMealLog = useCallback(async (userId: string, entryId: string) => {
    try {
      const response = await apiClient.delete<{ dailyTotals: any }>(
        `/diet/${userId}/log/${entryId}`
      );
      if (response.success && response.data) {
        dispatch({
          type: 'REMOVE_MEAL_LOG',
          payload: { entryId, totals: response.data.dailyTotals },
        });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove meal' });
    }
  }, []);

  const fetchAvailableMeals = useCallback(async (category?: string) => {
    try {
      const endpoint = category ? `/diet/meals?category=${category}` : '/diet/meals';
      const response = await apiClient.get<{ meals: Meal[] }>(endpoint);
      if (response.success && response.data) {
        dispatch({ type: 'SET_AVAILABLE_MEALS', payload: response.data.meals });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load meals' });
    }
  }, []);

  const logWater = useCallback(async (userId: string, glasses: number = 1) => {
    try {
      const response = await apiClient.post<{ waterLog: WaterLog }>(
        `/diet/${userId}/log-water`,
        { glasses }
      );
      if (response.success && response.data) {
        dispatch({ type: 'SET_WATER_LOG', payload: response.data.waterLog });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to log water' });
    }
  }, []);

  const fetchWaterLog = useCallback(async (userId: string) => {
    try {
      const response = await apiClient.get<{ waterLog: WaterLog }>(`/diet/${userId}/water`);
      if (response.success && response.data) {
        dispatch({ type: 'SET_WATER_LOG', payload: response.data.waterLog });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load water log' });
    }
  }, []);

  const fetchWeeklyProgress = useCallback(async (userId: string) => {
    try {
      const response = await apiClient.get<{ progress: any[] }>(`/diet/${userId}/progress`);
      if (response.success && response.data) {
        dispatch({ type: 'SET_WEEKLY_PROGRESS', payload: response.data.progress });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load progress' });
    }
  }, []);

  return (
    <DietContext.Provider
      value={{
        ...state,
        fetchDietPlan,
        fetchTodaysLog,
        logMeal,
        logCustomMeal,
        removeMealLog,
        fetchAvailableMeals,
        logWater,
        fetchWaterLog,
        fetchWeeklyProgress,
      }}
    >
      {children}
    </DietContext.Provider>
  );
};

export const useDiet = () => {
  const context = useContext(DietContext);
  if (!context) {
    throw new Error('useDiet must be used within DietProvider');
  }
  return context;
};
