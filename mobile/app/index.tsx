import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';
import { syncRoleSession } from '@/components/api/backend';

export default function Index() {
  const router = useRouter();
  const segments = useSegments();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const { currentRole } = useAppStore();

  useEffect(() => {
    // Wait for navigation to be ready
    if (segments && !isNavigationReady) {
      setIsNavigationReady(true);
    }
  }, [segments, isNavigationReady]);

  useEffect(() => {
    if (!isNavigationReady) return;

    let cancelled = false;

    const bootstrap = async () => {
      try {
        const roleToSync = currentRole || 'CITIZEN';
        await syncRoleSession(roleToSync);
      } catch (error) {
        console.warn('Role session bootstrap failed:', error);
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [isNavigationReady, currentRole]);

  useEffect(() => {
    if (!isNavigationReady || isBootstrapping) return;

    const activeRole = useAppStore.getState().currentRole;
    switch (activeRole) {
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
  }, [isNavigationReady, isBootstrapping, router]);

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
