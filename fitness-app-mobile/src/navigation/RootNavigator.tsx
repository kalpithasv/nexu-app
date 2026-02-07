// ============================================
// Nexu Fitness - Root Navigator
// ============================================

import React from 'react';
import { Text, View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/colors';
import { NexuLogo } from '../components/NexuLogo';

// Auth Screens
import {
  SplashScreen,
  LoginScreen,
  SignupScreen,
  PasswordResetScreen,
} from '../screens/auth/AuthScreens';

// Onboarding Screens
import {
  HealthAssessmentScreen,
  SubscriptionPlansScreen,
  PaymentScreen,
} from '../screens/onboarding/OnboardingScreens';

// Main Screens - Interactive versions
import {
  HomeScreen,
  WorkoutScreen,
  WorkoutDetailScreen,
  ActiveWorkoutScreen,
  ProfileScreen,
  SettingsScreen,
  HealthDataScreen,
  GoalsScreen,
  HelpSupportScreen,
  TermsPrivacyScreen,
} from '../screens/main/InteractiveScreens';
import { ProgressScreen } from '../screens/main/ProgressScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerShown: false,
};

// ============== AUTH STACK ==============
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="PasswordReset" component={PasswordResetScreen} />
    </Stack.Navigator>
  );
};

// ============== ONBOARDING STACK ==============
const OnboardingStack = () => {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="HealthAssessment" component={HealthAssessmentScreen} />
      <Stack.Screen name="SubscriptionPlans" component={SubscriptionPlansScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
    </Stack.Navigator>
  );
};

// ============== HOME STACK ==============
const HomeStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
      <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} />
    </Stack.Navigator>
  );
};

// ============== WORKOUT STACK ==============
const WorkoutStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="WorkoutMain" component={WorkoutScreen} />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
      <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} />
    </Stack.Navigator>
  );
};

// ============== PROFILE STACK ==============
const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="SubscriptionPlans" component={SubscriptionPlansScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="HealthData" component={HealthDataScreen} />
      <Stack.Screen name="Goals" component={GoalsScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="TermsPrivacy" component={TermsPrivacyScreen} />
    </Stack.Navigator>
  );
};

// ============== MAIN TAB NAVIGATOR ==============
const TabIcon = ({ name, color, focused }: { name: any; color: string; focused: boolean }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
    {focused && (
      <View style={{
        position: 'absolute',
        top: -14,
        width: 24,
        height: 3,
        borderRadius: 2,
        backgroundColor: COLORS.primary,
      }} />
    )}
    <Feather name={name} size={22} color={color} />
  </View>
);

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.secondary,
          borderTopColor: COLORS.gray800,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 12,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray500,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Montserrat_500Medium',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => <TabIcon name="home" color={color} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="WorkoutsTab"
        component={WorkoutStackNavigator}
        options={{
          tabBarLabel: 'Workouts',
          tabBarIcon: ({ color, focused }) => <TabIcon name="activity" color={color} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProgressTab"
        component={ProgressScreen}
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon: ({ color, focused }) => <TabIcon name="bar-chart-2" color={color} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => <TabIcon name="user" color={color} focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

// ============== LOADING SCREEN ==============
const LoadingScreen = () => (
  <View style={loadingStyles.container}>
    <NexuLogo size="large" variant="full" />
    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
  </View>
);

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// ============== ROOT NAVIGATOR ==============
export const RootNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : !user.isOnboarded ? (
        <OnboardingStack />
      ) : (
        <MainTabs />
      )}
    </NavigationContainer>
  );
};
