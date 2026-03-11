import { useAuth } from '@shared/contexts';
import type {
  LeaderboardEntry,
  RewardItemResponse,
  RewardTransactionResponse,
} from '@shared/services/api';
import { citizenRewardService } from '@shared/services/api';
import { Gift, Leaf, ShoppingBag, TrendingUp, Trophy } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const RewardsPage: React.FC = () => {
  const { user } = useAuth();
  const [myPoints, setMyPoints] = useState(0);
  const [rewardItems, setRewardItems] = useState<RewardItemResponse[]>([]);
  const [transactions, setTransactions] = useState<RewardTransactionResponse[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const userIdStr: string | undefined =
    (user as any)?.userId ?? (user?.id != null ? String(user.id) : undefined);

  useEffect(() => {
    Promise.all([
      citizenRewardService.getMyPoints(),
      citizenRewardService.getAvailableItems(),
      citizenRewardService.getMyTransactions(0, 20),
      citizenRewardService.getLeaderboard(10),
    ])
      .then(([pts, items, txPage, lb]) => {
        setMyPoints(pts ?? 0);
        setRewardItems(items ?? []);
        setTransactions((txPage as any)?.content ?? []);
        setLeaderboard(lb ?? []);
      })
      .catch(() => {});
  }, []);

  const handleRedeem = async (itemId: string) => {
    setRedeeming(itemId);
    try {
      await citizenRewardService.redeemItem(itemId);
      const [newPts, newTx] = await Promise.all([
        citizenRewardService.getMyPoints(),
        citizenRewardService.getMyTransactions(0, 20),
      ]);
      setMyPoints(newPts ?? myPoints);
      setTransactions((newTx as any)?.content ?? transactions);
    } catch {
      // ignore
    } finally {
      setRedeeming(null);
    }
  };

  const myRank = leaderboard.find(e => e.userId === userIdStr)?.rank ?? '—';
  const earnedThisMonth = transactions
    .filter(tx => {
      if (tx.transactionType !== 'EARN') return false;
      const d = new Date(tx.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, tx) => sum + (tx.pointsAmount ?? 0), 0);
  const totalRedeemed = transactions
    .filter(tx => tx.transactionType === 'REDEEM')
    .reduce((sum, tx) => sum + (tx.pointsAmount ?? 0), 0);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Phần thưởng</h1>
        <p className="text-gray-500 text-sm mt-1">Tích điểm và đổi quà xanh hấp dẫn</p>
      </div>

      {/* ── Point Balance ── */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 text-white"
        style={{ background: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)' }}
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-14 -left-6 w-48 h-48 bg-white/5 rounded-full" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-brand-100 text-sm font-semibold">
            <Leaf size={16} className="fill-brand-200" /> GreenPoints Balance
          </div>
          <p className="font-display text-5xl font-bold mb-1">{myPoints.toLocaleString()}</p>
          <p className="text-brand-100/70 text-sm">
            'Điểm tích lũy từ báo cáo rác & phân loại đúng
          </p>
          <div className="mt-4 flex gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
              <p className="text-xs text-brand-100">Xếp hạng</p>
              <p className="font-bold text-lg">#{myRank}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
              <p className="text-xs text-brand-100">Tháng này</p>
              <p className="font-bold text-lg">+{earnedThisMonth} GP</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
              <p className="text-xs text-brand-100">Đã đổi</p>
              <p className="font-bold text-lg">{totalRedeemed} GP</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Rewards Marketplace + Leaderboard ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Marketplace (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <ShoppingBag size={16} /> Đổi điểm lấy quà
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {rewardItems.length === 0 && (
              <div className="col-span-2 py-8 text-center text-sm text-gray-400">
                Không có phần thưởng khả dụng
              </div>
            )}
            {rewardItems.map(item => (
              <div
                key={item.itemId}
                className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${
                  item.stock > 0
                    ? 'border-gray-100 hover:shadow-md hover:-translate-y-0.5'
                    : 'border-gray-100 opacity-60'
                }`}
              >
                {item.imageUrl ? (
                  <div className="h-32 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-32 bg-brand-50 flex items-center justify-center">
                    <Gift size={36} className="text-brand-300" />
                  </div>
                )}
                <div className="p-3 space-y-2">
                  <p className="font-bold text-gray-800 text-sm leading-snug">{item.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs font-bold text-brand-600 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-full">
                      <Leaf size={10} className="fill-brand-500" /> {item.pointsCost} GP
                    </span>
                    <button
                      disabled={
                        item.stock <= 0 || myPoints < item.pointsCost || redeeming === item.itemId
                      }
                      onClick={() => handleRedeem(item.itemId)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
                    >
                      {item.stock <= 0
                        ? 'Hết hàng'
                        : myPoints < item.pointsCost
                          ? 'Thiếu điểm'
                          : redeeming === item.itemId
                            ? '...'
                            : 'Đổi ngay'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard (1/3) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <Trophy size={15} className="text-amber-500" />
            <h3 className="font-bold text-gray-800 text-sm">Bảng xếp hạng khu vực</h3>
          </div>
          <div className="p-3 space-y-2">
            {leaderboard.map(u => {
              const isYou = u.userId === userIdStr;
              return (
                <div
                  key={u.rank}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-colors ${isYou ? 'bg-brand-50 border border-brand-100' : 'hover:bg-gray-50'}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                      u.rank === 1
                        ? 'bg-yellow-400 text-white'
                        : u.rank === 2
                          ? 'bg-gray-400 text-white'
                          : u.rank === 3
                            ? 'bg-orange-400 text-white'
                            : 'bg-brand-500 text-white'
                    }`}
                  >
                    {u.rank}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-brand-700">
                      {(u.firstName?.[0] ?? u.fullName?.[0] ?? '?').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-bold truncate ${isYou ? 'text-brand-700' : 'text-gray-800'}`}
                    >
                      {isYou
                        ? 'Bạn'
                        : u.fullName ||
                          `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() ||
                          'Người dùng'}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {(u.totalPoints ?? 0).toLocaleString()} GP
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Transaction History ── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <TrendingUp size={16} className="text-brand-600" />
          <h3 className="font-bold text-gray-800">Lịch sử điểm</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {transactions.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-400">Chưa có giao dịch nào</div>
          )}
          {transactions.map(tx => {
            const isEarn = tx.transactionType === 'EARN';
            const Icon = isEarn ? Leaf : Gift;
            const colorClass = isEarn ? 'text-brand-600 bg-brand-50' : 'text-red-500 bg-red-50';
            return (
              <div key={tx.transactionId} className="flex items-center gap-4 px-5 py-4">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}
                >
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {tx.description || (isEarn ? 'Nhận điểm' : 'Đổi điểm')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('vi-VN') : '—'}
                  </p>
                </div>
                <span className={`font-bold text-sm ${isEarn ? 'text-brand-600' : 'text-red-500'}`}>
                  {isEarn ? '+' : '-'}
                  {tx.pointsAmount} GP
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;
