import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { useAppStore } from '@/store/useAppStore';
import {
  fetchAdminComplaints,
  resolveAdminComplaint,
} from '@/components/api/backend';

type FilterType = 'ALL' | 'Pending' | 'Resolved' | 'Rejected';

const filters: FilterType[] = ['ALL', 'Pending', 'Resolved', 'Rejected'];

const statusIconMap = {
  Pending: Clock,
  In_Progress: AlertCircle,
  Resolved: CheckCircle2,
  Rejected: AlertCircle,
} as const;

export default function AdminComplaintsScreen() {
  const queryClient = useQueryClient();
  const accessToken = useAppStore((state) => state.accessToken);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

  const complaintsQuery = useQuery({
    queryKey: ['admin', 'complaints', activeFilter],
    queryFn: () =>
      fetchAdminComplaints(accessToken ?? '', {
        size: 100,
        status: activeFilter === 'ALL' ? undefined : activeFilter,
      }),
    enabled: !!accessToken,
  });

  const resolveMutation = useMutation({
    mutationFn: async (complaintId: string) =>
      resolveAdminComplaint(accessToken ?? '', complaintId, {
        decision: 'RESOLVED',
        isAccepted: true,
        adminResponse: 'Đã tiếp nhận và xử lý từ admin mobile.',
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'complaints'] });
    },
  });

  const complaints = useMemo(() => complaintsQuery.data ?? [], [complaintsQuery.data]);

  const onResolve = (complaintId: string) => {
    Alert.alert('Xử lý khiếu nại', 'Đánh dấu khiếu nại này đã được xử lý?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xác nhận',
        onPress: async () => {
          try {
            await resolveMutation.mutateAsync(complaintId);
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Không thể cập nhật khiếu nại';
            Alert.alert('Thất bại', message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý khiếu nại</Text>
        <Text style={styles.subtitle}>{complaints.length} đơn</Text>
      </View>

      <View style={styles.filterRow}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[styles.filterChipText, activeFilter === filter && styles.filterChipTextActive]}>
              {filter === 'ALL' ? 'Tất cả' : filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {complaintsQuery.isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={Colors.status.error} />
        </View>
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(item) => item.complaintId}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={complaintsQuery.isRefetching}
              onRefresh={() => {
                void complaintsQuery.refetch();
              }}
            />
          }
          renderItem={({ item }) => {
            const status = item.status || 'Pending';
            const StatusIcon = statusIconMap[status] ?? AlertCircle;
            const canResolve = status === 'Pending' || status === 'In_Progress';

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.title || 'Khiếu nại'}</Text>
                  <View style={styles.statusBadge}>
                    <StatusIcon size={14} color={Colors.neutral[600]} />
                    <Text style={styles.statusText}>{status}</Text>
                  </View>
                </View>

                <Text style={styles.cardContent} numberOfLines={3}>
                  {item.content}
                </Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.metaText}>{item.createdByName || item.createdByUserId}</Text>
                  <Text style={styles.metaText}>
                    {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                  </Text>
                </View>

                {canResolve ? (
                  <TouchableOpacity
                    style={styles.resolveButton}
                    onPress={() => onResolve(item.complaintId)}
                    disabled={resolveMutation.isPending}
                  >
                    <Text style={styles.resolveButtonText}>
                      {resolveMutation.isPending ? 'Đang xử lý...' : 'Đánh dấu đã xử lý'}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Không có khiếu nại</Text>
              <Text style={styles.emptySub}>Dữ liệu sẽ hiển thị khi có phát sinh.</Text>
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
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.neutral.white,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  filterChipActive: {
    backgroundColor: Colors.status.error,
    borderColor: Colors.status.error,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral[600],
  },
  filterChipTextActive: {
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
    borderRadius: 14,
    padding: 14,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Colors.neutral[100],
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.neutral[600],
  },
  cardContent: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.neutral[600],
  },
  cardFooter: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 12,
    color: Colors.neutral[500],
  },
  resolveButton: {
    marginTop: 12,
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: Colors.status.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resolveButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.neutral.white,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
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
