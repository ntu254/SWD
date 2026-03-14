import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { useAppStore } from '@/store/useAppStore';
import { wasteReports } from '@/data/mockData';
import { PointsCard } from '@/components/Citizen/PointsCard';
import { QuickActions } from '@/components/Citizen/QuickActions';
import { ReportCard } from '@/components/Citizen/ReportCard';
import { NearbyReportsMap } from '@/components/Citizen/NearbyReportsMap';
import type { WasteReport } from '@/types';

export default function CitizenHomeScreen() {
  const router = useRouter();
  const { user, points } = useAppStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const myReports = wasteReports.filter(r => r.reporterUserId === user?.userId);
  const recentReports = myReports.slice(0, 3);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleReportPress = (report: WasteReport) => {
    console.log('Report pressed:', report.reportId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào,</Text>
          <Text style={styles.userName}>{user?.firstName || 'NgườI dùng'}</Text>
        </View>
        <View style={styles.notificationButton}>
          <Bell size={24} color={Colors.neutral[700]} />
          <View style={styles.notificationBadge} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <PointsCard
          points={points || 9800}
          rank={3}
          reportsCount={myReports.length}
        />

        <QuickActions
          onReport={() => router.push('/(citizen)/report')}
          onMap={() => router.push('/(citizen)/history')}
          onHistory={() => router.push('/(citizen)/history')}
          onRewards={() => router.push('/(citizen)/leaderboard')}
        />

        <NearbyReportsMap
          reports={wasteReports}
          userLocation={{ latitude: 10.7758, longitude: 106.7000 }}
        />

        <View style={styles.reportsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Báo cáo gần đây</Text>
            <Text
              style={styles.seeAll}
              onPress={() => router.push('/(citizen)/history')}
            >
              Xem tất cả
            </Text>
          </View>

          {recentReports.map((report) => (
            <ReportCard
              key={report.reportId}
              report={report}
              onPress={handleReportPress}
            />
          ))}

          {recentReports.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Chưa có báo cáo nào</Text>
              <Text style={styles.emptySubtext}>Bắt đầu báo cáo rác để nhận điểm thưởng!</Text>
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
