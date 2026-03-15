import type { CSSProperties, ElementType, ReactNode } from "react";

import { X } from "lucide-react";

import { cn } from "../../lib/utils";

type Tone = "mint" | "sky" | "peach" | "sand" | "violet" | "slate";

const toneStyles: Record<Tone, CSSProperties> = {
  mint: {
    ["--tone-soft" as string]: "rgba(227, 239, 231, 0.96)",
    ["--tone-strong" as string]: "var(--primary-700)",
    ["--tone-border" as string]: "rgba(31, 93, 78, 0.14)",
    ["--tone-gradient" as string]: "rgba(236, 246, 240, 0.95)",
  },
  sky: {
    ["--tone-soft" as string]: "rgba(237, 243, 255, 0.96)",
    ["--tone-strong" as string]: "var(--accent-600)",
    ["--tone-border" as string]: "rgba(78, 123, 217, 0.14)",
    ["--tone-gradient" as string]: "rgba(240, 246, 255, 0.95)",
  },
  peach: {
    ["--tone-soft" as string]: "rgba(253, 240, 234, 0.96)",
    ["--tone-strong" as string]: "var(--peach-600)",
    ["--tone-border" as string]: "rgba(217, 124, 87, 0.14)",
    ["--tone-gradient" as string]: "rgba(255, 244, 239, 0.95)",
  },
  sand: {
    ["--tone-soft" as string]: "rgba(251, 245, 231, 0.96)",
    ["--tone-strong" as string]: "var(--warning-600)",
    ["--tone-border" as string]: "rgba(186, 135, 60, 0.14)",
    ["--tone-gradient" as string]: "rgba(255, 248, 235, 0.95)",
  },
  violet: {
    ["--tone-soft" as string]: "rgba(238, 236, 255, 0.96)",
    ["--tone-strong" as string]: "#5c55a2",
    ["--tone-border" as string]: "rgba(92, 85, 162, 0.14)",
    ["--tone-gradient" as string]: "rgba(243, 241, 255, 0.95)",
  },
  slate: {
    ["--tone-soft" as string]: "rgba(238, 242, 240, 0.96)",
    ["--tone-strong" as string]: "var(--text-secondary)",
    ["--tone-border" as string]: "rgba(66, 86, 91, 0.14)",
    ["--tone-gradient" as string]: "rgba(241, 245, 243, 0.95)",
  },
};

type PageHeaderProps = {
  eyebrow?: ReactNode;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className="space-y-3">
        {eyebrow ? <div>{eyebrow}</div> : null}
        <div className="space-y-2">
          <h1 className="text-display text-3xl font-semibold tracking-[-0.06em] text-[var(--text-primary)] sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      {actions ? (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      ) : null}
    </div>
  );
}

type PageHeroProps = {
  eyebrow?: ReactNode;
  title: string;
  description: ReactNode;
  action?: ReactNode;
  aside?: ReactNode;
  tone?: Tone;
  className?: string;
};

export function PageHero({
  eyebrow,
  title,
  description,
  action,
  aside,
  tone = "mint",
  className,
}: PageHeroProps) {
  return (
    <div
      style={toneStyles[tone]}
      className={cn(
        "shell-hero grid gap-3 p-4 sm:gap-4 sm:p-5 lg:grid-cols-[minmax(0,1.12fr)_minmax(200px,0.88fr)] lg:items-center",
        className,
      )}
    >
      <div className="space-y-2.5">
        {eyebrow ? <div>{eyebrow}</div> : null}
        <div className="space-y-2">
          <h2 className="text-display text-[1.65rem] font-semibold tracking-[-0.045em] text-[var(--text-primary)] sm:text-[1.85rem]">
            {title}
          </h2>
          <p className="max-w-2xl text-xs leading-5 text-[var(--text-secondary)] sm:text-sm sm:leading-6">
            {description}
          </p>
        </div>
        {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
      </div>

      {aside ? (
        <div className="shell-card border-[var(--tone-border)] bg-[var(--tone-gradient)] p-3.5 sm:p-4">
          {aside}
        </div>
      ) : null}
    </div>
  );
}

type StatCardProps = {
  icon: ElementType;
  label: string;
  value: ReactNode;
  meta?: ReactNode;
  description?: ReactNode;
  tone?: Tone;
  featured?: boolean;
  compact?: boolean;
  className?: string;
  footer?: ReactNode;
};

export function StatCard({
  icon: Icon,
  label,
  value,
  meta,
  description,
  tone = "mint",
  featured = false,
  compact = false,
  className,
  footer,
}: StatCardProps) {
  return (
    <div
      style={toneStyles[tone]}
      className={cn(
        "relative overflow-hidden border",
        compact ? "rounded-2xl p-3 sm:p-3.5" : "rounded-3xl p-4 sm:p-[1.125rem]",
        featured
          ? "border-[var(--tone-border)] bg-[var(--tone-gradient)] shadow-[var(--shadow-md)]"
          : "bg-white/90 shadow-[var(--shadow-sm)]",
        className,
      )}
    >
      <div className="absolute inset-x-6 top-0 h-1 rounded-full bg-[var(--tone-strong)]/25" />
      <div className={cn("flex items-start justify-between gap-2.5", compact ? "mb-3" : "mb-4")}>
        <div
          className={cn(
            "shell-icon-chip bg-[var(--tone-soft)] text-[var(--tone-strong)]",
            compact ? "h-8 w-8" : "h-9 w-9",
          )}
        >
          <Icon className={cn(compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
        </div>
        {meta ? (
          <span
            className={cn(
              "rounded-full bg-white/70 font-semibold text-[var(--tone-strong)]",
              compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
            )}
          >
            {meta}
          </span>
        ) : null}
      </div>

      <div className={cn(compact ? "space-y-1" : "space-y-1.5")}>
        <p
          className={cn(
            "font-medium uppercase tracking-[0.04em] text-[var(--text-secondary)]",
            compact ? "text-[11px]" : "text-xs",
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "font-semibold tracking-[-0.04em] text-[var(--text-primary)]",
            compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-[1.7rem]",
          )}
        >
          {value}
        </p>
        {description ? (
          <p
            className={cn(
              "text-[var(--text-secondary)]",
              compact
                ? "line-clamp-2 text-[11px] leading-[1.125rem] sm:text-xs sm:leading-5"
                : "text-xs leading-5 sm:text-sm sm:leading-6",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>

      {footer ? <div className={cn(compact ? "mt-2.5" : "mt-3.5")}>{footer}</div> : null}
    </div>
  );
}

type SectionCardProps = {
  children: ReactNode;
  className?: string;
};

export function SectionCard({ children, className }: SectionCardProps) {
  return <div className={cn("shell-card min-w-0", className)}>{children}</div>;
}

type SectionHeaderProps = {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function SectionHeader({
  title,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-[var(--stroke-soft)] px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6",
        className,
      )}
    >
      <div className="space-y-1">
        <h3 className="text-lg font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
          {title}
        </h3>
        {description ? (
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  );
}

type EmptyStateProps = {
  icon: ElementType;
  title: string;
  description: ReactNode;
  action?: ReactNode;
  tone?: Tone;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "mint",
  className,
}: EmptyStateProps) {
  return (
    <div style={toneStyles[tone]} className={cn("shell-empty", className)}>
      <div className="shell-icon-chip bg-[var(--tone-soft)] text-[var(--tone-strong)]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-2">
        <p className="text-base font-semibold text-[var(--text-primary)]">
          {title}
        </p>
        <p className="max-w-md text-sm leading-6 text-[var(--text-secondary)]">
          {description}
        </p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

type PagePlaceholderProps = {
  icon: ElementType;
  title: string;
  description: ReactNode;
  eyebrow?: ReactNode;
  action?: ReactNode;
  tone?: Tone;
  className?: string;
};

export function PagePlaceholder({
  icon: Icon,
  title,
  description,
  eyebrow,
  action,
  tone = "slate",
  className,
}: PagePlaceholderProps) {
  return (
    <div
      style={toneStyles[tone]}
      className={cn("placeholder-panel p-8 sm:p-10", className)}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(220px,0.9fr)] lg:items-center">
        <div className="space-y-4">
          {eyebrow ? <div>{eyebrow}</div> : null}
          <div className="space-y-3">
            <div className="shell-icon-chip h-14 w-14 bg-[var(--tone-soft)] text-[var(--tone-strong)]">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="text-display text-3xl font-semibold tracking-[-0.06em] text-[var(--text-primary)]">
              {title}
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
              {description}
            </p>
          </div>
        </div>
        <div className="rounded-[26px] border border-[var(--tone-border)] bg-[var(--tone-gradient)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
            Bản phát hành tiếp theo
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
            Khu vực này được giữ cho luồng tính năng tiếp theo theo từng vai trò
            và hiện đã đồng bộ với giao diện chung của GreenLoop mà không thay đổi
            hành vi backend.
          </p>
          {action ? <div className="mt-5">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}

type FilterTabsProps = {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  className?: string;
};

export function FilterTabs({
  value,
  options,
  onChange,
  className,
}: FilterTabsProps) {
  return (
    <div
      className={cn(
        "inline-flex flex-wrap items-center gap-1 rounded-full border border-[var(--stroke-soft)] bg-white/82 p-1 shadow-[0_10px_20px_rgba(82,92,110,0.06)]",
        className,
      )}
    >
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "rounded-full px-3.5 py-2 text-xs font-semibold tracking-[0.04em] transition-all",
              active
                ? "bg-[var(--primary-100)] text-[var(--primary-800)] shadow-[0_8px_18px_rgba(31,93,78,0.14)]"
                : "text-[var(--text-secondary)] hover:bg-white hover:text-[var(--text-primary)]",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

type ModalShellProps = {
  title: string;
  description?: ReactNode;
  icon?: ElementType;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  widthClassName?: string;
};

export function ModalShell({
  title,
  description,
  icon: Icon,
  onClose,
  children,
  footer,
  widthClassName = "max-w-md",
}: ModalShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(31,39,39,0.22)] p-4 backdrop-blur-sm">
      <div className={cn("shell-modal w-full", widthClassName)}>
        <div className="flex items-start justify-between gap-4 px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            {Icon ? (
              <div className="shell-icon-chip h-11 w-11 shrink-0">
                <Icon className="h-4.5 w-4.5" />
              </div>
            ) : null}
            <div className="space-y-1">
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                {title}
              </h3>
              {description ? (
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  {description}
                </p>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            className="rounded-full border border-[var(--stroke-soft)] bg-white/70 p-2 text-[var(--text-secondary)] transition-colors hover:bg-white hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pb-5 sm:px-6">{children}</div>

        {footer ? (
          <div className="shell-divider flex flex-wrap items-center justify-end gap-3 px-5 py-4 sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
