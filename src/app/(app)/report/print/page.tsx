import { Badge } from "@/components/ui/badge";
import { PrintButton } from "@/components/print-button";
import {
  getDashboardMetrics,
  getLeads,
  getUpcomingMeetings,
} from "@/lib/queries";
import {
  STAGES,
  STAGE_LABEL,
  CATEGORY_LABEL,
  ORIGIN_LABEL,
  DISCARD_REASON_LABEL,
} from "@/lib/stages";
import { Logo } from "@/components/logo";
import { formatDate, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReportPrintPage() {
  const [metrics, leads, meetings] = await Promise.all([
    getDashboardMetrics(),
    getLeads(),
    getUpcomingMeetings(50),
  ]);

  const now = new Date();
  const conversionPct = (metrics.conversionRate * 100).toFixed(1);

  // funnel conversion between stages
  const stageCounts = metrics.stageCounts;
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

  return (
    <div className="mx-auto max-w-4xl space-y-6 print:max-w-none">
      {/* Actions bar — hidden on print */}
      <div className="no-print flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            Relatório Executivo
          </h1>
          <p className="text-sm text-muted-foreground">
            Formatado para A4. Use <kbd className="rounded bg-secondary px-1 py-0.5 text-[10px]">Ctrl</kbd>
            +<kbd className="rounded bg-secondary px-1 py-0.5 text-[10px]">P</kbd>{" "}
            → salvar como PDF.
          </p>
        </div>
        <PrintButton />
      </div>

      {/* === REPORT SURFACE === */}
      <div className="print-surface rounded-xl border border-border bg-card p-8 print:rounded-none print:border-0 print:p-0">
        <header className="flex items-start justify-between border-b border-border pb-4 print-surface">
          <Logo />
          <div className="text-right">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground print-muted">
              Relatório de Prospecção
            </div>
            <div className="text-sm font-bold text-foreground">
              {formatDate(now, "MMMM 'de' yyyy")}
            </div>
            <div className="text-[10px] text-muted-foreground print-muted">
              Gerado em {formatDateTime(now)}
            </div>
          </div>
        </header>

        {/* KPI grid */}
        <section className="mt-6 grid grid-cols-4 gap-4">
          <KpiPrint label="Prospectados" value={metrics.totalProspected} />
          <KpiPrint label="No funil" value={metrics.inFunnel} />
          <KpiPrint
            label="Reuniões/semana"
            value={metrics.meetingsThisWeek}
          />
          <KpiPrint
            label="Conversão"
            value={`${conversionPct}%`}
            hint={`${metrics.wonCount} fechados`}
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

        {/* Reuniões da semana */}
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground print-muted">
            Próximas Reuniões
          </h2>
          {meetings.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sem reuniões agendadas.</p>
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

        <footer className="mt-8 border-t border-border pt-4 text-center text-[10px] text-muted-foreground print-muted">
          Relatório confidencial — uso interno Trinca do iGaming
        </footer>
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
