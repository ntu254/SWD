import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gift, Star, Trophy } from "lucide-react-native";
import React from "react";
import {
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { citizenService } from "../../../features/citizen/citizenService";
import { rewardService } from "../../../features/reward/rewardService";
import { useAuthStore } from "../../../shared/store/authStore";
import {
  LeaderboardEntry,
  RewardItem,
  RewardTransaction,
} from "../../../shared/types/domain";
import { Button } from "../../../shared/ui/Button";
import { GlassCard } from "../../../shared/ui/GlassCard";

const RANK_ORDER = ["Dong", "Bac", "Vang", "Bach kim", "Kim cuong"];
const RANK_COLORS = ["#b08850", "#64748b", "#f59e0b", "#7c3aed", "#3b82f6"];

const calcRank = (points: number) => {
  if (points < 100) return 0;
  if (points < 300) return 1;
  if (points < 700) return 2;
  if (points < 1200) return 3;
  return 4;
};

export default function RewardsScreen() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const userId = user?.userId;

  const { data: profile } = useQuery({
    queryKey: ["citizen-profile-reward", userId],
    enabled: Boolean(userId),
    queryFn: () => citizenService.getCitizenProfile(userId!),
  });

  const { data: points = 0 } = useQuery({
    queryKey: ["citizen-points"],
    queryFn: rewardService.getMyPoints,
  });

  const { data: txPage } = useQuery({
    queryKey: ["citizen-transactions"],
    queryFn: () => rewardService.getMyTransactions({ page: 0, size: 20 }),
  });

  const { data: rewardItems = [] } = useQuery({
    queryKey: ["reward-items-available"],
    queryFn: rewardService.getAvailableItems,
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ["reward-leaderboard", profile?.defaultAreaId ?? null],
    queryFn: () =>
      rewardService.getLeaderboard({
        areaId: profile?.defaultAreaId ?? undefined,
        limit: 10,
      }),
  });

  const redeemMutation = useMutation({
    mutationFn: rewardService.redeemItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["citizen-points"] });
      queryClient.invalidateQueries({ queryKey: ["citizen-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["reward-items-available"] });
      queryClient.invalidateQueries({ queryKey: ["reward-leaderboard"] });
      Alert.alert("Thanh cong", "Doi thuong thanh cong.");
    },
    onError: (err: any) => {
      Alert.alert(
        "Khong the doi thuong",
        err?.response?.data?.message ?? "Vui long thu lai.",
      );
    },
  });

  const rankIdx = calcRank(points);
  const rankName = RANK_ORDER[rankIdx];
  const rankColor = RANK_COLORS[rankIdx];
  const rankFloor = [0, 100, 300, 700, 1200][rankIdx];
  const rankNext = [100, 300, 700, 1200, 2000][rankIdx];
  const progress =
    rankIdx === RANK_ORDER.length - 1
      ? 1
      : Math.min((points - rankFloor) / (rankNext - rankFloor), 1);

  const transactions = txPage?.content ?? [];
  const recentTransactions = transactions.slice(0, 8);

  const askRedeem = (item: RewardItem) => {
    Alert.alert(
      "Xac nhan doi qua",
      `Doi ${item.pointsCost} diem cho "${item.name}"?`,
      [
        { text: "Huy", style: "cancel" },
        {
          text: "Doi",
          onPress: () => redeemMutation.mutate(item.itemId),
        },
      ],
    );
  };

  const renderTransaction = React.useCallback(
    ({ item }: { item: RewardTransaction }) => {
      const isEarn = item.transactionType === "EARN";
      const amount = Math.abs(item.pointsAmount);
      return (
        <View style={styles.txRow}>
          <View
            style={[
              styles.txBadge,
              { backgroundColor: isEarn ? "#dcfce7" : "#fee2e2" },
            ]}
          >
            <Text
              style={[
                styles.txBadgeText,
                { color: isEarn ? "#059669" : "#dc2626" },
              ]}
            >
              {isEarn ? "+ " : "- "}
              {amount}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.txTitle}>
              {isEarn ? "Cong diem" : "Doi thuong"}
            </Text>
            <Text style={styles.txDesc} numberOfLines={1}>
              {item.description || item.transactionType}
            </Text>
          </View>
          <Text style={styles.txTime}>
            {item.createdAt
              ? new Date(item.createdAt).toLocaleDateString("vi-VN")
              : "--"}
          </Text>
        </View>
      );
    },
    [],
  );

  const renderRewardItem = React.useCallback(
    ({ item }: { item: RewardItem }) => {
      const disabled =
        points < item.pointsCost || item.stock <= 0 || redeemMutation.isPending;
      return (
        <GlassCard style={styles.rewardCard}>
          <View style={styles.rewardTop}>
            <Text style={styles.rewardName}>{item.name}</Text>
            <View style={styles.rewardCost}>
              <Star size={13} color="#f59e0b" fill="#f59e0b" />
              <Text style={styles.rewardCostText}>{item.pointsCost}</Text>
            </View>
          </View>
          <Text style={styles.rewardDesc} numberOfLines={2}>
            {item.description || "Phan thuong trong he thong"}
          </Text>
          <Text style={styles.rewardStock}>Con lai: {item.stock}</Text>
          <Button
            title={disabled ? "Khong du dieu kien" : "Doi ngay"}
            size="sm"
            variant={disabled ? "outline" : "primary"}
            disabled={disabled}
            onPress={() => askRedeem(item)}
            style={{ marginTop: 8 }}
          />
        </GlassCard>
      );
    },
    [points, redeemMutation.isPending],
  );

  const renderLeaderboardRow = React.useCallback(
    ({ item }: { item: LeaderboardEntry }) => {
      const isMe = item.userId === userId;
      const name =
        item.fullName?.trim() ||
        `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim() ||
        `User #${item.userId.slice(-6)}`;
      return (
        <View style={[styles.lbRow, isMe && styles.lbRowCurrent]}>
          <Text style={styles.lbRank}>#{item.rank}</Text>
          <Text style={styles.lbName} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.lbPoints}>{item.totalPoints}đ</Text>
        </View>
      );
    },
    [userId],
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#047857" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Điểm và phần thưởng </Text>
        <Text style={styles.headerSub}>Theo dõi điểm, lịch sử và đổi quà</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <GlassCard elevated style={styles.rankCard}>
          <View style={styles.rankHeader}>
            <View>
              <Text style={styles.rankLabel}>Hang hien tai</Text>
              <Text style={[styles.rankName, { color: rankColor }]}>
                🏅 {rankName}
              </Text>
            </View>
            <View style={styles.pointsBubble}>
              <Star size={16} color="#f59e0b" fill="#f59e0b" />
              <Text style={styles.pointsBubbleText}>{points} điểm</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress * 100}%`, backgroundColor: rankColor },
              ]}
            />
          </View>
          <Text style={styles.progressHint}>
            {rankIdx === RANK_ORDER.length - 1
              ? "Ban dang o hang cao nhat."
              : `Can ${Math.max(rankNext - points, 0)} diem de len hang ${RANK_ORDER[rankIdx + 1]}`}
          </Text>
        </GlassCard>

        <View style={styles.sectionHeader}>
          <Trophy size={18} color="#f59e0b" />
          <Text style={styles.sectionTitle}>
            Bảng xếp hạng{" "}
            {profile?.defaultAreaName
              ? `(${profile.defaultAreaName})`
              : "(toan he thong)"}
          </Text>
        </View>
        <GlassCard style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
          {leaderboard.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có dữ liệu bảng xếp hạng.</Text>
          ) : (
            <FlatList
              data={leaderboard.slice(0, 5)}
              keyExtractor={(item) => item.userId}
              renderItem={renderLeaderboardRow}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </GlassCard>

        <View style={styles.sectionHeader}>
          <Trophy size={18} color="#f59e0b" />
          <Text style={styles.sectionTitle}>Lịch sử điểm gần đây</Text>
        </View>
        <GlassCard style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
          {recentTransactions.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có giao dịch điểm nào.</Text>
          ) : (
            <FlatList
              data={recentTransactions}
              keyExtractor={(item) => item.transactionId}
              renderItem={renderTransaction}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </GlassCard>

        <View style={styles.sectionHeader}>
          <Gift size={18} color="#059669" />
          <Text style={styles.sectionTitle}>Danh sách quà đổi điểm</Text>
        </View>
        {rewardItems.length === 0 ? (
          <GlassCard>
            <Text style={styles.emptyText}>
              Hiện chưa có phần thưởng khả dụng.
            </Text>
          </GlassCard>
        ) : (
          <FlatList
            data={rewardItems}
            keyExtractor={(item) => item.itemId}
            renderItem={renderRewardItem}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0fdf4" },
  header: {
    backgroundColor: "#047857",
    paddingTop: Platform.OS === "ios" ? 56 : 44,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 3 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  rankCard: { padding: 24, marginBottom: 20 },
  rankHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  rankLabel: { fontSize: 13, color: "#64748b", marginBottom: 4 },
  rankName: { fontSize: 26, fontWeight: "800" },
  pointsBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef9c3",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 5,
  },
  pointsBubbleText: { fontSize: 15, fontWeight: "800", color: "#92400e" },
  progressTrack: {
    height: 10,
    backgroundColor: "#e2e8f0",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: { height: "100%", borderRadius: 5 },
  progressHint: { fontSize: 12, color: "#94a3b8" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1e293b" },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  txBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  txBadgeText: { fontSize: 12, fontWeight: "800" },
  txTitle: { fontSize: 13, fontWeight: "700", color: "#1e293b" },
  txDesc: { fontSize: 12, color: "#64748b" },
  txTime: { fontSize: 11, color: "#94a3b8" },
  separator: { height: 1, backgroundColor: "#f1f5f9", marginHorizontal: 16 },
  rewardCard: { marginBottom: 10 },
  rewardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rewardName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginRight: 10,
  },
  rewardCost: { flexDirection: "row", alignItems: "center", gap: 4 },
  rewardCostText: { color: "#92400e", fontWeight: "800", fontSize: 13 },
  rewardDesc: { marginTop: 6, color: "#64748b", fontSize: 13 },
  rewardStock: { marginTop: 4, color: "#94a3b8", fontSize: 12 },
  emptyText: { padding: 16, color: "#94a3b8", textAlign: "center" },
  lbRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  lbRowCurrent: { backgroundColor: "#ecfdf5" },
  lbRank: { width: 36, fontSize: 12, fontWeight: "800", color: "#64748b" },
  lbName: { flex: 1, fontSize: 13, fontWeight: "700", color: "#1e293b" },
  lbPoints: { fontSize: 12, fontWeight: "800", color: "#059669" },
});
