"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const RANGES = [
  { id: "day", label: "Hoje" },
  { id: "week", label: "7 dias" },
  { id: "month", label: "30 dias" },
  { id: "all", label: "Tudo" },
] as const;

export function ReportRangeFilter({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function setRange(range: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", range);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="inline-flex shrink-0 rounded-lg border border-border bg-secondary p-1">
      {RANGES.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => setRange(r.id)}
          disabled={pending}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-semibold transition",
            current === r.id
              ? "bg-gradient-cta text-white shadow-glow"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
