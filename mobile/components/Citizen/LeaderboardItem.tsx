import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import type { LeaderboardEntry } from '@/types';

interface LeaderboardItemProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

function initialsOf(name: unknown) {
  const safeName = typeof name === 'string' ? name : '';
  const clean = safeName.trim();
  if (!clean) {
    return 'U';
  }

  const words = clean.split(/\s+/).slice(0, 2);
  return words.map((word) => word[0]?.toUpperCase() ?? '').join('') || 'U';
}

export const LeaderboardItem: React.FC<LeaderboardItemProps> = ({ entry, isCurrentUser }) => {
  const subtitle = entry.areaName || 'Toàn hệ thống';
  const displayName =
    typeof entry.displayName === 'string' && entry.displayName.trim().length > 0
      ? entry.displayName
      : 'Người dùng';
  const avatarUri =
    typeof entry.avatarUrl === 'string' && entry.avatarUrl.trim().length > 0
      ? entry.avatarUrl
      : '';
  const hasAvatar = avatarUri.length > 0;
  const avatarInitials = useMemo(() => initialsOf(displayName), [displayName]);

  return (
    <View style={[styles.container, isCurrentUser && styles.currentUserContainer]}>
      <View style={styles.rankColumn}>
        <Text style={[styles.rankText, isCurrentUser && styles.rankTextCurrent]}>#{entry.rank}</Text>
      </View>

      {hasAvatar ? (
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarFallbackText}>{avatarInitials}</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={[styles.name, isCurrentUser && styles.currentUserName]} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
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
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4ECE6',
    ...Shadows.card,
  },
  currentUserContainer: {
    backgroundColor: '#EAF8ED',
    borderColor: Colors.primary[300],
  },
  rankColumn: {
    width: 42,
    alignItems: 'flex-start',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.neutral[600],
  },
  rankTextCurrent: {
    color: Colors.primary[800],
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 10,
  },
  avatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 10,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary[800],
  },
  info: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  currentUserName: {
    color: Colors.primary[800],
  },
  subtitle: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginTop: 3,
  },
  stats: {
    alignItems: 'flex-end',
  },
  points: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.accent[700],
  },
  reports: {
    fontSize: 11,
    color: Colors.neutral[500],
    marginTop: 4,
  },
});
