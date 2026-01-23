import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { cn } from '@/shared/utils';

interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'outline' | 'ghost';
    loading?: boolean;
    className?: string; // Allow custom tailwind classes
    style?: ViewStyle;
    textClassName?: string;
    icon?: React.ReactNode;
}

export function Button({
    onPress,
    title,
    variant = 'primary',
    loading = false,
    className,
    style,
    textClassName,
    icon
}: ButtonProps) {

    const baseStyles = "h-[50px] rounded-xl flex-row items-center justify-center px-4 w-full active:opacity-80";
    const variants = {
        primary: "bg-emerald-500",
        outline: "bg-transparent border border-gray-200",
        ghost: "bg-transparent"
    };

    const textBaseStyles = "text-base font-semibold";
    const textVariants = {
        primary: "text-white",
        outline: "text-gray-700",
        ghost: "text-emerald-500"
    };

    return (
        <TouchableOpacity
            className={cn(baseStyles, variants[variant], className)}
            style={style}
            onPress={onPress}
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#10B981'} />
            ) : (
                <>
                    {icon}
                    <Text className={cn(textBaseStyles, textVariants[variant], icon && "ml-2", textClassName)}>
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
}
