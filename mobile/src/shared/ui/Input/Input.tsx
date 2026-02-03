import React, { useState } from 'react';
import { View, TextInput, Text, TextInputProps, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export function Input({
    label,
    error,
    icon,
    ...props
}: InputProps) {
    const [isFocused, setIsFocused] = useState(false);

    const getInputStyle = (): (ViewStyle | TextStyle)[] => {
        const baseStyle: (ViewStyle | TextStyle)[] = [styles.input];

        if (icon) baseStyle.push(styles.inputWithIcon);
        if (error) {
            baseStyle.push(styles.inputError);
        } else if (isFocused) {
            baseStyle.push(styles.inputFocused);
        } else {
            baseStyle.push(styles.inputDefault);
        }

        return baseStyle;
    };

    return (
        <View style={styles.container}>
            {label && (
                <Text style={styles.label}>
                    {label}
                </Text>
            )}
            <View style={styles.inputWrapper}>
                {icon && (
                    <View style={styles.iconContainer}>
                        {icon}
                    </View>
                )}
                <TextInput
                    style={getInputStyle()}
                    placeholderTextColor="#9ca3af"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
            </View>
            {error && (
                <Text style={styles.errorText}>
                    {error}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginLeft: 4,
        marginBottom: 6,
    },
    inputWrapper: {
        position: 'relative',
    },
    iconContainer: {
        position: 'absolute',
        left: 14,
        top: '50%',
        transform: [{ translateY: -9 }],
        zIndex: 10,
    },
    input: {
        width: '100%',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        fontWeight: '500',
        color: '#1f2937',
        fontSize: 16,
    },
    inputWithIcon: {
        paddingLeft: 40,
    },
    inputDefault: {
        backgroundColor: '#f9fafb',
        borderColor: '#e5e7eb',
    },
    inputFocused: {
        backgroundColor: 'white',
        borderColor: '#059669',
    },
    inputError: {
        backgroundColor: '#fef2f2',
        borderColor: '#fca5a5',
    },
    errorText: {
        fontSize: 14,
        color: '#ef4444',
        marginLeft: 4,
        marginTop: 4,
    },
});
