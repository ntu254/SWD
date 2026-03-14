import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, Target, TrendingUp, Calendar, CheckCircle2, Clock } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { collectorKpis } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';

const { width: _width } = Dimensions.get('window');

const CircularProgress = ({
  value,
  max,
  size = 120,
  strokeWidth = 10,
  color = Colors.primary[600],
  label
}: {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label: string;
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const _strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={[styles.progressContainer, { width: size }]}>
      <View style={{ width: size, height: size }}>
        <View style={[styles.circleBackground, { width: size, height: size, borderRadius: size / 2 }]} />
        <View
          style={[
            styles.circleProgress,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              transform: [{ rotate: '-90deg' }],
            }
          ]}
        />
        <View style={styles.circleContent}>
          <Text style={styles.progressValue}>{Math.round(percentage)}%</Text>
          <Text style={styles.progressLabel}>{label}</Text>
        </View>
      </View>
      <Text style={styles.progressDetail}>{value}/{max}</Text>
    </View>
  );
};

export default function KpiScreen() {
  const { user } = useAppStore();
  const myKpis = collectorKpis.filter(k => k.collectorUserId === user?.userId);

  const todayKpi = myKpis[0] || {
    actualVisits: 4,
    minVisits: 5,
    actualWeightKg: 42,
    minWeightKg: 50,
    status: 'PENDING'
  };

  const weeklyStats = {
    completed: 24,
    target: 25,
    weight: 1250,
    bonus: 1500,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Hiệu suất làm việc</Text>
        <Text style={styles.subtitle}>Theo dõi KPI và điểm thưởng</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Today's Progress */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={Colors.primary[600]} />
            <Text style={styles.sectionTitle}>Hôm nay</Text>
          </View>

          <View style={styles.progressRow}>
            <CircularProgress
              value={todayKpi.actualVisits}
              max={todayKpi.minVisits}
              label="Chuyến"
              color={Colors.primary[600]}
            />
            <CircularProgress
              value={todayKpi.actualWeightKg}
              max={todayKpi.minWeightKg}
              label="Kg"
              color={Colors.secondary[600]}
            />
          </View>
        </View>

        {/* Weekly Stats */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color={Colors.accent[600]} />
            <Text style={styles.sectionTitle}>Tuần này</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: Colors.primary[100] }]}>
                <CheckCircle2 size={20} color={Colors.primary[600]} />
              </View>
              <Text style={styles.statValue}>{weeklyStats.completed}</Text>
              <Text style={styles.statLabel}>Chuyến hoàn thành</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: Colors.accent[100] }]}>
                <Target size={20} color={Colors.accent[600]} />
              </View>
              <Text style={styles.statValue}>{weeklyStats.target}</Text>
              <Text style={styles.statLabel}>Mục tiêu</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: Colors.secondary[100] }]}>
                <Trophy size={20} color={Colors.secondary[600]} />
              </View>
              <Text style={styles.statValue}>{weeklyStats.bonus.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Điểm thưởng</Text>
            </View>
          </View>
        </View>

        {/* KPI History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color={Colors.neutral[600]} />
            <Text style={styles.sectionTitle}>Lịch sử KPI</Text>
          </View>

          {myKpis.map((kpi) => (
            <View key={kpi.kpiId} style={styles.kpiItem}>
              <View style={styles.kpiDate}>
                <Text style={styles.kpiDateDay}>
                  {new Date(kpi.kpiDate).getDate()}
                </Text>
                <Text style={styles.kpiDateMonth}>
                  T{new Date(kpi.kpiDate).getMonth() + 1}
                </Text>
              </View>

              <View style={styles.kpiContent}>
                <View style={styles.kpiRow}>
                  <Text style={styles.kpiLabel}>Chuyến thu gom:</Text>
                  <Text style={styles.kpiValue}>{kpi.actualVisits}/{kpi.minVisits}</Text>
                </View>
                <View style={styles.kpiRow}>
                  <Text style={styles.kpiLabel}>Khối lượng:</Text>
                  <Text style={styles.kpiValue}>{kpi.actualWeightKg}kg/{kpi.minWeightKg}kg</Text>
                </View>
              </View>

              <View style={[
                styles.kpiStatus,
                { backgroundColor: kpi.status === 'MET' ? Colors.status.success + '20' : Colors.status.pending + '20' }
              ]}>
                {kpi.status === 'MET' ? (
                  <CheckCircle2 size={20} color={Colors.status.success} />
                ) : (
                  <Clock size={20} color={Colors.status.pending} />
                )}
              </View>
            </View>
          ))}
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
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    ...Shadows.card,
  },
  progressContainer: {
    alignItems: 'center',
  },
  circleBackground: {
    backgroundColor: Colors.neutral[100],
  },
  circleProgress: {
    borderColor: Colors.primary[600],
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    transform: [{ rotate: '-90deg' }],
  },
  circleContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.neutral[500],
  },
  progressDetail: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[600],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...Shadows.card,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  statLabel: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginTop: 4,
    textAlign: 'center',
  },
  kpiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Shadows.soft,
  },
  kpiDate: {
    alignItems: 'center',
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: Colors.neutral[200],
  },
  kpiDateDay: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  kpiDateMonth: {
    fontSize: 12,
    color: Colors.neutral[500],
  },
  kpiContent: {
    flex: 1,
    marginLeft: 16,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 13,
    color: Colors.neutral[500],
  },
  kpiValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral[800],
  },
  kpiStatus: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});
