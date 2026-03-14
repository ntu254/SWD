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
import { Settings } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { useAppStore } from '@/store/useAppStore';
import {
  createAdminSetting,
  deleteAdminSetting,
  fetchAdminSettings,
  updateAdminSetting,
} from '@/components/api/backend';
import type { SystemSetting } from '@/types';

export default function AdminSettingsScreen() {
  const queryClient = useQueryClient();
  const accessToken = useAppStore((state) => state.accessToken);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [settingKey, setSettingKey] = useState('');
  const [settingValue, setSettingValue] = useState('');
  const [description, setDescription] = useState('');

  const settingsQuery = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => fetchAdminSettings(accessToken ?? ''),
    enabled: !!accessToken,
  });

  const createMutation = useMutation({
    mutationFn: async () =>
      createAdminSetting(accessToken ?? '', {
        settingKey: settingKey.trim(),
        settingValue: settingValue.trim(),
        description: description.trim() || undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      setSettingKey('');
      setSettingValue('');
      setDescription('');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Không thể tạo setting';
      Alert.alert('Tạo setting thất bại', message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () =>
      updateAdminSetting(accessToken ?? '', editingKey ?? '', {
        settingValue: settingValue.trim(),
        description: description.trim() || undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      setEditingKey(null);
      setSettingKey('');
      setSettingValue('');
      setDescription('');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Không thể cập nhật setting';
      Alert.alert('Cập nhật thất bại', message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (key: string) => deleteAdminSetting(accessToken ?? '', key),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
  });

  const settings = useMemo(() => settingsQuery.data ?? [], [settingsQuery.data]);

  const startEdit = (item: SystemSetting) => {
    setEditingKey(item.settingKey);
    setSettingKey(item.settingKey);
    setSettingValue(item.settingValue);
    setDescription(item.description ?? '');
  };

  const resetForm = () => {
    setEditingKey(null);
    setSettingKey('');
    setSettingValue('');
    setDescription('');
  };

  const onSubmit = () => {
    if (!settingValue.trim()) {
      Alert.alert('Thiếu giá trị', 'Setting value không được để trống.');
      return;
    }

    if (editingKey) {
      updateMutation.mutate();
      return;
    }

    if (!settingKey.trim()) {
      Alert.alert('Thiếu key', 'Setting key không được để trống.');
      return;
    }

    createMutation.mutate();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>System settings</Text>
        <Text style={styles.subtitle}>{settings.length} key</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>{editingKey ? `Cập nhật: ${editingKey}` : 'Tạo setting mới'}</Text>

        <TextInput
          style={[styles.input, editingKey && styles.inputDisabled]}
          value={settingKey}
          onChangeText={setSettingKey}
          editable={!editingKey}
          placeholder="setting.key"
          placeholderTextColor={Colors.neutral[400]}
        />
        <TextInput
          style={styles.input}
          value={settingValue}
          onChangeText={setSettingValue}
          placeholder="setting value"
          placeholderTextColor={Colors.neutral[400]}
        />
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="description (optional)"
          placeholderTextColor={Colors.neutral[400]}
        />

        <View style={styles.formActions}>
          {editingKey ? (
            <TouchableOpacity style={styles.secondaryButton} onPress={resetForm}>
              <Text style={styles.secondaryButtonText}>Hủy</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            <Text style={styles.primaryButtonText}>
              {createMutation.isPending || updateMutation.isPending
                ? 'Đang lưu...'
                : editingKey
                  ? 'Cập nhật'
                  : 'Tạo'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {settingsQuery.isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={Colors.status.error} />
        </View>
      ) : (
        <FlatList
          data={settings}
          keyExtractor={(item) => item.settingKey}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={settingsQuery.isRefetching}
              onRefresh={() => {
                void settingsQuery.refetch();
              }}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconWrap}>
                  <Settings size={16} color={Colors.status.error} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardKey}>{item.settingKey}</Text>
                  <Text style={styles.cardValue}>{item.settingValue}</Text>
                </View>
              </View>

              {item.description ? <Text style={styles.cardDescription}>{item.description}</Text> : null}

              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => startEdit(item)}>
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionDanger]}
                  onPress={() => deleteMutation.mutate(item.settingKey)}
                  disabled={deleteMutation.isPending}
                >
                  <Text style={styles.actionDangerText}>
                    {deleteMutation.isPending ? 'Đang xử lý...' : 'Delete'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Chưa có setting</Text>
              <Text style={styles.emptySub}>Tạo setting mới ở phần trên.</Text>
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
  formCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.neutral.white,
    borderRadius: 14,
    padding: 14,
    ...Shadows.card,
  },
  formTitle: {
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
  inputDisabled: {
    backgroundColor: Colors.neutral[100],
    color: Colors.neutral[500],
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  primaryButton: {
    minHeight: 40,
    minWidth: 96,
    borderRadius: 10,
    backgroundColor: Colors.status.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.neutral.white,
  },
  secondaryButton: {
    minHeight: 40,
    minWidth: 72,
    borderRadius: 10,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral[700],
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
    alignItems: 'center',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFE9EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 10,
  },
  cardKey: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  cardValue: {
    marginTop: 2,
    fontSize: 12,
    color: Colors.neutral[600],
  },
  cardDescription: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.neutral[500],
  },
  cardActions: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    minHeight: 34,
    minWidth: 64,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral[700],
  },
  actionDanger: {
    backgroundColor: '#FFE9EC',
  },
  actionDangerText: {
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
