-- =========================================================================
-- Trinca CRM — Schema
-- Rode isso inteiro no SQL Editor do Supabase uma única vez.
-- =========================================================================

-- ============ Extensions ============
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============ Whitelist de e-mails ============
-- Alimente esta tabela com os e-mails autorizados a entrar.
-- A RLS depende disso.
create table if not exists public.allowed_users (
  email text primary key,
  display_name text,
  created_at timestamptz not null default now()
);

-- Insira os 2 usuários. Troque pelos seus e-mails reais.
insert into public.allowed_users (email, display_name) values
  ('voce@exemplo.com', 'Diego'),
  ('socio@trincadoigaming.com.br', 'Trinca')
on conflict (email) do nothing;

-- ============ Função helper: está logado e autorizado? ============
create or replace function public.is_authorized()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.allowed_users au
    where lower(au.email) = lower(coalesce(
      (auth.jwt() ->> 'email'),
      (select email from auth.users where id = auth.uid())
    ))
  );
$$;

-- ============ Enums ============
do $$ begin
  create type public.lead_stage as enum (
    'prospect',
    'dm_sent',
    'in_conversation',
    'follow_up',
    'meeting_scheduled',
    'meeting_done',
    'proposal_sent',
    'negotiation',
    'won'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.lead_category as enum (
    'roleta',
    'slots',
    'aviator',
    'cassino_ao_vivo',
    'esportes',
    'outro'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.lead_origin as enum (
    'indicacao',
    'busca_ativa',
    'evento',
    'inbound',
    'outro'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.discard_reason as enum (
    'no_profile_match',
    'no_response',
    'not_interested',
    'competitor_affiliate',
    'unqualified_audience',
    'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.meeting_mode as enum ('online', 'in_person');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.evidence_kind as enum ('image', 'video', 'file');
exception when duplicate_object then null; end $$;

-- ============ Tabela leads ============
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,

  name text not null,
  instagram_handle text,
  category public.lead_category,
  phone text,
  email text,
  origin public.lead_origin,
  current_partnership text,

  stage public.lead_stage not null default 'prospect',
  stage_entered_at timestamptz not null default now(),

  is_on_hold boolean not null default false,
  hold_reason text,

  discarded_at timestamptz,
  discard_reason public.discard_reason,
  discard_comment text,

  next_action text,
  next_action_due_at timestamptz,

  tags text[] not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_stage_idx on public.leads(stage);
create index if not exists leads_is_on_hold_idx on public.leads(is_on_hold);
create index if not exists leads_discarded_idx on public.leads(discarded_at);
create index if not exists leads_next_action_idx on public.leads(next_action_due_at);
create index if not exists leads_created_at_idx on public.leads(created_at desc);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

-- ============ Histórico de estágio ============
create table if not exists public.lead_stage_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  from_stage public.lead_stage,
  to_stage public.lead_stage not null,
  changed_at timestamptz not null default now(),
  changed_by uuid references auth.users(id) on delete set null
);

create index if not exists lsh_lead_idx on public.lead_stage_history(lead_id, changed_at desc);

-- Trigger para registrar transição de estágio
create or replace function public.record_stage_change()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.lead_stage_history(lead_id, from_stage, to_stage, changed_by)
    values (new.id, null, new.stage, auth.uid());
  elsif (tg_op = 'UPDATE' and new.stage is distinct from old.stage) then
    insert into public.lead_stage_history(lead_id, from_stage, to_stage, changed_by)
    values (new.id, old.stage, new.stage, auth.uid());
    new.stage_entered_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists leads_record_stage_change_ins on public.leads;
create trigger leads_record_stage_change_ins
after insert on public.leads
for each row execute function public.record_stage_change();

drop trigger if exists leads_record_stage_change_upd on public.leads;
create trigger leads_record_stage_change_upd
before update on public.leads
for each row execute function public.record_stage_change();

-- ============ Notas ============
create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists ln_lead_idx on public.lead_notes(lead_id, created_at desc);

-- ============ Evidências (arquivos) ============
create table if not exists public.lead_evidences (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  uploader_id uuid references auth.users(id) on delete set null,
  kind public.evidence_kind not null default 'image',
  storage_path text not null,
  mime_type text,
  caption text,
  created_at timestamptz not null default now()
);

create index if not exists le_lead_idx on public.lead_evidences(lead_id, created_at desc);

-- ============ Reuniões ============
create table if not exists public.lead_meetings (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  mode public.meeting_mode not null default 'online',
  link text,
  location text,
  notes text,
  done boolean not null default false,
  no_show boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists lm_lead_idx on public.lead_meetings(lead_id, starts_at desc);
create index if not exists lm_starts_idx on public.lead_meetings(starts_at);

-- =========================================================================
-- ROW LEVEL SECURITY
-- Política: qualquer usuário autenticado cujo e-mail está em allowed_users
-- pode ler/escrever em tudo. Fora da whitelist, bloqueia.
-- =========================================================================

alter table public.allowed_users enable row level security;
alter table public.leads enable row level security;
alter table public.lead_stage_history enable row level security;
alter table public.lead_notes enable row level security;
alter table public.lead_evidences enable row level security;
alter table public.lead_meetings enable row level security;

-- allowed_users: read-only pra quem está na lista (pra mostrar display_name)
drop policy if exists "authorized can read whitelist" on public.allowed_users;
create policy "authorized can read whitelist"
on public.allowed_users for select
to authenticated
using (public.is_authorized());

-- leads
drop policy if exists "authorized full access leads" on public.leads;
create policy "authorized full access leads"
on public.leads for all
to authenticated
using (public.is_authorized())
with check (public.is_authorized());

-- lead_stage_history
drop policy if exists "authorized full access stage history" on public.lead_stage_history;
create policy "authorized full access stage history"
on public.lead_stage_history for all
to authenticated
using (public.is_authorized())
with check (public.is_authorized());

-- lead_notes
drop policy if exists "authorized full access notes" on public.lead_notes;
create policy "authorized full access notes"
on public.lead_notes for all
to authenticated
using (public.is_authorized())
with check (public.is_authorized());

-- lead_evidences
drop policy if exists "authorized full access evidences" on public.lead_evidences;
create policy "authorized full access evidences"
on public.lead_evidences for all
to authenticated
using (public.is_authorized())
with check (public.is_authorized());

-- lead_meetings
drop policy if exists "authorized full access meetings" on public.lead_meetings;
create policy "authorized full access meetings"
on public.lead_meetings for all
to authenticated
using (public.is_authorized())
with check (public.is_authorized());

-- =========================================================================
-- STORAGE BUCKET para evidências
-- =========================================================================

insert into storage.buckets (id, name, public)
values ('evidences', 'evidences', false)
on conflict (id) do nothing;

-- Policies do storage: só whitelisted leem/gravam
drop policy if exists "authorized read evidences" on storage.objects;
create policy "authorized read evidences"
on storage.objects for select
to authenticated
using (bucket_id = 'evidences' and public.is_authorized());

drop policy if exists "authorized write evidences" on storage.objects;
create policy "authorized write evidences"
on storage.objects for insert
to authenticated
with check (bucket_id = 'evidences' and public.is_authorized());

drop policy if exists "authorized update evidences" on storage.objects;
create policy "authorized update evidences"
on storage.objects for update
to authenticated
using (bucket_id = 'evidences' and public.is_authorized());

drop policy if exists "authorized delete evidences" on storage.objects;
create policy "authorized delete evidences"
on storage.objects for delete
to authenticated
using (bucket_id = 'evidences' and public.is_authorized());
