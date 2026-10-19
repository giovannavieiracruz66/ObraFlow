// ==========================================
// MATERIAIS / ALMOXARIFADO
// Fluxo: Lista de Materiais → Solicitação de Compra → Recebimento
// ==========================================

const MAT_STATUS = {
  pendente:   { label: 'Pendente',   badge: 'badge-orange', color: '#f59e0b' },
  solicitado: { label: 'Solicitado', badge: 'badge-blue',   color: '#3b82f6' },
  recebido:   { label: 'Recebido',   badge: 'badge-teal',   color: '#10b981' },
};

function _matBadge(s) {
  const st = MAT_STATUS[s] || { label: s, badge: 'badge-gray' };
  return `<span class="badge ${st.badge}">${st.label}</span>`;
}

function _nextSolNumber() {
  const all = Store.getList('purchase_requests');
  const max = all.reduce((m, r) => Math.max(m, parseInt(r.number) || 0), 0);
  return String(max + 1);
}

// ─── ABA PRINCIPAL ─────────────────────────────────────────────────────────
function renderMateriaisTab(projectId) {
  const container = document.getElementById('project-tab-content');
  if (!container) return;
  container.innerHTML = `<div id="mat-list-section"></div><div id="mat-sol-section" style="margin-top:24px;"></div>`;
  _renderMaterialList(projectId);
  _renderSolicitacoesSection(projectId);
}

// ─── LISTA DE MATERIAIS ────────────────────────────────────────────────────
function _renderMaterialList(projectId) {
  const container = document.getElementById('mat-list-section');
  if (!container) return;

  const items = Store.getList('project_materials')
    .filter(m => m.projectId === projectId)
    .sort((a, b) => {
      const ord = { pendente: 0, solicitado: 1, recebido: 2 };
      return (ord[a.status] ?? 0) - (ord[b.status] ?? 0);
    });

  const pendentes = items.filter(m => m.status === 'pendente');

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Lista de Materiais</div>
        <div style="display:flex;gap:8px;">
          ${pendentes.length ? `
          <button class="btn btn-sm btn-primary" onclick="_openGerarSolicitacao('${projectId}')">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Gerar Sol. de Compra
          </button>` : ''}
          ${canWrite() ? `
          <button class="btn btn-sm btn-outline" onclick="openMaterialModal('${projectId}')">
            + Adicionar Item
          </button>` : ''}
        </div>
      </div>
      ${items.length ? `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ITEM / INSUMO</th>
              <th style="width:80px;">QTD</th>
              <th style="width:55px;">UNID.</th>
              <th>OBSERVAÇÃO</th>
              <th style="width:100px;">STATUS</th>
              <th style="width:110px;"></th>
            </tr>
          </thead>
          <tbody>
            ${items.map(m => `
              <tr>
                <td class="td-main">${m.description}</td>
                <td style="text-align:right;">${Number(m.quantity||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
                <td style="text-align:center;">${m.unit||'un'}</td>
                <td style="font-size:12px;color:var(--text-muted);">${m.notes||'—'}</td>
                <td>${_matBadge(m.status)}</td>
                <td>
                  <div style="display:flex;gap:3px;">
                    ${m.status !== 'recebido' ? `
                    <button class="btn btn-sm btn-ghost" style="color:#10b981;" title="Marcar como recebido" onclick="_markMatReceived('${m.id}','${projectId}')">
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </button>` : ''}
                    <button class="btn btn-sm btn-ghost" title="Editar" onclick="openMaterialModal('${projectId}','${m.id}')">
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button class="btn btn-sm btn-ghost" style="color:var(--danger);" onclick="_deleteMaterial('${m.id}','${projectId}')">
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div style="display:flex;gap:20px;padding:12px 16px;border-top:1px solid var(--border);font-size:12px;color:var(--text-muted);">
        ${Object.entries(MAT_STATUS).map(([k,s]) => {
          const c = items.filter(m => m.status === k).length;
          return `<span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${s.color};margin-right:4px;"></span>${s.label}: <strong style="color:var(--text);">${c}</strong></span>`;
        }).join('')}
      </div>` : `
      <div style="padding:32px;text-align:center;color:var(--text-muted);">
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 12px;display:block;opacity:.35;"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
        <p style="font-size:13px;">Nenhum material cadastrado ainda.</p>
        ${canWrite() ? `<button class="btn btn-sm btn-primary" style="margin-top:12px;" onclick="openMaterialModal('${projectId}')">Adicionar Primeiro Item</button>` : ''}
      </div>`}
    </div>
  `;
}

function openMaterialModal(projectId, editId = null) {
  const existing = editId ? Store.getById('project_materials', editId) : null;
  const isEdit   = !!existing;
  const v        = (field, fallback = '') => existing?.[field] ?? fallback;

  const { close } = Modal.create({
    title: isEdit ? 'Editar Item' : 'Adicionar Item',
    size: 'modal-sm',
    body: `
      <div class="form-group">
        <label class="form-label">Descrição / Insumo *</label>
        <input class="form-control" id="mi-desc" value="${v('description')}" placeholder="Ex: Cimento CP-II, Areia grossa...">
      </div>
      <div class="form-grid" style="margin-top:12px;">
        <div class="form-group">
          <label class="form-label">Quantidade</label>
          <input class="form-control" id="mi-qty" type="number" min="0" step="0.01" value="${v('quantity',1)}">
        </div>
        <div class="form-group">
          <label class="form-label">Unidade</label>
          <input class="form-control" id="mi-unit" value="${v('unit','un')}" placeholder="un, m², kg, sc...">
        </div>
      </div>
      ${isEdit ? `
      <div class="form-group" style="margin-top:12px;">
        <label class="form-label">Status</label>
        <select class="form-control" id="mi-status">
          ${Object.entries(MAT_STATUS).map(([k,s]) => `<option value="${k}" ${v('status','pendente')===k?'selected':''}>${s.label}</option>`).join('')}
        </select>
      </div>` : ''}
      <div class="form-group" style="margin-top:12px;">
        <label class="form-label">Observação</label>
        <textarea class="form-control" id="mi-notes" rows="2" placeholder="Especificação, referência...">${v('notes')}</textarea>
      </div>
    `,
    footer: `
      <button class="btn btn-outline" id="mi-cancel">Cancelar</button>
      <button class="btn btn-primary" id="mi-save">${isEdit ? 'Salvar' : 'Adicionar'}</button>
    `
  });

  setTimeout(() => {
    document.getElementById('mi-cancel')?.addEventListener('click', close);
    document.getElementById('mi-save')?.addEventListener('click', () => {
      const desc = document.getElementById('mi-desc').value.trim();
      if (!desc) { Toast.error('Campo obrigatório', 'Informe a descrição.'); return; }
      const data = {
        projectId,
        description: desc,
        quantity:    parseFloat(document.getElementById('mi-qty').value) || 1,
        unit:        document.getElementById('mi-unit').value.trim() || 'un',
        notes:       document.getElementById('mi-notes').value.trim(),
        status:      isEdit ? document.getElementById('mi-status').value : 'pendente',
      };
      if (isEdit) Store.update('project_materials', editId, data);
      else Store.add('project_materials', data);
      close();
      Toast.success(isEdit ? 'Item atualizado!' : 'Item adicionado!');
      _renderMaterialList(projectId);
    });
  }, 50);
}

function _markMatReceived(id, projectId) {
  Store.update('project_materials', id, { status: 'recebido' });
  Toast.success('Material recebido!');
  _renderMaterialList(projectId);
}

function _deleteMaterial(id, projectId) {
  confirmDialog({
    title: 'Remover Item',
    message: 'Remover este material da lista?',
    confirmText: 'Remover', type: 'danger',
    onConfirm: () => {
      Store.remove('project_materials', id);
      Toast.success('Removido!');
      _renderMaterialList(projectId);
    }
  });
}

// ─── GERAR SOLICITAÇÃO DE COMPRA ────────────────────────────────────────────
function _openGerarSolicitacao(projectId) {
  const pendentes = Store.getList('project_materials')
    .filter(m => m.projectId === projectId && m.status === 'pendente');
  if (!pendentes.length) {
    Toast.error('Sem itens pendentes', 'Todos os materiais já foram solicitados ou recebidos.');
    return;
  }
  openSolicitacaoModal(projectId, null, pendentes);
}

// ─── SEÇÃO SOLICITAÇÕES EMITIDAS ────────────────────────────────────────────
function _renderSolicitacoesSection(projectId) {
  const container = document.getElementById('mat-sol-section');
  if (!container) return;

  const sols = Store.getList('purchase_requests')
    .filter(r => r.projectId === projectId)
    .sort((a, b) => parseInt(b.number) - parseInt(a.number));

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Solicitações de Compra Emitidas</div>
        ${canWrite() ? `<button class="btn btn-sm btn-outline" onclick="openSolicitacaoModal('${projectId}')">+ Nova Solicitação Manual</button>` : ''}
      </div>
      ${sols.length ? `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th style="width:70px;">Nº</th>
              <th style="width:100px;">DATA</th>
              <th>FORNECEDOR</th>
              <th>ITENS</th>
              <th style="width:120px;">TOTAL</th>
              <th style="width:130px;"></th>
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
                  <td style="font-size:12px;">${s.createdAt ? new Date(s.createdAt).toLocaleDateString('pt-BR') : '—'}</td>
                  <td>${s.supplierName || '—'}</td>
                  <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:var(--text-muted);">${itemNames || '—'}</td>
                  <td class="font-semibold">${fmt.currency(total)}</td>
                  <td>
                    <div style="display:flex;gap:4px;">
                      <button class="btn btn-sm btn-ghost" title="Editar" onclick="openSolicitacaoModal('${projectId}','${s.id}')">
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
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
      <div style="padding:20px;text-align:center;color:var(--text-muted);font-size:13px;">
        Nenhuma solicitação emitida. Adicione materiais acima e clique em "Gerar Sol. de Compra".
      </div>`}
    </div>
  `;
}

// ─── MODAL SOLICITAÇÃO ──────────────────────────────────────────────────────
function openSolicitacaoModal(projectId, editId = null, prefillItems = null) {
  const project   = Store.getById('projects', projectId);
  const suppliers = Store.getList('suppliers');
  const existing  = editId ? Store.getById('purchase_requests', editId) : null;
  const number    = existing ? existing.number : _nextSolNumber();
  const isEdit    = !!existing;
  const v         = (field, fallback = '') => existing?.[field] ?? fallback;

  const { close } = Modal.create({
    title: isEdit ? `Editar Solicitação Nº ${number}` : `Nova Solicitação de Compra — Nº ${number}`,
    size: 'modal-xl',
    body: `
      <div style="display:flex;flex-direction:column;gap:20px;">
        <div>
          <div class="sol-section-title">Fornecedor</div>
          <div class="form-grid">
            <div class="form-group form-col-span-2">
              <label class="form-label">Selecionar do cadastro</label>
              <select class="form-control" id="sol-supplier" onchange="solFillSupplier(this.value)">
                <option value="">Selecionar fornecedor...</option>
                ${suppliers.map(s => `<option value="${s.id}" ${v('supplierId')===s.id?'selected':''}>${s.name}</option>`).join('')}
                <option value="__manual" ${!v('supplierId') && v('supplierName') ? 'selected' : ''}>Digitar manualmente</option>
              </select>
            </div>
            <div class="form-group form-col-span-2" id="sol-name-wrap" style="${!v('supplierId') && v('supplierName') ? '' : 'display:none;'}">
              <label class="form-label">Razão Social (manual)</label>
              <input class="form-control" id="sol-name" value="${v('supplierName')}">
            </div>
            <div class="form-group"><label class="form-label">CNPJ</label><input class="form-control" id="sol-cnpj" value="${v('supplierCnpj')}"></div>
            <div class="form-group"><label class="form-label">Telefone</label><input class="form-control" id="sol-phone" value="${v('supplierPhone')}"></div>
            <div class="form-group form-col-span-2"><label class="form-label">Endereço</label><input class="form-control" id="sol-address" value="${v('supplierAddress')}"></div>
            <div class="form-group"><label class="form-label">E-mail</label><input class="form-control" id="sol-email" value="${v('supplierEmail')}"></div>
            <div class="form-group"><label class="form-label">Vendedor / Contato</label><input class="form-control" id="sol-vendor" value="${v('supplierVendor')}"></div>
          </div>
        </div>
        <div>
          <div class="sol-section-title">Entrega</div>
          <div class="form-grid">
            <div class="form-group form-col-span-2"><label class="form-label">Local de Entrega</label><input class="form-control" id="sol-delivery" value="${v('deliveryAddress', [project?.address, project?.city].filter(Boolean).join(' - '))}"></div>
            <div class="form-group"><label class="form-label">Ponto de Referência</label><input class="form-control" id="sol-ref" value="${v('deliveryRef')}" placeholder="Guarita, portão..."></div>
            <div class="form-group">
              <label class="form-label">Frete</label>
              <select class="form-control" id="sol-freight-type">${['RETIRA','CIF','FOB'].map(f=>`<option value="${f}" ${v('freightType','RETIRA')===f?'selected':''}>${f}</option>`).join('')}</select>
            </div>
          </div>
        </div>
        <div>
          <div class="sol-section-title" style="display:flex;align-items:center;justify-content:space-between;">
            <span>Itens / Insumos</span>
            <button class="btn btn-sm btn-outline" onclick="addSolItem()">+ Item</button>
          </div>
          <div class="table-wrapper" style="margin-top:8px;">
            <table id="sol-items-table" style="font-size:12px;">
              <thead><tr>
                <th style="min-width:180px;">INSUMO / PRODUTO</th>
                <th style="width:75px;">QTD</th>
                <th style="width:55px;">UNID.</th>
                <th style="width:110px;">PREÇO UNIT.</th>
                <th style="width:100px;">PREÇO FINAL</th>
                <th style="width:110px;">PREVISÃO</th>
                <th style="width:30px;"></th>
              </tr></thead>
              <tbody id="sol-items-body"></tbody>
            </table>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-group"><label class="form-label">Condição de Pagamento</label><input class="form-control" id="sol-payment-terms" value="${v('paymentTerms', project?.paymentMethod || '28 DIAS')}"></div>
          <div class="form-group"><label class="form-label">Desconto (R$)</label><input class="form-control" id="sol-discount" type="number" value="${v('discount',0)}" min="0" oninput="updateSolTotals()"></div>
          <div class="form-group"><label class="form-label">Frete (R$)</label><input class="form-control" id="sol-freight-value" type="number" value="${v('freightValue',0)}" min="0" oninput="updateSolTotals()"></div>
          <div class="form-group"><label class="form-label">Outras Despesas (R$)</label><input class="form-control" id="sol-other" type="number" value="${v('otherExpenses',0)}" min="0" oninput="updateSolTotals()"></div>
          <div class="form-group form-col-span-2"><label class="form-label">Observações</label><textarea class="form-control" id="sol-notes" rows="2">${v('notes')}</textarea></div>
        </div>
        <div style="background:var(--surface-2,#f8fafc);border:1px solid var(--border);border-radius:8px;padding:14px 16px;">
          <div style="display:flex;flex-wrap:wrap;gap:20px;justify-content:flex-end;font-size:12px;color:var(--text-muted);margin-bottom:6px;">
            <span>Insumos: <strong id="sol-t-items" style="color:var(--text);">R$ 0,00</strong></span>
            <span>Desconto: <strong id="sol-t-disc" style="color:var(--text);">R$ 0,00</strong></span>
            <span>Frete: <strong id="sol-t-frt" style="color:var(--text);">R$ 0,00</strong></span>
            <span>Outras: <strong id="sol-t-other" style="color:var(--text);">R$ 0,00</strong></span>
          </div>
          <div style="text-align:right;font-size:16px;font-weight:800;color:var(--primary-800);">Total: <span id="sol-t-total">R$ 0,00</span></div>
        </div>
      </div>
    `,
    footer: `
      <button class="btn btn-outline" id="modal-cancel">Cancelar</button>
      <button class="btn btn-primary" id="modal-save">${isEdit ? 'Salvar Alterações' : 'Salvar e Gerar PDF'}</button>
    `
  });

  setTimeout(() => {
    _solItemIdx = 0;
    if (existing?.items?.length) {
      existing.items.forEach(item => addSolItem(item));
    } else if (prefillItems?.length) {
      prefillItems.forEach(m => addSolItem({ description: m.description, quantity: m.quantity, unit: m.unit || 'un', unitPrice: 0, finalPrice: 0, expectedDate: '', _materialId: m.id }));
    } else {
      addSolItem();
    }
    updateSolTotals();

    document.getElementById('modal-cancel')?.addEventListener('click', close);
    document.getElementById('modal-save')?.addEventListener('click', () => {
      const supplierSel  = document.getElementById('sol-supplier').value;
      const isManual     = supplierSel === '__manual' || supplierSel === '';
      const supplierRec  = Store.getById('suppliers', supplierSel);
      const supplierName = isManual
        ? document.getElementById('sol-name')?.value.trim()
        : (supplierRec?.name || '');
      if (!supplierName) { Toast.error('Campo obrigatório', 'Informe o fornecedor.'); return; }
      const items = _readSolItems();
      if (!items.length) { Toast.error('Sem itens', 'Adicione pelo menos um item.'); return; }

      const data = {
        number, projectId,
        clientId:        project?.clientId || null,
        supplierId:      isManual ? null : supplierSel,
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
        items, status: 'emitida',
      };

      if (isEdit) {
        Store.update('purchase_requests', editId, data);
        close();
        Toast.success('Solicitação atualizada!');
        renderMateriaisTab(projectId);
      } else {
        data.createdAt = new Date().toISOString();
        Store.add('purchase_requests', data);
        // Marca itens da lista como "solicitado"
        if (prefillItems?.length) {
          prefillItems.forEach(m => Store.update('project_materials', m.id, { status: 'solicitado' }));
        }
        close();
        Toast.success('Solicitação salva!');
        setTimeout(() => {
          const newSol = Store.getList('purchase_requests').find(r => r.number === number && r.projectId === projectId);
          if (newSol) generateSolicitacaoPDF(newSol.id);
        }, 300);
        renderMateriaisTab(projectId);
      }
    });
  }, 50);
}

function solFillSupplier(supplierId) {
  const nameWrap = document.getElementById('sol-name-wrap');
  if (supplierId === '__manual' || supplierId === '') { if (nameWrap) nameWrap.style.display = ''; return; }
  if (nameWrap) nameWrap.style.display = 'none';
  const s = Store.getById('suppliers', supplierId);
  if (!s) return;
  document.getElementById('sol-cnpj').value    = s.cnpj    || '';
  document.getElementById('sol-phone').value   = s.phone   || '';
  document.getElementById('sol-address').value = [s.address, s.city, s.state ? `- ${s.state}` : '', s.zip ? `/ ${s.zip}` : ''].filter(Boolean).join(' ');
  document.getElementById('sol-email').value   = s.email   || '';
  document.getElementById('sol-vendor').value  = s.contactName || '';
}

let _solItemIdx = 0;
function addSolItem(prefill = null) {
  const tbody = document.getElementById('sol-items-body');
  if (!tbody) return;
  const idx = _solItemIdx++;
  const p   = prefill || {};
  const row = document.createElement('tr');
  row.id = `sol-row-${idx}`;
  row.innerHTML = `
    <td style="padding:4px;"><input class="form-control" style="font-size:12px;padding:5px 8px;" id="sol-desc-${idx}" value="${p.description||''}" placeholder="Descrição do insumo"></td>
    <td style="padding:4px;"><input class="form-control" style="font-size:12px;padding:5px 8px;text-align:right;" id="sol-qty-${idx}" type="number" min="0" step="0.01" value="${p.quantity||1}" oninput="calcSolRowTotal(${idx});updateSolTotals()"></td>
    <td style="padding:4px;"><input class="form-control" style="font-size:12px;padding:5px 8px;" id="sol-unit-${idx}" value="${p.unit||'un'}"></td>
    <td style="padding:4px;"><input class="form-control" style="font-size:12px;padding:5px 8px;text-align:right;" id="sol-price-${idx}" type="number" min="0" step="0.01" value="${p.unitPrice||0}" oninput="calcSolRowTotal(${idx});updateSolTotals()"></td>
    <td style="padding:4px;"><input class="form-control" style="font-size:12px;padding:5px 8px;text-align:right;background:var(--surface-2,#f8fafc);" id="sol-final-${idx}" readonly value="${p.finalPrice ? Number(p.finalPrice).toLocaleString('pt-BR',{minimumFractionDigits:2}) : '0,00'}"></td>
    <td style="padding:4px;"><input class="form-control" style="font-size:12px;padding:5px 8px;" id="sol-date-${idx}" type="date" value="${p.expectedDate||''}"></td>
    <td style="padding:4px;text-align:center;">
      <button class="btn btn-ghost btn-sm" style="color:var(--danger);padding:3px 5px;" onclick="removeSolItem(${idx})">
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </td>`;
  tbody.appendChild(row);
  if (typeof attachMatAutocomplete === 'function') {
    attachMatAutocomplete(document.getElementById(`sol-desc-${idx}`), (mat) => {
      document.getElementById(`sol-unit-${idx}`).value  = mat.unit || 'un';
      document.getElementById(`sol-price-${idx}`).value = mat.defaultPrice || 0;
      calcSolRowTotal(idx); updateSolTotals();
    });
  }
  if (prefill) calcSolRowTotal(idx);
}

function removeSolItem(idx) { document.getElementById(`sol-row-${idx}`)?.remove(); updateSolTotals(); }

function calcSolRowTotal(idx) {
  const qty   = parseFloat(document.getElementById(`sol-qty-${idx}`)?.value)   || 0;
  const price = parseFloat(document.getElementById(`sol-price-${idx}`)?.value) || 0;
  const el    = document.getElementById(`sol-final-${idx}`);
  if (el) el.value = (qty * price).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function updateSolTotals() {
  let itemsTotal = 0;
  document.querySelectorAll('[id^="sol-row-"]').forEach(row => {
    const idx   = row.id.replace('sol-row-', '');
    const qty   = parseFloat(document.getElementById(`sol-qty-${idx}`)?.value)   || 0;
    const price = parseFloat(document.getElementById(`sol-price-${idx}`)?.value) || 0;
    itemsTotal += qty * price;
  });
  const disc  = parseFloat(document.getElementById('sol-discount')?.value)      || 0;
  const frt   = parseFloat(document.getElementById('sol-freight-value')?.value) || 0;
  const other = parseFloat(document.getElementById('sol-other')?.value)         || 0;
  const total = itemsTotal - disc + frt + other;
  const f = v => fmt.currency(v);
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = f(val); };
  set('sol-t-items', itemsTotal); set('sol-t-disc', disc); set('sol-t-frt', frt); set('sol-t-other', other); set('sol-t-total', total);
}

function _readSolItems() {
  const items = [];
  document.querySelectorAll('[id^="sol-row-"]').forEach(row => {
    const idx   = row.id.replace('sol-row-', '');
    const desc  = document.getElementById(`sol-desc-${idx}`)?.value?.trim();
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
    title: 'Excluir Solicitação', message: 'Excluir esta solicitação de compra?',
    confirmText: 'Excluir', type: 'danger',
    onConfirm: () => { Store.remove('purchase_requests', id); Toast.success('Excluída!'); renderMateriaisTab(projectId); }
  });
}

// ─── PDF ───────────────────────────────────────────────────────────────────
function generateSolicitacaoPDF(solId) {
  const sol     = Store.getById('purchase_requests', solId);
  if (!sol) { Toast.error('Não encontrado'); return; }
  const project = Store.getById('projects', sol.projectId);
  const client  = project ? Store.getById('clients', project.clientId) : null;
  const dateStr = sol.createdAt ? new Date(sol.createdAt).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');
  const itemsTotal = (sol.items || []).reduce((s, i) => s + (parseFloat(i.finalPrice) || 0), 0);
  const total      = itemsTotal - (sol.discount || 0) + (sol.freightValue || 0) + (sol.otherExpenses || 0);
  const fmtN       = v => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  const clientName  = client?.name     || project?.name || '';
  const clientAddr  = client?.address  || '';
  const clientCnpj  = client?.cpfCnpj || '';
  const clientPhone = client?.phone    || '';
  const clientEmail = client?.email    || project?.contactEmail || '';

  const itemRows = (sol.items || []).map((i, n) => {
    const dtLabel = i.expectedDate ? new Date(i.expectedDate + 'T12:00:00').toLocaleDateString('pt-BR') : '';
    return `<tr class="${n%2===1?'alt':''}"><td>${i.description||''}</td><td class="r">${Number(i.quantity||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</td><td class="c">${i.unit||'un'}</td><td class="r">${fmtN(i.unitPrice)}</td><td class="r">${fmtN(i.finalPrice)}</td><td class="c">${dtLabel}</td></tr>`;
  }).join('');

  const obsText = [
    'Favor constar o número do pedido no campo de observações da Nota Fiscal.',
    'Informar a forma de pagamento e, se depósito bancário, constar os dados bancários na NF.',
    'Caso não esteja descrita na NF, favor discriminar a data de vencimento da fatura.',
    sol.notes || null,
    'Sujeito a bloqueio de pagamento em caso de não cumprimento das especificações anteriores.'
  ].filter(Boolean).map((t, i) => `${i+1}. ${t}`).join('<br>');

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Solicitação ${sol.number}</title><style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;font-size:9.5pt;color:#1a1a1a;background:#fff;line-height:1.4}
.page{max-width:800px;margin:0 auto;padding:24px 28px}
.doc-header{display:flex;align-items:flex-end;justify-content:space-between;padding-bottom:14px;border-bottom:2.5px solid #1e3a5f;margin-bottom:16px}
.doc-title{font-size:20pt;font-weight:800;color:#1e3a5f;letter-spacing:-0.5px}
.doc-meta{text-align:right;font-size:9pt;color:#555}
.doc-meta strong{color:#1a1a1a;font-size:11pt}
.sec-title{background:#1e3a5f;color:#fff;font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:.06em;padding:5px 10px;margin-bottom:0}
.sec-table{width:100%;border-collapse:collapse;margin-bottom:12px;border:1px solid #c8d3df;border-top:none}
.sec-table td{padding:4px 10px;font-size:9pt;border-bottom:1px solid #e8edf3;vertical-align:middle}
.sec-table tr:last-child td{border-bottom:none}
.lbl{font-weight:600;color:#444;width:110px;white-space:nowrap;background:#f4f7fb}
.items-table{width:100%;border-collapse:collapse;margin-bottom:0;border:1px solid #c8d3df;border-top:none}
.items-table th{background:#2c4e80;color:#fff;font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:5px 8px;text-align:left}
.items-table th.r{text-align:right}.items-table th.c{text-align:center}
.items-table td{padding:5px 8px;font-size:9pt;border-bottom:1px solid #e8edf3;vertical-align:middle}
.items-table tr.alt td{background:#f7f9fc}
.items-table tr:last-child td{border-bottom:none}
.r{text-align:right}.c{text-align:center}
.footer-wrap{display:flex;gap:0;margin-top:12px;border:1px solid #c8d3df}
.obs-col{flex:1;padding:10px 12px;border-right:1px solid #c8d3df;font-size:8.5pt;color:#444;line-height:1.55}
.obs-col .obs-title{font-weight:700;color:#1e3a5f;font-size:8pt;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px}
.totals-col{width:230px;flex-shrink:0}
.totals-col table{width:100%;border-collapse:collapse}
.totals-col td{padding:4px 10px;font-size:9pt;border-bottom:1px solid #e8edf3}
.totals-col td:first-child{color:#555;font-size:8.5pt;background:#f4f7fb}
.totals-col td:last-child{text-align:right;font-weight:600}
.totals-col .grand td{background:#1e3a5f;color:#fff;font-weight:800;font-size:10pt;border-bottom:none}
.totals-col .grand td:first-child{background:#1e3a5f;color:#e0e8f4;font-size:8.5pt}
.cond-bar{display:flex;background:#f4f7fb;border:1px solid #c8d3df;border-top:none;font-size:8.5pt;padding:5px 10px;margin-bottom:0}
.cond-bar span{margin-right:24px}.cond-bar strong{color:#1e3a5f}
.sig-area{margin-top:36px;text-align:center}
.sig-line{display:inline-block;border-top:1.5px solid #1a1a1a;padding-top:6px;min-width:240px;font-size:9.5pt;font-weight:700;color:#1a1a1a}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{padding:12px 16px}}
</style></head><body><div class="page">
<div class="doc-header"><div class="doc-title">Solicitação de Compra</div><div class="doc-meta"><div>Pedido <strong>#${sol.number}</strong></div><div style="margin-top:2px;">Data: <strong>${dateStr}</strong></div></div></div>
<div class="sec-title">Informações para Faturamento</div>
<table class="sec-table"><tr><td class="lbl">Nome</td><td>${clientName}</td><td class="lbl" style="width:55px;">CNPJ</td><td>${clientCnpj}</td></tr><tr><td class="lbl">Endereço</td><td colspan="3">${clientAddr}</td></tr><tr><td class="lbl">Telefone</td><td>${clientPhone}</td><td class="lbl">E-mail</td><td>${clientEmail}</td></tr></table>
<div class="sec-title">Dados do Fornecedor</div>
<table class="sec-table"><tr><td class="lbl">Razão Social</td><td colspan="3">${sol.supplierName||''}</td></tr><tr><td class="lbl">Endereço</td><td colspan="3">${sol.supplierAddress||''}</td></tr><tr><td class="lbl">CNPJ</td><td>${sol.supplierCnpj||''}</td><td class="lbl">Telefone</td><td>${sol.supplierPhone||''}</td></tr><tr><td class="lbl">Vendedor</td><td>${sol.supplierVendor||''}</td><td class="lbl">E-mail</td><td>${sol.supplierEmail||''}</td></tr></table>
<div class="sec-title">Informações para Entrega</div>
<table class="sec-table"><tr><td class="lbl">Obra</td><td colspan="3">${project?.name||''}</td></tr><tr><td class="lbl">Local entrega</td><td colspan="3">${sol.deliveryAddress||''}</td></tr>${sol.deliveryRef?`<tr><td class="lbl">Referência</td><td colspan="3">${sol.deliveryRef}</td></tr>`:''}</table>
<div class="sec-title">Itens do Pedido</div>
<table class="items-table"><thead><tr><th style="min-width:180px;">Insumo / Produto</th><th class="r" style="width:65px;">Qtd.</th><th class="c" style="width:45px;">Unid.</th><th class="r" style="width:85px;">Preço Unit.</th><th class="r" style="width:85px;">Preço Final</th><th class="c" style="width:80px;">Previsão</th></tr></thead><tbody>${itemRows}</tbody></table>
<div class="cond-bar"><span>Cond. Pagamento: <strong>${sol.paymentTerms||'—'}</strong></span><span>Frete: <strong>${sol.freightType||'RETIRA'}</strong></span></div>
<div class="footer-wrap"><div class="obs-col"><div class="obs-title">Observações</div>${obsText}</div><div class="totals-col"><table><tr><td>Total dos insumos</td><td>${fmtN(itemsTotal)}</td></tr><tr><td>Desconto</td><td>${fmtN(sol.discount)}</td></tr><tr><td>Frete</td><td>${fmtN(sol.freightValue)}</td></tr><tr><td>Outras despesas</td><td>${fmtN(sol.otherExpenses)}</td></tr><tr class="grand"><td>Total do pedido</td><td>${fmtN(total)}</td></tr></table></div></div>
<div class="sig-area"><div class="sig-line">${clientName||'EMPRESA'}</div></div>
</div><script>window.onload=()=>setTimeout(()=>window.print(),400);<\/script></body></html>`;

  const win = window.open('', '_blank', 'width=940,height=720');
  if (!win) { Toast.error('Popup bloqueado', 'Permita popups para gerar o PDF.'); return; }
  win.document.write(html);
  win.document.close();
}

// Alias de compatibilidade
function renderSolicitacoesTab(projectId) { renderMateriaisTab(projectId); }
