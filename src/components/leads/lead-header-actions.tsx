"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  PauseCircle,
  PlayCircle,
  XCircle,
  RotateCcw,
  Instagram,
  ExternalLink,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DISCARD_REASONS, DISCARD_REASON_LABEL } from "@/lib/stages";
import type { Lead, DiscardReason } from "@/lib/types";
import { instagramUrl, formatRelative } from "@/lib/utils";
import {
  toggleOnHold,
  discardLead,
  reviveLead,
  deleteLead,
} from "@/app/actions/leads";
import { Badge } from "@/components/ui/badge";

export function LeadHeaderActions({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [discardOpen, setDiscardOpen] = useState(false);
  const [reason, setReason] = useState<DiscardReason>("no_response");
  const [comment, setComment] = useState("");

  const igUrl = instagramUrl(lead.instagram_handle);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {igUrl && (
          <Button asChild variant="secondary" size="sm">
            <a href={igUrl} target="_blank" rel="noreferrer noopener">
              <Instagram />
              Ver no Instagram
              <ExternalLink className="!size-3" />
            </a>
          </Button>
        )}

        {!lead.discarded_at && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await toggleOnHold(lead.id, !lead.is_on_hold);
                router.refresh();
              })
            }
          >
            {lead.is_on_hold ? <PlayCircle /> : <PauseCircle />}
            {lead.is_on_hold ? "Retomar" : "Stand By"}
          </Button>
        )}

        {lead.discarded_at ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await reviveLead(lead.id);
                router.refresh();
              })
            }
          >
            <RotateCcw />
            Recuperar
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setDiscardOpen(true)}
            className="border-red-500/30 text-red-300 hover:bg-red-500/10"
          >
            <XCircle />
            Descartar
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() => {
            if (!confirm("Excluir permanentemente este lead e todo o histórico?"))
              return;
            startTransition(async () => {
              await deleteLead(lead.id);
            });
          }}
          className="ml-auto text-muted-foreground hover:text-red-400"
        >
          <Trash2 />
        </Button>
      </div>

      {/* Status banners */}
      {lead.is_on_hold && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-200">
          <strong>Em stand by.</strong> Este lead está pausado e não aparece no
          funil ativo.
        </div>
      )}
      {lead.discarded_at && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-200">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="danger">Descartado</Badge>
            {lead.discard_reason && (
              <span>{DISCARD_REASON_LABEL[lead.discard_reason]}</span>
            )}
            <span className="text-muted-foreground">
              {formatRelative(lead.discarded_at)}
            </span>
          </div>
          {lead.discard_comment && (
            <p className="mt-1.5 whitespace-pre-wrap text-red-100/90">
              {lead.discard_comment}
            </p>
          )}
        </div>
      )}

      {/* Discard dialog */}
      <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Descartar lead</DialogTitle>
            <DialogDescription>
              Pra alimentar o relatório de perdas, registre o motivo. Você pode
              recuperar depois se mudar de ideia.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Motivo</Label>
              <Select
                value={reason}
                onValueChange={(v) => setReason(v as DiscardReason)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DISCARD_REASONS.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Comentário</Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Contexto livre"
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDiscardOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={pending}
              onClick={() => {
                const fd = new FormData();
                fd.set("id", lead.id);
                fd.set("reason", reason);
                fd.set("comment", comment);
                startTransition(async () => {
                  await discardLead(fd);
                  setDiscardOpen(false);
                  router.refresh();
                });
              }}
            >
              {pending ? <Loader2 className="animate-spin" /> : <XCircle />}
              Confirmar descarte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
