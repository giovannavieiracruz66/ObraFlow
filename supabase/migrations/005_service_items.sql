-- ==========================================
-- MIGRAÇÃO: Itens de serviço no orçamento + progresso por serviço na medição
-- Rode no SQL Editor do Supabase — seguro rodar mais de uma vez.
-- ==========================================

-- 1) Orçamento passa a guardar os serviços como itens (nome + valor),
--    além do texto livre que já existia.
alter table public.budgets
  add column if not exists service_items jsonb default '[]'::jsonb;

-- 2) Serviços da obra (copiados do orçamento quando aprovado, ou
--    cadastrados direto na obra).
create table if not exists public.project_services (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  name text not null,
  budgeted_value numeric default 0,
  created_at timestamptz default now()
);

alter table public.project_services enable row level security;

drop policy if exists "project_services_write" on public.project_services;
create policy "project_services_write" on public.project_services for all
  using (public.current_role() in ('admin','gestor','gestor_contratos','gestor_orcamentos'))
  with check (public.current_role() in ('admin','gestor','gestor_contratos','gestor_orcamentos'));

drop policy if exists "project_services_read_only" on public.project_services;
create policy "project_services_read_only" on public.project_services for select
  using (public.current_role() in ('diretoria'));

-- 3) Alocação de % executado por serviço, em cada medição.
create table if not exists public.measurement_services (
  id uuid primary key default gen_random_uuid(),
  measurement_id uuid references public.measurements(id) on delete cascade,
  project_service_id uuid references public.project_services(id) on delete cascade,
  percentage numeric default 0,
  value numeric default 0,
  created_at timestamptz default now()
);

alter table public.measurement_services enable row level security;

drop policy if exists "measurement_services_write" on public.measurement_services;
create policy "measurement_services_write" on public.measurement_services for all
  using (public.current_role() in ('admin','gestor','gestor_contratos','financeiro'))
  with check (public.current_role() in ('admin','gestor','gestor_contratos','financeiro'));

drop policy if exists "measurement_services_read_only" on public.measurement_services;
create policy "measurement_services_read_only" on public.measurement_services for select
  using (public.current_role() in ('diretoria'));

-- 4) Grants padrão (RLS acima restringe as linhas de verdade)
grant select, insert, update, delete on public.project_services to authenticated;
grant select, insert, update, delete on public.measurement_services to authenticated;
