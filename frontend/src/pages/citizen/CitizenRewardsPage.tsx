import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  Gift,
  History,
  Sparkles,
  Ticket,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import { rewardsApi } from "../../api";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  EmptyState,
  PageHeader,
  SectionCard,
  SectionHeader,
  StatCard,
} from "../../components/ui/page";
import { formatRewardReasonLabel } from "../../lib/labels";

type RewardItem = {
  itemId: string;
  name: string;
  pointsCost: number;
  stock: number;
  imageUrl?: string;
};

type RewardTransaction = {
  transactionId: string;
  pointsDelta: number;
  reasonCode: string;
  createdAt: string;
};

export function CitizenRewardsPage() {
  const queryClient = useQueryClient();
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ["rewards-balance"],
    queryFn: () => rewardsApi.getBalance().then((response) => response.data.data),
  });

  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ["reward-items"],
    queryFn: () => rewardsApi.getItems().then((response) => response.data.data),
  });

  const { data: txPage, isLoading: transactionsLoading } = useQuery({
    queryKey: ["reward-transactions"],
    queryFn: () =>
      rewardsApi.getTransactions().then((response) => response.data.data),
  });

  const redeemItem = useMutation({
    mutationFn: (itemId: string) => rewardsApi.redeem(itemId),
    onMutate: (itemId) => setRedeemingId(itemId),
    onSuccess: () => {
      toast.success("Đổi phần thưởng thành công.");
      queryClient.invalidateQueries({ queryKey: ["rewards-balance"] });
      queryClient.invalidateQueries({ queryKey: ["reward-items"] });
      queryClient.invalidateQueries({ queryKey: ["reward-transactions"] });
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Hiện chưa thể đổi phần thưởng này.";
      toast.error(message);
    },
    onSettled: () => setRedeemingId(null),
  });

  const rewardItems: RewardItem[] = items ?? [];
  const transactions: RewardTransaction[] = txPage?.content ?? [];
  const pointsBalance = balance ?? 0;
  const redeemableCount = rewardItems.filter(
    (item) => item.stock > 0 && pointsBalance >= item.pointsCost,
  ).length;
  const liveInventory = rewardItems.reduce((total, item) => total + item.stock, 0);

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Không gian công dân</span>}
        title="Phần thưởng và đổi quà"
        description="Theo dõi số điểm hiện có, xem vật phẩm còn hàng và lịch sử biến động điểm từ các hoạt động gần đây."
      />

      {/* <PageHero
        eyebrow={<span className="shell-chip shell-chip-accent">Reward momentum</span>}
        title="Turn community effort into useful perks."
        description="Your reporting history still drives the same reward program. This redesigned view simply makes balance, available items and transaction history easier to scan."
        tone="sand"
        aside={
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="shell-icon-chip bg-[var(--warning-50)] text-[var(--warning-600)]">
                <Wallet className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Current balance
                </p>
                <p className="text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                  {balanceLoading ? "..." : `${pointsBalance} pts`}
                </p>
              </div>
            </div>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              {redeemableCount} items are currently within reach and {liveInventory} units
              remain available across the catalog.
            </p>
          </div>
        }
      /> */}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Award}
          label="Số dư"
          value={balanceLoading ? "..." : `${pointsBalance} pts`}
          description="Số điểm hiện sẵn sàng để đổi quà."
          tone="sand"
          featured
        />
        <StatCard
          icon={Gift}
          label="Đổi được ngay"
          value={itemsLoading ? "..." : redeemableCount}
          description="Những vật phẩm bạn có thể đổi với số điểm hiện tại."
          tone="mint"
        />
        <StatCard
          icon={Ticket}
          label="Tồn kho hiện có"
          value={itemsLoading ? "..." : liveInventory}
          description="Tổng số lượng còn lại trong danh mục phần thưởng."
          tone="sky"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <SectionCard className="overflow-hidden">
          <SectionHeader
            title="Phần thưởng hiện có"
            description="Đổi vật phẩm ngay trong không gian làm việc hiện tại."
          />

          {itemsLoading ? (
            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="shimmer h-52 rounded-[24px]" />
              ))}
            </div>
          ) : rewardItems.length === 0 ? (
            <div className="p-5 sm:p-6">
              <EmptyState
                icon={Gift}
                title="Chưa có phần thưởng khả dụng"
                description="Vật phẩm mới sẽ xuất hiện tại đây khi danh mục được bổ sung."
                tone="sand"
              />
            </div>
          ) : (
            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
              {rewardItems.map((item) => {
                const canRedeem =
                  pointsBalance >= item.pointsCost && item.stock > 0;
                const isRedeeming = redeemingId === item.itemId;

                return (
                  <div
                    key={item.itemId}
                    className="shell-card shell-card-hover overflow-hidden p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-16 w-16 rounded-[18px] object-cover"
                          />
                        ) : (
                          <div className="shell-icon-chip h-16 w-16 rounded-[20px]">
                            <Gift className="h-5 w-5" />
                          </div>
                        )}
                        <div className="space-y-2">
                          <p className="text-base font-semibold text-[var(--text-primary)]">
                            {item.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="pending">{item.pointsCost} pts</Badge>
                            <Badge
                              variant={item.stock > 0 ? "accepted" : "outline"}
                            >
                              Còn {item.stock}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3 rounded-[20px] border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] px-4 py-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                          Điều kiện đổi
                        </p>
                        <p className="text-sm font-medium text-[var(--text-secondary)]">
                          {canRedeem
                            ? "Đã đủ điều kiện để đổi ngay."
                            : item.stock === 0
                              ? "Tạm thời đã hết hàng."
                              : "Hãy tích thêm điểm để mở khóa."}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant={canRedeem ? "default" : "outline"}
                        disabled={!canRedeem || isRedeeming}
                        onClick={() => redeemItem.mutate(item.itemId)}
                      >
                        {isRedeeming ? "Đang đổi..." : "Đổi quà"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard className="overflow-hidden">
          <SectionHeader
            title="Lịch sử giao dịch"
            description="Nhật ký các lần cộng và trừ điểm."
          />

          {transactionsLoading ? (
            <div className="space-y-3 p-5 sm:p-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="shimmer h-18 rounded-[20px]" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-5 sm:p-6">
              <EmptyState
                icon={History}
                title="Chưa có giao dịch nào"
                description="Mọi thay đổi về điểm sẽ xuất hiện tại đây khi bạn bắt đầu tích hoặc đổi điểm."
                tone="slate"
              />
            </div>
          ) : (
            <div className="divide-y divide-[rgba(94,110,125,0.08)]">
              {transactions.map((transaction) => {
                const isPositive = transaction.pointsDelta > 0;

                return (
                  <div
                    key={transaction.transactionId}
                    className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`shell-icon-chip ${
                          isPositive
                            ? "bg-[var(--primary-100)] text-[var(--primary-700)]"
                            : "bg-[var(--peach-100)] text-[var(--peach-600)]"
                        }`}
                      >
                        {isPositive ? (
                          <Sparkles className="h-4.5 w-4.5" />
                        ) : (
                          <History className="h-4.5 w-4.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                          {formatRewardReasonLabel(transaction.reasonCode)}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-sm font-semibold ${
                        isPositive
                          ? "text-[var(--primary-700)]"
                          : "text-[var(--peach-600)]"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {transaction.pointsDelta} pts
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
