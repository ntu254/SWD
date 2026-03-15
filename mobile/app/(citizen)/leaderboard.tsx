import React, { useMemo, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Crown, Gift, Trophy, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { useAppStore } from '@/store/useAppStore';
import { LeaderboardItem } from '@/components/Citizen/LeaderboardItem';
import type { LeaderboardEntry } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchLeaderboard,
  fetchRewardBalance,
  fetchRewardItems,
  redeemRewardItem,
} from '@/components/api/backend';

type TabType = 'LEADERBOARD' | 'REDEEM';
type PodiumPlace = 1 | 2 | 3;

const tabs: { key: TabType; label: string }[] = [
  { key: 'LEADERBOARD', label: 'Bảng xếp hạng' },
  { key: 'REDEEM', label: 'Đổi quà' },
];

const podiumStyles: Record<PodiumPlace, { size: number; colors: [string, string]; lift: number }> = {
  1: { size: 108, colors: [Colors.accent[700], Colors.accent[400]], lift: 0 },
  2: { size: 84, colors: ['#CFD5DC', '#AEB6C2'], lift: 20 },
  3: { size: 84, colors: ['#D38B4C', '#B86A2D'], lift: 20 },
};

function getPodiumEntry(leaderboard: LeaderboardEntry[], rank: PodiumPlace) {
  return leaderboard.find((entry) => entry.rank === rank);
}

function PodiumUser({
  place,
  entry,
}: {
  place: PodiumPlace;
  entry?: LeaderboardEntry;
}) {
  const config = podiumStyles[place];
  const isFirst = place === 1;
  const displayName =
    typeof entry?.displayName === 'string' && entry.displayName.trim().length > 0
      ? entry.displayName
      : 'Người dùng';
  const points = Number(entry?.points ?? 0);

  if (!entry) {
    return (
      <View style={[styles.podiumColumn, { marginTop: config.lift }]}>
        <View style={[styles.podiumCirclePlaceholder, { width: config.size, height: config.size, borderRadius: config.size / 2 }]} />
      </View>
    );
  }

  return (
    <View style={[styles.podiumColumn, { marginTop: config.lift }]}>
      {isFirst && (
        <View style={styles.crownBadge}>
          <Crown size={20} color={Colors.accent[600]} />
        </View>
      )}

      <LinearGradient
        colors={config.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.podiumCircle,
          {
            width: config.size,
            height: config.size,
            borderRadius: config.size / 2,
          },
        ]}
      >
        <Text style={[styles.podiumRank, isFirst && styles.podiumRankFirst]}>{place}</Text>
      </LinearGradient>

      <Text style={[styles.podiumName, isFirst && styles.podiumNameFirst]} numberOfLines={1}>
        {displayName}
      </Text>
      <Text style={[styles.podiumPoints, isFirst && styles.podiumPointsFirst]}>
        {points.toLocaleString()} điểm
      </Text>
    </View>
  );
}

export default function LeaderboardScreen() {
  const { user, accessToken } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('LEADERBOARD');
  const queryClient = useQueryClient();

  const leaderboardQuery = useQuery({
    queryKey: ['rewards', 'leaderboard'],
    queryFn: () => fetchLeaderboard(100, accessToken),
    enabled: !!accessToken,
  });

  const balanceQuery = useQuery({
    queryKey: ['rewards', 'balance', user?.userId, 'leaderboard'],
    queryFn: () => fetchRewardBalance(accessToken ?? ''),
    enabled: !!accessToken,
  });

  const rewardItemsQuery = useQuery({
    queryKey: ['rewards', 'items'],
    queryFn: () => fetchRewardItems(accessToken),
    enabled: !!accessToken,
  });

  const leaderboard = useMemo(() => leaderboardQuery.data ?? [], [leaderboardQuery.data]);
  const rewardItems = useMemo(() => rewardItemsQuery.data ?? [], [rewardItemsQuery.data]);
  const myPoints = balanceQuery.data ?? 0;

  const first = useMemo(() => getPodiumEntry(leaderboard, 1), [leaderboard]);
  const second = useMemo(() => getPodiumEntry(leaderboard, 2), [leaderboard]);
  const third = useMemo(() => getPodiumEntry(leaderboard, 3), [leaderboard]);

  const rankingList = useMemo(
    () => leaderboard.filter((entry) => entry.rank >= 4).sort((a, b) => a.rank - b.rank),
    [leaderboard]
  );

  const redeemMutation = useMutation({
    mutationFn: async (item: { itemId: string; name: string }) => {
      await redeemRewardItem(item.itemId, accessToken);
      return item;
    },
    onSuccess: async (item) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['rewards', 'balance'] }),
        queryClient.invalidateQueries({ queryKey: ['rewards', 'leaderboard'] }),
        queryClient.invalidateQueries({ queryKey: ['rewards', 'items'] }),
        queryClient.invalidateQueries({ queryKey: ['rewards', 'transactions'] }),
      ]);
      Alert.alert('Thành công', `Đổi quà "${item.name}" thành công.`);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Không thể đổi quà lúc này';
      Alert.alert('Đổi quà thất bại', message);
    },
  });

  const renderLeaderboardItem = useCallback(
    ({ item }: { item: LeaderboardEntry }) => (
      <LeaderboardItem entry={item} isCurrentUser={item.userId === user?.userId} />
    ),
    [user?.userId]
  );

  const leaderboardHeader = (
    <View>
      <LinearGradient
        colors={['#EAF7ED', '#F8FCF9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.podiumCard}
      >
        <View style={styles.podiumWrap}>
          <PodiumUser place={2} entry={second} />
          <PodiumUser place={1} entry={first} />
          <PodiumUser place={3} entry={third} />
        </View>
      </LinearGradient>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Xếp hạng cộng đồng</Text>
        <Text style={styles.sectionSubtitle}>Bắt đầu từ hạng #4</Text>
      </View>
    </View>
  );

  const renderRedeemSection = () => (
    <View style={styles.redeemSection}>
      <View style={styles.redeemHeader}>
        <View style={styles.redeemHeaderTitle}>
          <Gift size={18} color={Colors.accent[700]} />
          <Text style={styles.redeemTitle}>Đổi quà</Text>
        </View>
        <Text style={styles.redeemPoints}>{myPoints.toLocaleString()} điểm</Text>
      </View>

      {rewardItemsQuery.isLoading ? (
        <View style={styles.redeemLoading}>
          <ActivityIndicator size="small" color={Colors.primary[600]} />
        </View>
      ) : rewardItems.length === 0 ? (
        <View style={styles.redeemEmpty}>
          <Text style={styles.redeemEmptyText}>Chưa có quà khả dụng</Text>
        </View>
      ) : (
        rewardItems.map((item) => {
          const canRedeem = item.isActive && item.stock > 0 && myPoints >= item.pointsCost;
          return (
            <View key={item.itemId} style={styles.rewardCard}>
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardName}>{item.name}</Text>
                <Text style={styles.rewardMeta}>
                  {item.pointsCost.toLocaleString()} điểm • Còn {item.stock}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.redeemButton, !canRedeem && styles.redeemButtonDisabled]}
                disabled={!canRedeem || redeemMutation.isPending}
                onPress={() => redeemMutation.mutate({ itemId: item.itemId, name: item.name })}
              >
                <Text style={styles.redeemButtonText}>
                  {redeemMutation.isPending ? 'Đang đổi...' : 'Đổi'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Trophy size={24} color={Colors.accent[600]} />
          <Text style={styles.title}>Bảng xếp hạng</Text>
        </View>

        <View style={styles.participantsBadge}>
          <Users size={14} color={Colors.primary[700]} />
          <Text style={styles.participantsText}>
            {activeTab === 'LEADERBOARD' ? `${leaderboard.length} người` : `${rewardItems.length} quà`}
          </Text>
        </View>
      </View>

      <View style={styles.tabSwitcher}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.85}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'LEADERBOARD' ? (
        <FlatList
          data={rankingList}
          keyExtractor={(item) => item.userId}
          renderItem={renderLeaderboardItem}
          ListHeaderComponent={leaderboardHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            leaderboardQuery.isLoading ? (
              <View style={styles.listLoading}>
                <ActivityIndicator size="small" color={Colors.primary[600]} />
              </View>
            ) : (
              <View style={styles.listLoading}>
                <Text style={styles.emptyText}>Chưa có dữ liệu xếp hạng</Text>
              </View>
            )
          }
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.redeemContent}>
          {renderRedeemSection()}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FBF5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.neutral[800],
  },
  participantsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E6F5E9',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  participantsText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary[700],
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.white,
    borderRadius: 14,
    marginHorizontal: 16,
    padding: 4,
    marginBottom: 14,
    ...Shadows.soft,
  },
  tabItem: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItemActive: {
    backgroundColor: Colors.primary[600],
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral[600],
  },
  tabTextActive: {
    color: Colors.neutral.white,
  },
  podiumCard: {
    marginHorizontal: 16,
    borderRadius: 22,
    paddingTop: 20,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: '#E0EFE3',
    ...Shadows.card,
  },
  podiumWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-evenly',
    minHeight: 220,
    paddingHorizontal: 10,
  },
  podiumColumn: {
    alignItems: 'center',
    flex: 1,
  },
  podiumCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.soft,
  },
  podiumCirclePlaceholder: {
    backgroundColor: '#E9EFEA',
  },
  podiumRank: {
    fontSize: 30,
    fontWeight: '900',
    color: Colors.neutral.white,
  },
  podiumRankFirst: {
    fontSize: 38,
  },
  crownBadge: {
    marginBottom: 6,
  },
  podiumName: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.neutral[700],
    maxWidth: 110,
    textAlign: 'center',
  },
  podiumNameFirst: {
    fontSize: 18,
    color: Colors.neutral[800],
  },
  podiumPoints: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.neutral[600],
  },
  podiumPointsFirst: {
    fontSize: 18,
    color: Colors.accent[700],
  },
  sectionHeader: {
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.neutral[800],
  },
  sectionSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: Colors.neutral[500],
  },
  listContent: {
    paddingBottom: 24,
  },
  listLoading: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.neutral[500],
  },
  redeemContent: {
    paddingBottom: 24,
  },
  redeemSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 14,
    ...Shadows.card,
  },
  redeemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  redeemHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  redeemTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.neutral[800],
  },
  redeemPoints: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary[700],
  },
  redeemLoading: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  redeemEmpty: {
    paddingVertical: 10,
  },
  redeemEmptyText: {
    fontSize: 13,
    color: Colors.neutral[500],
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  rewardMeta: {
    marginTop: 2,
    fontSize: 12,
    color: Colors.neutral[500],
  },
  redeemButton: {
    minWidth: 76,
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[600],
  },
  redeemButtonDisabled: {
    backgroundColor: Colors.neutral[300],
  },
  redeemButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.neutral.white,
  },
});
