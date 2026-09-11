-- ==========================================
-- MIGRAÇÃO: Empresa emissora (multi-empresa) no orçamento e na obra
-- Rode no SQL Editor do Supabase — seguro rodar mais de uma vez.
-- ==========================================

alter table public.budgets
  add column if not exists company_id text;

alter table public.projects
  add column if not exists company_id text;
