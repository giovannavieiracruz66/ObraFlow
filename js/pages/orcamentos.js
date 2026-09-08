// ==========================================
// ORÇAMENTOS PAGE
// ==========================================

let orcFilter = { status: '', clientId: '', search: '', page: 1 };

function renderOrcamentos() {
  const budgets = Store.getList('budgets');
  const clients = Store.getList('clients');
  const getClientName = id => clients.find(c => c.id === id)?.name || '—';
  const metrics = Store.getMetrics();
  const m = metrics.budgetMetrics;
  const totalSent = m.enviado + m.aguardando + m.aprovado + m.recusado + m.expirado;
  const convRate = totalSent > 0 ? (m.aprovado / totalSent * 100).toFixed(1) : 0;

  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Orçamentos</h1>
        <p>${budgets.length} orçamentos cadastrados</p>
      </div>
      <div class="page-header-actions">
        ${canWrite() ? `
        <button class="btn btn-primary" onclick="openNewBudgetModal()">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Orçamento
        </button>` : ''}
      </div>
    </div>

    <!-- STATUS BAR -->
    <div class="orc-status-bar" style="margin-bottom:28px;">
      <div class="orc-status-item sent">
        <div class="orc-status-num">${m.enviado}</div>
        <div class="orc-status-label">Enviados</div>
      </div>
      <div class="orc-status-item waiting">
        <div class="orc-status-num">${m.aguardando}</div>
        <div class="orc-status-label">Aguardando</div>
      </div>
      <div class="orc-status-item approved">
        <div class="orc-status-num">${m.aprovado}</div>
        <div class="orc-status-label">Aprovados</div>
      </div>
      <div class="orc-status-item refused">
        <div class="orc-status-num">${m.recusado}</div>
        <div class="orc-status-label">Recusados</div>
      </div>
      <div class="orc-status-item" style="--after-color:var(--purple);">
        <div class="orc-status-num">${convRate}%</div>
        <div class="orc-status-label">Taxa de Conversão</div>
      </div>
    </div>

    <!-- CHARTS + FILTERS -->
    <div style="display:grid;grid-template-columns:1fr 2fr;gap:24px;margin-bottom:24px;">
      <div class="chart-card">
        <div class="chart-card-header"><div class="card-title">Distribuição</div></div>
        <div class="chart-card-body" style="height:220px;"><canvas id="chart-orc"></canvas></div>
      </div>
      <div class="card" style="padding:20px;">
        <div class="filters-bar" style="margin-bottom:16px;">
          <div class="search-wrapper">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input class="search-input" type="text" placeholder="Buscar orçamento..." value="${orcFilter.search}" oninput="orcFilter.search=this.value;orcFilter.page=1;renderOrcContent()">
          </div>
          <select class="filter-select" onchange="orcFilter.status=this.value;orcFilter.page=1;renderOrcContent()">
            <option value="">Todos os status</option>
            ${Object.entries(StatusHelpers.budget.labels).map(([v,l]) => `<option value="${v}" ${orcFilter.status===v?'selected':''}>${l}</option>`).join('')}
          </select>
          <select class="filter-select" onchange="orcFilter.clientId=this.value;orcFilter.page=1;renderOrcContent()">
            <option value="">Todos os clientes</option>
            ${clients.map(c => `<option value="${c.id}" ${orcFilter.clientId===c.id?'selected':''}>${c.name}</option>`).join('')}
          </select>
        </div>
        <div style="font-size:13px;color:var(--text-muted);">
          Total em orçamentos ativos: <strong style="color:var(--primary-800);">${fmt.currency(budgets.filter(b => ['enviado','aguardando_resposta'].includes(b.status)).reduce((s,b) => s+b.finalValue, 0))}</strong>
        </div>
      </div>
    </div>

    <!-- TABLE -->
    <div class="card">
      <div class="table-wrapper">
        <table id="orc-table">
          <thead>
            <tr><th>NÚMERO</th><th>PROJETO</th><th>CLIENTE</th><th>VALOR FINAL</th><th>CRIADO EM</th><th>VALIDADE</th><th>STATUS</th><th>AÇÕES</th></tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
      <div id="orc-pag"></div>
    </div>
  `;

  setTimeout(() => renderBudgetChart('chart-orc'), 50);
  renderOrcContent();
}

function renderOrcContent() {
  const budgets = Store.getList('budgets');
  const clients = Store.getList('clients');
  const getClientName = id => clients.find(c => c.id === id)?.name || '—';

  let filtered = budgets.filter(b => {
    const matchSearch = !orcFilter.search || b.number.toLowerCase().includes(orcFilter.search.toLowerCase()) || b.projectName.toLowerCase().includes(orcFilter.search.toLowerCase()) || getClientName(b.clientId).toLowerCase().includes(orcFilter.search.toLowerCase());
    const matchStatus = !orcFilter.status || b.status === orcFilter.status;
    const matchClient = !orcFilter.clientId || b.clientId === orcFilter.clientId;
    return matchSearch && matchStatus && matchClient;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  paginate({
    items: filtered,
    page: orcFilter.page || 1,
    perPage: 10,
    containerId: 'orc',
    tableId: 'orc-table',
    renderRow: b => `
      <tr>
        <td class="td-main">${b.number}</td>
        <td>
          <div style="font-weight:600;color:var(--text);">${b.projectName}</div>
          <div style="font-size:11px;color:var(--text-faint);">${b.services?.slice(0, 50)}${b.services?.length > 50 ? '…' : ''}</div>
        </td>
        <td>${getClientName(b.clientId)}</td>
        <td class="font-semibold" style="color:var(--primary-800);">${fmt.currency(b.finalValue)}</td>
        <td>${fmt.date(b.createdAt)}</td>
        <td>${fmt.date(b.validUntil)}</td>
        <td>${badge('budget', b.status)}</td>
        <td>
          <div style="display:flex;gap:4px;flex-wrap:wrap;">
            <button class="btn btn-sm btn-outline" onclick="openBudgetDetail('${b.id}')">Ver</button>
            ${b.status === 'aprovado' ? `<button class="btn btn-sm btn-accent" onclick="convertBudgetToProject('${b.id}')">→ Obra</button>` : ''}
            <button class="btn btn-sm btn-ghost" onclick="openEditBudgetModal('${b.id}')">Editar</button>
            <button class="btn btn-sm btn-ghost" style="color:var(--danger);" onclick="deleteBudget('${b.id}')">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `
  });
}

function openBudgetDetail(id) {
  const b = Store.getById('budgets', id);
  const client = Store.getById('clients', b.clientId);
  if (!b) return;

  Modal.create({
    title: `Orçamento ${b.number}`,
    size: 'modal-lg',
    body: `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
        <div>
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-faint);margin-bottom:4px;">Projeto</div>
          <div style="font-weight:700;font-size:16px;">${b.projectName}</div>
        </div>
        <div>
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-faint);margin-bottom:4px;">Cliente</div>
          <div style="font-weight:700;font-size:16px;">${client?.name || '—'}</div>
        </div>
        <div>
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-faint);margin-bottom:4px;">Criado em</div>
          <div style="font-weight:600;">${fmt.date(b.createdAt)}</div>
        </div>
        <div>
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-faint);margin-bottom:4px;">Válido até</div>
          <div style="font-weight:600;">${fmt.date(b.validUntil)}</div>
        </div>
      </div>
      <div style="margin-bottom:16px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-faint);margin-bottom:4px;">Serviços</div>
        <p style="font-size:13px;color:var(--text-light);">${b.services || '—'}</p>
      </div>
      <div style="background:var(--gray-50);border-radius:10px;padding:16px;margin-bottom:16px;">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;text-align:center;">
          ${[['Materiais',b.materials],['Mão de Obra',b.labor],['Desconto',b.discount||0],['Valor Final',b.finalValue]].map(([l,v],i) => `
            <div>
              <div style="font-size:11px;color:var(--text-faint);">${l}</div>
              <div style="font-size:${i===3?'20':'16'}px;font-weight:800;color:${i===2?'var(--danger)':i===3?'var(--primary-800)':'var(--text)'};">${i===2&&v>0?'-':i===2?'':''} ${fmt.currency(v)}</div>
            </div>
          `).join('')}
        </div>
      </div>
      
      ${b.attachments && b.attachments.length ? `
        <div style="margin-bottom:16px;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-faint);margin-bottom:8px;">Anexos e Versões (PDF)</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${b.attachments.map(att => `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--surface);border:1px solid var(--border);border-radius:6px;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="color:var(--danger);"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                  <span style="font-size:13px;font-weight:600;">${att.name}</span>
                </div>
                <div style="font-size:11px;color:var(--text-faint);">${fmt.date(att.date)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <div style="margin-bottom:16px;">
        <input type="file" id="b-upload-pdf" accept=".pdf" style="display:none;" onchange="handleBudgetUpload('${b.id}', this)">
        <button class="btn btn-sm btn-outline" onclick="document.getElementById('b-upload-pdf').click()">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
          Anexar Versão em PDF
        </button>
      </div>
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="font-size:13px;color:var(--text-muted);">Status:</div>
        ${badge('budget', b.status)}
        ${b.status === 'aprovado' ? `<button class="btn btn-sm btn-accent" onclick="convertBudgetToProject('${b.id}')">Converter em Obra →</button>` : ''}
      </div>
      ${b.notes ? `<div style="margin-top:12px;padding:12px;background:var(--warning-light);border-radius:8px;font-size:13px;color:var(--warning-dark);">📝 ${b.notes}</div>` : ''}
    `,
    footer: `<button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Fechar</button>`
  });
}

window.handleBudgetUpload = function(id, input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const b = Store.getById('budgets', id);
  if (!b) return;
  const att = b.attachments || [];
  att.push({
    name: file.name,
    date: new Date().toISOString()
  });
  Store.update('budgets', id, { attachments: att });
  Toast.success('PDF anexado!', 'O arquivo foi salvo no histórico do orçamento.');
  
  const modal = input.closest('.modal-overlay');
  if (modal) modal.remove();
  openBudgetDetail(id);
};

function openNewBudgetModal() {
  const clients = Store.getList('clients');
  const num = `ORC-${new Date().getFullYear()}-${String(Store.getList('budgets').length + 1).padStart(3,'0')}`;

  const { close } = Modal.create({
    title: 'Novo Orçamento',
    size: 'modal-xl',
    body: `
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Número</label>
          <input class="form-control" id="b-num" value="${num}">
        </div>
        <div class="form-group">
          <label class="form-label">Cliente *</label>
          <select class="form-control" id="b-client">
            <option value="">Selecionar</option>
            ${clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group form-col-span-2">
          <label class="form-label">Nome do Projeto *</label>
          <input class="form-control" id="b-projname" placeholder="Ex: Residência Alto Padrão">
        </div>
        <div class="form-group">
          <label class="form-label">Data de Criação</label>
          <input class="form-control" id="b-created" type="date" value="${new Date().toISOString().split('T')[0]}">
        </div>
        <div class="form-group">
          <label class="form-label">Validade</label>
          <input class="form-control" id="b-valid" type="date">
        </div>
        <div class="form-group">
          <label class="form-label">Materiais (R$)</label>
          <input class="form-control" id="b-materials" type="number" placeholder="0" oninput="calcBudgetTotal()">
        </div>
        <div class="form-group">
          <label class="form-label">Mão de Obra (R$)</label>
          <input class="form-control" id="b-labor" type="number" placeholder="0" oninput="calcBudgetTotal()">
        </div>
        <div class="form-group">
          <label class="form-label">Desconto (R$)</label>
          <input class="form-control" id="b-discount" type="number" placeholder="0" oninput="calcBudgetTotal()">
        </div>
        <div class="form-group">
          <label class="form-label">Valor Final (R$)</label>
          <input class="form-control" id="b-final" type="number" placeholder="0" style="font-weight:700;color:var(--primary-800);">
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-control" id="b-status">
            ${Object.entries(StatusHelpers.budget.labels).map(([v,l]) => `<option value="${v}">${l}</option>`).join('')}
          </select>
        </div>
        <div class="form-group form-col-span-2">
          <label class="form-label">Descrição dos Serviços</label>
          <textarea class="form-control" id="b-services" rows="3"></textarea>
        </div>
        <div class="form-group form-col-span-2">
          <label class="form-label">Observações</label>
          <textarea class="form-control" id="b-notes" rows="2"></textarea>
        </div>
      </div>
    `,
    footer: `
      <button class="btn btn-outline" id="modal-cancel">Cancelar</button>
      <button class="btn btn-primary" id="modal-save">Salvar Orçamento</button>
    `
  });

  setTimeout(() => {
    document.getElementById('modal-cancel')?.addEventListener('click', close);
    document.getElementById('modal-save')?.addEventListener('click', () => {
      const proj = document.getElementById('b-projname').value.trim();
      const clientId = document.getElementById('b-client').value;
      if (!proj || !clientId) { Toast.error('Campos obrigatórios', 'Informe o projeto e o cliente.'); return; }
      const mat = parseFloat(document.getElementById('b-materials').value)||0;
      const lab = parseFloat(document.getElementById('b-labor').value)||0;
      const disc = parseFloat(document.getElementById('b-discount').value)||0;
      Store.add('budgets', {
        number: document.getElementById('b-num').value,
        clientId, projectName: proj,
        createdAt: document.getElementById('b-created').value,
        validUntil: document.getElementById('b-valid').value,
        materials: mat, labor: lab, discount: disc,
        value: mat + lab, finalValue: parseFloat(document.getElementById('b-final').value)||(mat+lab-disc),
        services: document.getElementById('b-services').value,
        notes: document.getElementById('b-notes').value,
        status: document.getElementById('b-status').value,
        sentAt: null, respondedAt: null
      });
      close();
      Toast.success('Orçamento criado!');
      renderOrcamentos();
    });
  }, 50);
}

function calcBudgetTotal() {
  const mat = parseFloat(document.getElementById('b-materials')?.value)||0;
  const lab = parseFloat(document.getElementById('b-labor')?.value)||0;
  const disc = parseFloat(document.getElementById('b-discount')?.value)||0;
  const finalEl = document.getElementById('b-final');
  if (finalEl) finalEl.value = mat + lab - disc;
}

function openEditBudgetModal(id) {
  const b = Store.getById('budgets', id);
  if (!b) return;
  const clients = Store.getList('clients');

  const { close } = Modal.create({
    title: `Editar ${b.number}`,
    size: 'modal-lg',
    body: `
      <div class="form-grid">
        <div class="form-group form-col-span-2">
          <label class="form-label">Nome do Projeto</label>
          <input class="form-control" id="eb-projname" value="${b.projectName}">
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-control" id="eb-status">
            ${Object.entries(StatusHelpers.budget.labels).map(([v,l]) => `<option value="${v}" ${b.status===v?'selected':''}>${l}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Validade</label>
          <input class="form-control" id="eb-valid" type="date" value="${b.validUntil||''}">
        </div>
        <div class="form-group">
          <label class="form-label">Materiais (R$)</label>
          <input class="form-control" id="eb-materials" type="number" value="${b.materials}">
        </div>
        <div class="form-group">
          <label class="form-label">Mão de Obra (R$)</label>
          <input class="form-control" id="eb-labor" type="number" value="${b.labor}">
        </div>
        <div class="form-group">
          <label class="form-label">Desconto (R$)</label>
          <input class="form-control" id="eb-discount" type="number" value="${b.discount||0}">
        </div>
        <div class="form-group">
          <label class="form-label">Valor Final (R$)</label>
          <input class="form-control" id="eb-final" type="number" value="${b.finalValue}">
        </div>
        <div class="form-group form-col-span-2">
          <label class="form-label">Observações</label>
          <textarea class="form-control" id="eb-notes" rows="2">${b.notes||''}</textarea>
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
      Store.update('budgets', id, {
        projectName: document.getElementById('eb-projname').value,
        status: document.getElementById('eb-status').value,
        validUntil: document.getElementById('eb-valid').value,
        materials: parseFloat(document.getElementById('eb-materials').value)||0,
        labor: parseFloat(document.getElementById('eb-labor').value)||0,
        discount: parseFloat(document.getElementById('eb-discount').value)||0,
        finalValue: parseFloat(document.getElementById('eb-final').value)||0,
        notes: document.getElementById('eb-notes').value
      });
      close();
      Toast.success('Orçamento atualizado!');
      renderOrcamentos();
    });
  }, 50);
}

function convertBudgetToProject(budgetId) {
  const b = Store.getById('budgets', budgetId);
  if (!b) return;
  confirmDialog({
    title: 'Converter em Obra',
    message: `Deseja criar uma nova obra a partir do orçamento "${b.projectName}"?`,
    confirmText: 'Criar Obra',
    type: 'warning',
    onConfirm: () => {
      const project = Store.add('projects', {
        name: b.projectName,
        clientId: b.clientId,
        responsible: 'Carlos Henrique',
        category: 'Outros',
        status: 'aprovado',
        address: '',
        city: '',
        contractValue: b.finalValue,
        receivedValue: 0,
        costValue: b.materials + b.labor,
        paymentMethod: '',
        closedAt: new Date().toISOString().split('T')[0],
        startDate: null,
        endDate: null,
        description: b.services,
        notes: `Gerado a partir do orçamento ${b.number}`,
        physicalProgress: 0
      });
      Store.update('budgets', budgetId, { status: 'aprovado' });
      Toast.success('Obra criada!', `${b.projectName} foi adicionado como novo projeto.`);
      openProjectDetail(project.id);
    }
  });
}

function deleteBudget(id) {
  const b = Store.getById('budgets', id);
  confirmDialog({
    title: 'Excluir Orçamento',
    message: `Excluir ${b?.number}?`,
    confirmText: 'Excluir',
    type: 'danger',
    onConfirm: () => {
      Store.remove('budgets', id);
      Toast.success('Orçamento excluído!');
      renderOrcamentos();
    }
  });
}
