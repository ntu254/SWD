import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../shared/store/authStore';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: 2, staleTime: 1000 * 60 * 5 },
    },
});

LogBox.ignoreLogs([
    'SafeAreaView has been deprecated and will be removed in a future release.',
]);

function AuthGuard() {
    const { isAuthenticated, user, isHydrated } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (!isHydrated) {
            return;
        }

        const inAuthGroup = segments[0] === '(auth)';
        const inCitizenGroup = segments[0] === '(citizen)';
        const inCollectorGroup = segments[0] === '(collector)';

        if (!isAuthenticated && !inAuthGroup) {
            router.replace('/(auth)/login');
            return;
        }

        if (!isAuthenticated) {
            return;
        }

        const isCollector = user?.role === 'COLLECTOR';
        if (inAuthGroup) {
            router.replace(isCollector ? '/(collector)/(tabs)/tasks' : '/(citizen)/(tabs)/home');
            return;
        }

        if (isCollector && inCitizenGroup) {
            router.replace('/(collector)/(tabs)/tasks');
            return;
        }

        if (!isCollector && inCollectorGroup) {
            router.replace('/(citizen)/(tabs)/home');
        }
    }, [isAuthenticated, isHydrated, segments, user, router]);

    return null;
}

export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <SafeAreaProvider>
                    <AuthGuard />
                    <Stack screenOptions={{ headerShown: false }} />
                </SafeAreaProvider>
            </GestureHandlerRootView>
        </QueryClientProvider>
    );
}
