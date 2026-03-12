import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[18px] text-sm font-semibold transition-all duration-[var(--motion-fast)] ease-[var(--ease-standard)] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "btn-glow bg-[var(--primary-700)] text-white shadow-[0_16px_30px_rgba(31,93,78,0.24)] hover:-translate-y-px hover:bg-[var(--primary-800)]",
        destructive:
          "bg-[var(--peach-600)] text-white shadow-[0_16px_30px_rgba(217,124,87,0.2)] hover:-translate-y-px hover:bg-[var(--clay-700)]",
        outline:
          "border border-[var(--stroke-soft)] bg-white/84 text-[var(--text-primary)] hover:border-[rgba(31,93,78,0.18)] hover:bg-white",
        secondary:
          "border border-[rgba(31,93,78,0.12)] bg-[var(--primary-100)] text-[var(--primary-800)] hover:bg-[var(--primary-200)]",
        ghost:
          "text-[var(--text-secondary)] hover:bg-[var(--primary-50)] hover:text-[var(--text-primary)]",
        link:
          "rounded-none p-0 text-[var(--primary-700)] underline-offset-4 hover:text-[var(--primary-800)] hover:underline",
      },
      size: {
        default: "min-h-11 px-5",
        sm: "min-h-9 rounded-[14px] px-3.5 text-xs",
        lg: "min-h-12 rounded-[20px] px-6 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button };
