// ============================================
// FitPulse AI - Root Navigator
// ============================================

import React from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/colors';

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
  DietScreen,
  ProfileScreen,
} from '../screens/main/InteractiveScreens';

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

// ============== MAIN TAB NAVIGATOR ==============
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.gray800,
          borderTopColor: COLORS.gray700,
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray500,
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 4,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="WorkoutsTab"
        component={WorkoutStackNavigator}
        options={{
          tabBarLabel: 'Workouts',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>💪</Text>,
        }}
      />
      <Tab.Screen
        name="DietTab"
        component={DietScreen}
        options={{
          tabBarLabel: 'Diet',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>🥗</Text>,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

// ============== LOADING SCREEN ==============
const LoadingScreen = () => (
  <View style={loadingStyles.container}>
    <Text style={loadingStyles.logo}>⚡</Text>
    <Text style={loadingStyles.title}>FitPulse AI</Text>
    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
  </View>
);

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginTop: 16,
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
