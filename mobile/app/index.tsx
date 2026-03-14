import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect, useRootNavigationState } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';
import { syncRoleSession } from '@/components/api/backend';

export default function Index() {
  const rootNavigationState = useRootNavigationState();
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const { currentRole } = useAppStore();

  useEffect(() => {
    if (!rootNavigationState?.key) return;

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
