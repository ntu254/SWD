import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Clock,
  ListTodo,
  MapPin,
} from "lucide-react";

import { enterpriseCapabilitiesApi, tasksApi } from "../../api";
import { Button } from "../../components/ui/button";
import {
  PageHeader,
  PageHero,
  SectionCard,
  StatCard,
} from "../../components/ui/page";

export function EnterpriseDashboard() {
  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ["enterprise-pending"],
    queryFn: () => tasksApi.getPendingReports().then((response) => response.data),
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ["enterprise-tasks"],
    queryFn: () => tasksApi.getEnterpriseTasks().then((response) => response.data),
  });
  const { data: capabilitiesData, isLoading: capabilitiesLoading } = useQuery({
    queryKey: ["enterprise-capabilities"],
    queryFn: () => enterpriseCapabilitiesApi.getAll().then((response) => response.data),
  });

  const pendingCount = pendingData?.data?.totalElements ?? 0;
  const tasksCount = tasksData?.data?.totalElements ?? 0;
  const capabilitiesCount = capabilitiesData?.data?.length ?? 0;
  const isLoading = pendingLoading || tasksLoading || capabilitiesLoading;

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Không gian doanh nghiệp</span>}
        title="Tổng quan vận hành"
        description="Điều phối báo cáo chờ duyệt, nhiệm vụ đang chạy và phạm vi phục vụ trong cùng một khu vực điều hành."
        actions={
          <Button asChild>
            <Link to="/enterprise/capabilities">
              <MapPin className="mr-2 h-4 w-4" />
              Đăng ký phạm vi phục vụ
            </Link>
          </Button>
        }
      />

      <PageHero
        eyebrow={<span className="shell-chip shell-chip-accent">Tổng quan phạm vi phục vụ</span>}
        title="Đi từ tiếp nhận báo cáo tới điều phối khu vực nhanh hơn."
        description="Bảng điều khiển mới làm nổi bật hàng chờ vận hành và luồng đăng ký phạm vi phục vụ đang khớp với các API backend hiện có."
        tone="mint"
        aside={
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="shell-icon-chip">
                <Building2 className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Tài khoản doanh nghiệp đang hoạt động
                </p>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  {isLoading ? "Đang tải số liệu..." : `${pendingCount} báo cáo chờ duyệt và ${tasksCount} nhiệm vụ đang theo dõi.`}
                </p>
              </div>
            </div>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Clock}
          label="Báo cáo chờ duyệt"
          value={isLoading ? "..." : pendingCount}
          description="Đang chờ quyết định trong các khu vực bạn phụ trách."
          tone="sand"
        />
        <StatCard
          icon={ListTodo}
          label="Nhiệm vụ đang theo dõi"
          value={isLoading ? "..." : tasksCount}
          description="Toàn bộ nhiệm vụ đã được tạo trong hệ thống."
          tone="sky"
        />
        <StatCard
          icon={MapPin}
          label="Đăng ký phạm vi"
          value={isLoading ? "..." : capabilitiesCount}
          description="Các đăng ký khu vực và loại rác đang hoạt động."
          tone="mint"
          featured
        />
        {/* <StatCard
          icon={Building2}
          label="Hồ sơ doanh nghiệp"
          value="1 hồ sơ"
          description="Giữ thông tin tài khoản và cơ sở luôn cập nhật."
          tone="violet"
        /> */}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          {
            to: "/enterprise/reports",
            icon: BarChart3,
            label: "Phân tích và báo cáo",
            description: "Xem yêu cầu chờ duyệt, lịch sử và xu hướng vận hành.",
            tone: "sky" as const,
          },
          {
            to: "/enterprise/capabilities",
            icon: MapPin,
            label: "Đăng ký phạm vi phục vụ",
            description: "Khai báo khu vực, loại rác và công suất mỗi ngày.",
            tone: "mint" as const,
          },
          {
            to: "/enterprise/profile",
            icon: Building2,
            label: "Hồ sơ doanh nghiệp",
            description: "Cập nhật thông tin liên hệ và thông tin vận hành.",
            tone: "violet" as const,
          },
        ].map((item) => (
          <SectionCard key={item.to} className="shell-card-hover overflow-hidden">
            <Link className="block p-5 sm:p-6" to={item.to}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-4">
                  <div className="shell-icon-chip">
                    <item.icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                      {item.label}
                    </p>
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">
                      {item.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 text-[var(--text-muted)]" />
              </div>
            </Link>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
