import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';

interface CardProps extends ViewProps {
    variant?: 'solid' | 'glass';
    children: React.ReactNode;
}

export function Card({
    variant = 'solid',
    children,
    style,
    ...props
}: CardProps) {
    const cardStyle = variant === 'solid' ? styles.solid : styles.glass;

    return (
        <View
            style={[styles.base, cardStyle, style]}
            {...props}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: 16,
        padding: 24,
    },
    solid: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    glass: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
});
