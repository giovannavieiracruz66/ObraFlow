-- ==========================================
-- MIGRAÇÃO: Unidade de medida no sub-item
-- Rode no SQL Editor do Supabase — seguro rodar mais de uma vez.
-- ==========================================

alter table public.project_services
  add column if not exists unit text;
