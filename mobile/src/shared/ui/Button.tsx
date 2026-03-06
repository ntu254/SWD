import React from 'react';
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    TouchableOpacityProps,
    StyleSheet,
    View,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
}

const VARIANTS = {
    primary: { bg: '#059669', text: '#ffffff', border: 'transparent' },
    secondary: { bg: '#d1fae5', text: '#065f46', border: 'transparent' },
    outline: { bg: 'transparent', text: '#059669', border: '#059669' },
    ghost: { bg: 'transparent', text: '#059669', border: 'transparent' },
};

const SIZES = {
    sm: { height: 40, fontSize: 14, px: 16, radius: 12 },
    md: { height: 52, fontSize: 16, px: 20, radius: 16 },
    lg: { height: 60, fontSize: 18, px: 24, radius: 20 },
};

export const Button: React.FC<ButtonProps> = ({
    title,
    loading = false,
    variant = 'primary',
    size = 'md',
    icon,
    disabled,
    style,
    ...props
}) => {
    const colors = VARIANTS[variant];
    const dimensions = SIZES[size];

    return (
        <TouchableOpacity
            {...props}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[
                styles.base,
                {
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                    borderWidth: colors.border !== 'transparent' ? 1.5 : 0,
                    height: dimensions.height,
                    borderRadius: dimensions.radius,
                    paddingHorizontal: dimensions.px,
                    opacity: disabled ? 0.5 : 1,
                },
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={colors.text} size="small" />
            ) : (
                <View style={styles.row}>
                    {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
                    <Text style={[styles.label, { color: colors.text, fontSize: dimensions.fontSize }]}>
                        {title}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        fontWeight: '600',
        letterSpacing: 0.3,
    },
});
