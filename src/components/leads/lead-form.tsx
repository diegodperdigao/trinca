"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ExternalLink, Loader2, Save } from "lucide-react";
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
import { STAGES, CATEGORIES, ORIGINS } from "@/lib/stages";
import type { Lead } from "@/lib/types";
import { createLead, updateLead } from "@/app/actions/leads";
import { parseDuplicateHandleError } from "@/lib/utils";

interface LeadFormProps {
  lead?: Lead;
}

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

export function LeadForm({ lead }: LeadFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [stage, setStage] = useState(lead?.stage ?? "prospect");
  const [category, setCategory] = useState(lead?.category ?? "");
  const [origin, setOrigin] = useState(lead?.origin ?? "");

  function submit(forceDuplicate = false) {
    setError(null);
    if (!forceDuplicate) setDuplicate(null);

    const form = document.querySelector<HTMLFormElement>("#lead-form");
    if (!form) return;
    const fd = new FormData(form);
    fd.set("stage", stage);
    fd.set("category", category);
    fd.set("origin", origin);
    if (forceDuplicate) fd.set("force_duplicate", "1");

    startTransition(async () => {
      try {
        if (lead) {
          await updateLead(lead.id, fd);
          router.refresh();
        } else {
          await createLead(fd);
        }
      } catch (err: any) {
        // redirect() do server action propaga como erro — deixa passar
        if (
          err?.message === "NEXT_REDIRECT" ||
          err?.digest?.startsWith?.("NEXT_REDIRECT")
        ) {
          throw err;
        }
        const dupe = parseDuplicateHandleError(err);
        if (dupe) {
          setDuplicate(dupe);
          return;
        }
        setError(err?.message ?? "Erro ao salvar");
      }
    });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submit(false);
  }

  return (
    <form id="lead-form" onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={lead?.name}
            placeholder="Ex: João da Silva"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="instagram_handle">Instagram @</Label>
          <Input
            id="instagram_handle"
            name="instagram_handle"
            defaultValue={lead?.instagram_handle ?? ""}
            placeholder="joaodasilva"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="phone">Telefone / WhatsApp</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={lead?.phone ?? ""}
            placeholder="+55 11 99999-9999"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={lead?.email ?? ""}
            placeholder="lead@exemplo.com"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label>Categoria</Label>
          <Select
            value={category || undefined}
            onValueChange={(v) => setCategory(v)}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Origem</Label>
          <Select
            value={origin || undefined}
            onValueChange={(v) => setOrigin(v)}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {ORIGINS.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="current_partnership">Parceria atual</Label>
          <Input
            id="current_partnership"
            name="current_partnership"
            defaultValue={lead?.current_partnership ?? ""}
            placeholder="Ex: Blaze, Pixbet, Estrela Bet, sem parceria..."
            className="mt-1.5"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Em qual casa o lead está afiliado no momento — ajuda a entender
            o contexto competitivo antes da call.
          </p>
        </div>

        <div>
          <Label>Estágio *</Label>
          <Select value={stage} onValueChange={(v) => setStage(v as any)}>
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAGES.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
          <Input
            id="tags"
            name="tags"
            defaultValue={lead?.tags?.join(", ") ?? ""}
            placeholder="quente, indicacao-renato, sp"
            className="mt-1.5"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="next_action">Próxima ação</Label>
          <Textarea
            id="next_action"
            name="next_action"
            defaultValue={lead?.next_action ?? ""}
            placeholder="Ex: Responder DM com proposta de call"
            className="mt-1.5"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="next_action_due_at">Prazo da ação</Label>
          <Input
            id="next_action_due_at"
            name="next_action_due_at"
            type="datetime-local"
            defaultValue={toLocalInput(lead?.next_action_due_at ?? null)}
            className="mt-1.5"
          />
        </div>
      </div>

      {duplicate && (
        <div className="flex flex-col gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm md:flex-row md:items-center">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">
              Esse @ já está cadastrado
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              O lead &quot;<strong>{duplicate.name}</strong>&quot; já existe
              com esse Instagram. Abra o existente ou force a criação se
              for intencional.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:flex-nowrap">
            <Button asChild variant="secondary" size="sm">
              <Link href={`/leads/${duplicate.id}`}>
                Abrir lead
                <ExternalLink className="!size-3" />
              </Link>
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={pending}
              onClick={() => submit(true)}
            >
              Criar mesmo assim
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-300">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Save />}
          {lead ? "Salvar alterações" : "Criar lead"}
        </Button>
      </div>
    </form>
  );
}
