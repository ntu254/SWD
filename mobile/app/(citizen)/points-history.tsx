import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Coins, History } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';

import { Colors } from '@/constants/colors';
import { Shadows } from '@/constants/shadows';
import { useAppStore } from '@/store/useAppStore';
import { fetchRewardBalance, fetchRewardTransactions } from '@/components/api/backend';
import type { RewardTransaction } from '@/types';

const reasonLabels: Record<string, string> = {
  REPORT_APPROVED: 'Báo cáo hợp lệ',
  COLLECTION_REWARD: 'Thưởng sau thu gom',
  REWARD_REDEEMED: 'Đổi quà',
  BONUS: 'Thưởng thêm',
  ADJUSTMENT: 'Điều chỉnh',
};

function reasonLabel(reasonCode?: string) {
  if (!reasonCode) {
    return 'Giao dịch điểm';
  }

  if (reasonCode.startsWith('REDEMPTION:')) {
    return 'Đổi quà';
  }

  return reasonLabels[reasonCode] ?? reasonCode;
}

function formatDate(value?: string) {
  if (!value) {
    return '--/--/----';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--/--/----';
  }

  return date.toLocaleDateString('vi-VN');
}

export default function CitizenPointsHistoryScreen() {
  const accessToken = useAppStore((state) => state.accessToken);
  const user = useAppStore((state) => state.user);

  const balanceQuery = useQuery({
    queryKey: ['rewards', 'balance', 'points-history', user?.userId],
    queryFn: () => fetchRewardBalance(accessToken ?? ''),
    enabled: !!accessToken,
  });

  const transactionsQuery = useQuery({
    queryKey: ['rewards', 'transactions', 'mine', user?.userId],
    queryFn: () => fetchRewardTransactions(accessToken ?? '', { size: 100 }),
    enabled: !!accessToken,
  });

  const transactions = useMemo(() => transactionsQuery.data ?? [], [transactionsQuery.data]);

  const summary = useMemo(() => {
    let earned = 0;
    let redeemed = 0;

    for (const tx of transactions) {
      if (tx.pointsDelta >= 0) {
        earned += tx.pointsDelta;
      } else {
        redeemed += Math.abs(tx.pointsDelta);
      }
    }

    return { earned, redeemed };
  }, [transactions]);

  const refetchAll = React.useCallback(async () => {
    await Promise.all([balanceQuery.refetch(), transactionsQuery.refetch()]);
  }, [balanceQuery, transactionsQuery]);

  useFocusEffect(
    React.useCallback(() => {
      if (!accessToken) {
        return undefined;
      }

      void refetchAll();
      return undefined;
    }, [accessToken, refetchAll])
  );

  const renderItem = ({ item }: { item: RewardTransaction }) => {
    const positive = item.pointsDelta >= 0;
    const pointsText = `${positive ? '+' : '-'}${Math.abs(item.pointsDelta).toLocaleString()} điểm`;

    return (
      <View style={styles.transactionCard}>
        <View style={styles.transactionLeft}>
          <Text style={styles.transactionReason}>{reasonLabel(item.reasonCode)}</Text>
          <Text style={styles.transactionMeta}>{formatDate(item.createdAt)}</Text>
        </View>
        <Text
          style={[
            styles.transactionPoints,
            { color: positive ? Colors.status.success : Colors.accent[700] },
          ]}
        >
          {pointsText}
        </Text>
      </View>
    );
  };

  const isLoadingInitial = balanceQuery.isLoading || transactionsQuery.isLoading;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Lịch sử điểm</Text>
        <Text style={styles.subtitle}>Theo dõi thưởng và giao dịch</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.balanceRow}>
          <View style={styles.balanceIcon}>
            <Coins size={22} color={Colors.primary[700]} />
          </View>
          <View>
            <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
            <Text style={styles.balanceValue}>{(balanceQuery.data ?? 0).toLocaleString()} điểm</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.earned.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Đã nhận</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.redeemed.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Đã dùng</Text>
          </View>
        </View>
      </View>

      {isLoadingInitial ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={Colors.primary[600]} />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.transactionId}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={transactionsQuery.isRefetching || balanceQuery.isRefetching}
              onRefresh={() => {
                void refetchAll();
              }}
            />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <History size={16} color={Colors.neutral[600]} />
              <Text style={styles.listHeaderTitle}>Giao dịch gần đây</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Chưa có giao dịch điểm</Text>
              <Text style={styles.emptySub}>
                Điểm thưởng sẽ hiển thị sau khi báo cáo được duyệt hoặc nhiệm vụ thu gom hoàn tất.
              </Text>
            </View>
          }
        />
      )}
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
    marginTop: 4,
    fontSize: 14,
    color: Colors.neutral[500],
  },
  summaryCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    ...Shadows.card,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  balanceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  balanceLabel: {
    fontSize: 13,
    color: Colors.neutral[500],
  },
  balanceValue: {
    marginTop: 2,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary[700],
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.neutral[200],
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 10,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  listHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral[700],
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 14,
    ...Shadows.soft,
  },
  transactionLeft: {
    flex: 1,
    marginRight: 10,
  },
  transactionReason: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[800],
  },
  transactionMeta: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.neutral[500],
  },
  transactionPoints: {
    fontSize: 14,
    fontWeight: '800',
  },
  emptyState: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 28,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[700],
  },
  emptySub: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.neutral[500],
    textAlign: 'center',
  },
});
