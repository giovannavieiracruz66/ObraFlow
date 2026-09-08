-- ==========================================
-- OBRAFLOW — SCHEMA + RLS + FUNÇÕES
-- Rode este arquivo inteiro no SQL Editor do Supabase (uma vez só).
-- ==========================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==========================================
-- PERFIS (perfil de acesso ligado ao login)
-- ==========================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Usuário',
  role text not null default 'gestor' check (role in ('admin','gestor','portaria')),
  avatar text,
  color text default '#0ea5e9',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Função auxiliar: retorna a role do usuário logado sem recursão de RLS
create or replace function public.current_role()
returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Cria automaticamente uma linha em profiles quando um usuário é criado no Auth.
-- Lê "name" e "role" dos metadados do usuário (definidos ao criar o usuário no Dashboard).
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'gestor')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==========================================
-- TABELAS PRINCIPAIS
-- ==========================================

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  cpf_cnpj text,
  phone text,
  whatsapp text,
  email text,
  city text,
  address text,
  notes text,
  created_at timestamptz default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_id uuid references public.clients(id) on delete set null,
  responsible text,
  address text,
  city text,
  category text,
  status text default 'orcamento',
  contract_value numeric default 0,
  received_value numeric default 0,
  cost_value numeric default 0,
  closed_at date,
  start_date date,
  end_date date,
  description text,
  payment_method text,
  notes text,
  physical_progress int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz
);

create table public.measurements (
  id uuid primary key default gen_random_uuid(),
  number int,
  project_id uuid references public.projects(id) on delete cascade,
  period text,
  date date,
  description text,
  percentage numeric,
  value numeric,
  approved_value numeric,
  sent_at date,
  approved_at date,
  payment_due date,
  paid_at date,
  status text default 'em_elaboracao',
  notes text,
  -- Estrutura de Medição (mão de obra / material / descontos / impostos)
  labor_value numeric default 0,
  material_value numeric default 0,
  direct_billing_discount numeric default 0,
  caution_value numeric default 0,
  inss_value numeric default 0,
  iss_value numeric default 0,
  created_at timestamptz default now()
);

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  number text,
  client_id uuid references public.clients(id) on delete set null,
  project_name text,
  valid_until date,
  services text,
  materials numeric,
  labor numeric,
  discount numeric,
  value numeric,
  final_value numeric,
  description text,
  notes text,
  status text default 'rascunho',
  sent_at date,
  responded_at date,
  created_at timestamptz default now()
);

create table public.financial (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  description text,
  value numeric,
  date date,
  due_date date,
  paid_at date,
  type text default 'receita',
  situation text default 'previsto',
  payment_method text,
  notes text,
  created_at timestamptz default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  item text not null,
  sku text,
  unit text default 'un',
  quantity numeric not null,
  delivered numeric not null default 0,
  unit_value numeric default 0,
  supplier text,
  expected_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz
);

create table public.order_receipts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  item text,
  quantity numeric not null,
  invoice_number text,
  photo_name text,
  notes text,
  received_by text,
  balance_after numeric,
  received_at date default current_date,
  created_at timestamptz default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text,
  project_id uuid references public.projects(id) on delete cascade,
  budget_id uuid references public.budgets(id) on delete cascade,
  read boolean default false,
  title text,
  message text,
  priority text default 'medium',
  created_at timestamptz default now()
);

-- ==========================================
-- ROW LEVEL SECURITY
-- Admin e Gestor: acesso completo a tudo.
-- Portaria: só enxerga Obras (nomes) e Almoxarifado (orders / order_receipts),
-- e só registra recebimentos através da função register_receipt (abaixo) —
-- nunca via UPDATE/INSERT direto nas tabelas.
-- ==========================================

alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.measurements enable row level security;
alter table public.budgets enable row level security;
alter table public.financial enable row level security;
alter table public.orders enable row level security;
alter table public.order_receipts enable row level security;
alter table public.notifications enable row level security;

create policy "clients_admin_gestor" on public.clients for all
  using (public.current_role() in ('admin','gestor'))
  with check (public.current_role() in ('admin','gestor'));

create policy "projects_admin_gestor" on public.projects for all
  using (public.current_role() in ('admin','gestor'))
  with check (public.current_role() in ('admin','gestor'));
create policy "projects_portaria_read" on public.projects for select
  using (public.current_role() = 'portaria');

create policy "measurements_admin_gestor" on public.measurements for all
  using (public.current_role() in ('admin','gestor'))
  with check (public.current_role() in ('admin','gestor'));

create policy "budgets_admin_gestor" on public.budgets for all
  using (public.current_role() in ('admin','gestor'))
  with check (public.current_role() in ('admin','gestor'));

create policy "financial_admin_gestor" on public.financial for all
  using (public.current_role() in ('admin','gestor'))
  with check (public.current_role() in ('admin','gestor'));

create policy "orders_admin_gestor" on public.orders for all
  using (public.current_role() in ('admin','gestor'))
  with check (public.current_role() in ('admin','gestor'));
create policy "orders_portaria_read" on public.orders for select
  using (public.current_role() = 'portaria');

create policy "receipts_admin_gestor" on public.order_receipts for all
  using (public.current_role() in ('admin','gestor'))
  with check (public.current_role() in ('admin','gestor'));
create policy "receipts_portaria_read" on public.order_receipts for select
  using (public.current_role() = 'portaria');

create policy "notifications_admin_gestor" on public.notifications for all
  using (public.current_role() in ('admin','gestor'))
  with check (public.current_role() in ('admin','gestor'));

-- Grants padrão do Supabase (RLS acima é quem realmente restringe as linhas)
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- ==========================================
-- FUNÇÃO: registrar recebimento de material
-- Roda com privilégios elevados (security definer) para que a Portaria
-- consiga dar entrada em materiais sem ter permissão de UPDATE/INSERT
-- direta nas tabelas — mantém o histórico imutável.
-- ==========================================
create or replace function public.register_receipt(
  p_order_id uuid,
  p_quantity numeric,
  p_invoice_number text default null,
  p_notes text default null,
  p_photo_name text default null
)
returns public.order_receipts
language plpgsql security definer set search_path = public as $$
declare
  v_order public.orders;
  v_applied numeric;
  v_new_delivered numeric;
  v_receipt public.order_receipts;
  v_user_name text;
begin
  if public.current_role() is null then
    raise exception 'Usuário sem perfil válido';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Pedido não encontrado';
  end if;

  v_applied := greatest(0, least(p_quantity, v_order.quantity - v_order.delivered));
  v_new_delivered := v_order.delivered + v_applied;

  update public.orders set delivered = v_new_delivered, updated_at = now() where id = p_order_id;

  select name into v_user_name from public.profiles where id = auth.uid();

  insert into public.order_receipts
    (order_id, project_id, item, quantity, invoice_number, photo_name, notes, received_by, balance_after, received_at)
  values
    (p_order_id, v_order.project_id, v_order.item, v_applied, p_invoice_number, p_photo_name, p_notes,
     coalesce(v_user_name, 'Usuário'), v_order.quantity - v_new_delivered, current_date)
  returning * into v_receipt;

  return v_receipt;
end;
$$;

grant execute on function public.register_receipt(uuid, numeric, text, text, text) to authenticated;
