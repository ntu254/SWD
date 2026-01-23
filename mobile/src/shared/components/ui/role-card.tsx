import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { User, Building2, Car, Check, LucideIcon } from 'lucide-react-native';
import { cn } from '@/shared/utils';

interface RoleCardProps {
    label: string;
    iconName: 'person' | 'business' | 'car';
    selected: boolean;
    onPress: () => void;
}

export function RoleCard({ label, iconName, selected, onPress }: RoleCardProps) {

    const getIcon = () => {
        if (iconName === 'person') return User;
        if (iconName === 'business') return Building2;
        return Car;
    }

    const Icon = getIcon();

    return (
        <TouchableOpacity
            className={cn(
                "flex-1 aspect-[0.85] border-[1.5px] border-gray-200 rounded-2xl p-3 items-center justify-center bg-white mx-1.5",
                selected && "border-emerald-500 bg-emerald-50"
            )}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {selected && (
                <View className="absolute top-2 right-2">
                    <Check size={20} color="#10B981" strokeWidth={3} />
                </View>
            )}
            <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mb-2">
                <Icon
                    size={28}
                    color={selected ? '#10B981' : '#6B7280'}
                    strokeWidth={1.5}
                />
            </View>
            <Text className={cn("text-xs font-semibold text-gray-500 text-center", selected && "text-emerald-500")}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}
