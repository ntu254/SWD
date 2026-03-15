import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  Loader2,
  MapPin,
  UserRoundPlus,
  Warehouse,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { enterpriseKpiApi, reportsApi, tasksApi } from "../../api";
import { MapComponent } from "../../components/maps/MapComponent";
import { StatusBadge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  EmptyState,
  PageHeader,
  PageHero,
  SectionCard,
  SectionHeader,
  StatCard,
} from "../../components/ui/page";
import { formatPriorityLabel, formatStatusLabel } from "../../lib/labels";
import { withReportMetadata } from "../../lib/reportMetadata";
import type { Task, WasteReport } from "../../types";

type Collector = {
  userId: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
};

function getCollectorName(collector: Collector) {
  return (
    collector.displayName ||
    `${collector.firstName ?? ""} ${collector.lastName ?? ""}`.trim() ||
    collector.email
  );
}

export function EnterpriseTaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedCollectorId, setSelectedCollectorId] = useState("");

  const retryTaskDetailQuery = (
    _failureCount: number,
    error: unknown,
  ) => {
    const status = (error as { response?: { status?: number } })?.response?.status;
    return status == null || status >= 500;
  };

  const { data: taskResponse, isLoading } = useQuery({
    queryKey: ["enterprise-task-detail", taskId],
    queryFn: () => tasksApi.getEnterpriseTaskById(taskId!).then((response) => response.data),
    enabled: !!taskId,
    retry: retryTaskDetailQuery,
  });

  const task: Task | undefined = taskResponse?.data;

  const { data: collectorsResponse } = useQuery({
    queryKey: ["enterprise-task-detail", "collectors"],
    queryFn: () => enterpriseKpiApi.getCollectors().then((response) => response.data),
  });

  const { data: reportResponse } = useQuery({
    queryKey: ["enterprise-task-detail", "report", task?.reportId],
    queryFn: () => reportsApi.getById(task!.reportId!).then((response) => response.data),
    enabled: !!task?.reportId,
    retry: retryTaskDetailQuery,
  });

  const report: WasteReport | undefined = reportResponse?.data
    ? withReportMetadata(reportResponse.data as WasteReport)
    : undefined;
  const collectors: Collector[] = collectorsResponse?.data ?? [];

  const assignTask = useMutation({
    mutationFn: (collectorUserId: string) => tasksApi.assignTask(taskId!, collectorUserId),
    onSuccess: async () => {
      toast.success("Đã cập nhật phân công collector.");
      setSelectedCollectorId("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["enterprise-task-detail", taskId] }),
        queryClient.invalidateQueries({ queryKey: ["enterprise-tasks-list"] }),
      ]);
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể phân công collector cho nhiệm vụ này.";
      toast.error(message);
    },
  });

  const mapPoint =
    report?.latitude && report?.longitude
      ? ([report.latitude, report.longitude] as [number, number])
      : null;

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="py-10">
        <EmptyState
          icon={AlertTriangle}
          title="Không tìm thấy nhiệm vụ"
          description="Nhiệm vụ này có thể không còn thuộc doanh nghiệp hiện tại hoặc đã được thay đổi trạng thái."
          action={
            <Button variant="outline" onClick={() => navigate("/enterprise/tasks")}>
              Quay lại bảng điều phối
            </Button>
          }
          tone="peach"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Không gian doanh nghiệp</span>}
        title="Chi tiết nhiệm vụ"
        description="Xem đầy đủ bối cảnh từ báo cáo gốc, vị trí, mức ưu tiên và trạng thái phân công trong một màn hình."
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        }
      />

      <PageHero
        eyebrow={<span className="shell-chip shell-chip-accent">Mã nhiệm vụ {task.taskId}</span>}
        title={task.areaName || "Nhiệm vụ thu gom"}
        description={report?.description || "Chưa có mô tả đi kèm báo cáo gốc."}
        tone={task.status === "COMPLETED" || task.status === "COLLECTED" ? "mint" : "sky"}
        aside={
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  Trạng thái hiện tại
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                  {formatStatusLabel(task.status)}
                </p>
              </div>
              <StatusBadge status={task.status} />
            </div>
            <div className="rounded-[20px] border border-[var(--stroke-soft)] bg-white/82 p-4 text-sm leading-6 text-[var(--text-secondary)]">
              {task.collectorName
                ? `Collector hiện tại: ${task.collectorName}.`
                : "Nhiệm vụ này vẫn chưa được gán collector."}
            </div>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Warehouse}
          label="Đơn vị xử lý"
          value={task.enterpriseName || "Doanh nghiệp hiện tại"}
          description="Doanh nghiệp chịu trách nhiệm cho nhiệm vụ này"
          tone="slate"
        />
        <StatCard
          icon={Clock}
          label="Lịch hiện tại"
          value={task.scheduledDate || "Chưa lên lịch"}
          description="Ngày thực hiện dự kiến"
          tone="sky"
        />
        <StatCard
          icon={MapPin}
          label="Ưu tiên"
          value={task.priority ? formatPriorityLabel(task.priority) : "Mặc định"}
          description="Mức ưu tiên đang áp dụng"
          tone="mint"
          featured
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
        <div className="space-y-4 lg:space-y-5">
          <SectionCard className="overflow-hidden">
            <SectionHeader
              title="Thông tin báo cáo gốc"
              description="Những dữ liệu mà công dân gửi lên để tạo ra nhiệm vụ này."
            />

            <div className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[22px] border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                    Loại rác
                  </p>
                  <p className="mt-2 text-base font-semibold text-[var(--text-primary)]">
                    {report?.wasteTypeName || "Chưa rõ"}
                  </p>
                </div>
                <div className="rounded-[22px] border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                    Khối lượng ước tính
                  </p>
                  <p className="mt-2 text-base font-semibold text-[var(--text-primary)]">
                    {report?.estimatedWeightKg ? `${report.estimatedWeightKg} kg` : "Chưa có"}
                  </p>
                </div>
              </div>

              <div className="rounded-[22px] border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  Mô tả
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                  {report?.description?.trim() || "Không có mô tả."}
                </p>
              </div>

              {report?.reportPhotoUrl ? (
                <div className="overflow-hidden rounded-[26px] border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)]">
                  <img
                    src={report.reportPhotoUrl}
                    alt="Ảnh minh chứng báo cáo"
                    className="max-h-[420px] w-full object-cover"
                  />
                </div>
              ) : null}
            </div>
          </SectionCard>

          {mapPoint ? (
            <SectionCard className="overflow-hidden">
              <SectionHeader
                title="Vị trí cần xử lý"
                description="Vị trí ghim trên bản đồ được chuyển sang collector khi bắt đầu nhiệm vụ."
              />

              <div className="space-y-4 p-5 sm:p-6">
                <MapComponent
                  points={[
                    {
                      id: task.taskId,
                      lat: mapPoint[0],
                      lng: mapPoint[1],
                      status: task.status,
                    },
                  ]}
                  center={mapPoint}
                  interactive={false}
                />
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  Tọa độ: {mapPoint[0].toFixed(5)}, {mapPoint[1].toFixed(5)}
                </p>
              </div>
            </SectionCard>
          ) : null}
        </div>

        <SectionCard className="overflow-hidden">
          <SectionHeader
            title="Điều phối collector"
            description="Phân công hoặc đổi collector trực tiếp từ màn chi tiết nhiệm vụ."
          />

          <div className="space-y-5 p-5 sm:p-6">
            <div className="rounded-[22px] border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                Collector hiện tại
              </p>
              <p className="mt-2 text-base font-semibold text-[var(--text-primary)]">
                {task.collectorName || "Chưa được phân công"}
              </p>
            </div>

            {collectors.length === 0 ? (
              <EmptyState
                icon={UserRoundPlus}
                title="Chưa có collector sẵn sàng"
                description="Hãy đăng ký hoặc kích hoạt collector trước khi phân công nhiệm vụ."
                tone="slate"
              />
            ) : (
              <>
                <div>
                  <label htmlFor="collector-assignment" className="field-label">
                    Chọn collector
                  </label>
                  <select
                    id="collector-assignment"
                    value={selectedCollectorId}
                    onChange={(event) => setSelectedCollectorId(event.target.value)}
                    className="shell-select"
                  >
                    <option value="">Chọn collector</option>
                    {collectors.map((collector) => (
                      <option key={collector.userId} value={collector.userId}>
                        {getCollectorName(collector)} ({collector.email})
                      </option>
                    ))}
                  </select>
                  <p className="field-helper">
                    {task.collectorUserId
                      ? "Bạn có thể chọn người khác để phân công lại nếu cần."
                      : "Nhiệm vụ sẽ xuất hiện ngay trong danh sách của collector sau khi phân công."}
                  </p>
                </div>

                <Button
                  className="w-full"
                  onClick={() => assignTask.mutate(selectedCollectorId)}
                  disabled={!selectedCollectorId || assignTask.isPending}
                >
                  <UserRoundPlus className="mr-2 h-4 w-4" />
                  {assignTask.isPending ? "Đang cập nhật..." : task.collectorUserId ? "Phân công lại" : "Phân công collector"}
                </Button>
              </>
            )}

            <div className="rounded-[22px] border border-[rgba(31,93,78,0.1)] bg-[var(--primary-50)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
              Trạng thái hiển thị ở đây được đồng bộ trực tiếp với collector và báo cáo của công dân. Khi collector hoàn tất, nhiệm vụ sẽ tự chuyển sang hoàn thành.
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
