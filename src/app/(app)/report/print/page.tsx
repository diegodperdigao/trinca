import { Badge } from "@/components/ui/badge";
import { PrintButton } from "@/components/print-button";
import { ReportRangeFilter } from "@/components/report-range-filter";
import { getLeads } from "@/lib/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  STAGES,
  STAGE_LABEL,
  CATEGORY_LABEL,
  ORIGIN_LABEL,
  DISCARD_REASON_LABEL,
} from "@/lib/stages";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { LeadStage } from "@/lib/types";

export const dynamic = "force-dynamic";

type Range = "day" | "week" | "month" | "all";

const RANGE_LABEL: Record<Range, string> = {
  day: "Hoje",
  week: "Últimos 7 dias",
  month: "Últimos 30 dias",
  all: "Todo o período",
};

/**
 * Calcula o início do range em hora local (00:00). Retorna `null` para
 * "all" — sem corte temporal.
 */
function rangeStart(range: Range): Date | null {
  const now = new Date();
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  if (range === "day") return d;
  if (range === "week") {
    d.setDate(d.getDate() - 6);
    return d;
  }
  if (range === "month") {
    d.setDate(d.getDate() - 29);
    return d;
  }
  return null;
}

function rangeEnd(range: Range): Date | null {
  if (range === "all") return null;
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export default async function ReportPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const sp = await searchParams;
  const range: Range = (
    ["day", "week", "month", "all"].includes(sp.range ?? "")
      ? (sp.range as Range)
      : "month"
  );
  const start = rangeStart(range);
  const end = rangeEnd(range);

  // Filtra leads pelo created_at dentro do range selecionado
  const allLeads = await getLeads();
  const leads = start
    ? allLeads.filter((l) => {
        const t = new Date(l.created_at).getTime();
        return t >= start.getTime() && (!end || t <= end.getTime());
      })
    : allLeads;

  // Reuniões dentro do range. Pra "all" mostra próximas 50 (futuras).
  const supabase = await createSupabaseServerClient();
  let meetingsQuery = supabase
    .from("lead_meetings")
    .select("*, leads!inner(name,instagram_handle)")
    .order("starts_at", { ascending: true })
    .limit(50);
  if (start && end) {
    meetingsQuery = meetingsQuery
      .gte("starts_at", start.toISOString())
      .lte("starts_at", end.toISOString());
  } else {
    meetingsQuery = meetingsQuery.gte(
      "starts_at",
      new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    );
  }
  const { data: meetingsRaw } = await meetingsQuery;
  const meetings = (meetingsRaw ?? []).map((row: any) => ({
    ...row,
    lead_name: row.leads?.name,
    instagram_handle: row.leads?.instagram_handle,
  }));

  // Métricas computadas a partir dos leads filtrados
  const stageCounts = STAGES.reduce<Record<LeadStage, number>>(
    (acc, s) => ({ ...acc, [s.id]: 0 }),
    {} as Record<LeadStage, number>,
  );
  let wonCount = 0;
  let discardedCount = 0;
  for (const l of leads) {
    if (l.discarded_at) {
      discardedCount++;
      continue;
    }
    stageCounts[l.stage]++;
    if (l.stage === "won") wonCount++;
  }
  const totalProspected = leads.length;
  const inFunnel = leads.filter(
    (l) => !l.discarded_at && !l.is_on_hold && l.stage !== "won",
  ).length;
  const conversionRate =
    totalProspected > 0 ? wonCount / totalProspected : 0;
  const conversionPct = (conversionRate * 100).toFixed(1);

  const top = STAGES[0];
  const total = stageCounts[top.id] || 1;
  const maxStage = Math.max(1, ...STAGES.map((s) => stageCounts[s.id] ?? 0));

  // aggregates
  const byCategory: Record<string, number> = {};
  const byOrigin: Record<string, number> = {};
  const byDiscard: Record<string, number> = {};
  for (const l of leads) {
    if (l.category) byCategory[l.category] = (byCategory[l.category] ?? 0) + 1;
    if (l.origin) byOrigin[l.origin] = (byOrigin[l.origin] ?? 0) + 1;
    if (l.discarded_at && l.discard_reason)
      byDiscard[l.discard_reason] = (byDiscard[l.discard_reason] ?? 0) + 1;
  }

  const periodLabel = start
    ? `${formatDate(start)} — ${formatDate(end ?? new Date())}`
    : "Histórico completo";

  return (
    <div className="mx-auto max-w-4xl space-y-6 print:max-w-none">
      {/* Actions bar — hidden on print */}
      <div className="no-print flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            <span className="gradient-text">Relatório</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Período: <strong className="text-foreground">{RANGE_LABEL[range]}</strong>{" "}
            · Use{" "}
            <kbd className="rounded bg-secondary px-1 py-0.5 text-[10px]">Ctrl</kbd>+
            <kbd className="rounded bg-secondary px-1 py-0.5 text-[10px]">P</kbd>{" "}
            → salvar como PDF.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ReportRangeFilter current={range} />
          <PrintButton />
        </div>
      </div>

      {/* === REPORT SURFACE === */}
      <div className="print-surface rounded-xl border border-border bg-card p-8 print:rounded-none print:border-0">
        {/* Linha mínima identificando o período. Sem header verboso. */}
        <div className="mb-6 flex items-baseline justify-between gap-4 text-[11px] uppercase tracking-wider text-muted-foreground print-muted">
          <span className="font-semibold">
            Relatório · {RANGE_LABEL[range]}
          </span>
          <span>{periodLabel}</span>
        </div>

        {/* KPI grid */}
        <section className="grid grid-cols-4 gap-4">
          <KpiPrint label="Prospectados" value={totalProspected} />
          <KpiPrint label="No funil" value={inFunnel} />
          <KpiPrint label="Reuniões" value={meetings.length} />
          <KpiPrint
            label="Conversão"
            value={`${conversionPct}%`}
            hint={`${wonCount} fechados`}
          />
        </section>

        {/* Funnel */}
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground print-muted">
            Funil de Conversão
          </h2>
          <div className="space-y-2">
            {STAGES.map((s, i) => {
              const count = stageCounts[s.id] ?? 0;
              const width = (count / maxStage) * 100;
              const convTop = total > 0 ? Math.round((count / total) * 100) : 0;
              let convPrev: number | null = null;
              if (i > 0) {
                const prev = stageCounts[STAGES[i - 1].id] ?? 0;
                convPrev = prev > 0 ? Math.round((count / prev) * 100) : 0;
              }
              return (
                <div key={s.id}>
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="font-medium text-foreground">
                      {s.label}
                    </span>
                    <span className="flex gap-2 text-muted-foreground print-muted">
                      <span>{count}</span>
                      {convPrev !== null && <span>↳ {convPrev}%</span>}
                      <span>{convTop}%</span>
                    </span>
                  </div>
                  <div className="relative h-4 overflow-hidden rounded-md border border-border bg-secondary/40 print:bg-zinc-100">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-cta print:bg-[#f21828]"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Breakdown grids */}
        <section className="mt-8 grid grid-cols-3 gap-6">
          <Breakdown
            title="Por Categoria"
            entries={Object.entries(byCategory).map(([k, v]) => ({
              label: CATEGORY_LABEL[k as keyof typeof CATEGORY_LABEL],
              value: v,
            }))}
          />
          <Breakdown
            title="Por Origem"
            entries={Object.entries(byOrigin).map(([k, v]) => ({
              label: ORIGIN_LABEL[k as keyof typeof ORIGIN_LABEL],
              value: v,
            }))}
          />
          <Breakdown
            title="Motivos de Descarte"
            entries={Object.entries(byDiscard).map(([k, v]) => ({
              label: DISCARD_REASON_LABEL[k as keyof typeof DISCARD_REASON_LABEL],
              value: v,
            }))}
          />
        </section>

        {/* Reuniões */}
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground print-muted">
            {range === "all" ? "Próximas Reuniões" : "Reuniões no período"}
          </h2>
          {meetings.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sem reuniões no período.</p>
          ) : (
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-1.5 text-left font-semibold">Lead</th>
                  <th className="py-1.5 text-left font-semibold">Título</th>
                  <th className="py-1.5 text-left font-semibold">Quando</th>
                </tr>
              </thead>
              <tbody>
                {meetings.slice(0, 15).map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-border/60"
                  >
                    <td className="py-1.5 font-semibold">{m.lead_name}</td>
                    <td className="py-1.5">{m.title}</td>
                    <td className="py-1.5 text-muted-foreground print-muted">
                      {formatDateTime(m.starts_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Leads no funil — resumo */}
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground print-muted">
            Leads em andamento
          </h2>
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-1.5 text-left font-semibold">Lead</th>
                <th className="py-1.5 text-left font-semibold">@Instagram</th>
                <th className="py-1.5 text-left font-semibold">Categoria</th>
                <th className="py-1.5 text-left font-semibold">Estágio</th>
                <th className="py-1.5 text-left font-semibold">Desde</th>
              </tr>
            </thead>
            <tbody>
              {leads
                .filter(
                  (l) => !l.discarded_at && !l.is_on_hold && l.stage !== "won",
                )
                .slice(0, 30)
                .map((l) => (
                  <tr key={l.id} className="border-b border-border/60">
                    <td className="py-1.5 font-semibold">{l.name}</td>
                    <td className="py-1.5 text-muted-foreground print-muted">
                      {l.instagram_handle ? `@${l.instagram_handle}` : "—"}
                    </td>
                    <td className="py-1.5 text-muted-foreground print-muted">
                      {l.category ? CATEGORY_LABEL[l.category] : "—"}
                    </td>
                    <td className="py-1.5">
                      <Badge variant="primary">{STAGE_LABEL[l.stage]}</Badge>
                    </td>
                    <td className="py-1.5 text-muted-foreground print-muted">
                      {formatDate(l.created_at)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

function KpiPrint({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-4 print:bg-white">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground print-muted">
        {label}
      </div>
      <div className="mt-1 text-2xl font-extrabold tracking-tight">
        {value}
      </div>
      {hint && (
        <div className="mt-0.5 text-[10px] text-muted-foreground print-muted">
          {hint}
        </div>
      )}
    </div>
  );
}

function Breakdown({
  title,
  entries,
}: {
  title: string;
  entries: { label: string; value: number }[];
}) {
  const total = entries.reduce((a, b) => a + b.value, 0);
  return (
    <div>
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground print-muted">
        {title}
      </h3>
      {entries.length === 0 ? (
        <p className="text-[11px] text-muted-foreground print-muted">—</p>
      ) : (
        <ul className="space-y-1.5">
          {entries
            .sort((a, b) => b.value - a.value)
            .map((e) => {
              const pct = total > 0 ? Math.round((e.value / total) * 100) : 0;
              return (
                <li key={e.label} className="text-[11px]">
                  <div className="flex items-center justify-between">
                    <span>{e.label}</span>
                    <span className="text-muted-foreground print-muted">
                      {e.value} · {pct}%
                    </span>
                  </div>
                  <div className="mt-0.5 h-1 overflow-hidden rounded bg-secondary/40 print:bg-zinc-100">
                    <div
                      className="h-full bg-gradient-cta print:bg-[#f21828]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}
