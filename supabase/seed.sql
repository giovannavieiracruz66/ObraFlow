-- ==========================================
-- OBRAFLOW — SEED DE DEMONSTRAÇÃO (gerado a partir de js/data.js)
-- Rode DEPOIS do schema.sql, uma única vez.
-- ==========================================

do $$
declare
  v_c1 uuid := gen_random_uuid();
  v_c2 uuid := gen_random_uuid();
  v_c3 uuid := gen_random_uuid();
  v_c4 uuid := gen_random_uuid();
  v_c5 uuid := gen_random_uuid();
  v_c6 uuid := gen_random_uuid();
  v_c7 uuid := gen_random_uuid();
  v_c8 uuid := gen_random_uuid();
  v_p1 uuid := gen_random_uuid();
  v_p2 uuid := gen_random_uuid();
  v_p3 uuid := gen_random_uuid();
  v_p4 uuid := gen_random_uuid();
  v_p5 uuid := gen_random_uuid();
  v_p6 uuid := gen_random_uuid();
  v_p7 uuid := gen_random_uuid();
  v_p8 uuid := gen_random_uuid();
  v_p9 uuid := gen_random_uuid();
  v_p10 uuid := gen_random_uuid();
  v_p11 uuid := gen_random_uuid();
  v_p12 uuid := gen_random_uuid();
  v_p13 uuid := gen_random_uuid();
  v_p14 uuid := gen_random_uuid();
  v_p15 uuid := gen_random_uuid();
  v_o1 uuid := gen_random_uuid();
  v_o2 uuid := gen_random_uuid();
  v_o3 uuid := gen_random_uuid();
  v_o4 uuid := gen_random_uuid();
  v_o5 uuid := gen_random_uuid();
  v_o6 uuid := gen_random_uuid();
  v_o7 uuid := gen_random_uuid();
  v_o8 uuid := gen_random_uuid();
  v_o9 uuid := gen_random_uuid();
  v_o10 uuid := gen_random_uuid();
begin
  insert into public.clients (id, name, company, cpf_cnpj, phone, whatsapp, email, city, address, notes, created_at) values
    (v_c1, 'Roberto Mendes', 'Mendes Incorporações Ltda', '28.456.123/0001-44', '(11) 99234-5678', '11992345678', 'roberto@mendesincorp.com.br', 'São Paulo', 'Av. Paulista, 1500, cj 42, São Paulo - SP', 'Cliente premium, projetos de alto padrão. Prefere reuniões às terças.', '2024-01-10'),
    (v_c2, 'Ana Paula Ferreira', null, '389.234.567-90', '(11) 98765-4321', '11987654321', 'anapaula@gmail.com', 'Guarulhos', 'Rua das Flores, 234, Guarulhos - SP', 'Residência de alto padrão. Exige relatórios semanais.', '2024-02-15'),
    (v_c3, 'Grupo Vitallis', 'Vitallis Saúde S/A', '12.345.678/0001-99', '(11) 3344-5566', '11944556677', 'obras@vitallis.com.br', 'São Paulo', 'Rua Vergueiro, 3900, São Paulo - SP', 'Rede de clínicas. Obras comerciais com prazo rígido.', '2024-03-01'),
    (v_c4, 'Marcos Augusto Silveira', 'Silveira Empreendimentos', '34.567.890/0001-12', '(11) 97890-1234', '11978901234', 'marcos@silveiraemprend.com.br', 'Campinas', 'Av. Brasil, 800, Campinas - SP', 'Empreendedor. Projetos industriais e galpões.', '2024-04-12'),
    (v_c5, 'Patricia Rodrigues', null, '456.789.012-34', '(11) 96543-2109', '11965432109', 'patricia.rodrigues@outlook.com', 'Osasco', 'Rua Amazonas, 56, Osasco - SP', 'Reforma residencial.', '2024-05-08'),
    (v_c6, 'Construtora BM', 'BM Construções e Engenharia Ltda', '56.789.012/0001-45', '(11) 3322-1188', '11944778899', 'contato@bmconstrucoes.com.br', 'Santo André', 'Av. Industrial, 1200, Santo André - SP', 'Parceiro. Subempreitadas.', '2024-06-20'),
    (v_c7, 'Fernando Castelo', 'Castelo Hotéis', '67.890.123/0001-56', '(11) 3456-7890', '11934567890', 'obra@castelohoteis.com.br', 'São Paulo', 'Rua Oscar Freire, 890, São Paulo - SP', 'Reforma e ampliação de hotel boutique.', '2024-07-15'),
    (v_c8, 'TechPark Desenvolvimento', 'TechPark Dev Imobiliário S/A', '78.901.234/0001-67', '(11) 4567-8901', '11945678901', 'projetos@techpark.com.br', 'São José dos Campos', 'Av. Shishima Hifumi, 2500, SJC - SP', 'Parque tecnológico. Obra de grande porte.', '2024-08-01');

  insert into public.projects (id, name, client_id, responsible, address, city, category, status, contract_value, received_value, cost_value, closed_at, start_date, end_date, description, payment_method, notes, physical_progress, created_at) values
    (v_p1, 'Residência Alto Padrão - Alphaville', v_c1, 'Carlos Henrique', 'Av. Dez de Dezembro, 120', 'Barueri', 'Residencial', 'em_andamento', 820000, 492000, 410000, '2024-08-15', '2024-09-01', '2025-06-30', 'Construção de residência unifamiliar de alto padrão com 380m², piscina, área gourmet e paisagismo.', 'Medições mensais', 'Cliente exige qualidade premium em todos os acabamentos.', 68, '2024-08-10'),
    (v_p2, 'Clínica Médica Vitallis - Unidade Brooklin', v_c3, 'Diego Almeida', 'Rua Dr. Renato Paes de Barros, 33', 'São Paulo', 'Comercial', 'em_andamento', 380000, 228000, 190000, '2024-09-01', '2024-10-01', '2025-02-28', 'Reforma completa e adequação de clínica médica. 620m², 12 consultórios, recepção, sala de procedimentos.', '3 parcelas fixas + medição final', 'Prazo rígido. Inauguração prevista para março.', 45, '2024-09-01'),
    (v_p3, 'Galpão Industrial - Campinas', v_c4, 'Carlos Henrique', 'Distrito Industrial, Rodovia SP-340, Km 130', 'Campinas', 'Industrial', 'em_andamento', 1250000, 500000, 625000, '2024-07-20', '2024-08-01', '2025-09-30', 'Construção de galpão industrial 2.400m² com escritório, vestiários e pátio de manobra.', 'Medições mensais', 'Obra prioritária do cliente.', 35, '2024-07-15'),
    (v_p4, 'Hotel Boutique - Oscar Freire Reform', v_c7, 'Fernanda Costa', 'Rua Oscar Freire, 890', 'São Paulo', 'Hotelaria', 'em_andamento', 950000, 285000, 380000, '2024-10-01', '2025-01-15', '2025-12-31', 'Reforma completa de hotel boutique 18 quartos. Lobby, restaurante, rooftop.', 'Medições quinzenais', 'Obra complexa. Hotel em operação parcial durante obras.', 22, '2024-09-28'),
    (v_p5, 'Residência Ana Paula - Guarulhos', v_c2, 'Carlos Henrique', 'Rua das Flores, 234', 'Guarulhos', 'Residencial', 'concluida', 290000, 290000, 145000, '2024-04-10', '2024-05-01', '2024-11-30', 'Construção de sobrado 240m², 4 quartos, 3 suítes, piscina.', '4 parcelas', 'Entregue antes do prazo. Cliente satisfeito.', 100, '2024-04-05'),
    (v_p6, 'Reforma Comercial Patricia - Osasco', v_c5, 'Diego Almeida', 'Rua Amazonas, 56', 'Osasco', 'Residencial', 'concluida', 85000, 85000, 42500, '2024-06-15', '2024-07-01', '2024-09-30', 'Reforma de apartamento 90m². Cozinha, banheiros, sala.', '2 parcelas', 'Obra simples, rápida execução.', 100, '2024-06-10'),
    (v_p7, 'TechPark - Fase 1 (Infraestrutura)', v_c8, 'Carlos Henrique', 'Av. Shishima Hifumi, 2500', 'São José dos Campos', 'Corporativo', 'programada', 3200000, 320000, 0, '2024-11-20', '2025-03-01', '2026-06-30', 'Infraestrutura civil de parque tecnológico. 8.000m² de área construída.', 'Medições mensais com reajuste anual', 'Projeto de grande porte. ART emitida.', 0, '2024-11-15'),
    (v_p8, 'Expansão BM - Galpão 2', v_c6, 'Fernanda Costa', 'Av. Industrial, 1250', 'Santo André', 'Industrial', 'programada', 480000, 48000, 0, '2024-12-01', '2025-02-15', '2025-08-31', 'Construção de segundo galpão 900m² ao lado do existente.', 'Medições mensais', 'Continuidade da parceria com BM.', 0, '2024-11-28'),
    (v_p9, 'Obra Mendes - Torre A', v_c1, 'Carlos Henrique', 'Av. das Nações Unidas, 14401', 'São Paulo', 'Residencial', 'orcamento', 2100000, 0, 0, null, '2025-05-01', '2026-12-31', 'Torre residencial 18 andares. Pré-lançamento.', 'A definir', 'Orçamento em aprovação pelo board.', 0, '2024-12-01'),
    (v_p10, 'Manutenção Vitallis - Unidade Centro', v_c3, 'Diego Almeida', 'Rua Vergueiro, 3900', 'São Paulo', 'Manutenção', 'pausada', 45000, 22500, 22500, '2024-09-15', '2024-10-15', '2024-12-15', 'Manutenção preventiva e corretiva. Pintura, elétrica e hidráulica.', '2 parcelas', 'Pausada aguardando aprovação de escopo adicional.', 50, '2024-09-10'),
    (v_p11, 'Casa de Praia - Riviera', v_c2, 'Carlos Henrique', 'Rua das Gaivotas, 45', 'Bertioga', 'Residencial', 'aprovado', 560000, 56000, 0, '2024-12-10', '2025-02-01', '2025-10-31', 'Casa de praia 320m². Estilo contemporâneo, varanda ampla.', 'Medições mensais', 'Contrato assinado. Aguardando início.', 0, '2024-12-05'),
    (v_p12, 'Reforma escritório BM', v_c6, 'Diego Almeida', 'Av. Industrial, 1200', 'Santo André', 'Comercial', 'concluida', 120000, 120000, 60000, '2024-03-15', '2024-04-01', '2024-07-31', 'Reforma do setor administrativo. 200m², 8 salas.', '3 parcelas', 'Concluída com sucesso.', 100, '2024-03-10'),
    (v_p13, 'Ampliação TechPark - Estacionamento', v_c8, 'Fernanda Costa', 'Av. Shishima Hifumi, 2500', 'São José dos Campos', 'Infraestrutura', 'em_andamento', 380000, 190000, 190000, '2024-10-15', '2024-11-01', '2025-04-30', 'Ampliação do estacionamento. 200 vagas adicionais.', 'Medições mensais', 'Em fase de pavimentação.', 55, '2024-10-10'),
    (v_p14, 'Castelo Hotel - Rooftop Bar', v_c7, 'Carlos Henrique', 'Rua Oscar Freire, 890', 'São Paulo', 'Hotelaria', 'concluida', 180000, 180000, 90000, '2024-08-01', '2024-08-20', '2024-11-30', 'Construção de rooftop bar 150m².', '2 parcelas', 'Projeto piloto. Sucesso total.', 100, '2024-07-28'),
    (v_p15, 'Residência Mendes - Reforma Interna', v_c1, 'Fernanda Costa', 'Rua Joaquim Floriano, 560', 'São Paulo', 'Residencial', 'em_andamento', 165000, 82500, 82500, '2024-11-10', '2024-12-01', '2025-03-31', 'Reforma interna de apartamento 180m². 3 suítes, cozinha americana, sala integrada.', 'Medições mensais', 'Família morando em hotel durante obra.', 40, '2024-11-05');

  insert into public.measurements (project_id, number, period, date, description, percentage, value, approved_value, sent_at, approved_at, payment_due, paid_at, status, notes) values
    (v_p1, 1, 'Set/2024', '2024-09-30', 'Fundação e estrutura. Concretagem de pilares e vigas do 1º pavimento.', 15, 123000, 123000, '2024-10-01', '2024-10-05', '2024-10-15', '2024-10-14', 'paga', 'Aprovada sem ressalvas.'),
    (v_p1, 2, 'Out/2024', '2024-10-31', 'Laje do 1º pavimento, alvenaria e contrapisos.', 20, 164000, 164000, '2024-11-01', '2024-11-04', '2024-11-15', '2024-11-13', 'paga', null),
    (v_p1, 3, 'Nov/2024', '2024-11-30', 'Cobertura, instalações elétricas 1ª fase, instalações hidráulicas.', 18, 147600, 147600, '2024-12-01', '2024-12-03', '2024-12-15', '2024-12-14', 'paga', null),
    (v_p1, 4, 'Dez/2024', '2024-12-31', 'Reboco externo, contrapiso área molhada, esquadrias de alumínio.', 15, 123000, 123000, '2025-01-02', '2025-01-06', '2025-01-15', null, 'aprovada', 'Aprovada. Aguardando pagamento.'),
    (v_p1, 5, 'Jan/2025', '2025-01-31', 'Revestimentos cerâmicos, instalações elétricas 2ª fase, louças e metais.', 0, 98000, null, '2025-02-01', null, '2025-02-15', null, 'aguardando_aprovacao', null),
    (v_p2, 1, 'Out/2024', '2024-10-31', 'Demolições, estrutura metálica e instalações prediais 1ª fase.', 25, 95000, 95000, '2024-11-01', '2024-11-05', '2024-11-20', '2024-11-19', 'paga', null),
    (v_p2, 2, 'Nov/2024', '2024-11-30', 'Drywall, forro de gesso, piso elevado, instalações de climatização.', 20, 76000, 76000, '2024-12-02', '2024-12-08', '2024-12-20', null, 'aprovada', 'Aguardando pagamento. Vence em 20/12.'),
    (v_p2, 3, 'Dez/2024', '2024-12-31', 'Revestimentos, louças, metais e pintura das salas.', 0, 57000, null, null, null, null, null, 'em_elaboracao', 'Em elaboração pelo engenheiro.'),
    (v_p3, 1, 'Ago/2024', '2024-08-31', 'Terraplanagem, fundações em estaca, infraestrutura elétrica.', 12, 150000, 150000, '2024-09-02', '2024-09-08', '2024-09-20', '2024-09-18', 'paga', null),
    (v_p3, 2, 'Set/2024', '2024-09-30', 'Estrutura metálica da nave principal, 60% concluída.', 13, 162500, 162500, '2024-10-01', '2024-10-10', '2024-10-25', '2024-10-22', 'paga', null),
    (v_p3, 3, 'Out/2024', '2024-10-31', 'Cobertura metálica, fechamento lateral, calhas e rufos.', 10, 125000, null, '2024-11-04', null, '2024-11-20', null, 'enviada', 'Enviada ao cliente. Aguardando retorno há 12 dias.'),
    (v_p13, 1, 'Nov/2024', '2024-11-30', 'Terraplenagem e drenagem da área.', 20, 76000, 76000, '2024-12-02', '2024-12-05', '2024-12-20', '2024-12-18', 'paga', null),
    (v_p13, 2, 'Dez/2024', '2024-12-31', 'Base e sub-base do estacionamento, 50% executada.', 20, 76000, null, '2025-01-03', null, '2025-01-20', null, 'aguardando_aprovacao', null),
    (v_p4, 1, 'Jan/2025', '2025-01-31', 'Demolições internas e proteções para área de hotel em operação.', 10, 95000, null, '2025-02-01', null, '2025-02-15', null, 'aguardando_aprovacao', null),
    (v_p15, 1, 'Dez/2024', '2024-12-31', 'Demolições, instalações elétricas 1ª fase, estrutura drywall.', 25, 41250, 41250, '2025-01-02', '2025-01-05', '2025-01-15', '2025-01-14', 'paga', null);

  insert into public.budgets (number, client_id, project_name, valid_until, services, materials, labor, discount, value, final_value, description, notes, status, sent_at, responded_at, created_at) values
    ('ORC-2024-031', v_c1, 'Torre Residencial A', '2025-01-15', 'Construção civil completa, estrutura, vedação, cobertura, acabamentos internos e externos', 980000, 840000, 0, 1820000, 1820000, 'Torre de 18 andares. 72 apartamentos de 85m².', 'Proposta técnica e comercial detalhada enviada.', 'aguardando_resposta', '2024-11-16', null, '2024-11-15'),
    ('ORC-2024-028', v_c8, 'TechPark Fase 1', '2024-12-20', 'Infraestrutura civil completa. Fundação, estrutura, vedação.', 1500000, 1200000, 150000, 2700000, 2550000, 'Parque tecnológico — Fase 1 de 3.', 'Desconto negociado de R$150k para fechamento de todas as fases.', 'aprovado', '2024-10-22', '2024-11-20', '2024-10-20'),
    ('ORC-2024-025', v_c2, 'Casa de Praia Riviera', '2024-12-01', 'Construção de residência 320m².', 260000, 220000, 20000, 480000, 560000, 'Casa de praia contemporânea.', 'Cliente aprovou após visita à obra da Alphaville.', 'aprovado', '2024-10-05', '2024-12-10', '2024-10-01'),
    ('ORC-2024-033', v_c3, 'Vitallis - Unidade Ipiranga', '2025-02-01', 'Reforma e adequação de clínica médica. 450m².', 180000, 120000, 0, 300000, 300000, '3ª unidade da rede Vitallis.', 'Enviado para aprovação da diretoria.', 'enviado', '2024-12-05', null, '2024-12-01'),
    ('ORC-2024-029', v_c4, 'Galpão Industrial - Fase 2', '2025-01-01', 'Construção galpão 1800m² (expansão).', 600000, 400000, 0, 1000000, 1000000, 'Ampliação do galpão existente.', 'Cliente ainda em análise de viabilidade.', 'aguardando_resposta', '2024-11-05', null, '2024-11-01'),
    ('ORC-2024-022', v_c5, 'Novo Apartamento Osasco', '2024-11-10', 'Reforma completa de apartamento 110m².', 75000, 45000, 5000, 120000, 115000, 'Reforma total. Cozinha, banheiros, sala, quartos.', 'Cliente escolheu outra empresa. Preço.', 'recusado', '2024-09-12', '2024-10-15', '2024-09-10'),
    ('ORC-2024-034', v_c7, 'Hotel - Reforma Quartos', '2025-02-05', 'Reforma dos 18 quartos do hotel.', 350000, 180000, 0, 530000, 530000, 'Reforma completa de interiores.', 'Proposta enviada junto ao projeto de arquitetura.', 'aguardando_resposta', '2024-12-08', null, '2024-12-05'),
    ('ORC-2024-035', v_c6, 'BM - Almoxarifado', '2025-02-10', 'Construção de almoxarifado 300m².', 120000, 80000, 0, 200000, 200000, 'Galpão de armazenagem com escritório.', 'Rascunho. Ainda revisando material.', 'rascunho', null, null, '2024-12-10'),
    ('ORC-2024-020', v_c1, 'Mendes - Piscina e Área Gourmet', '2024-10-20', 'Construção de piscina aquecida e área gourmet 60m².', 90000, 60000, 0, 150000, 150000, 'Complemento à residência principal.', 'Aprovado e já incorporado ao contrato principal.', 'aprovado', '2024-08-22', '2024-09-01', '2024-08-20'),
    ('ORC-2024-015', v_c2, 'Guarulhos - Garagem Ampliada', '2024-08-20', 'Ampliação de garagem para 3 vagas e depósito.', 35000, 25000, 0, 60000, 60000, 'Reforma e ampliação da garagem.', 'Prazo expirado.', 'expirado', '2024-06-25', null, '2024-06-20'),
    ('ORC-2024-036', v_c8, 'TechPark Fase 2 (Preliminar)', '2025-03-15', 'Construção dos blocos A e B do parque tecnológico.', 2000000, 1500000, 200000, 3500000, 3300000, 'Fase 2 do TechPark. Blocos A e B com 12.000m².', 'Rascunho inicial.', 'rascunho', null, null, '2024-12-15'),
    ('ORC-2024-030', v_c3, 'Vitallis - Manutenção Anual', '2025-01-10', 'Contrato de manutenção anual de 3 unidades.', 60000, 90000, 10000, 150000, 140000, 'Manutenção preventiva e corretiva das 3 unidades.', 'Cliente quer fechar pacote anual.', 'aguardando_resposta', '2024-11-12', null, '2024-11-10');

  insert into public.financial (project_id, client_id, description, value, date, due_date, paid_at, type, situation, payment_method, notes) values
    (v_p1, v_c1, '1ª Medição', 123000, '2024-10-01', '2024-10-15', '2024-10-14', 'receita', 'recebido', 'Transferência', null),
    (v_p1, v_c1, '2ª Medição', 164000, '2024-11-01', '2024-11-15', '2024-11-13', 'receita', 'recebido', 'Transferência', null),
    (v_p1, v_c1, '3ª Medição', 147600, '2024-12-01', '2024-12-15', '2024-12-14', 'receita', 'recebido', 'Transferência', null),
    (v_p1, v_c1, '4ª Medição', 123000, '2025-01-02', '2025-01-15', null, 'receita', 'a_receber', 'Transferência', 'Aprovada. Aguardando liberação.'),
    (v_p1, v_c1, '5ª Medição (prevista)', 98000, '2025-02-01', '2025-02-15', null, 'receita', 'previsto', 'Transferência', null),
    (v_p2, v_c3, '1ª Medição', 95000, '2024-11-01', '2024-11-20', '2024-11-19', 'receita', 'recebido', 'Transferência', null),
    (v_p2, v_c3, '2ª Medição', 76000, '2024-12-02', '2024-12-20', null, 'receita', 'atrasado', 'Boleto', 'Vencido há 5 dias!'),
    (v_p2, v_c3, '3ª Medição (prevista)', 57000, '2025-01-15', '2025-01-30', null, 'receita', 'previsto', 'Transferência', null),
    (v_p3, v_c4, '1ª Medição', 150000, '2024-09-02', '2024-09-20', '2024-09-18', 'receita', 'recebido', 'Transferência', null),
    (v_p3, v_c4, '2ª Medição', 162500, '2024-10-01', '2024-10-25', '2024-10-22', 'receita', 'recebido', 'Transferência', null),
    (v_p3, v_c4, '3ª Medição', 125000, '2024-11-04', '2024-11-20', null, 'receita', 'atrasado', 'Transferência', 'Aguardando aprovação da medição.'),
    (v_p4, v_c7, 'Sinal de contrato (30%)', 285000, '2024-10-05', '2024-10-10', '2024-10-08', 'receita', 'recebido', 'Transferência', null),
    (v_p5, v_c2, '1ª Parcela', 72500, '2024-05-01', '2024-05-10', '2024-05-09', 'receita', 'recebido', 'Transferência', null),
    (v_p5, v_c2, '2ª Parcela', 72500, '2024-07-01', '2024-07-15', '2024-07-12', 'receita', 'recebido', 'Transferência', null),
    (v_p5, v_c2, '3ª Parcela', 72500, '2024-09-01', '2024-09-15', '2024-09-13', 'receita', 'recebido', 'Transferência', null),
    (v_p5, v_c2, '4ª Parcela (final)', 72500, '2024-11-01', '2024-11-30', '2024-11-28', 'receita', 'recebido', 'Transferência', null),
    (v_p7, v_c8, 'Sinal de contrato (10%)', 320000, '2024-11-25', '2024-11-30', '2024-11-28', 'receita', 'recebido', 'Transferência', null),
    (v_p13, v_c8, '1ª Medição', 76000, '2024-12-02', '2024-12-20', '2024-12-18', 'receita', 'recebido', 'Transferência', null),
    (v_p13, v_c8, '2ª Medição', 76000, '2025-01-03', '2025-01-20', null, 'receita', 'a_receber', 'Transferência', null),
    (v_p14, v_c7, '1ª Parcela', 90000, '2024-08-25', '2024-09-01', '2024-08-30', 'receita', 'recebido', 'Transferência', null),
    (v_p14, v_c7, '2ª Parcela (final)', 90000, '2024-12-01', '2024-12-10', '2024-12-05', 'receita', 'recebido', 'Transferência', null),
    (v_p15, v_c1, '1ª Medição', 41250, '2025-01-02', '2025-01-15', '2025-01-14', 'receita', 'recebido', 'Transferência', null),
    (v_p15, v_c1, '2ª Medição (prevista)', 41250, '2025-02-01', '2025-02-15', null, 'receita', 'previsto', 'Transferência', null),
    (v_p11, v_c2, 'Sinal de contrato (10%)', 56000, '2024-12-15', '2024-12-20', '2024-12-18', 'receita', 'recebido', 'Transferência', null),
    (v_p8, v_c6, 'Sinal (10%)', 48000, '2024-12-05', '2024-12-10', '2024-12-09', 'receita', 'recebido', 'Transferência', null),
    (v_p10, v_c3, '1ª Parcela', 22500, '2024-10-20', '2024-10-25', '2024-10-24', 'receita', 'recebido', 'Boleto', null),
    (v_p6, v_c5, '1ª Parcela', 42500, '2024-07-05', '2024-07-15', '2024-07-14', 'receita', 'recebido', 'PIX', null),
    (v_p6, v_c5, '2ª Parcela (final)', 42500, '2024-09-20', '2024-09-30', '2024-09-28', 'receita', 'recebido', 'PIX', null),
    (v_p12, v_c6, '1ª Parcela', 40000, '2024-04-05', '2024-04-15', '2024-04-12', 'receita', 'recebido', 'Transferência', null),
    (v_p12, v_c6, '2ª Parcela', 40000, '2024-06-01', '2024-06-15', '2024-06-13', 'receita', 'recebido', 'Transferência', null),
    (v_p12, v_c6, '3ª Parcela (final)', 40000, '2024-08-01', '2024-08-15', '2024-08-12', 'receita', 'recebido', 'Transferência', null);

  insert into public.orders (id, project_id, item, sku, unit, quantity, delivered, unit_value, supplier, expected_date, notes, created_at) values
    (v_o1, v_p1, 'Cimento CP II 50kg', 'CIM-CPII-50', 'sc', 400, 400, 32, 'Votorantim Materiais', '2024-12-10', 'Entrega em 2 lotes.', '2024-11-20'),
    (v_o2, v_p1, 'Aço CA-50 10mm', 'ACO-CA50-10', 'barra', 600, 350, 48, 'Gerdau Comercial', '2025-01-20', null, '2024-12-15'),
    (v_o3, v_p1, 'Tijolo Cerâmico 9 furos', 'TIJ-9F', 'milheiro', 30, 0, 780, 'Cerâmica São José', '2025-01-05', 'Confirmar acesso de caminhão munck.', '2024-12-20'),
    (v_o4, v_p2, 'Placa de Drywall 12,5mm', 'DRY-125', 'un', 250, 250, 45, 'Knauf Distribuidora', '2024-12-01', null, '2024-11-10'),
    (v_o5, v_p2, 'Piso Porcelanato 80x80', 'POR-8080-CZ', 'm²', 620, 200, 89, 'Portobello Shop', '2025-01-08', 'Cor cinza grafite, lote único.', '2024-12-18'),
    (v_o6, v_p3, 'Telha Metálica Trapezoidal', 'TEL-TRAP-05', 'm²', 2500, 2500, 62, 'Metform Coberturas', '2024-11-25', null, '2024-11-01'),
    (v_o7, v_p3, 'Estrutura Metálica Galpão', 'EST-MET-G2', 'ton', 45, 0, 8900, 'Metálica Industrial SP', '2025-01-06', 'Pedido crítico — atrasado com fornecedor.', '2024-12-01'),
    (v_o8, v_p4, 'Louças e Metais (kit banheiro)', 'KIT-LM-STD', 'kit', 18, 6, 1450, 'Deca Distribuidora', '2025-01-15', '18 quartos do hotel.', '2024-12-22'),
    (v_o9, v_p13, 'Brita 1', 'BRI-1', 'm³', 180, 90, 95, 'Pedreira Santa Rita', '2024-12-28', null, '2024-12-10'),
    (v_o10, v_p15, 'Fiação Elétrica 2,5mm', 'FIO-25MM', 'rolo', 40, 40, 210, 'Prysmian Cabos', '2024-12-05', null, '2024-11-25');

  insert into public.order_receipts (order_id, project_id, item, quantity, invoice_number, photo_name, notes, received_by, balance_after, received_at, created_at) values
    (v_o1, v_p1, 'Cimento CP II 50kg', 200, 'NF-88213', null, '1º lote, sem avarias.', 'Carlos Henrique', 200, '2024-12-08', '2024-12-08'),
    (v_o1, v_p1, 'Cimento CP II 50kg', 200, 'NF-88450', 'nf-88450.jpg', '2º lote, entrega completa.', 'Zeca Ferreira', 0, '2024-12-10', '2024-12-10'),
    (v_o2, v_p1, 'Aço CA-50 10mm', 350, 'NF-91002', 'nf-91002.jpg', 'Entrega parcial, restante previsto p/ 20/01.', 'Zeca Ferreira', 250, '2024-12-30', '2024-12-30'),
    (v_o4, v_p2, 'Placa de Drywall 12,5mm', 250, 'NF-77112', null, 'Entrega total, conferido em obra.', 'Carlos Henrique', 0, '2024-11-30', '2024-11-30'),
    (v_o5, v_p2, 'Piso Porcelanato 80x80', 200, 'NF-90887', 'nf-90887.jpg', '1º lote recebido.', 'Zeca Ferreira', 420, '2024-12-27', '2024-12-27'),
    (v_o6, v_p3, 'Telha Metálica Trapezoidal', 2500, 'NF-65321', null, 'Entrega total.', 'Diego Almeida', 0, '2024-11-24', '2024-11-24'),
    (v_o8, v_p4, 'Louças e Metais (kit banheiro)', 6, 'NF-95500', 'nf-95500.jpg', 'Primeira remessa, 6 kits.', 'Zeca Ferreira', 12, '2025-01-02', '2025-01-02'),
    (v_o9, v_p13, 'Brita 1', 90, 'NF-70044', null, 'Metade do pedido entregue.', 'Zeca Ferreira', 90, '2024-12-26', '2024-12-26'),
    (v_o10, v_p15, 'Fiação Elétrica 2,5mm', 40, 'NF-66210', null, 'Entrega total.', 'Carlos Henrique', 0, '2024-12-04', '2024-12-04');

  insert into public.notifications (type, project_id, budget_id, read, title, message, priority, created_at) values
    ('payment_overdue', v_p2, null, false, 'Pagamento Vencido', 'Medição #2 da Clínica Vitallis Brooklin está vencida há 5 dias. Valor: R$ 76.000', 'high', '2025-01-09'),
    ('measurement_pending', v_p3, null, false, 'Medição Aguardando Aprovação', 'Medição #3 do Galpão Industrial (Campinas) enviada há 12 dias sem retorno. Valor: R$ 125.000', 'high', '2025-01-08'),
    ('budget_expiring', null, null, false, 'Orçamento Próximo do Vencimento', 'ORC-2024-031 (Torre Residencial A - Mendes) vence em 8 dias. Valor: R$ 1.820.000', 'medium', '2025-01-07'),
    ('payment_overdue', v_p3, null, false, 'Medição em Atraso', 'Medição #3 do Galpão Industrial está com pagamento em atraso. Valor: R$ 125.000', 'high', '2025-01-09'),
    ('project_starting', v_p8, null, false, 'Obra Começa em Breve', 'BM Galpão 2 inicia em 05/02. Faltam 26 dias. Confirme equipe e materiais.', 'medium', '2025-01-05'),
    ('budget_no_response', null, null, true, 'Orçamento sem Resposta', 'ORC-2024-029 (Galpão Fase 2 - Silveira) enviado há 65 dias sem resposta.', 'low', '2025-01-03'),
    ('project_starting', v_p7, null, true, 'Grande Obra em 50 dias', 'TechPark Fase 1 inicia em 01/03. Mobilize equipe e equipamentos.', 'medium', '2025-01-02'),
    ('measurement_due', v_p2, null, false, 'Elaborar Medição', 'Medição #3 da Clínica Vitallis (Dez/2024) ainda em elaboração. Agilize envio.', 'medium', '2025-01-09'),
    ('project_deadline', v_p2, null, false, 'Prazo Próximo da Obra', 'Clínica Vitallis Brooklin: previsão de conclusão em 28/02 (49 dias). Fique atento ao cronograma.', 'medium', '2025-01-08'),
    ('budget_expiring', null, null, true, 'Orçamento Expira', 'ORC-2024-029 vence em 01/01/2025. Renove ou entre em contato com Silveira.', 'medium', '2024-12-20');

end $$;
