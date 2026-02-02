import React from 'react';
import { Pressable, Text, ActivityIndicator, PressableProps, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';

interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    loading?: boolean;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
}

export function Button({
    variant = 'primary',
    size = 'md',
    children,
    loading = false,
    disabled = false,
    style,
    ...props
}: ButtonProps) {
    const getButtonStyle = (): ViewStyle[] => {
        const baseStyle: ViewStyle[] = [styles.button];

        if (variant === 'primary') baseStyle.push(styles.primaryButton);
        if (variant === 'secondary') baseStyle.push(styles.secondaryButton);
        if (variant === 'ghost') baseStyle.push(styles.ghostButton);

        if (size === 'sm') baseStyle.push(styles.smallButton);
        if (size === 'md') baseStyle.push(styles.mediumButton);
        if (size === 'lg') baseStyle.push(styles.largeButton);

        if (disabled || loading) baseStyle.push(styles.disabled);

        return baseStyle;
    };

    const getTextStyle = (): TextStyle[] => {
        const baseStyle: TextStyle[] = [styles.text];

        if (variant === 'primary') baseStyle.push(styles.primaryText);
        if (variant === 'secondary') baseStyle.push(styles.secondaryText);
        if (variant === 'ghost') baseStyle.push(styles.ghostText);

        if (size === 'sm') baseStyle.push(styles.smallText);
        if (size === 'md') baseStyle.push(styles.mediumText);
        if (size === 'lg') baseStyle.push(styles.largeText);

        return baseStyle;
    };

    const isDisabled = disabled || loading;

    return (
        <Pressable
            style={[getButtonStyle(), style]}
            disabled={isDisabled}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? 'white' : '#059669'} />
            ) : (
                <Text style={getTextStyle()}>
                    {children}
                </Text>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        backgroundColor: '#059669',
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    secondaryButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    ghostButton: {
        backgroundColor: 'transparent',
    },
    smallButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    mediumButton: {
        paddingVertical: 14,
        paddingHorizontal: 24,
    },
    largeButton: {
        paddingVertical: 16,
        paddingHorizontal: 32,
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        fontWeight: 'bold',
    },
    primaryText: {
        color: 'white',
    },
    secondaryText: {
        color: '#374151',
    },
    ghostText: {
        color: '#059669',
    },
    smallText: {
        fontSize: 14,
    },
    mediumText: {
        fontSize: 18,
    },
    largeText: {
        fontSize: 20,
    },
});
