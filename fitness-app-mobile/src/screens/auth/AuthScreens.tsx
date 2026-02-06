// ============================================
// Nexu Fitness - Authentication Screens
// ============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Feather, AntDesign } from '@expo/vector-icons';
import { NexuLogo } from '../../components/NexuLogo';
import { COLORS } from '../../utils/colors';
import { APP_CONFIG } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

// ============== CUSTOM COMPONENTS ==============

const AuthInput = ({ 
  iconName, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry, 
  isPassword,
  error 
}: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputWrapper}>
      <View style={[
        styles.inputContainer, 
        isFocused && styles.inputFocused,
        error && styles.inputError
      ]}>
        <View style={styles.inputIcon}>
          <Feather name={iconName} size={20} color={isFocused ? COLORS.primary : COLORS.gray500} />
        </View>
        <RNTextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray500}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
        />
        {isPassword && (
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Feather 
              name={showPassword ? "eye-off" : "eye"} 
              size={20} 
              color={COLORS.gray500} 
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const SocialButton = ({ icon, onPress }: { icon: React.ReactNode, onPress?: () => void }) => (
  <TouchableOpacity style={styles.socialButton} onPress={onPress}>
    {icon}
  </TouchableOpacity>
);

const PrimaryButton = ({ title, onPress, loading, style }: any) => (
  <TouchableOpacity 
    style={[styles.primaryButton, style]} 
    onPress={onPress}
    disabled={loading}
    activeOpacity={0.8}
  >
    {loading ? (
      <ActivityIndicator color={COLORS.secondary} />
    ) : (
      <Text style={styles.primaryButtonText}>{title}</Text>
    )}
  </TouchableOpacity>
);

// ============== SPLASH SCREEN ==============
export const SplashScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  useEffect(() => {
    if (navigation) {
      const timer = setTimeout(() => {
        navigation.replace('Login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [navigation]);

  return (
    <View style={styles.splashContainer}>
      <View style={styles.logoContainer}>
        <NexuLogo size="large" variant="full" />
        <Text style={styles.tagline}>{APP_CONFIG.tagline}</Text>
      </View>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    </View>
  );
};

// ============== LOGIN SCREEN ==============
export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email';
    
    if (!password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Please check your credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <NexuLogo size="medium" variant="full" style={{ alignSelf: 'center' }} />
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtitle}>
            Sign in to continue your fitness journey
          </Text>
        </View>

        <View style={styles.formContainer}>
          <AuthInput
            iconName="mail"
            value={email}
            onChangeText={(t: string) => {
              setEmail(t);
              if (errors.email) setErrors({...errors, email: undefined});
            }}
            placeholder="Email Address"
            error={errors.email}
          />

          <AuthInput
            iconName="lock"
            value={password}
            onChangeText={(t: string) => {
              setPassword(t);
              if (errors.password) setErrors({...errors, password: undefined});
            }}
            placeholder="Password"
            isPassword
            error={errors.password}
          />

          <TouchableOpacity 
            onPress={() => navigation.navigate('PasswordReset')}
            style={styles.forgotButton}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <PrimaryButton 
            title="Log In" 
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <SocialButton 
              icon={<AntDesign name="google" size={24} color={COLORS.text} />} 
              onPress={() => Alert.alert('Google Login', 'Coming soon!')}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ============== SIGNUP SCREEN ==============
export const SignupScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signup } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Min 8 characters required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await signup(email, password, name);
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <Text style={styles.welcomeTitle}>Create Account</Text>
          <Text style={styles.welcomeSubtitle}>
            Join Nexu Fitness today
          </Text>
        </View>

        <View style={styles.formContainer}>
          <AuthInput
            iconName="user"
            value={name}
            onChangeText={setName}
            placeholder="Full Name"
            error={errors.name}
          />

          <AuthInput
            iconName="mail"
            value={email}
            onChangeText={setEmail}
            placeholder="Email Address"
            error={errors.email}
          />

          <AuthInput
            iconName="lock"
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            isPassword
            error={errors.password}
          />

          <PrimaryButton 
            title="Sign Up" 
            onPress={handleSignup}
            loading={loading}
            style={styles.loginButton}
          />

          <Text style={styles.termsText}>
            By signing up, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ============== PASSWORD RESET SCREEN ==============
export const PasswordResetScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleReset = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (error: any) {
      Alert.alert('Reset Failed', error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.successContent}>
          <Feather name="check-circle" size={80} color={COLORS.primary} style={{ marginBottom: 20 }} />
          <Text style={styles.welcomeTitle}>Check Your Email</Text>
          <Text style={styles.welcomeSubtitle}>
            We've sent password reset instructions to {email}
          </Text>
          <PrimaryButton 
            title="Back to Login" 
            onPress={() => navigation.navigate('Login')}
            style={{ marginTop: 30, width: '100%' }}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <Text style={styles.welcomeTitle}>Reset Password</Text>
          <Text style={styles.welcomeSubtitle}>
            Enter your email to receive reset instructions
          </Text>
        </View>

        <View style={styles.formContainer}>
          <AuthInput
            iconName="mail"
            value={email}
            onChangeText={setEmail}
            placeholder="Email Address"
          />

          <PrimaryButton 
            title="Send Reset Link" 
            onPress={handleReset}
            loading={loading}
            style={styles.loginButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ============== STYLES ==============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary, // Black background
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  
  // Splash
  splashContainer: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.primary,
    marginTop: 12,
    letterSpacing: 1,
    fontFamily: 'Montserrat_600SemiBold',
  },
  loadingContainer: {
    marginTop: 20,
  },

  // Header
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 40,
    marginTop: 20,
  },
  welcomeTitle: {
    fontSize: 32,
    fontFamily: 'Kanit_700Bold',
    color: COLORS.text, // White
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Montserrat_400Regular',
  },

  // Form
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray800, // Dark gray input bg
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    height: 60,
    paddingHorizontal: 16,
  },
  inputFocused: {
    borderColor: COLORS.primary, // Yellow border on focus
    backgroundColor: '#1A1A1A', // Slightly darker when focused
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    height: '100%',
    fontFamily: 'Montserrat_400Regular',
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: 'Montserrat_400Regular',
  },

  // Buttons
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: COLORS.secondary,
    fontSize: 18,
    fontFamily: 'Kanit_600SemiBold',
  },
  loginButton: {
    marginBottom: 30,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray700,
  },
  dividerText: {
    color: COLORS.gray500,
    marginHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
  },

  // Social
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 40,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.gray800,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray700,
  },
  socialIcon: {
    fontSize: 24,
    color: COLORS.text,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.gray500,
    fontSize: 16,
    fontFamily: 'Montserrat_400Regular',
  },
  footerLink: {
    color: COLORS.primary,
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },

  // Signup specific
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 20,
  },
  termsText: {
    textAlign: 'center',
    color: COLORS.gray500,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 30,
    fontFamily: 'Montserrat_400Regular',
  },
  linkText: {
    color: COLORS.primary,
    fontFamily: 'Montserrat_600SemiBold',
  },

  // Success Screen
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
