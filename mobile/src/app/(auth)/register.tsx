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
import { Leaf, Mail, Lock, User, Eye, EyeOff, ChevronLeft } from 'lucide-react-native';
import { Button } from '../../shared/ui/Button';
import { FormInput } from '../../shared/ui/FormInput';
import { GlassCard } from '../../shared/ui/GlassCard';
import { authService } from '../../features/auth/authService';
import { useAuthStore } from '../../shared/store/authStore';

export default function RegisterScreen() {
    const router = useRouter();
    const { setSession } = useAuthStore();
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'CITIZEN' as 'CITIZEN' | 'COLLECTOR',
    });
    const [showPw, setShowPw] = useState(false);
    const [errors, setErrors] = useState<Partial<typeof form>>({});

    const set = (field: keyof typeof form) => (value: string) =>
        setForm((f) => ({ ...f, [field]: value }));

    const validate = () => {
        const e: Partial<typeof form> = {};
        if (!form.firstName.trim()) e.firstName = 'Bắt buộc';
        if (!form.lastName.trim()) e.lastName = 'Bắt buộc';
        if (!form.email.trim()) e.email = 'Vui lòng nhập email';
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email không hợp lệ';
        if (!form.password) e.password = 'Bắt buộc';
        else if (form.password.length < 6) e.password = 'Tối thiểu 6 ký tự';
        if (form.confirmPassword !== form.password) e.confirmPassword = 'Mật khẩu không khớp';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const registerMutation = useMutation({
        mutationFn: authService.register,
        onSuccess: ({ user, accessToken, refreshToken }) => {
            setSession({ user, accessToken, refreshToken });
        },
        onError: (err: any) => {
            Alert.alert(
                'Đăng ký thất bại',
                err?.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.',
            );
        },
    });

    const handleRegister = () => {
        if (!validate()) return;
        registerMutation.mutate({
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim().toLowerCase(),
            password: form.password,
            role: form.role,
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#047857" />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft color="#ffffff" size={26} />
                </TouchableOpacity>
                <View style={styles.logoCircle}>
                    <Leaf color="#ffffff" size={28} strokeWidth={2} />
                </View>
                <Text style={styles.appName}>Tạo tài khoản mới</Text>
                <Text style={styles.tagline}>Tham gia cộng đồng thu gom xanh</Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <GlassCard elevated style={styles.card}>
                        <View style={styles.nameRow}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <FormInput
                                    label="Họ"
                                    placeholder="Nguyễn"
                                    value={form.firstName}
                                    onChangeText={set('firstName')}
                                    error={errors.firstName}
                                    leftIcon={<User size={16} color="#94a3b8" />}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <FormInput
                                    label="Tên"
                                    placeholder="Văn A"
                                    value={form.lastName}
                                    onChangeText={set('lastName')}
                                    error={errors.lastName}
                                />
                            </View>
                        </View>

                        <View style={styles.roleSwitchWrap}>
                            <Text style={styles.roleLabel}>Loại tài khoản</Text>
                            <View style={styles.roleSwitch}>
                                {[
                                    { value: 'CITIZEN', label: 'Citizen' },
                                    { value: 'COLLECTOR', label: 'Collector' },
                                ].map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.roleOption,
                                            form.role === option.value && styles.roleOptionActive,
                                        ]}
                                        onPress={() => set('role')(option.value as 'CITIZEN' | 'COLLECTOR')}
                                        activeOpacity={0.85}
                                    >
                                        <Text
                                            style={[
                                                styles.roleOptionText,
                                                form.role === option.value && styles.roleOptionTextActive,
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <FormInput
                            label="Email"
                            placeholder="example@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={form.email}
                            onChangeText={set('email')}
                            error={errors.email}
                            leftIcon={<Mail size={18} color="#94a3b8" />}
                        />

                        <FormInput
                            label="Mật khẩu"
                            placeholder="Tối thiểu 6 ký tự"
                            secureTextEntry={!showPw}
                            value={form.password}
                            onChangeText={set('password')}
                            error={errors.password}
                            leftIcon={<Lock size={18} color="#94a3b8" />}
                            rightIcon={showPw ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                            onRightIconPress={() => setShowPw(!showPw)}
                        />

                        <FormInput
                            label="Xác nhận mật khẩu"
                            placeholder="Nhập lại mật khẩu"
                            secureTextEntry={!showPw}
                            value={form.confirmPassword}
                            onChangeText={set('confirmPassword')}
                            error={errors.confirmPassword}
                            leftIcon={<Lock size={18} color="#94a3b8" />}
                        />

                        <Button
                            title="Đăng ký"
                            size="lg"
                            loading={registerMutation.isPending}
                            onPress={handleRegister}
                            style={{ marginTop: 8 }}
                        />

                        <View style={styles.loginRow}>
                            <Text style={styles.loginText}>Đã có tài khoản? </Text>
                            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                                <Text style={styles.loginLink}>Đăng nhập</Text>
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
        paddingBottom: 36,
        alignItems: 'center',
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
    },
    backBtn: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 56 : 44,
        left: 20,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    appName: { fontSize: 22, fontWeight: '800', color: '#ffffff' },
    tagline: { fontSize: 13, color: 'rgba(255,255,255,0.78)', marginTop: 4 },
    scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
    card: { padding: 24 },
    nameRow: { flexDirection: 'row' },
    roleSwitchWrap: { marginBottom: 16 },
    roleLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
    roleSwitch: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        borderRadius: 14,
        padding: 4,
    },
    roleOption: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    roleOptionActive: {
        backgroundColor: '#ffffff',
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
    },
    roleOptionText: { fontSize: 14, color: '#64748b', fontWeight: '600' },
    roleOptionTextActive: { color: '#059669' },
    loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    loginText: { color: '#64748b', fontSize: 14 },
    loginLink: { color: '#059669', fontSize: 14, fontWeight: '700' },
});
