import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import { complaintsApi } from "../../api";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  EmptyState,
  FilterTabs,
  ModalShell,
  PageHeader,
  SectionCard,
  SectionHeader,
  StatCard,
} from "../../components/ui/page";

type Complaint = {
  complaintId: string;
  createdByUserId: string;
  createdByName: string;
  reportId?: string | null;
  visitId?: string | null;
  title: string;
  content: string;
  category: string;
  priority: string;
  status: string;
  adminResponse: string | null;
  createdAt: string;
  resolvedAt: string | null;
};

/* ─── Backend uses "Pending" / "Resolved" as status values ─── */
const STATUS_TABS = [
  { label: "TẤT CẢ", value: "ALL" },
  { label: "ĐANG CHỜ", value: "Pending" },
  { label: "ĐÃ XỬ LÝ", value: "Resolved" },
] as const;

const CATEGORY_MAP: Record<string, { label: string; emoji: string }> = {
  COLLECTION_ISSUE: { label: "Vấn đề thu gom", emoji: "🚛" },
  POINTS_ERROR: { label: "Lỗi điểm thưởng", emoji: "⭐" },
  SERVICE_ISSUE: { label: "Chất lượng dịch vụ", emoji: "🔧" },
  BUG: { label: "Lỗi ứng dụng", emoji: "🐛" },
  FEATURE: { label: "Đề xuất tính năng", emoji: "💡" },
  OTHER: { label: "Khác", emoji: "💬" },
};

function formatCategory(category: string) {
  const found = CATEGORY_MAP[category];
  return found ? `${found.emoji} ${found.label}` : category;
}

function formatPriority(priority: string) {
  switch (priority) {
    case "Urgent":
      return "Khẩn cấp";
    case "High":
      return "Cao";
    case "Normal":
      return "Bình thường";
    case "Low":
      return "Thấp";
    default:
      return priority;
  }
}

function getPriorityVariant(priority: string) {
  switch (priority) {
    case "Urgent":
      return "destructive" as const;
    case "High":
      return "pending" as const;
    case "Normal":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "Pending":
      return { variant: "pending" as const, label: "Đang chờ", icon: Clock };
    case "Resolved":
      return { variant: "collected" as const, label: "Đã xử lý", icon: CheckCircle2 };
    case "Rejected":
      return { variant: "destructive" as const, label: "Từ chối", icon: XCircle };
    default:
      return { variant: "outline" as const, label: status, icon: AlertCircle };
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isPending(status: string) {
  return status === "Pending" || status === "PENDING" || status === "OPEN";
}

export function AdminComplaintsPage() {
  const queryClient = useQueryClient();
  const [statusTab, setStatusTab] = useState<string>("ALL");
  const [resolveModal, setResolveModal] = useState<Complaint | null>(null);
  const [detailModal, setDetailModal] = useState<Complaint | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [note, setNote] = useState("");
  const [isAccepted, setIsAccepted] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-complaints", statusTab],
    queryFn: () =>
      complaintsApi
        .getAll(0, statusTab === "ALL" ? undefined : statusTab)
        .then((response) => response.data),
  });

  const resolveComplaint = useMutation({
    mutationFn: ({ id, body }: { id: string; body: object }) =>
      complaintsApi.resolve(id, body),
    onSuccess: () => {
      toast.success("Đã xử lý khiếu nại thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-complaints"] });
      setResolveModal(null);
      setAdminResponse("");
      setNote("");
      setIsAccepted(true);
    },
    onError: () => toast.error("Xử lý khiếu nại thất bại. Vui lòng thử lại."),
  });

  const complaints: Complaint[] = data?.data?.content ?? [];
  const pendingCount = complaints.filter((c) => isPending(c.status)).length;
  const resolvedCount = complaints.filter((c) => c.status === "Resolved").length;

  const openResolveModal = (complaint: Complaint) => {
    setResolveModal(complaint);
    setDetailModal(null);
    setAdminResponse("");
    setNote("");
    setIsAccepted(true);
  };

  const openDetailModal = (complaint: Complaint) => {
    setDetailModal(complaint);
  };

  const submitResolve = () => {
    if (!resolveModal) return;

    if (!adminResponse.trim()) {
      toast.warning("Vui lòng nhập phản hồi cho người dùng.");
      return;
    }

    resolveComplaint.mutate({
      id: resolveModal.complaintId,
      body: {
        decision: isAccepted ? "ACCEPTED" : "REJECTED",
        note: note.trim() || (isAccepted ? "Khiếu nại đã được chấp nhận và xử lý." : "Khiếu nại đã được xem xét nhưng không được chấp nhận."),
        isAccepted,
        adminResponse: adminResponse.trim(),
      },
    });
  };

  return (
    <div className="space-y-4 lg:space-y-5">
      {/* ─── Resolve Modal ─── */}
      {resolveModal ? (
        <ModalShell
          title="Xử lý khiếu nại"
          description="Xem xét nội dung khiếu nại, đưa ra quyết định và phản hồi cho người dùng."
          icon={ShieldCheck}
          onClose={() => setResolveModal(null)}
          widthClassName="max-w-2xl"
          footer={
            <>
              <Button variant="outline" onClick={() => setResolveModal(null)}>
                Hủy
              </Button>
              <Button
                onClick={submitResolve}
                disabled={resolveComplaint.isPending || !adminResponse.trim()}
              >
                {resolveComplaint.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Xác nhận xử lý
                  </>
                )}
              </Button>
            </>
          }
        >
          <div className="space-y-5">
            {/* Complaint info */}
            <div className="rounded-[20px] border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] p-5">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant={getPriorityVariant(resolveModal.priority)}>
                  {formatPriority(resolveModal.priority)}
                </Badge>
                <span className="text-xs text-[var(--text-muted)]">
                  {formatCategory(resolveModal.category)}
                </span>
                <span className="text-xs text-[var(--text-muted)]">·</span>
                <span className="text-xs text-[var(--text-muted)]">
                  {formatDate(resolveModal.createdAt)}
                </span>
              </div>
              <p className="text-sm font-bold text-[var(--text-primary)]">
                {resolveModal.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                {resolveModal.content}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <User className="h-3.5 w-3.5" />
                <span>Gửi bởi: <strong>{resolveModal.createdByName}</strong></span>
              </div>
            </div>

            {/* Decision */}
            <div>
              <label className="field-label">Quyết định xử lý</label>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setIsAccepted(true)}
                  className={`flex items-center gap-3 rounded-[18px] border px-4 py-4 text-left transition-all ${
                    isAccepted
                      ? "border-[rgba(31,93,78,0.22)] bg-[var(--primary-50)] shadow-sm"
                      : "border-[var(--stroke-soft)] bg-white/80 hover:bg-[var(--bg-surface-muted)]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${
                      isAccepted
                        ? "bg-[var(--primary-200)] text-[var(--primary-700)]"
                        : "bg-[var(--bg-surface-muted)] text-[var(--text-muted)]"
                    }`}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isAccepted ? "text-[var(--primary-700)]" : "text-[var(--text-secondary)]"}`}>
                      Chấp nhận khiếu nại
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                      Xác nhận vấn đề hợp lệ và đã được giải quyết
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAccepted(false)}
                  className={`flex items-center gap-3 rounded-[18px] border px-4 py-4 text-left transition-all ${
                    !isAccepted
                      ? "border-[rgba(239,68,68,0.22)] bg-red-50 shadow-sm"
                      : "border-[var(--stroke-soft)] bg-white/80 hover:bg-[var(--bg-surface-muted)]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${
                      !isAccepted
                        ? "bg-red-100 text-red-600"
                        : "bg-[var(--bg-surface-muted)] text-[var(--text-muted)]"
                    }`}
                  >
                    <XCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${!isAccepted ? "text-red-700" : "text-[var(--text-secondary)]"}`}>
                      Từ chối khiếu nại
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                      Vấn đề không hợp lệ hoặc không xác nhận được
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Admin response to user */}
            <div>
              <label htmlFor="admin-response" className="field-label">
                Phản hồi cho người dùng <span className="text-red-500">*</span>
              </label>
              <textarea
                id="admin-response"
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                rows={4}
                className="shell-textarea"
                placeholder={
                  isAccepted
                    ? "Ví dụ: Chúng tôi đã kiểm tra và xác nhận vấn đề. Đội thu gom sẽ đến trong 24 giờ tới..."
                    : "Ví dụ: Sau khi xem xét, chúng tôi nhận thấy đơn thu gom đã được hoàn thành đúng thời hạn theo hệ thống..."
                }
              />
              <p className="field-helper">
                Phản hồi này sẽ được hiển thị cho người dùng trong lịch sử khiếu nại của họ.
              </p>
            </div>

            {/* Internal note */}
            <div>
              <label htmlFor="admin-note" className="field-label">
                Ghi chú nội bộ (tuỳ chọn)
              </label>
              <textarea
                id="admin-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="shell-textarea"
                placeholder="Ghi chú cho đội ngũ quản trị. Người dùng sẽ không thấy ghi chú này."
              />
            </div>
          </div>
        </ModalShell>
      ) : null}

      {/* ─── Detail Modal ─── */}
      {detailModal ? (
        <ModalShell
          title="Chi tiết khiếu nại"
          description={`Khiếu nại #${detailModal.complaintId.slice(0, 8)}`}
          icon={MessageSquare}
          onClose={() => setDetailModal(null)}
          widthClassName="max-w-xl"
          footer={
            <>
              <Button variant="outline" onClick={() => setDetailModal(null)}>
                Đóng
              </Button>
              {isPending(detailModal.status) ? (
                <Button onClick={() => openResolveModal(detailModal)}>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Xử lý khiếu nại này
                </Button>
              ) : null}
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={getPriorityVariant(detailModal.priority)}>
                {formatPriority(detailModal.priority)}
              </Badge>
              {(() => {
                const statusInfo = getStatusBadge(detailModal.status);
                return (
                  <Badge variant={statusInfo.variant}>
                    {statusInfo.label}
                  </Badge>
                );
              })()}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                Tiêu đề
              </p>
              <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">
                {detailModal.title}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                Nội dung
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                {detailModal.content}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  Người gửi
                </p>
                <p className="mt-1 text-sm text-[var(--text-primary)]">
                  {detailModal.createdByName}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  Loại vấn đề
                </p>
                <p className="mt-1 text-sm text-[var(--text-primary)]">
                  {formatCategory(detailModal.category)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  Ngày gửi
                </p>
                <p className="mt-1 text-sm text-[var(--text-primary)]">
                  {formatDate(detailModal.createdAt)}
                </p>
              </div>
              {detailModal.resolvedAt && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                    Ngày xử lý
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-primary)]">
                    {formatDate(detailModal.resolvedAt)}
                  </p>
                </div>
              )}
            </div>

            {detailModal.adminResponse && (
              <div className="rounded-[18px] border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                  Phản hồi quản trị
                </p>
                <p className="mt-2 text-sm leading-6 text-emerald-800">
                  {detailModal.adminResponse}
                </p>
              </div>
            )}
          </div>
        </ModalShell>
      ) : null}

      {/* ─── Header ─── */}
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Không gian quản trị</span>}
        title="Xử lý khiếu nại"
        description="Xem khiếu nại của người dùng, theo dõi trạng thái hiện tại và kết thúc quy trình với phản hồi từ quản trị."
      />

      {/* ─── Stats ─── */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={AlertCircle}
          label="Đang chờ xử lý"
          value={pendingCount}
          description="Các khiếu nại vẫn đang chờ phản hồi cuối cùng."
          tone="sand"
          featured
        />
        <StatCard
          icon={CheckCircle2}
          label="Đã xử lý"
          value={resolvedCount}
          description="Những vấn đề đã được xem xét và đóng lại."
          tone="mint"
        />
        <StatCard
          icon={MessageSquare}
          label="Hiển thị theo bộ lọc"
          value={complaints.length}
          description="Kết quả khớp với tab trạng thái hiện tại."
          tone="sky"
        />
      </div>

      {/* ─── List ─── */}
      <SectionCard className="overflow-hidden">
        <SectionHeader
          title="Danh sách khiếu nại"
          description="Lọc hàng chờ theo trạng thái và mở bất kỳ mục nào để phản hồi."
        />

        <div className="space-y-5 p-5 sm:p-6">
          <div className="shell-toolbar">
            <FilterTabs
              value={STATUS_TABS.find((item) => item.value === statusTab)?.label ?? "TẤT CẢ"}
              options={STATUS_TABS.map((item) => item.label)}
              onChange={(value) =>
                setStatusTab(STATUS_TABS.find((item) => item.label === value)?.value ?? "ALL")
              }
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="shimmer h-28 rounded-[24px]" />
              ))}
            </div>
          ) : complaints.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="Không có khiếu nại trong chế độ xem này"
              description="Hãy thử tab trạng thái khác hoặc kiểm tra lại sau khi có vấn đề mới được gửi."
              tone="slate"
            />
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => {
                const statusInfo = getStatusBadge(complaint.status);
                const StatusIcon = statusInfo.icon;
                const canResolve = isPending(complaint.status);

                return (
                  <div
                    key={complaint.complaintId}
                    className="shell-card shell-card-hover cursor-pointer rounded-[26px] p-4 transition-all sm:p-5"
                    onClick={() => openDetailModal(complaint)}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1 space-y-3">
                        {/* Title row */}
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-[var(--text-primary)]">
                            {complaint.title}
                          </p>
                          <Badge variant={getPriorityVariant(complaint.priority)}>
                            {formatPriority(complaint.priority)}
                          </Badge>
                          <Badge variant={statusInfo.variant}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--text-secondary)]">
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {complaint.createdByName}
                          </span>
                          <span>{formatCategory(complaint.category)}</span>
                          <span>{formatDate(complaint.createdAt)}</span>
                        </div>

                        {/* Content */}
                        <p className="line-clamp-2 max-w-4xl text-sm leading-6 text-[var(--text-secondary)]">
                          {complaint.content}
                        </p>

                        {/* Admin response if exists */}
                        {complaint.adminResponse ? (
                          <div className="rounded-[18px] border border-emerald-100 bg-emerald-50 px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-emerald-700">
                              Phản hồi quản trị
                            </p>
                            <p className="mt-1 text-sm leading-6 text-emerald-800">
                              {complaint.adminResponse}
                            </p>
                          </div>
                        ) : null}
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 gap-2">
                        {canResolve ? (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              openResolveModal(complaint);
                            }}
                          >
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Xử lý
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetailModal(complaint);
                            }}
                          >
                            Xem chi tiết
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
