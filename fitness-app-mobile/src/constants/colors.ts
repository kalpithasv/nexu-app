// ============================================
// Nexu Fitness - Color Palette
// ============================================

export const COLORS = {
  // Primary Colors
  primary: '#FFD60A',      // Yellow - Main brand color
  secondary: '#1A1A1A',    // Black - Background
  accent: '#FFFFFF',       // White - Text
  
  // Gray Scale
  gray: '#6B6B6B',         // Muted text
  darkGray: '#2D2D2D',     // Cards, inputs
  lightGray: '#F5F5F5',    // Light backgrounds
  border: '#3D3D3D',       // Borders
  
  // Status Colors
  success: '#4CAF50',      // Green
  warning: '#FF9800',      // Orange
  error: '#FF4444',        // Red
  info: '#2196F3',         // Blue
  
  // Gradients (for future use)
  gradientStart: '#FFD60A',
  gradientEnd: '#FFA500',
} as const;

export type ColorKeys = keyof typeof COLORS;
