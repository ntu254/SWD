import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Navigation,
  PackageCheck,
  UploadCloud,
  Warehouse,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

import { reportsApi, tasksApi } from "../../api";
import type { Task, WasteReport } from "../../types";
import { MapComponent } from "../../components/maps/MapComponent";
import { StatusBadge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  EmptyState,
  PageHeader,
  PageHero,
  SectionCard,
  SectionHeader,
  StatCard,
} from "../../components/ui/page";
import { formatStatusLabel } from "../../lib/labels";
import { withReportMetadata } from "../../lib/reportMetadata";

function normalizeTaskStatus(status?: string | null) {
  if (!status) return "ASSIGNED";
  if (status === "IN_PROGRESS") return "ON_THE_WAY";
  if (status === "COLLECTED") return "COMPLETED";
  return status;
}

export const CollectorTaskPage: React.FC = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [proofFile, setProofFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [measuredWeightKg, setMeasuredWeightKg] = useState("");
  const [collectorNote, setCollectorNote] = useState("");
  const [sortingLevel, setSortingLevel] = useState("GOOD");

  const { data: taskResponse, isLoading } = useQuery({
    queryKey: ["collector-task", taskId],
    queryFn: () => tasksApi.getCollectorTaskById(taskId!).then((response) => response.data),
    enabled: !!taskId,
  });

  const task: Task | undefined = taskResponse?.data;
  const statusIndicator = normalizeTaskStatus(task?.status);

  const { data: reportResponse } = useQuery({
    queryKey: ["collector-task-report", task?.reportId],
    queryFn: () => reportsApi.getById(task!.reportId!).then((response) => response.data),
    enabled: !!task?.reportId,
  });
  const report: WasteReport | undefined = reportResponse?.data
    ? withReportMetadata(reportResponse.data as WasteReport)
    : undefined;

  const updateStatus = useMutation({
    mutationFn: () => tasksApi.updateStatus(taskId!, "ON_THE_WAY"),
    onSuccess: () => {
      toast.success("Đã cập nhật nhiệm vụ sang trạng thái đang di chuyển.");
      queryClient.invalidateQueries({ queryKey: ["collector-task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["collector-tasks"] });
    },
    onError: () => toast.error("Cập nhật trạng thái nhiệm vụ thất bại."),
  });

  const completeTask = useMutation({
    mutationFn: async () => {
      const weightValue = Number(measuredWeightKg);
      if (!proofFile) {
        throw new Error("Cần có ảnh minh chứng để hoàn thành nhiệm vụ.");
      }
      if (!measuredWeightKg.trim() || Number.isNaN(weightValue) || weightValue <= 0) {
        throw new Error("Khối lượng cân phải là số lớn hơn 0.");
      }

      let photoUrl: string | undefined;
      try {
        photoUrl = await tasksApi
          .uploadEvidence(proofFile)
          .then((response) => response.data?.data as string | undefined);
      } catch {
        // Fallback for local/dev when image host is not configured.
        photoUrl = imagePreview ?? undefined;
        if (!photoUrl) {
          throw new Error("Tải ảnh minh chứng thất bại.");
        }
        toast.warn("Dịch vụ tải ảnh minh chứng tạm không khả dụng, đang dùng ảnh nội bộ.");
      }

      const wasteItems =
        report?.wasteTypeId
          ? [
              {
                wasteTypeId: report.wasteTypeId,
                weightKg: weightValue,
                sortingLevel,
                contaminationNote: collectorNote || undefined,
              },
            ]
          : [];

      return tasksApi.completeTask(taskId!, {
        visitStatus: "COMPLETED",
        collectorNote,
        photoUrls: photoUrl ? [photoUrl] : [],
        wasteItems,
      });
    },
    onSuccess: () => {
      toast.success("Đã hoàn thành nhiệm vụ và đồng bộ sang tiến trình của công dân.");
      queryClient.invalidateQueries({ queryKey: ["collector-task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["collector-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["citizen-reports"] });
      navigate("/collector/tasks");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response?.data
                ?.message ?? "Hoàn thành nhiệm vụ thất bại.";
      toast.error(message);
    },
  });

  const routeStarted = statusIndicator === "ON_THE_WAY";
  const alreadyCollected = statusIndicator === "COMPLETED";
  const parsedWeightKg = Number(measuredWeightKg);
  const hasValidWeight =
    measuredWeightKg.trim().length > 0 &&
    !Number.isNaN(parsedWeightKg) &&
    parsedWeightKg > 0;
  const completionLocked = statusIndicator === "ASSIGNED" || alreadyCollected;

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const mapCenter = useMemo<[number, number] | undefined>(() => {
    if (!report) return undefined;
    return [report.latitude, report.longitude];
  }, [report]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  if (!task) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Không tìm thấy nhiệm vụ"
        description="Không thể tải nhiệm vụ này hoặc nó không còn được giao cho tài khoản của bạn."
      />
    );
  }

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Không gian thu gom</span>}
        title="Thực hiện nhiệm vụ"
        description="Quản lý điểm dừng hiện tại, xác minh minh chứng và hoàn tất việc thu gom."
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        }
      />

      <PageHero
        eyebrow={<span className="shell-chip shell-chip-accent">Điểm dừng được giao</span>}
        title={task.areaName || "Nhiệm vụ thu gom"}
        description={report?.description || "Không có mô tả đi kèm báo cáo."}
        tone={alreadyCollected ? "mint" : routeStarted ? "sky" : "sand"}
        aside={
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  Mã nhiệm vụ
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                  {task.taskId}
                </p>
              </div>
              <StatusBadge status={statusIndicator} />
            </div>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Warehouse}
          label="Đơn vị giao"
          value={task.enterpriseName}
          description="Doanh nghiệp chịu trách nhiệm cho nhiệm vụ này"
          tone="slate"
        />
        <StatCard
          icon={Navigation}
          label="Lịch hẹn"
          value={task.scheduledDate || "Hôm nay"}
          description="Ngày thực hiện dự kiến hiện tại"
          tone="sky"
        />
        <StatCard
          icon={PackageCheck}
          label="Trạng thái"
          value={formatStatusLabel(statusIndicator)}
          description="Trạng thái trực tiếp của nhiệm vụ"
          tone={alreadyCollected ? "mint" : "sand"}
          featured
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
        <div className="space-y-4 lg:space-y-5">
          <SectionCard className="overflow-hidden">
            <SectionHeader
              title="Tổng quan nhiệm vụ"
              description="Ngữ cảnh chính từ dữ liệu phân công hiện tại."
            />

            <div className="space-y-5 p-5 sm:p-6">
              <div className="rounded-[24px] border border-[rgba(31,93,78,0.12)] bg-[var(--primary-50)] p-4">
                <div className="flex items-start gap-3">
                  <div className="shell-icon-chip h-11 w-11 shrink-0 bg-[var(--primary-100)] text-[var(--primary-700)]">
                    <AlertTriangle className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {report?.wasteTypeName || "Không rõ loại rác"}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                      {report?.description || "Không có mô tả"}
                    </p>
                  </div>
                </div>
              </div>

              {statusIndicator === "ASSIGNED" ? (
                <div className="rounded-[22px] border border-[rgba(78,123,217,0.16)] bg-[var(--accent-100)] p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        Bắt đầu lộ trình
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                        Hãy chuyển nhiệm vụ sang trạng thái đang di chuyển trước khi mở biểu mẫu hoàn thành.
                      </p>
                    </div>
                    <Button type="button" onClick={() => updateStatus.mutate()} disabled={updateStatus.isPending}>
                      <Navigation className="mr-2 h-4 w-4" />
                      {updateStatus.isPending ? "Đang cập nhật..." : "Bắt đầu lộ trình"}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </SectionCard>

          {mapCenter ? (
            <SectionCard className="overflow-hidden">
              <SectionHeader
                title="Bản đồ vị trí"
                description="Vị trí báo cáo được ghim cho điểm dừng này."
              />

              <div className="space-y-4 p-5 sm:p-6">
                <MapComponent
                  points={[
                    {
                      id: task.taskId,
                      lat: mapCenter[0],
                      lng: mapCenter[1],
                      status: statusIndicator,
                    },
                  ]}
                  center={mapCenter}
                  zoom={15}
                  interactive={false}
                />
              </div>
            </SectionCard>
          ) : null}
        </div>

        <SectionCard className="overflow-hidden">
          <SectionHeader
            title="Biểu mẫu hoàn tất"
            description="Gửi minh chứng và thông tin rác để đóng nhiệm vụ này."
          />

          <div className="p-5 sm:p-6">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                completeTask.mutate();
              }}
              className="space-y-5"
            >
              <div
                className={`space-y-5 transition-opacity ${
                  statusIndicator === "ASSIGNED" ? "pointer-events-none opacity-55" : ""
                }`}
              >
                <div>
                  <label htmlFor="collector-proof" className="field-label">
                    Ảnh minh chứng thu gom
                  </label>
                  <div
                    className={`relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-[24px] border-2 border-dashed p-4 transition-colors ${
                      imagePreview
                        ? "border-[rgba(31,93,78,0.24)] bg-[var(--primary-50)]"
                        : "border-[rgba(32,48,51,0.16)] bg-[var(--bg-surface-muted)]"
                    }`}
                  >
                    {imagePreview ? (
                      <div className="relative h-full w-full">
                        <img
                          src={imagePreview}
                          alt="Collection proof preview"
                          className="h-full min-h-[188px] w-full rounded-[18px] object-cover"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="absolute bottom-3 right-3"
                          onClick={() => {
                            setImagePreview(null);
                            setProofFile(null);
                          }}
                        >
                          Đổi ảnh
                        </Button>
                      </div>
                    ) : (
                      <label
                        htmlFor="collector-proof"
                        className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-3 text-center"
                      >
                        <div className="shell-icon-chip h-16 w-16 rounded-[22px]">
                          <UploadCloud className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-[var(--text-primary)]">
                            Tải ảnh minh chứng
                          </p>
                          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                            Thêm ảnh rõ ràng sau khi thu gom trước khi đóng nhiệm vụ.
                          </p>
                        </div>
                      </label>
                    )}
                  </div>
                  <input
                    id="collector-proof"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>

                <div>
                  <label htmlFor="measured-weight" className="field-label">
                    Cân tại chỗ (kg)
                  </label>
                  <div className="rounded-[22px] border border-[rgba(31,93,78,0.14)] bg-[var(--primary-50)] p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          Cân lượng rác đã thu gom trước khi hoàn tất
                        </p>
                        <p className="text-sm leading-6 text-[var(--text-secondary)]">
                          Nhiệm vụ chỉ có thể đóng sau khi đã nhập khối lượng cân thực tế.
                        </p>
                      </div>
                      <div className="rounded-[18px] bg-white/82 px-4 py-3 text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                          Khối lượng ghi nhận
                        </p>
                        <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                          {hasValidWeight ? `${parsedWeightKg.toFixed(1)} kg` : "--"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Input
                        id="measured-weight"
                        type="number"
                        step="0.1"
                        min="0.1"
                        required
                        placeholder="ví dụ 15.5"
                        value={measuredWeightKg}
                        onChange={(event) => setMeasuredWeightKg(event.target.value)}
                      />
                      <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
                        Nhập đúng khối lượng cân thực tế theo kilogram, không phải ước lượng.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="sorting-level" className="field-label">
                    Chất lượng phân loại
                  </label>
                  <select
                    id="sorting-level"
                    value={sortingLevel}
                    onChange={(event) => setSortingLevel(event.target.value)}
                    className="shell-select"
                  >
                    <option value="GOOD">Tốt</option>
                    <option value="FAIR">Khá</option>
                    <option value="POOR">Kém</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="collector-note" className="field-label">
                    Ghi chú của nhân viên
                  </label>
                  <textarea
                    id="collector-note"
                    rows={4}
                    className="shell-textarea"
                    placeholder="Thêm ghi chú hiện trường, rủi ro lẫn tạp chất hoặc vấn đề tiếp cận."
                    value={collectorNote}
                    onChange={(event) => setCollectorNote(event.target.value)}
                  />
                </div>
              </div>

              {statusIndicator === "ASSIGNED" ? (
                <div className="rounded-[20px] border border-[rgba(186,135,60,0.18)] bg-[var(--warning-50)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
                  Hãy bắt đầu lộ trình trước để mở khóa biểu mẫu hoàn tất.
                </div>
              ) : !proofFile || !hasValidWeight ? (
                <div className="rounded-[20px] border border-[rgba(78,123,217,0.16)] bg-[var(--accent-100)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
                  Cần thêm ảnh minh chứng và khối lượng cân để có thể hoàn tất.
                </div>
              ) : null}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={
                  completionLocked ||
                  !proofFile ||
                  !hasValidWeight ||
                  completeTask.isPending
                }
              >
                <PackageCheck className="mr-2 h-4.5 w-4.5" />
                {completeTask.isPending
                  ? "Đang gửi..."
                  : alreadyCollected
                    ? "Đã hoàn thành nhiệm vụ"
                    : "Đánh dấu hoàn thành"}
              </Button>
            </form>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
