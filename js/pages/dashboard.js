// ==========================================
// DASHBOARD PAGE
// ==========================================

function renderDashboard() {
  const metrics = Store.getMetrics();
  const clients = Store.getList('clients');
  const projects = Store.getList('projects');

  const getClientName = id => clients.find(c => c.id === id)?.name || '—';

  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Dashboard</h1>
        <p>Visão geral do negócio — atualizado agora</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-outline" onclick="Pages.relatorios()">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          Relatórios
        </button>
        <button class="btn btn-primary" onclick="openNewProjectModal()">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nova Obra
        </button>
      </div>
    </div>

    <!-- KPI CARDS -->
    <div class="dashboard-kpis">
      ${kpiCard('Obras em Andamento', metrics.byStatus.em_andamento, 'obras ativas agora', 'blue', icons.hardhat, '+2 vs mês ant.', 'up')}
      ${kpiCard('Faturamento do Mês', fmt.currency(metrics.monthRevenue), 'jan/2025', 'green', icons.money, '+12% vs dez', 'up')}
      ${kpiCard('A Receber', fmt.currency(metrics.totalToReceive), 'valores em aberto', 'orange', icons.clock, `${metrics.overdueMeasurements} em atraso`, metrics.overdueMeasurements > 0 ? 'down' : 'neutral')}
      ${kpiCard('Total Contratado', fmt.currency(metrics.totalContracted), 'obras ativas', 'blue', icons.contract, 'R$ 8.7M portfólio', 'up')}
      ${kpiCard('Obras Concluídas', metrics.byStatus.concluida, 'total histórico', 'purple', icons.check, '5 este ano', 'up')}
      ${kpiCard('Orçamentos Pend.', metrics.budgetMetrics.aguardando, 'aguardando resposta', 'red', icons.doc, `Taxa: ${metrics.conversionRate}%`, 'neutral')}
    </div>

    <!-- EXECUTIVE SUMMARY -->
    <div class="exec-summary" style="margin-bottom:32px;">
      <div class="exec-summary-title">Resumo do Negócio</div>
      <div class="exec-summary-headline">Portfólio ativo: ${fmt.currency(metrics.totalContracted)}</div>
      <div class="exec-items">
        <div class="exec-item">
          <div class="exec-item-value">${metrics.byStatus.em_andamento}</div>
          <div class="exec-item-label">obras em andamento</div>
        </div>
        <div class="exec-item">
          <div class="exec-item-value">${fmt.currency(metrics.monthRevenue)}</div>
          <div class="exec-item-label">faturados neste mês</div>
        </div>
        <div class="exec-item">
          <div class="exec-item-value">${fmt.currency(metrics.totalToReceive)}</div>
          <div class="exec-item-label">a receber</div>
        </div>
        <div class="exec-item">
          <div class="exec-item-value">${metrics.byStatus.programada}</div>
          <div class="exec-item-label">obras começando em breve</div>
        </div>
        <div class="exec-item">
          <div class="exec-item-value">${metrics.budgetMetrics.aguardando}</div>
          <div class="exec-item-label">orçamentos aguardando</div>
        </div>
        <div class="exec-item">
          <div class="exec-item-value">${metrics.conversionRate}%</div>
          <div class="exec-item-label">taxa de conversão</div>
        </div>
      </div>
    </div>

    <!-- MAIN CHARTS ROW -->
    <div class="dashboard-charts-row" style="margin-bottom:24px;">
      <div class="chart-card">
        <div class="chart-card-header">
          <div>
            <div class="card-title">Faturamento Mensal</div>
            <div class="card-subtitle">Previsto x Realizado — últimos 12 meses</div>
          </div>
          <select class="filter-select" onchange="handleRevenueFilter(this.value)">
            <option value="12">12 meses</option>
            <option value="6">6 meses</option>
          </select>
        </div>
        <div class="chart-card-body" style="height:280px;">
          <canvas id="chart-revenue"></canvas>
        </div>
      </div>
      <div class="chart-card">
        <div class="chart-card-header">
          <div>
            <div class="card-title">Status das Obras</div>
            <div class="card-subtitle">${projects.length} projetos no total</div>
          </div>
        </div>
        <div class="chart-card-body" style="height:280px;">
          <canvas id="chart-status"></canvas>
        </div>
      </div>
    </div>

    <!-- CHARTS ROW 2 -->
    <div class="dashboard-row-2" style="margin-bottom:24px;">
      <div class="chart-card">
        <div class="chart-card-header">
          <div class="card-title">Orçamentos</div>
          <div class="card-subtitle">Enviados x Aprovados</div>
        </div>
        <div class="chart-card-body" style="height:220px;">
          <canvas id="chart-budgets"></canvas>
        </div>
      </div>
      <div class="chart-card">
        <div class="chart-card-header">
          <div class="card-title">Evolução das Medições</div>
          <div class="card-subtitle">Progresso físico x financeiro por obra</div>
        </div>
        <div class="chart-card-body" style="height:220px;">
          <canvas id="chart-measurements"></canvas>
        </div>
      </div>
      <div class="chart-card">
        <div class="chart-card-header">
          <div class="card-title">Obras Fechadas</div>
          <div class="card-subtitle">Por mês — últimos 6 meses</div>
        </div>
        <div class="chart-card-body" style="height:220px;">
          <canvas id="chart-closed"></canvas>
        </div>
      </div>
    </div>

    <!-- BOTTOM ROW -->
    <div class="dashboard-row-3">
      <!-- Próximas Obras -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Próximas Obras
            </div>
            <div class="card-subtitle">${metrics.upcomingProjects.length} obras programadas</div>
          </div>
          <button class="btn btn-sm btn-outline" onclick="Pages.cronograma()">Ver calendário</button>
        </div>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>OBRA</th>
                <th>CLIENTE</th>
                <th>INÍCIO</th>
                <th>VALOR</th>
                <th>RESP.</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${metrics.upcomingProjects.length ? metrics.upcomingProjects.map(p => `
                <tr onclick="openProjectDetail('${p.id}')" style="cursor:pointer;">
                  <td class="td-main">${p.name}</td>
                  <td>${getClientName(p.clientId)}</td>
                  <td>${fmt.date(p.startDate)}</td>
                  <td class="font-semibold">${fmt.currency(p.contractValue)}</td>
                  <td>${p.responsible}</td>
                  <td>${badge('project', p.status)}</td>
                </tr>
              `).join('') : `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted);">Nenhuma obra programada</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Atenção -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title" style="color:var(--warning-dark);">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              Precisa de Atenção
            </div>
            <div class="card-subtitle">${metrics.attentionProjects.length} itens requerem ação</div>
          </div>
          <button class="btn btn-sm btn-outline" onclick="Pages.notificacoes()">Ver tudo</button>
        </div>
        <div class="card-body" style="display:flex;flex-direction:column;gap:12px;padding:16px;">
          ${metrics.attentionProjects.slice(0, 6).map(item => {
            const typeMap = {
              payment_overdue: { color: 'danger-card', icon: icons.alert_red, label: 'Pagamento' },
              measurement_pending: { color: 'warning-card', icon: icons.alert_orange, label: 'Medição' },
              project_deadline: { color: 'info-card', icon: icons.info_blue, label: 'Prazo' }
            };
            const t = typeMap[item.type] || typeMap['measurement_pending'];
            return `
              <div class="attention-item ${t.color}" onclick="openProjectDetail('${item.project.id}')" style="cursor:pointer;">
                <div class="attention-icon">${t.icon}</div>
                <div class="attention-content">
                  <div class="attention-title">${item.project.name}</div>
                  <div class="attention-desc">${item.detail}</div>
                  <div class="attention-meta">${item.project.responsible} • ${item.project.city}</div>
                </div>
              </div>
            `;
          }).join('') || '<p style="text-align:center;color:var(--text-muted);padding:16px;">✓ Tudo em ordem</p>'}
        </div>
      </div>
    </div>
  `;

  // Render charts
  setTimeout(() => {
    renderRevenueChart('chart-revenue');
    renderStatusDonut('chart-status');
    renderBudgetChart('chart-budgets');
    renderMeasurementChart('chart-measurements');
    renderClosedChart('chart-closed');
  }, 50);
}

function kpiCard(label, value, sub, color, icon, trend, trendDir) {
  return `
    <div class="kpi-card ${color}">
      <div class="kpi-top">
        <div class="kpi-icon ${color}">${icon}</div>
        <div class="kpi-trend ${trendDir === 'up' ? 'up' : trendDir === 'down' ? 'down' : 'neutral'}">
          ${trendDir === 'up' ? '↑' : trendDir === 'down' ? '↓' : '→'} ${trend}
        </div>
      </div>
      <div class="kpi-value">${value}</div>
      <div class="kpi-label">${label}</div>
      <div class="kpi-sub">${sub}</div>
    </div>
  `;
}

function handleRevenueFilter(val) {
  const data = val === '6' ? MONTHLY_REVENUE.slice(-6) : MONTHLY_REVENUE;
  renderRevenueChart('chart-revenue', data);
}

// SVG Icons
const icons = {
  hardhat: `<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5a2 2 0 00-2 2v2a2 2 0 002 2h14a2 2 0 002-2v-2a2 2 0 00-2-2zM12 3a7 7 0 017 7H5a7 7 0 017-7z"/></svg>`,
  money: `<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  clock: `<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  contract: `<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>`,
  check: `<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  doc: `<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
  alert_red: `<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  alert_orange: `<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
  info_blue: `<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4m0-4h.01"/></svg>`
};
