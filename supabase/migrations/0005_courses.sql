-- Vagas e Talentos | Grupo Pajuçara
-- Cursos (recrutamento via curso gratuito): tabela courses + vínculo em applications.
--
-- Estratégia: o curso gratuito funciona como funil de recrutamento. As inscrições
-- continuam caindo em `applications` (+ `application_answers`), então aparecem no
-- mesmo painel de Candidaturas que o RH já usa — apenas rotuladas pelo curso via
-- `applications.course_id`. Rota pública dinâmica por slug reaproveita para cursos futuros.

-- ============== CURSOS ==============
create type course_status as enum ('draft','active','closed');

create table public.courses (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  summary     text,
  description text,
  highlights  text[] not null default '{}',
  location    text,
  schedule    text,
  capacity    int,
  status      course_status not null default 'draft',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index courses_status_idx on public.courses(status);

create trigger courses_updated_at before update on public.courses
  for each row execute function public.set_updated_at();

-- ============== VÍNCULO NAS CANDIDATURAS ==============
alter table public.applications
  add column course_id uuid references public.courses(id) on delete set null;

create index applications_course_idx on public.applications(course_id);

-- ============== ROW-LEVEL SECURITY ==============
alter table public.courses enable row level security;

-- Leitura pública: cursos ativos (necessário para renderizar a landing e o form)
create policy "courses_read_active" on public.courses
  for select using (status = 'active' or public.is_vagas_admin());

-- Escrita: apenas admin de vagas (admin_users) — ver migration 0004
create policy "courses_admin_write" on public.courses
  for all using (public.is_vagas_admin()) with check (public.is_vagas_admin());

-- Obs.: o insert anônimo de applications com course_id já é coberto pela policy
-- existente `applications_anon_insert` (with check (true)).

-- ============== SEED: Curso de Camareira(o) ==============
insert into public.courses (slug, title, summary, description, highlights, location, schedule, capacity, status)
values (
  'camareira',
  'Curso Gratuito de Camareira(o)',
  'Curso gratuito de qualificação em Camareira(o) para quem quer ingressar ou crescer na área de governança hoteleira. As melhores inscrições podem ser convidadas a integrar nosso time.',
  'O Grupo Pajuçara oferece um curso gratuito de Camareira(o) como parte da sua estratégia de formação e recrutamento de talentos. Ao se inscrever, você entra no nosso radar para futuras oportunidades de trabalho no hotel. Vagas limitadas — inscreva-se e conte um pouco sobre você.',
  array[
    'Gratuito',
    '15 vagas',
    'Certificado de participação',
    'Foco em governança e hotelaria'
  ],
  'Maceió/AL',
  'A definir — divulgaremos as datas aos inscritos',
  15,
  'active'
);
