import Link from "next/link";
import {
  Users,
  TrendingUp,
  Calendar,
  Target,
  ArrowRight,
  Instagram,
  Clock,
  AlertCircle,
  PauseCircle,
  XCircle,
} from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { FunnelChart } from "@/components/funnel-chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getDashboardMetrics,
  getUpcomingMeetings,
} from "@/lib/queries";
import {
  formatDateTime,
  instagramUrl,
  relativeDayLabel,
  formatRelative,
} from "@/lib/utils";
import { STAGE_LABEL, DISCARD_REASON_LABEL } from "@/lib/stages";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [metrics, meetings] = await Promise.all([
    getDashboardMetrics(),
    getUpcomingMeetings(8),
  ]);

  const conversionPct = (metrics.conversionRate * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visão geral da captação — atualizado agora.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link href="/report/print">
              <TrendingUp />
              Relatório
            </Link>
          </Button>
          <Button asChild size="sm" className="animate-glow-pulse">
            <Link href="/leads/new">
              <Users />
              Novo Lead
            </Link>
          </Button>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard
          label="Prospectados"
          value={metrics.totalProspected}
          hint="Total no radar"
          icon={Users}
        />
        <KpiCard
          label="No funil"
          value={metrics.inFunnel}
          hint="Ativos em progresso"
          icon={TrendingUp}
        />
        <KpiCard
          label="Reuniões/semana"
          value={metrics.meetingsThisWeek}
          hint="Próximos 7 dias"
          icon={Calendar}
        />
        <KpiCard
          label="Conversão"
          value={`${conversionPct}%`}
          hint={`${metrics.wonCount} fechados`}
          icon={Target}
        />
      </div>

      {/* Funil */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Funil de Conversão</CardTitle>
            <Badge variant="muted">
              {metrics.onHoldCount} em stand by · {metrics.discardedCount} descartados
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <FunnelChart counts={metrics.stageCounts} />
        </CardContent>
      </Card>

      {/* 2 colunas: Meetings + Pending */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Meetings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Próximas Reuniões
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {meetings.length === 0 ? (
              <EmptyLine text="Nenhuma reunião agendada." />
            ) : (
              meetings.map((m) => (
                <Link
                  key={m.id}
                  href={`/leads/${m.lead_id}`}
                  className="group flex items-center gap-3 rounded-lg border border-border bg-secondary/40 p-3 transition hover:border-primary/30 hover:bg-secondary"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <span className="truncate">{m.lead_name}</span>
                      <DayBadge iso={m.starts_at} />
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(m.starts_at)}
                      <span>·</span>
                      <span>{m.title}</span>
                    </div>
                  </div>
                  {m.instagram_handle && (
                    <a
                      href={instagramUrl(m.instagram_handle)!}
                      target="_blank"
                      rel="noreferrer noopener"
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                      aria-label="Abrir Instagram"
                    >
                      <Instagram className="h-4 w-4" />
                    </a>
                  )}
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Pending actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              Ações Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {metrics.pendingActions.length === 0 ? (
              <EmptyLine text="Tudo em dia. 🎯" />
            ) : (
              metrics.pendingActions.map((l) => {
                const due = new Date(l.next_action_due_at!);
                const late = due.getTime() < Date.now();
                return (
                  <Link
                    key={l.id}
                    href={`/leads/${l.id}`}
                    className="group flex items-start gap-3 rounded-lg border border-border bg-secondary/40 p-3 transition hover:border-primary/30 hover:bg-secondary"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <span className="truncate">{l.name}</span>
                        <Badge variant="muted" className="shrink-0">
                          {STAGE_LABEL[l.stage]}
                        </Badge>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {l.next_action}
                      </p>
                    </div>
                    <Badge
                      variant={late ? "danger" : "warning"}
                      className="shrink-0"
                    >
                      {relativeDayLabel(due)}
                    </Badge>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* On hold + Discards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PauseCircle className="h-4 w-4 text-amber-400" />
              Stand By
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.onHoldLeads.length === 0 ? (
              <EmptyLine text="Nenhum lead parado." />
            ) : (
              <div className="flex flex-wrap gap-2">
                {metrics.onHoldLeads.map((l) => (
                  <Link
                    key={l.id}
                    href={`/leads/${l.id}`}
                    className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200 transition hover:border-amber-500/50"
                  >
                    {l.name}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-400" />
              Últimos descartados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {metrics.recentDiscards.length === 0 ? (
              <EmptyLine text="Nenhum descarte recente." />
            ) : (
              metrics.recentDiscards.map((l) => (
                <Link
                  key={l.id}
                  href={`/leads/${l.id}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 p-2.5 text-sm transition hover:border-red-500/30"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">{l.name}</div>
                    <div className="truncate text-[11px] text-muted-foreground">
                      {l.discard_reason
                        ? DISCARD_REASON_LABEL[l.discard_reason]
                        : "Sem motivo"}
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {formatRelative(l.discarded_at!)}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
      {text}
    </div>
  );
}

function DayBadge({ iso }: { iso: string }) {
  const label = relativeDayLabel(iso);
  const variant =
    label === "Hoje" ? "primary" : label === "Amanhã" ? "warning" : "muted";
  return <Badge variant={variant}>{label}</Badge>;
}
