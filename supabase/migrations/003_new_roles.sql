-- ==========================================
-- MIGRAÇÃO: Novos perfis de acesso
-- (Diretoria, Gestor de Contratos, Gestor de Orçamentos, Financeiro)
-- Rode no SQL Editor do Supabase — é seguro rodar mais de uma vez.
-- ==========================================

-- 1) Libera os novos valores de perfil na tabela profiles
do $$
declare
  con text;
begin
  select conname into con
  from pg_constraint
  where conrelid = 'public.profiles'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%role%';
  if con is not null then
    execute format('alter table public.profiles drop constraint %I', con);
  end if;
end $$;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin','gestor','portaria','diretoria','gestor_contratos','gestor_orcamentos','financeiro'));

-- 2) Substitui as políticas de acesso por tabela pelo novo conjunto,
--    já com os 4 perfis novos considerados.

drop policy if exists "clients_admin_gestor" on public.clients;
create policy "clients_write" on public.clients for all
  using (public.current_role() in ('admin','gestor','gestor_contratos','gestor_orcamentos'))
  with check (public.current_role() in ('admin','gestor','gestor_contratos','gestor_orcamentos'));
drop policy if exists "clients_read_only" on public.clients;
create policy "clients_read_only" on public.clients for select
  using (public.current_role() in ('diretoria'));

drop policy if exists "projects_admin_gestor" on public.projects;
drop policy if exists "projects_portaria_read" on public.projects;
create policy "projects_write" on public.projects for all
  using (public.current_role() in ('admin','gestor','gestor_contratos','gestor_orcamentos'))
  with check (public.current_role() in ('admin','gestor','gestor_contratos','gestor_orcamentos'));
drop policy if exists "projects_read_only" on public.projects;
create policy "projects_read_only" on public.projects for select
  using (public.current_role() in ('portaria','diretoria','financeiro'));

drop policy if exists "measurements_admin_gestor" on public.measurements;
create policy "measurements_write" on public.measurements for all
  using (public.current_role() in ('admin','gestor','gestor_contratos','financeiro'))
  with check (public.current_role() in ('admin','gestor','gestor_contratos','financeiro'));
drop policy if exists "measurements_read_only" on public.measurements;
create policy "measurements_read_only" on public.measurements for select
  using (public.current_role() in ('diretoria'));

drop policy if exists "budgets_admin_gestor" on public.budgets;
create policy "budgets_write" on public.budgets for all
  using (public.current_role() in ('admin','gestor','gestor_orcamentos'))
  with check (public.current_role() in ('admin','gestor','gestor_orcamentos'));
drop policy if exists "budgets_read_only" on public.budgets;
create policy "budgets_read_only" on public.budgets for select
  using (public.current_role() in ('diretoria','financeiro'));

drop policy if exists "financial_admin_gestor" on public.financial;
create policy "financial_write" on public.financial for all
  using (public.current_role() in ('admin','gestor','financeiro'))
  with check (public.current_role() in ('admin','gestor','financeiro'));
drop policy if exists "financial_read_only" on public.financial;
create policy "financial_read_only" on public.financial for select
  using (public.current_role() in ('diretoria'));

drop policy if exists "orders_admin_gestor" on public.orders;
drop policy if exists "orders_portaria_read" on public.orders;
create policy "orders_write" on public.orders for all
  using (public.current_role() in ('admin','gestor','gestor_contratos'))
  with check (public.current_role() in ('admin','gestor','gestor_contratos'));
drop policy if exists "orders_read_only" on public.orders;
create policy "orders_read_only" on public.orders for select
  using (public.current_role() in ('portaria','diretoria'));

drop policy if exists "receipts_admin_gestor" on public.order_receipts;
drop policy if exists "receipts_portaria_read" on public.order_receipts;
create policy "receipts_write" on public.order_receipts for all
  using (public.current_role() in ('admin','gestor','gestor_contratos'))
  with check (public.current_role() in ('admin','gestor','gestor_contratos'));
drop policy if exists "receipts_read_only" on public.order_receipts;
create policy "receipts_read_only" on public.order_receipts for select
  using (public.current_role() in ('portaria','diretoria'));

drop policy if exists "notifications_admin_gestor" on public.notifications;
drop policy if exists "notifications_all_roles" on public.notifications;
create policy "notifications_all_roles" on public.notifications for all
  using (public.current_role() in ('admin','gestor','diretoria','gestor_contratos','gestor_orcamentos','financeiro'))
  with check (public.current_role() in ('admin','gestor','diretoria','gestor_contratos','gestor_orcamentos','financeiro'));

-- 3) Trava o registro de recebimentos pra Diretoria (perfil view-only)
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
  if public.current_role() not in ('admin','gestor','gestor_contratos','portaria') then
    raise exception 'Perfil sem permissão para registrar recebimentos';
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
