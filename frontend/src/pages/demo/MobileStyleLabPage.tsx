import { Smartphone, Sparkles } from "lucide-react";

import { PageHeader, PagePlaceholder } from "../../components/ui/page";

export function MobileStyleLabPage() {
  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Khu vực demo</span>}
        title="Phòng thí nghiệm giao diện di động"
        description="Tuyến nội bộ này được giữ lại để thử nghiệm thiết kế và kiểm tra giao diện di động."
      />

      <PagePlaceholder
        icon={Smartphone}
        eyebrow={<span className="shell-chip shell-chip-accent">Bản xem trước nội bộ</span>}
        title="Phòng thí nghiệm giao diện di động đã sẵn sàng cho vòng tiếp theo."
        description="Hãy dùng màn này như một khu thử nghiệm an toàn cho các ý tưởng mobile-first mà không ảnh hưởng tới luồng vai trò đang chạy thực tế."
        tone="violet"
        action={
          <div className="inline-flex items-center gap-2 rounded-full bg-white/82 px-4 py-2 text-sm font-semibold text-[var(--text-primary)]">
            <Sparkles className="h-4 w-4 text-[var(--tone-strong)]" />
            Dành cho demo nội bộ
          </div>
        }
      />
    </div>
  );
}
