import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  ClipboardList,
  Clock,
  MapPin,
  Package,
  CheckCircle2,
  Navigation,
  ArrowRight,
} from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchCollectorTasks, updateCollectorTaskStatus } from '@/components/api/backend';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { useAppStore } from '@/store/useAppStore';
import type { AssignmentStatus, TaskAssignment } from '@/types';

const statusConfig: Record<
  AssignmentStatus,
  { label: string; color: string; bgColor: string; icon: React.ElementType }
> = {
  ASSIGNED: {
    label: 'Được gán',
    color: Colors.accent[600],
    bgColor: Colors.accent[50],
    icon: ClipboardList,
  },
  ACCEPTED: {
    label: 'Đã nhận',
    color: Colors.secondary[600],
    bgColor: Colors.secondary[50],
    icon: CheckCircle2,
  },
  ON_THE_WAY: {
    label: 'Đang đi',
    color: Colors.primary[600],
    bgColor: Colors.primary[50],
    icon: Navigation,
  },
  IN_PROGRESS: {
    label: 'Đang xử lý',
    color: Colors.primary[600],
    bgColor: Colors.primary[50],
    icon: Navigation,
  },
  COLLECTED: {
    label: 'Đã thu gom',
    color: Colors.status.success,
    bgColor: '#E8F5E9',
    icon: Package,
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color: Colors.status.success,
    bgColor: '#E8F5E9',
    icon: CheckCircle2,
  },
  FAILED: {
    label: 'Thất bại',
    color: Colors.status.error,
    bgColor: '#FFEBEE',
    icon: Clock,
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: Colors.neutral[500],
    bgColor: Colors.neutral[100],
    icon: Clock,
  },
  REJECTED: {
    label: 'Từ chối',
    color: Colors.status.error,
    bgColor: '#FFEBEE',
    icon: Clock,
  },
  UNASSIGNED: {
    label: 'Chưa gán',
    color: Colors.neutral[500],
    bgColor: Colors.neutral[100],
    icon: ClipboardList,
  },
};

function formatTaskTime(value?: string) {
  if (!value) {
    return '--:--';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '--:--';
  }

  return parsed.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CollectorTasksScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE');

  const tasksQuery = useQuery({
    queryKey: ['collector', 'tasks'],
    queryFn: () => fetchCollectorTasks(accessToken ?? ''),
    enabled: !!accessToken,
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: 'ACCEPTED' | 'ON_THE_WAY' }) =>
      updateCollectorTaskStatus(accessToken ?? '', taskId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['collector', 'tasks'] });
    },
  });

  const assignments = useMemo(() => tasksQuery.data ?? [], [tasksQuery.data]);

  const activeAssignments = useMemo(
    () =>
      assignments.filter((item) =>
        ['ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS'].includes(item.status)
      ),
    [assignments]
  );

  const completedAssignments = useMemo(
    () => assignments.filter((item) => ['COLLECTED', 'COMPLETED'].includes(item.status)),
    [assignments]
  );

  const displayedAssignments = activeTab === 'ACTIVE' ? activeAssignments : completedAssignments;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await tasksQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [tasksQuery]);

  useFocusEffect(
    React.useCallback(() => {
      if (!accessToken) {
        return undefined;
      }

      void tasksQuery.refetch();
      return undefined;
    }, [accessToken, tasksQuery])
  );

  const openTaskDetail = useCallback(
    (taskId: string) => {
      router.push({
        pathname: '/task-detail/[taskId]',
        params: { taskId },
      });
    },
    [router]
  );

  const handleAccept = async (taskId: string) => {
    try {
      await changeStatusMutation.mutateAsync({ taskId, status: 'ACCEPTED' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể nhận nhiệm vụ';
      Alert.alert('Cập nhật thất bại', message);
    }
  };

  const handleStartMoving = async (taskId: string) => {
    try {
      await changeStatusMutation.mutateAsync({ taskId, status: 'ON_THE_WAY' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể cập nhật trạng thái';
      Alert.alert('Cập nhật thất bại', message);
    }
  };

  const renderTaskItem = ({ item }: { item: TaskAssignment }) => {
    const status = statusConfig[item.status] ?? statusConfig.ASSIGNED;
    const StatusIcon = status.icon;
    const report = item.task?.report;
    const taskTitle = report?.wasteTypeName || item.task?.areaName || 'Điểm rác cần thu gom';
    const taskArea = report?.areaName || item.task?.areaName || 'Chưa xác định';
    const taskReporter = report?.reporterName || 'Chưa rõ công dân';
    const taskTime = formatTaskTime(report?.createdAt || item.assignedAt);

    return (
      <TouchableOpacity
        style={styles.taskCard}
        onPress={() => openTaskDetail(item.taskId)}
        activeOpacity={0.86}
      >
        <View style={styles.taskHeader}>
          <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
            <StatusIcon size={14} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
          <Text style={styles.taskTime}>{taskTime}</Text>
        </View>

        <View style={styles.taskBody}>
          <Text style={styles.wasteType}>{taskTitle}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.task?.enterpriseName
              ? `Công dân: ${taskReporter} · Đơn vị xử lý: ${item.task.enterpriseName}`
              : `Công dân: ${taskReporter}`}
          </Text>

          <View style={styles.locationRow}>
            <MapPin size={14} color={Colors.neutral[500]} />
            <Text style={styles.locationText}>{taskArea}</Text>
          </View>
        </View>

        <View style={styles.taskFooter}>
          {item.status === 'ASSIGNED' ? (
            <TouchableOpacity
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={() => void handleAccept(item.taskId)}
            >
              <Text style={styles.acceptBtnText}>Nhận nhiệm vụ</Text>
            </TouchableOpacity>
          ) : null}

          {item.status === 'ACCEPTED' ? (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => void handleStartMoving(item.taskId)}
            >
              <Navigation size={16} color={Colors.neutral.white} />
              <Text style={styles.primaryBtnText}>Bắt đầu di chuyển</Text>
            </TouchableOpacity>
          ) : null}

          {item.status === 'ON_THE_WAY' || item.status === 'IN_PROGRESS' ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={() => openTaskDetail(item.taskId)}>
              <CheckCircle2 size={16} color={Colors.neutral.white} />
              <Text style={styles.primaryBtnText}>Mở biểu mẫu hoàn tất</Text>
            </TouchableOpacity>
          ) : null}

          {item.status === 'COLLECTED' || item.status === 'COMPLETED' ? (
            <View style={styles.detailHintRow}>
              <Text style={styles.detailHintText}>Xem lại chi tiết nhiệm vụ</Text>
              <ArrowRight size={16} color={Colors.secondary[600]} />
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Nhiệm vụ hôm nay</Text>
          <Text style={styles.subtitle}>{activeAssignments.length} đang chờ xử lý</Text>
        </View>
        <TouchableOpacity style={styles.mapButton} onPress={() => router.push('/(collector)/map')}>
          <MapPin size={20} color={Colors.neutral.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ACTIVE' && styles.tabActive]}
          onPress={() => setActiveTab('ACTIVE')}
        >
          <Text style={[styles.tabText, activeTab === 'ACTIVE' && styles.tabTextActive]}>
            Đang thực hiện ({activeAssignments.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'COMPLETED' && styles.tabActive]}
          onPress={() => setActiveTab('COMPLETED')}
        >
          <Text style={[styles.tabText, activeTab === 'COMPLETED' && styles.tabTextActive]}>
            Đã hoàn thành ({completedAssignments.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayedAssignments}
        keyExtractor={(item) => item.assignmentId}
        renderItem={renderTaskItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ClipboardList size={48} color={Colors.neutral[300]} />
            <Text style={styles.emptyTitle}>Không có nhiệm vụ nào</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'ACTIVE'
                ? 'Bạn không có nhiệm vụ nào đang chờ'
                : 'Chưa có nhiệm vụ hoàn thành'}
            </Text>
          </View>
        }
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  subtitle: {
    fontSize: 14,
    color: Colors.neutral[500],
    marginTop: 4,
  },
  mapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.neutral.white,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.secondary[600],
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[600],
  },
  tabTextActive: {
    color: Colors.neutral.white,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  taskCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Shadows.card,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskTime: {
    fontSize: 13,
    color: Colors.neutral[500],
  },
  taskBody: {
    marginBottom: 16,
  },
  wasteType: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral[800],
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: Colors.neutral[600],
    marginBottom: 10,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 13,
    color: Colors.neutral[500],
    marginLeft: 6,
  },
  taskFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
    paddingTop: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: Colors.secondary[600],
  },
  acceptBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral.white,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: Colors.secondary[600],
    borderRadius: 10,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral.white,
  },
  detailHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    paddingVertical: 4,
  },
  detailHintText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary[600],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral[600],
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.neutral[400],
    marginTop: 4,
  },
});
