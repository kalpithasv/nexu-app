// ============================================
// Nexu Fitness - Workout Context & State
// ============================================

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { apiClient } from '../services/api';
import type { Workout, WorkoutSession, WorkoutCategory, Exercise, SetData } from '../types';

interface WorkoutState {
  categories: WorkoutCategory[];
  workouts: Workout[];
  exercises: Exercise[];
  currentSession: WorkoutSession | null;
  workoutHistory: WorkoutSession[];
  isLoading: boolean;
  error: string | null;
}

type WorkoutAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CATEGORIES'; payload: WorkoutCategory[] }
  | { type: 'SET_WORKOUTS'; payload: Workout[] }
  | { type: 'SET_EXERCISES'; payload: Exercise[] }
  | { type: 'START_SESSION'; payload: WorkoutSession }
  | { type: 'UPDATE_SESSION'; payload: Partial<WorkoutSession> }
  | { type: 'END_SESSION' }
  | { type: 'SET_HISTORY'; payload: WorkoutSession[] }
  | { type: 'LOG_SET'; payload: { exerciseIndex: number; setData: SetData } };

const initialState: WorkoutState = {
  categories: [],
  workouts: [],
  exercises: [],
  currentSession: null,
  workoutHistory: [],
  isLoading: false,
  error: null,
};

const workoutReducer = (state: WorkoutState, action: WorkoutAction): WorkoutState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'SET_WORKOUTS':
      return { ...state, workouts: action.payload };
    case 'SET_EXERCISES':
      return { ...state, exercises: action.payload };
    case 'START_SESSION':
      return { ...state, currentSession: action.payload };
    case 'UPDATE_SESSION':
      return {
        ...state,
        currentSession: state.currentSession
          ? { ...state.currentSession, ...action.payload }
          : null,
      };
    case 'END_SESSION':
      return { ...state, currentSession: null };
    case 'SET_HISTORY':
      return { ...state, workoutHistory: action.payload };
    case 'LOG_SET':
      if (!state.currentSession) return state;
      const updatedExercises = [...state.currentSession.exercises];
      const exercise = updatedExercises[action.payload.exerciseIndex];
      if (exercise) {
        exercise.setsCompleted = [...(exercise.setsCompleted || []), action.payload.setData];
      }
      return {
        ...state,
        currentSession: { ...state.currentSession, exercises: updatedExercises },
      };
    default:
      return state;
  }
};

interface WorkoutContextType extends WorkoutState {
  fetchCategories: () => Promise<void>;
  fetchWorkouts: (category?: string) => Promise<void>;
  fetchExercises: (category?: string) => Promise<void>;
  startWorkout: (workoutId: string, userId: string) => Promise<WorkoutSession | null>;
  logSet: (exerciseIndex: number, setData: SetData) => void;
  completeExercise: (exerciseIndex: number) => Promise<void>;
  completeWorkout: (duration: number, notes?: string, rating?: number) => Promise<boolean>;
  cancelWorkout: () => Promise<void>;
  fetchHistory: (userId: string) => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(workoutReducer, initialState);

  const fetchCategories = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiClient.get<{ categories: WorkoutCategory[] }>('/workouts/categories');
      if (response.success && response.data) {
        dispatch({ type: 'SET_CATEGORIES', payload: response.data.categories });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load categories' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const fetchWorkouts = useCallback(async (category?: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const endpoint = category ? `/workouts?category=${category}` : '/workouts';
      const response = await apiClient.get<{ workouts: Workout[] }>(endpoint);
      if (response.success && response.data) {
        dispatch({ type: 'SET_WORKOUTS', payload: response.data.workouts });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load workouts' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const fetchExercises = useCallback(async (category?: string) => {
    try {
      const endpoint = category ? `/workouts/exercises?category=${category}` : '/workouts/exercises';
      const response = await apiClient.get<{ exercises: Exercise[] }>(endpoint);
      if (response.success && response.data) {
        dispatch({ type: 'SET_EXERCISES', payload: response.data.exercises });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load exercises' });
    }
  }, []);

  const startWorkout = useCallback(async (workoutId: string, userId: string): Promise<WorkoutSession | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiClient.post<{ session: WorkoutSession }>('/workouts/start', {
        workoutId,
        userId,
      });
      if (response.success && response.data) {
        dispatch({ type: 'START_SESSION', payload: response.data.session });
        return response.data.session;
      }
      return null;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to start workout' });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const logSet = useCallback((exerciseIndex: number, setData: SetData) => {
    dispatch({ type: 'LOG_SET', payload: { exerciseIndex, setData } });
    
    // Sync with server
    if (state.currentSession) {
      apiClient.put(`/workouts/session/${state.currentSession.id}`, {
        exerciseIndex,
        setData,
      });
    }
  }, [state.currentSession]);

  const completeExercise = useCallback(async (exerciseIndex: number) => {
    if (!state.currentSession) return;
    
    await apiClient.put(`/workouts/session/${state.currentSession.id}`, {
      exerciseIndex,
      completed: true,
    });

    dispatch({
      type: 'UPDATE_SESSION',
      payload: { currentExerciseIndex: exerciseIndex + 1 },
    });
  }, [state.currentSession]);

  const completeWorkout = useCallback(async (duration: number, notes?: string, rating?: number): Promise<boolean> => {
    if (!state.currentSession) return false;
    
    try {
      const response = await apiClient.post(`/workouts/${state.currentSession.id}/complete`, {
        duration,
        notes,
        rating,
      });
      
      if (response.success) {
        dispatch({ type: 'END_SESSION' });
        return true;
      }
      return false;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to complete workout' });
      return false;
    }
  }, [state.currentSession]);

  const cancelWorkout = useCallback(async () => {
    if (!state.currentSession) return;
    
    await apiClient.delete(`/workouts/${state.currentSession.id}/cancel`);
    dispatch({ type: 'END_SESSION' });
  }, [state.currentSession]);

  const fetchHistory = useCallback(async (userId: string) => {
    try {
      const response = await apiClient.get<{ history: WorkoutSession[] }>(
        `/workouts/user/${userId}/history`
      );
      if (response.success && response.data) {
        dispatch({ type: 'SET_HISTORY', payload: response.data.history });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load history' });
    }
  }, []);

  return (
    <WorkoutContext.Provider
      value={{
        ...state,
        fetchCategories,
        fetchWorkouts,
        fetchExercises,
        startWorkout,
        logSet,
        completeExercise,
        completeWorkout,
        cancelWorkout,
        fetchHistory,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within WorkoutProvider');
  }
  return context;
};
