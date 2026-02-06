// ============================================
// FitPulse AI - Main App Entry Point
// ============================================

import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Kanit_400Regular, Kanit_500Medium, Kanit_600SemiBold, Kanit_700Bold } from '@expo-google-fonts/kanit';
import { AuthProvider } from './src/context/AuthContext.firebase';
import { WorkoutProvider } from './src/context/WorkoutContext';
import { DietProvider } from './src/context/DietContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { COLORS } from './src/utils/colors';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Kanit_400Regular,
    Kanit_500Medium,
    Kanit_600SemiBold,
    Kanit_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <WorkoutProvider>
        <DietProvider>
          <View style={styles.container} onLayout={onLayoutRootView}>
            <RootNavigator />
          </View>
        </DietProvider>
      </WorkoutProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
});
