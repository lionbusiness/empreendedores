-- ============================================================
-- LION BUSINESS — Row Level Security
-- Rode depois do 01_schema.sql
-- ============================================================

alter table organizations enable row level security;
alter table profiles enable row level security;
alter table categories enable row level security;
alter table entrepreneurs enable row level security;
alter table applications enable row level security;

-- Função auxiliar: organization_id do usuário logado
create or replace function auth_org_id()
returns uuid
language sql
security definer
stable
as $$
  select organization_id from profiles where id = auth.uid();
$$;

-- Função auxiliar: o usuário logado é admin/owner?
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from profiles where id = auth.uid());
$$;

-- ---------------- organizations ----------------
-- público pode ler apenas dados básicos de orgs ativas (para exibir nome/logo)
create policy "public read active organizations"
  on organizations for select
  using (active = true);

create policy "admin update own organization"
  on organizations for update
  using (id = auth_org_id())
  with check (id = auth_org_id());

-- ---------------- profiles ----------------
create policy "admin read own profile"
  on profiles for select
  using (id = auth.uid());

create policy "admin read same org profiles"
  on profiles for select
  using (organization_id = auth_org_id());

-- ---------------- categories ----------------
create policy "public read active categories"
  on categories for select
  using (active = true);

create policy "admin manage own org categories"
  on categories for all
  using (organization_id = auth_org_id())
  with check (organization_id = auth_org_id());

-- ---------------- entrepreneurs ----------------
-- público só vê empreendedores ATIVOS
create policy "public read active entrepreneurs"
  on entrepreneurs for select
  using (status = 'active');

-- admin vê e gerencia todos os empreendedores da própria organização
create policy "admin read own org entrepreneurs"
  on entrepreneurs for select
  using (organization_id = auth_org_id());

create policy "admin insert own org entrepreneurs"
  on entrepreneurs for insert
  with check (organization_id = auth_org_id());

create policy "admin update own org entrepreneurs"
  on entrepreneurs for update
  using (organization_id = auth_org_id())
  with check (organization_id = auth_org_id());

create policy "admin delete own org entrepreneurs"
  on entrepreneurs for delete
  using (organization_id = auth_org_id());

-- ---------------- applications ----------------
-- qualquer visitante (mesmo anônimo) pode CRIAR uma solicitação
create policy "anyone can submit application"
  on applications for insert
  with check (true);

-- só admin da própria organização pode ler/gerenciar solicitações
create policy "admin read own org applications"
  on applications for select
  using (organization_id = auth_org_id());

create policy "admin update own org applications"
  on applications for update
  using (organization_id = auth_org_id())
  with check (organization_id = auth_org_id());

create policy "admin delete own org applications"
  on applications for delete
  using (organization_id = auth_org_id());
