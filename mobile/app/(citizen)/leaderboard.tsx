import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Crown, Trophy, Users } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { leaderboard } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';
import { LeaderboardItem } from '@/components/Citizen/LeaderboardItem';
import type { LeaderboardEntry } from '@/types';

type FilterType = 'GLOBAL' | 'AREA' | 'MONTHLY';

const filters: { key: FilterType; label: string }[] = [
  { key: 'GLOBAL', label: 'Toàn cầu' },
  { key: 'AREA', label: 'Khu vực' },
  { key: 'MONTHLY', label: 'Tháng này' },
];

export default function LeaderboardScreen() {
  const { user } = useAppStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('GLOBAL');

  const renderTopThree = () => {
    const topThree = leaderboard.slice(0, 3);

    return (
      <View style={styles.topThreeContainer}>
        {/* 2nd Place */}
        {topThree[1] && (
          <View style={styles.secondPlace}>
            <View style={[styles.podiumAvatar, { backgroundColor: Colors.neutral[300] }]}>
              <Text style={styles.podiumRank}>2</Text>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>{topThree[1].displayName}</Text>
            <Text style={styles.podiumPoints}>{topThree[1].points.toLocaleString()}</Text>
          </View>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <View style={styles.firstPlace}>
            <View style={styles.crownContainer}>
              <Crown size={24} color={Colors.accent[500]} />
            </View>
            <View style={[styles.podiumAvatar, { backgroundColor: Colors.accent[500], width: 72, height: 72 }]}>
              <Text style={[styles.podiumRank, { fontSize: 28 }]}>1</Text>
            </View>
            <Text style={[styles.podiumName, { fontSize: 16 }]} numberOfLines={1}>{topThree[0].displayName}</Text>
            <Text style={[styles.podiumPoints, { color: Colors.accent[600], fontSize: 16 }]}>{topThree[0].points.toLocaleString()}</Text>
          </View>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <View style={styles.thirdPlace}>
            <View style={[styles.podiumAvatar, { backgroundColor: Colors.accent[700] }]}>
              <Text style={styles.podiumRank}>3</Text>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>{topThree[2].displayName}</Text>
            <Text style={styles.podiumPoints}>{topThree[2].points.toLocaleString()}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderItem = ({ item }: { item: LeaderboardEntry }) => (
    <LeaderboardItem
      entry={item}
      isCurrentUser={item.userId === user?.userId}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Trophy size={28} color={Colors.accent[500]} />
          <Text style={styles.title}>Bảng xếp hạng</Text>
        </View>
        <View style={styles.participantsBadge}>
          <Users size={16} color={Colors.neutral[600]} />
          <Text style={styles.participantsText}>3,500+ người</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        {filters.map((filter) => (
          <View
            key={filter.key}
            style={[
              styles.filterChip,
              activeFilter === filter.key && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter.key && styles.filterTextActive,
              ]}
              onPress={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Top 3 Podium */}
      {renderTopThree()}

      {/* Rest of Leaderboard */}
      <FlatList
        data={leaderboard.slice(3)}
        keyExtractor={(item) => item.userId}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  participantsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  participantsText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.neutral[600],
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.neutral.white,
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: Colors.primary[600],
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[600],
  },
  filterTextActive: {
    color: Colors.neutral.white,
  },
  topThreeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
  },
  firstPlace: {
    alignItems: 'center',
  },
  secondPlace: {
    alignItems: 'center',
    marginBottom: 20,
  },
  thirdPlace: {
    alignItems: 'center',
    marginBottom: 20,
  },
  crownContainer: {
    marginBottom: 4,
  },
  podiumAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  podiumRank: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.neutral.white,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[800],
    maxWidth: 100,
    textAlign: 'center',
  },
  podiumPoints: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral[500],
    marginTop: 2,
  },
  listContent: {
    paddingBottom: 24,
  },
});
