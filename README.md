# Vagas e Talentos — Grupo Pajuçara

Sistema de recrutamento online para o Grupo Pajuçara: recebimento de currículos, formulário multi-etapas com perguntas gerais e específicas por cargo, banco de talentos e área administrativa para triagem.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + componentes shadcn-style
- Supabase (Postgres + Auth + Storage)
- React Hook Form + Zod
- CSV export via PapaParse

## Setup

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# preencher NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# 3. Aplicar migrations no Supabase
# SQL Editor → rodar supabase/migrations/0001_init.sql
# SQL Editor → rodar supabase/migrations/0002_seed_jobs_questions.sql

# 4. Criar bucket de currículos no Supabase Storage
# Bucket: "resumes", privado

# 5. Criar primeiro admin
# Auth → Users → Add user (e-mail/senha) → depois inserir em admin_users com role='admin'

# 6. Rodar
npm run dev
```

## Estrutura

- `app/(public)` — área pública (home, vagas, candidatura, banco de talentos)
- `app/(admin)` — área administrativa (login, dashboard, CRUD, candidaturas)
- `app/api` — endpoints (envio de candidatura, upload, export CSV)
- `lib/content` — todo conteúdo editorial: textos institucionais, perguntas gerais, perguntas dos 17 cargos, descrições-modelo
- `lib/schemas` — schemas Zod
- `supabase/migrations` — DDL + RLS + seed

## Cargos com perguntas pré-cadastradas

Recepcionista, Cozinheira/Cozinheiro, Auxiliar de cozinha, Camareira, Serviços gerais, Assistente administrativo, Garçom/Garçonete, Auxiliar de limpeza, Manutenção, Supervisor de recepção, Supervisor de governança, Mensageiro, Agente de reservas, Atendente, Estoquista, Auxiliar de lavanderia, Gerente operacional, Banco de talentos.
