"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Instagram,
  PauseCircle,
  XCircle,
  Loader2,
  CornerDownLeft,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { STAGE_LABEL, CATEGORY_LABEL } from "@/lib/stages";
import type { Lead } from "@/lib/types";
import { cn } from "@/lib/utils";

type LeadResult = Pick<
  Lead,
  | "id"
  | "name"
  | "instagram_handle"
  | "stage"
  | "category"
  | "is_on_hold"
  | "discarded_at"
  | "tags"
  | "email"
  | "phone"
  | "current_partnership"
>;

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [leads, setLeads] = useState<LeadResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Listener Cmd+K / Ctrl+K global
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Fetch leads na primeira abertura
  const fetchLeads = useCallback(async () => {
    if (leads !== null) return;
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from("leads")
        .select(
          "id,name,instagram_handle,stage,category,is_on_hold,discarded_at,tags,email,phone,current_partnership",
        )
        .order("updated_at", { ascending: false })
        .limit(500);
      setLeads((data ?? []) as LeadResult[]);
    } finally {
      setLoading(false);
    }
  }, [leads]);

  useEffect(() => {
    if (open) {
      fetchLeads();
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQ("");
      setSelectedIdx(0);
    }
  }, [open, fetchLeads]);

  const results = useMemo(() => {
    if (!leads) return [];
    const qlc = q.trim().toLowerCase();
    if (!qlc) return leads.slice(0, 25);
    return leads
      .filter((l) => {
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
        return hay.includes(qlc);
      })
      .slice(0, 25);
  }, [leads, q]);

  useEffect(() => {
    // Reseta seleção quando filtros mudam
    setSelectedIdx(0);
  }, [q]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, Math.max(0, results.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = results[selectedIdx];
      if (target) {
        router.push(`/leads/${target.id}`);
        setOpen(false);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="top-[22%] max-w-xl translate-y-0 gap-0 p-0">
        <DialogTitle className="sr-only">Buscar leads</DialogTitle>

        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Buscar lead por nome, @, e-mail, tag..."
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground md:inline">
            ESC
          </kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-1.5">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando leads...
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              {q ? `Nenhum lead encontrado pra "${q}".` : "Nenhum lead ainda."}
            </div>
          ) : (
            <ul role="listbox" className="space-y-0.5">
              {results.map((l, idx) => {
                const selected = idx === selectedIdx;
                return (
                  <li key={l.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onMouseEnter={() => setSelectedIdx(idx)}
                      onClick={() => {
                        router.push(`/leads/${l.id}`);
                        setOpen(false);
                      }}
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition",
                        selected
                          ? "bg-primary/10"
                          : "hover:bg-secondary",
                      )}
                    >
                      <div
                        className={cn(
                          "grid h-9 w-9 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                          selected
                            ? "bg-primary text-white"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        {initials(l.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-semibold text-foreground">
                            {l.name}
                          </span>
                          {l.is_on_hold && (
                            <PauseCircle className="h-3 w-3 shrink-0 text-amber-400" />
                          )}
                          {l.discarded_at && (
                            <XCircle className="h-3 w-3 shrink-0 text-red-400" />
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                          {l.instagram_handle && (
                            <span className="inline-flex items-center gap-0.5">
                              <Instagram className="h-2.5 w-2.5" />
                              {l.instagram_handle}
                            </span>
                          )}
                          {l.category && (
                            <span>· {CATEGORY_LABEL[l.category]}</span>
                          )}
                        </div>
                      </div>
                      <Badge variant="primary" className="shrink-0">
                        {STAGE_LABEL[l.stage]}
                      </Badge>
                      {selected && (
                        <CornerDownLeft className="h-3 w-3 text-primary" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-secondary px-1 py-0.5 font-semibold">
                ↑↓
              </kbd>
              navegar
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-secondary px-1 py-0.5 font-semibold">
                ↵
              </kbd>
              abrir
            </span>
          </div>
          <div>{results.length} resultado(s)</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
