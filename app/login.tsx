import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Colors from '@/constants/colors';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { trpc } from '@/lib/trpc';
import { setAuthToken, setUserData } from '@/utils/auth';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { enableSuperAdmin } = useSuperAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginMode, setLoginMode] = useState<'user' | 'admin'>('user');
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.auth.login.useMutation();

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Logging in with:', { email, loginMode });

      const result = await loginMutation.mutateAsync({
        email,
        password,
      });

      await setAuthToken(result.token);
      await setUserData(result.user);
      await AsyncStorage.setItem('@user_mode', result.user.role === 'admin' ? 'admin' : 'client');

      console.log('Login successful:', result.user);
      
      if (loginMode === 'admin' || result.user.role === 'admin') {
        await enableSuperAdmin();
        router.replace('/admin/dashboard' as any);
      } else if (result.user.role === 'agent' || result.user.role === 'agency') {
        router.replace('/agent/dashboard' as any);
      } else {
        router.replace('/(tabs)/home' as any);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, loginMode, router, enableSuperAdmin, loginMutation]);

  const handleSkipLogin = () => {
    router.replace('/(tabs)/home' as any);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, '#5FD6E3', '#7FE0EC']}
        locations={[0, 0.5, 1]}
        style={styles.gradientBackground}
      >
        <View style={[styles.waveContainer, { paddingTop: Platform.OS === 'web' ? 0 : insets.top }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
          
          <View style={styles.topSection}>
            <View style={styles.logoContainer}>
              <Image 
                source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/ifbay395j090acyodisqd' }} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appName}>NextMove</Text>
            <Text style={styles.appTagline}>Find Your Dream Property</Text>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Platform.OS === 'web' ? 40 : insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formCard}>
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in to continue your property journey
            </Text>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter email"
                placeholderTextColor={Colors.gray[400]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.gray[400]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                {showPassword ? (
                  <EyeOff size={20} color={Colors.gray[400]} />
                ) : (
                  <Eye size={20} color={Colors.gray[400]} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.optionsRow}>
              <TouchableOpacity 
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <View style={styles.checkboxInner} />}
                </View>
                <Text style={styles.rememberMeText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.loginButtonWrapper}
              onPress={handleLogin}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[Colors.primary, '#5FD6E3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButton}
              >
                <Text style={styles.loginButtonText}>{isLoading ? 'Logging in...' : 'Log In'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/signup' as any)} activeOpacity={0.7}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.demoButton}
              onPress={handleSkipLogin}
              activeOpacity={0.7}
            >
              <Text style={styles.demoButtonText}>Continue as Demo User</Text>
            </TouchableOpacity>

            {Platform.OS === 'web' && (
              <TouchableOpacity 
                style={styles.adminToggle}
                onPress={() => setLoginMode(loginMode === 'admin' ? 'user' : 'admin')}
                activeOpacity={0.7}
              >
                <Text style={styles.adminToggleText}>
                  {loginMode === 'admin' ? 'Switch to User' : 'Admin Login'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  gradientBackground: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    zIndex: 1,
  },
  waveContainer: {
    flex: 1,
    position: 'relative' as const,
  },
  backButton: {
    position: 'absolute' as const,
    top: 20,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)' as const,
    zIndex: 10,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingBottom: 60,
  },
  logoContainer: {
    marginBottom: 24,
    alignItems: 'center' as const,
  },
  logo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 48,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  appTagline: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 1,
  },
  keyboardView: {
    flex: 1,
    zIndex: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end' as const,
    paddingTop: '40%',
  },
  formCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 28,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: Colors.gray[500],
    marginBottom: 36,
    lineHeight: 22,
  },
  inputWrapper: {
    position: 'relative' as const,
    marginBottom: 16,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 15,
    color: Colors.text.primary,
  },
  eyeIcon: {
    position: 'absolute' as const,
    right: 20,
    top: 18,
  },
  optionsRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 28,
  },
  rememberMeContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 4,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
  },
  checkboxInner: {
    width: 8,
    height: 8,
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
  rememberMeText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  loginButtonWrapper: {
    marginBottom: 28,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  signupContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  signupText: {
    fontSize: 14,
    color: Colors.gray[500],
  },
  signupLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  adminToggle: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center' as const,
  },
  adminToggleText: {
    fontSize: 12,
    color: Colors.gray[400],
    textDecorationLine: 'underline' as const,
  },
  demoButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  demoButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
});
