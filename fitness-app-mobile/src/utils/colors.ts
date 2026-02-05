// ============================================
// Nexu Fitness - Color System
// ============================================

export const COLORS = {
  // Brand Colors
  primary: '#FFD60A',      // Vibrant Yellow - Main CTA, Highlights
  secondary: '#1A1A1A',    // Deep Black - Background
  accent: '#FFFFFF',       // Pure White - Text, Contrast

  // UI Colors (aliases for convenience)
  background: '#1A1A1A',   // Main background color
  card: '#2D2D2D',         // Card background
  text: '#FFFFFF',         // Primary text color
  textSecondary: '#A3A3A3', // Secondary text color

  // Gray Scale
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#E5E5E5',
  gray300: '#D4D4D4',
  gray400: '#A3A3A3',
  gray500: '#6B6B6B',
  gray600: '#525252',
  gray700: '#3D3D3D',
  gray800: '#2D2D2D',
  gray900: '#1A1A1A',

  // Semantic Colors
  success: '#10B981',      // Green - Success states
  error: '#EF4444',        // Red - Error states
  warning: '#F59E0B',      // Orange - Warning states
  info: '#3B82F6',         // Blue - Info states

  // Legacy aliases (for backward compatibility)
  gray: '#6B6B6B',
  lightGray: '#F5F5F5',
  darkGray: '#2D2D2D',
  border: '#3D3D3D',
  
  // Nutrition Colors
  protein: '#4CAF50',
  carbs: '#2196F3',
  fat: '#FF9800',
  calories: '#FF5722',
  water: '#00BCD4',
} as const;

export const GRADIENTS = {
  primary: [COLORS.primary, '#FFC300'],
  dark: [COLORS.secondary, COLORS.gray800],
  success: [COLORS.success, '#059669'],
  workout: ['#FF6B6B', '#FF8E53'],
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export type ColorKeys = keyof typeof COLORS;
