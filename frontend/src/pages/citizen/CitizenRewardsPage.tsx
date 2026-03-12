import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  Gift,
  History,
  Sparkles,
  Ticket,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import { rewardsApi } from "../../api";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  EmptyState,
  PageHeader,
  PageHero,
  SectionCard,
  SectionHeader,
  StatCard,
} from "../../components/ui/page";

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
      toast.success("Reward redeemed successfully.");
      queryClient.invalidateQueries({ queryKey: ["rewards-balance"] });
      queryClient.invalidateQueries({ queryKey: ["reward-items"] });
      queryClient.invalidateQueries({ queryKey: ["reward-transactions"] });
    },
    onError: () => toast.error("Unable to redeem this reward right now."),
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
        eyebrow={<span className="shell-chip shell-chip-primary">Citizen workspace</span>}
        title="Rewards and redemption"
        description="Track your current balance, see what is in stock and review the points flow from your recent activity."
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
          label="Balance"
          value={balanceLoading ? "..." : `${pointsBalance} pts`}
          description="Available points ready for redemption."
          tone="sand"
          featured
        />
        <StatCard
          icon={Gift}
          label="Redeemable now"
          value={itemsLoading ? "..." : redeemableCount}
          description="Items you can claim with your current balance."
          tone="mint"
        />
        <StatCard
          icon={Ticket}
          label="Live inventory"
          value={itemsLoading ? "..." : liveInventory}
          description="Total stock remaining across active rewards."
          tone="sky"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <SectionCard className="overflow-hidden">
          <SectionHeader
            title="Available rewards"
            description="Redeem items without leaving your current workspace."
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
                title="No rewards in stock"
                description="New reward items will appear here as soon as the catalog is replenished."
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
                              Stock {item.stock}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3 rounded-[20px] border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] px-4 py-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                          Eligibility
                        </p>
                        <p className="text-sm font-medium text-[var(--text-secondary)]">
                          {canRedeem
                            ? "Ready to redeem now."
                            : item.stock === 0
                              ? "Currently out of stock."
                              : "Earn more points to unlock."}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant={canRedeem ? "default" : "outline"}
                        disabled={!canRedeem || isRedeeming}
                        onClick={() => redeemItem.mutate(item.itemId)}
                      >
                        {isRedeeming ? "Redeeming..." : "Redeem"}
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
            title="Transaction history"
            description="A running ledger of points earned and spent."
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
                title="No transactions yet"
                description="Once points are earned or redeemed, every change will be listed here."
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
                          {transaction.reasonCode
                            .toLowerCase()
                            .split("_")
                            .map(
                              (part) => part.charAt(0).toUpperCase() + part.slice(1),
                            )
                            .join(" ")}
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
