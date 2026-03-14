import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Trophy, TrendingUp, Award } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface PointsCardProps {
  points: number;
  rank: number;
  reportsCount: number;
}

export const PointsCard: React.FC<PointsCardProps> = ({ points, rank, reportsCount }) => {
  return (
    <Animated.View entering={FadeInDown.delay(100)} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Trophy size={24} color={Colors.accent[500]} />
        </View>
        <Text style={styles.title}>Điểm thưởng của bạn</Text>
      </View>

      <View style={styles.pointsRow}>
        <Text style={styles.pointsValue}>{points.toLocaleString()}</Text>
        <Text style={styles.pointsLabel}>điểm</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: Colors.secondary[100] }]}>
            <TrendingUp size={16} color={Colors.secondary[700]} />
          </View>
          <View>
            <Text style={styles.statValue}>#{rank}</Text>
            <Text style={styles.statLabel}>Xếp hạng</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: Colors.primary[100] }]}>
            <Award size={16} color={Colors.primary[700]} />
          </View>
          <View>
            <Text style={styles.statValue}>{reportsCount}</Text>
            <Text style={styles.statLabel}>Báo cáo</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.accent[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[700],
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  pointsValue: {
    fontSize: 42,
    fontWeight: '700',
    color: Colors.primary[800],
    marginRight: 8,
  },
  pointsLabel: {
    fontSize: 18,
    color: Colors.neutral[500],
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.neutral[200],
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  statLabel: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginTop: 2,
  },
});
