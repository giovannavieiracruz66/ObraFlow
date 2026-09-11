-- ==========================================
-- MIGRAÇÃO: Dados de proposta/contrato no cabeçalho da obra
-- Rode no SQL Editor do Supabase — seguro rodar mais de uma vez.
-- ==========================================

alter table public.projects
  add column if not exists proposal_number text,
  add column if not exists contact_email text,
  add column if not exists base_date date,
  add column if not exists proposal_valid_until date,
  add column if not exists execution_deadline text;
