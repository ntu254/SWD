import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { cn } from '@/shared/utils';

interface SocialButtonProps {
    provider: 'google' | 'apple';
    onPress: () => void;
}

export function SocialButton({ provider, onPress }: SocialButtonProps) {
    const getLabel = () => {
        return provider === 'google' ? 'Google' : 'Apple';
    };

    const getBg = () => {
        // Just for variety
        if (provider === 'apple') return 'bg-black';
        return 'bg-white border border-gray-200';
    }

    const getTextColor = () => {
        if (provider === 'apple') return 'text-white';
        return 'text-gray-800';
    }

    return (
        <TouchableOpacity
            className={cn("flex-1 h-[50px] flex-row items-center justify-center rounded-xl mx-1.5", getBg())}
            onPress={onPress}
        >
            {/* Placeholder for Icon - using text for now as we removed vector-icons */}
            <Text className={cn("text-lg font-bold mr-2", getTextColor())}>
                {provider === 'google' ? 'G' : ''}
            </Text>
            <Text className={cn("text-base font-medium", getTextColor())}>{getLabel()}</Text>
        </TouchableOpacity>
    );
}
