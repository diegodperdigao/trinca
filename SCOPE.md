# Trinca CRM — Escopo do Produto

> CRM interno de prospecção de afiliados para a Trinca do iGaming.
> Documento vivo — fonte única da verdade sobre o que está/não está no produto.

## Visão

Plataforma privada usada por 2 pessoas (Diego + sócio Trinca) para gerenciar o
pipeline de captação de novos afiliados, registrar cada interação, agendar e
receber lembretes de reuniões, e gerar um relatório executivo visual para a
Trinca acompanhar o andamento do projeto.

## Usuários

- **Operador** (Diego): prospecta, cadastra leads, avança estágios, agenda
  reuniões, anexa evidências.
- **Analista** (sócio Trinca): mesmo nível de acesso no MVP; foco em acompanhar
  KPIs e relatórios.

Ambos têm o mesmo papel. Whitelist por e-mail no Supabase.

## Modelo de dados (alto nível)

```
auth.users (Supabase nativo)
└── profiles               (perfil público mínimo por usuário)
leads                      (registro principal)
├── id, owner_id
├── name, instagram_handle, category, phone, email, origin
├── stage, stage_entered_at, is_on_hold, discarded_at, discard_reason,
│   discard_comment
├── next_action, next_action_due_at
├── created_at, updated_at
├── tags[]
lead_notes                 (histórico/timeline)
├── lead_id, author_id, body, created_at
lead_evidences             (uploads de prints/vídeos)
├── lead_id, kind, storage_path, caption, created_at
lead_meetings              (reuniões agendadas)
├── lead_id, title, starts_at, ends_at, mode (online|in_person),
│   link, location, notes, done, no_show
lead_stage_history         (rastro de mudanças de estágio)
├── lead_id, from_stage, to_stage, changed_at, changed_by
```

## Estágios do pipeline

Ordem canônica:

1. `prospect` — Prospecção
2. `dm_sent` — Abordagem Enviada (DM)
3. `in_conversation` — Em Conversa
4. `follow_up` — FUP
5. `meeting_scheduled` — Reunião Agendada
6. `meeting_done` — Reunião Realizada
7. `proposal_sent` — Proposta Enviada
8. `negotiation` — Em Negociação
9. `won` — Negócio Fechado

Estados paralelos (flag booleana, não posição no kanban):

- `is_on_hold` → Stand By
- `discarded_at` → Descartado (com `discard_reason` enum + `discard_comment` texto livre)

Leads **podem voltar de estágio**. Toda transição é registrada em
`lead_stage_history`.

### Motivos de descarte (enum)

- `no_profile_match` — Não é perfil
- `no_response` — Não respondeu
- `not_interested` — Sem interesse
- `competitor_affiliate` — Já afiliado a concorrente
- `unqualified_audience` — Audiência não qualificada
- `other` — Outro (usa o comentário)

## Categorias de expert (nicho)

`roleta`, `slots`, `aviator`, `cassino_ao_vivo`, `esportes`, `outro`.
Editável via constante no código — não tem tela de admin no MVP.

## Origens

`indicacao`, `busca_ativa`, `evento`, `inbound`, `outro`.

## Telas

### `/login`
- Magic link Supabase
- Fundo dark + partículas flutuantes (do guia visual)
- Logo Trinca + texto curto

### `/dashboard`
- **Topo**: 4 KPI cards — Total prospectado, No funil (exclui won/descartado/hold),
  Reuniões da semana, Conversão (won / prospectado)
- **Linha 2**: Funil horizontal (contagem por estágio + taxa de conversão entre etapas)
- **Linha 3 duas colunas**:
  - Reuniões da semana (lista com data, hora, lead, link)
  - Ações pendentes (leads com `next_action_due_at` < agora+3d)
- **Linha 4**: Stand By (chips clicáveis) + Últimos descartados

### `/leads`
- Toggle Tabela ⇄ Kanban (salva preferência em localStorage)
- Busca por nome/@
- Filtros: estágio, categoria, origem, hold, descartado
- Botão "Novo Lead"
- **Kanban**: colunas por estágio, drag-and-drop entre colunas dispara update no banco + registro em `lead_stage_history`
- **Tabela**: paginada, ordenável, densa

### `/leads/new` e `/leads/[id]`
- Form único (react-hook-form + zod)
- Campos: nome, @instagram (+ botão "Abrir perfil"), categoria, telefone,
  e-mail, origem, estágio, tags, próxima ação + prazo
- Abas internas na tela de detalhe:
  - **Visão geral** (form acima)
  - **Notas** (timeline cronológica reversa com markdown simples)
  - **Evidências** (upload de imagem/vídeo pro Supabase Storage)
  - **Reuniões** (lista + botão nova reunião + download `.ics`)
  - **Histórico** (read-only, mudanças de estágio)
- Ações no topo: Colocar em Stand By, Descartar (abre modal com motivo)

### `/report/print`
- Página A4 otimizada pra `Ctrl+P → Salvar como PDF`
- Seleção de período (query param `?from=&to=`)
- Header com logo Trinca + período + data geração
- Mesmos KPIs do dashboard + funil + tabela resumo + lista top leads
- CSS `@media print` garante fidelidade visual

## Notificações de reunião (MVP)

- **Sem e-mail/push automáticos** no MVP.
- Download do arquivo `.ics` ao criar reunião → o próprio Google Calendar/Apple
  Calendar do usuário dispara os lembretes nativos.
- No dashboard, lista "Reuniões da semana" destaca `hoje` e `amanhã`.
- V1.1 adiciona e-mail via Resend + cron Supabase.

## Out of scope (MVP)

- E-mail automático de lembrete (v1.1 com Resend)
- Integração OAuth Google Calendar (v1.1)
- Push browser notifications
- API pública / webhooks
- Importação em massa (CSV)
- Multi-tenant
- Metas mensais + gamificação
- Integração WhatsApp
- Scraping Instagram (fora por questão de TOS)
- Tela de administração de categorias/estágios (hardcoded no MVP)

## Stack

| Camada | Tech |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| UI | Tailwind v3 + shadcn/ui + Radix |
| Fonte | Inter (next/font) |
| Ícones | lucide-react |
| Backend | Supabase (Postgres + Auth + Storage + RLS) |
| Charts | Recharts |
| Forms | react-hook-form + zod |
| Datas | date-fns |
| Drag-drop | @dnd-kit/core |
| Hosting | Vercel (free) |

## Design tokens

Extraídos do guia visual institucional. Ver `src/app/globals.css`.

- Background: `#070907`
- Foreground: `#f8f6f2`
- Primary: `#f21828` (HSL `354 97% 58%`)
- Radius base: `0.75rem`
- Fonte: Inter 400/500/600/700/800

## Segurança & LGPD

- RLS no Supabase: apenas usuários autenticados na whitelist (2 e-mails) acessam
  qualquer tabela.
- Uploads de evidências em bucket privado, servidos via signed URLs.
- Dados pessoais de terceiros (leads) ficam confidenciais; nenhum acesso público.
- Exportação PDF é manual (Ctrl+P), nunca automática.
