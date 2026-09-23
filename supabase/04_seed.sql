-- ============================================================
-- LION BUSINESS — Seed inicial
-- Ajuste os valores e rode por último
-- ============================================================

-- 1) Crie a organização (a igreja)
insert into organizations (name, slug, active)
values ('Lion Betel Church', 'lion-betel-church', true)
returning id;
-- copie o "id" retornado acima e use nos passos seguintes

-- 2) Categorias iniciais (troque 'COLE_O_ORG_ID_AQUI' pelo id copiado)
insert into categories (organization_id, name, slug) values
('COLE_O_ORG_ID_AQUI', 'Alimentação', 'alimentacao'),
('COLE_O_ORG_ID_AQUI', 'Beleza e Estética', 'beleza-e-estetica'),
('COLE_O_ORG_ID_AQUI', 'Fotografia', 'fotografia'),
('COLE_O_ORG_ID_AQUI', 'Audiovisual', 'audiovisual'),
('COLE_O_ORG_ID_AQUI', 'Tecnologia', 'tecnologia'),
('COLE_O_ORG_ID_AQUI', 'Construção', 'construcao'),
('COLE_O_ORG_ID_AQUI', 'Arquitetura', 'arquitetura'),
('COLE_O_ORG_ID_AQUI', 'Design', 'design'),
('COLE_O_ORG_ID_AQUI', 'Marketing', 'marketing'),
('COLE_O_ORG_ID_AQUI', 'Educação', 'educacao'),
('COLE_O_ORG_ID_AQUI', 'Saúde', 'saude'),
('COLE_O_ORG_ID_AQUI', 'Moda', 'moda'),
('COLE_O_ORG_ID_AQUI', 'Automotivo', 'automotivo'),
('COLE_O_ORG_ID_AQUI', 'Serviços', 'servicos'),
('COLE_O_ORG_ID_AQUI', 'Comércio', 'comercio'),
('COLE_O_ORG_ID_AQUI', 'Consultoria', 'consultoria'),
('COLE_O_ORG_ID_AQUI', 'Outros', 'outros');

-- 3) Primeiro administrador:
--    a) Crie o usuário em Authentication > Users > Add user (e-mail + senha)
--    b) Copie o "User UID" gerado e rode:
insert into profiles (id, organization_id, name, email, role)
values ('COLE_O_USER_UID_AQUI', 'COLE_O_ORG_ID_AQUI', 'Seu Nome', 'seu@email.com', 'owner');
