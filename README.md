# Lion Business

Diretório de empreendedores da comunidade **Lion Betel Church** — plataforma web responsiva, com PWA, área pública de busca de empreendedores e painel administrativo para aprovação de cadastros.

**Slogan:** Conectando negócios, fortalecendo nossa comunidade.

## Tecnologias

- React 18 + TypeScript + Vite
- Tailwind CSS
- React Router
- Supabase (Auth, Database/Postgres, Storage, Row Level Security)
- vite-plugin-pwa (Progressive Web App)
- Deploy: GitHub Pages via GitHub Actions

Arquitetura preparada para **multitenant**: todas as tabelas principais têm `organization_id`, e o RLS garante isolamento entre organizações mesmo que hoje só exista uma (a igreja).

## Estrutura do projeto

```
src/
  components/   componentes visuais reutilizáveis
  pages/
    public/     páginas públicas (home, diretório, perfil, formulário)
    admin/      páginas do painel administrativo
  layouts/      layout público e layout admin (sidebar)
  contexts/     AuthContext (sessão + perfil do Supabase Auth)
  lib/          cliente Supabase e funções auxiliares
  types/        tipos TypeScript do banco de dados
supabase/
  01_schema.sql   tabelas
  02_rls.sql      políticas de Row Level Security
  03_storage.sql  bucket e políticas de storage
  04_seed.sql     organização, categorias e primeiro admin
  05_features.sql colunas de localização/visualizações (mapa e estatísticas)
```

## 1. Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Vá em **SQL Editor** e rode, nesta ordem, os arquivos da pasta `supabase/`:
   1. `01_schema.sql`
   2. `02_rls.sql`
   3. `03_storage.sql`
3. Em **Project Settings → API**, copie a `Project URL` e a `anon public key`.

## 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Preencha `.env` com a URL e a chave anônima do Supabase.

**Nunca** coloque a `service_role key` no frontend — ela não é usada neste projeto.

## 3. Criar o primeiro administrador

1. No Supabase, vá em **Authentication → Users → Add user** e crie um usuário com e-mail e senha.
2. Copie o `User UID` gerado.
3. Rode o `supabase/04_seed.sql`, substituindo:
   - `COLE_O_ORG_ID_AQUI` pelo `id` retornado ao inserir a organização (passo 1 do arquivo);
   - `COLE_O_USER_UID_AQUI` pelo UID do usuário criado.

Esse usuário poderá então logar em `/admin/login`.

Por fim, rode também o `supabase/05_features.sql` (colunas de latitude/longitude
e contador de visualizações, usados pelo mapa e pelas estatísticas).

## 4. Rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

## 5. Build

```bash
npm run build
```

## 6. Deploy no GitHub Pages

1. Suba o projeto para um repositório no GitHub.
2. Em **Settings → Pages**, defina a origem como **GitHub Actions**.
3. Em **Settings → Secrets and variables → Actions**, crie os secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Se o site for publicado em `https://usuario.github.io/lion-business/` (subpasta), edite `base: '/'` em `vite.config.ts` para `base: '/lion-business/'`.
5. Faça push para a branch `main` — o workflow `.github/workflows/deploy.yml` builda e publica automaticamente.

## 7. Trocar o logo

O logo atual está em `public/logo.png`. Para trocar:
1. Substitua `public/logo.png` pelo novo arquivo (mantenha o nome).
2. Regenere os ícones do PWA (`public/icons/icon-192.png`, `icon-512.png`, `icon-512-maskable.png`) no mesmo tamanho e formato.
3. O slogan pode ser editado diretamente em `src/pages/public/Home.tsx` e `src/components/PublicFooter.tsx`.

## Fluxo de solicitação → publicação

1. Visitante preenche o formulário em **/quero-participar**.
2. A solicitação entra em `applications` com status `pending`.
3. Administrador acessa **/admin/solicitacoes**, abre a solicitação e pode: marcar em análise, rejeitar, ou **aprovar** (o que cria automaticamente o registro em `entrepreneurs` com status `active` e vincula a solicitação aprovada).
4. Só empreendedores com status `active` aparecem na área pública.

## Segurança

- Autenticação via Supabase Auth (e-mail/senha), sem senhas armazenadas manualmente.
- RLS ativo em todas as tabelas: o frontend nunca decide sozinho o que é visível — as policies do Postgres garantem isso mesmo que alguém chame a API diretamente.
- Isolamento multitenant via `organization_id` + funções `auth_org_id()` / RLS.
- Imagens armazenadas em bucket público do Storage, mas upload restrito por pasta/organização via policy.

## Próximos passos sugeridos

- Adicionar paginação/infinite scroll na listagem de empreendedores quando o volume crescer.
- Editor de "Organização" no painel (nome, logo, slug) para o cenário multitenant completo.
- Página de estatísticas mais detalhada no dashboard.
