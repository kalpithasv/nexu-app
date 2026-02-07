// ============================================
// Nexu Fitness - Onboarding Screens (Redesigned)
// ============================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NexuLogo } from '../../components/NexuLogo';
import { COLORS } from '../../utils/colors';
import { SUBSCRIPTION_PLANS } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import { RazorpayCheckout } from '../../components/RazorpayCheckout';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============== CUSTOM COMPONENTS ==============

// Scroll wheel picker (like the reference design)
const ITEM_HEIGHT = 52;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

// ---- Production-grade Animated FlatList picker ----
const PickerItem = React.memo(
  ({ item, index, scrollY, unit }: { item: number; index: number; scrollY: Animated.Value; unit?: string }) => {
    const center = index * ITEM_HEIGHT;
    const inputRange = [
      center - 2 * ITEM_HEIGHT,
      center - ITEM_HEIGHT,
      center,
      center + ITEM_HEIGHT,
      center + 2 * ITEM_HEIGHT,
    ];

    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [0.72, 0.86, 1.12, 0.86, 0.72],
      extrapolate: 'clamp',
    });

    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [0.2, 0.45, 1, 0.45, 0.2],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[scrollPickerStyles.item, { transform: [{ scale }], opacity }]}>
        <View style={scrollPickerStyles.itemRow}>
          <Text style={scrollPickerStyles.itemText}>{item}</Text>
          {unit ? <Text style={scrollPickerStyles.unitText}>{unit}</Text> : null}
        </View>
      </Animated.View>
    );
  },
);

const ScrollPicker = ({
  values,
  selectedValue,
  onValueChange,
  label,
  unit,
}: {
  values: number[];
  selectedValue: number;
  onValueChange: (v: number) => void;
  label: string;
  unit?: string;
}) => {
  const listRef = useRef<any>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const momentumActive = useRef(false);

  const initialIndex = Math.max(0, values.indexOf(selectedValue));

  const snapToClosest = useCallback(
    (offsetY: number) => {
      const idx = Math.round(offsetY / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(idx, values.length - 1));
      onValueChange(values[clamped]);
      // Ensure pixel-perfect alignment
      listRef.current?.scrollToOffset({ offset: clamped * ITEM_HEIGHT, animated: true });
    },
    [values, onValueChange],
  );

  const onScrollEvent = useRef(
    Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      { useNativeDriver: true },
    ),
  ).current;

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: number; index: number }) => (
      <PickerItem item={item} index={index} scrollY={scrollY} unit={unit} />
    ),
    [scrollY, unit],
  );

  const keyExtractor = useCallback((v: number) => v.toString(), []);

  const onMomentumBegin = useCallback(() => {
    momentumActive.current = true;
  }, []);

  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      momentumActive.current = false;
      snapToClosest(e.nativeEvent.contentOffset.y);
    },
    [snapToClosest],
  );

  const onDragEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      // If no momentum follows the drag, snap manually after a short delay
      momentumActive.current = false;
      setTimeout(() => {
        if (!momentumActive.current) {
          snapToClosest(y);
        }
      }, 80);
    },
    [snapToClosest],
  );

  const onScrollFailed = useCallback(
    (info: { index: number; averageItemLength: number }) => {
      setTimeout(() => {
        listRef.current?.scrollToOffset({
          offset: info.averageItemLength * info.index,
          animated: false,
        });
      }, 100);
    },
    [],
  );

  return (
    <View style={scrollPickerStyles.column}>
      <Text style={scrollPickerStyles.label}>{label}</Text>
      <View style={scrollPickerStyles.pickerWrap}>
        <Animated.FlatList
          ref={listRef}
          data={values}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          snapToAlignment="start"
          decelerationRate="fast"
          bounces={false}
          nestedScrollEnabled
          overScrollMode="never"
          onScroll={onScrollEvent}
          scrollEventThrottle={16}
          onMomentumScrollBegin={onMomentumBegin}
          onMomentumScrollEnd={onMomentumEnd}
          onScrollEndDrag={onDragEnd}
          contentContainerStyle={{
            paddingVertical: (PICKER_HEIGHT - ITEM_HEIGHT) / 2,
          }}
          style={{ height: PICKER_HEIGHT }}
          initialScrollIndex={initialIndex}
          onScrollToIndexFailed={onScrollFailed}
          windowSize={5}
          maxToRenderPerBatch={10}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      </View>
    </View>
  );
};

const scrollPickerStyles = StyleSheet.create({
  column: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
    color: COLORS.gray500,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  pickerWrap: {
    height: PICKER_HEIGHT,
    overflow: 'hidden',
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 26,
    fontFamily: 'Kanit_600SemiBold',
    color: COLORS.text,
  },
  unitText: {
    fontSize: 13,
    fontFamily: 'Montserrat_500Medium',
    color: COLORS.gray500,
    marginLeft: 3,
  },
});

// Goal/Activity card with icon
const SelectionCard = ({
  icon,
  label,
  description,
  selected,
  onPress,
}: {
  icon: string;
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[cardStyles.container, selected && cardStyles.selected]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[cardStyles.iconBg, selected && cardStyles.iconBgSelected]}>
      <Text style={cardStyles.icon}>{icon}</Text>
    </View>
    <View style={cardStyles.textContainer}>
      <Text style={[cardStyles.label, selected && cardStyles.labelSelected]}>
        {label}
      </Text>
      <Text style={cardStyles.description}>{description}</Text>
    </View>
    <View style={[cardStyles.radio, selected && cardStyles.radioSelected]}>
      {selected && <View style={cardStyles.radioInner} />}
    </View>
  </TouchableOpacity>
);

const cardStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray800,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: COLORS.primary,
    backgroundColor: '#1F1F00',
  },
  iconBg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.gray700,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconBgSelected: {
    backgroundColor: 'rgba(255, 214, 10, 0.15)',
  },
  icon: {
    fontSize: 26,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 17,
    fontFamily: 'Kanit_600SemiBold',
    color: COLORS.text,
    marginBottom: 2,
  },
  labelSelected: {
    color: COLORS.primary,
  },
  description: {
    fontSize: 13,
    fontFamily: 'Montserrat_400Regular',
    color: COLORS.gray500,
    lineHeight: 18,
  },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: COLORS.gray600,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
  },
});

// Progress dots
const ProgressDots = ({ total, current }: { total: number; current: number }) => (
  <View style={dotStyles.container}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          dotStyles.dot,
          i === current && dotStyles.dotActive,
          i < current && dotStyles.dotComplete,
        ]}
      />
    ))}
  </View>
);

const dotStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.gray700,
  },
  dotActive: {
    width: 32,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  dotComplete: {
    backgroundColor: COLORS.primary,
  },
});

// ============== GENDERS ==============
const GENDERS = [
  { id: 'male', label: 'Male', icon: '♂️', description: 'Male' },
  { id: 'female', label: 'Female', icon: '♀️', description: 'Female' },
  { id: 'other', label: 'Prefer not to say', icon: '⚧️', description: 'Skip this' },
];

// ============== FITNESS GOALS (inline) ==============
const FITNESS_GOALS = [
  { id: 'lose_weight', label: 'Lose Weight', icon: '🔥', description: 'Burn fat and get leaner' },
  { id: 'build_muscle', label: 'Build Muscle', icon: '💪', description: 'Gain strength and size' },
  { id: 'get_fit', label: 'Get Fit', icon: '🏃', description: 'Improve overall fitness' },
  { id: 'maintain', label: 'Stay Healthy', icon: '⚖️', description: 'Maintain your current shape' },
];

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Beginner', icon: '🚶', description: 'Little to no exercise' },
  { id: 'light', label: 'Light', icon: '🚴', description: 'Exercise 1-3 days/week' },
  { id: 'moderate', label: 'Moderate', icon: '🏋️', description: 'Exercise 3-5 days/week' },
  { id: 'active', label: 'Beast Mode', icon: '⚡', description: 'Intense exercise 6-7 days/week' },
];

// ============== VALUE ARRAYS FOR SCROLL PICKERS ==============
const AGE_VALUES = Array.from({ length: 68 }, (_, i) => i + 13);       // 13–80
const HEIGHT_VALUES = Array.from({ length: 151 }, (_, i) => i + 100);  // 100–250
const WEIGHT_VALUES = Array.from({ length: 171 }, (_, i) => i + 30);   // 30–200

// ============== MAIN HEALTH ASSESSMENT SCREEN ==============
export const HealthAssessmentScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [step, setStep] = useState(0);
  const totalSteps = 4;

  // Form state
  const [age, setAge] = useState(25);
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(70);
  const [gender, setGender] = useState('');
  const [goal, setGoal] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const { saveFitnessProfile, updateUser } = useAuth();

  const nextStep = async () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      await saveFitnessProfile({
        age,
        height,
        weight,
        gender,
        goal,
        activityLevel,
      });
      navigation.navigate('SubscriptionPlans');
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return true;
      case 1: return gender.length > 0;
      case 2: return goal.length > 0;
      case 3: return activityLevel.length > 0;
      default: return true;
    }
  };

  const getStepTitle = (): string => {
    switch (step) {
      case 0: return 'Tell us about yourself';
      case 1: return 'Select your gender';
      case 2: return "What's your goal?";
      case 3: return 'How active are you?';
      default: return '';
    }
  };

  const getStepSubtitle = (): string => {
    switch (step) {
      case 0: return 'We need this to tailor your diet and workout plan specifically to your needs.';
      case 1: return 'This helps us personalize your experience';
      case 2: return 'Choose your primary fitness objective';
      case 3: return 'Be honest — we\'ll build the perfect plan for you';
      default: return '';
    }
  };

  const renderStepContent = () => {
    switch (step) {
      // ========== STEP 1: AGE + HEIGHT + WEIGHT (3-column scroll picker) ==========
      case 0:
        return (
          <View style={[styles.stepContent, { marginTop: 64 }]}>
            {/* Highlight bar behind selected row */}
            <View style={pickerRowStyles.container}>
              <View style={pickerRowStyles.highlightBar} />
              <ScrollPicker
                values={AGE_VALUES}
                selectedValue={age}
                onValueChange={setAge}
                label="AGE"
              />
              <ScrollPicker
                values={HEIGHT_VALUES}
                selectedValue={height}
                onValueChange={setHeight}
                label="HEIGHT"
                unit="cm"
              />
              <ScrollPicker
                values={WEIGHT_VALUES}
                selectedValue={weight}
                onValueChange={setWeight}
                label="WEIGHT"
                unit="kg"
              />
            </View>
          </View>
        );

      // ========== STEP 2: GENDER ==========
      case 1:
        return (
          <View style={styles.stepContent}>
            {GENDERS.map((item) => (
              <SelectionCard
                key={item.id}
                icon={item.icon}
                label={item.label}
                description={item.description}
                selected={gender === item.id}
                onPress={() => setGender(item.id)}
              />
            ))}
          </View>
        );

      // ========== STEP 3: GOAL ==========
      case 2:
        return (
          <View style={styles.stepContent}>
            {FITNESS_GOALS.map((item) => (
              <SelectionCard
                key={item.id}
                icon={item.icon}
                label={item.label}
                description={item.description}
                selected={goal === item.id}
                onPress={() => setGoal(item.id)}
              />
            ))}
          </View>
        );

      // ========== STEP 4: ACTIVITY LEVEL ==========
      case 3:
        return (
          <View style={styles.stepContent}>
            {ACTIVITY_LEVELS.map((item) => (
              <SelectionCard
                key={item.id}
                icon={item.icon}
                label={item.label}
                description={item.description}
                selected={activityLevel === item.id}
                onPress={() => setActivityLevel(item.id)}
              />
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.scrollView}>
        {/* Top bar — always at the top */}
        <View style={[styles.scrollContent, { paddingBottom: 0, flexGrow: 0 }]}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={prevStep} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.stepCounterWrap}>
              <Text style={styles.stepCounter}>
                Step {step + 1} of {totalSteps}
              </Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${((step + 1) / totalSteps) * 100}%` }]} />
              </View>
            </View>
            <View style={{ width: 44 }} />
          </View>
        </View>

        {/* Title + Content */}
        {step === 0 ? (
          // Picker step — title then picker, all pushed to the top
          <View style={{ paddingHorizontal: 24, paddingTop: 4 }}>
            <Text style={styles.title}>{getStepTitle()}</Text>
            <Text style={styles.subtitle}>{getStepSubtitle()}</Text>
            {renderStepContent()}
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <View style={{ paddingHorizontal: 24 }}>
              <Text style={styles.title}>{getStepTitle()}</Text>
              <Text style={styles.subtitle}>{getStepSubtitle()}</Text>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
            >
              {renderStepContent()}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.ctaButton, !canProceed() && styles.ctaButtonDisabled]}
          onPress={nextStep}
          disabled={!canProceed()}
          activeOpacity={0.8}
        >
          <Text style={[styles.ctaText, !canProceed() && styles.ctaTextDisabled]}>
            {step === totalSteps - 1 ? 'Finish Setup' : 'Next Step'}
          </Text>
          <Feather
            name={step === totalSteps - 1 ? 'check' : 'arrow-right'}
            size={22}
            color={canProceed() ? COLORS.secondary : COLORS.gray500}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={async () => {
            await saveFitnessProfile({
              age,
              height,
              weight,
              gender: gender || undefined,
              goal: goal || 'get_fit',
              activityLevel: activityLevel || 'moderate',
            });
            navigation.navigate('SubscriptionPlans');
          }}
          style={styles.skipBtnBottom}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const pickerRowStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 12,
  },
  highlightBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: ITEM_HEIGHT + 4,
    backgroundColor: COLORS.gray800,
    borderRadius: 16,
    top: '50%',
    marginTop: -(ITEM_HEIGHT + 4) / 2 + 20, // offset for label
  },
});

// ============== SUBSCRIPTION PLANS SCREEN ==============
export const SubscriptionPlansScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const { completeOnboarding, updateUser } = useAuth();

  const handleContinue = async () => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan);

    if (!plan) return;

    if (plan.price === 0) {
      // Free plan — save and complete onboarding directly
      await updateUser({ subscriptionPlan: 'basic' });
      await completeOnboarding();
    } else {
      // Paid plan — go to payment
      navigation.navigate('Payment', { planId: selectedPlan });
    }
  };

  const handleSkip = async () => {
    // Default to basic (free) and complete onboarding
    await updateUser({ subscriptionPlan: 'basic' });
    await completeOnboarding();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.planHeader}>
          <NexuLogo size="small" variant="icon" style={{ alignSelf: 'center', marginBottom: 16 }} />
          <Text style={styles.planTitle}>Choose Your Plan</Text>
          <Text style={styles.planSubtitle}>
            Unlock your full potential with Nexu Fitness
          </Text>
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {SUBSCRIPTION_PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardSelected,
              ]}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.8}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>BEST VALUE</Text>
                </View>
              )}

              {plan.price === 0 && (
                <View style={[styles.popularBadge, { backgroundColor: COLORS.success }]}>
                  <Text style={styles.popularText}>FREE</Text>
                </View>
              )}

              <View style={styles.planRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[
                    styles.planName,
                    selectedPlan === plan.id && { color: COLORS.primary }
                  ]}>
                    {plan.name}
                  </Text>
                  <View style={styles.priceRow}>
                    {plan.price === 0 ? (
                      <Text style={styles.planPrice}>Free</Text>
                    ) : (
                      <>
                        <Text style={styles.planCurrency}>{plan.currency}</Text>
                        <Text style={styles.planPrice}>{plan.price}</Text>
                        <Text style={styles.planPeriod}>{plan.period}</Text>
                      </>
                    )}
                  </View>
                </View>
                <View style={[styles.planRadio, selectedPlan === plan.id && styles.planRadioSelected]}>
                  {selectedPlan === plan.id && <View style={styles.planRadioInner} />}
                </View>
              </View>

              <View style={styles.featuresGrid}>
                {plan.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    <Feather name="check" size={14} color={COLORS.success} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>
            {SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.price === 0
              ? 'Start Free'
              : `Continue with ${SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.name}`
            }
          </Text>
          <Feather name="arrow-right" size={22} color={COLORS.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.laterButton}
          onPress={handleSkip}
        >
          <Text style={styles.laterText}>Start with Free plan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============== PAYMENT SCREEN (Razorpay) ==============
export const PaymentScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const [showRazorpay, setShowRazorpay] = useState(false);
  const { user, completeOnboarding, updateUser } = useAuth();

  const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.id === route.params?.planId) || SUBSCRIPTION_PLANS[2];

  const finishOnboarding = async () => {
    await updateUser({ subscriptionPlan: selectedPlan.id });
    await completeOnboarding();
  };

  const handlePayNow = () => {
    setShowRazorpay(true);
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    setShowRazorpay(false);
    // Save payment info and complete onboarding
    await updateUser({
      subscriptionPlan: selectedPlan.id,
      lastPaymentId: paymentId,
    } as any);
    Alert.alert(
      'Payment Successful!',
      `Your ${selectedPlan.name} plan is now active.\nPayment ID: ${paymentId}`,
      [{ text: "Let's Go!", onPress: () => completeOnboarding() }]
    );
  };

  const handlePaymentFailure = (error: string) => {
    setShowRazorpay(false);
    Alert.alert('Payment Failed', error || 'Something went wrong. Please try again.');
  };

  const handlePaymentDismiss = () => {
    setShowRazorpay(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Complete Payment</Text>
        <Text style={styles.subtitle}>Subscribe to {selectedPlan.name} plan</Text>

        {/* Order Summary Card */}
        <View style={styles.orderSummary}>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>{selectedPlan.name} Plan</Text>
            <Text style={styles.orderValue}>
              {selectedPlan.currency}{selectedPlan.price}{selectedPlan.period}
            </Text>
          </View>
          <View style={[styles.orderRow, { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.gray700 }]}>
            <Text style={[styles.orderLabel, { fontFamily: 'Kanit_600SemiBold' }]}>Total</Text>
            <Text style={[styles.orderValue, { color: COLORS.primary, fontFamily: 'Kanit_700Bold', fontSize: 22 }]}>
              {selectedPlan.currency}{selectedPlan.price}
            </Text>
          </View>
        </View>

        {/* Plan Features */}
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontFamily: 'Kanit_600SemiBold', fontSize: 16, color: COLORS.text, marginBottom: 12 }}>
            What you get:
          </Text>
          {selectedPlan.features.map((feature, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingLeft: 4 }}>
              <Feather name="check-circle" size={16} color={COLORS.success} />
              <Text style={{ fontFamily: 'Montserrat_400Regular', fontSize: 14, color: COLORS.gray400, marginLeft: 10 }}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {/* Razorpay Badge */}
        <View style={{ alignItems: 'center', marginTop: 32 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gray800, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 }}>
            <Feather name="shield" size={16} color={COLORS.success} />
            <Text style={{ fontFamily: 'Montserrat_500Medium', fontSize: 13, color: COLORS.gray400, marginLeft: 8 }}>
              Secured by Razorpay
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handlePayNow}
          activeOpacity={0.8}
        >
          <Feather name="lock" size={18} color={COLORS.secondary} />
          <Text style={styles.ctaText}>
            {' '}Pay {selectedPlan.currency}{selectedPlan.price}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.laterButton}
          onPress={async () => {
            await updateUser({ subscriptionPlan: 'basic' });
            await completeOnboarding();
          }}
        >
          <Text style={styles.laterText}>Start with Free plan instead</Text>
        </TouchableOpacity>

        <Text style={styles.secureNote}>
          🔒  Your payment is secure and encrypted
        </Text>
      </View>

      {/* Razorpay Checkout Modal */}
      <RazorpayCheckout
        visible={showRazorpay}
        amount={selectedPlan.price}
        planName={selectedPlan.name}
        userName={user?.name || ''}
        userEmail={user?.email || ''}
        onSuccess={handlePaymentSuccess}
        onFailure={handlePaymentFailure}
        onDismiss={handlePaymentDismiss}
      />
    </View>
  );
};

// ============== STYLES ==============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingBottom: 24,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gray800,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCounterWrap: {
    alignItems: 'center',
  },
  stepCounter: {
    fontSize: 13,
    fontFamily: 'Montserrat_500Medium',
    color: COLORS.gray500,
    marginBottom: 6,
  },
  progressBarBg: {
    width: 120,
    height: 4,
    backgroundColor: COLORS.gray700,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    color: COLORS.gray500,
  },
  skipBtnBottom: {
    alignItems: 'center',
    paddingVertical: 14,
  },

  // Title
  title: {
    fontSize: 30,
    fontFamily: 'Kanit_700Bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Montserrat_400Regular',
    color: COLORS.gray500,
    lineHeight: 22,
    marginBottom: 8,
  },

  // Step content
  stepContent: {
    marginTop: 8,
  },

  // Bottom CTA
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    paddingTop: 16,
    backgroundColor: COLORS.secondary,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray800,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 20,
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaButtonDisabled: {
    backgroundColor: COLORS.gray700,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaText: {
    fontSize: 18,
    fontFamily: 'Kanit_600SemiBold',
    color: COLORS.secondary,
  },
  ctaTextDisabled: {
    color: COLORS.gray500,
  },

  // ========== SUBSCRIPTION PLAN STYLES ==========
  planHeader: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 20,
  },
  planTitle: {
    fontSize: 30,
    fontFamily: 'Kanit_700Bold',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  planSubtitle: {
    fontSize: 15,
    fontFamily: 'Montserrat_400Regular',
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 22,
  },
  plansContainer: {
    marginBottom: 8,
  },
  planCard: {
    backgroundColor: COLORS.gray800,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  planCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#1F1F00',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderBottomLeftRadius: 14,
  },
  popularText: {
    color: COLORS.secondary,
    fontSize: 10,
    fontFamily: 'Kanit_600SemiBold',
    letterSpacing: 1,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  planName: {
    fontSize: 20,
    fontFamily: 'Kanit_600SemiBold',
    color: COLORS.text,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planCurrency: {
    fontSize: 16,
    color: COLORS.primary,
    fontFamily: 'Montserrat_600SemiBold',
  },
  planPrice: {
    fontSize: 28,
    fontFamily: 'Kanit_700Bold',
    color: COLORS.primary,
  },
  planPeriod: {
    fontSize: 13,
    color: COLORS.gray500,
    fontFamily: 'Montserrat_400Regular',
    marginLeft: 2,
  },
  planRadio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: COLORS.gray600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planRadioSelected: {
    borderColor: COLORS.primary,
  },
  planRadioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
  },
  featuresGrid: {
    gap: 6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    fontFamily: 'Montserrat_400Regular',
    color: COLORS.gray400,
  },
  laterButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  laterText: {
    fontSize: 15,
    fontFamily: 'Montserrat_500Medium',
    color: COLORS.gray500,
  },

  // ========== PAYMENT STYLES ==========
  orderSummary: {
    backgroundColor: COLORS.gray800,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    marginTop: 8,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderLabel: {
    fontSize: 15,
    fontFamily: 'Montserrat_500Medium',
    color: COLORS.gray400,
  },
  orderValue: {
    fontSize: 20,
    fontFamily: 'Kanit_700Bold',
    color: COLORS.primary,
  },
  paymentForm: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
  },
  paymentInputWrapper: {
    marginBottom: 16,
  },
  paymentLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
    color: COLORS.gray400,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  paymentInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray800,
    borderRadius: 14,
    height: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.gray700,
  },
  secureNote: {
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    color: COLORS.gray500,
    textAlign: 'center',
    marginTop: 4,
  },
});
