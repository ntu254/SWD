import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../../shared/store/authStore';
import { LoginScreen } from '../../features/auth/ui/LoginScreen';
import { RegisterScreen } from '../../features/auth/ui/RegisterScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeScreen = () => (
    <View style={styles.screenContainer}>
        <Text style={styles.screenText}>Home Screen</Text>
    </View>
);

const MapScreen = () => (
    <View style={styles.screenContainer}>
        <Text style={styles.screenText}>Map Screen</Text>
    </View>
);

const ProfileScreen = () => (
    <View style={styles.screenContainer}>
        <Text style={styles.screenText}>Profile Screen</Text>
    </View>
);

function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
}

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#059669',
                tabBarInactiveTintColor: '#6b7280',
            }}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Map" component={MapScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

export function RootNavigator() {
    const { isAuthenticated, isLoading, loadAuth } = useAuthStore();

    useEffect(() => {
        loadAuth();
    }, []);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#059669" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? <MainTabs /> : <AuthStack />}
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#059669',
    },
    screenContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
    },
    screenText: {
        fontSize: 18,
        color: '#1f2937',
    },
});
