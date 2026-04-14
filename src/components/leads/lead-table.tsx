"use client";

import Link from "next/link";
import { Instagram, ExternalLink, Calendar, PauseCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  STAGE_LABEL,
  CATEGORY_LABEL,
} from "@/lib/stages";
import type { Lead } from "@/lib/types";
import {
  formatDate,
  formatRelative,
  instagramUrl,
  relativeDayLabel,
} from "@/lib/utils";

export function LeadTable({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Nenhum lead corresponde aos filtros.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50 text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-3 py-2.5 text-left font-semibold">Lead</th>
              <th className="hidden px-3 py-2.5 text-left font-semibold md:table-cell">
                Categoria
              </th>
              <th className="px-3 py-2.5 text-left font-semibold">Estágio</th>
              <th className="hidden px-3 py-2.5 text-left font-semibold lg:table-cell">
                Próx. Ação
              </th>
              <th className="hidden px-3 py-2.5 text-left font-semibold lg:table-cell">
                Atualizado
              </th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => {
              const igUrl = instagramUrl(l.instagram_handle);
              return (
                <tr
                  key={l.id}
                  className="border-b border-border transition hover:bg-secondary/40"
                >
                  <td className="px-3 py-3">
                    <Link
                      href={`/leads/${l.id}`}
                      className="flex min-w-0 items-center gap-3"
                    >
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                        {initials(l.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-semibold text-foreground">
                            {l.name}
                          </span>
                          {l.is_on_hold && (
                            <PauseCircle className="h-3.5 w-3.5 text-amber-400" />
                          )}
                          {l.discarded_at && (
                            <Badge variant="danger">Descartado</Badge>
                          )}
                        </div>
                        {l.instagram_handle && (
                          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Instagram className="h-3 w-3" />
                            @{l.instagram_handle}
                          </div>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="hidden px-3 py-3 md:table-cell">
                    {l.category && (
                      <Badge variant="muted">
                        {CATEGORY_LABEL[l.category]}
                      </Badge>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant="primary">{STAGE_LABEL[l.stage]}</Badge>
                  </td>
                  <td className="hidden px-3 py-3 text-xs lg:table-cell">
                    {l.next_action ? (
                      <div className="min-w-0">
                        <div className="truncate text-foreground/90">
                          {l.next_action}
                        </div>
                        {l.next_action_due_at && (
                          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {relativeDayLabel(l.next_action_due_at)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="hidden px-3 py-3 text-[11px] text-muted-foreground lg:table-cell">
                    {formatRelative(l.updated_at)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {igUrl && (
                      <a
                        href={igUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary"
                        aria-label="Abrir Instagram"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
