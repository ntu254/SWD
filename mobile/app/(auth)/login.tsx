import { loginWithPassword } from '@/components/api/backend';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';
import { Link, Redirect, useRouter } from 'expo-router';
import { Eye, EyeOff, Leaf, Lock, Mail } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const accessToken = useAppStore((state) => state.accessToken);
  const user = useAppStore((state) => state.user);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isValid = useMemo(() => {
    return email.trim().length > 0 && password.trim().length > 0;
  }, [email, password]);

  if (accessToken && user) {
    return <Redirect href="/" />;
  }

  const handleLogin = async () => {
    if (!isValid || submitting) {
      return;
    }

    try {
      setSubmitting(true);
      await loginWithPassword({
        email,
        password,
      });
      router.replace('/');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Không thể đăng nhập, vui lòng thử lại';
      Alert.alert('Đăng nhập thất bại', message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Thông báo', 'Tính năng quên mật khẩu sẽ được cập nhật sau.');
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
          <Text style={styles.tagline}>Cùng nhau vì môi trường xanh sạch</Text>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Đăng nhập</Text>
            <Text style={styles.cardSubtitle}>Chào mừng bạn quay trở lại!</Text>

            <View style={styles.form}>
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
                    placeholder="example@email.com"
                    placeholderTextColor={Colors.neutral[400]}
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mật khẩu</Text>
                <View style={styles.inputWrap}>
                  <Lock size={18} color={Colors.neutral[400]} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={!showPassword}
                    placeholder="Nhập mật khẩu"
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

              <Pressable style={styles.forgotWrap} onPress={handleForgotPassword}>
                <Text style={styles.forgotText}>Quên mật khẩu?</Text>
              </Pressable>

              <Pressable
                style={[styles.primaryButton, (!isValid || submitting) && styles.disabledButton]}
                disabled={!isValid || submitting}
                onPress={() => void handleLogin()}
              >
                {submitting ? (
                  <ActivityIndicator color={Colors.neutral.white} />
                ) : (
                  <Text style={styles.primaryButtonText}>Đăng nhập</Text>
                )}
              </Pressable>
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.divider} />
            </View>

            <Text style={styles.bottomText}>
              Chưa có tài khoản?{' '}
              <Link href="/(auth)/register" style={styles.linkText}>
                Đăng ký ngay
              </Link>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9F6F0',
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
    color: '#C9F2E4',
  },
  cardContainer: {
    flex: 1,
    marginTop: -14,
    paddingHorizontal: 16,
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
    marginTop: 16,
    gap: 10,
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
  forgotWrap: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary[500],
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
