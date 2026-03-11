import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Alert,
    StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { Leaf, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { Button } from '../../shared/ui/Button';
import { FormInput } from '../../shared/ui/FormInput';
import { GlassCard } from '../../shared/ui/GlassCard';
import { authService } from '../../features/auth/authService';
import { useAuthStore } from '../../shared/store/authStore';

export default function LoginScreen() {
    const router = useRouter();
    const { setSession } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const validate = () => {
        const e: typeof errors = {};
        if (!email.trim()) e.email = 'Vui lòng nhập email';
        else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email không hợp lệ';
        if (!password) e.password = 'Vui lòng nhập mật khẩu';
        else if (password.length < 6) e.password = 'Mật khẩu tối thiểu 6 ký tự';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const loginMutation = useMutation({
        mutationFn: authService.login,
        onSuccess: ({ user, accessToken, refreshToken }) => {
            setSession({ user, accessToken, refreshToken });
        },
        onError: (err: any) => {
            Alert.alert(
                'Đăng nhập thất bại',
                err?.response?.data?.message || 'Sai email hoặc mật khẩu. Vui lòng thử lại.',
            );
        },
    });

    const handleLogin = () => {
        if (!validate()) return;
        loginMutation.mutate({ email: email.trim().toLowerCase(), password });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#047857" />

            {/* Hero header */}
            <View style={styles.header}>
                <View style={styles.logoCircle}>
                    <Leaf color="#ffffff" size={32} strokeWidth={2} />
                </View>
                <Text style={styles.appName}>EcoCollect</Text>
                <Text style={styles.tagline}>Cùng nhau vì môi trường xanh sạch</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <GlassCard elevated style={styles.card}>
                        <Text style={styles.title}>Đăng nhập</Text>
                        <Text style={styles.subtitle}>Chào mừng bạn quay trở lại!</Text>

                        <FormInput
                            label="Email"
                            placeholder="example@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={email}
                            onChangeText={setEmail}
                            error={errors.email}
                            leftIcon={<Mail size={18} color="#94a3b8" />}
                        />

                        <FormInput
                            label="Mật khẩu"
                            placeholder="Nhập mật khẩu"
                            secureTextEntry={!showPw}
                            value={password}
                            onChangeText={setPassword}
                            error={errors.password}
                            leftIcon={<Lock size={18} color="#94a3b8" />}
                            rightIcon={showPw ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                            onRightIconPress={() => setShowPw(!showPw)}
                        />

                        <TouchableOpacity style={styles.forgotRow}>
                            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                        </TouchableOpacity>

                        <Button
                            title="Đăng nhập"
                            size="lg"
                            loading={loginMutation.isPending}
                            onPress={handleLogin}
                            style={styles.loginBtn}
                        />

                        <View style={styles.dividerRow}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>hoặc</Text>
                            <View style={styles.divider} />
                        </View>

                        <View style={styles.registerRow}>
                            <Text style={styles.registerText}>Chưa có tài khoản? </Text>
                            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                                <Text style={styles.registerLink}>Đăng ký ngay</Text>
                            </TouchableOpacity>
                        </View>
                    </GlassCard>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0fdf4' },
    header: {
        backgroundColor: '#047857',
        paddingTop: Platform.OS === 'ios' ? 60 : 48,
        paddingBottom: 40,
        alignItems: 'center',
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
    },
    logoCircle: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    appName: { fontSize: 28, fontWeight: '800', color: '#ffffff', letterSpacing: 0.5 },
    tagline: { fontSize: 14, color: 'rgba(255,255,255,0.80)', marginTop: 4 },
    scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 28, paddingBottom: 40 },
    card: { padding: 24 },
    title: { fontSize: 24, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
    subtitle: { fontSize: 14, color: '#64748b', marginBottom: 24 },
    forgotRow: { alignSelf: 'flex-end', marginTop: -8, marginBottom: 20 },
    forgotText: { fontSize: 13, color: '#059669', fontWeight: '500' },
    loginBtn: { marginTop: 4 },
    dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
    divider: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
    dividerText: { marginHorizontal: 12, color: '#94a3b8', fontSize: 13 },
    registerRow: { flexDirection: 'row', justifyContent: 'center' },
    registerText: { color: '#64748b', fontSize: 14 },
    registerLink: { color: '#059669', fontSize: 14, fontWeight: '700' },
});
