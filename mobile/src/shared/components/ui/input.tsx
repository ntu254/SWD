import React, { useState } from 'react';
import { View, TextInput, Text, TextInputProps, TouchableOpacity, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Mail, Lock, Eye, EyeOff, LucideIcon } from 'lucide-react-native';
import { cn } from '@/shared/utils';

interface InputProps extends Omit<TextInputProps, 'style'> {
    label?: string;
    error?: string;
    leftIcon?: LucideIcon;
    isPassword?: boolean;
    className?: string;
    style?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<TextStyle>;
}

export function Input({
    label,
    error,
    leftIcon: Icon,
    isPassword = false,
    style,
    className,
    inputStyle,
    ...props
}: InputProps) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(!isPassword);
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View className={cn("mb-4 w-full", className)} style={style}>
            {label && <Text className="text-sm font-semibold text-gray-500 mb-2 uppercase">{label}</Text>}
            <View
                className={cn(
                    "flex-row items-center border border-gray-200 rounded-xl bg-gray-50 h-[52px]",
                    isFocused && "border-emerald-500 bg-white",
                    !!error && "border-red-500"
                )}
            >
                {Icon && (
                    <View className="absolute left-3 z-10">
                        <Icon
                            size={20}
                            color="#9CA3AF"
                            strokeWidth={2}
                        />
                    </View>
                )}
                <TextInput
                    className={cn("flex-1 h-full px-4 text-base text-gray-800", Icon && "pl-10")}
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={isPassword && !isPasswordVisible}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={inputStyle}
                    {...props}
                />
                {isPassword && (
                    <TouchableOpacity
                        className="absolute right-3 p-1"
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                        {isPasswordVisible ? (
                            <EyeOff size={20} color="#9CA3AF" strokeWidth={2} />
                        ) : (
                            <Eye size={20} color="#9CA3AF" strokeWidth={2} />
                        )}
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
        </View>
    );
}
