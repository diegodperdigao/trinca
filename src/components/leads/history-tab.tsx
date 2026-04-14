import { STAGE_LABEL } from "@/lib/stages";
import type { LeadStageHistory } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function HistoryTab({ history }: { history: LeadStageHistory[] }) {
  if (history.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
        Nenhum histórico registrado.
      </div>
    );
  }
  return (
    <div className="relative space-y-2 pl-5">
      <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border" />
      {history.map((h) => (
        <div key={h.id} className="relative">
          <div className="absolute -left-[18px] top-2 h-3 w-3 rounded-full border-2 border-primary bg-background" />
          <div className="rounded-lg border border-border bg-secondary/40 p-3 text-xs">
            <div className="text-[11px] text-muted-foreground">
              {formatDateTime(h.changed_at)}
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                {h.from_stage ? STAGE_LABEL[h.from_stage] : "criado em"}
              </span>
              <ArrowRight className="h-3 w-3 text-primary" />
              <span className="font-semibold text-foreground">
                {STAGE_LABEL[h.to_stage]}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
