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
