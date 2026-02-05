// ============================================
// Nexu Fitness - Onboarding Screens
// ============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { PrimaryButton, ProgressBar, TextInput, OptionButton, Card } from '../../components/Button';
import { NexuLogo } from '../../components/NexuLogo';
import { COLORS } from '../../utils/colors';
import { SUBSCRIPTION_PLANS, FITNESS_GOALS, ACTIVITY_LEVELS } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

// ============== HEALTH ASSESSMENT SCREEN ==============
export const HealthAssessmentScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  
  // Form state
  const [age, setAge] = useState('25');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('70');
  const [goal, setGoal] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const { updateUser } = useAuth();

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Save assessment data
      updateUser({
        isOnboarded: true,
      });
      navigation.navigate('SubscriptionPlans');
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return age.length > 0;
      case 2: return height.length > 0;
      case 3: return weight.length > 0;
      case 4: return goal.length > 0;
      case 5: return activityLevel.length > 0;
      default: return true;
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <Text style={styles.questionTitle}>How old are you?</Text>
            <Text style={styles.questionSubtitle}>
              This helps us calculate your daily calorie needs
            </Text>
            <View style={styles.ageInput}>
              <TextInput
                placeholder="25"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
              <Text style={styles.unitLabel}>years</Text>
            </View>
          </View>
        );
      
      case 2:
        return (
          <View>
            <Text style={styles.questionTitle}>What's your height?</Text>
            <Text style={styles.questionSubtitle}>
              We use this to calculate your BMI
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                placeholder="175"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
              />
              <Text style={styles.unitLabel}>cm</Text>
            </View>
          </View>
        );
      
      case 3:
        return (
          <View>
            <Text style={styles.questionTitle}>What's your weight?</Text>
            <Text style={styles.questionSubtitle}>
              This helps us track your progress
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                placeholder="70"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
              <Text style={styles.unitLabel}>kg</Text>
            </View>
          </View>
        );
      
      case 4:
        return (
          <View>
            <Text style={styles.questionTitle}>What's your fitness goal?</Text>
            <Text style={styles.questionSubtitle}>
              Select your primary goal
            </Text>
            <View style={styles.optionsContainer}>
              {FITNESS_GOALS.map((item) => (
                <OptionButton
                  key={item.id}
                  label={item.label}
                  description={item.description}
                  icon={item.icon}
                  selected={goal === item.id}
                  onPress={() => setGoal(item.id)}
                />
              ))}
            </View>
          </View>
        );
      
      case 5:
        return (
          <View>
            <Text style={styles.questionTitle}>How active are you?</Text>
            <Text style={styles.questionSubtitle}>
              Be honest for accurate recommendations
            </Text>
            <View style={styles.optionsContainer}>
              {ACTIVITY_LEVELS.map((item) => (
                <OptionButton
                  key={item.id}
                  label={item.label}
                  description={item.description}
                  selected={activityLevel === item.id}
                  onPress={() => setActivityLevel(item.id)}
                />
              ))}
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity onPress={prevStep} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.stepIndicator}>Step {step} of {totalSteps}</Text>
      <ProgressBar progress={(step / totalSteps) * 100} />
      
      <View style={styles.contentContainer}>
        {renderStepContent()}
      </View>

      <View style={styles.buttonContainer}>
        <PrimaryButton
          title={step === totalSteps ? 'Complete' : 'Continue'}
          onPress={nextStep}
          disabled={!canProceed()}
        />
      </View>
    </ScrollView>
  );
};

// ============== SUBSCRIPTION PLANS SCREEN ==============
export const SubscriptionPlansScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState('premium');

  const handleContinue = () => {
    navigation.navigate('Payment', { planId: selectedPlan });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <NexuLogo size="small" variant="icon" style={{ marginBottom: 12 }} />
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Unlock your full potential with Nexu Fitness
        </Text>
      </View>

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
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </View>
            )}
            
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.planCurrency}>{plan.currency}</Text>
                <Text style={styles.planPrice}>{plan.price}</Text>
                <Text style={styles.planPeriod}>{plan.period}</Text>
              </View>
            </View>

            <View style={styles.featuresContainer}>
              {plan.features.map((feature, idx) => (
                <View key={idx} style={styles.featureRow}>
                  <Text style={styles.featureCheck}>✓</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <View style={styles.radioContainer}>
              <View style={[
                styles.radioOuter,
                selectedPlan === plan.id && styles.radioOuterSelected
              ]}>
                {selectedPlan === plan.id && <View style={styles.radioInner} />}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <PrimaryButton
        title={`Continue with ${SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.name}`}
        onPress={handleContinue}
      />

      <TouchableOpacity 
        style={styles.skipButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.skipText}>Maybe later</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// ============== PAYMENT SCREEN ==============
export const PaymentScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.id === route.params?.planId) || SUBSCRIPTION_PLANS[2];

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '').replace(/\D/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substring(0, 19);
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handlePayment = async () => {
    if (!cardNumber || !expiry || !cvv || !name) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success!',
        'Your subscription is now active. Let\'s start your fitness journey!',
        [{ text: 'Let\'s Go!', onPress: () => navigation.navigate('MainApp') }]
      );
    }, 2000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Payment Details</Text>
      <Text style={styles.subtitle}>Complete your {selectedPlan.name} subscription</Text>

      {/* Order Summary */}
      <View style={styles.orderSummary}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{selectedPlan.name} Plan</Text>
          <Text style={styles.summaryValue}>
            {selectedPlan.currency}{selectedPlan.price}{selectedPlan.period}
          </Text>
        </View>
      </View>

      {/* Payment Form */}
      <View style={styles.paymentForm}>
        <TextInput
          label="Cardholder Name"
          placeholder="John Doe"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          label="Card Number"
          placeholder="1234 5678 9012 3456"
          value={cardNumber}
          onChangeText={(text) => setCardNumber(formatCardNumber(text))}
          keyboardType="numeric"
        />

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <TextInput
              label="Expiry Date"
              placeholder="MM/YY"
              value={expiry}
              onChangeText={(text) => setExpiry(formatExpiry(text))}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfInput}>
            <TextInput
              label="CVV"
              placeholder="123"
              value={cvv}
              onChangeText={(text) => setCvv(text.replace(/\D/g, '').substring(0, 3))}
              keyboardType="numeric"
              secureTextEntry
            />
          </View>
        </View>
      </View>

      <PrimaryButton
        title={`Pay ${selectedPlan.currency}${selectedPlan.price}`}
        onPress={handlePayment}
        loading={loading}
      />

      <TouchableOpacity 
        style={styles.skipButton}
        onPress={() => navigation.navigate('MainApp')}
      >
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>

      <Text style={styles.secureText}>🔒 Your payment is secure and encrypted</Text>
    </ScrollView>
  );
};

// ============== STYLES ==============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  stepIndicator: {
    color: COLORS.gray500,
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: 8,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray500,
    lineHeight: 20,
  },
  contentContainer: {
    marginTop: 32,
    flex: 1,
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: 8,
  },
  questionSubtitle: {
    fontSize: 14,
    color: COLORS.gray500,
    marginBottom: 24,
  },
  ageInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitLabel: {
    color: COLORS.gray500,
    fontSize: 16,
    marginLeft: 12,
  },
  optionsContainer: {
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingTop: 20,
  },
  
  // Plans styles
  plansContainer: {
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: COLORS.gray800,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: COLORS.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planCurrency: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  planPeriod: {
    fontSize: 12,
    color: COLORS.gray500,
    marginLeft: 2,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureCheck: {
    color: COLORS.success,
    fontSize: 14,
    marginRight: 8,
  },
  featureText: {
    color: COLORS.gray400,
    fontSize: 14,
  },
  radioContainer: {
    alignItems: 'flex-end',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  skipText: {
    color: COLORS.gray500,
    fontSize: 14,
  },

  // Payment styles
  orderSummary: {
    backgroundColor: COLORS.gray800,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: COLORS.gray400,
    fontSize: 14,
  },
  summaryValue: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentForm: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  secureText: {
    textAlign: 'center',
    color: COLORS.gray500,
    fontSize: 12,
    marginTop: 16,
  },
});
