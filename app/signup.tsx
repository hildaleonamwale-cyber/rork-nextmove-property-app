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
import { ArrowLeft, Eye, EyeOff, User, Mail, Phone } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Colors from '@/constants/colors';
import SuccessPrompt from '@/components/SuccessPrompt';
import { signup as supabaseSignup } from '@/utils/supabase-auth';
import { useUser } from '@/contexts/UserContext';

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { refetch } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSignup = useCallback(async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (!agreeTerms) {
      Alert.alert('Error', 'Please agree to the Terms and Conditions');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    try {
      setIsLoading(true);
      console.log('[Signup] Creating account:', { name, email, phone, platform: Platform.OS });
      
      const { user } = await supabaseSignup({
        name,
        email,
        phone: phone || undefined,
        password,
      });

      await AsyncStorage.setItem('@user_mode', 'client');

      console.log('[Signup] Signup successful:', user.email);

      console.log('[Signup] Refreshing user context...');
      await refetch();

      console.log('[Signup] Account created successfully!');
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.replace('/(tabs)/home' as any);
      }, 2000);
    } catch (error: any) {
      console.error('[Signup] Error occurred:', error);
      console.error('[Signup] Error details:', error.message || JSON.stringify(error));
      
      let errorMessage = 'An error occurred during signup';
      
      if (error.message?.includes('Network')) {
        Alert.alert(
          'Connection Error',
          'Network connection failed. Please check your internet connection and try again.'
        );
        return;
      } else if (error.message?.includes('User already registered') || error.message?.includes('already been registered')) {
        Alert.alert(
          'Account Already Exists',
          'An account with this email already exists. Would you like to log in instead?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Go to Login',
              onPress: () => router.push('/login' as any),
            },
          ]
        );
        return;
      } else if (error.message?.includes('profile setup is delayed')) {
        Alert.alert(
          'Almost There!',
          'Your account has been created. Please wait a moment and then log in with your credentials.',
          [
            {
              text: 'Go to Login',
              onPress: () => router.push('/login' as any),
            },
          ]
        );
        return;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Signup Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [name, email, phone, password, confirmPassword, agreeTerms, router, refetch]);

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
            onPress={() => router.back()}
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
            <Text style={styles.appTagline}>Begin Your Property Journey</Text>
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
            <Text style={styles.welcomeTitle}>Create Account</Text>
            <Text style={styles.welcomeSubtitle}>
              Join us to explore amazing properties
            </Text>

            <View style={styles.inputWithIcon}>
              <User size={20} color={Colors.gray[400]} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={Colors.gray[400]}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputWithIcon}>
              <Mail size={20} color={Colors.gray[400]} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor={Colors.gray[400]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWithIcon}>
              <Phone size={20} color={Colors.gray[400]} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor={Colors.gray[400]}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputPassword}
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

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Confirm Password"
                placeholderTextColor={Colors.gray[400]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                activeOpacity={0.7}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={Colors.gray[400]} />
                ) : (
                  <Eye size={20} color={Colors.gray[400]} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.termsContainer}
              onPress={() => setAgreeTerms(!agreeTerms)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                {agreeTerms && <View style={styles.checkboxInner} />}
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms and Conditions</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.signupButtonWrapper}
              onPress={handleSignup}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[Colors.primary, '#5FD6E3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signupButton}
              >
                <Text style={styles.signupButtonText}>
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessPrompt
        visible={showSuccess}
        message="Account Created Successfully"
        onClose={() => setShowSuccess(false)}
      />
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
    height: '45%',
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
    paddingBottom: 40,
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
    paddingTop: '35%',
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
    marginBottom: 32,
    lineHeight: 22,
  },
  inputWithIcon: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 14,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
    outlineStyle: 'none' as const,
  },
  inputWrapper: {
    position: 'relative' as const,
    marginBottom: 14,
  },
  inputPassword: {
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
  termsContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 28,
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
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
    width: 10,
    height: 10,
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  signupButtonWrapper: {
    marginBottom: 24,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  signupButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  signupButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  loginContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  loginText: {
    fontSize: 14,
    color: Colors.gray[500],
  },
  loginLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
});
