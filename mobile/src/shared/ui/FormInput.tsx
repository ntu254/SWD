import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    TextInputProps,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

interface FormInputProps extends TextInputProps {
    label: string;
    error?: string;
    hint?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onRightIconPress?: () => void;
}

export const FormInput: React.FC<FormInputProps> = ({
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    onRightIconPress,
    style,
    ...props
}) => {
    const [focused, setFocused] = useState(false);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View
                style={[
                    styles.inputWrapper,
                    focused && styles.focused,
                    error ? styles.error : null,
                ]}
            >
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
                <TextInput
                    {...props}
                    style={[styles.input, leftIcon ? { paddingLeft: 0 } : undefined, style]}
                    placeholderTextColor="#94a3b8"
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
                {rightIcon && (
                    <TouchableOpacity
                        onPress={onRightIconPress}
                        style={styles.rightIcon}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        {rightIcon}
                    </TouchableOpacity>
                )}
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {hint && !error ? <Text style={styles.hintText}>{hint}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: 16 },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 52,
        backgroundColor: '#f8fafc',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        paddingHorizontal: 16,
        overflow: 'hidden',
    },
    focused: {
        borderColor: '#059669',
        backgroundColor: '#fff',
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 2,
    },
    error: {
        borderColor: '#ef4444',
        backgroundColor: '#fff5f5',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1e293b',
        height: '100%',
    },
    leftIcon: { marginRight: 10 },
    rightIcon: { marginLeft: 10 },
    errorText: { fontSize: 12, color: '#ef4444', marginTop: 4 },
    hintText: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
});
