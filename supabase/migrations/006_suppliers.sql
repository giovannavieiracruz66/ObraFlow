-- ==========================================
-- MIGRAÇÃO: Cadastro de Fornecedores
-- Rode no SQL Editor do Supabase — seguro rodar mais de uma vez.
-- ==========================================

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  notes text,
  created_at timestamptz default now()
);

alter table public.suppliers enable row level security;

drop policy if exists "suppliers_write" on public.suppliers;
create policy "suppliers_write" on public.suppliers for all
  using (public.current_role() in ('admin','gestor','gestor_contratos'))
  with check (public.current_role() in ('admin','gestor','gestor_contratos'));

drop policy if exists "suppliers_read_only" on public.suppliers;
create policy "suppliers_read_only" on public.suppliers for select
  using (public.current_role() in ('diretoria','portaria'));

grant select, insert, update, delete on public.suppliers to authenticated;
