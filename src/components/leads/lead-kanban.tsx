"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { Instagram, PauseCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { STAGES, CATEGORY_LABEL } from "@/lib/stages";
import type { Lead, LeadStage } from "@/lib/types";
import { cn, instagramUrl, relativeDayLabel } from "@/lib/utils";
import { updateLeadStage } from "@/app/actions/leads";

export function LeadKanban({ leads: initial }: { leads: Lead[] }) {
  const [leads, setLeads] = useState(initial);
  const [, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) return;
    const leadId = String(active.id);
    const newStage = String(over.id) as LeadStage;
    const target = leads.find((l) => l.id === leadId);
    if (!target || target.stage === newStage) return;

    // optimistic
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l)),
    );
    startTransition(async () => {
      try {
        await updateLeadStage(leadId, newStage);
      } catch (err) {
        // rollback
        setLeads((prev) =>
          prev.map((l) =>
            l.id === leadId ? { ...l, stage: target.stage } : l,
          ),
        );
        alert("Erro ao atualizar estágio");
      }
    });
  }

  const byStage = STAGES.reduce<Record<LeadStage, Lead[]>>(
    (acc, s) => ({ ...acc, [s.id]: [] }),
    {} as Record<LeadStage, Lead[]>,
  );
  for (const l of leads) {
    if (l.discarded_at) continue;
    byStage[l.stage].push(l);
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-4 md:mx-0 md:px-0">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage.id}
            id={stage.id}
            label={stage.label}
            leads={byStage[stage.id]}
          />
        ))}
      </div>
    </DndContext>
  );
}

function KanbanColumn({
  id,
  label,
  leads,
}: {
  id: LeadStage;
  label: string;
  leads: Lead[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-full min-h-[60vh] w-72 shrink-0 flex-col rounded-xl border bg-card/30 transition",
        isOver
          ? "border-primary/60 bg-primary/5 shadow-glow"
          : "border-border",
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
          {label}
        </h3>
        <Badge variant="muted">{leads.length}</Badge>
      </div>
      <div className="flex-1 space-y-2 p-2 overflow-y-auto">
        {leads.map((l) => (
          <KanbanCard key={l.id} lead={l} />
        ))}
        {leads.length === 0 && (
          <div className="rounded-md border border-dashed border-border/80 p-3 text-center text-[11px] text-muted-foreground">
            vazio
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: lead.id });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group cursor-grab touch-none rounded-lg border border-border bg-secondary/80 p-3 text-xs shadow-sm transition hover:border-primary/40 active:cursor-grabbing",
        isDragging && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/leads/${lead.id}`}
          onPointerDown={(e) => e.stopPropagation()}
          className="min-w-0 flex-1"
        >
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-foreground">
              {lead.name}
            </span>
            {lead.is_on_hold && (
              <PauseCircle className="h-3 w-3 shrink-0 text-amber-400" />
            )}
          </div>
          {lead.instagram_handle && (
            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Instagram className="h-3 w-3" />
              @{lead.instagram_handle}
            </div>
          )}
        </Link>
        {lead.instagram_handle && (
          <a
            href={instagramUrl(lead.instagram_handle)!}
            target="_blank"
            rel="noreferrer noopener"
            onPointerDown={(e) => e.stopPropagation()}
            className="rounded text-muted-foreground hover:text-primary"
            aria-label="Abrir Instagram"
          >
            <Instagram className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1">
        {lead.category && (
          <Badge variant="muted">{CATEGORY_LABEL[lead.category]}</Badge>
        )}
        {lead.next_action_due_at && (
          <Badge variant="warning">
            {relativeDayLabel(lead.next_action_due_at)}
          </Badge>
        )}
      </div>
    </div>
  );
}
