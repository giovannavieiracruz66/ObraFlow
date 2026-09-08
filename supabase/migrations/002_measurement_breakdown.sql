-- ==========================================
-- MIGRAÇÃO: Estrutura detalhada de Medição
-- Rode no SQL Editor do Supabase (uma vez só) — é seguro rodar mesmo
-- que essas colunas já existam (usa "if not exists").
-- ==========================================

alter table public.measurements
  add column if not exists labor_value numeric default 0,
  add column if not exists material_value numeric default 0,
  add column if not exists direct_billing_discount numeric default 0,
  add column if not exists caution_value numeric default 0,
  add column if not exists inss_value numeric default 0,
  add column if not exists iss_value numeric default 0;
