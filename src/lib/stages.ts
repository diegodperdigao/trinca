import type {
  LeadStage,
  LeadCategory,
  LeadOrigin,
  DiscardReason,
} from "./types";

export const STAGES: { id: LeadStage; label: string; short: string }[] = [
  { id: "prospect", label: "Prospecção", short: "Prospec." },
  { id: "dm_sent", label: "Abordagem Enviada", short: "DM" },
  { id: "in_conversation", label: "Em Conversa", short: "Conversa" },
  { id: "follow_up", label: "Follow Up", short: "FUP" },
  { id: "meeting_scheduled", label: "Reunião Agendada", short: "Ag." },
  { id: "meeting_done", label: "Reunião Realizada", short: "Realiz." },
  { id: "proposal_sent", label: "Proposta Enviada", short: "Proposta" },
  { id: "negotiation", label: "Em Negociação", short: "Negoc." },
  { id: "won", label: "Negócio Fechado", short: "Fechado" },
];

export const STAGE_LABEL: Record<LeadStage, string> = STAGES.reduce(
  (acc, s) => ({ ...acc, [s.id]: s.label }),
  {} as Record<LeadStage, string>,
);

export const STAGE_ORDER: Record<LeadStage, number> = STAGES.reduce(
  (acc, s, i) => ({ ...acc, [s.id]: i }),
  {} as Record<LeadStage, number>,
);

export const CATEGORIES: { id: LeadCategory; label: string }[] = [
  { id: "roleta", label: "Roleta" },
  { id: "slots", label: "Slots" },
  { id: "aviator", label: "Aviator" },
  { id: "cassino_ao_vivo", label: "Cassino ao Vivo" },
  { id: "esportes", label: "Esportes" },
  { id: "outro", label: "Outro" },
];

export const CATEGORY_LABEL: Record<LeadCategory, string> = CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.id]: c.label }),
  {} as Record<LeadCategory, string>,
);

export const ORIGINS: { id: LeadOrigin; label: string }[] = [
  { id: "indicacao", label: "Indicação" },
  { id: "busca_ativa", label: "Busca Ativa" },
  { id: "evento", label: "Evento" },
  { id: "inbound", label: "Inbound" },
  { id: "outro", label: "Outro" },
];

export const ORIGIN_LABEL: Record<LeadOrigin, string> = ORIGINS.reduce(
  (acc, o) => ({ ...acc, [o.id]: o.label }),
  {} as Record<LeadOrigin, string>,
);

export const DISCARD_REASONS: { id: DiscardReason; label: string }[] = [
  { id: "no_profile_match", label: "Não é perfil" },
  { id: "no_response", label: "Não respondeu" },
  { id: "not_interested", label: "Sem interesse" },
  { id: "competitor_affiliate", label: "Já afiliado a concorrente" },
  { id: "unqualified_audience", label: "Audiência não qualificada" },
  { id: "other", label: "Outro" },
];

export const DISCARD_REASON_LABEL: Record<DiscardReason, string> =
  DISCARD_REASONS.reduce(
    (acc, d) => ({ ...acc, [d.id]: d.label }),
    {} as Record<DiscardReason, string>,
  );
