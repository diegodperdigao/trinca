# Trinca CRM

CRM interno de prospecção de afiliados para a **Trinca do iGaming**.
Uso privado e confidencial.

> **Stack**: Next.js 15 · TypeScript · Tailwind · shadcn-style UI · Supabase (Postgres + Auth + Storage + RLS) · Recharts · dnd-kit

## Features (MVP)

- **Dashboard executivo** com KPIs, funil de conversão, reuniões da semana, ações pendentes, stand by, descartados
- **Pipeline** com kanban drag-and-drop e tabela (toggle)
- **Lead detail** com abas: dados, notas (timeline), evidências (upload imagem/vídeo), reuniões (com download `.ics`), histórico de estágio
- **Descarte** categorizado + comentário livre + recuperação
- **Stand by** (pausa sem perder o lead)
- **Relatório executivo** formatado A4 → Ctrl+P → PDF
- **Magic link** auth com whitelist por e-mail
- **Mobile-first** responsive (bottom nav mobile, sidebar desktop)

## Design

Segue 1:1 o guia visual da Trinca do iGaming:
- Background `#070907` · Primary `#f21828` · Inter 400-800
- Border radius `0.75rem` · Dark mode nativo
- Gradiente CTA `#fc4053 → #fc2c41 → #b81425`
- Partículas flutuantes no login

## Docs

- [`SCOPE.md`](./SCOPE.md) — escopo de produto, modelo de dados, estágios, out-of-scope
- [`SETUP.md`](./SETUP.md) — setup do Supabase, deploy na Vercel, domínio custom
- [`supabase/schema.sql`](./supabase/schema.sql) — schema do banco + RLS + storage

## Quickstart local

```bash
pnpm install
cp .env.local.example .env.local
# preencha as 2 vars do Supabase
pnpm dev
```

## Deploy

Veja [`SETUP.md`](./SETUP.md). Resumo: cria projeto Supabase → roda `schema.sql` → deploy 1-clique na Vercel → aponta `crm.trincadoigaming.com.br` via CNAME.

## Scripts

- `pnpm dev` — servidor de desenvolvimento
- `pnpm build` — build de produção
- `pnpm typecheck` — verificação de tipos
- `pnpm lint` — lint

---

Uso interno. Não distribuir.
