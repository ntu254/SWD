import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect, useRootNavigationState } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';

export default function Index() {
  const rootNavigationState = useRootNavigationState();
  const [isReady, setIsReady] = useState(false);
  const accessToken = useAppStore((state) => state.accessToken);
  const user = useAppStore((state) => state.user);

  useEffect(() => {
    if (rootNavigationState?.key) {
      setIsReady(true);
    }
  }, [rootNavigationState?.key]);

  if (!isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary[600]} />
      </View>
    );
  }

  if (!accessToken || !user) {
    return <Redirect href="/(auth)/login" />;
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
