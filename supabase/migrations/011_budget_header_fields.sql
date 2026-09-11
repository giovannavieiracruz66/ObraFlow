-- ==========================================
-- MIGRAÇÃO: Cabeçalho completo no Orçamento (Local, Responsável, E-mail,
-- Data Base, Forma de Pagamento, Disponibilidade Início, Prazo de Execução)
-- Rode no SQL Editor do Supabase — seguro rodar mais de uma vez.
-- ==========================================

alter table public.budgets
  add column if not exists address text,
  add column if not exists city text,
  add column if not exists responsible text,
  add column if not exists contact_email text,
  add column if not exists base_date date,
  add column if not exists payment_method text,
  add column if not exists start_availability date,
  add column if not exists execution_deadline text;
