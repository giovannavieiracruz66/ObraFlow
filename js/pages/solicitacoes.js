// ==========================================
// SOLICITAÇÕES DE COMPRA
// ==========================================

function _nextSolNumber() {
  const all = Store.getList('purchase_requests');
  const max = all.reduce((m, r) => Math.max(m, parseInt(r.number) || 0), 0);
  return String(max + 1);
}

// ─── ABA NA OBRA ───────────────────────────────────────────────────────────
function renderSolicitacoesTab(projectId) {
  const container = document.getElementById('project-tab-content');
  if (!container) return;

  const sols = Store.getList('purchase_requests')
    .filter(r => r.projectId === projectId)
    .sort((a, b) => parseInt(b.number) - parseInt(a.number));

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Solicitações de Compra</div>
        ${canWrite() ? `<button class="btn btn-sm btn-primary" onclick="openNewSolicitacaoModal('${projectId}')">+ Nova Solicitação</button>` : ''}
      </div>
      ${sols.length ? `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th style="width:80px;">Nº</th>
              <th style="width:110px;">DATA</th>
              <th>FORNECEDOR</th>
              <th>PRODUTO / INSUMO</th>
              <th style="width:120px;">TOTAL</th>
              <th style="width:110px;"></th>
            </tr>
          </thead>
          <tbody>
            ${sols.map(s => {
              const total = (s.items || []).reduce((sum, i) => sum + (parseFloat(i.finalPrice) || 0), 0)
                          + parseFloat(s.freightValue || 0) + parseFloat(s.otherExpenses || 0) - parseFloat(s.discount || 0);
              const itemNames = (s.items || []).map(i => i.description).filter(Boolean).join(', ');
              return `
                <tr>
                  <td class="td-main" style="font-weight:800;">${s.number}</td>
                  <td>${s.createdAt ? new Date(s.createdAt).toLocaleDateString('pt-BR') : '—'}</td>
                  <td>${s.supplierName || '—'}</td>
                  <td style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:var(--text-muted);">${itemNames || '—'}</td>
                  <td class="font-semibold">${fmt.currency(total)}</td>
                  <td>
                    <div style="display:flex;gap:4px;">
                      <button class="btn btn-sm btn-outline" onclick="generateSolicitacaoPDF('${s.id}')">
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                        PDF
                      </button>
                      <button class="btn btn-sm btn-ghost" style="color:var(--danger);" onclick="deleteSolicitacao('${s.id}','${projectId}')">
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>` : `
      <div style="padding:32px;text-align:center;color:var(--text-muted);">
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 12px;display:block;opacity:.4;"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        <p style="font-size:13px;">Nenhuma solicitação emitida ainda.</p>
        ${canWrite() ? `<button class="btn btn-sm btn-primary" style="margin-top:12px;" onclick="openNewSolicitacaoModal('${projectId}')">Criar Primeira Solicitação</button>` : ''}
      </div>`}
    </div>
  `;
}

// ─── NOVO MODAL ────────────────────────────────────────────────────────────
function openNewSolicitacaoModal(projectId) {
  const project  = Store.getById('projects', projectId);
  const client   = project ? Store.getById('clients', project.clientId) : null;
  const suppliers = Store.getList('suppliers');
  const number   = _nextSolNumber();

  const { close } = Modal.create({
    title: `Nova Solicitação de Compra — Nº ${number}`,
    size: 'modal-xl',
    body: `
      <div style="display:flex;flex-direction:column;gap:20px;">

        <!-- FORNECEDOR -->
        <div>
          <div class="sol-section-title">Fornecedor</div>
          <div class="form-grid">
            <div class="form-group form-col-span-2">
              <label class="form-label">Razão Social *</label>
              <select class="form-control" id="sol-supplier" onchange="solFillSupplier(this.value)">
                <option value="">Selecionar fornecedor cadastrado...</option>
                ${suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                <option value="__manual">Digitar manualmente</option>
              </select>
            </div>
            <div class="form-group form-col-span-2" id="sol-name-wrap" style="display:none;">
              <label class="form-label">Nome / Razão Social (manual)</label>
              <input class="form-control" id="sol-name" placeholder="Nome do fornecedor">
            </div>
            <div class="form-group">
              <label class="form-label">CNPJ</label>
              <input class="form-control" id="sol-cnpj" placeholder="00.000.000/0001-00">
            </div>
            <div class="form-group">
              <label class="form-label">Telefone</label>
              <input class="form-control" id="sol-phone" placeholder="(00) 00000-0000">
            </div>
            <div class="form-group form-col-span-2">
              <label class="form-label">Endereço</label>
              <input class="form-control" id="sol-address" placeholder="Rua, número, cidade - UF / CEP">
            </div>
            <div class="form-group">
              <label class="form-label">E-mail</label>
              <input class="form-control" id="sol-email" placeholder="email@fornecedor.com">
            </div>
            <div class="form-group">
              <label class="form-label">Vendedor / Representante</label>
              <input class="form-control" id="sol-vendor" placeholder="Nome do contato">
            </div>
          </div>
        </div>

        <!-- ENTREGA -->
        <div>
          <div class="sol-section-title">Entrega</div>
          <div class="form-grid">
            <div class="form-group form-col-span-2">
              <label class="form-label">Local de Entrega</label>
              <input class="form-control" id="sol-delivery" value="${[project?.address, project?.city].filter(Boolean).join(' - ') || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Ponto de Referência</label>
              <input class="form-control" id="sol-ref" placeholder="Ex: Guarita, Portão 2...">
            </div>
            <div class="form-group">
              <label class="form-label">Frete</label>
              <select class="form-control" id="sol-freight-type">
                <option value="RETIRA">RETIRA</option>
                <option value="CIF">CIF (Entrega inclusa)</option>
                <option value="FOB">FOB</option>
              </select>
            </div>
          </div>
        </div>

        <!-- ITENS -->
        <div>
          <div class="sol-section-title" style="display:flex;align-items:center;justify-content:space-between;">
            <span>Itens / Insumos</span>
            <button class="btn btn-sm btn-outline" onclick="addSolItem()">+ Adicionar Item</button>
          </div>
          <div class="table-wrapper" style="margin-top:8px;">
            <table id="sol-items-table" style="font-size:12px;">
              <thead>
                <tr>
                  <th style="min-width:200px;">INSUMO / PRODUTO</th>
                  <th style="width:80px;">QTD</th>
                  <th style="width:60px;">UNID.</th>
                  <th style="width:110px;">PREÇO UNIT.</th>
                  <th style="width:90px;">PREÇO FINAL</th>
                  <th style="width:110px;">PREVISÃO</th>
                  <th style="width:30px;"></th>
                </tr>
              </thead>
              <tbody id="sol-items-body"></tbody>
            </table>
          </div>
        </div>

        <!-- PAGAMENTO / TOTAIS -->
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Condição de Pagamento</label>
            <input class="form-control" id="sol-payment-terms" value="${project?.paymentMethod || '28 DIAS'}" placeholder="Ex: 28 DIAS, À VISTA...">
          </div>
          <div class="form-group">
            <label class="form-label">Desconto (R$)</label>
            <input class="form-control" id="sol-discount" type="number" value="0" min="0" oninput="updateSolTotals()">
          </div>
          <div class="form-group">
            <label class="form-label">Frete (R$)</label>
            <input class="form-control" id="sol-freight-value" type="number" value="0" min="0" oninput="updateSolTotals()">
          </div>
          <div class="form-group">
            <label class="form-label">Outras Despesas (R$)</label>
            <input class="form-control" id="sol-other" type="number" value="0" min="0" oninput="updateSolTotals()">
          </div>
          <div class="form-group form-col-span-2">
            <label class="form-label">Observações</label>
            <textarea class="form-control" id="sol-notes" rows="2" placeholder="Informações adicionais para o fornecedor..."></textarea>
          </div>
        </div>

        <!-- TOTAL -->
        <div style="background:var(--surface-2,#f8fafc);border:1px solid var(--border);border-radius:8px;padding:14px 16px;display:flex;flex-direction:column;gap:6px;align-items:flex-end;">
          <div style="display:flex;gap:32px;font-size:12px;color:var(--text-muted);">
            <span>Total dos insumos: <strong id="sol-t-items" style="color:var(--text);">R$ 0,00</strong></span>
            <span>Desconto: <strong id="sol-t-disc" style="color:var(--text);">R$ 0,00</strong></span>
            <span>Frete: <strong id="sol-t-frt" style="color:var(--text);">R$ 0,00</strong></span>
            <span>Outras: <strong id="sol-t-other" style="color:var(--text);">R$ 0,00</strong></span>
          </div>
          <div style="font-size:16px;font-weight:800;color:var(--primary-800);">Total do Pedido: <span id="sol-t-total">R$ 0,00</span></div>
        </div>
      </div>
    `,
    footer: `
      <button class="btn btn-outline" id="modal-cancel">Cancelar</button>
      <button class="btn btn-primary" id="modal-save">Salvar e Gerar PDF</button>
    `
  });

  setTimeout(() => {
    // Primeiro item em branco
    addSolItem();
    updateSolTotals();

    document.getElementById('modal-cancel')?.addEventListener('click', close);
    document.getElementById('modal-save')?.addEventListener('click', () => {
      const supplierSel = document.getElementById('sol-supplier').value;
      const isManual    = supplierSel === '__manual';
      const supplierName = isManual
        ? document.getElementById('sol-name').value.trim()
        : (Store.getById('suppliers', supplierSel)?.name || supplierSel);

      if (!supplierName) { Toast.error('Campo obrigatório', 'Informe o fornecedor.'); return; }

      const items = _readSolItems();
      if (!items.length) { Toast.error('Sem itens', 'Adicione pelo menos um item.'); return; }

      const data = {
        number:      number,
        projectId,
        clientId:    project?.clientId || null,
        supplierId:  isManual ? null : supplierSel,
        supplierName,
        supplierCnpj:    document.getElementById('sol-cnpj').value.trim(),
        supplierPhone:   document.getElementById('sol-phone').value.trim(),
        supplierAddress: document.getElementById('sol-address').value.trim(),
        supplierEmail:   document.getElementById('sol-email').value.trim(),
        supplierVendor:  document.getElementById('sol-vendor').value.trim(),
        deliveryAddress: document.getElementById('sol-delivery').value.trim(),
        deliveryRef:     document.getElementById('sol-ref').value.trim(),
        freightType:     document.getElementById('sol-freight-type').value,
        paymentTerms:    document.getElementById('sol-payment-terms').value.trim(),
        discount:        parseFloat(document.getElementById('sol-discount').value) || 0,
        freightValue:    parseFloat(document.getElementById('sol-freight-value').value) || 0,
        otherExpenses:   parseFloat(document.getElementById('sol-other').value) || 0,
        notes:           document.getElementById('sol-notes').value.trim(),
        items,
        createdAt: new Date().toISOString(),
        status: 'emitida'
      };

      Store.add('purchase_requests', data);
      close();
      Toast.success('Solicitação salva!');

      // Gera PDF imediatamente
      const newSol = Store.getList('purchase_requests').find(r => r.number === number && r.projectId === projectId);
      if (newSol) generateSolicitacaoPDF(newSol.id);

      renderSolicitacoesTab(projectId);
    });
  }, 50);
}

function solFillSupplier(supplierId) {
  const nameWrap = document.getElementById('sol-name-wrap');
  if (supplierId === '__manual') {
    if (nameWrap) nameWrap.style.display = '';
    document.getElementById('sol-cnpj').value    = '';
    document.getElementById('sol-phone').value   = '';
    document.getElementById('sol-address').value = '';
    document.getElementById('sol-email').value   = '';
    document.getElementById('sol-vendor').value  = '';
    return;
  }
  if (nameWrap) nameWrap.style.display = 'none';
  if (!supplierId) return;
  const s = Store.getById('suppliers', supplierId);
  if (!s) return;
  document.getElementById('sol-cnpj').value    = s.cnpj    || '';
  document.getElementById('sol-phone').value   = s.phone   || '';
  document.getElementById('sol-address').value = s.address ? `${s.address}${s.city ? ', ' + s.city : ''}${s.state ? ' - ' + s.state : ''}${s.zip ? ' / ' + s.zip : ''}` : '';
  document.getElementById('sol-email').value   = s.email   || '';
  document.getElementById('sol-vendor').value  = s.contactName || '';
}

let _solItemIdx = 0;
function addSolItem() {
  const tbody = document.getElementById('sol-items-body');
  if (!tbody) return;
  const idx = _solItemIdx++;
  const row = document.createElement('tr');
  row.id = `sol-row-${idx}`;
  row.innerHTML = `
    <td>
      <div style="position:relative;">
        <input class="form-control" style="font-size:12px;padding:5px 8px;" id="sol-desc-${idx}" placeholder="Nome do insumo ou material" oninput="updateSolTotals()">
      </div>
    </td>
    <td><input class="form-control" style="font-size:12px;padding:5px 8px;text-align:right;" id="sol-qty-${idx}" type="number" min="0" step="0.01" value="1" oninput="calcSolRowTotal(${idx});updateSolTotals()"></td>
    <td><input class="form-control" style="font-size:12px;padding:5px 8px;" id="sol-unit-${idx}" placeholder="un" value="un"></td>
    <td><input class="form-control" style="font-size:12px;padding:5px 8px;text-align:right;" id="sol-price-${idx}" type="number" min="0" step="0.01" value="0" oninput="calcSolRowTotal(${idx});updateSolTotals()"></td>
    <td><input class="form-control" style="font-size:12px;padding:5px 8px;text-align:right;background:var(--surface-2,#f8fafc);" id="sol-final-${idx}" readonly value="0,00"></td>
    <td><input class="form-control" style="font-size:12px;padding:5px 8px;" id="sol-date-${idx}" type="date"></td>
    <td>
      <button class="btn btn-ghost btn-sm" style="color:var(--danger);padding:4px;" onclick="removeSolItem(${idx})">
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </td>
  `;
  tbody.appendChild(row);

  // Autocomplete de materiais (se disponível)
  const descInput = document.getElementById(`sol-desc-${idx}`);
  if (typeof attachMatAutocomplete === 'function') {
    attachMatAutocomplete(descInput, (mat) => {
      document.getElementById(`sol-unit-${idx}`).value  = mat.unit  || 'un';
      document.getElementById(`sol-price-${idx}`).value = mat.defaultPrice || 0;
      calcSolRowTotal(idx);
      updateSolTotals();
    });
  }
}

function removeSolItem(idx) {
  document.getElementById(`sol-row-${idx}`)?.remove();
  updateSolTotals();
}

function calcSolRowTotal(idx) {
  const qty   = parseFloat(document.getElementById(`sol-qty-${idx}`)?.value)   || 0;
  const price = parseFloat(document.getElementById(`sol-price-${idx}`)?.value) || 0;
  const final = qty * price;
  const el    = document.getElementById(`sol-final-${idx}`);
  if (el) el.value = final.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function updateSolTotals() {
  const rows = document.querySelectorAll('[id^="sol-row-"]');
  let itemsTotal = 0;
  rows.forEach(row => {
    const idx = row.id.replace('sol-row-', '');
    const qty   = parseFloat(document.getElementById(`sol-qty-${idx}`)?.value)   || 0;
    const price = parseFloat(document.getElementById(`sol-price-${idx}`)?.value) || 0;
    itemsTotal += qty * price;
  });
  const disc  = parseFloat(document.getElementById('sol-discount')?.value)      || 0;
  const frt   = parseFloat(document.getElementById('sol-freight-value')?.value) || 0;
  const other = parseFloat(document.getElementById('sol-other')?.value)         || 0;
  const total = itemsTotal - disc + frt + other;

  const f = (v) => fmt.currency(v);
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = f(val); };
  set('sol-t-items', itemsTotal);
  set('sol-t-disc',  disc);
  set('sol-t-frt',   frt);
  set('sol-t-other', other);
  set('sol-t-total', total);
}

function _readSolItems() {
  const rows = document.querySelectorAll('[id^="sol-row-"]');
  const items = [];
  rows.forEach(row => {
    const idx  = row.id.replace('sol-row-', '');
    const desc = document.getElementById(`sol-desc-${idx}`)?.value?.trim();
    if (!desc) return;
    const qty   = parseFloat(document.getElementById(`sol-qty-${idx}`)?.value)   || 0;
    const unit  = document.getElementById(`sol-unit-${idx}`)?.value?.trim() || 'un';
    const price = parseFloat(document.getElementById(`sol-price-${idx}`)?.value) || 0;
    const date  = document.getElementById(`sol-date-${idx}`)?.value || '';
    items.push({ description: desc, quantity: qty, unit, unitPrice: price, finalPrice: qty * price, expectedDate: date });
  });
  return items;
}

function deleteSolicitacao(id, projectId) {
  confirmDialog({
    title: 'Excluir Solicitação',
    message: 'Excluir esta solicitação de compra? A ação não pode ser desfeita.',
    confirmText: 'Excluir', type: 'danger',
    onConfirm: () => {
      Store.remove('purchase_requests', id);
      Toast.success('Solicitação excluída!');
      renderSolicitacoesTab(projectId);
    }
  });
}

// ─── GERAÇÃO DO PDF ────────────────────────────────────────────────────────
function generateSolicitacaoPDF(solId) {
  const sol     = Store.getById('purchase_requests', solId);
  if (!sol) { Toast.error('Não encontrado', 'Solicitação não encontrada.'); return; }
  const project = Store.getById('projects', sol.projectId);
  const client  = project ? Store.getById('clients', project.clientId) : null;

  const dateStr = sol.createdAt
    ? new Date(sol.createdAt).toLocaleDateString('pt-BR')
    : new Date().toLocaleDateString('pt-BR');

  const itemsTotal = (sol.items || []).reduce((s, i) => s + (parseFloat(i.finalPrice) || 0), 0);
  const total      = itemsTotal - (sol.discount || 0) + (sol.freightValue || 0) + (sol.otherExpenses || 0);

  const itemRows = (sol.items || []).map(i => {
    const dateLabel = i.expectedDate ? new Date(i.expectedDate + 'T12:00:00').toLocaleDateString('pt-BR') : '';
    return `
      <tr>
        <td>${i.description || ''}</td>
        <td style="text-align:right;">${Number(i.quantity || 0).toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
        <td style="text-align:center;">${i.unit || 'un'}</td>
        <td style="text-align:right;">${Number(i.unitPrice || 0).toLocaleString('pt-BR', {minimumFractionDigits:4})}</td>
        <td style="text-align:right;">0,00</td>
        <td style="text-align:right;">0,00</td>
        <td style="text-align:right;">0,00</td>
        <td style="text-align:right;">${Number(i.finalPrice || 0).toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
        <td style="text-align:center;">${dateLabel}</td>
        <td></td>
      </tr>`;
  }).join('');

  const fmtVal = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  const clientName    = client?.name  || project?.name || '';
  const clientAddr    = client?.address || '';
  const clientCnpj    = client?.cpfCnpj || '';
  const clientPhone   = client?.phone  || '';
  const clientEmail   = client?.email  || project?.contactEmail || '';
  const projectName   = project?.name  || '';

  const obsDefault = `Prezado fornecedor,<br>
1. Favor constar o número do pedido no campo de observações da Nota Fiscal.<br>
2. Informar a forma de pagamento (Depósito bancário ou boleto) e, caso ocorra através de depósito bancário, favor constar os dados bancários do favorecido no campo de observações da Nota Fiscal.<br>
3. Caso não esteja descrita nas informações da Nota Fiscal, favor discriminar a data de vencimento da fatura.<br>
${sol.notes ? `4. ${sol.notes}<br>` : ''}
Sujeito a bloqueio de pagamento em caso de não cumprimento das especificações anteriores.<br>
Quaisquer dúvidas, favor entrar em contato com o setor de compras para resolução de vossos questionamentos.`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Solicitação de Compra ${sol.number}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 9pt; color: #000; background: #fff; }
  table { width: 100%; border-collapse: collapse; }
  td, th { border: 1px solid #999; padding: 3px 5px; vertical-align: middle; }
  .no-border td, .no-border th { border: none; }
  .section-header { background: #1a1a2e; color: #fff; font-weight: bold; font-size: 8pt; text-align: center; padding: 4px; border: 1px solid #999; }
  .label { font-weight: bold; font-size: 8pt; width: 90px; background: #f0f0f0; }
  .page { max-width: 790px; margin: 0 auto; padding: 16px; }
  .title-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .company-box { border: 2px solid #1a1a2e; padding: 8px 12px; display: flex; align-items: center; gap: 8px; width: 200px; }
  .company-name { font-size: 14pt; font-weight: 900; color: #1a1a2e; letter-spacing: -1px; }
  .doc-title { font-size: 18pt; font-weight: 900; text-align: right; color: #1a1a2e; }
  .pedido-bar { display: flex; gap: 0; margin-bottom: 8px; }
  .pedido-bar td { font-size: 9pt; }
  .items-table th { background: #e8e8e8; font-size: 8pt; text-align: center; padding: 4px; }
  .items-table td { font-size: 8.5pt; }
  .totals-table td { font-size: 9pt; padding: 3px 8px; }
  .total-label { font-weight: bold; text-align: right; background: #f0f0f0; }
  .total-val { text-align: right; min-width: 80px; }
  .grand-total { font-weight: 900; font-size: 10pt; background: #e8e8e8; }
  .obs-text { font-size: 8pt; line-height: 1.5; }
  .signature { text-align: center; margin-top: 48px; border-top: 1px solid #000; padding-top: 8px; font-weight: bold; display: inline-block; width: 220px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="page">

  <!-- TÍTULO -->
  <div class="title-bar">
    <div class="company-box">
      <div>
        <div class="company-name">Gerente</div>
        <div style="font-size:7pt;color:#666;">de Obras</div>
      </div>
    </div>
    <div class="doc-title">Solicitação de Compra</div>
  </div>

  <!-- PEDIDO / DATA -->
  <table class="pedido-bar" style="margin-bottom:8px;">
    <tr>
      <td class="label" style="width:60px;">Pedido</td>
      <td style="font-weight:900;font-size:10pt;">${sol.number}</td>
      <td class="label" style="width:90px;">Data do pedido</td>
      <td style="font-weight:bold;">${dateStr}</td>
    </tr>
  </table>

  <!-- FATURAMENTO -->
  <div class="section-header">Informações para faturamento</div>
  <table style="margin-bottom:0;">
    <tr><td class="label">Nome</td><td colspan="3">${clientName}</td></tr>
    <tr><td class="label">Endereço</td><td colspan="3">${clientAddr}</td></tr>
    <tr>
      <td class="label">CNPJ</td><td>${clientCnpj}</td>
      <td class="label" style="width:30px;">IE</td><td></td>
    </tr>
    <tr>
      <td class="label">Telefone</td><td>${clientPhone}</td>
      <td class="label">Fax</td><td></td>
    </tr>
    <tr><td class="label">E-mail</td><td colspan="3">${clientEmail}</td></tr>
  </table>

  <!-- COBRANÇA -->
  <div class="section-header" style="margin-top:6px;">Informações para cobrança</div>
  <table style="margin-bottom:0;">
    <tr><td class="label">Endereço</td><td>${clientAddr}</td></tr>
  </table>

  <!-- FORNECEDOR -->
  <div class="section-header" style="margin-top:6px;">Dados do fornecedor</div>
  <table style="margin-bottom:0;">
    <tr><td class="label">Razão social</td><td colspan="3">${sol.supplierName || ''}</td></tr>
    <tr><td class="label">Endereço</td><td colspan="3">${sol.supplierAddress || ''}</td></tr>
    <tr>
      <td class="label">CNPJ/CPF</td><td>${sol.supplierCnpj || ''}</td>
      <td class="label" style="width:30px;">IE</td><td></td>
    </tr>
    <tr>
      <td class="label">Telefone</td><td>${sol.supplierPhone || ''}</td>
      <td class="label">Fax</td><td></td>
    </tr>
    <tr>
      <td class="label">Vendedor</td><td>${sol.supplierVendor || ''}</td>
      <td class="label">E-mail</td><td>${sol.supplierEmail || ''}</td>
    </tr>
    <tr>
      <td class="label">Representante</td><td></td>
      <td class="label">Fone repres.</td><td></td>
    </tr>
  </table>

  <!-- ENTREGA -->
  <div class="section-header" style="margin-top:6px;">Informações para entrega</div>
  <table style="margin-bottom:0;">
    <tr><td class="label">Obra</td><td>${projectName}</td></tr>
    <tr><td class="label">Local entrega</td><td>${sol.deliveryAddress || ''}</td></tr>
    <tr><td class="label">Ponto referência</td><td>${sol.deliveryRef || ''}</td></tr>
  </table>

  <!-- ITENS -->
  <table class="items-table" style="margin-top:8px;">
    <thead>
      <tr>
        <th style="text-align:left;min-width:160px;">Insumo</th>
        <th style="width:60px;">Quantidade</th>
        <th style="width:40px;">Unid.</th>
        <th style="width:80px;">Preço unit.</th>
        <th style="width:65px;">Desc(R$)</th>
        <th style="width:45px;">%Desc</th>
        <th style="width:35px;">%IPI</th>
        <th style="width:35px;">%Acr</th>
        <th style="width:70px;">Preço final</th>
        <th style="width:75px;">Data previsão</th>
        <th style="width:60px;">Referência</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <!-- RODAPÉ TOTAIS + OBS -->
  <table style="margin-top:4px;">
    <tr>
      <td style="width:110px;" class="label">Cond. pagamento</td>
      <td style="width:100px;">${sol.paymentTerms || ''}</td>
      <td style="width:50px;" class="label">Frete</td>
      <td style="width:80px;">${sol.freightType || 'RETIRA'}</td>
      <td class="total-label" style="width:110px;">Total dos insumos</td>
      <td class="total-val">${fmtVal(itemsTotal)}</td>
    </tr>
    <tr>
      <td class="label" style="vertical-align:top;padding-top:6px;" rowspan="4">Observações</td>
      <td colspan="3" class="obs-text" rowspan="4" style="vertical-align:top;padding:6px;">${obsDefault}</td>
      <td class="total-label">Desconto</td>
      <td class="total-val">${fmtVal(sol.discount || 0)}</td>
    </tr>
    <tr>
      <td class="total-label">Frete</td>
      <td class="total-val">${fmtVal(sol.freightValue || 0)}</td>
    </tr>
    <tr>
      <td class="total-label">Outras despesas</td>
      <td class="total-val">${fmtVal(sol.otherExpenses || 0)}</td>
    </tr>
    <tr>
      <td class="total-label grand-total">Total do pedido</td>
      <td class="total-val grand-total">${fmtVal(total)}</td>
    </tr>
  </table>

  <!-- ASSINATURA -->
  <div style="text-align:center;margin-top:40px;">
    <div style="display:inline-block;border-top:1px solid #000;padding-top:6px;min-width:220px;font-weight:bold;font-size:10pt;">
      ${clientName || 'EMPRESA'}
    </div>
  </div>

</div>
<script>window.onload = () => { setTimeout(() => window.print(), 400); }</script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  win.document.write(html);
  win.document.close();
}
