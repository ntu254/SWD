import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { RoleCard } from '@/shared/components/ui/role-card';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';

type Role = 'RESIDENT' | 'BUSINESS' | 'COLLECTOR';

export function RegisterForm() {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<Role>('RESIDENT');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            console.log('Register:', { selectedRole, firstName, lastName, email, password });
            // Navigate to login or home
        }, 1500);
    };

    return (
        <ScrollView contentContainerClassName="p-6 pt-16" showsVerticalScrollIndicator={false}>
            <View className="items-center mb-8">
                <Text className="text-2xl font-bold text-gray-800 mb-2">Tạo tài khoản mới</Text>
                <Text className="text-sm text-gray-500 text-center">Đăng ký để bắt đầu hành trình xanh của bạn</Text>
            </View>

            <Text className="text-xs font-bold text-gray-700 mb-3 uppercase">CHỌN VAI TRÒ CỦA BẠN</Text>
            <View className="flex-row justify-between mb-6 h-[120px]">
                <RoleCard
                    label="Cư Dân"
                    iconName="person"
                    selected={selectedRole === 'RESIDENT'}
                    onPress={() => setSelectedRole('RESIDENT')}
                />
                <RoleCard
                    label="Doanh Nghiệp"
                    iconName="business"
                    selected={selectedRole === 'BUSINESS'}
                    onPress={() => setSelectedRole('BUSINESS')}
                />
                <RoleCard
                    label="Collector"
                    iconName="car"
                    selected={selectedRole === 'COLLECTOR'}
                    onPress={() => setSelectedRole('COLLECTOR')}
                />
            </View>

            <View className="mb-6">
                <View className="flex-row mb-4">
                    <View className="flex-1 mr-2">
                        <Input
                            label="Họ"
                            placeholder="Nguyễn"
                            value={lastName}
                            onChangeText={setLastName}
                        />
                    </View>
                    <View className="flex-1 ml-2">
                        <Input
                            label="Tên"
                            placeholder="Văn A"
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                    </View>
                </View>

                <Input
                    label="Email"
                    placeholder="Email"
                    leftIcon={Mail}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <Input
                    label="Mật khẩu"
                    placeholder="••••••••"
                    leftIcon={Lock}
                    isPassword
                    value={password}
                    onChangeText={setPassword}
                />

                <Button
                    title="Đăng Ký"
                    onPress={handleRegister}
                    loading={loading}
                    icon={<ArrowRight size={20} color="#fff" />}
                    className="mt-4"
                />
            </View>

            <View className="flex-row justify-center mb-4">
                <Text className="text-gray-500 text-sm">Đã có tài khoản? </Text>
                <Link href={"/(auth)/login" as any} asChild>
                    <TouchableOpacity>
                        <Text className="text-emerald-500 font-semibold text-sm">Đăng nhập ngay</Text>
                    </TouchableOpacity>
                </Link>
            </View>

            <Text className="text-gray-400 text-xs text-center leading-5">
                Bằng cách tiếp tục, bạn đồng ý với <Text className="text-emerald-500">Điều khoản dịch vụ</Text> và <Text className="text-emerald-500">Chính sách bảo mật</Text>
            </Text>
        </ScrollView>
    );
}
