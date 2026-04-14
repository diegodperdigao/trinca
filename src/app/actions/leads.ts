"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cleanInstagramHandle } from "@/lib/utils";
import type { LeadStage } from "@/lib/types";

const LeadSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Nome obrigatório").max(200),
  instagram_handle: z.string().max(200).optional().nullable(),
  category: z
    .enum(["roleta", "slots", "aviator", "cassino_ao_vivo", "esportes", "outro"])
    .optional()
    .nullable(),
  phone: z.string().max(40).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  origin: z
    .enum(["indicacao", "busca_ativa", "evento", "inbound", "outro"])
    .optional()
    .nullable(),
  stage: z.enum([
    "prospect",
    "dm_sent",
    "in_conversation",
    "follow_up",
    "meeting_scheduled",
    "meeting_done",
    "proposal_sent",
    "negotiation",
    "won",
  ]),
  tags: z.string().optional().nullable(),
  next_action: z.string().optional().nullable(),
  next_action_due_at: z.string().optional().nullable(),
});

function fdGet(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  if (v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function parseTags(input: string | null): string[] {
  if (!input) return [];
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 20);
}

/**
 * Server action que checa se um @instagram já existe.
 * Chamada pelo lead form pra avisar antes de submeter.
 * Retorna o lead existente ou null.
 */
export async function findLeadByHandle(
  rawHandle: string,
): Promise<{ id: string; name: string } | null> {
  const handle = cleanInstagramHandle(rawHandle);
  if (!handle) return null;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("leads")
    .select("id,name")
    .ilike("instagram_handle", handle)
    .is("discarded_at", null)
    .limit(1)
    .maybeSingle();

  return (data ?? null) as { id: string; name: string } | null;
}

export async function createLead(fd: FormData) {
  const parsed = LeadSchema.parse({
    name: fdGet(fd, "name"),
    instagram_handle: fdGet(fd, "instagram_handle"),
    category: fdGet(fd, "category"),
    phone: fdGet(fd, "phone"),
    email: fdGet(fd, "email"),
    origin: fdGet(fd, "origin"),
    stage: fdGet(fd, "stage") ?? "prospect",
    tags: fdGet(fd, "tags"),
    next_action: fdGet(fd, "next_action"),
    next_action_due_at: fdGet(fd, "next_action_due_at"),
  });

  const supabase = await createSupabaseServerClient();

  // Check duplicata por @instagram (ignora descartados — você pode
  // revisitar um lead que foi descartado antes).
  const cleanHandle = cleanInstagramHandle(parsed.instagram_handle);
  if (cleanHandle && fd.get("force_duplicate") !== "1") {
    const { data: existing } = await supabase
      .from("leads")
      .select("id,name")
      .ilike("instagram_handle", cleanHandle)
      .is("discarded_at", null)
      .limit(1)
      .maybeSingle();
    if (existing) {
      throw new Error(`DUPE_HANDLE:${existing.id}:${existing.name}`);
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("leads")
    .insert({
      name: parsed.name,
      instagram_handle: cleanHandle,
      category: parsed.category || null,
      phone: parsed.phone || null,
      email: parsed.email || null,
      origin: parsed.origin || null,
      stage: parsed.stage,
      tags: parseTags(parsed.tags ?? null),
      next_action: parsed.next_action || null,
      next_action_due_at: parsed.next_action_due_at
        ? new Date(parsed.next_action_due_at).toISOString()
        : null,
      owner_id: user?.id ?? null,
    });

  if (error) throw new Error(error.message);

  revalidatePath("/leads");
  revalidatePath("/dashboard");
  // Volta pro kanban depois de criar, pra o Diego continuar operando
  // sem precisar dar "voltar" do detalhe.
  redirect("/leads");
}

export async function updateLead(id: string, fd: FormData) {
  const parsed = LeadSchema.parse({
    id,
    name: fdGet(fd, "name"),
    instagram_handle: fdGet(fd, "instagram_handle"),
    category: fdGet(fd, "category"),
    phone: fdGet(fd, "phone"),
    email: fdGet(fd, "email"),
    origin: fdGet(fd, "origin"),
    stage: fdGet(fd, "stage") ?? "prospect",
    tags: fdGet(fd, "tags"),
    next_action: fdGet(fd, "next_action"),
    next_action_due_at: fdGet(fd, "next_action_due_at"),
  });

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("leads")
    .update({
      name: parsed.name,
      instagram_handle: cleanInstagramHandle(parsed.instagram_handle),
      category: parsed.category || null,
      phone: parsed.phone || null,
      email: parsed.email || null,
      origin: parsed.origin || null,
      stage: parsed.stage,
      tags: parseTags(parsed.tags ?? null),
      next_action: parsed.next_action || null,
      next_action_due_at: parsed.next_action_due_at
        ? new Date(parsed.next_action_due_at).toISOString()
        : null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/leads/${id}`);
  revalidatePath("/leads");
  revalidatePath("/dashboard");
}

export async function updateLeadStage(id: string, stage: LeadStage) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("leads")
    .update({ stage })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  revalidatePath("/dashboard");
}

export async function toggleOnHold(id: string, value: boolean, reason?: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("leads")
    .update({
      is_on_hold: value,
      hold_reason: value ? reason ?? null : null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/leads/${id}`);
  revalidatePath("/leads");
  revalidatePath("/dashboard");
}

export async function discardLead(fd: FormData) {
  const id = String(fd.get("id"));
  const reason = String(fd.get("reason"));
  const comment = (fd.get("comment") as string | null) ?? "";

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("leads")
    .update({
      discarded_at: new Date().toISOString(),
      discard_reason: reason,
      discard_comment: comment || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/leads/${id}`);
  revalidatePath("/leads");
  revalidatePath("/dashboard");
}

export async function reviveLead(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("leads")
    .update({
      discarded_at: null,
      discard_reason: null,
      discard_comment: null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/leads/${id}`);
  revalidatePath("/leads");
  revalidatePath("/dashboard");
}

export async function addNote(fd: FormData) {
  const leadId = String(fd.get("lead_id"));
  const body = String(fd.get("body") ?? "").trim();
  if (!body) return;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("lead_notes").insert({
    lead_id: leadId,
    body,
    author_id: user?.id ?? null,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/leads/${leadId}`);
}

export async function deleteNote(noteId: string, leadId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("lead_notes").delete().eq("id", noteId);
  if (error) throw new Error(error.message);
  revalidatePath(`/leads/${leadId}`);
}

export async function createMeeting(fd: FormData) {
  const leadId = String(fd.get("lead_id"));
  const title = String(fd.get("title") ?? "Reunião").trim();
  const startsAt = String(fd.get("starts_at"));
  const endsAtRaw = (fd.get("ends_at") as string | null) ?? "";
  const mode = (String(fd.get("mode") ?? "online")) as "online" | "in_person";
  const link = (fd.get("link") as string | null) ?? null;
  const location = (fd.get("location") as string | null) ?? null;
  const notes = (fd.get("notes") as string | null) ?? null;

  if (!startsAt) throw new Error("Data de início obrigatória");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("lead_meetings").insert({
    lead_id: leadId,
    created_by: user?.id ?? null,
    title,
    starts_at: new Date(startsAt).toISOString(),
    ends_at: endsAtRaw ? new Date(endsAtRaw).toISOString() : null,
    mode,
    link: link || null,
    location: location || null,
    notes: notes || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/dashboard");
}

export async function markMeeting(
  meetingId: string,
  leadId: string,
  state: { done?: boolean; no_show?: boolean },
) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("lead_meetings")
    .update(state)
    .eq("id", meetingId);
  if (error) throw new Error(error.message);
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/dashboard");
}

export async function deleteMeeting(meetingId: string, leadId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("lead_meetings")
    .delete()
    .eq("id", meetingId);
  if (error) throw new Error(error.message);
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/dashboard");
}

export async function addEvidence(fd: FormData) {
  const leadId = String(fd.get("lead_id"));
  const caption = (fd.get("caption") as string | null) ?? null;
  const file = fd.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("Arquivo obrigatório");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${leadId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("evidences")
    .upload(path, file, {
      contentType: file.type || undefined,
      upsert: false,
    });
  if (upErr) throw new Error(upErr.message);

  const kind: "image" | "video" | "file" = file.type.startsWith("image/")
    ? "image"
    : file.type.startsWith("video/")
      ? "video"
      : "file";

  const { error } = await supabase.from("lead_evidences").insert({
    lead_id: leadId,
    storage_path: path,
    mime_type: file.type || null,
    caption: caption || null,
    kind,
    uploader_id: user?.id ?? null,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/leads/${leadId}`);
}

export async function deleteEvidence(
  evidenceId: string,
  storagePath: string,
  leadId: string,
) {
  const supabase = await createSupabaseServerClient();
  await supabase.storage.from("evidences").remove([storagePath]);
  const { error } = await supabase
    .from("lead_evidences")
    .delete()
    .eq("id", evidenceId);
  if (error) throw new Error(error.message);
  revalidatePath(`/leads/${leadId}`);
}

export async function deleteLead(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/leads");
  revalidatePath("/dashboard");
  redirect("/leads");
}
