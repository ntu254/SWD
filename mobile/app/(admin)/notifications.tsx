import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BellRing } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { useAppStore } from '@/store/useAppStore';
import {
  createAdminNotification,
  deactivateAdminNotification,
  fetchAdminNotifications,
} from '@/components/api/backend';
import type { Notification } from '@/types';

const notificationTypes: Notification['type'][] = ['General', 'Alert', 'Maintenance', 'Update', 'Promotion'];
const targetAudiences: Notification['targetAudience'][] = ['All', 'Citizen', 'Collector', 'Enterprise'];
const priorities: Notification['priority'][] = ['Normal', 'High', 'Urgent', 'Low'];

export default function AdminNotificationsScreen() {
  const queryClient = useQueryClient();
  const accessToken = useAppStore((state) => state.accessToken);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<Notification['type']>('General');
  const [targetAudience, setTargetAudience] = useState<Notification['targetAudience']>('All');
  const [priority, setPriority] = useState<Notification['priority']>('Normal');

  const notificationsQuery = useQuery({
    queryKey: ['admin', 'notifications'],
    queryFn: () => fetchAdminNotifications(accessToken ?? '', { size: 100 }),
    enabled: !!accessToken,
  });

  const createMutation = useMutation({
    mutationFn: async () =>
      createAdminNotification(accessToken ?? '', {
        title: title.trim(),
        content: content.trim(),
        type,
        targetAudience,
        priority,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
      setTitle('');
      setContent('');
      setType('General');
      setTargetAudience('All');
      setPriority('Normal');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Không thể tạo thông báo';
      Alert.alert('Tạo thất bại', message);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (notificationId: string) =>
      deactivateAdminNotification(accessToken ?? '', notificationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    },
  });

  const notifications = useMemo(() => notificationsQuery.data ?? [], [notificationsQuery.data]);
  const canCreate = title.trim().length > 0 && content.trim().length > 0 && !createMutation.isPending;

  const onCreate = () => {
    if (!canCreate) {
      return;
    }
    createMutation.mutate();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý thông báo</Text>
        <Text style={styles.subtitle}>{notifications.length} ban ghi</Text>
      </View>

      <View style={styles.createCard}>
        <Text style={styles.createTitle}>Tạo thông báo mới</Text>

        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Tiêu đề"
          placeholderTextColor={Colors.neutral[400]}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          value={content}
          onChangeText={setContent}
          placeholder="Nội dung thông báo"
          placeholderTextColor={Colors.neutral[400]}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Loại</Text>
          <View style={styles.chipRow}>
            {notificationTypes.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, type === item && styles.chipActive]}
                onPress={() => setType(item)}
              >
                <Text style={[styles.chipText, type === item && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Đối tượng</Text>
          <View style={styles.chipRow}>
            {targetAudiences.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, targetAudience === item && styles.chipActive]}
                onPress={() => setTargetAudience(item)}
              >
                <Text style={[styles.chipText, targetAudience === item && styles.chipTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Ưu tiên</Text>
          <View style={styles.chipRow}>
            {priorities.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, priority === item && styles.chipActive]}
                onPress={() => setPriority(item)}
              >
                <Text style={[styles.chipText, priority === item && styles.chipTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.createButton, !canCreate && styles.createButtonDisabled]}
          onPress={onCreate}
          disabled={!canCreate}
        >
          <Text style={styles.createButtonText}>
            {createMutation.isPending ? 'Đang tạo...' : 'Tạo thông báo'}
          </Text>
        </TouchableOpacity>
      </View>

      {notificationsQuery.isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={Colors.status.error} />
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
                <View style={styles.titleWrap}>
                  <BellRing size={16} color={Colors.status.error} />
                  <Text style={styles.cardTitle}>{item.title}</Text>
                </View>
                <Text style={styles.priorityText}>{item.priority}</Text>
              </View>

              <Text style={styles.cardContent}>{item.content}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>Target: {item.targetAudience}</Text>
                <Text style={styles.metaText}>{item.isActive ? 'Active' : 'Inactive'}</Text>
              </View>

              {item.isActive ? (
                <TouchableOpacity
                  style={styles.deactivateButton}
                  onPress={() => deactivateMutation.mutate(item.id)}
                  disabled={deactivateMutation.isPending}
                >
                  <Text style={styles.deactivateButtonText}>
                    {deactivateMutation.isPending ? 'Đang cập nhật...' : 'Deactivate'}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Chưa có thông báo</Text>
              <Text style={styles.emptySub}>Tạo thông báo mới ở phần trên.</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.neutral[500],
  },
  createCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.neutral.white,
    borderRadius: 14,
    padding: 14,
    ...Shadows.card,
  },
  createTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.neutral[800],
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 14,
    color: Colors.neutral[800],
    backgroundColor: Colors.neutral.white,
    marginBottom: 8,
  },
  textArea: {
    minHeight: 86,
  },
  sectionBlock: {
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral[600],
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.neutral[100],
  },
  chipActive: {
    backgroundColor: Colors.status.error,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.neutral[600],
  },
  chipTextActive: {
    color: Colors.neutral.white,
  },
  createButton: {
    marginTop: 12,
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: Colors.status.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonDisabled: {
    backgroundColor: Colors.neutral[300],
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral.white,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 16,
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 13,
    ...Shadows.soft,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.status.error,
  },
  cardContent: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.neutral[600],
  },
  metaRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 12,
    color: Colors.neutral[500],
  },
  deactivateButton: {
    marginTop: 10,
    minHeight: 38,
    borderRadius: 9,
    backgroundColor: '#FFE9EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deactivateButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.status.error,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 42,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[700],
  },
  emptySub: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.neutral[500],
  },
});
