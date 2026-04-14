"use client";

import { STAGES } from "@/lib/stages";
import type { LeadStage } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FunnelChartProps {
  counts: Record<LeadStage, number>;
}

export function FunnelChart({ counts }: FunnelChartProps) {
  const max = Math.max(1, ...STAGES.map((s) => counts[s.id] ?? 0));
  const total = counts[STAGES[0].id] ?? 0;

  return (
    <div className="space-y-2">
      {STAGES.map((stage, i) => {
        const count = counts[stage.id] ?? 0;
        const widthPct = (count / max) * 100;
        const convPct = total > 0 ? Math.round((count / total) * 100) : 0;

        let prevConv: number | null = null;
        if (i > 0) {
          const prev = counts[STAGES[i - 1].id] ?? 0;
          prevConv = prev > 0 ? Math.round((count / prev) * 100) : 0;
        }

        return (
          <div key={stage.id} className="group">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-foreground/90">
                {stage.label}
              </span>
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="font-mono">{count}</span>
                {prevConv !== null && (
                  <span
                    className={cn(
                      "rounded px-1.5 text-[10px] font-semibold",
                      prevConv >= 50
                        ? "bg-emerald-500/10 text-emerald-400"
                        : prevConv >= 20
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-red-500/10 text-red-400",
                    )}
                  >
                    ↳ {prevConv}%
                  </span>
                )}
                <span className="w-10 text-right font-mono">
                  {convPct}%
                </span>
              </span>
            </div>
            <div className="relative h-6 overflow-hidden rounded-lg border border-border bg-secondary/50">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-cta transition-all duration-700"
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
