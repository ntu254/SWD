import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ClipboardList, Clock, MapPin, Package, CheckCircle2, Navigation } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { taskAssignments } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';
import type { TaskAssignment, AssignmentStatus } from '@/types';

const statusConfig: Record<AssignmentStatus, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  ASSIGNED: { label: 'Được gán', color: Colors.accent[600], bgColor: Colors.accent[50], icon: ClipboardList },
  ACCEPTED: { label: 'Đã nhận', color: Colors.secondary[600], bgColor: Colors.secondary[50], icon: CheckCircle2 },
  ON_THE_WAY: { label: 'Đang đi', color: Colors.primary[600], bgColor: Colors.primary[50], icon: Navigation },
  COLLECTED: { label: 'Đã thu gom', color: Colors.status.success, bgColor: '#E8F5E9', icon: Package },
  COMPLETED: { label: 'Hoàn thành', color: Colors.status.success, bgColor: '#E8F5E9', icon: CheckCircle2 },
  FAILED: { label: 'Thất bại', color: Colors.status.error, bgColor: '#FFEBEE', icon: Clock },
  CANCELLED: { label: 'Đã hủy', color: Colors.neutral[500], bgColor: Colors.neutral[100], icon: Clock },
  REJECTED: { label: 'Từ chối', color: Colors.status.error, bgColor: '#FFEBEE', icon: Clock },
  UNASSIGNED: { label: 'Chưa gán', color: Colors.neutral[500], bgColor: Colors.neutral[100], icon: ClipboardList },
};

export default function CollectorTasksScreen() {
  const router = useRouter();
  const { user } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE');

  const myAssignments = taskAssignments.filter(a => a.collectorUserId === user?.userId);

  const activeAssignments = myAssignments.filter(a =>
    ['ASSIGNED', 'ACCEPTED', 'ON_THE_WAY'].includes(a.status)
  );

  const completedAssignments = myAssignments.filter(a =>
    ['COLLECTED', 'COMPLETED'].includes(a.status)
  );

  const displayedAssignments = activeTab === 'ACTIVE' ? activeAssignments : completedAssignments;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleTaskPress = (assignment: TaskAssignment) => {
    console.log('Task pressed:', assignment.taskId);
  };

  const renderTaskItem = ({ item }: { item: TaskAssignment }) => {
    const status = statusConfig[item.status];
    const StatusIcon = status.icon;

    return (
      <TouchableOpacity
        style={styles.taskCard}
        onPress={() => handleTaskPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.taskHeader}>
          <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
            <StatusIcon size={14} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
          <Text style={styles.taskTime}>
            {new Date(item.assignedAt || '').toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        <View style={styles.taskBody}>
          <Text style={styles.wasteType}>{item.task?.report?.wasteTypeName || 'Rác thải'}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.task?.report?.description || 'Không có mô tả'}
          </Text>

          <View style={styles.locationRow}>
            <MapPin size={14} color={Colors.neutral[500]} />
            <Text style={styles.locationText}>{item.task?.areaName || 'Chưa xác định'}</Text>
          </View>
        </View>

        <View style={styles.taskFooter}>
          {item.status === 'ASSIGNED' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]}>
                <Text style={styles.rejectBtnText}>Từ chối</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]}>
                <Text style={styles.acceptBtnText}>Nhận nhiệm vụ</Text>
              </TouchableOpacity>
            </View>
          )}

          {item.status === 'ACCEPTED' && (
            <TouchableOpacity style={styles.primaryBtn}>
              <Navigation size={16} color={Colors.neutral.white} />
              <Text style={styles.primaryBtnText}>Bắt đầu di chuyển</Text>
            </TouchableOpacity>
          )}

          {item.status === 'ON_THE_WAY' && (
            <TouchableOpacity style={styles.primaryBtn}>
              <CheckCircle2 size={16} color={Colors.neutral.white} />
              <Text style={styles.primaryBtnText}>Xác nhận thu gom</Text>
            </TouchableOpacity>
          )}
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
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => router.push('/(collector)/map')}
        >
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  rejectBtn: {
    backgroundColor: Colors.neutral[100],
  },
  rejectBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[600],
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
