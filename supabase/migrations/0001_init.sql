-- Vagas e Talentos | Grupo Pajuçara
-- Schema inicial: cargos, vagas, perguntas, candidaturas, respostas, observações, admins

create extension if not exists "pgcrypto";

-- ============== CARGOS (catálogo) ==============
create table public.roles (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  is_talent_pool boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ============== VAGAS ==============
create type job_status as enum ('draft','active','paused','closed');

create table public.jobs (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  role_id     uuid references public.roles(id) on delete restrict,
  title       text not null,
  sector      text,
  location    text,
  schedule    text,
  summary     text,
  activities      text[] not null default '{}',
  requirements    text[] not null default '{}',
  desirables      text[] not null default '{}',
  benefits        text[] not null default '{}',
  status      job_status not null default 'draft',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index jobs_status_idx on public.jobs(status);
create index jobs_role_idx on public.jobs(role_id);

-- ============== PERGUNTAS ==============
create type question_scope as enum ('general','role');
create type question_type  as enum ('single','multi','scale','short_text','long_text','boolean');

create table public.questions (
  id            uuid primary key default gen_random_uuid(),
  scope         question_scope not null,
  role_id       uuid references public.roles(id) on delete cascade,
  order_index   int not null default 0,
  type          question_type not null,
  label         text not null,
  help_text     text,
  options       jsonb,
  required      boolean not null default false,
  conditional_on jsonb,
  created_at    timestamptz not null default now(),
  constraint chk_role_required check (
    (scope = 'general' and role_id is null) or
    (scope = 'role' and role_id is not null)
  )
);

create index questions_role_idx on public.questions(role_id);
create index questions_scope_idx on public.questions(scope);

-- ============== CANDIDATURAS ==============
create type application_stage as enum (
  'received','screening','preselected',
  'interview_scheduled','interviewed',
  'approved','rejected','talent_pool'
);

create table public.applications (
  id              uuid primary key default gen_random_uuid(),
  job_id          uuid references public.jobs(id) on delete set null,
  is_talent_pool  boolean not null default false,

  -- pessoais
  full_name       text not null,
  birth_date      date,
  cpf             text not null,
  phone_whatsapp  text not null,
  email           text not null,
  city            text not null,
  state           text not null,
  address         text,
  linkedin_url    text,

  -- profissionais
  education            text,
  last_role            text,
  interest_area        text,
  experience_years     text,
  start_availability   text,
  schedule_availability text,
  salary_expectation   text,
  hotel_experience     boolean,
  hotel_experience_detail text,
  customer_service_experience boolean,
  languages            jsonb,
  computer_skills      jsonb,

  -- meta
  resume_url      text,
  attachments     jsonb,
  truthfulness_accepted boolean not null default false,
  lgpd_accepted   boolean not null default false,
  stage           application_stage not null default 'received',

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index applications_job_idx on public.applications(job_id);
create index applications_stage_idx on public.applications(stage);
create index applications_created_idx on public.applications(created_at desc);

-- ============== RESPOSTAS ==============
create table public.application_answers (
  id              uuid primary key default gen_random_uuid(),
  application_id  uuid not null references public.applications(id) on delete cascade,
  question_id     uuid references public.questions(id) on delete set null,
  question_label  text not null,
  question_scope  question_scope not null,
  value           jsonb not null,
  created_at      timestamptz not null default now()
);

create index answers_app_idx on public.application_answers(application_id);

-- ============== OBSERVAÇÕES INTERNAS ==============
create table public.application_notes (
  id              uuid primary key default gen_random_uuid(),
  application_id  uuid not null references public.applications(id) on delete cascade,
  author_id       uuid references auth.users(id) on delete set null,
  body            text not null,
  created_at      timestamptz not null default now()
);

create index notes_app_idx on public.application_notes(application_id);

-- ============== ADMINS ==============
create type admin_role as enum ('admin','hr','manager');

create table public.admin_users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  full_name   text,
  role        admin_role not null default 'hr',
  created_at  timestamptz not null default now()
);

-- ============== TRIGGER updated_at ==============
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger jobs_updated_at before update on public.jobs
  for each row execute function public.set_updated_at();

create trigger applications_updated_at before update on public.applications
  for each row execute function public.set_updated_at();

-- ============== HELPER: is_admin? ==============
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists (select 1 from public.admin_users where id = auth.uid());
$$;

-- ============== ROW-LEVEL SECURITY ==============
alter table public.roles enable row level security;
alter table public.jobs enable row level security;
alter table public.questions enable row level security;
alter table public.applications enable row level security;
alter table public.application_answers enable row level security;
alter table public.application_notes enable row level security;
alter table public.admin_users enable row level security;

-- Leitura pública: cargos
create policy "roles_read_all" on public.roles for select using (true);
create policy "roles_admin_write" on public.roles for all using (public.is_admin()) with check (public.is_admin());

-- Leitura pública: vagas ativas
create policy "jobs_read_active" on public.jobs for select using (status = 'active' or public.is_admin());
create policy "jobs_admin_write" on public.jobs for all using (public.is_admin()) with check (public.is_admin());

-- Leitura pública: perguntas (necessário para renderizar form)
create policy "questions_read_all" on public.questions for select using (true);
create policy "questions_admin_write" on public.questions for all using (public.is_admin()) with check (public.is_admin());

-- Candidaturas: insert anônimo permitido (aplicação pública)
-- leitura/edição apenas admin
create policy "applications_anon_insert" on public.applications for insert with check (true);
create policy "applications_admin_read" on public.applications for select using (public.is_admin());
create policy "applications_admin_update" on public.applications for update using (public.is_admin()) with check (public.is_admin());
create policy "applications_admin_delete" on public.applications for delete using (public.is_admin());

create policy "answers_anon_insert" on public.application_answers for insert with check (true);
create policy "answers_admin_read" on public.application_answers for select using (public.is_admin());

-- Observações: apenas admins
create policy "notes_admin_all" on public.application_notes for all using (public.is_admin()) with check (public.is_admin());

-- Admins: cada admin lê o próprio registro; escrita só super-admin via service role
create policy "admin_users_self_read" on public.admin_users for select using (auth.uid() = id);
