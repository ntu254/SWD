import { MessageSquareText, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";

type TipKey = "photo" | "wasteType" | "location" | "weight";

interface ReportAssistantBubbleProps {
  hasImage: boolean;
  hasLocation: boolean;
  wasteTypeName?: string | null;
  areaName?: string | null;
  estimatedWeightKg?: number | null;
}

function buildCompletionLabel({
  hasImage,
  hasLocation,
  wasteTypeName,
  estimatedWeightKg,
}: ReportAssistantBubbleProps) {
  const completedSteps = [
    hasImage,
    Boolean(wasteTypeName),
    hasLocation,
    Boolean(estimatedWeightKg),
  ].filter(Boolean).length;

  if (completedSteps <= 1) {
    return "Bạn mới hoàn thành phần nền tảng. Hãy ưu tiên ảnh và vị trí trước.";
  }

  if (completedSteps === 4) {
    return "Hồ sơ đã khá đầy đủ. Bạn có thể rà lại mô tả rồi gửi báo cáo.";
  }

  return `Bạn đã xong ${completedSteps}/4 mục quan trọng. Thêm bước còn lại để báo cáo rõ ràng hơn.`;
}

export function ReportAssistantBubble(props: ReportAssistantBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTip, setActiveTip] = useState<TipKey>("photo");

  const tips = useMemo<Record<TipKey, { label: string; content: string }>>(
    () => ({
      photo: {
        label: "Ảnh hiện trường",
        content: props.hasImage
          ? "Ảnh đã có. Hãy chắc ảnh nhìn rõ cả loại rác lẫn vùng xung quanh để doanh nghiệp xác minh nhanh hơn."
          : "Chụp gần thêm một bước, lấy đủ bối cảnh xung quanh và tránh ngược sáng để doanh nghiệp dễ duyệt hơn.",
      },
      wasteType: {
        label: "Loại rác",
        content: props.wasteTypeName
          ? `Bạn đang chọn "${props.wasteTypeName}". Nếu ảnh có nhiều loại rác, hãy chọn loại chiếm phần lớn khối lượng.`
          : "Nếu còn phân vân, hãy chọn loại rác chiếm tỉ trọng lớn nhất trong ảnh. Không chắc thì mô tả thêm ở phần ghi chú.",
      },
      location: {
        label: "Ghim vị trí",
        content: props.hasLocation
          ? `Vị trí hiện tại đang neo ở ${props.areaName ?? "khu vực đã chọn"}. Hãy kiểm tra lại ghim nằm sát đống rác thay vì giữa đường.`
          : "Bật quyền vị trí hoặc ghim thủ công ngay chỗ rác. Sai vài chục mét là collector có thể phải gọi lại để hỏi.",
      },
      weight: {
        label: "Ước lượng số ký",
        content: props.estimatedWeightKg
          ? `Bạn đã ước lượng khoảng ${props.estimatedWeightKg} kg. Con số này giúp doanh nghiệp ưu tiên và chuẩn bị năng lực phù hợp.`
          : "Không cần quá chính xác. Hãy nhập số ký ước tính gần đúng nhất để doanh nghiệp đánh giá mức độ ưu tiên tốt hơn.",
      },
    }),
    [props]
  );

  const recommendation = useMemo(() => {
    if (!props.hasImage) {
      return "Gợi ý ưu tiên: thêm ảnh rõ nét trước.";
    }
    if (!props.wasteTypeName) {
      return "Gợi ý ưu tiên: xác nhận loại rác.";
    }
    if (!props.hasLocation) {
      return "Gợi ý ưu tiên: ghim lại vị trí thật sát điểm rác.";
    }
    if (!props.estimatedWeightKg) {
      return "Gợi ý ưu tiên: thêm số ký ước tính.";
    }

    return "Gợi ý ưu tiên: thêm mô tả ngắn về mùi, độ cồng kềnh hoặc điểm nhận diện.";
  }, [props]);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-40 flex items-end sm:bottom-6 sm:right-6">
      {isOpen ? (
        <div className="pointer-events-auto mb-3 w-[320px] rounded-[28px] border border-[rgba(31,93,78,0.14)] bg-white/95 p-4 shadow-[0_18px_45px_rgba(22,42,31,0.14)] backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] bg-[var(--primary-100)] text-[var(--primary-700)]">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Trợ lý AI báo cáo
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Gợi ý nhanh theo form hiện tại
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] transition-colors hover:bg-white hover:text-[var(--text-primary)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 rounded-[22px] border border-[rgba(31,93,78,0.1)] bg-[var(--primary-50)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--primary-700)]">
              Đánh giá nhanh
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--text-primary)]">
              {buildCompletionLabel(props)}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              {recommendation}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(Object.keys(tips) as TipKey[]).map((tipKey) => (
              <button
                key={tipKey}
                type="button"
                onClick={() => setActiveTip(tipKey)}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
                  activeTip === tipKey
                    ? "bg-[var(--primary-600)] text-white"
                    : "bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:bg-[var(--primary-50)]"
                }`}
              >
                {tips[tipKey].label}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-[22px] border border-[var(--stroke-soft)] bg-white/88 p-4">
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              {tips[activeTip].content}
            </p>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="pointer-events-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary-600)] text-white shadow-[0_14px_30px_rgba(31,93,78,0.24)] transition-transform hover:-translate-y-0.5"
      >
        <MessageSquareText className="h-5 w-5" />
      </button>
    </div>
  );
}
