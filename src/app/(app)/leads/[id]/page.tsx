import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Instagram, Mail, Phone, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  getLead,
  getLeadNotes,
  getLeadEvidences,
  getLeadMeetings,
  getLeadStageHistory,
} from "@/lib/queries";
import {
  STAGE_LABEL,
  CATEGORY_LABEL,
  ORIGIN_LABEL,
} from "@/lib/stages";
import { LeadForm } from "@/components/leads/lead-form";
import { NotesTab } from "@/components/leads/notes-tab";
import { EvidencesTab } from "@/components/leads/evidences-tab";
import { MeetingsTab } from "@/components/leads/meetings-tab";
import { HistoryTab } from "@/components/leads/history-tab";
import { LeadHeaderActions } from "@/components/leads/lead-header-actions";
import { daysSince, formatDate, instagramUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) notFound();

  const [notes, evidences, meetings, history] = await Promise.all([
    getLeadNotes(id),
    getLeadEvidences(id),
    getLeadMeetings(id),
    getLeadStageHistory(id),
  ]);

  const igUrl = instagramUrl(lead.instagram_handle);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link
        href="/leads"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Voltar para leads
      </Link>

      {/* Header card */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-extrabold tracking-tight md:text-3xl">
                  {lead.name}
                </h1>
                <Badge variant="primary">{STAGE_LABEL[lead.stage]}</Badge>
                <StageDuration iso={lead.stage_entered_at} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {igUrl && (
                  <a
                    href={igUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 hover:text-primary"
                  >
                    <Instagram className="h-3 w-3" />@{lead.instagram_handle}
                  </a>
                )}
                {lead.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {lead.phone}
                  </span>
                )}
                {lead.email && (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {lead.email}
                  </span>
                )}
                {lead.category && (
                  <Badge variant="muted">
                    {CATEGORY_LABEL[lead.category]}
                  </Badge>
                )}
                {lead.origin && (
                  <Badge variant="muted">{ORIGIN_LABEL[lead.origin]}</Badge>
                )}
                <span className="text-[11px]">
                  Desde {formatDate(lead.created_at)}
                </span>
              </div>
              {lead.tags?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {lead.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 text-[11px]"
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <LeadHeaderActions lead={lead} />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Dados</TabsTrigger>
          <TabsTrigger value="notes">
            Notas
            {notes.length > 0 && (
              <span className="ml-1.5 rounded-full bg-white/20 px-1.5 text-[10px]">
                {notes.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="evidences">
            Evidências
            {evidences.length > 0 && (
              <span className="ml-1.5 rounded-full bg-white/20 px-1.5 text-[10px]">
                {evidences.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="meetings">
            Reuniões
            {meetings.length > 0 && (
              <span className="ml-1.5 rounded-full bg-white/20 px-1.5 text-[10px]">
                {meetings.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardContent className="pt-6">
              <LeadForm lead={lead} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardContent className="pt-6">
              <NotesTab leadId={lead.id} notes={notes} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidences">
          <Card>
            <CardContent className="pt-6">
              <EvidencesTab leadId={lead.id} evidences={evidences} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meetings">
          <Card>
            <CardContent className="pt-6">
              <MeetingsTab
                leadId={lead.id}
                leadName={lead.name}
                meetings={meetings}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="pt-6">
              <HistoryTab history={history} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StageDuration({ iso }: { iso: string }) {
  const days = daysSince(iso);
  if (days < 1) {
    return (
      <Badge variant="muted" className="gap-1">
        <Clock className="h-3 w-3" />
        hoje
      </Badge>
    );
  }
  const variant =
    days >= 14 ? "danger" : days >= 7 ? "warning" : "muted";
  return (
    <Badge variant={variant} className="gap-1">
      <Clock className="h-3 w-3" />
      {days} {days === 1 ? "dia" : "dias"} neste estágio
    </Badge>
  );
}
