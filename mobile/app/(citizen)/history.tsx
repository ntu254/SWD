import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { wasteReports } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';
import { ReportCard } from '@/components/Citizen/ReportCard';
import type { WasteReport, ReportStatus } from '@/types';

type FilterType = 'ALL' | ReportStatus;

const filters: { key: FilterType; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ duyệt' },
  { key: 'ACCEPTED', label: 'Đã duyệt' },
  { key: 'ASSIGNED', label: 'Đã gán' },
  { key: 'COLLECTED', label: 'Đã thu gom' },
];

export default function HistoryScreen() {
  const _router = useRouter();
  const { user } = useAppStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const myReports = wasteReports.filter(r => r.reporterUserId === user?.userId);

  const filteredReports = activeFilter === 'ALL'
    ? myReports
    : myReports.filter(r => r.status === activeFilter);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleReportPress = useCallback((report: WasteReport) => {
    console.log('Report pressed:', report.reportId);
  }, []);

  const renderItem = useCallback(({ item }: { item: WasteReport }) => (
    <ReportCard report={item} onPress={handleReportPress} />
  ), [handleReportPress]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Lịch sử báo cáo</Text>
        <Text style={styles.subtitle}>{myReports.length} báo cáo</Text>
      </View>

      {/* Filters */}
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

      {/* Reports List */}
      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.reportId}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Không có báo cáo nào</Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === 'ALL'
                ? 'Bạn chưa có báo cáo nào. Hãy bắt đầu báo cáo rác!'
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
    paddingVertical: 16,
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
  filterContainer: {
    marginBottom: 8,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
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
