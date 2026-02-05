// ============================================
// FitPulse AI - Main App Entry Point
// ============================================

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { WorkoutProvider } from './src/context/WorkoutContext';
import { DietProvider } from './src/context/DietContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { COLORS } from './src/utils/colors';

export default function App() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <DietProvider>
          <View style={styles.container}>
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
