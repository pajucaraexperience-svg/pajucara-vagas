-- 0004 · Isola o admin do sistema de Vagas do is_admin() compartilhado
--
-- Contexto do incidente:
-- O sistema de Vagas e o Pajuçara Experience (agência) compartilham o MESMO
-- banco Supabase. Em algum momento o sistema da agência redefiniu a função
-- public.is_admin() para checar a tabela `staff_profiles` (role = 'administrador').
-- Isso quebrou silenciosamente o RLS do painel de Vagas, que dependia da versão
-- original de is_admin() (baseada em `admin_users`). Resultado: a conta do RH,
-- presente em admin_users mas ausente de staff_profiles, passou a ver
-- "0 candidaturas" — os currículos existiam, só estavam bloqueados pela leitura.
--
-- Correção (Caminho A): criar uma função dedicada ao sistema de Vagas,
-- is_vagas_admin(), que checa `admin_users`, e reapontar SOMENTE as políticas
-- das tabelas de vagas para ela. As tabelas da agência (staff_profiles,
-- staff_permissions) continuam usando is_admin() sem alteração. Assim os dois
-- sistemas deixam de colidir.

create or replace function public.is_vagas_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where id = auth.uid()
  );
$$;

grant execute on function public.is_vagas_admin() to anon, authenticated;

-- roles
drop policy if exists "roles_admin_write" on public.roles;
create policy "roles_admin_write" on public.roles
  for all using (public.is_vagas_admin()) with check (public.is_vagas_admin());

-- jobs
drop policy if exists "jobs_read_active" on public.jobs;
create policy "jobs_read_active" on public.jobs
  for select using (status = 'active'::job_status or public.is_vagas_admin());

drop policy if exists "jobs_admin_write" on public.jobs;
create policy "jobs_admin_write" on public.jobs
  for all using (public.is_vagas_admin()) with check (public.is_vagas_admin());

-- questions
drop policy if exists "questions_admin_write" on public.questions;
create policy "questions_admin_write" on public.questions
  for all using (public.is_vagas_admin()) with check (public.is_vagas_admin());

-- applications
drop policy if exists "applications_admin_read" on public.applications;
create policy "applications_admin_read" on public.applications
  for select using (public.is_vagas_admin());

drop policy if exists "applications_admin_update" on public.applications;
create policy "applications_admin_update" on public.applications
  for update using (public.is_vagas_admin()) with check (public.is_vagas_admin());

drop policy if exists "applications_admin_delete" on public.applications;
create policy "applications_admin_delete" on public.applications
  for delete using (public.is_vagas_admin());

-- application_answers
drop policy if exists "answers_admin_read" on public.application_answers;
create policy "answers_admin_read" on public.application_answers
  for select using (public.is_vagas_admin());

-- application_notes
drop policy if exists "notes_admin_all" on public.application_notes;
create policy "notes_admin_all" on public.application_notes
  for all using (public.is_vagas_admin()) with check (public.is_vagas_admin());
