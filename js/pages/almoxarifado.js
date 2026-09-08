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

// === DASHBOARD ===
function renderAlmoxDashboard() {
  const m = Store.getAlmoxMetrics();
  const content = document.getElementById('page-content');

  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Dashboard do Almoxarifado</h1>
        <p>Visão geral de pedidos, entregas e recebimentos de materiais</p>
      </div>
      <div class="page-header-actions">
        ${canWrite() ? `
        <button class="btn btn-primary" onclick="navigate('almoxarifado-recebimento')">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 12v7a1 1 0 01-1 1H5a1 1 0 01-1-1v-7M16 6l-4-4-4 4M12 2v13"/></svg>
          Registrar Recebimento
        </button>` : ''}
      </div>
    </div>

    <div class="dashboard-kpis">
      <div class="kpi-card blue"><div class="kpi-label">Pedidos Pendentes</div><div class="kpi-value">${m.pending}</div></div>
      <div class="kpi-card orange"><div class="kpi-label">Entregas Parciais</div><div class="kpi-value">${m.partial}</div></div>
      <div class="kpi-card red"><div class="kpi-label">Atrasados</div><div class="kpi-value">${m.overdue}</div></div>
      <div class="kpi-card green"><div class="kpi-label">Recebimentos Hoje</div><div class="kpi-value">${m.receiptsToday}</div></div>
    </div>

    <div class="grid grid-cols-2" style="gap:24px;margin-top:24px;">
      <div class="card">
        <div class="card-header">
          <div class="card-title" style="color:var(--warning-dark);">Entregas Atrasadas</div>
          <button class="btn btn-sm btn-outline" onclick="navigate('almoxarifado-previsao')">Ver previsão</button>
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>OBRA</th><th>ITEM</th><th>PREVISÃO</th><th>SALDO</th></tr></thead>
            <tbody>
              ${m.overdueOrders.length ? m.overdueOrders.map(o => `
                <tr>
                  <td class="td-main">${projectName(o.projectId)}</td>
                  <td>${o.item}</td>
                  <td style="color:var(--danger);font-weight:600;">${fmt.date(o.expectedDate)}</td>
                  <td>${o.quantity - o.delivered} ${o.unit}</td>
                </tr>
              `).join('') : '<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--text-muted);">Nenhuma entrega atrasada</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">Últimos Recebimentos</div>
          <button class="btn btn-sm btn-outline" onclick="navigate('almoxarifado-historico')">Ver histórico</button>
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>DATA</th><th>OBRA</th><th>ITEM</th><th>QTD.</th><th>NF</th></tr></thead>
            <tbody>
              ${m.recentReceipts.length ? m.recentReceipts.map(r => `
                <tr>
                  <td>${fmt.dateShort(r.receivedAt)}</td>
                  <td class="td-main">${projectName(r.projectId)}</td>
                  <td>${r.item}</td>
                  <td class="font-semibold">${r.quantity}</td>
                  <td>${r.invoiceNumber || '—'}</td>
                </tr>
              `).join('') : '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-muted);">Nenhum recebimento registrado</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
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
                <td style="font-weight:700;">${o.quantity - o.delivered} ${o.unit}</td>
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
  const projects = Store.getList('projects');
  const content = document.getElementById('page-content');

  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Recebimento de Materiais</h1>
        <p>Registre a chegada de materiais na obra — entradas parciais ou totais</p>
      </div>
    </div>

    <div class="filters-bar">
      <div class="search-wrapper">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="search-input" type="text" placeholder="Buscar item, SKU ou fornecedor..." value="${almoxRecebimentoFilter.search}" oninput="almoxRecebimentoFilter.search=this.value;renderAlmoxRecebimentoContent()">
      </div>
      <select class="filter-select" onchange="almoxRecebimentoFilter.projectId=this.value;renderAlmoxRecebimentoContent()">
        <option value="">Todas as obras</option>
        ${projects.map(p => `<option value="${p.id}" ${almoxRecebimentoFilter.projectId === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
      </select>
    </div>

    <div id="almox-recebimento-content"></div>
  `;
  renderAlmoxRecebimentoContent();
}

function renderAlmoxRecebimentoContent() {
  const orders = Store.getList('orders').filter(o => o.quantity - o.delivered > 0);

  const filtered = orders.filter(o => {
    const q = almoxRecebimentoFilter.search.toLowerCase();
    const matchSearch = !q || o.item.toLowerCase().includes(q) || (o.sku || '').toLowerCase().includes(q) || (o.supplier || '').toLowerCase().includes(q);
    const matchProject = !almoxRecebimentoFilter.projectId || o.projectId === almoxRecebimentoFilter.projectId;
    return matchSearch && matchProject;
  }).sort((a, b) => {
    const order = { atrasado: 0, parcial: 1, pendente: 2 };
    return (order[getOrderStatus(a)] ?? 3) - (order[getOrderStatus(b)] ?? 3);
  });

  const container = document.getElementById('almox-recebimento-content');
  if (!filtered.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Nenhum pedido aguardando recebimento</h3>
        <p>Todos os materiais filtrados já foram totalmente entregues.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead><tr><th>OBRA</th><th>ITEM / SKU</th><th>FORNECEDOR</th><th>PREVISÃO</th><th>SALDO A RECEBER</th><th>STATUS</th><th></th></tr></thead>
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
                <td style="font-weight:700;">${o.quantity - o.delivered} ${o.unit}</td>
                <td>${badge('order', getOrderStatus(o))}</td>
                <td>${canWrite() ? `<button class="btn btn-sm btn-primary" onclick="openReceiveMaterialModal('${o.id}', renderAlmoxRecebimentoContent)">Receber</button>` : ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// === MODAL COMPARTILHADO DE RECEBIMENTO ===
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
        <strong>Saldo a receber:</strong> ${saldo} ${order.unit}
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
      Toast.success('Recebimento registrado!', `Novo status: ${statusLabel}. Saldo restante: ${receipt.balanceAfter} ${order.unit}.`);
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
                <td class="font-semibold">${r.quantity}</td>
                <td>${r.invoiceNumber || '—'}</td>
                <td>${r.receivedBy}</td>
                <td style="font-weight:700;color:${r.balanceAfter > 0 ? 'var(--warning-dark)' : 'var(--success-dark)'};">${r.balanceAfter}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
