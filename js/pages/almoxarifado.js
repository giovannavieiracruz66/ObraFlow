// ==========================================
// ALMOXARIFADO — Previsão, Recebimento e Histórico de Materiais
// ==========================================

function projectName(id) {
  return Store.getById('projects', id)?.name || '—';
}

function daysFromToday(dateStr) {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T00:00:00');
  return Math.round((d - today) / 86400000);
}

// ── helpers combinados (orders + project_materials) ─────────────────────────
function _almoxAllPending() {
  const fromMat = Store.getList('project_materials')
    .filter(m => m.status !== 'recebido')
    .map(m => ({
      _id: m.id, _type: 'mat',
      description: m.description, item: m.description,
      supplierName: m.supplierName || '—', supplier: m.supplierName || '—',
      quantity: m.quantity || 0, receivedQty: m.receivedQty || 0,
      unit: m.unit || 'un', projectId: m.projectId,
      solNumber: m.solNumber || null,
      status: m.status,
      expectedDate: null,
    }));
  const fromOrd = Store.getList('orders')
    .filter(o => (o.quantity - o.delivered) > 0)
    .map(o => {
      const saldo = o.quantity - (o.delivered || 0);
      return {
        _id: o.id, _type: 'order',
        description: o.item || '—', item: o.item || '—',
        supplierName: o.supplier || '—', supplier: o.supplier || '—',
        quantity: o.quantity || 0, receivedQty: o.delivered || 0,
        unit: o.unit || 'un', projectId: o.projectId,
        solNumber: null,
        status: saldo <= 0 ? 'recebido' : (o.delivered > 0 ? 'parcial' : 'solicitado'),
        expectedDate: o.expectedDate || null,
      };
    });
  return [...fromMat, ...fromOrd];
}

// === DASHBOARD ===
function renderAlmoxDashboard() {
  const pending  = _almoxAllPending();
  const aguard   = pending.filter(m => m.status === 'solicitado').length;
  const parcial  = pending.filter(m => m.status === 'parcial').length;
  const today    = new Date().toISOString().slice(0, 10);
  const receipts = Store.getList('order_receipts');
  const recHoje  = receipts.filter(r => (r.receivedAt || '').slice(0, 10) === today).length;
  const recentes = [...receipts].sort((a, b) => (b.receivedAt || '').localeCompare(a.receivedAt || '')).slice(0, 6);

  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Dashboard do Almoxarifado</h1>
        <p>Visão geral de entregas e recebimentos de materiais</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-primary" onclick="navigate('almoxarifado-recebimento')" style="font-size:15px;padding:10px 20px;">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Dar Entrada em Materiais
        </button>
      </div>
    </div>

    <!-- KPIs -->
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px;margin-bottom:28px;">
      ${_dashKpi('Aguardando', aguard, '#3b82f6', '#eff6ff', '#bfdbfe', '<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>', 'almoxarifado-recebimento')}
      ${_dashKpi('Parciais', parcial, '#f59e0b', '#fffbeb', '#fde68a', '<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>', 'almoxarifado-recebimento')}
      ${_dashKpi('Entradas hoje', recHoje, '#10b981', '#f0fdf4', '#bbf7d0', '<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>', 'almoxarifado-historico')}
      ${_dashKpi('Total pendente', aguard + parcial, '#6366f1', '#eef2ff', '#c7d2fe', '<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>', 'almoxarifado-recebimento')}
    </div>

    <!-- ação rápida se tem pendentes -->
    ${(aguard + parcial) > 0 ? `
    <div style="background:#fffbeb;border:1.5px solid #fde68a;border-radius:14px;padding:18px 20px;display:flex;align-items:center;gap:16px;margin-bottom:24px;">
      <span style="font-size:28px;">📦</span>
      <div style="flex:1;">
        <div style="font-size:15px;font-weight:700;color:#92400e;">Há ${aguard + parcial} item(ns) aguardando entrada</div>
        <div style="font-size:13px;color:#b45309;margin-top:2px;">Clique em "Dar Entrada" para registrar os recebimentos de hoje.</div>
      </div>
      <button class="btn btn-primary" onclick="navigate('almoxarifado-recebimento')" style="background:#f59e0b;border-color:#f59e0b;white-space:nowrap;">
        Dar Entrada →
      </button>
    </div>` : `
    <div style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:14px;padding:18px 20px;display:flex;align-items:center;gap:16px;margin-bottom:24px;">
      <span style="font-size:28px;">✅</span>
      <div style="font-size:15px;font-weight:700;color:#065f46;">Tudo em dia! Nenhum material pendente de recebimento.</div>
    </div>`}

    <!-- últimos recebimentos -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">Últimos Recebimentos</div>
        <button class="btn btn-sm btn-outline" onclick="navigate('almoxarifado-historico')">Ver tudo</button>
      </div>
      ${recentes.length ? `
      <div class="table-wrapper">
        <table>
          <thead><tr><th>DATA</th><th>OBRA</th><th>ITEM</th><th>QTD</th><th>NF</th></tr></thead>
          <tbody>
            ${recentes.map(r => `
              <tr>
                <td style="font-weight:600;">${fmt.dateShort(r.receivedAt)}</td>
                <td class="td-main">${projectName(r.projectId)}</td>
                <td>${r.item || '—'}</td>
                <td style="font-weight:700;">${fmt.number(r.quantity)}</td>
                <td>${r.invoiceNumber || '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>` : `
      <div style="padding:32px;text-align:center;color:var(--text-muted);font-size:13px;">Nenhum recebimento registrado ainda.</div>`}
    </div>
  `;
}

function _dashKpi(label, val, color, bg, border, icon, nav) {
  return `
    <div onclick="navigate('${nav}')" style="
      background:${bg};border:1.5px solid ${border};border-radius:12px;
      padding:16px;cursor:pointer;transition:box-shadow .15s;
    " onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,.08)'" onmouseout="this.style.boxShadow='none'">
      <div style="color:${color};margin-bottom:8px;">${icon}</div>
      <div style="font-size:28px;font-weight:800;color:${color};line-height:1;">${val}</div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">${label}</div>
    </div>`;
}

// === PREVISÃO DE ENTREGAS ===
let almoxPrevisaoFilter = 'todos';

function renderAlmoxPrevisao() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Previsão de Entregas</h1>
        <p>Pedidos ainda não totalmente recebidos, organizados por data prevista</p>
      </div>
    </div>

    <div class="filters-bar">
      ${[
        ['todos', 'Todos'],
        ['hoje', 'Hoje'],
        ['amanha', 'Amanhã'],
        ['7dias', '7 Dias'],
        ['atrasados', 'Atrasados']
      ].map(([v, l]) => `<button class="btn btn-sm ${almoxPrevisaoFilter === v ? 'btn-primary' : 'btn-outline'}" onclick="almoxPrevisaoFilter='${v}';renderAlmoxPrevisao()">${l}</button>`).join('')}
    </div>

    <div id="almox-previsao-content"></div>
  `;
  renderAlmoxPrevisaoContent();
}

function renderAlmoxPrevisaoContent() {
  const orders = Store.getList('orders').filter(o => o.quantity - o.delivered > 0);

  const filtered = orders.filter(o => {
    const status = getOrderStatus(o);
    const days = daysFromToday(o.expectedDate);
    if (almoxPrevisaoFilter === 'hoje') return days === 0;
    if (almoxPrevisaoFilter === 'amanha') return days === 1;
    if (almoxPrevisaoFilter === '7dias') return days !== null && days >= 0 && days <= 7;
    if (almoxPrevisaoFilter === 'atrasados') return status === 'atrasado';
    return true;
  }).sort((a, b) => (a.expectedDate || '9999').localeCompare(b.expectedDate || '9999'));

  const container = document.getElementById('almox-previsao-content');
  if (!filtered.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Nenhuma entrega encontrada</h3>
        <p>Não há pedidos aguardando entrega para este filtro.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead><tr><th>OBRA</th><th>ITEM / SKU</th><th>FORNECEDOR</th><th>PREVISÃO</th><th>SALDO</th><th>STATUS</th><th></th></tr></thead>
          <tbody>
            ${filtered.map(o => `
              <tr>
                <td class="td-main">${projectName(o.projectId)}</td>
                <td>
                  <div class="td-main">${o.item}</div>
                  <div class="td-muted">${o.sku || '—'}</div>
                </td>
                <td>${o.supplier || '—'}</td>
                <td>${fmt.date(o.expectedDate)}</td>
                <td style="font-weight:700;">${fmt.number(o.quantity - o.delivered)} ${o.unit}</td>
                <td>${badge('order', getOrderStatus(o))}</td>
                <td><button class="btn btn-sm btn-outline" onclick="navigate('almoxarifado-recebimento')">Ir para Recebimento</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// === RECEBIMENTO DE MATERIAIS ===
let almoxRecebimentoFilter = { search: '', projectId: '' };

function renderAlmoxRecebimento() {
  const projects = Store.getList('projects').filter(p => p.status === 'em_andamento');
  const content  = document.getElementById('page-content');

  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Recebimento de Materiais</h1>
        <p>Registre a chegada de materiais — clique em DAR ENTRADA no item que chegou</p>
      </div>
    </div>

    <!-- filtros -->
    <div class="filters-bar" style="margin-bottom:20px;">
      <div class="search-wrapper">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="search-input" type="text" placeholder="Buscar item ou fornecedor..." value="${almoxRecebimentoFilter.search}"
          oninput="almoxRecebimentoFilter.search=this.value;renderAlmoxRecebimentoContent()">
      </div>
      <select class="filter-select" onchange="almoxRecebimentoFilter.projectId=this.value;renderAlmoxRecebimentoContent()">
        <option value="">Todas as obras</option>
        ${Store.getList('projects').map(p => `<option value="${p.id}" ${almoxRecebimentoFilter.projectId===p.id?'selected':''}>${p.name}</option>`).join('')}
      </select>
    </div>

    <div id="almox-recebimento-content"></div>
  `;
  renderAlmoxRecebimentoContent();
}

function renderAlmoxRecebimentoContent() {
  const q   = (almoxRecebimentoFilter.search || '').toLowerCase();
  const pid = almoxRecebimentoFilter.projectId;

  let items = _almoxAllPending().filter(m => {
    const matchSearch  = !q || m.description.toLowerCase().includes(q) || m.supplierName.toLowerCase().includes(q);
    const matchProject = !pid || m.projectId === pid;
    return matchSearch && matchProject;
  });

  // Ordena: parciais primeiro (já começaram), depois aguardando
  items.sort((a, b) => {
    const ord = { parcial: 0, solicitado: 1 };
    return (ord[a.status] ?? 2) - (ord[b.status] ?? 2);
  });

  const container = document.getElementById('almox-recebimento-content');
  if (!items.length) {
    container.innerHTML = `
      <div style="text-align:center;padding:56px 24px;color:var(--text-muted);">
        <div style="font-size:48px;margin-bottom:16px;">✅</div>
        <div style="font-size:17px;font-weight:700;color:var(--text);margin-bottom:8px;">Nenhum item pendente</div>
        <div style="font-size:13px;">Todos os materiais filtrados já foram recebidos.</div>
      </div>`;
    return;
  }

  const parciais  = items.filter(m => m.status === 'parcial');
  const aguardando = items.filter(m => m.status === 'solicitado');

  function _card(m) {
    const alreadyRec = m.receivedQty || 0;
    const falt       = m.quantity - alreadyRec;
    const pct        = m.quantity > 0 ? Math.min(100, Math.round((alreadyRec / m.quantity) * 100)) : 0;
    const barColor   = m.status === 'parcial' ? '#f59e0b' : '#3b82f6';
    const bg         = m.status === 'parcial' ? '#fffbeb' : '#eff6ff';
    const border     = m.status === 'parcial' ? '#fde68a' : '#bfdbfe';
    const proj       = projectName(m.projectId);

    const onClickBtn = m._type === 'order'
      ? `openReceiveMaterialModal('${m._id}', renderAlmoxRecebimentoContent)`
      : `_openReceberModalAlmox('${m._id}', renderAlmoxRecebimentoContent)`;

    return `
      <div style="background:${bg};border:1.5px solid ${border};border-radius:14px;padding:18px 20px;">
        <!-- obra e item -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:10px;">
          <div>
            <div style="font-size:17px;font-weight:800;color:var(--text);">${m.description}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:3px;display:flex;gap:12px;flex-wrap:wrap;">
              <span>🏗 <strong>${proj}</strong></span>
              ${m.supplierName !== '—' ? `<span>🚚 ${m.supplierName}</span>` : ''}
              ${m.solNumber ? `<span>Sol. #${m.solNumber}</span>` : ''}
            </div>
          </div>
          <span style="
            background:white;border:1.5px solid ${border};border-radius:20px;
            padding:3px 12px;font-size:11px;font-weight:700;color:${barColor};white-space:nowrap;
          ">${m.status === 'parcial' ? '📦 Entrega parcial' : '⏳ Aguardando'}</span>
        </div>

        <!-- barra de progresso -->
        <div style="margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
            <span style="color:var(--text-muted);">Progresso de entrega</span>
            <span style="font-weight:700;color:${barColor};">${pct}%</span>
          </div>
          <div style="height:10px;background:rgba(0,0,0,.08);border-radius:99px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:${barColor};border-radius:99px;"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-top:5px;">
            <span style="color:#10b981;font-weight:600;">✓ Recebido: ${Number(alreadyRec).toLocaleString('pt-BR',{maximumFractionDigits:2})} ${m.unit}</span>
            <span style="color:${barColor};font-weight:700;">Faltam: ${Number(falt).toLocaleString('pt-BR',{maximumFractionDigits:2})} ${m.unit}</span>
          </div>
        </div>

        <!-- botão dar entrada -->
        <button onclick="${onClickBtn}" style="
          display:flex;align-items:center;justify-content:center;gap:10px;
          width:100%;padding:12px;border-radius:10px;border:none;cursor:pointer;
          background:#10b981;color:#fff;font-size:15px;font-weight:800;
          box-shadow:0 2px 8px rgba(16,185,129,.3);transition:background .15s;
        "
          onmouseover="this.style.background='#059669'"
          onmouseout="this.style.background='#10b981'"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          DAR ENTRADA
        </button>
      </div>`;
  }

  function _group(title, list) {
    if (!list.length) return '';
    return `
      <div style="margin-bottom:28px;">
        <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:12px;">${title} <span style="font-size:12px;font-weight:400;color:var(--text-muted);">(${list.length})</span></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px;">
          ${list.map(_card).join('')}
        </div>
      </div>`;
  }

  container.innerHTML =
    _group('📦 Entrega parcial — dar entrada no restante', parciais) +
    _group('⏳ Aguardando primeira entrega', aguardando);
}

// === MODAL PARA project_materials (entrada via almoxarifado) ================
function _openReceberModalAlmox(itemId, onDone) {
  const item = Store.getById('project_materials', itemId);
  if (!item) return;
  const alreadyRec = item.receivedQty || 0;
  const pending    = item.quantity - alreadyRec;
  const pct        = item.quantity > 0 ? Math.min(100, Math.round((alreadyRec / item.quantity) * 100)) : 0;
  const unit       = item.unit || 'un';

  const { close } = Modal.create({
    title: '',
    size: 'modal-sm',
    body: `
      <div style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:20px;">
        <div style="font-size:18px;font-weight:800;color:var(--text);margin-bottom:4px;">${item.description}</div>
        <div style="font-size:12px;color:var(--text-muted);">
          🏗 <strong>${projectName(item.projectId)}</strong>
          ${item.supplierName ? `&nbsp;·&nbsp; 🚚 ${item.supplierName}` : ''}
        </div>
        <div style="margin-top:12px;">
          <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:4px;">
            <span>Progresso atual</span><span style="font-weight:700;">${pct}% recebido</span>
          </div>
          <div style="height:10px;background:#d1fae5;border-radius:99px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:#10b981;border-radius:99px;"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-top:6px;">
            <span style="color:#10b981;font-weight:600;">✓ Já recebido: ${Number(alreadyRec).toLocaleString('pt-BR',{maximumFractionDigits:2})} ${unit}</span>
            <span style="color:#f59e0b;font-weight:600;">Faltam: ${Number(pending).toLocaleString('pt-BR',{maximumFractionDigits:2})} ${unit}</span>
          </div>
        </div>
      </div>

      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:14px;font-weight:700;color:var(--text);margin-bottom:8px;">
          📦 Quanto chegou AGORA?
          <span style="font-size:12px;font-weight:400;color:var(--text-muted);margin-left:4px;">(em ${unit})</span>
        </label>
        <div style="display:flex;align-items:center;gap:10px;">
          <button id="rec-minus" type="button" style="width:44px;height:44px;border-radius:50%;border:2px solid var(--border);background:var(--surface-2);font-size:20px;cursor:pointer;flex-shrink:0;color:var(--text);">−</button>
          <input class="form-control" id="rec-qty" type="number" min="0.01" step="0.01" value="${pending}"
            style="text-align:center;font-size:22px;font-weight:800;height:48px;border-radius:10px;">
          <button id="rec-plus" type="button" style="width:44px;height:44px;border-radius:50%;border:2px solid var(--border);background:var(--surface-2);font-size:20px;cursor:pointer;flex-shrink:0;color:var(--text);">+</button>
        </div>
        <div id="rec-qty-hint" style="font-size:12px;color:var(--text-muted);margin-top:6px;text-align:center;">
          Pedido total: <strong>${Number(item.quantity).toLocaleString('pt-BR',{maximumFractionDigits:2})} ${unit}</strong>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">
        <div>
          <label style="display:block;font-size:13px;font-weight:600;color:var(--text);margin-bottom:6px;">🧾 Nota Fiscal <span style="font-weight:400;color:var(--text-muted);">(opcional)</span></label>
          <input class="form-control" id="rec-nf" placeholder="Ex: 12345" style="height:40px;">
        </div>
        <div>
          <label style="display:block;font-size:13px;font-weight:600;color:var(--text);margin-bottom:6px;">Data de entrega</label>
          <input class="form-control" id="rec-date" type="date" value="${new Date().toISOString().slice(0,10)}" style="height:40px;">
        </div>
      </div>
      <div>
        <label style="display:block;font-size:13px;font-weight:600;color:var(--text);margin-bottom:6px;">📝 Observação <span style="font-weight:400;color:var(--text-muted);">(opcional)</span></label>
        <textarea class="form-control" id="rec-notes" rows="2" placeholder="Ex: caixas amassadas, faltou 2 unidades..."></textarea>
      </div>
    `,
    footer: `
      <button class="btn btn-outline" id="rec-cancel" style="min-width:100px;">Cancelar</button>
      <button class="btn btn-primary" id="rec-confirm" style="min-width:180px;font-size:15px;font-weight:700;background:#10b981;border-color:#10b981;">
        ✓ Confirmar Entrada
      </button>
    `
  });

  setTimeout(() => {
    const qtyEl = document.getElementById('rec-qty');
    document.getElementById('rec-minus')?.addEventListener('click', () => {
      const v = parseFloat(qtyEl.value) || 0;
      if (v > 1) qtyEl.value = (v - 1).toFixed(2);
    });
    document.getElementById('rec-plus')?.addEventListener('click', () => {
      qtyEl.value = ((parseFloat(qtyEl.value) || 0) + 1).toFixed(2);
    });
    qtyEl?.addEventListener('input', () => {
      const v     = parseFloat(qtyEl.value) || 0;
      const hint  = document.getElementById('rec-qty-hint');
      const total = alreadyRec + v;
      if (!hint) return;
      if (total > item.quantity) {
        hint.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠ Ultrapassa o pedido (${Number(item.quantity).toLocaleString('pt-BR',{maximumFractionDigits:2})} ${unit})</span>`;
      } else if (total >= item.quantity) {
        hint.innerHTML = `<span style="color:#10b981;font-weight:600;">✓ Com essa entrada o item fica totalmente recebido!</span>`;
      } else {
        hint.innerHTML = `Ainda faltarão <strong>${Number(item.quantity-total).toLocaleString('pt-BR',{maximumFractionDigits:2})} ${unit}</strong> após esta entrada.`;
      }
    });
    document.getElementById('rec-cancel')?.addEventListener('click', close);
    document.getElementById('rec-confirm')?.addEventListener('click', () => {
      const qty = parseFloat(qtyEl.value) || 0;
      if (qty <= 0) { Toast.error('Quantidade inválida', 'Informe a quantidade que chegou.'); return; }
      const nf         = document.getElementById('rec-nf').value.trim();
      const dateVal    = document.getElementById('rec-date').value;
      const notes      = document.getElementById('rec-notes').value.trim();
      const newReceived = alreadyRec + qty;
      const newStatus   = newReceived >= item.quantity ? 'recebido' : 'parcial';
      Store.update('project_materials', itemId, {
        receivedQty:    newReceived,
        status:         newStatus,
        lastNf:         nf || item.lastNf || '',
        lastNotes:      notes,
        lastReceivedAt: dateVal || new Date().toISOString().slice(0,10),
      });
      close();
      if (newStatus === 'recebido') {
        Toast.success('Recebimento concluído! ✅', `${item.description} foi totalmente recebido.`);
      } else {
        const falt = item.quantity - newReceived;
        Toast.success('Entrada registrada! 📦', `Faltam ${Number(falt).toLocaleString('pt-BR',{maximumFractionDigits:2})} ${unit} para completar.`);
      }
      if (typeof onDone === 'function') onDone();
    });
  }, 50);
}

// === MODAL COMPARTILHADO DE RECEBIMENTO (orders legados) ===================
function openReceiveMaterialModal(orderId, onDone) {
  const order = Store.getById('orders', orderId);
  if (!order) return;
  const saldo = order.quantity - order.delivered;

  const { close } = Modal.create({
    title: 'Registrar Recebimento',
    size: 'modal-lg',
    body: `
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">
        <strong>Obra:</strong> ${projectName(order.projectId)}<br/>
        <strong>Item:</strong> ${order.item} ${order.sku ? `(${order.sku})` : ''}<br/>
        <strong>Fornecedor:</strong> ${order.supplier || '—'}<br/>
        <strong>Saldo a receber:</strong> ${fmt.number(saldo)} ${order.unit}
      </p>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Quantidade Recebida Agora *</label>
          <input class="form-control" id="rec-qty" type="number" min="0" max="${saldo}" value="${saldo}">
        </div>
        <div class="form-group">
          <label class="form-label">Número da NF</label>
          <input class="form-control" id="rec-nf" placeholder="Ex: NF-12345">
        </div>
        <div class="form-group form-col-span-2">
          <label class="form-label">Foto da Entrega / Nota Fiscal</label>
          <input class="form-control" id="rec-photo" type="file" accept="image/*">
        </div>
        <div class="form-group form-col-span-2">
          <label class="form-label">Observações</label>
          <textarea class="form-control" id="rec-notes" rows="2" placeholder="Observações sobre esta entrega..."></textarea>
        </div>
      </div>
    `,
    footer: `
      <button class="btn btn-outline" id="modal-cancel">Cancelar</button>
      <button class="btn btn-primary" id="modal-save">Confirmar Recebimento</button>
    `
  });

  setTimeout(() => {
    document.getElementById('modal-cancel')?.addEventListener('click', close);
    document.getElementById('modal-save')?.addEventListener('click', async () => {
      const qty = parseFloat(document.getElementById('rec-qty').value);
      if (!qty || qty <= 0) { Toast.error('Quantidade inválida', 'Informe uma quantidade maior que zero.'); return; }

      const photoInput = document.getElementById('rec-photo');
      const photoName = photoInput.files && photoInput.files[0] ? photoInput.files[0].name : null;

      const saveBtn = document.getElementById('modal-save');
      saveBtn.disabled = true;
      saveBtn.textContent = 'Salvando...';

      const receipt = await Store.registerReceipt(orderId, {
        quantity: qty,
        invoiceNumber: document.getElementById('rec-nf').value.trim(),
        notes: document.getElementById('rec-notes').value,
        photoName
      });

      if (!receipt) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Confirmar Recebimento';
        return;
      }

      close();
      const statusLabel = receipt.balanceAfter <= 0 ? 'Concluído' : 'Parcial';
      Toast.success('Recebimento registrado!', `Novo status: ${statusLabel}. Saldo restante: ${fmt.number(receipt.balanceAfter)} ${order.unit}.`);
      if (typeof onDone === 'function') onDone();
    });
  }, 50);
}

// === HISTÓRICO DE ENTRADAS (AUDITORIA) ===
let almoxHistoricoFilter = { search: '', projectId: '' };

function renderAlmoxHistorico() {
  const projects = Store.getList('projects');
  const content = document.getElementById('page-content');

  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Histórico de Entradas</h1>
        <p>Auditoria completa de todos os recebimentos de materiais registrados</p>
      </div>
    </div>

    <div class="filters-bar">
      <div class="search-wrapper">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="search-input" type="text" placeholder="Buscar item ou NF..." value="${almoxHistoricoFilter.search}" oninput="almoxHistoricoFilter.search=this.value;renderAlmoxHistoricoContent()">
      </div>
      <select class="filter-select" onchange="almoxHistoricoFilter.projectId=this.value;renderAlmoxHistoricoContent()">
        <option value="">Todas as obras</option>
        ${projects.map(p => `<option value="${p.id}" ${almoxHistoricoFilter.projectId === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
      </select>
    </div>

    <div id="almox-historico-content"></div>
  `;
  renderAlmoxHistoricoContent();
}

function renderAlmoxHistoricoContent() {
  const receipts = Store.getList('order_receipts')
    .filter(r => {
      const q = almoxHistoricoFilter.search.toLowerCase();
      const matchSearch = !q || r.item.toLowerCase().includes(q) || (r.invoiceNumber || '').toLowerCase().includes(q);
      const matchProject = !almoxHistoricoFilter.projectId || r.projectId === almoxHistoricoFilter.projectId;
      return matchSearch && matchProject;
    })
    .sort((a, b) => (b.receivedAt || '').localeCompare(a.receivedAt || ''));

  const container = document.getElementById('almox-historico-content');
  if (!receipts.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Nenhum recebimento encontrado</h3>
        <p>Ajuste os filtros ou registre um recebimento na tela de Recebimento de Materiais.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead><tr><th>DATA</th><th>OBRA</th><th>ITEM</th><th>QTD. RECEBIDA</th><th>NF</th><th>RECEBIDO POR</th><th>SALDO APÓS</th></tr></thead>
          <tbody>
            ${receipts.map(r => `
              <tr>
                <td>${fmt.date(r.receivedAt)}</td>
                <td class="td-main">${projectName(r.projectId)}</td>
                <td>${r.item}${r.photoName ? ' <span title="Possui foto anexada">📎</span>' : ''}</td>
                <td class="font-semibold">${fmt.number(r.quantity)}</td>
                <td>${r.invoiceNumber || '—'}</td>
                <td>${r.receivedBy}</td>
                <td style="font-weight:700;color:${r.balanceAfter > 0 ? 'var(--warning-dark)' : 'var(--success-dark)'};">${fmt.number(r.balanceAfter)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
