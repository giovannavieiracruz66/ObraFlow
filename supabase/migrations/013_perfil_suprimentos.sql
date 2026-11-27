-- ==========================================
-- MIGRAÇÃO 013: Perfil "Suprimentos"
-- Libera o perfil no banco e dá acesso só ao que ele usa:
-- Pagamentos, Fornecedores e Notificações.
-- Suprimentos NÃO lê orçamentos, medições nem financeiro (preço de venda
-- fica separado do preço de compra).
-- Rode no SQL Editor do Supabase. É seguro rodar mais de uma vez.
-- ==========================================

-- 1) Aceita "suprimentos" como valor de perfil
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
  check (role in ('admin','gestor','portaria','diretoria','gestor_contratos','gestor_orcamentos','financeiro','suprimentos'));

-- 2) Notificações: todos os perfis do escritório, agora com Suprimentos
drop policy if exists "notifications_all_roles" on public.notifications;
create policy "notifications_all_roles" on public.notifications for all
  using (public.current_role() in ('admin','gestor','diretoria','gestor_contratos','gestor_orcamentos','financeiro','suprimentos'))
  with check (public.current_role() in ('admin','gestor','diretoria','gestor_contratos','gestor_orcamentos','financeiro','suprimentos'));

-- 3) Fornecedores: Suprimentos cadastra e edita
drop policy if exists "suppliers_write" on public.suppliers;
create policy "suppliers_write" on public.suppliers for all
  using (public.current_role() in ('admin','gestor','gestor_contratos','suprimentos'))
  with check (public.current_role() in ('admin','gestor','gestor_contratos','suprimentos'));

-- 4) Pagamentos: garante a proteção da tabela e libera os perfis da tela
--    (Administrador, Gestor de Obras, Financeiro e Suprimentos).
--    As regras que já existirem nessa tabela continuam valendo.
alter table public.payments enable row level security;
drop policy if exists "payments_app_roles" on public.payments;
create policy "payments_app_roles" on public.payments for all
  using (public.current_role() in ('admin','gestor','financeiro','suprimentos'))
  with check (public.current_role() in ('admin','gestor','financeiro','suprimentos'));
grant select, insert, update, delete on public.payments to authenticated;
