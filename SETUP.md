# Setup — Trinca CRM

Guia passo a passo pra botar o CRM no ar. Tempo estimado: **~15 minutos**.
Tudo usa plano gratuito.

## Pré-requisitos

- Uma conta GitHub (você já tem)
- Uma conta [Supabase](https://supabase.com) (grátis, 500MB DB, 1GB storage)
- Uma conta [Vercel](https://vercel.com) (grátis, ligada ao seu GitHub)

---

## 1. Criar o projeto no Supabase

1. Entre em https://supabase.com → **New project**.
2. Preencha:
   - **Name**: `trinca-crm`
   - **Database password**: gera uma senha forte e guarda no seu gerenciador.
   - **Region**: `South America (São Paulo)`
3. Espere ~2 minutos o provisionamento.

### 1.1. Rodar o schema

4. Menu esquerdo → **SQL Editor** → **New query**.
5. Abra o arquivo `supabase/schema.sql` deste repo, copie **tudo**, cole no editor.
6. **IMPORTANTE**: Antes de rodar, edite as linhas com os e-mails autorizados:
   ```sql
   insert into public.allowed_users (email, display_name) values
     ('voce@exemplo.com', 'Diego'),
     ('socio@trincadoigaming.com.br', 'Trinca')
   ```
   Troque pelos dois e-mails reais.
7. Clique em **Run**. Deve retornar "Success. No rows returned".

### 1.2. Copiar as credenciais

8. Menu → **Project Settings** → **API**.
9. Guarde os dois valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 1.3. Configurar autenticação

10. Menu → **Authentication** → **Providers** → **Email**.
    - Certifique-se de que **Email** está ativado.
    - **Confirm email**: pode deixar ligado (o magic link já serve como confirmação).
11. Menu → **Authentication** → **URL Configuration**.
    - **Site URL**: `https://seudominio.vercel.app` (troque depois do deploy)
    - **Redirect URLs** (adicione todas):
      - `http://localhost:3000/auth/callback`
      - `https://seudominio.vercel.app/auth/callback`
      - `https://crm.trincadoigaming.com.br/auth/callback` (se for usar domínio custom)

### 1.4. (Opcional) Customizar o template do e-mail

12. Menu → **Authentication** → **Email Templates** → **Magic Link**.
    - Deixe o idioma em português se quiser. O conteúdo vem em inglês por padrão.

---

## 2. Subir o repo no GitHub

Este repo já existe em `diegodperdigao/trinca` na branch
`claude/affiliate-dashboard-WNATS`. Você só precisa **abrir um Pull Request**
ou mergear direto para `main` quando validar.

Se quiser testar antes, rode localmente (ver seção 4).

---

## 3. Deploy na Vercel

1. Entre em https://vercel.com → **Add New** → **Project**.
2. Selecione o repo `trinca` do GitHub.
3. **Framework preset**: Next.js (detecta automático).
4. **Root directory**: deixe em branco (raiz).
5. **Environment Variables** — adicione:
   | Nome | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` |
   | `NEXT_PUBLIC_APP_URL` | `https://seudominio.vercel.app` (preenche depois do primeiro deploy) |
6. **Deploy**. Primeira build leva ~2min.
7. Volte em **Authentication → URL Configuration** do Supabase e substitua
   `seudominio.vercel.app` pela URL que a Vercel te deu.

---

## 4. Rodar local (opcional)

```bash
pnpm install          # ou npm install
cp .env.local.example .env.local
# preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
pnpm dev
```

Abra http://localhost:3000.

Pra testar o fluxo completo, entre com um dos e-mails da whitelist — o Supabase
vai mandar o magic link de verdade (via SMTP grátis do próprio Supabase).

---

## 5. Domínio custom `crm.trincadoigaming.com.br`

### 5.1. Adicionar na Vercel

1. Projeto → **Settings** → **Domains** → **Add**.
2. Digite `crm.trincadoigaming.com.br` → **Add**.
3. A Vercel vai mostrar um registro DNS do tipo `CNAME`:
   ```
   Name: crm
   Type: CNAME
   Value: cname.vercel-dns.com
   ```

### 5.2. Configurar o DNS do domínio

4. Entre no painel DNS de `trincadoigaming.com.br` (quem hospeda o domínio —
   Registro.br, Cloudflare, GoDaddy, etc).
5. Crie o registro CNAME exatamente como acima.
6. Espere 5–30 min pra propagar.
7. Volte na Vercel, o domínio deve ficar verde (SSL automático).
8. **Atualize de novo** o Site URL e Redirect URLs no Supabase pra incluir o
   domínio custom.
9. **Atualize** a env var `NEXT_PUBLIC_APP_URL` na Vercel pra
   `https://crm.trincadoigaming.com.br` e force um redeploy.

---

## 6. Primeiro acesso

1. Abra `https://crm.trincadoigaming.com.br` (ou o `.vercel.app`).
2. Digite seu e-mail (deve estar na whitelist `allowed_users`).
3. Abra o e-mail, clique no link, tá dentro.
4. Crie o primeiro lead em **Leads → Novo Lead**.

---

## 7. Adicionar / remover usuário autorizado

1. Supabase → **Table editor** → `allowed_users`.
2. **Insert row** para adicionar, ou deletar a linha pra revogar.
3. Mudanças são imediatas (RLS confere a cada request).

---

## 8. Backup dos dados

O Supabase faz backup automático diário (7 dias de retenção no free).
Pra exportar manualmente:

- **Table editor** → tabela `leads` → **Export CSV**.
- Repita pra cada tabela (`lead_notes`, `lead_meetings`, etc).

---

## 9. Troubleshooting

- **"Invalid login credentials" ou "User not allowed"**
  → o e-mail não está em `allowed_users`. Adicione pela SQL Editor.
- **Magic link redireciona pra tela errada**
  → confira o **Site URL** e **Redirect URLs** no Supabase Auth → URL Configuration.
- **Evidências não aparecem**
  → confira se o bucket `evidences` existe e se as policies foram criadas
    (estão no `supabase/schema.sql`).
- **Reunião não entra no Google Calendar**
  → o botão `.ics` baixa o arquivo; você precisa abrir o arquivo (ele
    automaticamente pergunta em qual calendário adicionar).
- **Build falha localmente por causa de fonte**
  → já usamos `@fontsource/inter` self-hosted, sem depender de Google Fonts.

---

## 10. O que NÃO está no MVP (próximos passos)

Prontos pra ir pra v1.1 depois de validar:

- [ ] Lembrete de reunião por e-mail (Resend + Supabase Cron)
- [ ] Sync Google Calendar via OAuth
- [ ] Export PDF server-side direto (hoje é Ctrl+P)
- [ ] Notificações push no navegador
- [ ] Link público read-only (compartilhável sem login)

Fala comigo quando quiser implementar qualquer um deles.
