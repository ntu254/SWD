import { registerWithPassword } from '@/components/api/backend';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';
import { Link, Redirect, useRouter } from 'expo-router';
import {
  Eye,
  EyeOff,
  Leaf,
  Lock,
  Mail,
  User,
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen() {
  const router = useRouter();
  const accessToken = useAppStore((state) => state.accessToken);
  const user = useAppStore((state) => state.user);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const canSubmit = useMemo(() => {
    const requiredFieldsFilled =
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      emailPattern.test(email.trim()) &&
      password.length >= 8 &&
      confirmPassword.length >= 8;

    if (!requiredFieldsFilled) {
      return false;
    }

    if (password !== confirmPassword) {
      return false;
    }

    return true;
  }, [confirmPassword, email, firstName, lastName, password]);

  if (accessToken && user) {
    return <Redirect href="/" />;
  }

  const handleRegister = async () => {
    if (!canSubmit || submitting) {
      return;
    }

    if (!emailPattern.test(email.trim())) {
      Alert.alert('Invalid email', 'Please enter a valid email format.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Please confirm password again.');
      return;
    }

    try {
      setSubmitting(true);
      await registerWithPassword({
        email,
        password,
        firstName,
        lastName,
        role: 'CITIZEN',
      });
      router.replace('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cannot register right now.';
      Alert.alert('Register failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.heroSection}>
          <View style={styles.logoWrap}>
            <Leaf size={30} color="#BFF7E0" />
          </View>
          <Text style={styles.brand}>EcoCollect</Text>
          <Text style={styles.tagline}>Create your account</Text>
        </View>

        <ScrollView
          style={styles.cardContainer}
          contentContainerStyle={styles.cardContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Register</Text>
            <Text style={styles.cardSubtitle}>Join and start using EcoCollect</Text>

            <View style={styles.row}>
              <View style={styles.halfInputWrap}>
                <Text style={styles.label}>Last name</Text>
                <View style={styles.inputWrap}>
                  <User size={18} color={Colors.neutral[400]} />
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Nguyen"
                    placeholderTextColor={Colors.neutral[400]}
                    style={styles.input}
                  />
                </View>
              </View>
              <View style={styles.halfInputWrap}>
                <Text style={styles.label}>First name</Text>
                <View style={styles.inputWrap}>
                  <User size={18} color={Colors.neutral[400]} />
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Van A"
                    placeholderTextColor={Colors.neutral[400]}
                    style={styles.input}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrap}>
                <Mail size={18} color={Colors.neutral[400]} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.neutral[400]}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <Lock size={18} color={Colors.neutral[400]} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={!showPassword}
                  placeholder="At least 8 characters"
                  placeholderTextColor={Colors.neutral[400]}
                  style={styles.input}
                />
                <Pressable
                  hitSlop={8}
                  onPress={() => setShowPassword((prev) => !prev)}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={Colors.neutral[400]} />
                  ) : (
                    <Eye size={18} color={Colors.neutral[400]} />
                  )}
                </Pressable>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm password</Text>
              <View style={styles.inputWrap}>
                <Lock size={18} color={Colors.neutral[400]} />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={!showConfirmPassword}
                  placeholder="Re-enter your password"
                  placeholderTextColor={Colors.neutral[400]}
                  style={styles.input}
                />
                <Pressable
                  hitSlop={8}
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  style={styles.eyeButton}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} color={Colors.neutral[400]} />
                  ) : (
                    <Eye size={18} color={Colors.neutral[400]} />
                  )}
                </Pressable>
              </View>
            </View>

            <Pressable
              style={[styles.primaryButton, (!canSubmit || submitting) && styles.disabledButton]}
              disabled={!canSubmit || submitting}
              onPress={() => void handleRegister()}
            >
              {submitting ? (
                <ActivityIndicator color={Colors.neutral.white} />
              ) : (
                <Text style={styles.primaryButtonText}>Create account</Text>
              )}
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <Text style={styles.bottomText}>
              Already have an account?{' '}
              <Link href="/(auth)/login" style={styles.linkText}>
                Login now
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary[50],
  },
  keyboard: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: Colors.primary[500],
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  logoWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    marginTop: 12,
    fontSize: 40,
    fontWeight: '700',
    color: Colors.neutral.white,
    letterSpacing: 0.3,
  },
  tagline: {
    marginTop: 4,
    fontSize: 14,
    color: '#E8F5E9',
  },
  cardContainer: {
    flex: 1,
    marginTop: -14,
    paddingHorizontal: 16,
  },
  cardContent: {
    paddingBottom: 18,
  },
  card: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#DDEFE6',
    shadowColor: '#053A2D',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  cardSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.neutral[500],
  },
  form: {
    gap: 10,
    marginTop: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInputWrap: {
    flex: 1,
    gap: 6,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.neutral[700],
  },
  inputWrap: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E6EAF1',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFD',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: Colors.neutral[800],
  },
  eyeButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    marginTop: 6,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[500],
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.neutral.white,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral[200],
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: Colors.neutral[400],
  },
  bottomText: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.neutral[600],
  },
  linkText: {
    color: Colors.primary[500],
    fontWeight: '700',
  },
});
