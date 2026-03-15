import { Leaf } from "lucide-react";

import { cn } from "../../lib/utils";

type BrandMarkProps = {
  compact?: boolean;
  caption?: string;
  className?: string;
};

export function BrandMark({
  compact = false,
  caption = "Không gian vận hành tuần hoàn",
  className,
}: BrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-[22px] border border-white/14 bg-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-sm",
          compact ? "h-11 w-11" : "h-14 w-14",
        )}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-[18px] bg-[var(--primary-100)] text-[var(--primary-800)]">
          <Leaf className={compact ? "h-4.5 w-4.5" : "h-5 w-5"} />
        </div>
      </div>

      <div className="min-w-0">
        <p
          className={cn(
            "truncate font-semibold tracking-[-0.05em] text-[var(--text-primary)]",
            compact ? "text-lg text-display" : "text-2xl text-display",
          )}
        >
          GreenLoop
        </p>
        <p className="truncate text-sm text-[var(--text-secondary)]">
          {caption}
        </p>
      </div>
    </div>
  );
}
