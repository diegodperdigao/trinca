import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-secondary text-foreground/90",
        primary:
          "border-primary/40 bg-primary/10 text-primary",
        muted: "border-border bg-muted text-muted-foreground",
        warning:
          "border-amber-500/40 bg-amber-500/10 text-amber-300",
        danger:
          "border-red-500/40 bg-red-500/10 text-red-300",
        success:
          "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
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
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
