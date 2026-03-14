import { fetchReports } from '@/components/api/backend';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { useAppStore } from '@/store/useAppStore';
import type { WasteReport } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Download, FileText } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type MonthlyReportStat = {
  label: string;
  reports: number;
  collected: number;
};

function monthLabel(date: Date) {
  return `T${date.getMonth() + 1}`;
}

function buildMonthlyStats(reports: WasteReport[]): MonthlyReportStat[] {
  const now = new Date();
  const months: MonthlyReportStat[] = [];

  for (let offset = 5; offset >= 0; offset -= 1) {
    const refDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    months.push({
      label: monthLabel(refDate),
      reports: 0,
      collected: 0,
    });
  }

  const monthMap = new Map<string, MonthlyReportStat>();
  months.forEach((item) => monthMap.set(item.label, item));

  for (const report of reports) {
    const date = new Date(report.createdAt);
    const label = monthLabel(date);
    const bucket = monthMap.get(label);
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

export default function EnterpriseReportsScreen() {
  const accessToken = useAppStore((state) => state.accessToken);

  const reportsQuery = useQuery({
    queryKey: ['enterprise', 'reports', 'all'],
    queryFn: () => fetchReports(accessToken ?? '', { size: 500 }),
    enabled: !!accessToken,
  });

  const reports = useMemo(() => reportsQuery.data ?? [], [reportsQuery.data]);

  const monthlyStats = useMemo(() => buildMonthlyStats(reports), [reports]);
  const latestMonth = monthlyStats[monthlyStats.length - 1] ?? {
    label: 'T0',
    reports: 0,
    collected: 0,
  };
  const monthlyEfficiency = latestMonth.reports
    ? Math.round((latestMonth.collected / latestMonth.reports) * 100)
    : 0;
  const maxCount = useMemo(
    () => Math.max(...monthlyStats.map((item) => item.reports), 1),
    [monthlyStats]
  );

  const availableReports = useMemo(() => {
    return [...monthlyStats].reverse().slice(0, 3);
  }, [monthlyStats]);

  if (reportsQuery.isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="small" color={Colors.accent[600]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Báo cáo & Thống kê</Text>
          <Text style={styles.subtitle}>Tổng hợp theo dữ liệu backend</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Tổng quan tháng này</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{latestMonth.reports}</Text>
              <Text style={styles.statLabel}>Tổng báo cáo</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{latestMonth.collected}</Text>
              <Text style={styles.statLabel}>Đã thu gom</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{monthlyEfficiency}%</Text>
              <Text style={styles.statLabel}>Hiệu suất</Text>
            </View>
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.cardTitle}>Xu hướng 6 tháng</Text>
            <Text style={styles.chartSubtitle}>Số lượng báo cáo theo tháng</Text>
          </View>

          <View style={styles.chartBody}>
            {monthlyStats.map((item) => {
              const barHeight = Math.max(12, Math.round((item.reports / maxCount) * 110));
              const isPeak = item.reports === maxCount;

              return (
                <View key={item.label} style={styles.barItem}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: barHeight,
                          backgroundColor: isPeak ? Colors.accent[600] : Colors.accent[400],
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barValue}>{item.reports}</Text>
                  <Text style={styles.barLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Báo cáo có sẵn</Text>

        {availableReports.map((report) => (
          <View key={report.label} style={styles.reportCard}>
            <View style={styles.reportIcon}>
              <FileText size={24} color={Colors.accent[600]} />
            </View>
            <View style={styles.reportInfo}>
              <Text style={styles.reportName}>Báo cáo tháng {report.label}</Text>
              <Text style={styles.reportDate}>
                Báo cáo: {report.reports} - Thu gom: {report.collected}
              </Text>
            </View>
            <View style={styles.downloadBtn}>
              <Download size={20} color={Colors.neutral.white} />
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
  },
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
  content: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Shadows.card,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral[800],
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.accent[600],
  },
  statLabel: {
    fontSize: 13,
    color: Colors.neutral[500],
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    ...Shadows.card,
  },
  chartHeader: {
    marginBottom: 12,
  },
  chartSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: Colors.neutral[500],
  },
  chartBody: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  barTrack: {
    width: 26,
    height: 120,
    borderRadius: 13,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 13,
  },
  barValue: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.neutral[700],
  },
  barLabel: {
    fontSize: 11,
    color: Colors.neutral[500],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral[800],
    marginBottom: 12,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Shadows.card,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: Colors.accent[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reportName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral[800],
  },
  reportDate: {
    fontSize: 13,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  downloadBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
});
