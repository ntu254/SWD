import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowLeft, BellRing } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';

import { fetchUserNotifications } from '@/components/api/backend';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { useAppStore } from '@/store/useAppStore';
import type { Notification } from '@/types';

const priorityColors: Record<Notification['priority'], string> = {
  Low: Colors.neutral[400],
  Normal: Colors.primary[600],
  High: Colors.accent[600],
  Urgent: Colors.status.error,
};

function formatDateTime(value?: string) {
  if (!value) {
    return 'Vừa xong';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Vừa xong';
  }

  return parsed.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CitizenNotificationsScreen() {
  const router = useRouter();
  const accessToken = useAppStore((state) => state.accessToken);
  const user = useAppStore((state) => state.user);

  const notificationsQuery = useQuery({
    queryKey: ['notifications', 'citizen', user?.userId],
    queryFn: () => fetchUserNotifications(accessToken ?? '', { size: 100 }),
    enabled: !!accessToken,
  });

  const notifications = useMemo(
    () => (notificationsQuery.data ?? []).filter((item) => item.isActive),
    [notificationsQuery.data]
  );

  useFocusEffect(
    React.useCallback(() => {
      if (!accessToken) {
        return undefined;
      }

      void notificationsQuery.refetch();
      return undefined;
    }, [accessToken, notificationsQuery])
  );

  const safeBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(citizen)/home');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={safeBack} activeOpacity={0.82}>
          <ArrowLeft size={20} color={Colors.neutral[700]} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Thông báo</Text>
          <Text style={styles.subtitle}>{notifications.length} mục đang hiển thị</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {notificationsQuery.isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={Colors.primary[600]} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={notificationsQuery.isRefetching}
              onRefresh={() => {
                void notificationsQuery.refetch();
              }}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconWrap}>
                  <BellRing size={16} color={priorityColors[item.priority] ?? Colors.primary[600]} />
                </View>
                <View style={styles.cardCopy}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardMeta}>
                    {item.type} · {formatDateTime(item.createdAt)}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardContent}>{item.content}</Text>

              <View style={styles.cardFooter}>
                <Text style={styles.footerChip}>Ưu tiên: {item.priority}</Text>
                <Text style={styles.footerChip}>Đối tượng: {item.targetAudience}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Chưa có thông báo nào</Text>
              <Text style={styles.emptySub}>
                Khi có cập nhật mới, nội dung sẽ hiển thị tại đây.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral.white,
    ...Shadows.card,
  },
  headerCopy: {
    flex: 1,
    marginLeft: 12,
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.neutral[500],
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCopy: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  cardMeta: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.neutral[500],
  },
  cardContent: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.neutral[700],
  },
  cardFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  footerChip: {
    fontSize: 12,
    color: Colors.neutral[600],
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.neutral[700],
  },
  emptySub: {
    marginTop: 6,
    fontSize: 14,
    color: Colors.neutral[500],
    textAlign: 'center',
    maxWidth: 260,
  },
});
