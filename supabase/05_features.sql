-- ============================================================
-- LION BUSINESS — Novas colunas e função para as melhorias:
-- mapa (latitude/longitude) e contador de visualizações.
-- Rode este arquivo no SQL Editor do Supabase (depois do setup inicial).
-- ============================================================

alter table entrepreneurs
  add column if not exists latitude numeric,
  add column if not exists longitude numeric,
  add column if not exists view_count integer not null default 0;

-- Função que incrementa a visualização de um perfil público.
-- security definer permite que qualquer visitante (mesmo anônimo)
-- chame essa função pontual, sem precisar de permissão de UPDATE
-- geral na tabela (que continua restrita ao admin via RLS).
create or replace function increment_entrepreneur_views(p_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update entrepreneurs
  set view_count = view_count + 1
  where id = p_id and status = 'active';
end;
$$;

-- Garante que qualquer usuário (incluindo anônimo) possa executar a função,
-- mesmo sem ter permissão de UPDATE direta na tabela.
grant execute on function increment_entrepreneur_views(uuid) to anon, authenticated;
