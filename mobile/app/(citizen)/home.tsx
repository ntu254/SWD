import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { useAppStore } from '@/store/useAppStore';
import { PointsCard } from '@/components/Citizen/PointsCard';
import { QuickActions } from '@/components/Citizen/QuickActions';
import { ReportCard } from '@/components/Citizen/ReportCard';
import { NearbyReportsMap } from '@/components/Citizen/NearbyReportsMap';
import type { WasteReport } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { fetchLeaderboard, fetchMyReports, fetchRewardBalance } from '@/components/api/backend';

export default function CitizenHomeScreen() {
  const router = useRouter();
  const { user, accessToken } = useAppStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const reportsQuery = useQuery({
    queryKey: ['reports', 'mine', user?.userId],
    queryFn: () => fetchMyReports(accessToken ?? ''),
    enabled: !!accessToken,
  });

  const balanceQuery = useQuery({
    queryKey: ['rewards', 'balance', user?.userId],
    queryFn: () => fetchRewardBalance(accessToken ?? ''),
    enabled: !!accessToken,
  });

  const leaderboardQuery = useQuery({
    queryKey: ['rewards', 'leaderboard', 'home'],
    queryFn: () => fetchLeaderboard(100),
  });

  const myReports = reportsQuery.data ?? [];
  const recentReports = myReports.slice(0, 3);

  const myRank = React.useMemo(() => {
    if (!user || !leaderboardQuery.data) {
      return 0;
    }

    const found = leaderboardQuery.data.findIndex((entry) => entry.userId === user.userId);
    return found >= 0 ? found + 1 : 0;
  }, [leaderboardQuery.data, user]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        reportsQuery.refetch(),
        balanceQuery.refetch(),
        leaderboardQuery.refetch(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [balanceQuery, leaderboardQuery, reportsQuery]);

  const handleReportPress = (report: WasteReport) => {
    console.log('Report pressed:', report.reportId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào,</Text>
          <Text style={styles.userName}>{user?.firstName || 'Người dùng'}</Text>
        </View>
        <View style={styles.notificationButton}>
          <Bell size={24} color={Colors.neutral[700]} />
          <View style={styles.notificationBadge} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <PointsCard
          points={balanceQuery.data ?? 0}
          rank={myRank || 1}
          reportsCount={myReports.length}
        />

        <QuickActions
          onReport={() => router.push('/(citizen)/report')}
          onMap={() => router.push('/(citizen)/history')}
          onHistory={() => router.push('/(citizen)/history')}
          onRewards={() => router.push('/(citizen)/leaderboard')}
        />

        <NearbyReportsMap
          reports={myReports}
          userLocation={{ latitude: 10.7758, longitude: 106.7 }}
        />

        <View style={styles.reportsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Báo cáo gần đây</Text>
            <Text style={styles.seeAll} onPress={() => router.push('/(citizen)/history')}>
              Xem tất cả
            </Text>
          </View>

          {recentReports.map((report) => (
            <ReportCard key={report.reportId} report={report} onPress={handleReportPress} />
          ))}

          {recentReports.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Chưa có báo cáo nào</Text>
              <Text style={styles.emptySubtext}>Bắt đầu báo cáo rác để tích điểm nhé!</Text>
            </View>
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
    paddingVertical: 12,
  },
  greeting: {
    fontSize: 14,
    color: Colors.neutral[500],
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.status.error,
  },
  reportsSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary[600],
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    marginHorizontal: 16,
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[600],
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.neutral[400],
  },
});
