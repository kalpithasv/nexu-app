// ============================================
// Nexu Fitness - Reusable UI Components
// ============================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput as RNTextInput,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, SHADOWS } from '../utils/colors';

// ============== PRIMARY BUTTON ==============
interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  icon,
}) => {
  const getButtonStyle = (): ViewStyle[] => {
    const base: ViewStyle[] = [styles.button];
    
    // Size
    if (size === 'small') base.push(styles.buttonSmall);
    if (size === 'large') base.push(styles.buttonLarge);
    
    // Variant
    if (variant === 'secondary') base.push(styles.buttonSecondary);
    if (variant === 'outline') base.push(styles.buttonOutline);
    if (variant === 'danger') base.push(styles.buttonDanger);
    
    if (disabled) base.push(styles.buttonDisabled);
    if (style) base.push(style);
    
    return base;
  };

  const getTextColor = (): string => {
    if (disabled) return COLORS.gray500;
    if (variant === 'outline') return COLORS.primary;
    if (variant === 'secondary') return COLORS.accent;
    return COLORS.secondary;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={styles.buttonContent}>
          {icon}
          <Text style={[styles.buttonText, { color: getTextColor() }, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ============== CARD COMPONENT ==============
interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  dark?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, onPress, style, dark = false }) => {
  const cardStyle = dark ? styles.cardDark : styles.card;
  
  return (
    <TouchableOpacity
      style={[cardStyle, style]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </TouchableOpacity>
  );
};

// ============== PROGRESS BAR ==============
interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  height?: number;
  showLabel?: boolean;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = COLORS.primary,
  height = 8,
  showLabel = false,
  style,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <View style={style}>
      <View style={[styles.progressBackground, { height }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${clampedProgress}%`, backgroundColor: color },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={styles.progressLabel}>{Math.round(clampedProgress)}%</Text>
      )}
    </View>
  );
};

// ============== TEXT INPUT ==============
interface TextInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  style?: ViewStyle;
  label?: string;
  error?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
}

export const TextInput: React.FC<TextInputProps> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = 'default',
  style,
  label,
  error,
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
}) => {
  return (
    <View style={[styles.inputWrapper, style]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <RNTextInput
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray500}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          style={[styles.input, multiline && { textAlignVertical: 'top' }]}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// ============== OPTION BUTTON ==============
interface OptionButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  description?: string;
  icon?: string;
}

export const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  selected,
  onPress,
  description,
  icon,
}) => {
  return (
    <TouchableOpacity
      style={[styles.optionButton, selected && styles.optionSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.optionContent}>
        {icon && <Text style={styles.optionIcon}>{icon}</Text>}
        <View style={styles.optionTextContainer}>
          <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
            {label}
          </Text>
          {description && (
            <Text style={styles.optionDescription}>{description}</Text>
          )}
        </View>
      </View>
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
};

// ============== STAT BOX ==============
interface StatBoxProps {
  value: string | number;
  label: string;
  icon?: string;
  color?: string;
}

export const StatBox: React.FC<StatBoxProps> = ({
  value,
  label,
  icon,
  color = COLORS.primary,
}) => {
  return (
    <View style={styles.statBox}>
      {icon && <Text style={styles.statIcon}>{icon}</Text>}
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

// ============== SECTION HEADER ==============
interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onAction?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionText,
  onAction,
}) => {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionText && onAction && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ============== AVATAR ==============
interface AvatarProps {
  uri?: string;
  name?: string;
  size?: 'small' | 'medium' | 'large';
}

export const Avatar: React.FC<AvatarProps> = ({ uri, name, size = 'medium' }) => {
  const sizeValue = size === 'small' ? 40 : size === 'large' ? 100 : 60;
  const fontSize = size === 'small' ? 16 : size === 'large' ? 40 : 24;
  
  const getInitials = (name?: string) => {
    if (!name) return '👤';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <View
      style={[
        styles.avatar,
        { width: sizeValue, height: sizeValue, borderRadius: sizeValue / 2 },
      ]}
    >
      <Text style={{ fontSize }}>{uri ? '👤' : getInitials(name)}</Text>
    </View>
  );
};

// ============== BADGE ==============
interface BadgeProps {
  text: string;
  variant?: 'primary' | 'success' | 'warning' | 'error';
}

export const Badge: React.FC<BadgeProps> = ({ text, variant = 'primary' }) => {
  const getColor = () => {
    switch (variant) {
      case 'success': return COLORS.success;
      case 'warning': return COLORS.warning;
      case 'error': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getColor() }]}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
};

// ============== STYLES ==============
const styles = StyleSheet.create({
  // Button Styles
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  buttonSmall: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  buttonLarge: {
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  buttonSecondary: {
    backgroundColor: COLORS.gray800,
    borderWidth: 1,
    borderColor: COLORS.gray700,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonDanger: {
    backgroundColor: COLORS.error,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Card Styles
  card: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    ...SHADOWS.medium,
  },
  cardDark: {
    backgroundColor: COLORS.gray800,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },

  // Progress Bar Styles
  progressBackground: {
    backgroundColor: COLORS.gray800,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabel: {
    color: COLORS.gray500,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },

  // Input Styles
  inputWrapper: {
    marginVertical: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    backgroundColor: COLORS.gray800,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray700,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  input: {
    color: COLORS.accent,
    padding: 14,
    fontSize: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
  },

  // Option Button Styles
  optionButton: {
    backgroundColor: COLORS.gray800,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionSelected: {
    borderColor: COLORS.primary,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: COLORS.primary,
  },
  optionDescription: {
    color: COLORS.gray500,
    fontSize: 12,
    marginTop: 2,
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

  // Stat Box Styles
  statBox: {
    flex: 1,
    backgroundColor: COLORS.gray800,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 4,
  },

  // Section Header Styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  sectionAction: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },

  // Avatar Styles
  avatar: {
    backgroundColor: COLORS.gray800,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Badge Styles
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: 12,
  },
});
