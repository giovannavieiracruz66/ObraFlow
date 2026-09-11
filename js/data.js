// ==========================================
// OBRAFLOW — MOCK DATABASE
// Dados fictícios para demonstração completa
// ==========================================

const MOCK_DATA = {

  // === USUÁRIO LOGADO ===
  currentUser: {
    id: 'u1',
    name: 'Carlos Henrique',
    role: 'Gestor de Obras',
    email: 'carlos@construtora.com.br',
    company: 'CH Construtora & Engenharia',
    avatar: 'CH'
  },

  // === CLIENTES ===
  clients: [
    {
      id: 'c1', name: 'Roberto Mendes', company: 'Mendes Incorporações Ltda',
      cpfCnpj: '28.456.123/0001-44', phone: '(11) 99234-5678', whatsapp: '11992345678',
      email: 'roberto@mendesincorp.com.br', city: 'São Paulo',
      address: 'Av. Paulista, 1500, cj 42, São Paulo - SP',
      notes: 'Cliente premium, projetos de alto padrão. Prefere reuniões às terças.', createdAt: '2024-01-10'
    },
    {
      id: 'c2', name: 'Ana Paula Ferreira', company: null,
      cpfCnpj: '389.234.567-90', phone: '(11) 98765-4321', whatsapp: '11987654321',
      email: 'anapaula@gmail.com', city: 'Guarulhos',
      address: 'Rua das Flores, 234, Guarulhos - SP',
      notes: 'Residência de alto padrão. Exige relatórios semanais.', createdAt: '2024-02-15'
    },
    {
      id: 'c3', name: 'Grupo Vitallis', company: 'Vitallis Saúde S/A',
      cpfCnpj: '12.345.678/0001-99', phone: '(11) 3344-5566', whatsapp: '11944556677',
      email: 'obras@vitallis.com.br', city: 'São Paulo',
      address: 'Rua Vergueiro, 3900, São Paulo - SP',
      notes: 'Rede de clínicas. Obras comerciais com prazo rígido.', createdAt: '2024-03-01'
    },
    {
      id: 'c4', name: 'Marcos Augusto Silveira', company: 'Silveira Empreendimentos',
      cpfCnpj: '34.567.890/0001-12', phone: '(11) 97890-1234', whatsapp: '11978901234',
      email: 'marcos@silveiraemprend.com.br', city: 'Campinas',
      address: 'Av. Brasil, 800, Campinas - SP',
      notes: 'Empreendedor. Projetos industriais e galpões.', createdAt: '2024-04-12'
    },
    {
      id: 'c5', name: 'Patricia Rodrigues', company: null,
      cpfCnpj: '456.789.012-34', phone: '(11) 96543-2109', whatsapp: '11965432109',
      email: 'patricia.rodrigues@outlook.com', city: 'Osasco',
      address: 'Rua Amazonas, 56, Osasco - SP',
      notes: 'Reforma residencial.', createdAt: '2024-05-08'
    },
    {
      id: 'c6', name: 'Construtora BM', company: 'BM Construções e Engenharia Ltda',
      cpfCnpj: '56.789.012/0001-45', phone: '(11) 3322-1188', whatsapp: '11944778899',
      email: 'contato@bmconstrucoes.com.br', city: 'Santo André',
      address: 'Av. Industrial, 1200, Santo André - SP',
      notes: 'Parceiro. Subempreitadas.', createdAt: '2024-06-20'
    },
    {
      id: 'c7', name: 'Fernando Castelo', company: 'Castelo Hotéis',
      cpfCnpj: '67.890.123/0001-56', phone: '(11) 3456-7890', whatsapp: '11934567890',
      email: 'obra@castelohoteis.com.br', city: 'São Paulo',
      address: 'Rua Oscar Freire, 890, São Paulo - SP',
      notes: 'Reforma e ampliação de hotel boutique.', createdAt: '2024-07-15'
    },
    {
      id: 'c8', name: 'TechPark Desenvolvimento', company: 'TechPark Dev Imobiliário S/A',
      cpfCnpj: '78.901.234/0001-67', phone: '(11) 4567-8901', whatsapp: '11945678901',
      email: 'projetos@techpark.com.br', city: 'São José dos Campos',
      address: 'Av. Shishima Hifumi, 2500, SJC - SP',
      notes: 'Parque tecnológico. Obra de grande porte.', createdAt: '2024-08-01'
    }
  ],

  // === PROJETOS / OBRAS ===
  projects: [
    {
      id: 'p1', name: 'Residência Alto Padrão - Alphaville',
      clientId: 'c1', responsible: 'Carlos Henrique',
      address: 'Av. Dez de Dezembro, 120', city: 'Barueri',
      category: 'Residencial', status: 'em_andamento',
      contractValue: 820000, receivedValue: 492000, costValue: 410000,
      closedAt: '2024-08-15', startDate: '2024-09-01', endDate: '2025-06-30',
      description: 'Construção de residência unifamiliar de alto padrão com 380m², piscina, área gourmet e paisagismo.',
      paymentMethod: 'Medições mensais', notes: 'Cliente exige qualidade premium em todos os acabamentos.',
      physicalProgress: 68, createdAt: '2024-08-10'
    },
    {
      id: 'p2', name: 'Clínica Médica Vitallis - Unidade Brooklin',
      clientId: 'c3', responsible: 'Diego Almeida',
      address: 'Rua Dr. Renato Paes de Barros, 33', city: 'São Paulo',
      category: 'Comercial', status: 'em_andamento',
      contractValue: 380000, receivedValue: 228000, costValue: 190000,
      closedAt: '2024-09-01', startDate: '2024-10-01', endDate: '2025-02-28',
      description: 'Reforma completa e adequação de clínica médica. 620m², 12 consultórios, recepção, sala de procedimentos.',
      paymentMethod: '3 parcelas fixas + medição final', notes: 'Prazo rígido. Inauguração prevista para março.',
      physicalProgress: 45, createdAt: '2024-09-01'
    },
    {
      id: 'p3', name: 'Galpão Industrial - Campinas',
      clientId: 'c4', responsible: 'Carlos Henrique',
      address: 'Distrito Industrial, Rodovia SP-340, Km 130', city: 'Campinas',
      category: 'Industrial', status: 'em_andamento',
      contractValue: 1250000, receivedValue: 500000, costValue: 625000,
      closedAt: '2024-07-20', startDate: '2024-08-01', endDate: '2025-09-30',
      description: 'Construção de galpão industrial 2.400m² com escritório, vestiários e pátio de manobra.',
      paymentMethod: 'Medições mensais', notes: 'Obra prioritária do cliente.',
      physicalProgress: 35, createdAt: '2024-07-15'
    },
    {
      id: 'p4', name: 'Hotel Boutique - Oscar Freire Reform',
      clientId: 'c7', responsible: 'Fernanda Costa',
      address: 'Rua Oscar Freire, 890', city: 'São Paulo',
      category: 'Hotelaria', status: 'em_andamento',
      contractValue: 950000, receivedValue: 285000, costValue: 380000,
      closedAt: '2024-10-01', startDate: '2025-01-15', endDate: '2025-12-31',
      description: 'Reforma completa de hotel boutique 18 quartos. Lobby, restaurante, rooftop.',
      paymentMethod: 'Medições quinzenais', notes: 'Obra complexa. Hotel em operação parcial durante obras.',
      physicalProgress: 22, createdAt: '2024-09-28'
    },
    {
      id: 'p5', name: 'Residência Ana Paula - Guarulhos',
      clientId: 'c2', responsible: 'Carlos Henrique',
      address: 'Rua das Flores, 234', city: 'Guarulhos',
      category: 'Residencial', status: 'concluida',
      contractValue: 290000, receivedValue: 290000, costValue: 145000,
      closedAt: '2024-04-10', startDate: '2024-05-01', endDate: '2024-11-30',
      description: 'Construção de sobrado 240m², 4 quartos, 3 suítes, piscina.',
      paymentMethod: '4 parcelas', notes: 'Entregue antes do prazo. Cliente satisfeito.',
      physicalProgress: 100, createdAt: '2024-04-05'
    },
    {
      id: 'p6', name: 'Reforma Comercial Patricia - Osasco',
      clientId: 'c5', responsible: 'Diego Almeida',
      address: 'Rua Amazonas, 56', city: 'Osasco',
      category: 'Residencial', status: 'concluida',
      contractValue: 85000, receivedValue: 85000, costValue: 42500,
      closedAt: '2024-06-15', startDate: '2024-07-01', endDate: '2024-09-30',
      description: 'Reforma de apartamento 90m². Cozinha, banheiros, sala.',
      paymentMethod: '2 parcelas', notes: 'Obra simples, rápida execução.',
      physicalProgress: 100, createdAt: '2024-06-10'
    },
    {
      id: 'p7', name: 'TechPark - Fase 1 (Infraestrutura)',
      clientId: 'c8', responsible: 'Carlos Henrique',
      address: 'Av. Shishima Hifumi, 2500', city: 'São José dos Campos',
      category: 'Corporativo', status: 'programada',
      contractValue: 3200000, receivedValue: 320000, costValue: 0,
      closedAt: '2024-11-20', startDate: '2025-03-01', endDate: '2026-06-30',
      description: 'Infraestrutura civil de parque tecnológico. 8.000m² de área construída.',
      paymentMethod: 'Medições mensais com reajuste anual', notes: 'Projeto de grande porte. ART emitida.',
      physicalProgress: 0, createdAt: '2024-11-15'
    },
    {
      id: 'p8', name: 'Expansão BM - Galpão 2',
      clientId: 'c6', responsible: 'Fernanda Costa',
      address: 'Av. Industrial, 1250', city: 'Santo André',
      category: 'Industrial', status: 'programada',
      contractValue: 480000, receivedValue: 48000, costValue: 0,
      closedAt: '2024-12-01', startDate: '2025-02-15', endDate: '2025-08-31',
      description: 'Construção de segundo galpão 900m² ao lado do existente.',
      paymentMethod: 'Medições mensais', notes: 'Continuidade da parceria com BM.',
      physicalProgress: 0, createdAt: '2024-11-28'
    },
    {
      id: 'p9', name: 'Obra Mendes - Torre A',
      clientId: 'c1', responsible: 'Carlos Henrique',
      address: 'Av. das Nações Unidas, 14401', city: 'São Paulo',
      category: 'Residencial', status: 'orcamento',
      contractValue: 2100000, receivedValue: 0, costValue: 0,
      closedAt: null, startDate: '2025-05-01', endDate: '2026-12-31',
      description: 'Torre residencial 18 andares. Pré-lançamento.',
      paymentMethod: 'A definir', notes: 'Orçamento em aprovação pelo board.',
      physicalProgress: 0, createdAt: '2024-12-01'
    },
    {
      id: 'p10', name: 'Manutenção Vitallis - Unidade Centro',
      clientId: 'c3', responsible: 'Diego Almeida',
      address: 'Rua Vergueiro, 3900', city: 'São Paulo',
      category: 'Manutenção', status: 'pausada',
      contractValue: 45000, receivedValue: 22500, costValue: 22500,
      closedAt: '2024-09-15', startDate: '2024-10-15', endDate: '2024-12-15',
      description: 'Manutenção preventiva e corretiva. Pintura, elétrica e hidráulica.',
      paymentMethod: '2 parcelas', notes: 'Pausada aguardando aprovação de escopo adicional.',
      physicalProgress: 50, createdAt: '2024-09-10'
    },
    {
      id: 'p11', name: 'Casa de Praia - Riviera',
      clientId: 'c2', responsible: 'Carlos Henrique',
      address: 'Rua das Gaivotas, 45', city: 'Bertioga',
      category: 'Residencial', status: 'aprovado',
      contractValue: 560000, receivedValue: 56000, costValue: 0,
      closedAt: '2024-12-10', startDate: '2025-02-01', endDate: '2025-10-31',
      description: 'Casa de praia 320m². Estilo contemporâneo, varanda ampla.',
      paymentMethod: 'Medições mensais', notes: 'Contrato assinado. Aguardando início.',
      physicalProgress: 0, createdAt: '2024-12-05'
    },
    {
      id: 'p12', name: 'Reforma escritório BM',
      clientId: 'c6', responsible: 'Diego Almeida',
      address: 'Av. Industrial, 1200', city: 'Santo André',
      category: 'Comercial', status: 'concluida',
      contractValue: 120000, receivedValue: 120000, costValue: 60000,
      closedAt: '2024-03-15', startDate: '2024-04-01', endDate: '2024-07-31',
      description: 'Reforma do setor administrativo. 200m², 8 salas.',
      paymentMethod: '3 parcelas', notes: 'Concluída com sucesso.',
      physicalProgress: 100, createdAt: '2024-03-10'
    },
    {
      id: 'p13', name: 'Ampliação TechPark - Estacionamento',
      clientId: 'c8', responsible: 'Fernanda Costa',
      address: 'Av. Shishima Hifumi, 2500', city: 'São José dos Campos',
      category: 'Infraestrutura', status: 'em_andamento',
      contractValue: 380000, receivedValue: 190000, costValue: 190000,
      closedAt: '2024-10-15', startDate: '2024-11-01', endDate: '2025-04-30',
      description: 'Ampliação do estacionamento. 200 vagas adicionais.',
      paymentMethod: 'Medições mensais', notes: 'Em fase de pavimentação.',
      physicalProgress: 55, createdAt: '2024-10-10'
    },
    {
      id: 'p14', name: 'Castelo Hotel - Rooftop Bar',
      clientId: 'c7', responsible: 'Carlos Henrique',
      address: 'Rua Oscar Freire, 890', city: 'São Paulo',
      category: 'Hotelaria', status: 'concluida',
      contractValue: 180000, receivedValue: 180000, costValue: 90000,
      closedAt: '2024-08-01', startDate: '2024-08-20', endDate: '2024-11-30',
      description: 'Construção de rooftop bar 150m².',
      paymentMethod: '2 parcelas', notes: 'Projeto piloto. Sucesso total.',
      physicalProgress: 100, createdAt: '2024-07-28'
    },
    {
      id: 'p15', name: 'Residência Mendes - Reforma Interna',
      clientId: 'c1', responsible: 'Fernanda Costa',
      address: 'Rua Joaquim Floriano, 560', city: 'São Paulo',
      category: 'Residencial', status: 'em_andamento',
      contractValue: 165000, receivedValue: 82500, costValue: 82500,
      closedAt: '2024-11-10', startDate: '2024-12-01', endDate: '2025-03-31',
      description: 'Reforma interna de apartamento 180m². 3 suítes, cozinha americana, sala integrada.',
      paymentMethod: 'Medições mensais', notes: 'Família morando em hotel durante obra.',
      physicalProgress: 40, createdAt: '2024-11-05'
    }
  ],

  // === MEDIÇÕES ===
  measurements: [
    { id: 'm1', number: 1, projectId: 'p1', period: 'Set/2024', date: '2024-09-30',
      description: 'Fundação e estrutura. Concretagem de pilares e vigas do 1º pavimento.',
      percentage: 15, value: 123000, approvedValue: 123000,
      sentAt: '2024-10-01', approvedAt: '2024-10-05', paymentDue: '2024-10-15', paidAt: '2024-10-14',
      status: 'paga', notes: 'Aprovada sem ressalvas.' },
    { id: 'm2', number: 2, projectId: 'p1', period: 'Out/2024', date: '2024-10-31',
      description: 'Laje do 1º pavimento, alvenaria e contrapisos.',
      percentage: 20, value: 164000, approvedValue: 164000,
      sentAt: '2024-11-01', approvedAt: '2024-11-04', paymentDue: '2024-11-15', paidAt: '2024-11-13',
      status: 'paga', notes: '' },
    { id: 'm3', number: 3, projectId: 'p1', period: 'Nov/2024', date: '2024-11-30',
      description: 'Cobertura, instalações elétricas 1ª fase, instalações hidráulicas.',
      percentage: 18, value: 147600, approvedValue: 147600,
      sentAt: '2024-12-01', approvedAt: '2024-12-03', paymentDue: '2024-12-15', paidAt: '2024-12-14',
      status: 'paga', notes: '' },
    { id: 'm4', number: 4, projectId: 'p1', period: 'Dez/2024', date: '2024-12-31',
      description: 'Reboco externo, contrapiso área molhada, esquadrias de alumínio.',
      percentage: 15, value: 123000, approvedValue: 123000,
      sentAt: '2025-01-02', approvedAt: '2025-01-06', paymentDue: '2025-01-15', paidAt: null,
      status: 'aprovada', notes: 'Aprovada. Aguardando pagamento.' },
    { id: 'm5', number: 5, projectId: 'p1', period: 'Jan/2025', date: '2025-01-31',
      description: 'Revestimentos cerâmicos, instalações elétricas 2ª fase, louças e metais.',
      percentage: 0, value: 98000, approvedValue: null,
      sentAt: '2025-02-01', approvedAt: null, paymentDue: '2025-02-15', paidAt: null,
      status: 'aguardando_aprovacao', notes: '' },

    { id: 'm6', number: 1, projectId: 'p2', period: 'Out/2024', date: '2024-10-31',
      description: 'Demolições, estrutura metálica e instalações prediais 1ª fase.',
      percentage: 25, value: 95000, approvedValue: 95000,
      sentAt: '2024-11-01', approvedAt: '2024-11-05', paymentDue: '2024-11-20', paidAt: '2024-11-19',
      status: 'paga', notes: '' },
    { id: 'm7', number: 2, projectId: 'p2', period: 'Nov/2024', date: '2024-11-30',
      description: 'Drywall, forro de gesso, piso elevado, instalações de climatização.',
      percentage: 20, value: 76000, approvedValue: 76000,
      sentAt: '2024-12-02', approvedAt: '2024-12-08', paymentDue: '2024-12-20', paidAt: null,
      status: 'aprovada', notes: 'Aguardando pagamento. Vence em 20/12.' },
    { id: 'm8', number: 3, projectId: 'p2', period: 'Dez/2024', date: '2024-12-31',
      description: 'Revestimentos, louças, metais e pintura das salas.',
      percentage: 0, value: 57000, approvedValue: null,
      sentAt: null, approvedAt: null, paymentDue: null, paidAt: null,
      status: 'em_elaboracao', notes: 'Em elaboração pelo engenheiro.' },

    { id: 'm9', number: 1, projectId: 'p3', period: 'Ago/2024', date: '2024-08-31',
      description: 'Terraplanagem, fundações em estaca, infraestrutura elétrica.',
      percentage: 12, value: 150000, approvedValue: 150000,
      sentAt: '2024-09-02', approvedAt: '2024-09-08', paymentDue: '2024-09-20', paidAt: '2024-09-18',
      status: 'paga', notes: '' },
    { id: 'm10', number: 2, projectId: 'p3', period: 'Set/2024', date: '2024-09-30',
      description: 'Estrutura metálica da nave principal, 60% concluída.',
      percentage: 13, value: 162500, approvedValue: 162500,
      sentAt: '2024-10-01', approvedAt: '2024-10-10', paymentDue: '2024-10-25', paidAt: '2024-10-22',
      status: 'paga', notes: '' },
    { id: 'm11', number: 3, projectId: 'p3', period: 'Out/2024', date: '2024-10-31',
      description: 'Cobertura metálica, fechamento lateral, calhas e rufos.',
      percentage: 10, value: 125000, approvedValue: null,
      sentAt: '2024-11-04', approvedAt: null, paymentDue: '2024-11-20', paidAt: null,
      status: 'enviada', notes: 'Enviada ao cliente. Aguardando retorno há 12 dias.' },

    { id: 'm12', number: 1, projectId: 'p13', period: 'Nov/2024', date: '2024-11-30',
      description: 'Terraplenagem e drenagem da área.',
      percentage: 20, value: 76000, approvedValue: 76000,
      sentAt: '2024-12-02', approvedAt: '2024-12-05', paymentDue: '2024-12-20', paidAt: '2024-12-18',
      status: 'paga', notes: '' },
    { id: 'm13', number: 2, projectId: 'p13', period: 'Dez/2024', date: '2024-12-31',
      description: 'Base e sub-base do estacionamento, 50% executada.',
      percentage: 20, value: 76000, approvedValue: null,
      sentAt: '2025-01-03', approvedAt: null, paymentDue: '2025-01-20', paidAt: null,
      status: 'aguardando_aprovacao', notes: '' },

    { id: 'm14', number: 1, projectId: 'p4', period: 'Jan/2025', date: '2025-01-31',
      description: 'Demolições internas e proteções para área de hotel em operação.',
      percentage: 10, value: 95000, approvedValue: null,
      sentAt: '2025-02-01', approvedAt: null, paymentDue: '2025-02-15', paidAt: null,
      status: 'aguardando_aprovacao', notes: '' },

    { id: 'm15', number: 1, projectId: 'p15', period: 'Dez/2024', date: '2024-12-31',
      description: 'Demolições, instalações elétricas 1ª fase, estrutura drywall.',
      percentage: 25, value: 41250, approvedValue: 41250,
      sentAt: '2025-01-02', approvedAt: '2025-01-05', paymentDue: '2025-01-15', paidAt: '2025-01-14',
      status: 'paga', notes: '' }
  ],

  // === ORÇAMENTOS ===
  budgets: [
    {
      id: 'b1', number: 'ORC-2024-031', clientId: 'c1', projectName: 'Torre Residencial A',
      createdAt: '2024-11-15', validUntil: '2025-01-15',
      services: 'Construção civil completa, estrutura, vedação, cobertura, acabamentos internos e externos',
      materials: 980000, labor: 840000, discount: 0, value: 1820000, finalValue: 1820000,
      description: 'Torre de 18 andares. 72 apartamentos de 85m².',
      notes: 'Proposta técnica e comercial detalhada enviada.',
      status: 'aguardando_resposta', sentAt: '2024-11-16', respondedAt: null
    },
    {
      id: 'b2', number: 'ORC-2024-028', clientId: 'c8', projectName: 'TechPark Fase 1',
      createdAt: '2024-10-20', validUntil: '2024-12-20',
      services: 'Infraestrutura civil completa. Fundação, estrutura, vedação.',
      materials: 1500000, labor: 1200000, discount: 150000, value: 2700000, finalValue: 2550000,
      description: 'Parque tecnológico — Fase 1 de 3.',
      notes: 'Desconto negociado de R$150k para fechamento de todas as fases.',
      status: 'aprovado', sentAt: '2024-10-22', respondedAt: '2024-11-20'
    },
    {
      id: 'b3', number: 'ORC-2024-025', clientId: 'c2', projectName: 'Casa de Praia Riviera',
      createdAt: '2024-10-01', validUntil: '2024-12-01',
      services: 'Construção de residência 320m².',
      materials: 260000, labor: 220000, discount: 20000, value: 480000, finalValue: 560000,
      description: 'Casa de praia contemporânea.',
      notes: 'Cliente aprovou após visita à obra da Alphaville.',
      status: 'aprovado', sentAt: '2024-10-05', respondedAt: '2024-12-10'
    },
    {
      id: 'b4', number: 'ORC-2024-033', clientId: 'c3', projectName: 'Vitallis - Unidade Ipiranga',
      createdAt: '2024-12-01', validUntil: '2025-02-01',
      services: 'Reforma e adequação de clínica médica. 450m².',
      materials: 180000, labor: 120000, discount: 0, value: 300000, finalValue: 300000,
      description: '3ª unidade da rede Vitallis.',
      notes: 'Enviado para aprovação da diretoria.',
      status: 'enviado', sentAt: '2024-12-05', respondedAt: null
    },
    {
      id: 'b5', number: 'ORC-2024-029', clientId: 'c4', projectName: 'Galpão Industrial - Fase 2',
      createdAt: '2024-11-01', validUntil: '2025-01-01',
      services: 'Construção galpão 1800m² (expansão).',
      materials: 600000, labor: 400000, discount: 0, value: 1000000, finalValue: 1000000,
      description: 'Ampliação do galpão existente.',
      notes: 'Cliente ainda em análise de viabilidade.',
      status: 'aguardando_resposta', sentAt: '2024-11-05', respondedAt: null
    },
    {
      id: 'b6', number: 'ORC-2024-022', clientId: 'c5', projectName: 'Novo Apartamento Osasco',
      createdAt: '2024-09-10', validUntil: '2024-11-10',
      services: 'Reforma completa de apartamento 110m².',
      materials: 75000, labor: 45000, discount: 5000, value: 120000, finalValue: 115000,
      description: 'Reforma total. Cozinha, banheiros, sala, quartos.',
      notes: 'Cliente escolheu outra empresa. Preço.',
      status: 'recusado', sentAt: '2024-09-12', respondedAt: '2024-10-15'
    },
    {
      id: 'b7', number: 'ORC-2024-034', clientId: 'c7', projectName: 'Hotel - Reforma Quartos',
      createdAt: '2024-12-05', validUntil: '2025-02-05',
      services: 'Reforma dos 18 quartos do hotel.',
      materials: 350000, labor: 180000, discount: 0, value: 530000, finalValue: 530000,
      description: 'Reforma completa de interiores.',
      notes: 'Proposta enviada junto ao projeto de arquitetura.',
      status: 'aguardando_resposta', sentAt: '2024-12-08', respondedAt: null
    },
    {
      id: 'b8', number: 'ORC-2024-035', clientId: 'c6', projectName: 'BM - Almoxarifado',
      createdAt: '2024-12-10', validUntil: '2025-02-10',
      services: 'Construção de almoxarifado 300m².',
      materials: 120000, labor: 80000, discount: 0, value: 200000, finalValue: 200000,
      description: 'Galpão de armazenagem com escritório.',
      notes: 'Rascunho. Ainda revisando material.',
      status: 'rascunho', sentAt: null, respondedAt: null
    },
    {
      id: 'b9', number: 'ORC-2024-020', clientId: 'c1', projectName: 'Mendes - Piscina e Área Gourmet',
      createdAt: '2024-08-20', validUntil: '2024-10-20',
      services: 'Construção de piscina aquecida e área gourmet 60m².',
      materials: 90000, labor: 60000, discount: 0, value: 150000, finalValue: 150000,
      description: 'Complemento à residência principal.',
      notes: 'Aprovado e já incorporado ao contrato principal.',
      status: 'aprovado', sentAt: '2024-08-22', respondedAt: '2024-09-01'
    },
    {
      id: 'b10', number: 'ORC-2024-015', clientId: 'c2', projectName: 'Guarulhos - Garagem Ampliada',
      createdAt: '2024-06-20', validUntil: '2024-08-20',
      services: 'Ampliação de garagem para 3 vagas e depósito.',
      materials: 35000, labor: 25000, discount: 0, value: 60000, finalValue: 60000,
      description: 'Reforma e ampliação da garagem.',
      notes: 'Prazo expirado.',
      status: 'expirado', sentAt: '2024-06-25', respondedAt: null
    },
    {
      id: 'b11', number: 'ORC-2024-036', clientId: 'c8', projectName: 'TechPark Fase 2 (Preliminar)',
      createdAt: '2024-12-15', validUntil: '2025-03-15',
      services: 'Construção dos blocos A e B do parque tecnológico.',
      materials: 2000000, labor: 1500000, discount: 200000, value: 3500000, finalValue: 3300000,
      description: 'Fase 2 do TechPark. Blocos A e B com 12.000m².',
      notes: 'Rascunho inicial.',
      status: 'rascunho', sentAt: null, respondedAt: null
    },
    {
      id: 'b12', number: 'ORC-2024-030', clientId: 'c3', projectName: 'Vitallis - Manutenção Anual',
      createdAt: '2024-11-10', validUntil: '2025-01-10',
      services: 'Contrato de manutenção anual de 3 unidades.',
      materials: 60000, labor: 90000, discount: 10000, value: 150000, finalValue: 140000,
      description: 'Manutenção preventiva e corretiva das 3 unidades.',
      notes: 'Cliente quer fechar pacote anual.',
      status: 'aguardando_resposta', sentAt: '2024-11-12', respondedAt: null
    }
  ],

  // === TRANSAÇÕES FINANCEIRAS ===
  financial: [
    // P1 - Alphaville
    { id: 'f1', projectId: 'p1', clientId: 'c1', description: '1ª Medição', value: 123000, date: '2024-10-01', dueDate: '2024-10-15', paidAt: '2024-10-14', type: 'receita', situation: 'recebido', paymentMethod: 'Transferência', notes: '' },
    { id: 'f2', projectId: 'p1', clientId: 'c1', description: '2ª Medição', value: 164000, date: '2024-11-01', dueDate: '2024-11-15', paidAt: '2024-11-13', type: 'receita', situation: 'recebido', paymentMethod: 'Transferência', notes: '' },
    { id: 'f3', projectId: 'p1', clientId: 'c1', description: '3ª Medição', value: 147600, date: '2024-12-01', dueDate: '2024-12-15', paidAt: '2024-12-14', type: 'receita', situation: 'recebido', paymentMethod: 'Transferência', notes: '' },
    { id: 'f4', projectId: 'p1', clientId: 'c1', description: '4ª Medição', value: 123000, date: '2025-01-02', dueDate: '2025-01-15', paidAt: null, type: 'receita', situation: 'a_receber', paymentMethod: 'Transferência', notes: 'Aprovada. Aguardando liberação.' },
    { id: 'f5', projectId: 'p1', clientId: 'c1', description: '5ª Medição (prevista)', value: 98000, date: '2025-02-01', dueDate: '2025-02-15', paidAt: null, type: 'receita', situation: 'previsto', paymentMethod: 'Transferência', notes: '' },
    // P2 - Clínica
    { id: 'f6', projectId: 'p2', clientId: 'c3', description: '1ª Medição', value: 95000, date: '2024-11-01', dueDate: '2024-11-20', paidAt: '2024-11-19', type: 'receita', situation: 'recebido', paymentMethod: 'Transferência', notes: '' },
    { id: 'f7', projectId: 'p2', clientId: 'c3', description: '2ª Medição', value: 76000, date: '2024-12-02', dueDate: '2024-12-20', paidAt: null, type: 'receita', situation: 'atrasado', paymentMethod: 'Boleto', notes: 'Vencido há 5 dias!' },
    { id: 'f8', projectId: 'p2', clientId: 'c3', description: '3ª Medição (prevista)', value: 57000, date: '2025-01-15', dueDate: '2025-01-30', paidAt: null, type: 'receita', situation: 'previsto', paymentMethod: 'Transferência', notes: '' },
    // P3 - Galpão
    { id: 'f9', projectId: 'p3', clientId: 'c4', description: '1ª Medição', value: 150000, date: '2024-09-02', dueDate: '2024-09-20', paidAt: '2024-09-18', type: 'receita', situation: 'recebido', paymentMethod: 'Transferência', notes: '' },
    { id: 'f10', projectId: 'p3', clientId: 'c4', description: '2ª Medição', value: 162500, date: '2024-10-01', dueDate: '2024-10-25', paidAt: '2024-10-22', type: 'receita', situation: 'recebido', paymentMethod: 'Transferência', notes: '' },
    { id: 'f11', projectId: 'p3', clientId: 'c4', description: '3ª Medição', value: 125000, date: '2024-11-04', dueDate: '2024-11-20', paidAt: null, type: 'receita', situation: 'atrasado', paymentMethod: 'Transferência', notes: 'Aguardando aprovação da medição.' },
    // P4 - Hotel
    { id: 'f12', projectId: 'p4', clientId: 'c7', description: 'Sinal de contrato (30%)', value: 285000, date: '2024-10-05', dueDate: '2024-10-10', paidAt: '2024-10-08', type: 'receita', situation: 'recebido', paymentMethod: 'Transferência', notes: '' },
    // P5 - Ana Paula (concluída)
    { id: 'f13', projectId: 'p5', clientId: 'c2', description: '1ª Parcela', value: 72500, date: '2024-05-01', dueDate: '2024-05-10', paidAt: '2024-05-09', type: 'receita', situation: 'recebido', paymentMethod: 'Transferência', notes: '' },
    { id: 'f14', projectId: 'p5', clientId: 'c2', description: '2ª Parcela', value: 72500, date: '2024-07-01', dueDate: '2024-07-15', paidAt: '2024-07-12', type: 'receita', situation: 'recebido', paymentMethod: 'Transferência', notes: '' },
    { id: 'f15', projectId: 'p5', clientId: 'c2', description: '3ª Parcela', value: 72500, date: '2024-09-01', dueDate: '2024-09-15', paidAt: '2024-09-13', type: 'receita', situation: 'recebido', paymentMethod: 'Transferência', notes: '' },
    { id: 'f16', projectId: 'p5', clientId: 'c2', description: '4ª Parcela (final)', value: 72500, date: '2024-11-01', dueDate: '2024-11-30', paidAt: '2024-11-28', type: 'receita', situation: 'recebido', paymentMethod: 'Transferência', notes: '' },
    // P7 - TechPark Fase 1
    { id: 'f17', projectId: 'p7', clientId: 'c8', description: 'Sinal de contrato (10%)', value: 320000, date: '2024-11-25', dueDate: '2024-11-30', paidAt: '2024-11-28', type: 'receita', situation: 'recebido', paymentMethod: 'Transferência', notes: '' },
    // P13 - TechPark Estacionamento
    { id: 'f18', projectId: 'p13', clientId: 'c8', description: '1ª Medição', value: 76000, date: '2024-12-02', dueDate: '2024-12-20', paidAt: '2024-12-18', type: 'receita', situation: 'recebido', paymentMethod: 'Transferência', notes: '' },
    { id: 'f19', projectId: 'p13', clientId: 'c8', description: '2ª Medição', value: 76000, date: '2025-01-03', dueDate: '2025-01-20', paidAt: null, type: 'receita', situation: 'a_receber', paymentMethod: 'Transferência', notes: '' },
    // P14 - Rooftop (concluída)
    { id: 'f20', projectId: 'p14', clientId: 'c7', description: '1ª Parcela', value: 90000, date: '2024-08-25', dueDate: '2024-09-01', paidAt: '2024-08-30', type: 'receita', situation: 'recebido', paymentMethod: 'Transferência', notes: '' },
    { id: 'f21', projectId: 'p14', clientId: 'c7', description: '2ª Parcela (final)', value: 90000, date: '2024-12-01', dueDate: '2024-12-10', paidAt: '2024-12-05', type: 'receita', situation: 'recebido', paymentMethod: 'Transferência', notes: '' },
    // P15 - Reforma Mendes
    { id: 'f22', projectId: 'p15', clientId: 'c1', description: '1ª Medição', value: 41250, date: '2025-01-02', dueDate: '2025-01-15', paidAt: '2025-01-14', type: 'receita', situation: 'recebido', paymentMethod: 'Transferência', notes: '' },
    { id: 'f23', projectId: 'p15', clientId: 'c1', description: '2ª Medição (prevista)', value: 41250, date: '2025-02-01', dueDate: '2025-02-15', paidAt: null, type: 'receita', situation: 'previsto', paymentMethod: 'Transferência', notes: '' },
    // P11 - Casa de Praia
    { id: 'f24', projectId: 'p11', clientId: 'c2', description: 'Sinal de contrato (10%)', value: 56000, date: '2024-12-15', dueDate: '2024-12-20', paidAt: '2024-12-18', type: 'receita', situation: 'recebido', paymentMethod: 'Transferência', notes: '' },
    // P8 - BM Galpão 2
    { id: 'f25', projectId: 'p8', clientId: 'c6', description: 'Sinal (10%)', value: 48000, date: '2024-12-05', dueDate: '2024-12-10', paidAt: '2024-12-09', type: 'receita', situation: 'recebido', paymentMethod: 'Transferência', notes: '' },
    // P10 - Manutenção Vitallis
    { id: 'f26', projectId: 'p10', clientId: 'c3', description: '1ª Parcela', value: 22500, date: '2024-10-20', dueDate: '2024-10-25', paidAt: '2024-10-24', type: 'receita', situation: 'recebido', paymentMethod: 'Boleto', notes: '' },
    // P6 - Reforma Patricia (concluída)
    { id: 'f27', projectId: 'p6', clientId: 'c5', description: '1ª Parcela', value: 42500, date: '2024-07-05', dueDate: '2024-07-15', paidAt: '2024-07-14', type: 'receita', situation: 'recebido', paymentMethod: 'PIX', notes: '' },
    { id: 'f28', projectId: 'p6', clientId: 'c5', description: '2ª Parcela (final)', value: 42500, date: '2024-09-20', dueDate: '2024-09-30', paidAt: '2024-09-28', type: 'receita', situation: 'recebido', paymentMethod: 'PIX', notes: '' },
    // P12 - Reforma BM (concluída)
    { id: 'f29', projectId: 'p12', clientId: 'c6', description: '1ª Parcela', value: 40000, date: '2024-04-05', dueDate: '2024-04-15', paidAt: '2024-04-12', type: 'receita', situation: 'recebido', paymentMethod: 'Transferência', notes: '' },
    { id: 'f30', projectId: 'p12', clientId: 'c6', description: '2ª Parcela', value: 40000, date: '2024-06-01', dueDate: '2024-06-15', paidAt: '2024-06-13', type: 'receita', situation: 'recebido', paymentMethod: 'Transferência', notes: '' },
    { id: 'f31', projectId: 'p12', clientId: 'c6', description: '3ª Parcela (final)', value: 40000, date: '2024-08-01', dueDate: '2024-08-15', paidAt: '2024-08-12', type: 'receita', situation: 'recebido', paymentMethod: 'Transferência', notes: '' }
  ],

  // === NOTIFICAÇÕES ===
  notifications: [
    { id: 'n1', type: 'payment_overdue', projectId: 'p2', read: false, createdAt: '2025-01-09',
      title: 'Pagamento Vencido', message: 'Medição #2 da Clínica Vitallis Brooklin está vencida há 5 dias. Valor: R$ 76.000', priority: 'high' },
    { id: 'n2', type: 'measurement_pending', projectId: 'p3', read: false, createdAt: '2025-01-08',
      title: 'Medição Aguardando Aprovação', message: 'Medição #3 do Galpão Industrial (Campinas) enviada há 12 dias sem retorno. Valor: R$ 125.000', priority: 'high' },
    { id: 'n3', type: 'budget_expiring', projectId: null, budgetId: 'b1', read: false, createdAt: '2025-01-07',
      title: 'Orçamento Próximo do Vencimento', message: 'ORC-2024-031 (Torre Residencial A - Mendes) vence em 8 dias. Valor: R$ 1.820.000', priority: 'medium' },
    { id: 'n4', type: 'payment_overdue', projectId: 'p3', read: false, createdAt: '2025-01-09',
      title: 'Medição em Atraso', message: 'Medição #3 do Galpão Industrial está com pagamento em atraso. Valor: R$ 125.000', priority: 'high' },
    { id: 'n5', type: 'project_starting', projectId: 'p8', read: false, createdAt: '2025-01-05',
      title: 'Obra Começa em Breve', message: 'BM Galpão 2 inicia em 05/02. Faltam 26 dias. Confirme equipe e materiais.', priority: 'medium' },
    { id: 'n6', type: 'budget_no_response', budgetId: 'b5', read: true, createdAt: '2025-01-03',
      title: 'Orçamento sem Resposta', message: 'ORC-2024-029 (Galpão Fase 2 - Silveira) enviado há 65 dias sem resposta.', priority: 'low' },
    { id: 'n7', type: 'project_starting', projectId: 'p7', read: true, createdAt: '2025-01-02',
      title: 'Grande Obra em 50 dias', message: 'TechPark Fase 1 inicia em 01/03. Mobilize equipe e equipamentos.', priority: 'medium' },
    { id: 'n8', type: 'measurement_due', projectId: 'p2', read: false, createdAt: '2025-01-09',
      title: 'Elaborar Medição', message: 'Medição #3 da Clínica Vitallis (Dez/2024) ainda em elaboração. Agilize envio.', priority: 'medium' },
    { id: 'n9', type: 'project_deadline', projectId: 'p2', read: false, createdAt: '2025-01-08',
      title: 'Prazo Próximo da Obra', message: 'Clínica Vitallis Brooklin: previsão de conclusão em 28/02 (49 dias). Fique atento ao cronograma.', priority: 'medium' },
    { id: 'n10', type: 'budget_expiring', budgetId: 'b5', read: true, createdAt: '2024-12-20',
      title: 'Orçamento Expira', message: 'ORC-2024-029 vence em 01/01/2025. Renove ou entre em contato com Silveira.', priority: 'medium' }
  ],

  // === PEDIDOS / MATERIAIS (ALMOXARIFADO) ===
  orders: [
    { id: 'o1', projectId: 'p1', item: 'Cimento CP II 50kg', sku: 'CIM-CPII-50', unit: 'sc', quantity: 400, delivered: 400,
      unitValue: 32, supplier: 'Votorantim Materiais', expectedDate: '2024-12-10', notes: 'Entrega em 2 lotes.', createdAt: '2024-11-20' },
    { id: 'o2', projectId: 'p1', item: 'Aço CA-50 10mm', sku: 'ACO-CA50-10', unit: 'barra', quantity: 600, delivered: 350,
      unitValue: 48, supplier: 'Gerdau Comercial', expectedDate: '2025-01-20', notes: '', createdAt: '2024-12-15' },
    { id: 'o3', projectId: 'p1', item: 'Tijolo Cerâmico 9 furos', sku: 'TIJ-9F', unit: 'milheiro', quantity: 30, delivered: 0,
      unitValue: 780, supplier: 'Cerâmica São José', expectedDate: '2025-01-05', notes: 'Confirmar acesso de caminhão munck.', createdAt: '2024-12-20' },
    { id: 'o4', projectId: 'p2', item: 'Placa de Drywall 12,5mm', sku: 'DRY-125', unit: 'un', quantity: 250, delivered: 250,
      unitValue: 45, supplier: 'Knauf Distribuidora', expectedDate: '2024-12-01', notes: '', createdAt: '2024-11-10' },
    { id: 'o5', projectId: 'p2', item: 'Piso Porcelanato 80x80', sku: 'POR-8080-CZ', unit: 'm²', quantity: 620, delivered: 200,
      unitValue: 89, supplier: 'Portobello Shop', expectedDate: '2025-01-08', notes: 'Cor cinza grafite, lote único.', createdAt: '2024-12-18' },
    { id: 'o6', projectId: 'p3', item: 'Telha Metálica Trapezoidal', sku: 'TEL-TRAP-05', unit: 'm²', quantity: 2500, delivered: 2500,
      unitValue: 62, supplier: 'Metform Coberturas', expectedDate: '2024-11-25', notes: '', createdAt: '2024-11-01' },
    { id: 'o7', projectId: 'p3', item: 'Estrutura Metálica Galpão', sku: 'EST-MET-G2', unit: 'ton', quantity: 45, delivered: 0,
      unitValue: 8900, supplier: 'Metálica Industrial SP', expectedDate: '2025-01-06', notes: 'Pedido crítico — atrasado com fornecedor.', createdAt: '2024-12-01' },
    { id: 'o8', projectId: 'p4', item: 'Louças e Metais (kit banheiro)', sku: 'KIT-LM-STD', unit: 'kit', quantity: 18, delivered: 6,
      unitValue: 1450, supplier: 'Deca Distribuidora', expectedDate: '2025-01-15', notes: '18 quartos do hotel.', createdAt: '2024-12-22' },
    { id: 'o9', projectId: 'p13', item: 'Brita 1', sku: 'BRI-1', unit: 'm³', quantity: 180, delivered: 90,
      unitValue: 95, supplier: 'Pedreira Santa Rita', expectedDate: '2024-12-28', notes: '', createdAt: '2024-12-10' },
    { id: 'o10', projectId: 'p15', item: 'Fiação Elétrica 2,5mm', sku: 'FIO-25MM', unit: 'rolo', quantity: 40, delivered: 40,
      unitValue: 210, supplier: 'Prysmian Cabos', expectedDate: '2024-12-05', notes: '', createdAt: '2024-11-25' }
  ],

  // === RECEBIMENTOS DE MATERIAIS (LOG IMUTÁVEL) ===
  order_receipts: [
    { id: 'r1', orderId: 'o1', projectId: 'p1', item: 'Cimento CP II 50kg', quantity: 200, invoiceNumber: 'NF-88213', photoName: null,
      notes: '1º lote, sem avarias.', receivedBy: 'Carlos Henrique', balanceAfter: 200, receivedAt: '2024-12-08', createdAt: '2024-12-08' },
    { id: 'r2', orderId: 'o1', projectId: 'p1', item: 'Cimento CP II 50kg', quantity: 200, invoiceNumber: 'NF-88450', photoName: 'nf-88450.jpg',
      notes: '2º lote, entrega completa.', receivedBy: 'Zeca Ferreira', balanceAfter: 0, receivedAt: '2024-12-10', createdAt: '2024-12-10' },
    { id: 'r3', orderId: 'o2', projectId: 'p1', item: 'Aço CA-50 10mm', quantity: 350, invoiceNumber: 'NF-91002', photoName: 'nf-91002.jpg',
      notes: 'Entrega parcial, restante previsto p/ 20/01.', receivedBy: 'Zeca Ferreira', balanceAfter: 250, receivedAt: '2024-12-30', createdAt: '2024-12-30' },
    { id: 'r4', orderId: 'o4', projectId: 'p2', item: 'Placa de Drywall 12,5mm', quantity: 250, invoiceNumber: 'NF-77112', photoName: null,
      notes: 'Entrega total, conferido em obra.', receivedBy: 'Carlos Henrique', balanceAfter: 0, receivedAt: '2024-11-30', createdAt: '2024-11-30' },
    { id: 'r5', orderId: 'o5', projectId: 'p2', item: 'Piso Porcelanato 80x80', quantity: 200, invoiceNumber: 'NF-90887', photoName: 'nf-90887.jpg',
      notes: '1º lote recebido.', receivedBy: 'Zeca Ferreira', balanceAfter: 420, receivedAt: '2024-12-27', createdAt: '2024-12-27' },
    { id: 'r6', orderId: 'o6', projectId: 'p3', item: 'Telha Metálica Trapezoidal', quantity: 2500, invoiceNumber: 'NF-65321', photoName: null,
      notes: 'Entrega total.', receivedBy: 'Diego Almeida', balanceAfter: 0, receivedAt: '2024-11-24', createdAt: '2024-11-24' },
    { id: 'r7', orderId: 'o8', projectId: 'p4', item: 'Louças e Metais (kit banheiro)', quantity: 6, invoiceNumber: 'NF-95500', photoName: 'nf-95500.jpg',
      notes: 'Primeira remessa, 6 kits.', receivedBy: 'Zeca Ferreira', balanceAfter: 12, receivedAt: '2025-01-02', createdAt: '2025-01-02' },
    { id: 'r8', orderId: 'o9', projectId: 'p13', item: 'Brita 1', quantity: 90, invoiceNumber: 'NF-70044', photoName: null,
      notes: 'Metade do pedido entregue.', receivedBy: 'Zeca Ferreira', balanceAfter: 90, receivedAt: '2024-12-26', createdAt: '2024-12-26' },
    { id: 'r9', orderId: 'o10', projectId: 'p15', item: 'Fiação Elétrica 2,5mm', quantity: 40, invoiceNumber: 'NF-66210', photoName: null,
      notes: 'Entrega total.', receivedBy: 'Carlos Henrique', balanceAfter: 0, receivedAt: '2024-12-04', createdAt: '2024-12-04' }
  ],

  // === HISTÓRICO DE STATUS ===
  statusHistory: [
    { id: 'sh1', projectId: 'p1', status: 'orcamento', changedAt: '2024-08-10', notes: 'Proposta elaborada.' },
    { id: 'sh2', projectId: 'p1', status: 'aprovado', changedAt: '2024-08-15', notes: 'Cliente aprovou escopo e valores.' },
    { id: 'sh3', projectId: 'p1', status: 'em_andamento', changedAt: '2024-09-01', notes: 'Mobilização e início das obras.' }
  ]
};

// Dados de faturamento mensal (últimos 12 meses para gráficos)
const MONTHLY_REVENUE = [
  { month: 'Feb/24', previsto: 120000, realizado: 115000 },
  { month: 'Mar/24', previsto: 180000, realizado: 168000 },
  { month: 'Abr/24', previsto: 200000, realizado: 212000 },
  { month: 'Mai/24', previsto: 250000, realizado: 238000 },
  { month: 'Jun/24', previsto: 280000, realizado: 271000 },
  { month: 'Jul/24', previsto: 320000, realizado: 315000 },
  { month: 'Ago/24', previsto: 380000, realizado: 398000 },
  { month: 'Set/24', previsto: 420000, realizado: 411000 },
  { month: 'Out/24', previsto: 460000, realizado: 488000 },
  { month: 'Nov/24', previsto: 490000, realizado: 475000 },
  { month: 'Dez/24', previsto: 520000, realizado: 543000 },
  { month: 'Jan/25', previsto: 486000, realizado: 164250 }
];

// Formatadores
// Dados da sua empresa — aparecem no cabeçalho dos PDFs (Orçamento e
// Medição). Edite os valores abaixo pra atualizar em todos os documentos.
const COMPANY_INFO = {
  name: '',      // Ex: 'Construtora Exemplo Ltda'
  cnpj: '',      // Ex: '12.345.678/0001-90'
  address: '',   // Ex: 'Rua das Obras, 100 - São Paulo/SP'
  contact: ''    // Ex: '(11) 99999-9999 • contato@empresa.com.br'
};

const fmt = {
  currency: (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v || 0),
  currencyFull: (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0),
  date: (d) => {
    if (!d) return '—';
    const [y, m, day] = String(d).slice(0, 10).split('-');
    return `${day}/${m}/${y}`;
  },
  dateShort: (d) => {
    if (!d) return '—';
    const [y, m, day] = String(d).slice(0, 10).split('-');
    return `${day}/${m}/${String(y).slice(2)}`;
  },
  percent: (v) => `${(v || 0).toFixed(1)}%`,
  number: (v) => new Intl.NumberFormat('pt-BR').format(v || 0)
};
