import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Trophy, Medal, Award } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import type { LeaderboardEntry } from '@/types';

interface LeaderboardItemProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

const rankIcons = [Trophy, Medal, Award];
const rankColors = [Colors.accent[500], Colors.neutral[400], Colors.accent[700]];

export const LeaderboardItem: React.FC<LeaderboardItemProps> = ({
  entry,
  isCurrentUser
}) => {
  const RankIcon = entry.rank <= 3 ? rankIcons[entry.rank - 1] : null;
  const rankColor = entry.rank <= 3 ? rankColors[entry.rank - 1] : Colors.neutral[500];

  return (
    <View style={[styles.container, isCurrentUser && styles.currentUserContainer]}>
      <View style={styles.rankContainer}>
        {RankIcon ? (
          <RankIcon size={24} color={rankColor} />
        ) : (
          <Text style={[styles.rankText, { color: rankColor }]}>#{entry.rank}</Text>
        )}
      </View>

      <Image
        source={{ uri: entry.avatarUrl }}
        style={styles.avatar}
      />

      <View style={styles.info}>
        <Text style={[styles.name, isCurrentUser && styles.currentUserName]}>
          {entry.displayName}
          {isCurrentUser && <Text style={styles.youBadge}> (Bạn)</Text>}
        </Text>
        <Text style={styles.area}>{entry.areaName}</Text>
      </View>

      <View style={styles.stats}>
        <Text style={styles.points}>{entry.points.toLocaleString()} điểm</Text>
        <Text style={styles.reports}>{entry.reportsCount} báo cáo</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    ...Shadows.soft,
  },
  currentUserContainer: {
    backgroundColor: Colors.primary[50],
    borderWidth: 2,
    borderColor: Colors.primary[300],
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginHorizontal: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral[800],
  },
  currentUserName: {
    color: Colors.primary[800],
  },
  youBadge: {
    fontSize: 12,
    color: Colors.primary[600],
    fontWeight: '500',
  },
  area: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  stats: {
    alignItems: 'flex-end',
  },
  points: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.accent[600],
  },
  reports: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginTop: 2,
  },
});
