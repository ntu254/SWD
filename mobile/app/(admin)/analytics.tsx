import {
  fetchAdminDashboard,
  fetchReports,
} from '@/components/api/backend';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { useAppStore } from '@/store/useAppStore';
import type { WasteReport } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Filter,
  TrendingUp,
  Users,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ADMIN_COLOR = Colors.status.error;

type MonthlyStats = {
  month: string;
  reports: number;
  collected: number;
};

const StatCard = ({
  icon: Icon,
  value,
  label,
  color,
  trend,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  color: string;
  trend?: string;
}) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
      <Icon size={22} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    {trend ? (
      <View style={styles.trendRow}>
        <TrendingUp size={12} color={Colors.status.success} />
        <Text style={styles.trendText}>{trend}</Text>
      </View>
    ) : null}
  </View>
);

function monthLabel(date: Date) {
  return `T${date.getMonth() + 1}`;
}

function buildMonthlyStats(reports: WasteReport[]): MonthlyStats[] {
  const now = new Date();
  const months: MonthlyStats[] = [];

  for (let offset = 5; offset >= 0; offset -= 1) {
    const refDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    months.push({
      month: monthLabel(refDate),
      reports: 0,
      collected: 0,
    });
  }

  const monthMap = new Map<string, MonthlyStats>();
  months.forEach((item) => monthMap.set(item.month, item));

  for (const report of reports) {
    const bucket = monthMap.get(monthLabel(new Date(report.createdAt)));
    if (!bucket) {
      continue;
    }
    bucket.reports += 1;
    if (report.status === 'COLLECTED') {
      bucket.collected += 1;
    }
  }

  return months;
}

export default function AdminAnalyticsScreen() {
  const queryClient = useQueryClient();
  const accessToken = useAppStore((state) => state.accessToken);
  const [refreshing, setRefreshing] = useState(false);

  const dashboardQuery = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => fetchAdminDashboard(accessToken ?? ''),
    enabled: !!accessToken,
  });

  const reportsQuery = useQuery({
    queryKey: ['admin', 'reports', 'all'],
    queryFn: () => fetchReports(accessToken ?? '', { size: 500 }),
    enabled: !!accessToken,
  });

  const dashboard = dashboardQuery.data;
  const reports = useMemo(() => reportsQuery.data ?? [], [reportsQuery.data]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] }),
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] }),
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
    ]);
    setRefreshing(false);
  }, [queryClient]);

  const monthlyStats = useMemo(() => buildMonthlyStats(reports), [reports]);
  const maxReports = useMemo(
    () => Math.max(...monthlyStats.map((item) => item.reports), 1),
    [monthlyStats]
  );

  const reportStatusData = useMemo(() => {
    let pending = 0;
    let accepted = 0;
    let assigned = 0;
    let collected = 0;

    for (const report of reports) {
      switch (report.status) {
        case 'PENDING':
          pending += 1;
          break;
        case 'ACCEPTED':
          accepted += 1;
          break;
        case 'ASSIGNED':
        case 'ON_THE_WAY':
          assigned += 1;
          break;
        case 'COLLECTED':
          collected += 1;
          break;
        default:
          break;
      }
    }

    if (reports.length === 0 && dashboard) {
      pending = dashboard.pendingReports;
      assigned = dashboard.activeTasks;
      collected = Math.max(dashboard.totalReports - dashboard.pendingReports - dashboard.activeTasks, 0);
    }

    return [
      { label: 'Chờ duyệt', value: pending, color: Colors.status.pending },
      { label: 'Đã duyệt', value: accepted, color: Colors.status.info },
      { label: 'Đang xử lý', value: assigned, color: Colors.accent[500] },
      { label: 'Đã thu gom', value: collected, color: Colors.status.success },
    ];
  }, [dashboard, reports]);

  const stats = useMemo(() => {
    const totalReports = dashboard?.totalReports ?? reports.length;
    const collected = reportStatusData.find((item) => item.label === 'Đã thu gom')?.value ?? 0;
    const totalUsers = dashboard?.totalUsers ?? 0;
    const openComplaints = dashboard?.openComplaints ?? 0;
    const collectedTrend = totalReports > 0 ? `+${Math.round((collected / totalReports) * 100)}%` : '+0%';

    return [
      {
        icon: ClipboardList,
        value: totalReports.toLocaleString(),
        label: 'Tổng báo cáo',
        color: Colors.primary[600],
        trend: '+12%',
      },
      {
        icon: CheckCircle2,
        value: collected.toLocaleString(),
        label: 'Đã thu gom',
        color: Colors.status.success,
        trend: collectedTrend,
      },
      {
        icon: Users,
        value: totalUsers.toLocaleString(),
        label: 'Người dùng',
        color: Colors.secondary[600],
      },
      {
        icon: AlertCircle,
        value: openComplaints.toString(),
        label: 'Khiếu nại mở',
        color: Colors.status.error,
      },
    ];
  }, [dashboard, reportStatusData, reports.length]);

  const todayEfficiency = useMemo(() => {
    const totalReports = dashboard?.totalReports ?? reports.length;
    const collected = reportStatusData.find((item) => item.label === 'Đã thu gom')?.value ?? 0;
    return totalReports > 0 ? Math.round((collected / totalReports) * 100) : 0;
  }, [dashboard?.totalReports, reportStatusData, reports.length]);

  const isLoading = dashboardQuery.isLoading || reportsQuery.isLoading;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Dashboard</Text>
          <Text style={styles.subtitle}>Trung tâm quản trị hệ thống</Text>
        </View>
        <TouchableOpacity style={styles.filterButton} activeOpacity={0.8}>
          <Filter size={20} color={Colors.neutral.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={ADMIN_COLOR} />
          </View>
        ) : (
          <>
            <View style={styles.statsGrid}>
              {stats.map((stat) => (
                <StatCard
                  key={stat.label}
                  icon={stat.icon}
                  value={stat.value}
                  label={stat.label}
                  color={stat.color}
                  trend={stat.trend}
                />
              ))}
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <TrendingUp size={20} color={ADMIN_COLOR} />
                <Text style={styles.summaryTitle}>Tóm tắt hệ thống hôm nay</Text>
              </View>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                    {(dashboard?.activeTasks ?? 0).toLocaleString()}
                  </Text>
                  <Text style={styles.summaryLabel}>Task đang xử lý</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{todayEfficiency}%</Text>
                  <Text style={styles.summaryLabel}>Hiệu suất</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                    {(dashboard?.totalRewardPointsIssued ?? 0).toLocaleString()}
                  </Text>
                  <Text style={styles.summaryLabel}>Điểm đã cấp</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Phân bố trạng thái</Text>
              <View style={styles.card}>
                {reportStatusData.map((item, index) => {
                  const totalReports = Math.max(dashboard?.totalReports ?? reports.length, 1);
                  const ratio = Math.round((item.value / totalReports) * 100);
                  return (
                    <View
                      key={item.label}
                      style={[styles.statusItem, index === reportStatusData.length - 1 && styles.statusItemLast]}
                    >
                      <View style={styles.statusTopRow}>
                        <View style={styles.statusHeader}>
                          <View style={[styles.statusDot, { backgroundColor: item.color }]} />
                          <Text style={styles.statusLabel}>{item.label}</Text>
                        </View>
                        <View style={styles.statusMeta}>
                          <Text style={styles.statusValue}>{item.value}</Text>
                          <Text style={styles.statusPercent}>{ratio}%</Text>
                        </View>
                      </View>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              backgroundColor: item.color,
                              width: `${ratio}%`,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Xu hướng theo tháng</Text>
              <View style={styles.card}>
                <View style={styles.chartLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.primary[500] }]} />
                    <Text style={styles.legendText}>Báo cáo</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.status.success }]} />
                    <Text style={styles.legendText}>Thu gom</Text>
                  </View>
                </View>
                <View style={styles.chart}>
                  {monthlyStats.map((stat) => (
                    <View key={stat.month} style={styles.barContainer}>
                      <View style={styles.barWrapper}>
                        <View
                          style={[
                            styles.bar,
                            {
                              height: `${(stat.reports / maxReports) * 100}%`,
                              backgroundColor: Colors.primary[500],
                            },
                          ]}
                        />
                        <View
                          style={[
                            styles.bar,
                            {
                              height: `${(stat.collected / maxReports) * 100}%`,
                              backgroundColor: Colors.status.success,
                              marginLeft: 4,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.barLabel}>{stat.month}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </>
        )}
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
    backgroundColor: ADMIN_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  statsGrid: {
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
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.status.success,
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
    color: ADMIN_COLOR,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginTop: 4,
    textAlign: 'center',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral[800],
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    ...Shadows.card,
  },
  statusItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  statusItemLast: {
    borderBottomWidth: 0,
    paddingBottom: 4,
  },
  statusTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral[700],
  },
  statusMeta: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  statusPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral[500],
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.neutral[200],
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    minWidth: 10,
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: Colors.neutral[500],
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    paddingTop: 20,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
  },
  bar: {
    width: 12,
    borderRadius: 6,
  },
  barLabel: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginTop: 8,
  },
});
