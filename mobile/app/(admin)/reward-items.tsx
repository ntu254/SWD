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
import { Gift } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { useAppStore } from '@/store/useAppStore';
import {
  createAdminRewardItem,
  deactivateAdminRewardItem,
  fetchAdminRewardItems,
} from '@/components/api/backend';

export default function AdminRewardItemsScreen() {
  const queryClient = useQueryClient();
  const accessToken = useAppStore((state) => state.accessToken);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pointsCost, setPointsCost] = useState('');
  const [stock, setStock] = useState('');

  const rewardItemsQuery = useQuery({
    queryKey: ['admin', 'reward-items'],
    queryFn: () => fetchAdminRewardItems(accessToken ?? '', { size: 100 }),
    enabled: !!accessToken,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const parsedPoints = Number.parseInt(pointsCost, 10);
      const parsedStock = Number.parseInt(stock, 10);

      if (!name.trim()) {
        throw new Error('Tên phần thưởng là bắt buộc');
      }
      if (!Number.isFinite(parsedPoints) || parsedPoints <= 0) {
        throw new Error('Điểm đổi phải > 0');
      }
      if (!Number.isFinite(parsedStock) || parsedStock < 0) {
        throw new Error('Số lượng phải >= 0');
      }

      return createAdminRewardItem(accessToken ?? '', {
        name: name.trim(),
        description: description.trim() || undefined,
        pointsCost: parsedPoints,
        stock: parsedStock,
        isActive: true,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'reward-items'] });
      setName('');
      setDescription('');
      setPointsCost('');
      setStock('');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Không thể tạo reward item';
      Alert.alert('Tạo thất bại', message);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (itemId: string) => deactivateAdminRewardItem(accessToken ?? '', itemId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'reward-items'] });
    },
  });

  const items = useMemo(() => rewardItemsQuery.data ?? [], [rewardItemsQuery.data]);
  const canCreate =
    name.trim().length > 0 &&
    Number.parseInt(pointsCost, 10) > 0 &&
    Number.parseInt(stock, 10) >= 0 &&
    !createMutation.isPending;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý reward item</Text>
        <Text style={styles.subtitle}>{items.length} item</Text>
      </View>

      <View style={styles.createCard}>
        <Text style={styles.createTitle}>Tạo reward item</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Tên quà"
          placeholderTextColor={Colors.neutral[400]}
        />
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Mô tả (tùy chọn)"
          placeholderTextColor={Colors.neutral[400]}
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.inputHalf]}
            value={pointsCost}
            onChangeText={setPointsCost}
            placeholder="Điểm đổi"
            placeholderTextColor={Colors.neutral[400]}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.inputHalf]}
            value={stock}
            onChangeText={setStock}
            placeholder="Số lượng"
            placeholderTextColor={Colors.neutral[400]}
            keyboardType="numeric"
          />
        </View>
        <TouchableOpacity
          style={[styles.createButton, !canCreate && styles.createButtonDisabled]}
          onPress={() => createMutation.mutate()}
          disabled={!canCreate}
        >
          <Text style={styles.createButtonText}>
            {createMutation.isPending ? 'Đang tạo...' : 'Tạo item'}
          </Text>
        </TouchableOpacity>
      </View>

      {rewardItemsQuery.isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={Colors.status.error} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.itemId}
          style={styles.listView}
          contentContainerStyle={styles.list}
          removeClippedSubviews={false}
          refreshControl={
            <RefreshControl
              refreshing={rewardItemsQuery.isRefetching}
              onRefresh={() => {
                void rewardItemsQuery.refetch();
              }}
            />
          }
          renderItem={({ item }) => {
            const safeName = item.name?.trim() ? item.name : 'Reward item';
            const safePoints =
              typeof item.pointsCost === 'number' && Number.isFinite(item.pointsCost)
                ? item.pointsCost
                : 0;
            const safeStock =
              typeof item.stock === 'number' && Number.isFinite(item.stock) ? item.stock : 0;
            const safeDescription = item.description?.trim();

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconWrap}>
                    <Gift size={18} color={Colors.status.error} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{safeName}</Text>
                    <Text style={styles.cardSub}>
                      {safePoints.toLocaleString()} điểm - Tồn {safeStock}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.stateText,
                      { color: item.isActive ? Colors.status.success : Colors.neutral[500] },
                    ]}
                  >
                    {item.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>

                {safeDescription ? <Text style={styles.description}>{safeDescription}</Text> : null}

                {item.isActive ? (
                  <TouchableOpacity
                    style={styles.deactivateButton}
                    onPress={() => deactivateMutation.mutate(item.itemId)}
                    disabled={deactivateMutation.isPending}
                  >
                    <Text style={styles.deactivateButtonText}>
                      {deactivateMutation.isPending ? 'Đang xử lý...' : 'Deactivate'}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Chưa có reward item</Text>
              <Text style={styles.emptySub}>Hãy tạo item mới ở phần trên.</Text>
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
  row: {
    flexDirection: 'row',
    gap: 8,
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
  inputHalf: {
    flex: 1,
  },
  createButton: {
    marginTop: 4,
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
  listView: {
    marginTop: 8,
  },
  list: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 13,
    marginBottom: 12,
    ...Shadows.soft,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 36,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFE9EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  cardSub: {
    marginTop: 2,
    fontSize: 12,
    color: Colors.neutral[500],
  },
  stateText: {
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    marginTop: 8,
    fontSize: 13,
    color: Colors.neutral[600],
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
