import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { SocialButton } from '@/shared/components/ui/social-button';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';

export function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        // TODO: Implement actual login logic
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            console.log('Login with:', email, password);
            // Navigate to main app
        }, 1500);
    };

    return (
        <View className="flex-1 p-6 bg-white justify-center">
            <View className="items-center mb-8">
                <View className="w-20 h-20 bg-blue-50 rounded-2xl items-center justify-center mb-4">
                    {/* Placeholder for Logo */}
                    <Text className="text-4xl">♻️</Text>
                </View>
                <Text className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</Text>
                <Text className="text-sm text-gray-500 text-center">Sign in to continue your eco-journey with GreenLoop.</Text>
            </View>

            <View className="mb-6">
                <Input
                    label="Email Address"
                    placeholder="name@example.com"
                    leftIcon={Mail}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <Input
                    label="Password"
                    placeholder="••••••••"
                    leftIcon={Lock}
                    isPassword
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity className="self-end mb-6 -mt-2">
                    <Text className="text-emerald-500 font-semibold text-sm">Forgot Password?</Text>
                </TouchableOpacity>

                <Button
                    title="Log In"
                    onPress={handleLogin}
                    loading={loading}
                    icon={<ArrowRight size={20} color="#fff" />}
                />
            </View>

            <View className="flex-row items-center mb-6">
                <View className="flex-1 h-[1px] bg-gray-200" />
                <Text className="mx-4 text-gray-400 text-sm">Or continue with</Text>
                <View className="flex-1 h-[1px] bg-gray-200" />
            </View>

            <View className="flex-row mb-8">
                <SocialButton provider="google" onPress={() => console.log('Google Login')} />
                <SocialButton provider="apple" onPress={() => console.log('Apple Login')} />
            </View>

            <View className="flex-row justify-center">
                <Text className="text-gray-500 text-sm">Don't have an account? </Text>
                <Link href={"/(auth)/sign-up" as any} asChild>
                    <TouchableOpacity>
                        <Text className="text-emerald-500 font-semibold text-sm">Sign up now</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
    );
}
