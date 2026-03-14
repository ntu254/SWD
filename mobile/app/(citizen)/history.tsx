import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';
import { ReportCard } from '@/components/Citizen/ReportCard';
import type { WasteReport, ReportStatus } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { fetchMyReports } from '@/components/api/backend';

type FilterType = 'ALL' | ReportStatus;

const filters: { key: FilterType; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ duyệt' },
  { key: 'ACCEPTED', label: 'Đã duyệt' },
  { key: 'ASSIGNED', label: 'Đã gán' },
  { key: 'ON_THE_WAY', label: 'Đang đến' },
  { key: 'COLLECTED', label: 'Đã thu gom' },
  { key: 'REJECTED', label: 'Từ chối' },
];

const summaryCards = [
  { key: 'pending', label: 'Chờ duyệt', color: Colors.status.pending },
  { key: 'processing', label: 'Đang xử lý', color: Colors.secondary[600] },
  { key: 'completed', label: 'Đã thu gom', color: Colors.status.success },
  { key: 'rejected', label: 'Từ chối', color: Colors.status.error },
] as const;

export default function HistoryScreen() {
  const { user, accessToken } = useAppStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const reportsQuery = useQuery({
    queryKey: ['reports', 'mine', 'history', user?.userId],
    queryFn: () => fetchMyReports(accessToken ?? ''),
    enabled: !!accessToken,
  });

  const myReports = useMemo(() => reportsQuery.data ?? [], [reportsQuery.data]);

  const counts = useMemo(() => {
    const pending = myReports.filter((item) => item.status === 'PENDING').length;
    const processing = myReports.filter((item) =>
      ['ACCEPTED', 'ASSIGNED', 'ON_THE_WAY'].includes(item.status)
    ).length;
    const completed = myReports.filter((item) => item.status === 'COLLECTED').length;
    const rejected = myReports.filter((item) => item.status === 'REJECTED').length;

    return { pending, processing, completed, rejected };
  }, [myReports]);

  const filteredReports = activeFilter === 'ALL'
    ? myReports
    : myReports.filter((report) => report.status === activeFilter);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reportsQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [reportsQuery]);

  const handleReportPress = useCallback((report: WasteReport) => {
    console.log('Report pressed:', report.reportId);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: WasteReport }) => <ReportCard report={item} onPress={handleReportPress} />,
    [handleReportPress]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Theo dõi trạng thái</Text>
        <Text style={styles.subtitle}>{myReports.length} báo cáo</Text>
      </View>

      <View style={styles.summaryContainer}>
        {summaryCards.map((card) => {
          const value = counts[card.key];

          return (
            <View key={card.key} style={styles.summaryCard}>
              <View style={[styles.summaryDot, { backgroundColor: card.color }]} />
              <Text style={styles.summaryValue}>{value}</Text>
              <Text style={styles.summaryLabel}>{card.label}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <View
              style={[
                styles.filterChip,
                activeFilter === item.key && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === item.key && styles.filterTextActive,
                ]}
                onPress={() => setActiveFilter(item.key)}
              >
                {item.label}
              </Text>
            </View>
          )}
        />
      </View>

      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.reportId}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Không có báo cáo nào</Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === 'ALL'
                ? 'Bạn chưa có báo cáo nào. Hãy bắt đầu báo cáo rác.'
                : 'Không có báo cáo nào với trạng thái này.'}
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  subtitle: {
    fontSize: 14,
    color: Colors.neutral[500],
    marginTop: 4,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.neutral[600],
    marginTop: 2,
    textAlign: 'center',
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutral.white,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  filterChipActive: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[600],
  },
  filterTextActive: {
    color: Colors.neutral.white,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    marginHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral[600],
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.neutral[400],
    textAlign: 'center',
  },
});
