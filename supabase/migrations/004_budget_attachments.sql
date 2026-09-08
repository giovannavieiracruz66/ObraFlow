-- ==========================================
-- MIGRAÇÃO: Anexos reais de orçamento (PDF)
-- Rode no SQL Editor do Supabase — seguro rodar mais de uma vez.
-- ==========================================

-- 1) Coluna pra guardar a lista de anexos (nome, caminho no Storage, data)
alter table public.budgets
  add column if not exists attachments jsonb default '[]'::jsonb;

-- 2) Bucket de armazenamento pros PDFs (privado — só via URL assinada)
insert into storage.buckets (id, name, public)
values ('budget-attachments', 'budget-attachments', false)
on conflict (id) do nothing;

-- 3) Quem pode subir e quem pode ver os arquivos desse bucket
drop policy if exists "budget_attachments_write" on storage.objects;
create policy "budget_attachments_write" on storage.objects for insert
  with check (bucket_id = 'budget-attachments' and public.current_role() in ('admin','gestor','gestor_orcamentos'));

drop policy if exists "budget_attachments_read" on storage.objects;
create policy "budget_attachments_read" on storage.objects for select
  using (bucket_id = 'budget-attachments' and public.current_role() in ('admin','gestor','gestor_orcamentos','diretoria','financeiro'));

drop policy if exists "budget_attachments_delete" on storage.objects;
create policy "budget_attachments_delete" on storage.objects for delete
  using (bucket_id = 'budget-attachments' and public.current_role() in ('admin','gestor','gestor_orcamentos'));
