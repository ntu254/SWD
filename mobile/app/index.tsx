import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAppStore, mockUsers } from '@/store/useAppStore';

export default function Index() {
  const router = useRouter();
  const segments = useSegments();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const { isAuthenticated, currentRole, login } = useAppStore();

  useEffect(() => {
    // Wait for navigation to be ready
    if (segments && !isNavigationReady) {
      setIsNavigationReady(true);
    }
  }, [segments, isNavigationReady]);

  useEffect(() => {
    if (!isNavigationReady) return;

    if (!isAuthenticated) {
      login(mockUsers.CITIZEN);
      return;
    }

    // Small timeout to ensure navigator is fully mounted
    const timeout = setTimeout(() => {
      switch (currentRole) {
        case 'CITIZEN':
          router.replace('/(citizen)/home');
          break;
        case 'COLLECTOR':
          router.replace('/(collector)/tasks');
          break;
        case 'ENTERPRISE':
          router.replace('/(enterprise)/dashboard');
          break;
        case 'ADMIN':
          router.replace('/(admin)/analytics');
          break;
        default:
          router.replace('/(citizen)/home');
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [isNavigationReady, isAuthenticated, currentRole, login, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary[600]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
  },
});
