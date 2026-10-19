// ==========================================
// PAGAMENTOS — Contas a pagar com calendário
// ==========================================

let pagView = 'calendar';
let pagFilter = { status: '', search: '', page: 1 };
let calMonth = new Date().getMonth();
let calYear  = new Date().getFullYear();
let calSelected = null;

const PAG_STATUS = {
  pendente: { label: 'Pendente',  badge: 'badge-orange' },
  pago:     { label: 'Pago',      badge: 'badge-teal'   },
  atrasado: { label: 'Atrasado',  badge: 'badge-red'    },
};

function _pagStatusBadge(s) {
  const st = PAG_STATUS[s] || { label: s, badge: 'badge-gray' };
  return `<span class="badge ${st.badge}">${st.label}</span>`;
}

function _syncOverdue() {
  const today = new Date().toISOString().slice(0, 10);
  Store.getList('payments').forEach(p => {
    if (p.status === 'pendente' && p.dueDate && p.dueDate < today) {
      Store.update('payments', p.id, { status: 'atrasado' });
    }
  });
}

// ─── RENDER PRINCIPAL ──────────────────────────────────────────────────────
function renderPagamentos() {
  _syncOverdue();
  const content = document.getElementById('page-content');
  const payments = Store.getList('payments');
  const pending   = payments.filter(p => p.status === 'pendente').length;
  const overdue   = payments.filter(p => p.status === 'atrasado').length;
  const totalPend = payments.filter(p => ['pendente','atrasado'].includes(p.status))
                            .reduce((s, p) => s + (p.totalValue || 0), 0);

  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Pagamentos</h1>
        <p>Contas a pagar, calendário de vencimentos e controle de parcelas</p>
      </div>
      <div class="page-header-actions">
        <div style="display:flex;gap:6px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:3px;">
          <button class="btn btn-sm ${pagView==='calendar'?'btn-primary':''}" style="border-radius:6px;" onclick="pagView='calendar';renderPagamentos()">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Calendário
          </button>
          <button class="btn btn-sm ${pagView==='lista'?'btn-primary':''}" style="border-radius:6px;" onclick="pagView='lista';renderPagamentos()">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            Lista
          </button>
        </div>
        <button class="btn btn-primary" onclick="openPaymentModal()">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Pagamento
        </button>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;">
      <div class="kpi-card orange">
        <div class="kpi-top"><div class="kpi-icon orange"><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div></div>
        <div class="kpi-value">${pending}</div>
        <div class="kpi-label">Pendentes</div>
      </div>
      <div class="kpi-card red">
        <div class="kpi-top"><div class="kpi-icon red"><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg></div></div>
        <div class="kpi-value">${overdue}</div>
        <div class="kpi-label">Em Atraso</div>
      </div>
      <div class="kpi-card blue">
        <div class="kpi-top"><div class="kpi-icon blue"><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div></div>
        <div class="kpi-value" style="font-size:18px;">${fmt.currency(totalPend)}</div>
        <div class="kpi-label">Total a Pagar</div>
      </div>
    </div>

    <div id="pag-main-content"></div>
  `;

  if (pagView === 'calendar') renderPagCalendar();
  else renderPagList();
}

// ─── CALENDÁRIO ────────────────────────────────────────────────────────────
function renderPagCalendar() {
  const container = document.getElementById('pag-main-content');
  if (!container) return;

  const payments = Store.getList('payments');
  const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const today = new Date().toISOString().slice(0,10);

  const byDate = {};
  payments.forEach(p => {
    if (!p.dueDate) return;
    if (!byDate[p.dueDate]) byDate[p.dueDate] = [];
    byDate[p.dueDate].push(p);
  });

  const firstDay    = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  let cells = '';
  for (let i = 0; i < firstDay; i++) cells += `<div class="cal-cell cal-empty"></div>`;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr    = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dayPayments = byDate[dateStr] || [];
    const isToday    = dateStr === today;
    const isSelected = dateStr === calSelected;
    const hasOverdue = dayPayments.some(p => p.status === 'atrasado');
    const hasPending = dayPayments.some(p => p.status === 'pendente');
    const allPaid    = dayPayments.length > 0 && dayPayments.every(p => p.status === 'pago');

    let dotColor = '';
    if (hasOverdue)      dotColor = 'var(--danger)';
    else if (hasPending) dotColor = '#f59e0b';
    else if (allPaid)    dotColor = '#10b981';

    cells += `
      <div class="cal-cell ${isToday?'cal-today':''} ${isSelected?'cal-selected':''} ${dayPayments.length?'cal-has-events':''}"
           onclick="calSelected='${dateStr}';renderPagCalendar()">
        <span class="cal-day-num">${d}</span>
        ${dayPayments.length ? `
          <div class="cal-dots">
            ${dayPayments.slice(0,3).map(() => `<span class="cal-dot" style="background:${dotColor};"></span>`).join('')}
            ${dayPayments.length > 3 ? `<span style="font-size:9px;color:var(--text-muted);">+${dayPayments.length-3}</span>` : ''}
          </div>` : ''}
      </div>`;
  }

  const selectedPayments = calSelected ? (byDate[calSelected] || []) : [];
  const selLabel = calSelected
    ? new Date(calSelected + 'T12:00:00').toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })
    : '';

  container.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 340px;gap:20px;align-items:start;">
      <div class="card" style="padding:0;overflow:hidden;">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);">
          <button class="btn btn-ghost btn-sm" onclick="calMonth--;if(calMonth<0){calMonth=11;calYear--;}renderPagCalendar()">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <strong style="font-size:15px;">${monthNames[calMonth]} ${calYear}</strong>
          <button class="btn btn-ghost btn-sm" onclick="calMonth++;if(calMonth>11){calMonth=0;calYear++;}renderPagCalendar()">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
        <div class="cal-grid-header">
          ${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => `<div class="cal-head">${d}</div>`).join('')}
        </div>
        <div class="cal-grid">${cells}</div>
      </div>

      <div class="card" style="padding:0;overflow:hidden;">
        <div style="padding:14px 16px;border-bottom:1px solid var(--border);">
          <div style="font-size:13px;font-weight:700;color:var(--text);">
            ${calSelected ? selLabel : 'Próximos vencimentos'}
          </div>
        </div>
        <div style="padding:12px;display:flex;flex-direction:column;gap:8px;max-height:480px;overflow-y:auto;">
          ${_renderCalSidebar(calSelected, byDate)}
        </div>
      </div>
    </div>
  `;
}

function _renderCalSidebar(dateStr, byDate) {
  if (dateStr) {
    const list = byDate[dateStr] || [];
    if (!list.length) return `<p style="font-size:13px;color:var(--text-muted);text-align:center;padding:24px 0;">Nenhum pagamento nesta data.</p>`;
    return list.map(p => _pagCard(p)).join('');
  }
  const today    = new Date().toISOString().slice(0,10);
  const limit    = new Date(); limit.setDate(limit.getDate()+30);
  const limitStr = limit.toISOString().slice(0,10);
  const upcoming = Store.getList('payments')
    .filter(p => p.dueDate >= today && p.dueDate <= limitStr && p.status !== 'pago')
    .sort((a,b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 15);
  if (!upcoming.length) return `<p style="font-size:13px;color:var(--text-muted);text-align:center;padding:24px 0;">Nenhum pagamento nos próximos 30 dias.</p>`;
  return upcoming.map(p => _pagCard(p)).join('');
}

function _pagCard(p) {
  const dateLabel  = p.dueDate ? new Date(p.dueDate+'T12:00:00').toLocaleDateString('pt-BR') : '—';
  const parcelLabel = p.installments > 1 ? ` (${p.installmentNumber}/${p.installments})` : '';
  const recurrIcon  = p.recurring ? `<span title="Recorrente" style="font-size:10px;color:#6366f1;">↻</span>` : '';
  return `
    <div style="background:var(--surface-2,var(--bg));border:1px solid var(--border);border-radius:8px;padding:10px 12px;" >
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;">
        <span style="font-size:12px;font-weight:700;color:var(--text);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${recurrIcon} ${p.name}${parcelLabel}</span>
        ${_pagStatusBadge(p.status)}
      </div>
      <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">${p.product || '—'}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
        <span style="font-size:13px;font-weight:800;color:var(--primary-800);">${fmt.currency(p.totalValue || 0)}</span>
        <div style="display:flex;gap:4px;align-items:center;">
          <span style="font-size:11px;color:var(--text-faint);">Vence ${dateLabel}</span>
          <button class="btn btn-ghost btn-sm" style="padding:2px 5px;" title="Editar" onclick="openPaymentModal(null,'${p.id}')">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          ${p.status !== 'pago' ? `
          <button class="btn btn-ghost btn-sm" style="padding:2px 5px;color:var(--success,#16a34a);" title="Marcar pago" onclick="openMarkPaidModal('${p.id}')">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </button>` : ''}
        </div>
      </div>
    </div>
  `;
}

// ─── LISTA ─────────────────────────────────────────────────────────────────
function renderPagList() {
  const container = document.getElementById('pag-main-content');
  if (!container) return;

  container.innerHTML = `
    <div class="filters-bar">
      <div class="search-wrapper">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="search-input" type="text" placeholder="Buscar por nome, CNPJ ou produto..." value="${pagFilter.search}" oninput="pagFilter.search=this.value;pagFilter.page=1;renderPagListContent()">
      </div>
      <select class="filter-select" onchange="pagFilter.status=this.value;pagFilter.page=1;renderPagListContent()">
        <option value="">Todos os status</option>
        ${Object.entries(PAG_STATUS).map(([v,s]) => `<option value="${v}" ${pagFilter.status===v?'selected':''}>${s.label}</option>`).join('')}
      </select>
      <button class="btn btn-sm btn-ghost" onclick="pagFilter={status:'',search:'',page:1};renderPagListContent()">Limpar</button>
    </div>
    <div class="card">
      <div class="table-wrapper">
        <table id="pag-table">
          <thead>
            <tr>
              <th>NOME / RAZÃO SOCIAL</th>
              <th style="width:130px;">CNPJ</th>
              <th>PRODUTO / SERVIÇO</th>
              <th style="width:110px;">VALOR</th>
              <th style="width:105px;">VENCIMENTO</th>
              <th style="width:80px;">PARCELA</th>
              <th style="width:95px;">STATUS</th>
              <th style="width:100px;"></th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
      <div id="pag-pag"></div>
    </div>
  `;
  if (typeof _pageCallbacks !== 'undefined') {
    _pageCallbacks['pag'] = (p) => { pagFilter.page = p; renderPagListContent(); };
  }
  renderPagListContent();
}

function renderPagListContent() {
  const q = pagFilter.search.toLowerCase();
  const filtered = Store.getList('payments').filter(p => {
    const matchQ = !q || p.name.toLowerCase().includes(q) || (p.cnpj||'').includes(q) || (p.product||'').toLowerCase().includes(q);
    const matchS = !pagFilter.status || p.status === pagFilter.status;
    return matchQ && matchS;
  }).sort((a,b) => (a.dueDate||'').localeCompare(b.dueDate||''));

  paginate({
    items: filtered,
    page: pagFilter.page || 1,
    perPage: 15,
    containerId: 'pag',
    tableId: 'pag-table',
    onPageChange: (p) => { pagFilter.page = p; renderPagListContent(); },
    renderRow: p => {
      const dateLabel  = p.dueDate ? new Date(p.dueDate+'T12:00:00').toLocaleDateString('pt-BR') : '—';
      const parcelLabel = p.installments > 1 ? `${p.installmentNumber}/${p.installments}` : '—';
      const recurrIcon  = p.recurring ? `<span title="Recorrente" style="font-size:10px;color:#6366f1;margin-right:3px;">↻</span>` : '';
      return `
        <tr>
          <td class="td-main">${recurrIcon}${p.name}</td>
          <td style="font-family:monospace;font-size:11px;">${p.cnpj || '—'}</td>
          <td>${p.product || '—'}</td>
          <td class="font-semibold">${fmt.currency(p.totalValue || 0)}</td>
          <td>${dateLabel}</td>
          <td style="text-align:center;">${parcelLabel}</td>
          <td>${_pagStatusBadge(p.status)}</td>
          <td>
            <div style="display:flex;gap:3px;">
              <button class="btn btn-sm btn-ghost" title="Editar" onclick="openPaymentModal(null,'${p.id}')">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              ${p.status !== 'pago' ? `
              <button class="btn btn-sm btn-ghost" style="color:var(--success,#16a34a);" title="Marcar pago" onclick="openMarkPaidModal('${p.id}')">
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </button>` : ''}
              <button class="btn btn-sm btn-ghost" style="color:var(--danger);" onclick="deletePayment('${p.id}')">
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }
  });
}

// ─── MARCAR COMO PAGO (com observação e data) ──────────────────────────────
function openMarkPaidModal(id) {
  const p = Store.getById('payments', id);
  if (!p) return;
  const today = new Date().toISOString().slice(0,10);

  const { close } = Modal.create({
    title: 'Confirmar Pagamento',
    size: 'modal-sm',
    body: `
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">
        Registrando pagamento de <strong style="color:var(--text);">${p.name}</strong>
        ${p.installments > 1 ? ` — parcela ${p.installmentNumber}/${p.installments}` : ''}
        <br>Valor: <strong style="color:var(--primary-800);">${fmt.currency(p.totalValue || 0)}</strong>
      </p>
      <div class="form-group" style="margin-bottom:12px;">
        <label class="form-label">Data do pagamento</label>
        <input class="form-control" id="mp-date" type="date" value="${today}">
      </div>
      <div class="form-group">
        <label class="form-label">Observação (opcional)</label>
        <textarea class="form-control" id="mp-notes" rows="2" placeholder="Banco, forma de pagamento, comprovante..."></textarea>
      </div>
    `,
    footer: `
      <button class="btn btn-outline" id="mp-cancel">Cancelar</button>
      <button class="btn btn-primary" id="mp-confirm">Confirmar Pagamento</button>
    `
  });

  setTimeout(() => {
    document.getElementById('mp-cancel')?.addEventListener('click', close);
    document.getElementById('mp-confirm')?.addEventListener('click', () => {
      const paidAt    = document.getElementById('mp-date').value || today;
      const paidNotes = document.getElementById('mp-notes').value.trim();
      Store.update('payments', id, { status: 'pago', paidAt, paidNotes });
      close();
      Toast.success('Pagamento registrado!');
      if (pagView === 'calendar') renderPagCalendar();
      else renderPagListContent();
    });
  }, 50);
}

function deletePayment(id) {
  const p = Store.getById('payments', id);
  confirmDialog({
    title: 'Excluir Pagamento',
    message: `Excluir "${p?.name}"? Esta ação não pode ser desfeita.`,
    confirmText: 'Excluir', type: 'danger',
    onConfirm: () => {
      Store.remove('payments', id);
      Toast.success('Excluído!');
      if (pagView === 'calendar') renderPagCalendar();
      else renderPagListContent();
    }
  });
}

// ─── MODAL CRIAR / EDITAR ─────────────────────────────────────────────────
function openPaymentModal(ev, editId = null) {
  const existing = editId ? Store.getById('payments', editId) : null;
  const isEdit   = !!existing;
  const v        = (field, fallback = '') => existing?.[field] ?? fallback;
  const today    = new Date().toISOString().slice(0,10);

  const { close } = Modal.create({
    title: isEdit ? 'Editar Pagamento' : 'Novo Pagamento',
    size: 'modal-lg',
    body: `
      <div class="form-grid">
        <div class="form-group form-col-span-2">
          <label class="form-label">Razão Social / Nome *</label>
          <input class="form-control" id="np-name" value="${v('name')}" placeholder="Ex: Imobiliária Central Ltda">
        </div>
        <div class="form-group">
          <label class="form-label">CNPJ</label>
          <input class="form-control" id="np-cnpj" value="${v('cnpj')}" placeholder="00.000.000/0001-00">
        </div>
        <div class="form-group">
          <label class="form-label">Produto / Serviço</label>
          <input class="form-control" id="np-product" value="${v('product')}" placeholder="Ex: Aluguel, Energia, Material...">
        </div>
        <div class="form-group">
          <label class="form-label">Valor (por parcela) *</label>
          <input class="form-control" id="np-value" type="number" min="0" step="0.01" value="${v('totalValue','')}">
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-control" id="np-status">
            <option value="pendente" ${v('status','pendente')==='pendente'?'selected':''}>Pendente</option>
            <option value="pago"     ${v('status')==='pago'?'selected':''}>Pago</option>
          </select>
        </div>
        <div class="form-group form-col-span-2">
          <label class="form-label">Observações</label>
          <textarea class="form-control" id="np-notes" rows="2" placeholder="Nº de nota, contrato, referência...">${v('notes')}</textarea>
        </div>
      </div>

      <!-- TIPO: parcelado OU recorrente OU avulso -->
      ${isEdit ? '' : `
      <div style="border:1px solid var(--border);border-radius:10px;padding:16px;margin-top:4px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-faint);margin-bottom:12px;">Vencimento</div>
        <div style="display:flex;gap:8px;margin-bottom:14px;">
          <button class="btn btn-sm btn-outline" id="tab-avulso"   onclick="_pagSetTab('avulso')"   style="border-radius:20px;">Avulso / Parcelado</button>
          <button class="btn btn-sm btn-outline" id="tab-recorr"   onclick="_pagSetTab('recorr')"   style="border-radius:20px;">Recorrente mensal</button>
        </div>

        <!-- Avulso/Parcelado -->
        <div id="tab-avulso-body">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Nº de Parcelas</label>
              <input class="form-control" id="np-installments" type="number" min="1" max="60" value="1" oninput="updateInstallmentPreview()">
            </div>
            <div class="form-group">
              <label class="form-label">Data do 1º Vencimento *</label>
              <input class="form-control" id="np-date" type="date" value="${today}" oninput="updateInstallmentPreview()">
            </div>
          </div>
          <div id="np-preview"></div>
        </div>

        <!-- Recorrente -->
        <div id="tab-recorr-body" style="display:none;">
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">
            Gera uma conta no calendário para cada mês, sempre no mesmo dia.
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Todo dia *</label>
              <input class="form-control" id="np-recday" type="number" min="1" max="28" value="5" placeholder="1 a 28">
            </div>
            <div class="form-group">
              <label class="form-label">A partir de (mês/ano) *</label>
              <input class="form-control" id="np-recstart" type="month" value="${today.slice(0,7)}">
            </div>
            <div class="form-group">
              <label class="form-label">Quantos meses à frente *</label>
              <input class="form-control" id="np-recmonths" type="number" min="1" max="60" value="12" placeholder="Ex: 12">
            </div>
          </div>
          <div id="np-rec-preview" style="margin-top:8px;"></div>
        </div>
      </div>`}

      <!-- Edição: só data de vencimento simples -->
      ${isEdit ? `
      <div class="form-group" style="margin-top:12px;">
        <label class="form-label">Data de Vencimento</label>
        <input class="form-control" id="np-date-edit" type="date" value="${v('dueDate')}">
      </div>` : ''}
    `,
    footer: `
      <button class="btn btn-outline" id="modal-cancel">Cancelar</button>
      <button class="btn btn-primary" id="modal-save">${isEdit ? 'Salvar Alterações' : 'Salvar'}</button>
    `
  });

  setTimeout(() => {
    if (!isEdit) {
      _pagSetTab('avulso');
      updateInstallmentPreview();
    }

    document.getElementById('modal-cancel')?.addEventListener('click', close);
    document.getElementById('modal-save')?.addEventListener('click', () => {
      const name    = document.getElementById('np-name').value.trim();
      const value   = parseFloat(document.getElementById('np-value').value) || 0;
      const cnpj    = document.getElementById('np-cnpj').value.trim();
      const product = document.getElementById('np-product').value.trim();
      const notes   = document.getElementById('np-notes').value.trim();
      const status  = document.getElementById('np-status').value;

      if (!name)      { Toast.error('Campo obrigatório', 'Informe o nome.'); return; }
      if (value <= 0) { Toast.error('Campo obrigatório', 'Informe o valor.'); return; }

      if (isEdit) {
        const dueDate = document.getElementById('np-date-edit')?.value || existing.dueDate;
        Store.update('payments', editId, { name, cnpj, product, notes, status, totalValue: value, dueDate });
        close();
        Toast.success('Pagamento atualizado!');
        if (pagView === 'calendar') renderPagCalendar(); else renderPagListContent();
        return;
      }

      // Novo: avulso/parcelado ou recorrente
      const isRecorr = document.getElementById('tab-recorr')?.classList.contains('btn-primary');

      if (isRecorr) {
        const recDay    = parseInt(document.getElementById('np-recday').value) || 5;
        const recStart  = document.getElementById('np-recstart').value; // YYYY-MM
        const recMonths = parseInt(document.getElementById('np-recmonths').value) || 12;
        if (!recStart) { Toast.error('Campo obrigatório', 'Informe o mês de início.'); return; }
        const [startYear, startMonth] = recStart.split('-').map(Number);
        for (let i = 0; i < recMonths; i++) {
          const d = new Date(startYear, startMonth - 1 + i, recDay, 12);
          // Se o dia não existe no mês (ex: dia 31 em fevereiro), usa o último dia
          if (d.getDate() !== recDay) d.setDate(0);
          const dueDate = d.toISOString().slice(0,10);
          Store.add('payments', {
            name, cnpj, product, notes,
            totalValue: value,
            installments: recMonths,
            installmentNumber: i + 1,
            dueDate,
            recurring: true,
            status: 'pendente',
            paidAt: null
          });
        }
        close();
        Toast.success('Recorrência criada!', `${recMonths} vencimentos adicionados ao calendário.`);
      } else {
        const n       = parseInt(document.getElementById('np-installments').value) || 1;
        const dateVal = document.getElementById('np-date').value;
        if (!dateVal) { Toast.error('Campo obrigatório', 'Informe a data de vencimento.'); return; }
        const installValue = parseFloat((value / n).toFixed(2));
        for (let i = 0; i < n; i++) {
          const d = new Date(dateVal + 'T12:00:00');
          d.setMonth(d.getMonth() + i);
          const dueDate = d.toISOString().slice(0,10);
          Store.add('payments', {
            name, cnpj, product, notes,
            totalValue: installValue,
            installments: n,
            installmentNumber: i + 1,
            dueDate,
            recurring: false,
            status: status === 'pago' ? 'pago' : 'pendente',
            paidAt: status === 'pago' ? dueDate : null
          });
        }
        close();
        Toast.success('Pagamento salvo!', n > 1 ? `${n} parcelas adicionadas.` : 'Adicionado ao calendário.');
      }

      renderPagamentos();
    });
  }, 50);
}

let _pagCurrentTab = 'avulso';
function _pagSetTab(tab) {
  _pagCurrentTab = tab;
  const tabs = ['avulso','recorr'];
  tabs.forEach(t => {
    const btn  = document.getElementById(`tab-${t}`);
    const body = document.getElementById(`tab-${t}-body`);
    if (btn)  { btn.classList.toggle('btn-primary', t === tab); btn.classList.toggle('btn-outline', t !== tab); }
    if (body) body.style.display = t === tab ? '' : 'none';
  });
  if (tab === 'recorr') _updateRecurrPreview();
  else updateInstallmentPreview();
}

function _updateRecurrPreview() {
  const prev = document.getElementById('np-rec-preview');
  if (!prev) return;
  const recDay    = parseInt(document.getElementById('np-recday')?.value) || 5;
  const recStart  = document.getElementById('np-recstart')?.value;
  const recMonths = parseInt(document.getElementById('np-recmonths')?.value) || 12;
  const value     = parseFloat(document.getElementById('np-value')?.value) || 0;
  if (!recStart) { prev.innerHTML = ''; return; }
  const [startYear, startMonth] = recStart.split('-').map(Number);
  const monthNames = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  let rows = '';
  for (let i = 0; i < Math.min(recMonths, 6); i++) {
    const d = new Date(startYear, startMonth - 1 + i, recDay, 12);
    if (d.getDate() !== recDay) d.setDate(0);
    rows += `<div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid var(--border);">
      <span style="color:var(--text-muted);">Todo dia ${recDay} de ${monthNames[d.getMonth()]}/${d.getFullYear()}</span>
      ${value > 0 ? `<span style="font-weight:700;color:var(--primary-800);">${fmt.currency(value)}</span>` : ''}
    </div>`;
  }
  if (recMonths > 6) rows += `<div style="font-size:11px;color:var(--text-muted);padding-top:4px;">... e mais ${recMonths-6} meses</div>`;
  prev.innerHTML = `
    <div style="background:var(--surface-2,#f8fafc);border:1px solid var(--border);border-radius:8px;padding:12px;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-faint);margin-bottom:8px;">Prévia (${recMonths} meses)</div>
      ${rows}
    </div>`;
}

function updateInstallmentPreview() {
  const n     = parseInt(document.getElementById('np-installments')?.value) || 1;
  const date  = document.getElementById('np-date')?.value;
  const value = parseFloat(document.getElementById('np-value')?.value) || 0;
  const prev  = document.getElementById('np-preview');
  if (!prev) return;
  if (n <= 1 || !date) { prev.innerHTML = ''; return; }
  const installValue = value > 0 ? parseFloat((value / n).toFixed(2)) : 0;
  const monthNames   = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  let rows = '';
  for (let i = 0; i < Math.min(n, 12); i++) {
    const d = new Date(date + 'T12:00:00');
    d.setMonth(d.getMonth() + i);
    rows += `<div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid var(--border);">
      <span style="color:var(--text-muted);">Parcela ${i+1}/${n} — ${String(d.getDate()).padStart(2,'0')}/${monthNames[d.getMonth()]}/${d.getFullYear()}</span>
      ${installValue > 0 ? `<span style="font-weight:700;color:var(--primary-800);">${fmt.currency(installValue)}</span>` : ''}
    </div>`;
  }
  if (n > 12) rows += `<div style="font-size:11px;color:var(--text-muted);padding-top:4px;">... e mais ${n-12} parcelas</div>`;
  prev.innerHTML = `
    <div style="background:var(--surface-2,#f8fafc);border:1px solid var(--border);border-radius:8px;padding:12px;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-faint);margin-bottom:8px;">Prévia das parcelas</div>
      ${rows}
    </div>`;
}

// Alias mantido para compatibilidade com botões inline antigos
function openNewPaymentModal() { openPaymentModal(); }
function markPaymentPaid(id)   { openMarkPaidModal(id); }
