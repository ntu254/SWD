import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ClipboardList, CheckCircle2, Clock, AlertCircle,
  MapPin, Filter, TrendingUp
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { wasteReports, tasks } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';
import type { WasteReport, ReportStatus } from '@/types';

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

export default function EnterpriseDashboardScreen() {
  const { user } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED'>('ALL');

  const myTasks = tasks.filter(t => t.enterpriseUserId === user?.userId);
  const pendingReports = wasteReports.filter(r => r.status === 'PENDING');

  const filteredReports = activeFilter === 'ALL'
    ? pendingReports
    : pendingReports.filter(r => r.status === activeFilter);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const stats = [
    { label: 'Chờ duyệt', value: pendingReports.length, color: Colors.status.pending, icon: Clock },
    { label: 'Đang xử lý', value: myTasks.filter(t => t.status === 'IN_PROGRESS').length, color: Colors.secondary[500], icon: ClipboardList },
    { label: 'Hoàn thành', value: myTasks.filter(t => t.status === 'COMPLETED').length, color: Colors.status.success, icon: CheckCircle2 },
    { label: 'Cảnh báo', value: 2, color: Colors.status.error, icon: AlertCircle },
  ];

  const renderReportItem = ({ item }: { item: WasteReport }) => (
    <TouchableOpacity style={styles.reportCard} activeOpacity={0.8}>
      <View style={styles.reportHeader}>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColors[item.status] }]} />
          <Text style={[styles.statusText, { color: statusColors[item.status] }]}>
            {statusLabels[item.status]}
          </Text>
        </View>
        <Text style={styles.reportTime}>
          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
        </Text>
      </View>

      <View style={styles.reportBody}>
        <Text style={styles.wasteType}>{item.wasteTypeName}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

        <View style={styles.locationRow}>
          <MapPin size={14} color={Colors.neutral[500]} />
          <Text style={styles.locationText}>{item.areaName}</Text>
        </View>
      </View>

      <View style={styles.reportActions}>
        <TouchableOpacity style={styles.rejectBtn}>
          <Text style={styles.rejectBtnText}>Từ chối</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptBtn}>
          <Text style={styles.acceptBtnText}>Tiếp nhận</Text>
        </TouchableOpacity>
      </View>
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
        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <View key={index} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                  <Icon size={20} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            );
          })}
        </View>

        {/* Quick Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <TrendingUp size={20} color={Colors.accent[600]} />
            <Text style={styles.summaryTitle}>Tóm tắt hôm nay</Text>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>1,250 kg</Text>
              <Text style={styles.summaryLabel}>Đã thu gom</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>85%</Text>
              <Text style={styles.summaryLabel}>Hiệu suất</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>12</Text>
              <Text style={styles.summaryLabel}>Chuyến đi</Text>
            </View>
          </View>
        </View>

        {/* Pending Reports */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Yêu cầu chờ duyệt</Text>
            <View style={styles.filterTabs}>
              {['ALL', 'PENDING', 'ACCEPTED'].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterTab, activeFilter === filter && styles.filterTabActive]}
                  onPress={() => setActiveFilter(filter as any)}
                >
                  <Text style={[styles.filterTabText, activeFilter === filter && styles.filterTabTextActive]}>
                    {filter === 'ALL' ? 'Tất cả' : filter === 'PENDING' ? 'Chờ' : 'Đã duyệt'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

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
  listContent: {
    gap: 12,
    paddingBottom: 24,
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

