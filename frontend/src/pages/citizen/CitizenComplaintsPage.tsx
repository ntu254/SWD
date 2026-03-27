import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquareWarning,
  Send,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-toastify";

import { complaintsApi, reportsApi } from "../../api";
import { Button } from "../../components/ui/button";
import { PageHeader, SectionCard, SectionHeader } from "../../components/ui/page";

type ComplaintCategory =
  | "COLLECTION_ISSUE"
  | "POINTS_ERROR"
  | "SERVICE_ISSUE"
  | "BUG"
  | "OTHER";

type ComplaintPriority = "Normal" | "High" | "Urgent";

interface ComplaintItem {
  complaintId: string;
  createdByUserId: string;
  createdByName?: string;
  reportId?: string;
  visitId?: string;
  title: string;
  content: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: string;
  adminResponse?: string;
  createdAt: string;
  resolvedAt?: string;
}

interface ReportItem {
  reportId: string;
  wasteTypeName?: string;
  createdAt: string;
}

const categories: { value: ComplaintCategory; label: string; emoji: string }[] = [
  { value: "COLLECTION_ISSUE", label: "Vấn đề thu gom", emoji: "🚛" },
  { value: "POINTS_ERROR", label: "Lỗi điểm thưởng", emoji: "⭐" },
  { value: "SERVICE_ISSUE", label: "Chất lượng dịch vụ", emoji: "🔧" },
  { value: "BUG", label: "Lỗi ứng dụng", emoji: "🐛" },
  { value: "OTHER", label: "Khác", emoji: "💬" },
];

const priorities: { value: ComplaintPriority; label: string; color: string }[] = [
  { value: "Normal", label: "Bình thường", color: "var(--primary-600)" },
  { value: "High", label: "Cao", color: "#F59E0B" },
  { value: "Urgent", label: "Khẩn cấp", color: "#EF4444" },
];

const statusConfig: Record<string, { icon: React.ElementType; label: string; className: string }> = {
  Pending: {
    icon: Clock,
    label: "Đang chờ",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  In_Progress: {
    icon: AlertCircle,
    label: "Đang xử lý",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  Resolved: {
    icon: CheckCircle2,
    label: "Đã giải quyết",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  Rejected: {
    icon: XCircle,
    label: "Từ chối",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

function formatDate(value?: string) {
  if (!value) return "--/--/----";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--/--/----";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export const CitizenComplaintsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<ComplaintCategory>("COLLECTION_ISSUE");
  const [priority, setPriority] = useState<ComplaintPriority>("Normal");
  const [selectedReportId, setSelectedReportId] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: complaintsData, isLoading: complaintsLoading } = useQuery({
    queryKey: ["citizen", "complaints", "mine"],
    queryFn: () => complaintsApi.getMine(0).then((r) => r.data?.data?.content ?? []),
  });

  const { data: reportsData } = useQuery({
    queryKey: ["citizen", "reports", "recent"],
    queryFn: () => reportsApi.getMine(0).then((r) => r.data?.data?.content?.slice(0, 5) ?? []),
  });

  const complaints: ComplaintItem[] = complaintsData ?? [];
  const recentReports: ReportItem[] = reportsData ?? [];

  const filteredComplaints =
    filterStatus === "all"
      ? complaints
      : complaints.filter((c) => c.status === filterStatus);

  const createMutation = useMutation({
    mutationFn: () =>
      complaintsApi.create({
        title: title.trim() || `Phản hồi ${categories.find((c) => c.value === category)?.label}`,
        content: content.trim(),
        category,
        priority,
        reportId: selectedReportId,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["citizen", "complaints"] });
      setTitle("");
      setContent("");
      setCategory("COLLECTION_ISSUE");
      setPriority("Normal");
      setSelectedReportId(undefined);
      toast.success("Khiếu nại đã được gửi thành công!");
    },
    onError: () => {
      toast.error("Không thể gửi khiếu nại. Vui lòng thử lại.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.warning("Vui lòng nhập nội dung khiếu nại.");
      return;
    }
    createMutation.mutate();
  };

  const pendingCount = complaints.filter((c) => c.status === "Pending").length;
  const resolvedCount = complaints.filter((c) => c.status === "Resolved").length;

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={
          <span className="shell-chip shell-chip-primary">Không gian công dân</span>
        }
        title="Phản hồi & Khiếu nại"
        description="Gửi phản hồi về dịch vụ thu gom rác, lỗi điểm thưởng hoặc bất kỳ vấn đề nào bạn gặp phải."
      />

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Tổng khiếu nại", value: complaints.length, color: "var(--primary-600)" },
          { label: "Đang chờ", value: pendingCount, color: "#F59E0B" },
          { label: "Đã giải quyết", value: resolvedCount, color: "#10B981" },
          { label: "Tỷ lệ xử lý", value: complaints.length ? `${Math.round((resolvedCount / complaints.length) * 100)}%` : "0%", color: "var(--primary-700)" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[22px] border border-[var(--stroke-soft)] bg-white/88 p-4 text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
              {stat.label}
            </p>
            <p
              className="mt-2 text-2xl font-bold tracking-[-0.04em]"
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* Form */}
        <SectionCard className="overflow-hidden">
          <SectionHeader
            title="Tạo khiếu nại mới"
            description="Mô tả vấn đề bạn gặp phải, chúng tôi sẽ phản hồi trong thời gian sớm nhất."
          />

          <form onSubmit={handleSubmit} className="grid gap-4 p-5 sm:p-6">
            {/* Category */}
            <div>
              <label className="field-label">Loại vấn đề</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${
                      category === cat.value
                        ? "bg-[var(--primary-600)] text-white shadow-sm"
                        : "border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:bg-[var(--primary-50)]"
                    }`}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="field-label">Mức ưu tiên</label>
              <div className="flex gap-2">
                {priorities.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                      priority === p.value
                        ? "text-white shadow-sm"
                        : "border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] text-[var(--text-secondary)]"
                    }`}
                    style={
                      priority === p.value
                        ? { backgroundColor: p.color }
                        : undefined
                    }
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Link report */}
            {recentReports.length > 0 && (
              <div>
                <label className="field-label">Liên kết báo cáo (tuỳ chọn)</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReportId(undefined)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                      !selectedReportId
                        ? "bg-[var(--primary-600)] text-white"
                        : "border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] text-[var(--text-secondary)]"
                    }`}
                  >
                    Không liên kết
                  </button>
                  {recentReports.map((r) => (
                    <button
                      key={r.reportId}
                      type="button"
                      onClick={() => setSelectedReportId(r.reportId)}
                      className={`max-w-[180px] truncate rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                        selectedReportId === r.reportId
                          ? "bg-[var(--primary-600)] text-white"
                          : "border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] text-[var(--text-secondary)]"
                      }`}
                    >
                      {r.wasteTypeName ?? "Báo cáo"} - {formatDate(r.createdAt)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="complaint-title" className="field-label">
                Tiêu đề (tuỳ chọn)
              </label>
              <input
                id="complaint-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="shell-input"
                placeholder="Ví dụ: Đơn thu gom đến trễ 2 ngày"
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="complaint-content" className="field-label">
                Nội dung chi tiết <span className="text-red-500">*</span>
              </label>
              <textarea
                id="complaint-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="shell-textarea"
                placeholder="Mô tả chi tiết vấn đề bạn gặp phải. Ví dụ: Tôi đã gửi báo cáo từ ngày 20/03 nhưng vẫn chưa có ai đến thu gom..."
              />
              <p className="field-helper">
                Mô tả càng chi tiết, chúng tôi xử lý càng nhanh và chính xác hơn.
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={!content.trim() || createMutation.isPending}
              className="w-full"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Gửi khiếu nại
                </>
              )}
            </Button>
          </form>
        </SectionCard>

        {/* Complaints list */}
        <div className="space-y-4">
          <SectionCard className="overflow-hidden">
            <SectionHeader
              title="Lịch sử khiếu nại"
              description={`Tổng cộng ${complaints.length} khiếu nại`}
            />

            <div className="px-5 pb-3 sm:px-6">
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all", label: "Tất cả" },
                  { value: "Pending", label: "Đang chờ" },
                  { value: "In_Progress", label: "Đang xử lý" },
                  { value: "Resolved", label: "Đã giải quyết" },
                ].map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFilterStatus(f.value)}
                    className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${
                      filterStatus === f.value
                        ? "bg-[var(--primary-600)] text-white"
                        : "border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:bg-[var(--primary-50)]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 p-5 sm:p-6">
              {complaintsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-[var(--primary-600)]" />
                </div>
              ) : filteredComplaints.length === 0 ? (
                <div className="rounded-[22px] border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] p-8 text-center">
                  <MessageSquareWarning className="mx-auto h-10 w-10 text-[var(--text-muted)]" />
                  <p className="mt-3 text-sm font-semibold text-[var(--text-secondary)]">
                    Chưa có khiếu nại nào
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Khiếu nại bạn gửi sẽ hiển thị ở đây.
                  </p>
                </div>
              ) : (
                filteredComplaints.map((complaint) => {
                  const status =
                    statusConfig[complaint.status] ?? statusConfig.Pending;
                  const StatusIcon = status.icon;

                  return (
                    <div
                      key={complaint.complaintId}
                      className="rounded-[22px] border border-[var(--stroke-soft)] bg-white/88 p-4 transition-all hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                            {complaint.title || "Khiếu nại"}
                          </p>
                          <p className="mt-1 text-xs text-[var(--text-muted)]">
                            {categories.find((c) => c.value === complaint.category)?.emoji}{" "}
                            {categories.find((c) => c.value === complaint.category)?.label ?? complaint.category}
                            {" · "}
                            {formatDate(complaint.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${status.className}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </div>

                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">
                        {complaint.content}
                      </p>

                      {complaint.adminResponse && (
                        <div className="mt-3 rounded-[16px] border border-emerald-100 bg-emerald-50 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                            Phản hồi từ Admin
                          </p>
                          <p className="mt-1 text-xs leading-5 text-emerald-800">
                            {complaint.adminResponse}
                          </p>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
                          Ưu tiên: {complaint.priority}
                        </span>
                        {complaint.resolvedAt && (
                          <span className="text-xs text-[var(--text-muted)]">
                            Xử lý: {formatDate(complaint.resolvedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};
