import {
  acceptEnterpriseReport,
  assignEnterpriseTask,
  fetchEnterpriseCapabilities,
  fetchEnterpriseCollectors,
  fetchEnterprisePendingReports,
  fetchEnterpriseTasks,
  fetchMyComplaints,
  fetchReports,
  rejectEnterpriseReport,
} from '@/components/api/backend';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { useAppStore } from '@/store/useAppStore';
import type { ReportStatus, Task, WasteReport } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Clock,
  Filter,
  MapPin,
  TrendingUp,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

const statusColors: Record<ReportStatus, string> = {
  PENDING: Colors.status.pending,
  ACCEPTED: Colors.status.info,
  ASSIGNED: Colors.accent[500],
  ON_THE_WAY: Colors.secondary[500],
  COLLECTED: Colors.status.success,
  REJECTED: Colors.status.error,
};

const statusLabels: Record<ReportStatus, string> = {
  PENDING: 'Chờ duyệt',
  ACCEPTED: 'Đã duyệt',
  ASSIGNED: 'Đã gán',
  ON_THE_WAY: 'Đang di chuyển',
  COLLECTED: 'Đã thu gom',
  REJECTED: 'Từ chối',
};

type ReportFilter = 'ALL' | 'PENDING' | 'ACCEPTED';

export default function EnterpriseDashboardScreen() {
  const queryClient = useQueryClient();
  const accessToken = useAppStore((state) => state.accessToken);

  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ReportFilter>('ALL');

  const pendingReportsQuery = useQuery({
    queryKey: ['enterprise', 'reports', 'pending'],
    queryFn: () => fetchEnterprisePendingReports(accessToken ?? '', { size: 100 }),
    enabled: !!accessToken,
  });

  const acceptedReportsQuery = useQuery({
    queryKey: ['enterprise', 'reports', 'accepted'],
    queryFn: () => fetchReports(accessToken ?? '', { status: 'ACCEPTED', size: 100 }),
    enabled: !!accessToken,
  });

  const tasksQuery = useQuery({
    queryKey: ['enterprise', 'tasks', 'all'],
    queryFn: () => fetchEnterpriseTasks(accessToken ?? '', { size: 200 }),
    enabled: !!accessToken,
  });

  const collectorsQuery = useQuery({
    queryKey: ['enterprise', 'collectors', 'dashboard'],
    queryFn: () => fetchEnterpriseCollectors(accessToken ?? ''),
    enabled: !!accessToken,
  });

  const capabilitiesQuery = useQuery({
    queryKey: ['enterprise', 'capabilities', 'dashboard'],
    queryFn: () => fetchEnterpriseCapabilities(accessToken ?? ''),
    enabled: !!accessToken,
  });

  const complaintsQuery = useQuery({
    queryKey: ['enterprise', 'complaints', 'mine'],
    queryFn: () => fetchMyComplaints(accessToken ?? '', { size: 100 }),
    enabled: !!accessToken,
  });

  const pendingReports = useMemo(() => pendingReportsQuery.data ?? [], [pendingReportsQuery.data]);
  const acceptedReports = useMemo(() => acceptedReportsQuery.data ?? [], [acceptedReportsQuery.data]);
  const enterpriseTasks = useMemo(() => tasksQuery.data ?? [], [tasksQuery.data]);
  const collectors = useMemo(() => collectorsQuery.data ?? [], [collectorsQuery.data]);
  const capabilities = useMemo(() => capabilitiesQuery.data ?? [], [capabilitiesQuery.data]);
  const complaints = useMemo(() => complaintsQuery.data ?? [], [complaintsQuery.data]);
  const supportedWasteTypeIds = useMemo(
    () => new Set(capabilities.map((cap) => cap.wasteTypeId)),
    [capabilities]
  );
  const blockedPendingReportsCount = useMemo(
    () =>
      pendingReports.filter(
        (report) => !report.wasteTypeId || !supportedWasteTypeIds.has(report.wasteTypeId)
      ).length,
    [pendingReports, supportedWasteTypeIds]
  );
  const reportTaskMap = useMemo(() => {
    const map = new Map<string, Task>();
    for (const task of enterpriseTasks) {
      if (task.reportId) {
        map.set(task.reportId, task);
      }
    }
    return map;
  }, [enterpriseTasks]);
  const acceptedReportsForEnterprise = useMemo(
    () => acceptedReports.filter((report) => reportTaskMap.has(report.reportId)),
    [acceptedReports, reportTaskMap]
  );
  const unassignedTasks = useMemo(
    () =>
      enterpriseTasks
        .filter(
          (task) =>
            task.status !== 'COMPLETED' &&
            task.status !== 'COLLECTED' &&
            (!task.collectorUserId || task.assignmentStatus === 'UNASSIGNED')
        )
        .slice(0, 8),
    [enterpriseTasks]
  );

  const filteredReports = useMemo(() => {
    if (activeFilter === 'PENDING') {
      return pendingReports;
    }

    if (activeFilter === 'ACCEPTED') {
      return acceptedReportsForEnterprise;
    }

    const merged = [...pendingReports, ...acceptedReportsForEnterprise];
    const deduped = new Map<string, WasteReport>();
    for (const report of merged) {
      deduped.set(report.reportId, report);
    }
    return Array.from(deduped.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [acceptedReportsForEnterprise, activeFilter, pendingReports]);

  const stats = useMemo(() => {
    const inProgress = enterpriseTasks.filter((task) =>
      ['PENDING_ENTERPRISE_APPROVAL', 'ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS'].includes(task.status)
    ).length;
    const completed = enterpriseTasks.filter((task) =>
      ['COMPLETED', 'COLLECTED'].includes(task.status)
    ).length;
    const alerts = complaints.filter((item) => item.status !== 'Resolved').length;

    return [
      {
        label: 'Chờ duyệt',
        value: pendingReports.length,
        color: Colors.status.pending,
        icon: Clock,
      },
      { label: 'Đang xử lý', value: inProgress, color: Colors.secondary[500], icon: ClipboardList },
      { label: 'Hoàn thành', value: completed, color: Colors.status.success, icon: CheckCircle2 },
      { label: 'Cảnh báo', value: alerts, color: Colors.status.error, icon: AlertCircle },
    ];
  }, [complaints, enterpriseTasks, pendingReports.length]);

  const summary = useMemo(() => {
    const totalTasks = enterpriseTasks.length;
    const completed = enterpriseTasks.filter((task) =>
      ['COMPLETED', 'COLLECTED'].includes(task.status)
    ).length;
    const efficiency = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

    return {
      processed: completed,
      efficiency,
      totalTasks,
    };
  }, [enterpriseTasks]);

  const invalidateEnterpriseQueries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['enterprise', 'reports'] }),
      queryClient.invalidateQueries({ queryKey: ['enterprise', 'tasks'] }),
      queryClient.invalidateQueries({ queryKey: ['enterprise', 'capabilities'] }),
      queryClient.invalidateQueries({ queryKey: ['enterprise', 'complaints'] }),
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] }),
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] }),
    ]);
  }, [queryClient]);

  const canEnterpriseHandleReport = useCallback(
    (report: WasteReport) => {
      if (!report.wasteTypeId) {
        return false;
      }
      return supportedWasteTypeIds.has(report.wasteTypeId);
    },
    [supportedWasteTypeIds]
  );

  const acceptMutation = useMutation({
    mutationFn: async (reportId: string) => {
      if (!accessToken) {
        throw new Error('Phiên đăng nhập đã hết hạn');
      }
      return acceptEnterpriseReport(accessToken, reportId);
    },
    onSuccess: () => void invalidateEnterpriseQueries(),
    onError: (error) => {
      const rawMessage = error instanceof Error ? error.message : 'Không thể tiếp nhận báo cáo';
      const normalized = rawMessage.toLowerCase();
      const message =
        normalized.includes('missing waste type')
          ? 'Báo cáo này thiếu wasteType trong dữ liệu backend. Không thể tiếp nhận.'
          : normalized.includes('capability for this waste type')
            ? 'Enterprise của bạn chưa có capability cho loại rác này. Hãy bổ sung trong tab Năng lực.'
          : rawMessage;
      Alert.alert('Tiếp nhận thất bại', message);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (reportId: string) => {
      if (!accessToken) {
        throw new Error('Phiên đăng nhập đã hết hạn');
      }
      await rejectEnterpriseReport(accessToken, reportId, 'Rejected from enterprise mobile');
    },
    onSuccess: async () => {
      await invalidateEnterpriseQueries();
      Alert.alert('Thành công', 'Đã từ chối báo cáo');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Không thể từ chối báo cáo';
      Alert.alert('Từ chối thất bại', message);
    },
  });

  const assignMutation = useMutation({
    mutationFn: async ({
      taskId,
      collectorUserId,
    }: {
      taskId: string;
      collectorUserId: string;
    }) => {
      if (!accessToken) {
        throw new Error('Phiên đăng nhập đã hết hạn');
      }
      await assignEnterpriseTask(accessToken, taskId, collectorUserId);
    },
    onSuccess: async () => {
      await invalidateEnterpriseQueries();
      Alert.alert('Thành công', 'Đã gán task cho collector');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Không thể gán task';
      Alert.alert('Gán task thất bại', message);
    },
  });

  const openAssignCollectorDialog = useCallback(
    (taskId: string) => {
      if (collectors.length === 0) {
        Alert.alert('Chưa có collector', 'Vào tab Collector để tạo/cấu hình collector.');
        return;
      }

      const actions = collectors.slice(0, 8).map((collector) => ({
        text: collector.displayName,
        onPress: () =>
          assignMutation.mutate({
            taskId,
            collectorUserId: collector.userId,
          }),
      }));

      Alert.alert('Gán collector', 'Chọn collector cho task này', [
        ...actions,
        { text: 'Hủy', style: 'cancel' },
      ]);
    },
    [assignMutation, collectors]
  );

  const handleAcceptReport = useCallback(
    async (reportId: string) => {
      try {
        const createdTask = await acceptMutation.mutateAsync(reportId);
        if (createdTask?.taskId) {
          openAssignCollectorDialog(createdTask.taskId);
        }
      } catch {
        // Error is already handled in mutation onError.
      }
    },
    [acceptMutation, openAssignCollectorDialog]
  );

  const handleAssignAcceptedReport = useCallback(
    async (reportId: string) => {
      const directTask = reportTaskMap.get(reportId);
      if (directTask?.taskId) {
        openAssignCollectorDialog(directTask.taskId);
        return;
      }

      const refreshed = await tasksQuery.refetch();
      const foundTask = (refreshed.data ?? []).find((task) => task.reportId === reportId);
      if (foundTask?.taskId) {
        openAssignCollectorDialog(foundTask.taskId);
        return;
      }

      Alert.alert(
        'Chưa tìm thấy task',
        'Báo cáo đã duyệt này không map được task của enterprise hiện tại. Thử refresh hoặc kiểm tra lại dữ liệu backend.'
      );
    },
    [openAssignCollectorDialog, reportTaskMap, tasksQuery]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await invalidateEnterpriseQueries();
    setRefreshing(false);
  }, [invalidateEnterpriseQueries]);

  useFocusEffect(
    React.useCallback(() => {
      if (!accessToken) {
        return undefined;
      }

      void Promise.all([
        pendingReportsQuery.refetch(),
        acceptedReportsQuery.refetch(),
        tasksQuery.refetch(),
        collectorsQuery.refetch(),
        capabilitiesQuery.refetch(),
        complaintsQuery.refetch(),
      ]);

      return undefined;
    }, [
      accessToken,
      acceptedReportsQuery,
      capabilitiesQuery,
      collectorsQuery,
      complaintsQuery,
      pendingReportsQuery,
      tasksQuery,
    ])
  );

  const isLoadingInitial =
    pendingReportsQuery.isLoading ||
    acceptedReportsQuery.isLoading ||
    tasksQuery.isLoading ||
    capabilitiesQuery.isLoading ||
    complaintsQuery.isLoading;

  const isMutating = acceptMutation.isPending || rejectMutation.isPending;

  const renderReportItem = ({ item }: { item: WasteReport }) => (
    <TouchableOpacity style={styles.reportCard} activeOpacity={0.8}>
      <View style={styles.reportHeader}>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColors[item.status] }]} />
          <Text style={[styles.statusText, { color: statusColors[item.status] }]}>
            {statusLabels[item.status]}
          </Text>
        </View>
        <Text style={styles.reportTime}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
      </View>

      <View style={styles.reportBody}>
        <Text style={styles.wasteType}>{item.wasteTypeName || 'Báo cáo'}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description || 'Không có mô tả'}
        </Text>

        <View style={styles.locationRow}>
          <MapPin size={14} color={Colors.neutral[500]} />
          <Text style={styles.locationText}>{item.areaName || 'Chưa xác định khu vực'}</Text>
        </View>
      </View>

      {item.status === 'PENDING' ? (
        <View style={styles.reportActions}>
          {!item.wasteTypeId ? (
            <TouchableOpacity style={[styles.rejectBtn, styles.disabledActionBtn]} disabled>
              <Text style={styles.rejectBtnText}>Thiếu loại rác</Text>
            </TouchableOpacity>
          ) : !canEnterpriseHandleReport(item) ? (
            <TouchableOpacity style={[styles.rejectBtn, styles.disabledActionBtn]} disabled>
              <Text style={styles.rejectBtnText}>Không phù hợp</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => rejectMutation.mutate(item.reportId)}
                disabled={isMutating}
              >
                <Text style={styles.rejectBtnText}>{isMutating ? 'Đang xử lý...' : 'Từ chối'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={() => void handleAcceptReport(item.reportId)}
                disabled={isMutating}
              >
                <Text style={styles.acceptBtnText}>{isMutating ? 'Đang xử lý...' : 'Tiếp nhận'}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : item.status === 'ACCEPTED' ? (
        <View style={styles.reportActions}>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => {
              void handleAssignAcceptedReport(item.reportId);
            }}
            disabled={assignMutation.isPending}
          >
            <Text style={styles.acceptBtnText}>
              {assignMutation.isPending ? 'Đang gán...' : 'Gán collector'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Dashboard</Text>
          <Text style={styles.subtitle}>Công Ty Tái Chế Xanh</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={Colors.neutral.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <View key={`${stat.label}-${index}`} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                  <Icon size={20} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <TrendingUp size={20} color={Colors.accent[600]} />
            <Text style={styles.summaryTitle}>Tóm tắt hôm nay</Text>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{summary.processed}</Text>
              <Text style={styles.summaryLabel}>Đã xử lý</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{summary.efficiency}%</Text>
              <Text style={styles.summaryLabel}>Hiệu suất</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{summary.totalTasks}</Text>
              <Text style={styles.summaryLabel}>Nhiệm vụ</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nhiệm vụ cần gán collector</Text>
          </View>

          {collectors.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Chưa có collector để gán</Text>
            </View>
          ) : unassignedTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Không có task cần gán</Text>
            </View>
          ) : (
            unassignedTasks.map((task) => (
              <View key={task.taskId} style={styles.assignCard}>
                <Text style={styles.assignTitle}>{task.areaName || 'Khu vực chưa xác định'}</Text>
                <Text style={styles.assignSub}>Task ID: {task.taskId.slice(0, 8)}</Text>

                <View style={styles.assignCollectorRow}>
                  {collectors.slice(0, 3).map((collector) => (
                    <TouchableOpacity
                      key={`${task.taskId}-${collector.userId}`}
                      style={styles.assignCollectorChip}
                      onPress={() =>
                        assignMutation.mutate({
                          taskId: task.taskId,
                          collectorUserId: collector.userId,
                        })
                      }
                      disabled={assignMutation.isPending}
                    >
                      <Text style={styles.assignCollectorChipText} numberOfLines={1}>
                        {assignMutation.isPending ? 'Đang gán...' : collector.displayName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Yêu cầu chờ duyệt</Text>
            {blockedPendingReportsCount > 0 ? (
              <Text style={styles.sectionSubTitle}>
                {blockedPendingReportsCount} báo cáo cần bổ sung loại rác hoặc cấu hình thêm năng lực.
              </Text>
            ) : null}
            <View style={styles.filterTabs}>
              {(['ALL', 'PENDING', 'ACCEPTED'] as const).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterTab, activeFilter === filter && styles.filterTabActive]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text style={[styles.filterTabText, activeFilter === filter && styles.filterTabTextActive]}>
                    {filter === 'ALL' ? 'Tất cả' : filter === 'PENDING' ? 'Chờ' : 'Đã duyệt'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {isLoadingInitial ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color={Colors.accent[600]} />
            </View>
          ) : (
            <FlatList
              data={filteredReports}
              keyExtractor={(item) => item.reportId}
              renderItem={renderReportItem}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <ClipboardList size={48} color={Colors.neutral[300]} />
                  <Text style={styles.emptyText}>Không có yêu cầu nào</Text>
                </View>
              }
            />
          )}
        </View>
      </ScrollView>
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
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  statCard: {
    width: '23%',
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    ...Shadows.card,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  statLabel: {
    fontSize: 11,
    color: Colors.neutral[500],
    marginTop: 2,
    textAlign: 'center',
  },
  summaryCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    ...Shadows.card,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.accent[600],
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.neutral[200],
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral[800],
    marginBottom: 12,
  },
  sectionSubTitle: {
    marginTop: -6,
    marginBottom: 12,
    fontSize: 12,
    color: Colors.neutral[500],
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.neutral.white,
  },
  filterTabActive: {
    backgroundColor: Colors.accent[600],
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.neutral[600],
  },
  filterTabTextActive: {
    color: Colors.neutral.white,
  },
  loadingWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  assignCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    ...Shadows.card,
  },
  assignTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  assignSub: {
    marginTop: 2,
    fontSize: 12,
    color: Colors.neutral[500],
  },
  assignCollectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  assignCollectorChip: {
    flex: 1,
    minHeight: 36,
    borderRadius: 9,
    backgroundColor: Colors.accent[100],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  assignCollectorChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent[700],
  },
  reportCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    ...Shadows.card,
  },
  reportHeader: {
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
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reportTime: {
    fontSize: 13,
    color: Colors.neutral[500],
  },
  reportBody: {
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
  reportActions: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
    paddingTop: 12,
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
  },
  disabledActionBtn: {
    flex: 1,
    backgroundColor: Colors.neutral[200],
  },
  rejectBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[600],
  },
  acceptBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.accent[600],
    alignItems: 'center',
  },
  acceptBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral.white,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.neutral[500],
    marginTop: 12,
  },
});



