// ============================================
// usePlan Hook — Easy plan-gated feature access
// ============================================

import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPlanFeatures, getPlanTier, getPlanName, PlanFeatures, PlanId } from '../utils/planAccess';

export const usePlan = () => {
  const { user } = useAuth();

  const planId = (user?.subscriptionPlan || 'basic') as PlanId;

  const features = useMemo(() => getPlanFeatures(planId), [planId]);
  const tier = useMemo(() => getPlanTier(planId), [planId]);
  const name = useMemo(() => getPlanName(planId), [planId]);

  const isBasic = planId === 'basic';
  const isStandard = planId === 'standard';
  const isPro = planId === 'pro';
  const isPremium = planId === 'premium';
  const isPaid = tier > 0;

  /**
   * Check if user can access a feature. Returns { allowed, requiredPlan }
   */
  const checkAccess = (feature: keyof PlanFeatures) => {
    const allowed = !!features[feature];
    return { allowed };
  };

  return {
    planId,
    planName: name,
    tier,
    features,
    isBasic,
    isStandard,
    isPro,
    isPremium,
    isPaid,
    checkAccess,
  };
};
