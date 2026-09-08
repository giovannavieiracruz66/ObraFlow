// ==========================================
// OBRAS PAGE
// ==========================================

let obrasFilter = { status: '', responsible: '', search: '', page: 1 };

function renderObras() {
  const projects = Store.getList('projects');
  const clients = Store.getList('clients');
  const getClientName = id => clients.find(c => c.id === id)?.name || '—';
  const responsibles = [...new Set(projects.map(p => p.responsible))].sort();

  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Obras & Projetos</h1>
        <p>${projects.length} projetos cadastrados</p>
      </div>
      <div class="page-header-actions">
        <div class="view-switcher">
          <button class="view-btn active" id="view-grid" onclick="setObrasView('grid')">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Grade
          </button>
          <button class="view-btn" id="view-list" onclick="setObrasView('list')">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            Lista
          </button>
        </div>
        ${canWrite() ? `
        <button class="btn btn-primary" onclick="openNewProjectModal()">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nova Obra
        </button>` : ''}
      </div>
    </div>

    <!-- FILTERS -->
    <div class="filters-bar">
      <div class="search-wrapper">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="search-input" type="text" placeholder="Buscar obra ou cliente..." value="${obrasFilter.search}" oninput="obrasFilter.search=this.value;obrasFilter.page=1;renderObrasContent()" id="obras-search">
      </div>
      <select class="filter-select" onchange="obrasFilter.status=this.value;obrasFilter.page=1;renderObrasContent()">
        <option value="">Todos os status</option>
        <option value="orcamento" ${obrasFilter.status==='orcamento'?'selected':''}>Orçamento</option>
        <option value="aprovado" ${obrasFilter.status==='aprovado'?'selected':''}>Aprovado</option>
        <option value="programada" ${obrasFilter.status==='programada'?'selected':''}>Programada</option>
        <option value="em_andamento" ${obrasFilter.status==='em_andamento'?'selected':''}>Em Andamento</option>
        <option value="pausada" ${obrasFilter.status==='pausada'?'selected':''}>Pausada</option>
        <option value="concluida" ${obrasFilter.status==='concluida'?'selected':''}>Concluída</option>
        <option value="cancelada" ${obrasFilter.status==='cancelada'?'selected':''}>Cancelada</option>
      </select>
      <select class="filter-select" onchange="obrasFilter.responsible=this.value;obrasFilter.page=1;renderObrasContent()">
        <option value="">Todos os responsáveis</option>
        ${responsibles.map(r => `<option value="${r}" ${obrasFilter.responsible===r?'selected':''}>${r}</option>`).join('')}
      </select>
      <button class="btn btn-sm btn-ghost" onclick="obrasFilter={status:'',responsible:'',search:'',page:1};renderObras()">Limpar</button>
    </div>

    <!-- CONTENT -->
    <div id="obras-content"></div>
    <div id="obras-pag"></div>
  `;

  window.currentObrasView = 'grid';
  renderObrasContent();
}

let currentObrasView = 'grid';

function setObrasView(view) {
  currentObrasView = view;
  document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`view-${view}`)?.classList.add('active');
  renderObrasContent();
}

function renderObrasContent() {
  const projects = Store.getList('projects');
  const clients = Store.getList('clients');
  const getClientName = id => clients.find(c => c.id === id)?.name || '—';

  let filtered = projects.filter(p => {
    const matchSearch = !obrasFilter.search || p.name.toLowerCase().includes(obrasFilter.search.toLowerCase()) || getClientName(p.clientId).toLowerCase().includes(obrasFilter.search.toLowerCase());
    const matchStatus = !obrasFilter.status || p.status === obrasFilter.status;
    const matchResp = !obrasFilter.responsible || p.responsible === obrasFilter.responsible;
    return matchSearch && matchStatus && matchResp;
  });

  filtered.sort((a, b) => {
    const order = { em_andamento: 0, programada: 1, aprovado: 2, pausada: 3, orcamento: 4, concluida: 5, cancelada: 6 };
    return (order[a.status] || 9) - (order[b.status] || 9);
  });

  const perPage = currentObrasView === 'grid' ? 9 : 10;
  const total = filtered.length;
  const totalPages = Math.ceil(total / perPage);
  const page = obrasFilter.page;
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  const container = document.getElementById('obras-content');

  if (!pageItems.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg></div>
        <h3>Nenhuma obra encontrada</h3>
        <p>Tente ajustar os filtros ou cadastre uma nova obra.</p>
        ${canWrite() ? `<button class="btn btn-primary" onclick="openNewProjectModal()">Nova Obra</button>` : ''}
      </div>
    `;
    document.getElementById('obras-pag').innerHTML = '';
    return;
  }

  if (currentObrasView === 'grid') {
    container.innerHTML = `<div class="obras-grid">${pageItems.map(p => obrasCard(p, getClientName(p.clientId))).join('')}</div>`;
  } else {
    container.innerHTML = `
      <div class="card">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>OBRA</th><th>CLIENTE</th><th>RESPONSÁVEL</th><th>INÍCIO</th><th>CONCLUSÃO</th><th>VALOR</th><th>PROGRESSO</th><th>STATUS</th><th></th>
              </tr>
            </thead>
            <tbody>
              ${pageItems.map(p => `
                <tr>
                  <td>
                    <div class="td-main">${p.name}</div>
                    <div class="td-muted">${p.city} • ${p.category}</div>
                  </td>
                  <td>${getClientName(p.clientId)}</td>
                  <td>${p.responsible}</td>
                  <td>${fmt.date(p.startDate)}</td>
                  <td>${fmt.date(p.endDate)}</td>
                  <td class="font-semibold">${fmt.currency(p.contractValue)}</td>
                  <td>
                    <div style="min-width:80px;">
                      <div class="progress-bar-wrap"><div class="progress-bar blue" style="width:${p.physicalProgress}%"></div></div>
                      <div style="font-size:10px;color:var(--text-faint);margin-top:2px;">${p.physicalProgress}%</div>
                    </div>
                  </td>
                  <td>${badge('project', p.status)}</td>
                  <td>
                    <div style="display:flex;gap:4px;">
                      <button class="btn btn-sm btn-ghost" onclick="openProjectDetail('${p.id}')">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      </button>
                      <button class="btn btn-sm btn-ghost" onclick="openEditProjectModal('${p.id}')">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button class="btn btn-sm btn-ghost" style="color:var(--danger);" onclick="deleteProject('${p.id}')">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path stroke-linecap="round" stroke-linejoin="round" d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // Pagination
  document.getElementById('obras-pag').innerHTML = total > perPage ? renderPagination(page, totalPages, total, (page-1)*perPage, pageItems.length, 'obras') : '';
}

function obrasCard(p, clientName) {
  const colorMap = { em_andamento: '#10b981', concluida: '#0f3460', programada: '#0ea5e9', aprovado: '#06b6d4', pausada: '#8b5cf6', orcamento: '#f59e0b', cancelada: '#ef4444' };
  const color = colorMap[p.status] || '#94a3b8';
  return `
    <div class="obra-card" onclick="openProjectDetail('${p.id}')">
      <div class="obra-card-header">
        <div>
          <div class="obra-card-title">${p.name}</div>
          <div class="obra-card-client">${clientName} • ${p.city}</div>
        </div>
        ${badge('project', p.status)}
      </div>
      <div class="obra-card-body">
        <div class="obra-card-row">
          <span class="obra-card-row-label">Valor contratado</span>
          <span class="obra-card-row-value">${fmt.currency(p.contractValue)}</span>
        </div>
        <div class="obra-card-row">
          <span class="obra-card-row-label">Responsável</span>
          <span class="obra-card-row-value">${p.responsible}</span>
        </div>
        <div class="obra-card-row">
          <span class="obra-card-row-label">Prazo</span>
          <span class="obra-card-row-value">${fmt.date(p.endDate)}</span>
        </div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-faint);margin-bottom:4px;">
          <span>Progresso físico</span><span>${p.physicalProgress}%</span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar blue" style="width:${p.physicalProgress}%;background:${color};"></div>
        </div>
      </div>
    </div>
  `;
}

// === PROJECT DETAIL ===
function openProjectDetail(id) {
  const project = Store.getById('projects', id);
  if (!project) return;
  const client = Store.getById('clients', project.clientId);
  const fin = Store.getProjectFinancials(id);

  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div style="margin-bottom:16px;">
      <button class="btn btn-ghost btn-sm" onclick="Pages.obras()">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        Voltar para Obras
      </button>
    </div>

    <!-- Header -->
    <div class="obra-detail-header">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;">
        <div style="position:relative;z-index:1;">
          ${badge('project', project.status)}
          <h2 style="color:white;font-size:24px;font-weight:800;margin:8px 0 4px;letter-spacing:-0.02em;">${project.name}</h2>
          <p style="color:rgba(255,255,255,0.7);font-size:14px;">${client?.name || '—'} • ${project.city} • ${project.category}</p>
        </div>
        <div style="display:flex;gap:8px;position:relative;z-index:1;">
          <button class="btn btn-outline" style="color:white;border-color:rgba(255,255,255,0.3);" onclick="openEditProjectModal('${id}')">Editar</button>
          <button class="btn" style="background:white;color:var(--primary-800);" onclick="openNewMeasurementModal('${id}')">+ Medição</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:24px;position:relative;z-index:1;">
        ${[
          ['Valor Contratado', fmt.currency(project.contractValue), 'white'],
          ['Recebido', fmt.currency(fin.received), '#34d399'],
          ['A Receber', fmt.currency(fin.open), '#fbbf24'],
          ['Progresso Físico', `${project.physicalProgress}%`, '#93c5fd']
        ].map(([l, v, c]) => `
          <div style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:14px 16px;">
            <div style="font-size:10px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;">${l}</div>
            <div style="font-size:20px;font-weight:800;color:${c};">${v}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Progress bars -->
    <div class="card" style="margin-bottom:24px;">
      <div class="card-body">
        <div style="display:flex;flex-direction:column;gap:16px;">
          ${progressBar(project.physicalProgress, 100, 'green', 'Progresso Físico')}
          ${progressBar(fin.finProgress, 100, 'blue', 'Progresso Financeiro (faturado)')}
          ${progressBar(fin.receivedProgress, 100, 'orange', 'Progresso Financeiro (recebido)')}
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs" id="project-tabs">
      <button class="tab active" onclick="showProjectTab('overview','${id}')">
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        Visão Geral
      </button>
      <button class="tab" onclick="showProjectTab('financial','${id}')">
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        Financeiro
      </button>
      <button class="tab" onclick="showProjectTab('measurements','${id}')">
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
        Medições
      </button>
      <button class="tab" onclick="showProjectTab('notes','${id}')">
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
        Observações
      </button>
      <button class="tab" onclick="showProjectTab('orders','${id}')">
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
        Materiais / Almoxarifado
      </button>
    </div>

    <div id="project-tab-content"></div>
  `;

  showProjectTab('overview', id);
}

function showProjectTab(tab, projectId) {
  const project = Store.getById('projects', projectId);
  const client = Store.getById('clients', project.clientId);
  const fin = Store.getProjectFinancials(projectId);

  // Update active tab
  document.querySelectorAll('#project-tabs .tab').forEach((t, i) => {
    t.classList.toggle('active', ['overview','financial','measurements','notes','orders'].indexOf(tab) === i);
  });

  const container = document.getElementById('project-tab-content');

  if (tab === 'overview') {
    container.innerHTML = `
      <div class="grid grid-cols-2" style="gap:24px;">
        <div class="card">
          <div class="card-header"><div class="card-title">Detalhes da Obra</div></div>
          <div class="card-body">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              ${[
                ['Categoria', project.category],
                ['Responsável', project.responsible],
                ['Fechamento', fmt.date(project.closedAt)],
                ['Início Previsto', fmt.date(project.startDate)],
                ['Conclusão Prevista', fmt.date(project.endDate)],
                ['Forma de Pagamento', project.paymentMethod],
                ['Endereço', project.address],
                ['Cidade', project.city]
              ].map(([l, v]) => `
                <div>
                  <div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-faint);font-weight:700;margin-bottom:2px;">${l}</div>
                  <div style="font-size:14px;font-weight:600;color:var(--text);">${v || '—'}</div>
                </div>
              `).join('')}
            </div>
            ${project.description ? `<div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);"><div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-faint);font-weight:700;margin-bottom:6px;">Descrição</div><p style="font-size:14px;color:var(--text-light);">${project.description}</p></div>` : ''}
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Cliente</div></div>
          <div class="card-body">
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
              <div class="user-avatar" style="width:52px;height:52px;font-size:18px;background:${avatarColor(client?.name||'C')};">${initials(client?.name||'C')}</div>
              <div>
                <div style="font-size:16px;font-weight:700;color:var(--text);">${client?.name || '—'}</div>
                <div style="font-size:13px;color:var(--text-muted);">${client?.company || 'Pessoa Física'}</div>
              </div>
            </div>
            ${client ? `
              <div style="display:flex;flex-direction:column;gap:8px;">
                <div style="display:flex;gap:8px;align-items:center;font-size:13px;"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>${client.phone}</div>
                <div style="display:flex;gap:8px;align-items:center;font-size:13px;"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>${client.email}</div>
              </div>
              <button class="btn btn-sm btn-outline" style="margin-top:16px;" onclick="openClientDetail('${client.id}')">Ver perfil do cliente</button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  if (tab === 'financial') {
    container.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">
        ${[
          ['Valor Contratado', fmt.currency(project.contractValue), 'blue'],
          ['Faturado', fmt.currency(fin.billed), 'cyan'],
          ['Recebido', fmt.currency(fin.received), 'green'],
          ['Em Aberto', fmt.currency(fin.open), 'orange'],
          ['Custo Estimado', fmt.currency(fin.cost), 'red'],
          ['Lucro Estimado', fmt.currency(fin.profit), fin.profit >= 0 ? 'green' : 'red'],
          ['Margem', `${fin.margin.toFixed(1)}%`, fin.margin >= 20 ? 'green' : 'orange'],
          ['A Receber Total', fmt.currency(project.contractValue - fin.received), 'blue']
        ].map(([l, v, c]) => `
          <div class="kpi-card ${c}" style="padding:16px;">
            <div class="kpi-label">${l}</div>
            <div class="kpi-value" style="font-size:20px;margin-top:4px;">${v}</div>
          </div>
        `).join('')}
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title">Movimentações Financeiras</div>
          <button class="btn btn-sm btn-primary" onclick="openNewTransactionModal('${projectId}')">+ Lançamento</button>
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>DESCRIÇÃO</th><th>VALOR</th><th>VENCIMENTO</th><th>PAGAMENTO</th><th>TIPO</th><th>STATUS</th><th></th></tr></thead>
            <tbody>
              ${fin.transactions.length ? fin.transactions.map(t => `
                <tr>
                  <td class="td-main">${t.description}</td>
                  <td class="font-semibold">${fmt.currency(t.value)}</td>
                  <td>${fmt.date(t.dueDate)}</td>
                  <td>${fmt.date(t.paidAt)}</td>
                  <td><span style="font-size:12px;color:var(--text-muted);">${t.paymentMethod}</span></td>
                  <td>${badge('financial', t.situation)}</td>
                  <td><button class="btn btn-sm btn-ghost" style="color:var(--danger);" onclick="deleteTransaction('${t.id}','${projectId}')"><svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg></button></td>
                </tr>
              `).join('') : '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted);">Nenhuma movimentação cadastrada</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  if (tab === 'measurements') {
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">Medições</div>
          <button class="btn btn-sm btn-primary" onclick="openNewMeasurementModal('${projectId}')">+ Nova Medição</button>
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>#</th><th>PERÍODO</th><th>DESCRIÇÃO</th><th>BRUTO</th><th>LÍQUIDO</th><th>APROVADO</th><th>VENCIMENTO</th><th>PAGO EM</th><th>STATUS</th></tr></thead>
            <tbody>
              ${fin.measurements.length ? fin.measurements.map(m => {
                const b = getMeasurementBreakdown(m);
                return `
                <tr>
                  <td class="td-main">Med. ${m.number}</td>
                  <td>${m.period}</td>
                  <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${m.description}</td>
                  <td class="font-semibold">${fmt.currency(b.gross)}</td>
                  <td class="font-semibold" style="color:var(--primary-700);">${fmt.currency(b.net)}</td>
                  <td>${m.approvedValue ? fmt.currency(m.approvedValue) : '—'}</td>
                  <td>${fmt.date(m.paymentDue)}</td>
                  <td>${fmt.date(m.paidAt)}</td>
                  <td>${badge('measurement', m.status)}</td>
                </tr>
              `}).join('') : '<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--text-muted);">Nenhuma medição cadastrada</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  if (tab === 'notes') {
    container.innerHTML = `
      <div class="card">
        <div class="card-header"><div class="card-title">Observações</div></div>
        <div class="card-body">
          <textarea class="form-control" rows="6" placeholder="Observações sobre a obra..." style="min-height:120px;">${project.notes || ''}</textarea>
          <button class="btn btn-primary" style="margin-top:12px;" onclick="saveProjectNotes('${projectId}', this.previousElementSibling.value)">Salvar</button>
        </div>
      </div>
    `;
  }

  if (tab === 'orders') {
    const orders = Store.getList('orders').filter(o => o.projectId === projectId);
    const totalItens = orders.length;
    const entregues = orders.filter(o => getOrderStatus(o) === 'concluido').length;
    const parciais = orders.filter(o => getOrderStatus(o) === 'parcial').length;
    const atrasados = orders.filter(o => getOrderStatus(o) === 'atrasado').length;

    container.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:20px;">
        <div class="kpi-card blue" style="padding:16px;"><div class="kpi-label">Itens Totais</div><div class="kpi-value" style="font-size:20px;margin-top:4px;">${totalItens}</div></div>
        <div class="kpi-card green" style="padding:16px;"><div class="kpi-label">Entregues</div><div class="kpi-value" style="font-size:20px;margin-top:4px;">${entregues}</div></div>
        <div class="kpi-card orange" style="padding:16px;"><div class="kpi-label">Parciais</div><div class="kpi-value" style="font-size:20px;margin-top:4px;">${parciais}</div></div>
        <div class="kpi-card red" style="padding:16px;"><div class="kpi-label">Atrasados</div><div class="kpi-value" style="font-size:20px;margin-top:4px;">${atrasados}</div></div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title">Materiais / Almoxarifado</div>
          <button class="btn btn-sm btn-primary" onclick="openNewOrderModal('${projectId}')">+ Novo Pedido</button>
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>ITEM / SKU</th><th>FORNECEDOR</th><th>PREVISÃO</th><th>QTD. TOTAL</th><th>ENTREGUE</th><th>SALDO</th><th>VALOR TOTAL</th><th>STATUS</th><th></th></tr></thead>
            <tbody>
              ${orders.length ? orders.map(o => {
                const saldo = o.quantity - o.delivered;
                const status = getOrderStatus(o);
                return `
                <tr>
                  <td>
                    <div class="td-main">${o.item}</div>
                    <div class="td-muted">${o.sku || '—'}</div>
                  </td>
                  <td>${o.supplier || '—'}</td>
                  <td>${fmt.date(o.expectedDate)}</td>
                  <td>${o.quantity} ${o.unit}</td>
                  <td style="font-weight:600;color:var(--primary-700);">${o.delivered} ${o.unit}</td>
                  <td style="font-weight:700;color:${saldo > 0 ? 'var(--danger)' : 'var(--text-faint)'};">${saldo} ${o.unit}</td>
                  <td class="font-semibold">${fmt.currency(o.quantity * o.unitValue)}</td>
                  <td>${badge('order', status)}</td>
                  <td>
                    <div style="display:flex;gap:4px;">
                      ${saldo > 0 ? `<button class="btn btn-sm btn-outline" onclick="openReceiveMaterialModal('${o.id}', () => { openProjectDetail('${projectId}'); showProjectTab('orders','${projectId}'); })">Receber</button>` : ''}
                      <button class="btn btn-sm btn-ghost" style="color:var(--danger);" onclick="deleteOrder('${o.id}', '${projectId}')">
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `}).join('') : '<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--text-muted);">Nenhum pedido cadastrado</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}

function saveProjectNotes(id, notes) {
  Store.update('projects', id, { notes });
  Toast.success('Salvo!', 'Observações atualizadas.');
}

// === MODALS ===
function openNewProjectModal(prefill = {}) {
  const clients = Store.getList('clients');
  const responsibles = ['Carlos Henrique', 'Diego Almeida', 'Fernanda Costa'];

  const { close } = Modal.create({
    title: 'Nova Obra',
    size: 'modal-xl',
    body: `
      <div class="form-grid">
        <div class="form-group form-col-span-2">
          <label class="form-label">Nome da Obra / Projeto *</label>
          <input class="form-control" id="pj-name" placeholder="Ex: Residência Alto Padrão - Alphaville" value="${prefill.name||''}">
        </div>
        <div class="form-group">
          <label class="form-label">Cliente *</label>
          <select class="form-control" id="pj-client">
            <option value="">Selecionar cliente</option>
            ${clients.map(c => `<option value="${c.id}" ${prefill.clientId===c.id?'selected':''}>${c.name}${c.company?` — ${c.company}`:''}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Responsável</label>
          <select class="form-control" id="pj-responsible">
            ${responsibles.map(r => `<option>${r}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Categoria / Tipo</label>
          <select class="form-control" id="pj-category">
            ${['Residencial','Comercial','Industrial','Hotelaria','Corporativo','Infraestrutura','Manutenção'].map(c => `<option>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-control" id="pj-status">
            ${Object.entries(StatusHelpers.project.labels).map(([v,l]) => `<option value="${v}">${l}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Endereço da Obra</label>
          <input class="form-control" id="pj-address" placeholder="Rua, número">
        </div>
        <div class="form-group">
          <label class="form-label">Cidade</label>
          <input class="form-control" id="pj-city" placeholder="São Paulo">
        </div>
        <div class="form-group">
          <label class="form-label">Valor Total do Contrato</label>
          <input class="form-control" id="pj-value" type="number" placeholder="0">
        </div>
        <div class="form-group">
          <label class="form-label">Forma de Pagamento</label>
          <input class="form-control" id="pj-payment" placeholder="Ex: Medições mensais">
        </div>
        <div class="form-group">
          <label class="form-label">Data de Fechamento</label>
          <input class="form-control" id="pj-closed" type="date">
        </div>
        <div class="form-group">
          <label class="form-label">Início Previsto</label>
          <input class="form-control" id="pj-start" type="date">
        </div>
        <div class="form-group">
          <label class="form-label">Conclusão Prevista</label>
          <input class="form-control" id="pj-end" type="date">
        </div>
        <div class="form-group form-col-span-2">
          <label class="form-label">Descrição</label>
          <textarea class="form-control" id="pj-desc" rows="3" placeholder="Descreva o escopo da obra..."></textarea>
        </div>
        <div class="form-group form-col-span-2">
          <label class="form-label">Observações</label>
          <textarea class="form-control" id="pj-notes" rows="2" placeholder="Observações internas..."></textarea>
        </div>
      </div>
    `,
    footer: `
      <button class="btn btn-outline" id="modal-cancel">Cancelar</button>
      <button class="btn btn-primary" id="modal-save">Salvar Obra</button>
    `
  });

  setTimeout(() => {
    document.getElementById('modal-cancel')?.addEventListener('click', close);
    document.getElementById('modal-save')?.addEventListener('click', () => {
      const name = document.getElementById('pj-name').value.trim();
      if (!name) { Toast.error('Campo obrigatório', 'Informe o nome da obra.'); return; }
      const item = {
        name,
        clientId: document.getElementById('pj-client').value,
        responsible: document.getElementById('pj-responsible').value,
        category: document.getElementById('pj-category').value,
        status: document.getElementById('pj-status').value,
        address: document.getElementById('pj-address').value,
        city: document.getElementById('pj-city').value,
        contractValue: parseFloat(document.getElementById('pj-value').value) || 0,
        paymentMethod: document.getElementById('pj-payment').value,
        closedAt: document.getElementById('pj-closed').value || null,
        startDate: document.getElementById('pj-start').value || null,
        endDate: document.getElementById('pj-end').value || null,
        description: document.getElementById('pj-desc').value,
        notes: document.getElementById('pj-notes').value,
        receivedValue: 0, costValue: 0, physicalProgress: 0
      };
      Store.add('projects', item);
      close();
      Toast.success('Obra cadastrada!', `${name} adicionada com sucesso.`);
      renderObras();
    });
  }, 50);
}

function openEditProjectModal(id) {
  const p = Store.getById('projects', id);
  if (!p) return;
  const clients = Store.getList('clients');
  const responsibles = ['Carlos Henrique', 'Diego Almeida', 'Fernanda Costa'];

  const { close } = Modal.create({
    title: 'Editar Obra',
    size: 'modal-xl',
    body: `
      <div class="form-grid">
        <div class="form-group form-col-span-2">
          <label class="form-label">Nome da Obra</label>
          <input class="form-control" id="epj-name" value="${p.name}">
        </div>
        <div class="form-group">
          <label class="form-label">Cliente</label>
          <select class="form-control" id="epj-client">
            ${clients.map(c => `<option value="${c.id}" ${p.clientId===c.id?'selected':''}>${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Responsável</label>
          <select class="form-control" id="epj-responsible">
            ${responsibles.map(r => `<option ${p.responsible===r?'selected':''}>${r}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-control" id="epj-status">
            ${Object.entries(StatusHelpers.project.labels).map(([v,l]) => `<option value="${v}" ${p.status===v?'selected':''}>${l}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Progresso Físico (%)</label>
          <input class="form-control" id="epj-progress" type="number" min="0" max="100" value="${p.physicalProgress}">
        </div>
        <div class="form-group">
          <label class="form-label">Valor Contratado</label>
          <input class="form-control" id="epj-value" type="number" value="${p.contractValue}">
        </div>
        <div class="form-group">
          <label class="form-label">Início Previsto</label>
          <input class="form-control" id="epj-start" type="date" value="${p.startDate||''}">
        </div>
        <div class="form-group">
          <label class="form-label">Conclusão Prevista</label>
          <input class="form-control" id="epj-end" type="date" value="${p.endDate||''}">
        </div>
        <div class="form-group form-col-span-2">
          <label class="form-label">Descrição</label>
          <textarea class="form-control" id="epj-desc" rows="3">${p.description||''}</textarea>
        </div>
      </div>
    `,
    footer: `
      <button class="btn btn-outline" id="modal-cancel">Cancelar</button>
      <button class="btn btn-primary" id="modal-save">Salvar Alterações</button>
    `
  });

  setTimeout(() => {
    document.getElementById('modal-cancel')?.addEventListener('click', close);
    document.getElementById('modal-save')?.addEventListener('click', () => {
      Store.update('projects', id, {
        name: document.getElementById('epj-name').value,
        clientId: document.getElementById('epj-client').value,
        responsible: document.getElementById('epj-responsible').value,
        status: document.getElementById('epj-status').value,
        physicalProgress: parseInt(document.getElementById('epj-progress').value) || 0,
        contractValue: parseFloat(document.getElementById('epj-value').value) || 0,
        startDate: document.getElementById('epj-start').value || null,
        endDate: document.getElementById('epj-end').value || null,
        description: document.getElementById('epj-desc').value
      });
      close();
      Toast.success('Alterações salvas!');
      renderObras();
    });
  }, 50);
}

function deleteProject(id) {
  const p = Store.getById('projects', id);
  confirmDialog({
    title: 'Excluir Obra',
    message: `Tem certeza que deseja excluir "${p?.name}"? Esta ação não pode ser desfeita.`,
    confirmText: 'Excluir',
    type: 'danger',
    onConfirm: () => {
      Store.remove('projects', id);
      Toast.success('Obra excluída!');
      renderObras();
    }
  });
}

function openNewTransactionModal(projectId) {
  const { close } = Modal.create({
    title: 'Novo Lançamento Financeiro',
    size: 'modal-lg',
    body: `
      <div class="form-grid">
        <div class="form-group form-col-span-2">
          <label class="form-label">Descrição *</label>
          <input class="form-control" id="tx-desc" placeholder="Ex: 3ª Medição">
        </div>
        <div class="form-group">
          <label class="form-label">Valor *</label>
          <input class="form-control" id="tx-value" type="number" placeholder="0">
        </div>
        <div class="form-group">
          <label class="form-label">Forma de Pagamento</label>
          <select class="form-control" id="tx-method">
            ${['Transferência','Boleto','PIX','Cheque','Dinheiro'].map(m => `<option>${m}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Data do Lançamento</label>
          <input class="form-control" id="tx-date" type="date" value="${new Date().toISOString().split('T')[0]}">
        </div>
        <div class="form-group">
          <label class="form-label">Vencimento</label>
          <input class="form-control" id="tx-due" type="date">
        </div>
        <div class="form-group">
          <label class="form-label">Data do Pagamento</label>
          <input class="form-control" id="tx-paid" type="date">
        </div>
        <div class="form-group">
          <label class="form-label">Situação</label>
          <select class="form-control" id="tx-situation">
            ${Object.entries(StatusHelpers.financial.labels).map(([v,l]) => `<option value="${v}">${l}</option>`).join('')}
          </select>
        </div>
        <div class="form-group form-col-span-2">
          <label class="form-label">Observações</label>
          <textarea class="form-control" id="tx-notes" rows="2"></textarea>
        </div>
      </div>
    `,
    footer: `
      <button class="btn btn-outline" id="modal-cancel">Cancelar</button>
      <button class="btn btn-primary" id="modal-save">Salvar</button>
    `
  });

  setTimeout(() => {
    document.getElementById('modal-cancel')?.addEventListener('click', close);
    document.getElementById('modal-save')?.addEventListener('click', () => {
      const desc = document.getElementById('tx-desc').value.trim();
      if (!desc) { Toast.error('Campo obrigatório', 'Informe a descrição.'); return; }
      const project = Store.getById('projects', projectId);
      Store.add('financial', {
        projectId, clientId: project?.clientId,
        description: desc,
        value: parseFloat(document.getElementById('tx-value').value) || 0,
        date: document.getElementById('tx-date').value,
        dueDate: document.getElementById('tx-due').value || null,
        paidAt: document.getElementById('tx-paid').value || null,
        type: 'receita',
        situation: document.getElementById('tx-situation').value,
        paymentMethod: document.getElementById('tx-method').value,
        notes: document.getElementById('tx-notes').value
      });
      close();
      Toast.success('Lançamento adicionado!');
      openProjectDetail(projectId);
      showProjectTab('financial', projectId);
    });
  }, 50);
}

function deleteTransaction(txId, projectId) {
  confirmDialog({
    title: 'Excluir Lançamento',
    message: 'Deseja excluir este lançamento financeiro?',
    confirmText: 'Excluir',
    type: 'danger',
    onConfirm: () => {
      Store.remove('financial', txId);
      Toast.success('Lançamento excluído!');
      openProjectDetail(projectId);
      showProjectTab('financial', projectId);
    }
  });
}

function openNewOrderModal(projectId) {
  const { close } = Modal.create({
    title: 'Novo Pedido',
    size: 'modal-lg',
    body: `
      <div class="form-grid">
        <div class="form-group form-col-span-2">
          <label class="form-label">Item / Descrição *</label>
          <input class="form-control" id="ord-item" placeholder="Ex: Cimento CP II, Aço CA50, etc.">
        </div>
        <div class="form-group">
          <label class="form-label">SKU / Código</label>
          <input class="form-control" id="ord-sku" placeholder="Ex: CIM-CPII-50">
        </div>
        <div class="form-group">
          <label class="form-label">Fornecedor</label>
          <input class="form-control" id="ord-supplier" placeholder="Ex: Votorantim Materiais">
        </div>
        <div class="form-group">
          <label class="form-label">Unidade de Medida</label>
          <input class="form-control" id="ord-unit" placeholder="Ex: kg, un, m³" value="un">
        </div>
        <div class="form-group">
          <label class="form-label">Quantidade Total *</label>
          <input class="form-control" id="ord-qty" type="number" placeholder="0" min="1">
        </div>
        <div class="form-group">
          <label class="form-label">Valor Unitário (R$)</label>
          <input class="form-control" id="ord-unit-value" type="number" placeholder="0">
        </div>
        <div class="form-group">
          <label class="form-label">Previsão de Entrega</label>
          <input class="form-control" id="ord-expected" type="date">
        </div>
        <div class="form-group form-col-span-2">
          <label class="form-label">Observações</label>
          <textarea class="form-control" id="ord-notes" rows="2" placeholder="Observações sobre o pedido..."></textarea>
        </div>
      </div>
    `,
    footer: `
      <button class="btn btn-outline" id="modal-cancel">Cancelar</button>
      <button class="btn btn-primary" id="modal-save">Salvar</button>
    `
  });

  setTimeout(() => {
    document.getElementById('modal-cancel')?.addEventListener('click', close);
    document.getElementById('modal-save')?.addEventListener('click', () => {
      const item = document.getElementById('ord-item').value.trim();
      const qty = parseFloat(document.getElementById('ord-qty').value);
      if (!item || !qty) { Toast.error('Campos obrigatórios', 'Informe a descrição e quantidade.'); return; }

      Store.add('orders', {
        projectId,
        item,
        sku: document.getElementById('ord-sku').value.trim() || null,
        supplier: document.getElementById('ord-supplier').value.trim() || null,
        unit: document.getElementById('ord-unit').value || 'un',
        quantity: qty,
        delivered: 0,
        unitValue: parseFloat(document.getElementById('ord-unit-value').value) || 0,
        expectedDate: document.getElementById('ord-expected').value || null,
        notes: document.getElementById('ord-notes').value
      });
      close();
      Toast.success('Pedido adicionado!');
      openProjectDetail(projectId);
      showProjectTab('orders', projectId);
    });
  }, 50);
}

function deleteOrder(orderId, projectId) {
  confirmDialog({
    title: 'Excluir Pedido',
    message: 'Deseja excluir este pedido permanentemente?',
    confirmText: 'Excluir',
    type: 'danger',
    onConfirm: () => {
      Store.remove('orders', orderId);
      Toast.success('Pedido excluído!');
      openProjectDetail(projectId);
      showProjectTab('orders', projectId);
    }
  });
}
