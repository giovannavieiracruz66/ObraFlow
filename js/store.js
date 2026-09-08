// ==========================================
// OBRAFLOW — STORE (Estado Global)
// Fonte de verdade: Supabase (Postgres). Mantemos um cache local em memória
// (camelCase, igual ao antigo MOCK_DATA) para que todas as telas continuem
// lendo os dados de forma síncrona, sem precisar reescrever cada página.
// Escritas (add/update/remove) atualizam o cache na hora (otimista) e
// gravam no Supabase em segundo plano.
// ==========================================

const Store = (() => {
  const TABLES = ['clients', 'projects', 'measurements', 'budgets', 'financial', 'orders', 'order_receipts', 'notifications'];
  let cache = {};

  function camelize(str) { return str.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase()); }
  function snakeize(str) { return str.replace(/[A-Z]/g, c => '_' + c.toLowerCase()); }

  function rowToCamel(row) {
    const obj = {};
    for (const k in row) obj[camelize(k)] = row[k];
    return obj;
  }
  function objToSnake(obj) {
    const row = {};
    for (const k in obj) row[snakeize(k)] = obj[k];
    return row;
  }

  // Carrega todas as tabelas do Supabase para o cache local.
  async function init() {
    const next = {};
    for (const table of TABLES) {
      const { data, error } = await sb.from(table).select('*');
      if (error) {
        console.error(`Erro ao carregar "${table}":`, error.message);
        next[table] = [];
        continue;
      }
      next[table] = (data || []).map(rowToCamel);
    }
    cache = next;
  }

  function getAll() { return cache; }

  // === GENERICS ===
  function getList(entity) { return cache[entity] || []; }
  function getById(entity, id) { return getList(entity).find(i => i.id === id); }

  function add(entity, item) {
    const id = makeUUID();
    const localItem = { ...item, id, createdAt: new Date().toISOString().split('T')[0] };
    cache[entity] = [...getList(entity), localItem];

    (async () => {
      const { error } = await sb.from(entity).insert(objToSnake({ ...item, id }));
      if (error) {
        console.error(`Erro ao inserir em "${entity}":`, error.message);
        Toast.error('Erro ao salvar no banco', error.message);
        cache[entity] = getList(entity).filter(i => i.id !== id);
        if (window.rerender) window.rerender();
      }
    })();

    return localItem;
  }

  function update(entity, id, changes) {
    cache[entity] = getList(entity).map(i => i.id === id ? { ...i, ...changes } : i);

    (async () => {
      const { error } = await sb.from(entity).update(objToSnake(changes)).eq('id', id);
      if (error) {
        console.error(`Erro ao atualizar "${entity}"/${id}:`, error.message);
        Toast.error('Erro ao salvar no banco', error.message);
      }
    })();
  }

  function remove(entity, id) {
    const previous = getList(entity);
    cache[entity] = previous.filter(i => i.id !== id);

    (async () => {
      const { error } = await sb.from(entity).delete().eq('id', id);
      if (error) {
        console.error(`Erro ao excluir de "${entity}"/${id}:`, error.message);
        Toast.error('Erro ao excluir no banco', error.message);
        cache[entity] = previous;
        if (window.rerender) window.rerender();
      }
    })();
  }

  // === PERFIL DE ACESSO (vem do login real via Supabase Auth) ===
  const ROLE_LABELS = {
    admin: 'Administrador',
    gestor: 'Gestor de Obras',
    portaria: 'Portaria',
    diretoria: 'Diretoria',
    gestor_contratos: 'Gestor de Contratos',
    gestor_orcamentos: 'Gestor de Orçamentos',
    financeiro: 'Financeiro'
  };

  function getRole() {
    const p = typeof Auth !== 'undefined' ? Auth.getProfile() : null;
    return (p && p.role) || 'gestor';
  }

  function getRoleLabels() {
    return ROLE_LABELS;
  }

  function getRoleMeta() {
    const p = typeof Auth !== 'undefined' ? Auth.getProfile() : null;
    if (!p) return { name: 'Usuário', roleLabel: 'Usuário', avatar: '?', color: '#94a3b8' };
    return {
      name: p.name,
      roleLabel: ROLE_LABELS[p.role] || p.role,
      avatar: p.avatar || initials(p.name),
      color: p.color || avatarColor(p.name)
    };
  }

  function getCurrentUserLabel() {
    return getRoleMeta().name;
  }

  // === COMPUTED METRICS ===
  function getMetrics() {
    const data = getAll();
    const today = new Date();
    const thisMonth = today.toISOString().slice(0, 7);

    const projects = data.projects || [];
    const financial = data.financial || [];
    const measurements = data.measurements || [];
    const budgets = data.budgets || [];

    const byStatus = {
      em_andamento: projects.filter(p => p.status === 'em_andamento').length,
      concluida: projects.filter(p => p.status === 'concluida').length,
      programada: projects.filter(p => p.status === 'programada' || p.status === 'aprovado').length,
      orcamento: projects.filter(p => p.status === 'orcamento' || p.status === 'aguardando_aprovacao').length,
      pausada: projects.filter(p => p.status === 'pausada').length,
    };

    const closedThisMonth = projects.filter(p => p.closedAt && p.closedAt.startsWith(thisMonth)).length;
    const concludedThisMonth = projects.filter(p => p.status === 'concluida' && p.endDate && p.endDate.startsWith(thisMonth)).length;

    const totalContracted = projects.filter(p => !['cancelada', 'orcamento', 'aguardando_aprovacao'].includes(p.status))
      .reduce((s, p) => s + (p.contractValue || 0), 0);

    const totalReceived = financial.filter(f => f.situation === 'recebido').reduce((s, f) => s + f.value, 0);
    const totalToReceive = financial.filter(f => ['a_receber', 'previsto'].includes(f.situation)).reduce((s, f) => s + f.value, 0);
    const totalOverdue = financial.filter(f => f.situation === 'atrasado').reduce((s, f) => s + f.value, 0);

    const monthRevenue = financial.filter(f => f.situation === 'recebido' && f.paidAt && f.paidAt.startsWith(thisMonth))
      .reduce((s, f) => s + f.value, 0);

    const activeProjects = projects.filter(p => p.status === 'em_andamento');
    const avgTicket = activeProjects.length ? activeProjects.reduce((s, p) => s + p.contractValue, 0) / activeProjects.length : 0;

    const pendingMeasurements = measurements.filter(m => ['aguardando_aprovacao', 'enviada'].includes(m.status)).length;
    const overdueMeasurements = measurements.filter(m => {
      if (!m.paymentDue || m.situation === 'paga') return false;
      return new Date(m.paymentDue) < today && m.status !== 'paga';
    }).length;

    const budgetMetrics = {
      rascunho: budgets.filter(b => b.status === 'rascunho').length,
      enviado: budgets.filter(b => b.status === 'enviado').length,
      aguardando: budgets.filter(b => b.status === 'aguardando_resposta').length,
      aprovado: budgets.filter(b => b.status === 'aprovado').length,
      recusado: budgets.filter(b => b.status === 'recusado').length,
      expirado: budgets.filter(b => b.status === 'expirado').length,
    };

    const totalSent = budgetMetrics.enviado + budgetMetrics.aguardando + budgetMetrics.aprovado + budgetMetrics.recusado + budgetMetrics.expirado;
    const conversionRate = totalSent > 0 ? (budgetMetrics.aprovado / totalSent * 100).toFixed(1) : 0;

    const upcomingProjects = projects
      .filter(p => ['programada', 'aprovado'].includes(p.status) && p.startDate)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, 5);

    const attentionProjects = [];
    measurements.filter(m => m.status === 'atrasado' || (m.paymentDue && new Date(m.paymentDue) < today && m.status !== 'paga')).forEach(m => {
      const proj = projects.find(p => p.id === m.projectId);
      if (proj) attentionProjects.push({ type: 'payment_overdue', project: proj, detail: `Medição #${m.number} — R$ ${fmt.currency(m.value)}` });
    });
    measurements.filter(m => ['aguardando_aprovacao', 'enviada'].includes(m.status)).forEach(m => {
      const proj = projects.find(p => p.id === m.projectId);
      if (proj) attentionProjects.push({ type: 'measurement_pending', project: proj, detail: `Medição #${m.number} aguardando aprovação` });
    });
    financial.filter(f => f.situation === 'atrasado').forEach(f => {
      const proj = projects.find(p => p.id === f.projectId);
      if (proj && !attentionProjects.find(a => a.project.id === proj.id && a.type === 'payment_overdue')) {
        attentionProjects.push({ type: 'payment_overdue', project: proj, detail: `${f.description} vencido — R$ ${fmt.currency(f.value)}` });
      }
    });

    return {
      byStatus, closedThisMonth, concludedThisMonth,
      totalContracted, totalReceived, totalToReceive, totalOverdue,
      monthRevenue, avgTicket,
      pendingMeasurements, overdueMeasurements,
      budgetMetrics, totalSent, conversionRate,
      upcomingProjects, attentionProjects: attentionProjects.slice(0, 8)
    };
  }

  function getProjectFinancials(projectId) {
    const transactions = getList('financial').filter(f => f.projectId === projectId);
    const project = getById('projects', projectId);
    const measurements = getList('measurements').filter(m => m.projectId === projectId);

    const billed = measurements.filter(m => ['aprovada', 'faturada', 'paga'].includes(m.status)).reduce((s, m) => s + (m.approvedValue || m.value || 0), 0);
    const received = transactions.filter(t => t.situation === 'recebido').reduce((s, t) => s + t.value, 0);
    const open = transactions.filter(t => ['a_receber', 'previsto', 'atrasado'].includes(t.situation)).reduce((s, t) => s + t.value, 0);
    const overdue = transactions.filter(t => t.situation === 'atrasado').reduce((s, t) => s + t.value, 0);
    const cost = project?.costValue || 0;
    const profit = received - cost;
    const margin = received > 0 ? (profit / received * 100) : 0;
    const physProgress = measurements.length > 0 ? measurements.reduce((s, m) => s + m.percentage, 0) : (project?.physicalProgress || 0);
    const finProgress = project?.contractValue > 0 ? (billed / project.contractValue * 100) : 0;
    const receivedProgress = project?.contractValue > 0 ? (received / project.contractValue * 100) : 0;

    return { transactions, measurements, billed, received, open, overdue, cost, profit, margin, physProgress, finProgress, receivedProgress };
  }

  function getClientStats(clientId) {
    const projects = getList('projects').filter(p => p.clientId === clientId);
    const budgets = getList('budgets').filter(b => b.clientId === clientId);
    const financial = getList('financial').filter(f => f.clientId === clientId);

    const totalContracted = projects.reduce((s, p) => s + (p.contractValue || 0), 0);
    const totalReceived = financial.filter(f => f.situation === 'recebido').reduce((s, f) => s + f.value, 0);
    const pending = financial.filter(f => ['a_receber', 'atrasado', 'previsto'].includes(f.situation)).reduce((s, f) => s + f.value, 0);

    return {
      projects, budgets, financial,
      activeProjects: projects.filter(p => p.status === 'em_andamento').length,
      completedProjects: projects.filter(p => p.status === 'concluida').length,
      totalContracted, totalReceived, pending
    };
  }

  async function resetToDemo() {
    await init();
    if (window.rerender) window.rerender();
  }

  // === RECEBIMENTO DE MATERIAIS (ALMOXARIFADO) ===
  // Chama a função `register_receipt` no Postgres (security definer), que
  // atualiza o saldo do pedido e grava a linha imutável em order_receipts
  // — inclusive para o perfil Portaria, que não tem permissão de
  // UPDATE/INSERT direto nessas tabelas.
  async function registerReceipt(orderId, { quantity, invoiceNumber, notes, photoName } = {}) {
    const { data, error } = await sb.rpc('register_receipt', {
      p_order_id: orderId,
      p_quantity: quantity,
      p_invoice_number: invoiceNumber || null,
      p_notes: notes || null,
      p_photo_name: photoName || null
    });

    if (error) {
      console.error('Erro ao registrar recebimento:', error.message);
      Toast.error('Erro ao registrar recebimento', error.message);
      return null;
    }

    const receipt = rowToCamel(Array.isArray(data) ? data[0] : data);

    cache.orders = getList('orders').map(o => o.id === orderId ? { ...o, delivered: o.quantity - receipt.balanceAfter } : o);
    cache.order_receipts = [...getList('order_receipts'), receipt];

    return receipt;
  }

  function getAlmoxMetrics() {
    const orders = getList('orders');
    const receipts = getList('order_receipts');
    const today = new Date().toISOString().split('T')[0];

    const pending = orders.filter(o => getOrderStatus(o) === 'pendente').length;
    const partial = orders.filter(o => getOrderStatus(o) === 'parcial').length;
    const overdue = orders.filter(o => getOrderStatus(o) === 'atrasado').length;
    const completed = orders.filter(o => getOrderStatus(o) === 'concluido').length;
    const receiptsToday = receipts.filter(r => (r.receivedAt || '').slice(0, 10) === today).length;

    const recentReceipts = [...receipts].sort((a, b) => (b.receivedAt || '').localeCompare(a.receivedAt || '')).slice(0, 8);
    const overdueOrders = orders.filter(o => getOrderStatus(o) === 'atrasado')
      .sort((a, b) => (a.expectedDate || '').localeCompare(b.expectedDate || ''));

    return { pending, partial, overdue, completed, receiptsToday, recentReceipts, overdueOrders, totalOrders: orders.length };
  }

  return {
    init, getAll,
    getList, getById, add, update, remove,
    getMetrics, getProjectFinancials, getClientStats,
    resetToDemo,
    getRole, getRoleMeta, getRoleLabels, getCurrentUserLabel,
    registerReceipt, getAlmoxMetrics
  };
})();
