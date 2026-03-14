import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect, useRootNavigationState } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';
import { syncRoleSession } from '@/components/api/backend';

const BOOTSTRAP_TIMEOUT_MS = 15000;

export default function Index() {
  const rootNavigationState = useRootNavigationState();
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const currentRole = useAppStore((state) => state.currentRole);

  useEffect(() => {
    if (!rootNavigationState?.key) return;

    let cancelled = false;

    const bootstrap = async () => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      try {
        const roleToSync = currentRole || 'CITIZEN';
        await Promise.race([
          syncRoleSession(roleToSync),
          new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => {
              reject(new Error(`Bootstrap timeout after ${BOOTSTRAP_TIMEOUT_MS}ms`));
            }, BOOTSTRAP_TIMEOUT_MS);
          }),
        ]);
      } catch (error) {
        console.warn('Role session bootstrap failed:', error);
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [rootNavigationState?.key, currentRole]);

  if (!rootNavigationState?.key || isBootstrapping) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary[600]} />
      </View>
    );
  }

  const activeRole = useAppStore.getState().currentRole;
  switch (activeRole) {
    case 'CITIZEN':
      return <Redirect href="/(citizen)/home" />;
    case 'COLLECTOR':
      return <Redirect href="/(collector)/tasks" />;
    case 'ENTERPRISE':
      return <Redirect href="/(enterprise)/dashboard" />;
    case 'ADMIN':
      return <Redirect href="/(admin)/analytics" />;
    default:
      return <Redirect href="/(citizen)/home" />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
  },
});
