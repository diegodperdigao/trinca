-- =========================================================================
-- Migration 001: Adiciona campo "Parceria Atual"
--
-- Campo livre pra registrar em qual casa/operadora o lead está afiliado
-- no momento — ajuda a entender o contexto competitivo na hora da call.
--
-- COMO APLICAR:
-- 1. Abra o SQL Editor do Supabase
-- 2. Cole todo esse arquivo
-- 3. Clique em Run
-- =========================================================================

alter table public.leads
  add column if not exists current_partnership text;
