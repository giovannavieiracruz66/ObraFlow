-- ==========================================
-- MIGRAÇÃO: Quantidade, Material e Mão de Obra por sub-item
-- Rode no SQL Editor do Supabase — seguro rodar mais de uma vez.
-- ==========================================

alter table public.project_services
  add column if not exists quantity numeric,
  add column if not exists material_value numeric,
  add column if not exists labor_value numeric;
