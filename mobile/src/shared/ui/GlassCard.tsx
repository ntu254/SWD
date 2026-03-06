import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';

interface GlassCardProps extends ViewProps {
    children: React.ReactNode;
    elevated?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    elevated = false,
    style,
    ...props
}) => {
    return (
        <View
            {...props}
            style={[
                styles.card,
                elevated && styles.elevated,
                style,
            ]}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(209, 250, 229, 0.6)',
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 3,
    },
    elevated: {
        shadowOpacity: 0.14,
        shadowRadius: 24,
        elevation: 6,
    },
});
