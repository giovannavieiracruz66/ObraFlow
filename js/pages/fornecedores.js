// ==========================================
// FORNECEDORES — Cadastro completo
// ==========================================

let supFilter = { search: '', category: '' };

const SUP_CATEGORIES = ['Material', 'Serviço', 'Equipamento', 'Transporte', 'Outros'];

function renderFornecedores() {
  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Fornecedores</h1>
        <p>Cadastro completo de fornecedores com dados de contato, endereço e pagamento</p>
      </div>
      <div class="page-header-actions">
        ${canWrite() ? `
        <button class="btn btn-primary" onclick="openNewSupplierFullModal()">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Fornecedor
        </button>` : ''}
      </div>
    </div>

    <div class="filters-bar">
      <div class="search-wrapper">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="search-input" type="text" placeholder="Buscar por nome, CNPJ ou cidade..." value="${supFilter.search}" oninput="supFilter.search=this.value;renderSupContent()">
      </div>
      <select class="filter-select" onchange="supFilter.category=this.value;renderSupContent()">
        <option value="">Todas as categorias</option>
        ${SUP_CATEGORIES.map(c => `<option value="${c}" ${supFilter.category===c?'selected':''}>${c}</option>`).join('')}
      </select>
    </div>

    <div id="sup-content"></div>
  `;
  renderSupContent();
}

function renderSupContent() {
  const container = document.getElementById('sup-content');
  if (!container) return;

  const q = supFilter.search.toLowerCase();
  const suppliers = Store.getList('suppliers').filter(s => {
    const matchQ = !q ||
      s.name.toLowerCase().includes(q) ||
      (s.cnpj || '').includes(q) ||
      (s.city || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q);
    const matchCat = !supFilter.category || s.category === supFilter.category;
    return matchQ && matchCat;
  });

  if (!suppliers.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>${Store.getList('suppliers').length ? 'Nenhum fornecedor encontrado' : 'Nenhum fornecedor cadastrado'}</h3>
        <p>${Store.getList('suppliers').length ? 'Ajuste os filtros de busca.' : 'Cadastre o primeiro fornecedor para começar.'}</p>
        ${canWrite() && !Store.getList('suppliers').length ? `<button class="btn btn-primary" onclick="openNewSupplierFullModal()">Cadastrar Fornecedor</button>` : ''}
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>FORNECEDOR</th>
              <th style="width:140px;">CNPJ</th>
              <th style="width:110px;">CATEGORIA</th>
              <th>CONTATO</th>
              <th>CIDADE / UF</th>
              <th style="width:160px;">PAGAMENTO</th>
              ${canWrite() ? '<th style="width:100px;"></th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${suppliers.map(s => `
              <tr>
                <td>
                  <div class="td-main">${s.name}</div>
                  ${s.email ? `<div class="td-muted">${s.email}</div>` : ''}
                </td>
                <td style="font-family:monospace;font-size:12px;">${s.cnpj || '—'}</td>
                <td>${s.category ? `<span class="badge badge-gray">${s.category}</span>` : '—'}</td>
                <td>
                  ${s.contactName ? `<div style="font-size:13px;">${s.contactName}</div>` : ''}
                  ${s.phone ? `<div class="td-muted">${s.phone}</div>` : (!s.contactName ? '—' : '')}
                </td>
                <td>${s.city ? `${s.city}${s.state ? ` / ${s.state}` : ''}` : '—'}</td>
                <td>
                  ${s.paymentTerms ? `<div style="font-size:13px;">${s.paymentTerms}</div>` : ''}
                  ${s.paymentMethod ? `<div class="td-muted">${s.paymentMethod}</div>` : (!s.paymentTerms ? '—' : '')}
                </td>
                ${canWrite() ? `
                <td>
                  <div style="display:flex;gap:6px;">
                    <button class="btn btn-sm btn-outline" onclick="openSupplierDetail('${s.id}')">Ver</button>
                    <button class="btn btn-sm btn-ghost" style="color:var(--danger);" onclick="deleteSupplierFull('${s.id}')">
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                    </button>
                  </div>
                </td>` : ''}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// === MODAL COMPLETO (novo e edição) ===
function _supModalBody(s = {}) {
  return `
    <div style="display:flex;flex-direction:column;gap:0;">

      <!-- SEÇÃO: IDENTIFICAÇÃO -->
      <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border);">Identificação</div>
      <div class="form-grid" style="margin-bottom:20px;">
        <div class="form-group form-col-span-2">
          <label class="form-label">Razão Social / Nome *</label>
          <input class="form-control" id="sf-name" placeholder="Ex: Votorantim Materiais Ltda" value="${s.name || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">CNPJ</label>
          <input class="form-control" id="sf-cnpj" placeholder="00.000.000/0001-00" value="${s.cnpj || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Inscrição Estadual</label>
          <input class="form-control" id="sf-ie" placeholder="000.000.000.000" value="${s.ie || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Categoria</label>
          <select class="form-control" id="sf-category">
            <option value="">Selecionar</option>
            ${SUP_CATEGORIES.map(c => `<option value="${c}" ${s.category===c?'selected':''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">E-mail</label>
          <input class="form-control" id="sf-email" type="email" placeholder="contato@empresa.com" value="${s.email || ''}">
        </div>
      </div>

      <!-- SEÇÃO: CONTATO -->
      <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border);">Contato</div>
      <div class="form-grid" style="margin-bottom:20px;">
        <div class="form-group">
          <label class="form-label">Nome do Responsável</label>
          <input class="form-control" id="sf-contact" placeholder="Ex: João Silva" value="${s.contactName || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Telefone / WhatsApp</label>
          <input class="form-control" id="sf-phone" placeholder="(11) 99999-9999" value="${s.phone || ''}">
        </div>
      </div>

      <!-- SEÇÃO: ENDEREÇO -->
      <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border);">Endereço</div>
      <div class="form-grid" style="margin-bottom:20px;">
        <div class="form-group form-col-span-2">
          <label class="form-label">Logradouro</label>
          <input class="form-control" id="sf-address" placeholder="Rua, Av., número, complemento" value="${s.address || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Cidade</label>
          <input class="form-control" id="sf-city" placeholder="São Paulo" value="${s.city || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">UF</label>
          <input class="form-control" id="sf-state" placeholder="SP" maxlength="2" style="text-transform:uppercase;" value="${s.state || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">CEP</label>
          <input class="form-control" id="sf-zip" placeholder="00000-000" value="${s.zip || ''}">
        </div>
      </div>

      <!-- SEÇÃO: PAGAMENTO -->
      <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border);">Condições de Pagamento</div>
      <div class="form-grid" style="margin-bottom:20px;">
        <div class="form-group">
          <label class="form-label">Prazo / Condição</label>
          <input class="form-control" id="sf-terms" placeholder="Ex: 30/60/90 dias, à vista" value="${s.paymentTerms || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Forma de Pagamento</label>
          <input class="form-control" id="sf-method" placeholder="Ex: Boleto, PIX, TED" value="${s.paymentMethod || ''}">
        </div>
      </div>

      <!-- SEÇÃO: DADOS BANCÁRIOS -->
      <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border);">Dados Bancários</div>
      <div class="form-grid" style="margin-bottom:20px;">
        <div class="form-group">
          <label class="form-label">Banco</label>
          <input class="form-control" id="sf-bank" placeholder="Ex: Itaú, Bradesco, Nubank" value="${s.bankName || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Agência</label>
          <input class="form-control" id="sf-agency" placeholder="0000" value="${s.bankAgency || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Conta</label>
          <input class="form-control" id="sf-account" placeholder="00000-0" value="${s.bankAccount || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">PIX</label>
          <input class="form-control" id="sf-pix" placeholder="CNPJ, e-mail, telefone ou chave" value="${s.pix || ''}">
        </div>
      </div>

      <!-- SEÇÃO: OBSERVAÇÕES -->
      <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border);">Observações</div>
      <div class="form-group">
        <textarea class="form-control" id="sf-notes" rows="3" placeholder="Informações adicionais, contratos, histórico...">${s.notes || ''}</textarea>
      </div>
    </div>
  `;
}

function _readSupForm() {
  return {
    name:          document.getElementById('sf-name').value.trim(),
    cnpj:          document.getElementById('sf-cnpj').value.trim() || null,
    ie:            document.getElementById('sf-ie').value.trim() || null,
    category:      document.getElementById('sf-category').value || null,
    email:         document.getElementById('sf-email').value.trim() || null,
    contactName:   document.getElementById('sf-contact').value.trim() || null,
    phone:         document.getElementById('sf-phone').value.trim() || null,
    address:       document.getElementById('sf-address').value.trim() || null,
    city:          document.getElementById('sf-city').value.trim() || null,
    state:         document.getElementById('sf-state').value.trim().toUpperCase() || null,
    zip:           document.getElementById('sf-zip').value.trim() || null,
    paymentTerms:  document.getElementById('sf-terms').value.trim() || null,
    paymentMethod: document.getElementById('sf-method').value.trim() || null,
    bankName:      document.getElementById('sf-bank').value.trim() || null,
    bankAgency:    document.getElementById('sf-agency').value.trim() || null,
    bankAccount:   document.getElementById('sf-account').value.trim() || null,
    pix:           document.getElementById('sf-pix').value.trim() || null,
    notes:         document.getElementById('sf-notes').value.trim() || null,
  };
}

function openNewSupplierFullModal(prefix = null) {
  const { close } = Modal.create({
    title: 'Novo Fornecedor',
    size: 'modal-xl',
    body: _supModalBody(),
    footer: `
      <button class="btn btn-outline" id="modal-cancel">Cancelar</button>
      <button class="btn btn-primary" id="modal-save">Salvar Fornecedor</button>
    `
  });

  setTimeout(() => {
    document.getElementById('sf-name').focus();
    document.getElementById('modal-cancel')?.addEventListener('click', close);
    document.getElementById('modal-save')?.addEventListener('click', () => {
      const data = _readSupForm();
      if (!data.name) { Toast.error('Campo obrigatório', 'Informe o nome do fornecedor.'); return; }

      Store.add('suppliers', data);
      close();
      Toast.success('Fornecedor cadastrado!');

      // Atualiza o select do contexto de onde foi aberto (pedido, orçamento, etc.)
      if (prefix) {
        const select = document.getElementById(`${prefix}-supplier`);
        if (select) {
          select.innerHTML = `<option value="">Selecionar fornecedor</option>` +
            Store.getList('suppliers').map(s => `<option value="${s.name}">${s.name}</option>`).join('');
          select.value = data.name;
        }
      } else {
        renderSupContent();
      }
    });
  }, 50);
}

function openSupplierDetail(supId) {
  const s = Store.getById('suppliers', supId);
  if (!s) return;

  const { close } = Modal.create({
    title: s.name,
    size: 'modal-xl',
    body: _supModalBody(s),
    footer: `
      <button class="btn btn-outline" id="modal-cancel">Fechar</button>
      <button class="btn btn-primary" id="modal-save">Salvar Alterações</button>
    `
  });

  setTimeout(() => {
    document.getElementById('modal-cancel')?.addEventListener('click', close);
    document.getElementById('modal-save')?.addEventListener('click', () => {
      const data = _readSupForm();
      if (!data.name) { Toast.error('Campo obrigatório', 'Informe o nome do fornecedor.'); return; }
      Store.update('suppliers', supId, data);
      close();
      Toast.success('Fornecedor atualizado!');
      renderSupContent();
    });
  }, 50);
}

function deleteSupplierFull(supId) {
  const s = Store.getById('suppliers', supId);
  confirmDialog({
    title: 'Excluir Fornecedor',
    message: `Deseja excluir "${s?.name}"? Esta ação não pode ser desfeita.`,
    confirmText: 'Excluir',
    type: 'danger',
    onConfirm: () => {
      Store.remove('suppliers', supId);
      Toast.success('Fornecedor excluído!');
      renderSupContent();
    }
  });
}
