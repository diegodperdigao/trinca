import { createSupabaseServerClient } from "@/lib/supabase/server";
import { STAGES } from "@/lib/stages";
import type {
  Lead,
  LeadMeeting,
  LeadNote,
  LeadEvidence,
  LeadStage,
  LeadStageHistory,
} from "@/lib/types";

export async function getLeads(): Promise<Lead[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Lead[];
}

export async function getLead(id: string): Promise<Lead | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as Lead | null;
}

export async function getLeadNotes(leadId: string): Promise<LeadNote[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("lead_notes")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as LeadNote[];
}

export async function getLeadEvidences(leadId: string): Promise<LeadEvidence[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("lead_evidences")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as LeadEvidence[];
}

export async function getLeadMeetings(leadId: string): Promise<LeadMeeting[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("lead_meetings")
    .select("*")
    .eq("lead_id", leadId)
    .order("starts_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as LeadMeeting[];
}

export async function getLeadStageHistory(
  leadId: string,
): Promise<LeadStageHistory[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("lead_stage_history")
    .select("*")
    .eq("lead_id", leadId)
    .order("changed_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as LeadStageHistory[];
}

export async function getUpcomingMeetings(limit = 20): Promise<
  (LeadMeeting & { lead_name: string; instagram_handle: string | null })[]
> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("lead_meetings")
    .select("*, leads!inner(name,instagram_handle)")
    .eq("done", false)
    .gte("starts_at", new Date(Date.now() - 1000 * 60 * 60).toISOString())
    .order("starts_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...row,
    lead_name: row.leads?.name,
    instagram_handle: row.leads?.instagram_handle,
  }));
}

// ============ Computed dashboard metrics ============

export interface DashboardMetrics {
  totalProspected: number;
  inFunnel: number;
  meetingsThisWeek: number;
  conversionRate: number; // 0..1
  wonCount: number;
  onHoldCount: number;
  discardedCount: number;
  stageCounts: Record<LeadStage, number>;
  pendingActions: Lead[];
  onHoldLeads: Lead[];
  recentDiscards: Lead[];
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const leads = await getLeads();

  const stageCounts = STAGES.reduce(
    (acc, s) => ({ ...acc, [s.id]: 0 }),
    {} as Record<LeadStage, number>,
  );

  let wonCount = 0;
  let onHoldCount = 0;
  let discardedCount = 0;
  const onHoldLeads: Lead[] = [];
  const recentDiscards: Lead[] = [];
  const pendingActions: Lead[] = [];

  const now = new Date();
  const threeDaysOut = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  for (const l of leads) {
    if (l.discarded_at) {
      discardedCount++;
      recentDiscards.push(l);
      continue;
    }
    // Ativos contam pra funnel
    stageCounts[l.stage]++;
    if (l.stage === "won") wonCount++;
    if (l.is_on_hold) {
      onHoldCount++;
      onHoldLeads.push(l);
    }
    if (
      l.next_action &&
      l.next_action_due_at &&
      new Date(l.next_action_due_at) <= threeDaysOut
    ) {
      pendingActions.push(l);
    }
  }

  const totalProspected = leads.length;
  const inFunnel = leads.filter(
    (l) => !l.discarded_at && !l.is_on_hold && l.stage !== "won",
  ).length;

  // meetings this week
  const supabase = await createSupabaseServerClient();
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  const { count: meetingsThisWeek } = await supabase
    .from("lead_meetings")
    .select("*", { count: "exact", head: true })
    .gte("starts_at", weekStart.toISOString())
    .lt("starts_at", weekEnd.toISOString());

  return {
    totalProspected,
    inFunnel,
    meetingsThisWeek: meetingsThisWeek ?? 0,
    conversionRate: totalProspected > 0 ? wonCount / totalProspected : 0,
    wonCount,
    onHoldCount,
    discardedCount,
    stageCounts,
    pendingActions: pendingActions
      .sort(
        (a, b) =>
          new Date(a.next_action_due_at!).getTime() -
          new Date(b.next_action_due_at!).getTime(),
      )
      .slice(0, 8),
    onHoldLeads: onHoldLeads.slice(0, 8),
    recentDiscards: recentDiscards
      .sort(
        (a, b) =>
          new Date(b.discarded_at!).getTime() -
          new Date(a.discarded_at!).getTime(),
      )
      .slice(0, 6),
  };
}
