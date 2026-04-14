import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  trend?: { value: string; positive?: boolean };
  className?: string;
  accent?: boolean;
}

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  className,
  accent,
}: KpiCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden p-5 transition-all duration-500 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow",
        className,
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 opacity-0 transition-opacity duration-500 group-hover:from-primary/5 group-hover:to-primary/0 group-hover:opacity-100"
      />

      {/* Top accent bar for highlighted cards */}
      {accent && (
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
        />
      )}

      <div className="relative flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 text-3xl font-extrabold leading-none tracking-tight text-foreground tabular-nums">
            {value}
          </div>
          {hint && (
            <div className="mt-1.5 text-xs text-muted-foreground">{hint}</div>
          )}
          {trend && (
            <div
              className={cn(
                "mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                trend.positive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400",
              )}
            >
              {trend.value}
            </div>
          )}
        </div>
        {Icon && (
          <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-4deg]">
            <div
              aria-hidden
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
            <Icon className="relative h-5 w-5" />
          </div>
        )}
      </div>
    </Card>
  );
}
