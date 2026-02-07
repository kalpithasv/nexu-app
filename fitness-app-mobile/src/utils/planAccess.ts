// ============================================
// Plan-Based Feature Access Control
// Determines what features each plan unlocks
// ============================================

export type PlanId = 'basic' | 'standard' | 'pro' | 'premium';

export interface PlanFeatures {
  // Workout features
  canWatchVideos: boolean;
  canUseGuidedWorkouts: boolean;
  canUseExerciseTimers: boolean;
  canUseRestTimers: boolean;
  canUseAutoNext: boolean;
  canTrackSets: boolean;

  // Content access
  maxWorkoutCategories: number;        // -1 = unlimited
  canAccessPremiumWorkouts: boolean;

  // Progress features
  canViewBasicProgress: boolean;
  canViewDetailedAnalytics: boolean;
  canViewStreaks: boolean;

  // Other
  canCustomizePlan: boolean;
  hasAdFree: boolean;
  hasPrioritySupport: boolean;
}

// Feature matrix per plan
const PLAN_FEATURES: Record<PlanId, PlanFeatures> = {
  basic: {
    canWatchVideos: true,
    canUseGuidedWorkouts: false,
    canUseExerciseTimers: false,
    canUseRestTimers: false,
    canUseAutoNext: false,
    canTrackSets: false,
    maxWorkoutCategories: 3,
    canAccessPremiumWorkouts: false,
    canViewBasicProgress: true,
    canViewDetailedAnalytics: false,
    canViewStreaks: true,
    canCustomizePlan: false,
    hasAdFree: false,
    hasPrioritySupport: false,
  },
  standard: {
    canWatchVideos: true,
    canUseGuidedWorkouts: true,
    canUseExerciseTimers: true,
    canUseRestTimers: false,
    canUseAutoNext: false,
    canTrackSets: true,
    maxWorkoutCategories: -1,
    canAccessPremiumWorkouts: false,
    canViewBasicProgress: true,
    canViewDetailedAnalytics: true,
    canViewStreaks: true,
    canCustomizePlan: false,
    hasAdFree: true,
    hasPrioritySupport: false,
  },
  pro: {
    canWatchVideos: true,
    canUseGuidedWorkouts: true,
    canUseExerciseTimers: true,
    canUseRestTimers: true,
    canUseAutoNext: true,
    canTrackSets: true,
    maxWorkoutCategories: -1,
    canAccessPremiumWorkouts: true,
    canViewBasicProgress: true,
    canViewDetailedAnalytics: true,
    canViewStreaks: true,
    canCustomizePlan: true,
    hasAdFree: true,
    hasPrioritySupport: false,
  },
  premium: {
    canWatchVideos: true,
    canUseGuidedWorkouts: true,
    canUseExerciseTimers: true,
    canUseRestTimers: true,
    canUseAutoNext: true,
    canTrackSets: true,
    maxWorkoutCategories: -1,
    canAccessPremiumWorkouts: true,
    canViewBasicProgress: true,
    canViewDetailedAnalytics: true,
    canViewStreaks: true,
    canCustomizePlan: true,
    hasAdFree: true,
    hasPrioritySupport: true,
  },
};

// Plan hierarchy (higher index = better plan)
const PLAN_HIERARCHY: PlanId[] = ['basic', 'standard', 'pro', 'premium'];

/**
 * Get the feature set for a given plan
 */
export const getPlanFeatures = (planId: string): PlanFeatures => {
  return PLAN_FEATURES[(planId as PlanId)] || PLAN_FEATURES.basic;
};

/**
 * Check if a plan has a specific feature
 */
export const hasPlanFeature = (planId: string, feature: keyof PlanFeatures): boolean => {
  const features = getPlanFeatures(planId);
  return !!features[feature];
};

/**
 * Get plan tier level (0 = basic, 3 = premium)
 */
export const getPlanTier = (planId: string): number => {
  return PLAN_HIERARCHY.indexOf(planId as PlanId);
};

/**
 * Check if plan A is higher than plan B
 */
export const isPlanHigherThan = (planA: string, planB: string): boolean => {
  return getPlanTier(planA) > getPlanTier(planB);
};

/**
 * Get the minimum plan required for a feature
 */
export const getMinPlanForFeature = (feature: keyof PlanFeatures): PlanId => {
  for (const planId of PLAN_HIERARCHY) {
    if (PLAN_FEATURES[planId][feature]) {
      return planId;
    }
  }
  return 'premium';
};

/**
 * Get readable plan name
 */
export const getPlanName = (planId: string): string => {
  const names: Record<string, string> = {
    basic: 'Basic',
    standard: 'Standard',
    pro: 'Pro',
    premium: 'Premium',
  };
  return names[planId] || 'Basic';
};
