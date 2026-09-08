// ==========================================
// FINANCEIRO PAGE
// ==========================================

let finFilter = { situation: '', projectId: '', period: '', page: 1 };

function renderFinanceiro() {
  const financial = Store.getList('financial');
  const projects = Store.getList('projects');
  const clients = Store.getList('clients');
  const getProjectName = id => projects.find(p => p.id === id)?.name || '—';
  const getClientName = id => clients.find(c => c.id === id)?.name || '—';

  // Computed
  const thisMonth = new Date().toISOString().slice(0, 7);
  const received = financial.filter(f => f.situation === 'recebido').reduce((s,f) => s+f.value, 0);
  const receivedMonth = financial.filter(f => f.situation === 'recebido' && f.paidAt?.startsWith(thisMonth)).reduce((s,f) => s+f.value, 0);
  const toReceive = financial.filter(f => ['a_receber','previsto'].includes(f.situation)).reduce((s,f) => s+f.value, 0);
  const overdue = financial.filter(f => f.situation === 'atrasado').reduce((s,f) => s+f.value, 0);
  const totalContracted = projects.filter(p => !['cancelada','orcamento','aguardando_aprovacao'].includes(p.status)).reduce((s,p) => s+p.contractValue, 0);
  const activeProjs = projects.filter(p => p.status === 'em_andamento');
  const avgTicket = activeProjs.length ? activeProjs.reduce((s,p) => s+p.contractValue, 0) / activeProjs.length : 0;

  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Financeiro</h1>
        <p>Gestão financeira de todas as obras</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-outline" onclick="exportFinanceiro()">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Exportar
        </button>
        ${canWrite() ? `<button class="btn btn-primary" onclick="openNewTransactionModal('')">+ Lançamento</button>` : ''}
      </div>
    </div>

    <!-- KPI CARDS -->
    <div class="fin-kpis" style="grid-template-columns:repeat(6,1fr);margin-bottom:28px;">
      ${[
        ['Faturamento do Mês', fmt.currency(receivedMonth), 'green', icons.money],
        ['Total Recebido', fmt.currency(received), 'blue', icons.check],
        ['A Receber', fmt.currency(toReceive), 'orange', icons.clock],
        ['Em Atraso', fmt.currency(overdue), 'red', icons.alert],
        ['Total Contratado', fmt.currency(totalContracted), 'blue', icons.contract],
        ['Ticket Médio', fmt.currency(avgTicket), 'purple', icons.chart],
      ].map(([l,v,c,icon]) => `
        <div class="kpi-card ${c}">
          <div class="kpi-top">
            <div class="kpi-icon ${c}">${icon}</div>
          </div>
          <div class="kpi-value" style="font-size:20px;">${v}</div>
          <div class="kpi-label">${l}</div>
        </div>
      `).join('')}
    </div>

    <!-- CHARTS -->
    <div class="fin-charts" style="margin-bottom:28px;">
      <div class="chart-card">
        <div class="chart-card-header">
          <div>
            <div class="card-title">Faturamento Mensal</div>
            <div class="card-subtitle">Últimos 12 meses</div>
          </div>
        </div>
        <div class="chart-card-body" style="height:280px;">
          <canvas id="fin-chart-revenue"></canvas>
        </div>
      </div>
      <div class="chart-card">
        <div class="chart-card-header">
          <div>
            <div class="card-title">Previsto × Recebido</div>
            <div class="card-subtitle">Últimos 6 meses</div>
          </div>
        </div>
        <div class="chart-card-body" style="height:280px;">
          <canvas id="fin-chart-compare"></canvas>
        </div>
      </div>
    </div>

    <!-- FILTERS -->
    <div class="filters-bar">
      <select class="filter-select" onchange="finFilter.situation=this.value;finFilter.page=1;renderFinContent()">
        <option value="">Todos os status</option>
        ${Object.entries(StatusHelpers.financial.labels).map(([v,l]) => `<option value="${v}" ${finFilter.situation===v?'selected':''}>${l}</option>`).join('')}
      </select>
      <select class="filter-select" onchange="finFilter.projectId=this.value;finFilter.page=1;renderFinContent()">
        <option value="">Todas as obras</option>
        ${projects.map(p => `<option value="${p.id}" ${finFilter.projectId===p.id?'selected':''}>${p.name}</option>`).join('')}
      </select>
      <button class="btn btn-sm btn-ghost" onclick="finFilter={situation:'',projectId:'',period:'',page:1};renderFinContent()">Limpar</button>
      <div style="margin-left:auto;font-size:13px;color:var(--text-muted);">
        ${financial.length} movimentações
      </div>
    </div>

    <!-- TABLE -->
    <div class="card">
      <div class="table-wrapper">
        <table id="fin-table">
          <thead>
            <tr><th>CLIENTE</th><th>OBRA</th><th>DESCRIÇÃO</th><th>VALOR</th><th>VENCIMENTO</th><th>PAGAMENTO</th><th>FORMA</th><th>STATUS</th></tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
      <div id="fin-pag"></div>
    </div>
  `;

  setTimeout(() => {
    renderRevenueChart('fin-chart-revenue');
    renderPrevRealizadoChart('fin-chart-compare');
  }, 50);
  renderFinContent();
}

const icons_fin = {
  money: `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  check: `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  clock: `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  alert: `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
  contract: `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>`,
  chart: `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`
};

// Assign to icons object used in dashboard
Object.assign(icons || {}, icons_fin);

function renderFinContent() {
  const financial = Store.getList('financial');
  const projects = Store.getList('projects');
  const clients = Store.getList('clients');
  const getProjectName = id => projects.find(p => p.id === id)?.name || '—';
  const getClientName = id => clients.find(c => c.id === id)?.name || '—';

  let filtered = financial.filter(f => {
    const matchSit = !finFilter.situation || f.situation === finFilter.situation;
    const matchProj = !finFilter.projectId || f.projectId === finFilter.projectId;
    return matchSit && matchProj;
  }).sort((a,b) => {
    const order = { atrasado:0, a_receber:1, previsto:2, recebido:3 };
    return (order[a.situation]||9) - (order[b.situation]||9);
  });

  paginate({
    items: filtered,
    page: finFilter.page || 1,
    perPage: 12,
    containerId: 'fin',
    tableId: 'fin-table',
    renderRow: f => `
      <tr>
        <td class="td-main">${getClientName(f.clientId)}</td>
        <td>
          <div style="font-size:12px;color:var(--text-muted);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${getProjectName(f.projectId)}</div>
        </td>
        <td>${f.description}</td>
        <td class="font-semibold" style="color:var(--primary-800);">${fmt.currency(f.value)}</td>
        <td>${fmt.date(f.dueDate)}</td>
        <td>${fmt.date(f.paidAt)}</td>
        <td><span style="font-size:11px;color:var(--text-muted);">${f.paymentMethod}</span></td>
        <td>${badge('financial', f.situation)}</td>
      </tr>
    `
  });
}

function exportFinanceiro() {
  const financial = Store.getList('financial');
  const projects = Store.getList('projects');
  const clients = Store.getList('clients');

  const rows = [['Cliente','Obra','Descrição','Valor','Vencimento','Pagamento','Status']];
  financial.forEach(f => {
    const proj = projects.find(p => p.id === f.projectId);
    const client = clients.find(c => c.id === f.clientId);
    rows.push([client?.name||'', proj?.name||'', f.description, f.value, f.dueDate||'', f.paidAt||'', f.situation]);
  });

  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `financeiro_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  Toast.success('Exportado!', 'Arquivo CSV gerado com sucesso.');
}
