-- ============================================================
-- LION BUSINESS — Setup completo (schema + RLS + storage)
-- Cole este arquivo inteiro no SQL Editor do Supabase e rode uma vez.
-- Depois disso, use o 04_seed.sql para criar a organização,
-- categorias e o primeiro administrador.
-- ============================================================

-- ============================================================
-- LION BUSINESS — Schema principal
-- Rode este arquivo no SQL Editor do Supabase (projeto novo)
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- organizations (multitenant) ----------
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- profiles (usuários administrativos) ----------
-- espelha auth.users; role controla acesso ao painel admin
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'admin' check (role in ('admin', 'owner')),
  created_at timestamptz not null default now()
);

-- ---------- categories ----------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, slug)
);

-- ---------- entrepreneurs (perfis publicados) ----------
create table if not exists entrepreneurs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  owner_name text not null,
  business_name text not null,
  slug text not null,
  category_id uuid references categories(id) on delete set null,
  description text,
  phone text,
  whatsapp text,
  email text,                 -- contato administrativo, NÃO exibido publicamente
  email_public boolean not null default false,
  instagram text,
  website text,
  city text,
  state text,
  neighborhood text,
  address text,
  service_type text not null default 'presencial'
    check (service_type in ('online', 'presencial', 'online_presencial')),
  service_area text not null default 'local'
    check (service_area in ('local', 'regional', 'nacional', 'internacional')),
  business_hours text,
  image_url text,
  status text not null default 'inactive' check (status in ('active', 'inactive')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

-- ---------- applications (solicitações "Quero participar") ----------
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  owner_name text not null,
  email text not null,
  phone text,
  whatsapp text not null,
  business_name text not null,
  category_id uuid references categories(id) on delete set null,
  description text not null,
  instagram text,
  website text,
  city text not null,
  state text not null,
  neighborhood text,
  address text,
  service_type text not null check (service_type in ('online', 'presencial', 'online_presencial')),
  service_area text not null check (service_area in ('local', 'regional', 'nacional', 'internacional')),
  image_url text,
  status text not null default 'pending'
    check (status in ('pending', 'in_review', 'approved', 'rejected')),
  admin_notes text,
  consent boolean not null default false,
  created_entrepreneur_id uuid references entrepreneurs(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- índices ----------
create index if not exists idx_entrepreneurs_org on entrepreneurs(organization_id);
create index if not exists idx_entrepreneurs_status on entrepreneurs(organization_id, status);
create index if not exists idx_entrepreneurs_category on entrepreneurs(category_id);
create index if not exists idx_applications_org_status on applications(organization_id, status);
create index if not exists idx_categories_org on categories(organization_id);

-- ---------- updated_at automático ----------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_entrepreneurs_updated on entrepreneurs;
create trigger trg_entrepreneurs_updated before update on entrepreneurs
  for each row execute function set_updated_at();

drop trigger if exists trg_applications_updated on applications;
create trigger trg_applications_updated before update on applications
  for each row execute function set_updated_at();
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
-- ============================================================
-- LION BUSINESS — Storage (imagens de empreendedores)
-- Rode depois do 02_rls.sql
-- Estrutura de pasta esperada:
--   organizations/{organization_id}/entrepreneurs/{entrepreneur_id}/foto.jpg
--   organizations/{organization_id}/applications/{application_id}/foto.jpg
-- ============================================================

insert into storage.buckets (id, name, public)
values ('lion-business', 'lion-business', true)
on conflict (id) do nothing;

-- leitura pública das imagens (o bucket é público)
create policy "public read lion-business images"
  on storage.objects for select
  using (bucket_id = 'lion-business');

-- qualquer visitante pode enviar uma imagem ao submeter o formulário,
-- mas apenas dentro da pasta "applications/"
create policy "anyone can upload application photo"
  on storage.objects for insert
  with check (
    bucket_id = 'lion-business'
    and (storage.foldername(name))[2] = 'applications'
  );

-- admin autenticado pode enviar/atualizar/remover imagens de empreendedores
-- da própria organização (primeira pasta = organization_id)
create policy "admin manage own org images"
  on storage.objects for all
  using (
    bucket_id = 'lion-business'
    and (storage.foldername(name))[1] = auth_org_id()::text
  )
  with check (
    bucket_id = 'lion-business'
    and (storage.foldername(name))[1] = auth_org_id()::text
  );
