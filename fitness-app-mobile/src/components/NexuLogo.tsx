// ============================================
// Nexu Fitness - Logo Component
// ============================================

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Image } from 'react-native';
import { COLORS } from '../utils/colors';

// Import logo images - user should add these to assets/images/
// logo-full.png = Full logo with "nexu UNISEX FITNESS" text
// logo-icon.png = Just the yellow X icon
const logoFull = require('../../assets/images/logo-full.png');
const logoIcon = require('../../assets/images/logo-icon.png');

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'full' | 'icon'; // full = with text, icon = just the X logo
  style?: ViewStyle;
}

export const NexuLogo: React.FC<LogoProps> = ({
  size = 'medium',
  variant = 'full',
  style,
}) => {
  const getImageSize = () => {
    switch (size) {
      case 'small':
        return variant === 'full' 
          ? { width: 120, height: 40 } 
          : { width: 32, height: 32 };
      case 'large':
        return variant === 'full' 
          ? { width: 280, height: 100 } 
          : { width: 80, height: 80 };
      case 'medium':
      default:
        return variant === 'full' 
          ? { width: 200, height: 70 } 
          : { width: 50, height: 50 };
    }
  };

  const imageSize = getImageSize();
  const logoSource = variant === 'full' ? logoFull : logoIcon;

  return (
    <View style={[styles.container, style]}>
      <Image
        source={logoSource}
        style={[styles.logo, imageSize]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    // Base logo styles
  },
});
