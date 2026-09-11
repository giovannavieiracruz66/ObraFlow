-- ==========================================
-- MIGRAÇÃO: Sub-itens de serviço
-- Rode no SQL Editor do Supabase — seguro rodar mais de uma vez.
-- ==========================================

alter table public.project_services
  add column if not exists parent_id uuid references public.project_services(id) on delete cascade;
