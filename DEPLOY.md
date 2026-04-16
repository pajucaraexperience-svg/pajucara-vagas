# Deploy — Vagas e Talentos · Grupo Pajuçara

Roteiro completo, do zero ao subdomínio `vagas.pajucaraexperience.com.br` em produção.

---

## 1. Criar repositório no GitHub

Já existe `pajucaraexperience-svg/pajucara-experience` (site institucional). Vamos criar um **repo separado** para o sistema de vagas.

```bash
cd "vagas-pajucara"
git init -b main
git add .
git commit -m "feat: bootstrap sistema Vagas e Talentos"
gh repo create pajucaraexperience-svg/pajucara-vagas \
  --private \
  --source=. \
  --remote=origin \
  --push
```

> Use `--private` para iniciar privado. Pode tornar público depois, se quiser.

---

## 2. Configurar Supabase

URL do projeto: `https://vcjymhdgikudejqqzxoq.supabase.co`

### 2.1 Pegar as duas chaves

Supabase → **Settings → API → Project API keys**:
- `anon public` → vai em `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → vai em `SUPABASE_SERVICE_ROLE_KEY` (NUNCA exponha; só servidor)

### 2.2 Rodar as migrations

Supabase → **SQL Editor** → New query → cole e rode na ordem:
1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_seed_jobs_questions.sql`
3. `supabase/migrations/0003_admin_bootstrap.sql` (depois do passo 2.4)

### 2.3 Criar bucket de currículos

Supabase → **Storage → New bucket**:
- Nome: `resumes`
- Public: **OFF** (privado — admin baixa via signed URL)

### 2.4 Criar primeiro admin

1. Supabase → **Authentication → Users → Add user**
   - E-mail: `rh@grupopajucara.com.br` (ou outro)
   - Senha: defina forte
   - "Auto Confirm User": ON
2. Volte ao SQL Editor e rode (substituindo o e-mail):
   ```sql
   insert into public.admin_users (id, email, role, full_name)
   select id, email, 'admin', 'Admin Pajuçara'
   from auth.users
   where email = 'rh@grupopajucara.com.br'
   on conflict (id) do nothing;
   ```

---

## 3. Configurar Vercel

### 3.1 Importar projeto
- Vercel → **Add New → Project**
- Selecione `pajucaraexperience-svg/pajucara-vagas`
- Framework: **Next.js** (auto-detectado)
- Root Directory: `./`
- Build & Output: padrões do Next

### 3.2 Variáveis de ambiente (Production + Preview)
| Nome | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://vcjymhdgikudejqqzxoq.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ... (anon)` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ... (service_role)` |

### 3.3 Deploy
Vercel faz o primeiro deploy automaticamente. Confirme que abre em
`https://pajucara-vagas.vercel.app`.

---

## 4. Conectar subdomínio

### 4.1 Adicionar domínio na Vercel
- Vercel → projeto `pajucara-vagas` → **Settings → Domains**
- Add: `vagas.pajucaraexperience.com.br`
- Vercel mostrará o registro DNS necessário (CNAME `cname.vercel-dns.com`).

### 4.2 Configurar DNS no provedor de `pajucaraexperience.com.br`
Adicione um registro CNAME:
| Tipo | Nome | Valor |
|---|---|---|
| CNAME | `vagas` | `cname.vercel-dns.com` |

Aguarde a propagação (geralmente 5–30 min). A Vercel emite o certificado SSL automaticamente.

---

## 5. Validação end-to-end (golden path)

1. Abra `https://vagas.pajucaraexperience.com.br`
2. Veja o hero, vagas-modelo (Recepcionista, Camareira, Cozinheiro, Reservas, Manutenção)
3. Abra **Recepcionista — Maceió** → **Candidatar-se**
4. Preencha as 7 etapas, anexe um PDF, envie
5. Acesse `/login`, entre com o admin → veja a candidatura na lista
6. Abra a ficha → mude etapa → adicione observação → baixe currículo → exporte CSV

---

## 6. Manutenção

### Trocar conteúdo institucional
Edite `lib/content/institutional.ts` ou `lib/content/messages.ts` e faça commit.

### Adicionar nova vaga
Faça via painel admin em `/admin/vagas/nova`.

### Adicionar pergunta específica nova para um cargo
`/admin/perguntas/nova` → escolha "Específica do cargo" → selecione o cargo.

### Backup das candidaturas
- Use **Exportar CSV** na lista de candidaturas, ou
- Backup do projeto Supabase via **Settings → Database → Backups**.

---

## Troubleshooting

**Login não entra como admin** → confirme que o user está em `auth.users` E em `admin_users`. Sem o registro em `admin_users`, o middleware mostra "Acesso negado".

**Upload de currículo falha** → verifique se o bucket `resumes` existe e se a `SUPABASE_SERVICE_ROLE_KEY` está configurada na Vercel (o upload roda server-side).

**Vagas não aparecem na home** → confira `status = 'active'` na tabela `jobs`. Rascunhos ficam ocultos.
