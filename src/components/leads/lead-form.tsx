"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
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

  const [stage, setStage] = useState(lead?.stage ?? "prospect");
  const [category, setCategory] = useState(lead?.category ?? "");
  const [origin, setOrigin] = useState(lead?.origin ?? "");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("stage", stage);
    fd.set("category", category);
    fd.set("origin", origin);

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
        setError(err?.message ?? "Erro ao salvar");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
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
