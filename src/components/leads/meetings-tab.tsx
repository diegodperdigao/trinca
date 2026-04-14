"use client";

import { useRef, useState, useTransition } from "react";
import {
  Calendar,
  Loader2,
  Plus,
  Download,
  Check,
  XCircle,
  Trash2,
  Video,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { LeadMeeting } from "@/lib/types";
import {
  buildIcs,
  formatDateTime,
  relativeDayLabel,
  cn,
} from "@/lib/utils";
import {
  createMeeting,
  deleteMeeting,
  markMeeting,
} from "@/app/actions/leads";

export function MeetingsTab({
  leadId,
  leadName,
  meetings,
}: {
  leadId: string;
  leadName: string;
  meetings: LeadMeeting[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<"online" | "in_person">("online");
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("lead_id", leadId);
    fd.set("mode", mode);
    startTransition(async () => {
      try {
        await createMeeting(fd);
        formRef.current?.reset();
        setOpen(false);
      } catch (err: any) {
        setError(err?.message ?? "Erro ao criar reunião");
      }
    });
  }

  function downloadIcs(m: LeadMeeting) {
    const ics = buildIcs({
      uid: m.id,
      title: `${m.title} · ${leadName}`,
      description: m.notes ?? undefined,
      location: m.link ?? m.location ?? undefined,
      startsAt: new Date(m.starts_at),
      endsAt: m.ends_at ? new Date(m.ends_at) : null,
    });
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reuniao-${leadName.replace(/\s+/g, "-").toLowerCase()}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Reuniões</h3>
        <Button
          size="sm"
          type="button"
          onClick={() => setOpen((v) => !v)}
          variant={open ? "secondary" : "default"}
        >
          <Plus />
          {open ? "Fechar" : "Nova reunião"}
        </Button>
      </div>

      {open && (
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="space-y-3 rounded-lg border border-border bg-secondary/40 p-4"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="Ex: Apresentação Trinca"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="starts_at">Início *</Label>
              <Input
                id="starts_at"
                name="starts_at"
                type="datetime-local"
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="ends_at">Fim (opcional)</Label>
              <Input
                id="ends_at"
                name="ends_at"
                type="datetime-local"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Modalidade</Label>
              <Select value={mode} onValueChange={(v: any) => setMode(v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="in_person">Presencial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {mode === "online" ? (
              <div>
                <Label htmlFor="link">Link da call</Label>
                <Input
                  id="link"
                  name="link"
                  placeholder="https://meet.google.com/..."
                  className="mt-1.5"
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="location">Local</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Endereço / cidade"
                  className="mt-1.5"
                />
              </div>
            )}
            <div className="md:col-span-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" name="notes" className="mt-1.5" />
            </div>
          </div>
          {error && <p className="text-xs text-red-300">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <Calendar />}
              Agendar
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {meetings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
            Nenhuma reunião ainda.
          </div>
        ) : (
          meetings.map((m) => (
            <MeetingRow
              key={m.id}
              meeting={m}
              leadId={leadId}
              onIcs={() => downloadIcs(m)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function MeetingRow({
  meeting: m,
  leadId,
  onIcs,
}: {
  meeting: LeadMeeting;
  leadId: string;
  onIcs: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const past = new Date(m.starts_at).getTime() < Date.now();
  const dayLabel = relativeDayLabel(m.starts_at);
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-border bg-secondary/40 p-3 md:flex-row md:items-center",
        m.done && "opacity-60",
      )}
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Calendar className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-semibold">{m.title}</span>
          {!m.done && !m.no_show && (
            <Badge
              variant={
                dayLabel === "Hoje"
                  ? "primary"
                  : dayLabel === "Amanhã"
                    ? "warning"
                    : "muted"
              }
            >
              {dayLabel}
            </Badge>
          )}
          {m.done && <Badge variant="success">Realizada</Badge>}
          {m.no_show && <Badge variant="danger">No-show</Badge>}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span>{formatDateTime(m.starts_at)}</span>
          {m.mode === "online" ? (
            <span className="inline-flex items-center gap-1">
              <Video className="h-3 w-3" /> online
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> presencial
            </span>
          )}
          {m.link && (
            <a
              href={m.link}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> abrir link
            </a>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onIcs}
          title="Baixar .ics para seu calendário"
        >
          <Download />
          .ics
        </Button>
        {!m.done && past && (
          <>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await markMeeting(m.id, leadId, { done: true });
                })
              }
              title="Marcar como realizada"
            >
              <Check />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await markMeeting(m.id, leadId, { no_show: true });
                })
              }
              title="Marcar como no-show"
            >
              <XCircle />
            </Button>
          </>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={pending}
          onClick={() => {
            if (!confirm("Excluir esta reunião?")) return;
            startTransition(async () => {
              await deleteMeeting(m.id, leadId);
            });
          }}
          aria-label="Excluir"
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}
