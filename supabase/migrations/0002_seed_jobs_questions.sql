-- Seed: cargos, perguntas gerais, perguntas por cargo, vagas-modelo
-- ================================================================

-- ============== CARGOS ==============
insert into public.roles (slug, name, description, is_talent_pool) values
  ('recepcionista','Recepcionista','Atendimento ao hóspede, check-in/out, suporte ao balcão.', false),
  ('cozinheiro','Cozinheira / Cozinheiro','Preparo de refeições com padrão de qualidade e segurança alimentar.', false),
  ('auxiliar-cozinha','Auxiliar de cozinha','Apoio à cozinha: pré-preparo, organização e higienização.', false),
  ('camareira','Camareira','Arrumação e higienização de quartos com excelência.', false),
  ('servicos-gerais','Serviços gerais','Limpeza e conservação das áreas do hotel.', false),
  ('assistente-administrativo','Assistente administrativo','Rotinas administrativas, documentos e atendimento interno.', false),
  ('garcom','Garçom / Garçonete','Atendimento no salão, café da manhã e eventos.', false),
  ('auxiliar-limpeza','Auxiliar de limpeza','Limpeza de áreas comuns e suporte à governança.', false),
  ('manutencao','Manutenção','Reparos elétricos, hidráulicos e manutenção predial.', false),
  ('supervisor-recepcao','Supervisor de recepção','Liderança da equipe de recepção, qualidade do atendimento.', false),
  ('supervisor-governanca','Supervisor de governança','Liderança da equipe de andares, padrão de limpeza.', false),
  ('mensageiro','Mensageiro','Recepção do hóspede, bagagens e suporte ao lobby.', false),
  ('agente-reservas','Agente de reservas','Atendimento comercial, conversão e gestão de reservas.', false),
  ('atendente','Atendente','Atendimento ao público em diferentes pontos do hotel.', false),
  ('estoquista','Estoquista','Controle de estoque, recebimento e organização.', false),
  ('auxiliar-lavanderia','Auxiliar de lavanderia','Operação de lavanderia, enxoval e padrões de higiene.', false),
  ('gerente-operacional','Gerente operacional','Gestão da operação do hotel, equipes e resultados.', false),
  ('banco-talentos','Banco de talentos','Cadastro espontâneo para futuras vagas.', true);

-- ============== PERGUNTAS GERAIS ==============
insert into public.questions (scope, role_id, order_index, type, label, options, required) values
  ('general', null, 10, 'single', 'Você tem disponibilidade para trabalhar em escala (12x36, 6x1 ou outras)?',
   '["Sim, sem restrições","Sim, com restrições","Não"]'::jsonb, true),
  ('general', null, 20, 'single', 'Você tem disponibilidade para fins de semana e feriados?',
   '["Sim","Apenas eventualmente","Não"]'::jsonb, true),
  ('general', null, 30, 'single', 'Você tem experiência com atendimento ao público?',
   '["Sim, mais de 2 anos","Sim, até 2 anos","Pouca experiência","Nunca atuei"]'::jsonb, true),
  ('general', null, 40, 'single', 'Você já trabalhou em hotelaria ou hospitalidade?',
   '["Sim","Não"]'::jsonb, true),
  ('general', null, 50, 'scale', 'Como você avalia seu nível de conforto trabalhando em equipe?',
   '["1","2","3","4","5"]'::jsonb, true),
  ('general', null, 60, 'scale', 'Como você avalia sua pontualidade e assiduidade?',
   '["1","2","3","4","5"]'::jsonb, true),
  ('general', null, 70, 'single', 'Você tem disponibilidade para entrevista presencial ou online nos próximos dias?',
   '["Sim, presencial e online","Apenas presencial","Apenas online","Preciso combinar"]'::jsonb, true),
  ('general', null, 80, 'single', 'Como você ficou sabendo desta vaga?',
   '["Site do Grupo Pajuçara","Indicação","Redes sociais","Site de empregos","Outro"]'::jsonb, true),

  ('general', null, 100, 'long_text', 'Conte brevemente sobre sua trajetória profissional.', null, true),
  ('general', null, 110, 'long_text', 'O que chamou sua atenção nesta vaga?', null, true),
  ('general', null, 120, 'long_text', 'Por que você deseja trabalhar conosco?', null, true),
  ('general', null, 130, 'long_text', 'Quais são seus principais pontos fortes no ambiente de trabalho?', null, true),
  ('general', null, 140, 'long_text', 'Conte uma situação em que precisou lidar com pressão, conflito ou imprevisto. O que você fez?', null, false),
  ('general', null, 150, 'long_text', 'O que significa, para você, oferecer um bom atendimento?', null, true),
  ('general', null, 160, 'long_text', 'Em que tipo de ambiente de trabalho você rende melhor?', null, false);

-- ============== PERGUNTAS POR CARGO ==============
-- helper: pegar id do cargo pelo slug

-- RECEPCIONISTA
with r as (select id from public.roles where slug='recepcionista')
insert into public.questions (scope, role_id, order_index, type, label, options, required, conditional_on)
select 'role', r.id, ord, t, l, o, req, c from r,
(values
  (10,'single'::question_type,'Você tem experiência prévia em recepção (hotel, clínica, empresa)?',
    '["Sim, em hotel","Sim, em outro segmento","Não tenho"]'::jsonb,true,null::jsonb),
  (15,'short_text','Se já atuou em recepção, em qual local e por quanto tempo?',null,false,
    '{"question_label":"Você tem experiência prévia em recepção (hotel, clínica, empresa)?","not_equals":"Não tenho"}'::jsonb),
  (20,'multi','Em quais canais de atendimento você tem experiência?',
    '["Presencial","Telefone","WhatsApp","E-mail","Sistema de hotel (PMS)"]'::jsonb,true,null),
  (30,'single','Já realizou check-in e check-out de hóspedes?',
    '["Sim, com frequência","Sim, eventualmente","Nunca"]'::jsonb,true,null),
  (40,'short_text','Quais sistemas de hotel você já utilizou? (ex.: Desbravador, CMNet, Omnibees)',null,false,null),
  (50,'scale','Como você avalia sua organização para lidar com várias demandas ao mesmo tempo?',
    '["1","2","3","4","5"]'::jsonb,true,null),
  (60,'long_text','Conte uma situação em que precisou manter cordialidade diante de um hóspede insatisfeito.',null,true,null)
) as v(ord,t,l,o,req,c);

-- COZINHEIRO
with r as (select id from public.roles where slug='cozinheiro')
insert into public.questions (scope, role_id, order_index, type, label, options, required, conditional_on)
select 'role', r.id, ord, t, l, o, req, c from r,
(values
  (10,'single'::question_type,'Quanto tempo de experiência em cozinha profissional você possui?',
    '["Menos de 1 ano","1 a 3 anos","3 a 5 anos","Mais de 5 anos"]'::jsonb,true,null::jsonb),
  (20,'multi','Em quais tipos de cozinha você já atuou?',
    '["Hotel","Restaurante","Buffet/Eventos","Coletividade","Padaria","Outro"]'::jsonb,true,null),
  (30,'single','Você tem curso ou capacitação na área (gastronomia, manipulação de alimentos)?',
    '["Sim, formação técnica/superior","Sim, cursos livres","Não tenho"]'::jsonb,true,null),
  (35,'short_text','Quais cursos ou formações?',null,false,
    '{"question_label":"Você tem curso ou capacitação na área (gastronomia, manipulação de alimentos)?","not_equals":"Não tenho"}'::jsonb),
  (40,'single','Você possui ou já teve curso de Boas Práticas / Manipulação de Alimentos?',
    '["Sim, atualizado","Sim, vencido","Não tenho"]'::jsonb,true,null),
  (50,'scale','Como você avalia sua capacidade de trabalhar sob pressão em horários de pico?',
    '["1","2","3","4","5"]'::jsonb,true,null),
  (60,'long_text','Descreva uma situação em que precisou resolver um problema urgente na cozinha.',null,true,null),
  (70,'long_text','O que, para você, define um prato bem entregue ao cliente?',null,true,null)
) as v(ord,t,l,o,req,c);

-- AUXILIAR DE COZINHA
with r as (select id from public.roles where slug='auxiliar-cozinha')
insert into public.questions (scope, role_id, order_index, type, label, options, required, conditional_on)
select 'role', r.id, ord, t, l, o, req, c from r,
(values
  (10,'single'::question_type,'Você já atuou como auxiliar de cozinha?',
    '["Sim, em hotel/restaurante","Sim, em outro segmento","Não, mas tenho interesse"]'::jsonb,true,null::jsonb),
  (20,'multi','Em quais atividades você tem experiência?',
    '["Pré-preparo de alimentos","Lavagem de louça","Higienização da cozinha","Apoio ao cozinheiro","Recebimento de mercadorias"]'::jsonb,true,null),
  (30,'single','Você conhece boas práticas de manipulação de alimentos?',
    '["Sim, fiz curso","Tenho noções básicas","Nunca tive contato"]'::jsonb,true,null),
  (40,'scale','Como você avalia sua disposição para tarefas físicas e rotina intensa?',
    '["1","2","3","4","5"]'::jsonb,true,null),
  (50,'long_text','Por que você quer trabalhar em uma cozinha?',null,true,null)
) as v(ord,t,l,o,req,c);

-- CAMAREIRA
with r as (select id from public.roles where slug='camareira')
insert into public.questions (scope, role_id, order_index, type, label, options, required, conditional_on)
select 'role', r.id, ord, t, l, o, req, c from r,
(values
  (10,'single'::question_type,'Você tem experiência como camareira em hotel/pousada?',
    '["Sim, mais de 2 anos","Sim, até 2 anos","Não tenho"]'::jsonb,true,null::jsonb),
  (15,'short_text','Em qual hotel ou pousada e por quanto tempo?',null,false,
    '{"question_label":"Você tem experiência como camareira em hotel/pousada?","not_equals":"Não tenho"}'::jsonb),
  (20,'multi','Quais dessas atividades você já executou?',
    '["Arrumação completa de quartos","Limpeza profunda","Troca de enxoval","Reposição de amenities","Verificação de defeitos"]'::jsonb,true,null),
  (30,'scale','Como você avalia sua atenção a detalhes (cama, banheiro, organização)?',
    '["1","2","3","4","5"]'::jsonb,true,null),
  (40,'single','Qual sua média de quartos arrumados por turno?',
    '["Menos de 8","8 a 12","13 a 16","Mais de 16","Nunca trabalhei com meta"]'::jsonb,false,null),
  (50,'long_text','Como você organiza seu tempo para arrumar vários quartos no mesmo turno?',null,true,null),
  (60,'long_text','O que, para você, é um quarto entregue com qualidade?',null,true,null)
) as v(ord,t,l,o,req,c);

-- SERVIÇOS GERAIS
with r as (select id from public.roles where slug='servicos-gerais')
insert into public.questions (scope, role_id, order_index, type, label, options, required, conditional_on)
select 'role', r.id, ord, t, l, o, req, c from r,
(values
  (10,'single'::question_type,'Você tem experiência em limpeza de ambientes?',
    '["Sim, em hotel","Sim, em empresa/condomínio","Sim, residencial","Não tenho"]'::jsonb,true,null::jsonb),
  (20,'multi','Quais ambientes você já limpou?',
    '["Áreas sociais","Banheiros","Corredores","Áreas externas","Salas administrativas","Cozinha"]'::jsonb,false,null),
  (30,'scale','Como você avalia sua disposição física para tarefas repetitivas?',
    '["1","2","3","4","5"]'::jsonb,true,null),
  (40,'single','Você tem alguma restrição médica que impacte tarefas físicas (ex.: levantar peso)?',
    '["Não","Sim, leves","Sim, moderadas"]'::jsonb,true,null),
  (50,'long_text','Para você, o que diferencia um trabalho de limpeza bem feito?',null,true,null)
) as v(ord,t,l,o,req,c);

-- ASSISTENTE ADMINISTRATIVO
with r as (select id from public.roles where slug='assistente-administrativo')
insert into public.questions (scope, role_id, order_index, type, label, options, required, conditional_on)
select 'role', r.id, ord, t, l, o, req, c from r,
(values
  (10,'single'::question_type,'Qual sua experiência em rotinas administrativas?',
    '["Mais de 3 anos","1 a 3 anos","Menos de 1 ano","Nenhuma"]'::jsonb,true,null::jsonb),
  (20,'multi','Em quais ferramentas você tem domínio?',
    '["Excel/Planilhas","Word","E-mail corporativo","Sistemas de gestão (ERP)","Google Workspace","Microsoft 365"]'::jsonb,true,null),
  (30,'single','Qual seu nível em planilhas eletrônicas?',
    '["Básico","Intermediário","Avançado"]'::jsonb,true,null),
  (40,'multi','Quais rotinas administrativas você já executou?',
    '["Organização de documentos","Conferência de notas","Atendimento interno","Agendamentos","Controle de planilhas","Apoio financeiro","Apoio a RH"]'::jsonb,true,null),
  (50,'scale','Como você avalia sua organização e capacidade de priorização?',
    '["1","2","3","4","5"]'::jsonb,true,null),
  (60,'long_text','Descreva uma rotina administrativa que você organizou ou melhorou.',null,true,null)
) as v(ord,t,l,o,req,c);

-- GARÇOM / GARÇONETE
with r as (select id from public.roles where slug='garcom')
insert into public.questions (scope, role_id, order_index, type, label, options, required, conditional_on)
select 'role', r.id, ord, t, l, o, req, c from r,
(values
  (10,'single'::question_type,'Qual sua experiência como garçom/garçonete?',
    '["Mais de 3 anos","1 a 3 anos","Menos de 1 ano","Não tenho"]'::jsonb,true,null::jsonb),
  (20,'multi','Em quais formatos de atendimento você já atuou?',
    '["Café da manhã (buffet)","À la carte","Eventos","Room service","Bar","Coffee break"]'::jsonb,true,null),
  (30,'single','Você tem familiaridade com bandejagem?',
    '["Sim, com segurança","Sim, parcialmente","Não"]'::jsonb,true,null),
  (40,'scale','Como você avalia sua simpatia e cordialidade no atendimento?',
    '["1","2","3","4","5"]'::jsonb,true,null),
  (50,'long_text','Conte uma situação em que surpreendeu positivamente um cliente.',null,true,null)
) as v(ord,t,l,o,req,c);

-- AUXILIAR DE LIMPEZA
with r as (select id from public.roles where slug='auxiliar-limpeza')
insert into public.questions (scope, role_id, order_index, type, label, options, required, conditional_on)
select 'role', r.id, ord, t, l, o, req, c from r,
(values
  (10,'single'::question_type,'Você tem experiência em limpeza profissional?',
    '["Sim, mais de 2 anos","Sim, até 2 anos","Não tenho"]'::jsonb,true,null::jsonb),
  (20,'multi','Quais áreas você já limpou?',
    '["Quartos","Banheiros","Áreas comuns","Corredores","Áreas externas","Restaurante"]'::jsonb,false,null),
  (30,'single','Você conhece o uso correto de produtos de limpeza e EPI?',
    '["Sim","Conheço parcialmente","Não conheço"]'::jsonb,true,null),
  (40,'scale','Como você avalia seu zelo com a organização do ambiente após a limpeza?',
    '["1","2","3","4","5"]'::jsonb,true,null),
  (50,'long_text','O que você acha mais importante na rotina de limpeza de um hotel?',null,true,null)
) as v(ord,t,l,o,req,c);

-- MANUTENÇÃO
with r as (select id from public.roles where slug='manutencao')
insert into public.questions (scope, role_id, order_index, type, label, options, required, conditional_on)
select 'role', r.id, ord, t, l, o, req, c from r,
(values
  (10,'single'::question_type,'Qual sua experiência em manutenção predial?',
    '["Mais de 3 anos","1 a 3 anos","Menos de 1 ano","Sou iniciante"]'::jsonb,true,null::jsonb),
  (20,'multi','Em quais áreas você tem conhecimento prático?',
    '["Elétrica básica","Hidráulica básica","Pintura/reparos","Marcenaria/serralheria leve","Ar-condicionado","Pequenos reparos gerais"]'::jsonb,true,null),
  (30,'single','Você possui curso ou certificação técnica?',
    '["Sim, NR-10","Sim, técnico em elétrica/edificações","Outro curso","Não tenho"]'::jsonb,true,null),
  (35,'short_text','Quais cursos ou certificações?',null,false,
    '{"question_label":"Você possui curso ou certificação técnica?","not_equals":"Não tenho"}'::jsonb),
  (40,'scale','Como você avalia sua capacidade de identificar prioridades em demandas simultâneas?',
    '["1","2","3","4","5"]'::jsonb,true,null),
  (50,'long_text','Descreva uma situação de manutenção urgente que você resolveu.',null,true,null)
) as v(ord,t,l,o,req,c);

-- SUPERVISOR DE RECEPÇÃO
with r as (select id from public.roles where slug='supervisor-recepcao')
insert into public.questions (scope, role_id, order_index, type, label, options, required, conditional_on)
select 'role', r.id, ord, t, l, o, req, c from r,
(values
  (10,'single'::question_type,'Qual sua experiência liderando equipes de recepção?',
    '["Mais de 3 anos","1 a 3 anos","Menos de 1 ano","Nunca liderei"]'::jsonb,true,null::jsonb),
  (15,'long_text','Descreva sua experiência liderando equipes (tamanho, escala, principais entregas).',null,false,
    '{"question_label":"Qual sua experiência liderando equipes de recepção?","not_equals":"Nunca liderei"}'::jsonb),
  (20,'multi','Em quais responsabilidades de supervisão você atuou?',
    '["Escala de equipe","Treinamento","Auditoria de processos","Atendimento de hóspedes VIP","Resolução de conflitos","Fechamento de turno"]'::jsonb,true,null),
  (30,'single','Quais sistemas de hotelaria você já operou?',
    '["Desbravador","CMNet","Omnibees","HITS","Outros","Nunca operei"]'::jsonb,true,null),
  (40,'scale','Como você avalia sua capacidade de mediação de conflitos?',
    '["1","2","3","4","5"]'::jsonb,true,null),
  (50,'long_text','Descreva uma situação difícil com hóspede ou equipe e como conduziu.',null,true,null)
) as v(ord,t,l,o,req,c);

-- SUPERVISOR DE GOVERNANÇA
with r as (select id from public.roles where slug='supervisor-governanca')
insert into public.questions (scope, role_id, order_index, type, label, options, required, conditional_on)
select 'role', r.id, ord, t, l, o, req, c from r,
(values
  (10,'single'::question_type,'Qual sua experiência liderando equipes de governança / camareiras?',
    '["Mais de 3 anos","1 a 3 anos","Menos de 1 ano","Nunca liderei"]'::jsonb,true,null::jsonb),
  (20,'multi','Em quais atividades de supervisão você atuou?',
    '["Inspeção de quartos","Distribuição de tarefas","Treinamento","Controle de enxoval","Controle de minibar","Apoio à manutenção"]'::jsonb,true,null),
  (30,'scale','Como você avalia sua atenção ao padrão de qualidade?',
    '["1","2","3","4","5"]'::jsonb,true,null),
  (40,'long_text','Como você acompanha a produtividade da equipe sem perder a qualidade?',null,true,null),
  (50,'long_text','Descreva como conduz um feedback corretivo a uma camareira.',null,true,null)
) as v(ord,t,l,o,req,c);

-- MENSAGEIRO
with r as (select id from public.roles where slug='mensageiro')
insert into public.questions (scope, role_id, order_index, type, label, options, required, conditional_on)
select 'role', r.id, ord, t, l, o, req, c from r,
(values
  (10,'single'::question_type,'Você tem experiência como mensageiro/portaria em hotel?',
    '["Sim","Não, mas tenho perfil"]'::jsonb,true,null::jsonb),
  (20,'multi','Em quais atividades você tem experiência?',
    '["Recepção do hóspede","Bagagens","Apoio ao check-in","Solicitações de hóspedes","Apoio ao lobby"]'::jsonb,false,null),
  (30,'scale','Como você avalia sua disposição para tarefas físicas (carregar bagagens)?',
    '["1","2","3","4","5"]'::jsonb,true,null),
  (40,'long_text','Para você, qual a importância do mensageiro na primeira impressão do hóspede?',null,true,null)
) as v(ord,t,l,o,req,c);

-- AGENTE DE RESERVAS
with r as (select id from public.roles where slug='agente-reservas')
insert into public.questions (scope, role_id, order_index, type, label, options, required, conditional_on)
select 'role', r.id, ord, t, l, o, req, c from r,
(values
  (10,'single'::question_type,'Qual sua experiência com reservas em hotelaria?',
    '["Mais de 3 anos","1 a 3 anos","Menos de 1 ano","Não tenho"]'::jsonb,true,null::jsonb),
  (20,'multi','Em quais canais você já atendeu?',
    '["Telefone","E-mail","WhatsApp","Booking/OTAs","Site próprio","Walk-in"]'::jsonb,true,null),
  (30,'single','Como avalia sua escrita para atendimento digital?',
    '["Excelente","Boa","Razoável","Preciso melhorar"]'::jsonb,true,null),
  (40,'scale','Como você avalia sua capacidade de negociação e conversão?',
    '["1","2","3","4","5"]'::jsonb,true,null),
  (50,'long_text','Como você conduz um atendimento que demonstra pouca intenção de fechar reserva?',null,true,null),
  (60,'long_text','Quais informações você considera essenciais coletar antes de fechar uma reserva?',null,true,null)
) as v(ord,t,l,o,req,c);

-- ATENDENTE
with r as (select id from public.roles where slug='atendente')
insert into public.questions (scope, role_id, order_index, type, label, options, required, conditional_on)
select 'role', r.id, ord, t, l, o, req, c from r,
(values
  (10,'single'::question_type,'Qual sua experiência em atendimento ao público?',
    '["Mais de 3 anos","1 a 3 anos","Menos de 1 ano","Não tenho"]'::jsonb,true,null::jsonb),
  (20,'multi','Em quais ambientes você já atendeu?',
    '["Hotel/pousada","Restaurante","Loja","Recepção","Eventos","Call center"]'::jsonb,false,null),
  (30,'scale','Como você avalia sua paciência em situações difíceis?',
    '["1","2","3","4","5"]'::jsonb,true,null),
  (40,'long_text','O que faz a diferença em um atendimento memorável?',null,true,null)
) as v(ord,t,l,o,req,c);

-- ESTOQUISTA
with r as (select id from public.roles where slug='estoquista')
insert into public.questions (scope, role_id, order_index, type, label, options, required, conditional_on)
select 'role', r.id, ord, t, l, o, req, c from r,
(values
  (10,'single'::question_type,'Qual sua experiência em controle de estoque?',
    '["Mais de 3 anos","1 a 3 anos","Menos de 1 ano","Não tenho"]'::jsonb,true,null::jsonb),
  (20,'multi','Em quais atividades você atuou?',
    '["Recebimento","Conferência","Inventário","Sistema de gestão","Organização física","Pedidos de compra"]'::jsonb,true,null),
  (30,'single','Qual seu nível em planilhas/sistemas de estoque?',
    '["Avançado","Intermediário","Básico","Nenhum"]'::jsonb,true,null),
  (40,'scale','Como você avalia sua atenção a detalhes (validade, lote, quantidade)?',
    '["1","2","3","4","5"]'::jsonb,true,null),
  (50,'long_text','Como você organiza um estoque para evitar perdas e divergências?',null,true,null)
) as v(ord,t,l,o,req,c);

-- AUXILIAR DE LAVANDERIA
with r as (select id from public.roles where slug='auxiliar-lavanderia')
insert into public.questions (scope, role_id, order_index, type, label, options, required, conditional_on)
select 'role', r.id, ord, t, l, o, req, c from r,
(values
  (10,'single'::question_type,'Você tem experiência em lavanderia (hotel, hospital, industrial)?',
    '["Sim, em hotelaria","Sim, em outro segmento","Não tenho"]'::jsonb,true,null::jsonb),
  (20,'multi','Quais atividades você já executou?',
    '["Triagem","Lavagem","Centrifugação","Calandra","Dobra","Distribuição"]'::jsonb,false,null),
  (30,'single','Você conhece padrões de higienização de enxoval?',
    '["Sim","Conheço parcialmente","Não conheço"]'::jsonb,true,null),
  (40,'scale','Como avalia seu cuidado com peças e produtos químicos?',
    '["1","2","3","4","5"]'::jsonb,true,null),
  (50,'long_text','O que você acha mais crítico em uma lavanderia de hotel?',null,true,null)
) as v(ord,t,l,o,req,c);

-- GERENTE OPERACIONAL
with r as (select id from public.roles where slug='gerente-operacional')
insert into public.questions (scope, role_id, order_index, type, label, options, required, conditional_on)
select 'role', r.id, ord, t, l, o, req, c from r,
(values
  (10,'single'::question_type,'Qual sua experiência em gerência operacional em hotelaria?',
    '["Mais de 5 anos","3 a 5 anos","1 a 3 anos","Menos de 1 ano"]'::jsonb,true,null::jsonb),
  (20,'multi','Quais áreas você já geriu?',
    '["Recepção","Governança","A&B","Manutenção","Reservas","Eventos","Financeiro operacional"]'::jsonb,true,null),
  (30,'single','Maior equipe sob sua liderança?',
    '["Até 10","11 a 30","31 a 60","Mais de 60"]'::jsonb,true,null),
  (40,'multi','Quais indicadores você acompanha de perto?',
    '["Ocupação","Diária média (ADR)","RevPAR","NPS / satisfação","Custo operacional","Turnover"]'::jsonb,true,null),
  (50,'scale','Como você avalia sua capacidade de tomar decisões sob pressão?',
    '["1","2","3","4","5"]'::jsonb,true,null),
  (60,'long_text','Descreva uma situação em que precisou virar um resultado operacional difícil.',null,true,null),
  (70,'long_text','Como você desenvolve e retém pessoas no hotel?',null,true,null)
) as v(ord,t,l,o,req,c);

-- BANCO DE TALENTOS
with r as (select id from public.roles where slug='banco-talentos')
insert into public.questions (scope, role_id, order_index, type, label, options, required, conditional_on)
select 'role', r.id, ord, t, l, o, req, c from r,
(values
  (10,'single'::question_type,'Em qual área você tem maior interesse?',
    '["Recepção","Governança","Cozinha / A&B","Administrativo","Reservas / Comercial","Manutenção","Liderança","Outra"]'::jsonb,true,null::jsonb),
  (20,'short_text','Se marcou Outra, qual área?',null,false,
    '{"question_label":"Em qual área você tem maior interesse?","equals":"Outra"}'::jsonb),
  (30,'single','Qual seu nível de experiência geral?',
    '["Iniciante","Intermediário","Experiente","Liderança"]'::jsonb,true,null),
  (40,'long_text','Conte um pouco sobre você e o tipo de oportunidade que está buscando.',null,true,null)
) as v(ord,t,l,o,req,c);

-- ============== VAGAS DE EXEMPLO (status active) ==============
insert into public.jobs (slug, role_id, title, sector, location, schedule, summary, activities, requirements, desirables, benefits, status)
select 'recepcionista-maceio', id, 'Recepcionista — Maceió',
  'Recepção', 'Maceió/AL', 'Escala 12x36',
  'Atuar no atendimento aos hóspedes durante o turno, conduzindo check-in, check-out e suporte às solicitações com cordialidade e organização.',
  array[
    'Realizar check-in e check-out de hóspedes',
    'Atender presencialmente, por telefone e WhatsApp',
    'Operar o sistema de gestão hoteleira',
    'Encaminhar demandas para os setores responsáveis',
    'Apoiar o fechamento de turno e relatórios'
  ],
  array[
    'Ensino médio completo',
    'Boa comunicação e postura profissional',
    'Disponibilidade para escala 12x36, incluindo finais de semana e feriados'
  ],
  array[
    'Experiência prévia em recepção de hotel',
    'Conhecimento em sistemas como Desbravador, CMNet ou Omnibees',
    'Inglês ou espanhol intermediário'
  ],
  array['Vale-transporte','Refeição no local','Plano de saúde','Bonificação por desempenho'],
  'active'
from public.roles where slug='recepcionista';

insert into public.jobs (slug, role_id, title, sector, location, schedule, summary, activities, requirements, desirables, benefits, status)
select 'camareira-maceio', id, 'Camareira — Maceió',
  'Governança', 'Maceió/AL', '6x1',
  'Garantir a arrumação, higienização e padrão de excelência dos quartos do hotel, oferecendo ao hóspede um ambiente impecável.',
  array[
    'Arrumação completa de quartos (cama, banheiro, áreas)',
    'Troca de enxoval e reposição de amenities',
    'Identificação de defeitos e comunicação à manutenção',
    'Cumprimento das rotinas e checklists de qualidade'
  ],
  array[
    'Experiência prévia em arrumação ou limpeza',
    'Atenção a detalhes',
    'Disponibilidade para escala 6x1'
  ],
  array['Experiência anterior em hotelaria','Curso de governança hoteleira'],
  array['Vale-transporte','Refeição no local','Vale-alimentação'],
  'active'
from public.roles where slug='camareira';

insert into public.jobs (slug, role_id, title, sector, location, schedule, summary, activities, requirements, desirables, benefits, status)
select 'cozinheiro-maceio', id, 'Cozinheira / Cozinheiro — Maceió',
  'Alimentos & Bebidas', 'Maceió/AL', 'Escala 6x1',
  'Atuar na cozinha do hotel preparando refeições com qualidade, padrão e segurança alimentar, contribuindo para uma experiência marcante ao hóspede.',
  array[
    'Preparo de refeições conforme o cardápio',
    'Aplicação de boas práticas de manipulação de alimentos',
    'Organização e higienização do espaço de trabalho',
    'Apoio à equipe em horários de pico'
  ],
  array[
    'Experiência comprovada em cozinha profissional',
    'Conhecimento em boas práticas de manipulação',
    'Disponibilidade para escala 6x1, finais de semana e feriados'
  ],
  array['Curso técnico em gastronomia','Experiência em cozinha de hotel'],
  array['Vale-transporte','Refeição no local','Plano de saúde'],
  'active'
from public.roles where slug='cozinheiro';

insert into public.jobs (slug, role_id, title, sector, location, schedule, summary, activities, requirements, desirables, benefits, status)
select 'agente-reservas-maceio', id, 'Agente de Reservas — Maceió',
  'Comercial', 'Maceió/AL', 'Segunda a sábado',
  'Atender os canais comerciais do hotel, converter atendimentos em reservas e oferecer uma experiência de excelência desde o primeiro contato.',
  array[
    'Atender e-mail, telefone e WhatsApp comercial',
    'Gerenciar reservas em sistema próprio e OTAs',
    'Negociar tarifas dentro da política comercial',
    'Acompanhar conversão e retorno de propostas'
  ],
  array[
    'Boa escrita e comunicação',
    'Experiência em atendimento ou comercial',
    'Familiaridade com computador e sistemas'
  ],
  array['Experiência com OTAs (Booking, Decolar)','Inglês básico'],
  array['Vale-transporte','Refeição no local','Comissão por conversão'],
  'active'
from public.roles where slug='agente-reservas';

insert into public.jobs (slug, role_id, title, sector, location, schedule, summary, activities, requirements, desirables, benefits, status)
select 'manutencao-maceio', id, 'Auxiliar de Manutenção — Maceió',
  'Manutenção', 'Maceió/AL', 'Segunda a sexta + escala em finais de semana',
  'Apoiar a manutenção predial do hotel, executando reparos e contribuindo para a conservação das instalações.',
  array[
    'Pequenos reparos elétricos e hidráulicos',
    'Manutenção preventiva e corretiva',
    'Atendimento de chamados internos',
    'Zelo pelas ferramentas e materiais'
  ],
  array[
    'Conhecimento básico em elétrica e hidráulica',
    'Boa disposição e responsabilidade',
    'Disponibilidade para escala'
  ],
  array['Curso técnico em elétrica/edificações','NR-10','Experiência em hotelaria'],
  array['Vale-transporte','Refeição no local','Plano de saúde'],
  'active'
from public.roles where slug='manutencao';
