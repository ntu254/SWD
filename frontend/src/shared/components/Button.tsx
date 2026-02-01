import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@utils/cn';
import { Slot } from '@radix-ui/react-slot';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
    {
        variants: {
            variant: {
                primary: "bg-brand-600 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700 hover:shadow-brand-500/50",
                secondary: "bg-accent-500 text-white shadow-md shadow-accent-500/30 hover:bg-accent-600 hover:shadow-accent-500/50",
                outline: "border-2 border-brand-200 bg-white text-brand-700 hover:border-brand-300 hover:bg-brand-50",
                ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                link: "text-brand-600 underline-offset-4 hover:underline",
                default: "bg-brand-600 text-white hover:bg-brand-700", // Fallback/Standard Shadcn
                destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
            },
            size: {
                sm: "h-9 px-4 text-xs",
                md: "h-11 px-6 text-sm",
                lg: "h-12 px-8 text-base",
                icon: "h-10 w-10",
            },
            fullWidth: {
                true: "w-full",
            },
            loading: {
                true: "cursor-not-allowed opacity-70",
            }
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
            fullWidth: false,
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, fullWidth, asChild = false, isLoading, children, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, fullWidth, loading: isLoading, className }))}
                ref={ref}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </Comp>
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
export default Button;
