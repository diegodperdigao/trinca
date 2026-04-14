export type LeadStage =
  | "prospect"
  | "dm_sent"
  | "in_conversation"
  | "follow_up"
  | "meeting_scheduled"
  | "meeting_done"
  | "proposal_sent"
  | "negotiation"
  | "won";

export type LeadCategory =
  | "roleta"
  | "slots"
  | "aviator"
  | "cassino_ao_vivo"
  | "esportes"
  | "outro";

export type LeadOrigin =
  | "indicacao"
  | "busca_ativa"
  | "evento"
  | "inbound"
  | "outro";

export type DiscardReason =
  | "no_profile_match"
  | "no_response"
  | "not_interested"
  | "competitor_affiliate"
  | "unqualified_audience"
  | "other";

export type MeetingMode = "online" | "in_person";
export type EvidenceKind = "image" | "video" | "file";

export interface Lead {
  id: string;
  owner_id: string | null;
  name: string;
  instagram_handle: string | null;
  category: LeadCategory | null;
  phone: string | null;
  email: string | null;
  origin: LeadOrigin | null;
  stage: LeadStage;
  stage_entered_at: string;
  is_on_hold: boolean;
  hold_reason: string | null;
  discarded_at: string | null;
  discard_reason: DiscardReason | null;
  discard_comment: string | null;
  next_action: string | null;
  next_action_due_at: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  author_id: string | null;
  body: string;
  created_at: string;
}

export interface LeadEvidence {
  id: string;
  lead_id: string;
  uploader_id: string | null;
  kind: EvidenceKind;
  storage_path: string;
  mime_type: string | null;
  caption: string | null;
  created_at: string;
}

export interface LeadMeeting {
  id: string;
  lead_id: string;
  created_by: string | null;
  title: string;
  starts_at: string;
  ends_at: string | null;
  mode: MeetingMode;
  link: string | null;
  location: string | null;
  notes: string | null;
  done: boolean;
  no_show: boolean;
  created_at: string;
}

export interface LeadStageHistory {
  id: string;
  lead_id: string;
  from_stage: LeadStage | null;
  to_stage: LeadStage;
  changed_at: string;
  changed_by: string | null;
}
