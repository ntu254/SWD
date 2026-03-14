import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TrendingUp, Users, ClipboardList, CheckCircle2,
  AlertCircle, Calendar
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { dashboardStats, monthlyStats } from '@/data/mockData';

const { width: _width } = Dimensions.get('window');

const StatCard = ({
  icon: Icon,
  value,
  label,
  color,
  trend
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  color: string;
  trend?: string;
}) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
      <Icon size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    {trend && (
      <View style={styles.trendBadge}>
        <TrendingUp size={12} color={Colors.status.success} />
        <Text style={styles.trendText}>{trend}</Text>
      </View>
    )}
  </View>
);

export default function AdminAnalyticsScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const stats = [
    {
      icon: ClipboardList,
      value: dashboardStats.totalReports.toLocaleString(),
      label: 'Tổng báo cáo',
      color: Colors.primary[600],
      trend: '+12%'
    },
    {
      icon: CheckCircle2,
      value: dashboardStats.collectedReports.toLocaleString(),
      label: 'Đã thu gom',
      color: Colors.status.success,
      trend: '+8%'
    },
    {
      icon: Users,
      value: dashboardStats.totalCitizens.toLocaleString(),
      label: 'NgườI dùng',
      color: Colors.secondary[600]
    },
    {
      icon: AlertCircle,
      value: dashboardStats.totalComplaints.toString(),
      label: 'Khiếu nại',
      color: Colors.status.error
    },
  ];

  const reportStatusData = [
    { label: 'Chờ duyệt', value: dashboardStats.pendingReports, color: Colors.status.pending },
    { label: 'Đã duyệt', value: dashboardStats.acceptedReports, color: Colors.status.info },
    { label: 'Đã gán', value: dashboardStats.assignedReports, color: Colors.accent[500] },
    { label: 'Đã thu gom', value: dashboardStats.collectedReports, color: Colors.status.success },
  ];

  const maxReports = Math.max(...monthlyStats.map(s => s.reports));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>System Analytics</Text>
          <Text style={styles.subtitle}>Tổng quan hệ thống</Text>
        </View>
        <View style={styles.dateBadge}>
          <Calendar size={16} color={Colors.neutral.white} />
          <Text style={styles.dateText}>T3 2024</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </View>

        {/* Report Status Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phân bố trạng thái</Text>
          <View style={styles.statusCard}>
            {reportStatusData.map((item, index) => (
              <View key={index} style={styles.statusItem}>
                <View style={styles.statusHeader}>
                  <View style={[styles.statusDot, { backgroundColor: item.color }]} />
                  <Text style={styles.statusLabel}>{item.label}</Text>
                </View>
                <Text style={styles.statusValue}>{item.value}</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: item.color,
                        width: `${(item.value / dashboardStats.totalReports) * 100}%`
                      }
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Monthly Trends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Xu hướng theo tháng</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Số báo cáo</Text>
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Colors.primary[500] }]} />
                  <Text style={styles.legendText}>Báo cáo</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Colors.status.success }]} />
                  <Text style={styles.legendText}>Thu gom</Text>
                </View>
              </View>
            </View>

            <View style={styles.chart}>
              {monthlyStats.map((stat, index) => (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${(stat.reports / maxReports) * 100}%`,
                          backgroundColor: Colors.primary[500],
                        }
                      ]}
                    />
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${(stat.collected / maxReports) * 100}%`,
                          backgroundColor: Colors.status.success,
                          marginLeft: 4,
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{stat.month}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thống kê nhanh</Text>
          <View style={styles.quickStatsGrid}>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>{dashboardStats.totalCollectors}</Text>
              <Text style={styles.quickStatLabel}>Collector</Text>
            </View>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>{dashboardStats.totalEnterprises}</Text>
              <Text style={styles.quickStatLabel}>Doanh nghiệp</Text>
            </View>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>{dashboardStats.todayCollected}</Text>
              <Text style={styles.quickStatLabel}>Thu gom hôm nay</Text>
            </View>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>{dashboardStats.todayWeight}kg</Text>
              <Text style={styles.quickStatLabel}>Khối lượng hôm nay</Text>
            </View>
          </View>
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
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E91E63',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral.white,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    ...Shadows.card,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  statLabel: {
    fontSize: 13,
    color: Colors.neutral[500],
    marginTop: 4,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.status.success,
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
  statusCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    ...Shadows.card,
  },
  statusItem: {
    marginBottom: 16,
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
    fontSize: 14,
    color: Colors.neutral[600],
  },
  statusValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.neutral[800],
    marginTop: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.neutral[200],
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  chartCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    ...Shadows.card,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[800],
  },
  legend: {
    flexDirection: 'row',
    gap: 12,
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
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickStatCard: {
    width: '47%',
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    ...Shadows.card,
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E91E63',
  },
  quickStatLabel: {
    fontSize: 13,
    color: Colors.neutral[500],
    marginTop: 4,
  },
});
