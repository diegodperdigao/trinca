"use client";

import { useEffect, useMemo, useState } from "react";
import { Table2, LayoutGrid, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  STAGES,
  CATEGORIES,
  ORIGINS,
  STAGE_LABEL,
} from "@/lib/stages";
import type { Lead } from "@/lib/types";
import { LeadTable } from "./lead-table";
import { LeadKanban } from "./lead-kanban";

type Mode = "table" | "kanban";

export function LeadsView({ leads }: { leads: Lead[] }) {
  const [mode, setMode] = useState<Mode>("kanban");
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [origin, setOrigin] = useState<string>("all");
  const [status, setStatus] = useState<string>("active");

  useEffect(() => {
    const stored = localStorage.getItem("trinca.leads.mode");
    if (stored === "table" || stored === "kanban") setMode(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("trinca.leads.mode", mode);
  }, [mode]);

  const filtered = useMemo(() => {
    const qlc = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (status === "active" && (l.discarded_at || l.is_on_hold)) return false;
      if (status === "hold" && !l.is_on_hold) return false;
      if (status === "discarded" && !l.discarded_at) return false;
      if (stage !== "all" && l.stage !== stage) return false;
      if (category !== "all" && l.category !== category) return false;
      if (origin !== "all" && l.origin !== origin) return false;
      if (qlc) {
        const hay = [
          l.name,
          l.instagram_handle,
          l.email,
          l.phone,
          l.current_partnership,
          l.tags?.join(" "),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(qlc)) return false;
      }
      return true;
    });
  }, [leads, q, stage, category, origin, status]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, @, e-mail, tag..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 md:flex md:flex-none">
          <Select value={stage} onValueChange={setStage}>
            <SelectTrigger className="md:w-40">
              <SelectValue placeholder="Estágio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos estágios</SelectItem>
              {STAGES.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {STAGE_LABEL[s.id]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="md:w-36">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={origin} onValueChange={setOrigin}>
            <SelectTrigger className="md:w-36">
              <SelectValue placeholder="Origem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas origens</SelectItem>
              {ORIGINS.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="md:w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="hold">Stand by</SelectItem>
              <SelectItem value="discarded">Descartados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto inline-flex shrink-0 rounded-lg border border-border bg-secondary p-1">
          <button
            type="button"
            onClick={() => setMode("kanban")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition",
              mode === "kanban"
                ? "bg-gradient-cta text-white shadow-glow"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Kanban
          </button>
          <button
            type="button"
            onClick={() => setMode("table")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition",
              mode === "table"
                ? "bg-gradient-cta text-white shadow-glow"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Table2 className="h-3.5 w-3.5" />
            Tabela
          </button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        {filtered.length} de {leads.length} leads
      </div>

      {mode === "kanban" ? (
        <LeadKanban leads={filtered} />
      ) : (
        <LeadTable leads={filtered} />
      )}
    </div>
  );
}
