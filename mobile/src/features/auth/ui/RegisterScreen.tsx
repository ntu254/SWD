import React from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Lock } from 'lucide-react-native';
import { Button } from '../../../shared/ui';
import { Input } from '../../../shared/ui';
import { registerSchema, RegisterFormData } from '../model/authSchemas';
import { useRegister } from '../api/authApi';
import { colors } from '../../../shared/config/theme';

interface RegisterScreenProps {
    navigation: any;
}

export function RegisterScreen({ navigation }: RegisterScreenProps) {
    const { mutate: register, isPending } = useRegister();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = (data: RegisterFormData) => {
        register(data, {
            onError: (error: any) => {
                Alert.alert(
                    'Đăng ký thất bại',
                    error.response?.data?.message || 'Vui lòng thử lại'
                );
            },
        });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Tạo tài khoản mới 🌱</Text>
                    <Text style={styles.subtitle}>
                        Tham gia GreenLoop để góp phần bảo vệ môi trường
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Họ và tên"
                                placeholder="Nguyễn Văn A"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.name?.message}
                                icon={<User size={18} color={colors.gray[400]} />}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Email"
                                placeholder="you@example.com"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.email?.message}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                icon={<Mail size={18} color={colors.gray[400]} />}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Mật khẩu"
                                placeholder="••••••••"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.password?.message}
                                secureTextEntry
                                icon={<Lock size={18} color={colors.gray[400]} />}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="confirmPassword"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Xác nhận mật khẩu"
                                placeholder="••••••••"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.confirmPassword?.message}
                                secureTextEntry
                                icon={<Lock size={18} color={colors.gray[400]} />}
                            />
                        )}
                    />

                    {/* Trust Indicator */}
                    <View style={styles.trustIndicator}>
                        <Text style={styles.trustText}>
                            🔒 Thông tin của bạn được bảo mật an toàn
                        </Text>
                    </View>

                    <Button
                        variant="primary"
                        size="lg"
                        onPress={handleSubmit(onSubmit)}
                        loading={isPending}
                        style={styles.submitButton}
                    >
                        Đăng ký
                    </Button>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Đã có tài khoản? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.loginLink}>Đăng nhập ngay</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray[50],
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: colors.gray[900],
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.gray[600],
        lineHeight: 24,
    },
    form: {
        marginBottom: 32,
    },
    trustIndicator: {
        backgroundColor: colors.brand[50],
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 24,
        marginTop: 8,
    },
    trustText: {
        fontSize: 14,
        color: colors.brand[700],
        textAlign: 'center',
    },
    submitButton: {
        width: '100%',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 'auto',
    },
    footerText: {
        fontSize: 14,
        color: colors.gray[600],
    },
    loginLink: {
        fontSize: 14,
        color: colors.brand[600],
        fontWeight: '700',
    },
});
