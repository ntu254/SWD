import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Flame,
  Leaf,
  Trophy,
  TreePine,
} from "lucide-react";

import { reportsApi } from "../../api";
import { Button } from "../../components/ui/button";
import {
  EmptyState,
  PageHeader,
  SectionCard,
  SectionHeader,
  StatCard,
} from "../../components/ui/page";
import { StatusBadge } from "../../components/ui/badge";
import type { WasteReport } from "../../types";

export const CitizenDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ["citizen-reports"],
    queryFn: () => reportsApi.getMine().then((response) => response.data),
  });

  const reports: WasteReport[] = reportsData?.data?.content || [];
  const totalReports = reportsData?.data?.totalElements || 0;

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Không gian công dân</span>}
        title="Bảng theo dõi đóng góp của bạn"
        description="Theo dõi báo cáo gần đây, tiến độ tích điểm và tác động cộng đồng của bạn mà không đổi luồng báo cáo hiện có."
        actions={
          <Button onClick={() => navigate("/citizen/report")}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Báo cáo rác
          </Button>
        }
      />

      {/* <PageHero
        eyebrow={<span className="shell-chip shell-chip-accent">Community progress</span>}
        title="Keep the city cleaner, one report at a time."
        description="Every submission helps local teams respond faster. You can check report status, build a reward streak and keep your contribution history visible in one place."
        tone="mint"
        action={
          <Button variant="secondary" onClick={() => navigate("/citizen/reports")}>
            View report history
          </Button>
        }
        aside={
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="shell-icon-chip">
                <Leaf className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Reports awaiting action
                </p>
                <p className="text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                  {pendingCount}
                </p>
              </div>
            </div>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              You currently have {pendingCount} open submissions and {totalReports} total reports tracked in the platform.
            </p>
          </div>
        }
      /> */}

      <div className="grid gap-3 md:grid-cols-3">
        <StatCard
          icon={AlertTriangle}
          label="Đã gửi"
          value={totalReports}
          description="Tất cả báo cáo của bạn trên nền tảng."
          tone="mint"
          compact
        />
        <StatCard
          icon={Award}
          label="Điểm thưởng"
          value="0 pts"
          description="Tích lũy thêm điểm bằng cách báo cáo đều đặn."
          tone="sky"
          compact
        />
        <StatCard
          icon={TreePine}
          label="Rác đã ngăn chặn"
          value="0 kg"
          description="Ước tính tác động môi trường hiện tại của bạn."
          tone="sand"
          featured
          compact
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <SectionCard className="overflow-hidden">
          <SectionHeader
            title="Báo cáo gần đây"
            description="Những báo cáo mới nhất của bạn được hiển thị tại đây để theo dõi nhanh."
            action={
              <Button variant="ghost" onClick={() => navigate("/citizen/reports")}>
                Xem tất cả
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            }
          />

          <div className="divide-y divide-[rgba(94,110,125,0.08)]">
            {isLoading ? (
              <div className="space-y-3 p-5 sm:p-6">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="shimmer h-20 rounded-[20px]" />
                ))}
              </div>
            ) : reports.length === 0 ? (
              <div className="p-5 sm:p-6">
                <EmptyState
                  icon={AlertTriangle}
                  title="Chưa có báo cáo nào"
                  description="Hãy bắt đầu bằng việc báo cáo một điểm rác gần bạn. Lần gửi tiếp theo sẽ xuất hiện ngay tại đây."
                  action={
                    <Button onClick={() => navigate("/citizen/report")}>
                      Tạo báo cáo đầu tiên
                    </Button>
                  }
                />
              </div>
            ) : (
              reports.slice(0, 5).map((report) => (
                <button
                  key={report.reportId}
                  type="button"
                  onClick={() => navigate(`/citizen/reports/${report.reportId}`)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-emerald-50/40 sm:px-6"
                >
                  <div className="shell-icon-chip h-12 w-12 shrink-0">
                    <AlertTriangle className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                      {report.wasteTypeName || "Không rõ loại rác"}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Gửi ngày {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={report.status} />
                </button>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard className="overflow-hidden">
          <SectionHeader
            title="Bảng xếp hạng khu vực"
            description="Xem mức độ đóng góp của bạn trong tháng này."
          />

          <div className="space-y-4 p-5 sm:p-6">
            {[
              { name: "Sarah Jenkins", points: 3200, icon: Trophy },
              { name: "Michael Chen", points: 2850, icon: Trophy },
              { name: "Bạn", points: 0, icon: Leaf },
            ].map((user, index) => (
              <div key={user.name} className="rounded-[20px] border border-[var(--stroke-soft)] bg-white/84 p-4">
                <div className="flex items-center gap-3">
                  <div className="shell-icon-chip h-11 w-11 shrink-0">
                    <user.icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                      {user.name}
                    </p>
                    <p className="text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">
                      Hạng #{index + 1}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {user.points.toLocaleString()}
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-[var(--primary-400)]"
                    style={{
                      width: `${Math.min(100, (user.points / 3200) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}

            <div className="rounded-[20px] border border-amber-200 bg-amber-100/80 p-4">
              <div className="flex items-center gap-3">
                <div className="shell-icon-chip h-10 w-10 bg-amber-50 text-amber-700">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    Bắt đầu chuỗi mới hôm nay
                  </p>
                  <p className="text-sm text-amber-700">
                    Gửi thêm một báo cáo để duy trì đà đóng góp.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
