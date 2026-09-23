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
