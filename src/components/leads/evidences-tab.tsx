"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, Upload, Trash2, FileIcon, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LeadEvidence } from "@/lib/types";
import { addEvidence, deleteEvidence } from "@/app/actions/leads";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function EvidencesTab({
  leadId,
  evidences,
}: {
  leadId: string;
  evidences: LeadEvidence[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("lead_id", leadId);
    const file = fd.get("file") as File | null;
    if (!file || file.size === 0) {
      setError("Selecione um arquivo");
      return;
    }
    startTransition(async () => {
      try {
        await addEvidence(fd);
        formRef.current?.reset();
      } catch (err: any) {
        setError(err?.message ?? "Erro ao enviar");
      }
    });
  }

  return (
    <div className="space-y-4">
      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="space-y-3 rounded-lg border border-dashed border-border p-4"
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Arquivo (imagem ou vídeo)
            </label>
            <Input
              type="file"
              name="file"
              accept="image/*,video/*"
              className="mt-1.5 cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Legenda
            </label>
            <Input
              name="caption"
              placeholder="Ex: Print de resultado do mês"
              className="mt-1.5"
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Upload />}
            Enviar
          </Button>
        </div>
        {error && (
          <p className="text-xs text-red-300">{error}</p>
        )}
      </form>

      {evidences.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
          Nenhuma evidência enviada ainda.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {evidences.map((ev) => (
            <EvidenceCard key={ev.id} evidence={ev} leadId={leadId} />
          ))}
        </div>
      )}
    </div>
  );
}

function EvidenceCard({
  evidence,
  leadId,
}: {
  evidence: LeadEvidence;
  leadId: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function fetchUrl() {
    if (url) return;
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.storage
      .from("evidences")
      .createSignedUrl(evidence.storage_path, 60 * 60);
    if (data?.signedUrl) setUrl(data.signedUrl);
  }

  if (!url) {
    // Lazy-fetch signed URL on first render
    fetchUrl();
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-secondary/50">
      <div className="aspect-video bg-black/40">
        {url ? (
          evidence.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={evidence.caption ?? "evidence"}
              className="h-full w-full object-cover"
            />
          ) : evidence.kind === "video" ? (
            <video src={url} controls className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <FileIcon className="h-8 w-8" />
            </div>
          )
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}
      </div>
      <div className="flex items-start justify-between gap-2 p-2">
        <p className="line-clamp-2 text-[11px] text-foreground/80">
          {evidence.caption ?? "sem legenda"}
        </p>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!confirm("Excluir esta evidência?")) return;
            startTransition(async () => {
              await deleteEvidence(evidence.id, evidence.storage_path, leadId);
            });
          }}
          className="rounded p-1 text-muted-foreground hover:text-red-400"
          aria-label="Excluir"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {evidence.kind === "video" && (
        <div className="pointer-events-none absolute right-1 top-1 rounded bg-black/60 p-1 text-white">
          <Play className="h-3 w-3" />
        </div>
      )}
    </div>
  );
}
