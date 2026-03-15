import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { formatStatusLabel } from "../../lib/labels";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-[rgba(31,93,78,0.14)] bg-[var(--primary-100)] text-[var(--primary-800)]",
        secondary:
          "border-[var(--stroke-soft)] bg-[var(--slate-100)] text-[var(--slate-700)]",
        destructive:
          "border-[rgba(217,124,87,0.16)] bg-[var(--peach-100)] text-[var(--peach-600)]",
        outline:
          "border-[var(--stroke-soft)] bg-white/80 text-[var(--text-secondary)]",
        pending:
          "border-[rgba(186,135,60,0.18)] bg-[var(--warning-100)] text-[var(--warning-600)]",
        accepted:
          "border-[rgba(78,123,217,0.16)] bg-[var(--accent-100)] text-[var(--accent-600)]",
        assigned:
          "border-[rgba(89,98,164,0.16)] bg-[#edeaff] text-[#5848a0]",
        ontheway:
          "border-[rgba(57,140,166,0.16)] bg-[#e9f8fc] text-[#2c7b90]",
        collected:
          "border-[rgba(31,93,78,0.16)] bg-[var(--primary-100)] text-[var(--primary-700)]",
        rejected:
          "border-[rgba(217,124,87,0.16)] bg-[var(--peach-100)] text-[var(--peach-600)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

const STATUS_VARIANTS = {
  pending: "pending",
  accepted: "accepted",
  assigned: "assigned",
  inprogress: "ontheway",
  ontheway: "ontheway",
  completed: "collected",
  collected: "collected",
  rejected: "rejected",
} as const;

type StatusVariant = keyof typeof STATUS_VARIANTS;

function isStatusVariant(value: string): value is StatusVariant {
  return value in STATUS_VARIANTS;
}

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const normalizedStatus = status.toLowerCase().replace(/_/g, "");
  const variant = isStatusVariant(normalizedStatus)
    ? STATUS_VARIANTS[normalizedStatus]
    : "outline";

  const label = formatStatusLabel(status);

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}

export { Badge };
