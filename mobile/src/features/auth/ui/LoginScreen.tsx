import React from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock } from 'lucide-react-native';
import { Button } from '../../../shared/ui';
import { Input } from '../../../shared/ui';
import { loginSchema, LoginFormData } from '../model/authSchemas';
import { useLogin } from '../api/authApi';
import { colors } from '../../../shared/config/theme';

interface LoginScreenProps {
    navigation: any;
}

export function LoginScreen({ navigation }: LoginScreenProps) {
    const { mutate: login, isPending } = useLogin();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = (data: LoginFormData) => {
        login(data, {
            onError: (error: any) => {
                Alert.alert(
                    'Đăng nhập thất bại',
                    error.response?.data?.message || 'Vui lòng kiểm tra lại email và mật khẩu'
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
                    <Text style={styles.title}>Chào mừng trở lại! 👋</Text>
                    <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
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

                    <TouchableOpacity style={styles.forgotPassword}>
                        <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                    </TouchableOpacity>

                    <Button
                        variant="primary"
                        size="lg"
                        onPress={handleSubmit(onSubmit)}
                        loading={isPending}
                        style={styles.submitButton}
                    >
                        Đăng nhập
                    </Button>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Chưa có tài khoản? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.registerLink}>Đăng ký ngay</Text>
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
        marginBottom: 40,
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
    },
    form: {
        marginBottom: 32,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
        marginTop: 8,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: colors.brand[600],
        fontWeight: '600',
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
    registerLink: {
        fontSize: 14,
        color: colors.brand[600],
        fontWeight: '700',
    },
});
