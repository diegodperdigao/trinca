"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { LeadNote } from "@/lib/types";
import { formatRelative, formatDateTime } from "@/lib/utils";
import { addNote, deleteNote } from "@/app/actions/leads";

export function NotesTab({
  leadId,
  notes,
}: {
  leadId: string;
  notes: LeadNote[];
}) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("lead_id", leadId);
    const body = String(fd.get("body") ?? "").trim();
    if (!body) return;
    startTransition(async () => {
      await addNote(fd);
      formRef.current?.reset();
    });
  }

  return (
    <div className="space-y-4">
      <form ref={formRef} onSubmit={onSubmit} className="space-y-2">
        <Textarea
          name="body"
          placeholder="Registre o que aconteceu: call, DM, indicação, dúvida do lead..."
          rows={3}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Send />}
            Adicionar nota
          </Button>
        </div>
      </form>

      <div className="relative space-y-3 pl-5">
        <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border" />
        {notes.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            Nenhuma interação registrada ainda.
          </div>
        ) : (
          notes.map((n) => (
            <NoteItem key={n.id} note={n} leadId={leadId} />
          ))
        )}
      </div>
    </div>
  );
}

function NoteItem({ note, leadId }: { note: LeadNote; leadId: string }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="relative">
      <div className="absolute -left-[18px] top-2 h-3 w-3 rounded-full border-2 border-primary bg-background" />
      <div className="rounded-lg border border-border bg-secondary/50 p-3">
        <div className="flex items-start justify-between gap-2 text-[11px] text-muted-foreground">
          <div title={formatDateTime(note.created_at)}>
            {formatRelative(note.created_at)}
          </div>
          {confirming ? (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded px-1.5 text-muted-foreground hover:bg-secondary"
              >
                cancelar
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await deleteNote(note.id, leadId);
                  })
                }
                className="rounded bg-red-500/10 px-1.5 text-red-300 hover:bg-red-500/20"
              >
                {pending ? "..." : "excluir"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="text-muted-foreground hover:text-red-400"
              aria-label="Excluir nota"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="mt-1.5 whitespace-pre-wrap text-sm text-foreground/90">
          {note.body}
        </p>
      </div>
    </div>
  );
}
