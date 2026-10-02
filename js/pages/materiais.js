// ==========================================
// CATÁLOGO DE MATERIAIS
// Categorias + Materiais com SKU, unidade e preço padrão.
// Integra com: Novo Pedido (autocomplete) e Orçamentos (picker).
// ==========================================

let matFilter = { search: '', categoryId: '' };

function renderMateriais() {
  const categories = Store.getList('material_categories');
  const content = document.getElementById('page-content');

  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Catálogo de Materiais</h1>
        <p>Materiais e insumos organizados por categoria</p>
      </div>
      <div class="page-header-actions">
        ${canWrite() ? `
        <button class="btn btn-outline" onclick="openNewMatCategoryModal()">+ Nova Categoria</button>
        <button class="btn btn-primary" onclick="openNewMaterialModal()">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Material
        </button>` : ''}
      </div>
    </div>

    <div class="filters-bar">
      <div class="search-wrapper">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="search-input" type="text" placeholder="Buscar material ou SKU..." value="${matFilter.search}" oninput="matFilter.search=this.value;renderMatContent()">
      </div>
      <select class="filter-select" onchange="matFilter.categoryId=this.value;renderMatContent()">
        <option value="">Todas as categorias</option>
        ${categories.map(c => `<option value="${c.id}" ${matFilter.categoryId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
      </select>
    </div>

    <div id="mat-content"></div>
  `;
  renderMatContent();
}

function renderMatContent() {
  const materials = Store.getList('materials');
  const categories = Store.getList('material_categories');
  const container = document.getElementById('mat-content');
  if (!container) return;

  const q = matFilter.search.toLowerCase();
  const filtered = materials.filter(m => {
    const matchSearch = !q || m.name.toLowerCase().includes(q) || (m.sku || '').toLowerCase().includes(q);
    const matchCat = !matFilter.categoryId || m.categoryId === matFilter.categoryId;
    return matchSearch && matchCat;
  });

  if (!filtered.length && !materials.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Catálogo vazio</h3>
        <p>Cadastre uma categoria e adicione materiais para começar.</p>
        ${canWrite() ? `<button class="btn btn-primary" onclick="openNewMatCategoryModal()">Criar primeira categoria</button>` : ''}
      </div>
    `;
    return;
  }

  if (!filtered.length) {
    container.innerHTML = `<div class="empty-state"><h3>Nenhum material encontrado</h3><p>Tente ajustar os filtros.</p></div>`;
    return;
  }

  // Agrupar por categoria
  const grouped = {};
  filtered.forEach(m => {
    const key = m.categoryId || '__sem_categoria__';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(m);
  });

  const getCatName = id => categories.find(c => c.id === id)?.name || 'Sem Categoria';

  container.innerHTML = Object.entries(grouped).map(([catId, mats]) => `
    <div class="card" style="margin-bottom:16px;">
      <div class="card-header" style="padding:12px 20px;">
        <div class="card-title" style="display:flex;align-items:center;gap:8px;">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12"/></svg>
          ${getCatName(catId)}
          <span class="badge badge-gray" style="font-size:11px;">${mats.length}</span>
        </div>
        ${canWrite() && catId !== '__sem_categoria__' ? `
        <div style="display:flex;gap:8px;">
          <button class="btn btn-sm btn-outline" onclick="openNewMaterialModal('${catId}')">+ Material</button>
          <button class="btn btn-sm btn-ghost" style="color:var(--text-muted);" onclick="openEditMatCategoryModal('${catId}')">Editar categoria</button>
        </div>` : ''}
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>MATERIAL</th>
              <th>SKU</th>
              <th>UNIDADE</th>
              <th>PREÇO PADRÃO</th>
              <th>DESCRIÇÃO</th>
              ${canWrite() ? '<th></th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${mats.map(m => `
              <tr>
                <td class="td-main">${m.name}</td>
                <td><span style="font-family:monospace;font-size:12px;background:var(--gray-100);padding:2px 6px;border-radius:4px;">${m.sku || '—'}</span></td>
                <td>${m.unit || 'un'}</td>
                <td style="font-weight:600;">${m.defaultPrice ? fmt.currency(m.defaultPrice) : '—'}</td>
                <td class="td-muted">${m.description || '—'}</td>
                ${canWrite() ? `
                <td>
                  <div style="display:flex;gap:6px;">
                    <button class="btn btn-sm btn-outline" onclick="openEditMaterialModal('${m.id}')">Editar</button>
                    <button class="btn btn-sm btn-ghost" style="color:var(--danger);" onclick="deleteMaterial('${m.id}')">
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
  `).join('');
}

// === CATEGORIA ===
function openNewMatCategoryModal() {
  const { close } = Modal.create({
    title: 'Nova Categoria',
    size: 'modal-sm',
    body: `
      <div class="form-group">
        <label class="form-label">Nome da Categoria *</label>
        <input class="form-control" id="mc-name" placeholder="Ex: Estrutura, Elétrico, Hidráulico...">
      </div>
    `,
    footer: `
      <button class="btn btn-outline" id="modal-cancel">Cancelar</button>
      <button class="btn btn-primary" id="modal-save">Salvar</button>
    `
  });
  setTimeout(() => {
    document.getElementById('mc-name').focus();
    document.getElementById('modal-cancel')?.addEventListener('click', close);
    document.getElementById('modal-save')?.addEventListener('click', () => {
      const name = document.getElementById('mc-name').value.trim();
      if (!name) { Toast.error('Campo obrigatório', 'Informe o nome da categoria.'); return; }
      Store.add('material_categories', { name });
      close();
      Toast.success('Categoria criada!');
      renderMateriais();
    });
  }, 50);
}

function openEditMatCategoryModal(catId) {
  const cat = Store.getById('material_categories', catId);
  if (!cat) return;
  const { close } = Modal.create({
    title: 'Editar Categoria',
    size: 'modal-sm',
    body: `
      <div class="form-group">
        <label class="form-label">Nome *</label>
        <input class="form-control" id="mc-name" value="${cat.name}">
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
      const name = document.getElementById('mc-name').value.trim();
      if (!name) { Toast.error('Campo obrigatório', 'Informe o nome.'); return; }
      Store.update('material_categories', catId, { name });
      close();
      Toast.success('Categoria atualizada!');
      renderMateriais();
    });
  }, 50);
}

// === MATERIAL ===
function _matModalBody(m = {}, defaultCatId = '') {
  const categories = Store.getList('material_categories');
  return `
    <div class="form-grid">
      <div class="form-group form-col-span-2">
        <label class="form-label">Nome do Material *</label>
        <input class="form-control" id="m-name" placeholder="Ex: Cimento CP II-32, Areia Média, Aço CA-50..." value="${m.name || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Categoria</label>
        <select class="form-control" id="m-cat">
          <option value="">Sem categoria</option>
          ${categories.map(c => `<option value="${c.id}" ${(m.categoryId || defaultCatId) === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">SKU / Código</label>
        <input class="form-control" id="m-sku" placeholder="Ex: CIM-CPII-32" value="${m.sku || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Unidade de Medida</label>
        <input class="form-control" id="m-unit" placeholder="Ex: kg, un, m³, sc" value="${m.unit || 'un'}">
      </div>
      <div class="form-group">
        <label class="form-label">Preço Padrão (R$)</label>
        <input class="form-control" id="m-price" type="number" placeholder="0.00" value="${m.defaultPrice || ''}">
      </div>
      <div class="form-group form-col-span-2">
        <label class="form-label">Descrição</label>
        <textarea class="form-control" id="m-desc" rows="2" placeholder="Especificações, normas, observações...">${m.description || ''}</textarea>
      </div>
    </div>
  `;
}

function openNewMaterialModal(defaultCatId = '') {
  const { close } = Modal.create({
    title: 'Novo Material',
    size: 'modal-lg',
    body: _matModalBody({}, defaultCatId),
    footer: `
      <button class="btn btn-outline" id="modal-cancel">Cancelar</button>
      <button class="btn btn-primary" id="modal-save">Salvar Material</button>
    `
  });
  setTimeout(() => {
    document.getElementById('m-name').focus();
    document.getElementById('modal-cancel')?.addEventListener('click', close);
    document.getElementById('modal-save')?.addEventListener('click', () => {
      const name = document.getElementById('m-name').value.trim();
      if (!name) { Toast.error('Campo obrigatório', 'Informe o nome do material.'); return; }
      Store.add('materials', {
        name,
        categoryId: document.getElementById('m-cat').value || null,
        sku: document.getElementById('m-sku').value.trim() || null,
        unit: document.getElementById('m-unit').value.trim() || 'un',
        defaultPrice: parseFloat(document.getElementById('m-price').value) || 0,
        description: document.getElementById('m-desc').value.trim() || null,
      });
      close();
      Toast.success('Material cadastrado!');
      renderMateriais();
    });
  }, 50);
}

function openEditMaterialModal(matId) {
  const m = Store.getById('materials', matId);
  if (!m) return;
  const { close } = Modal.create({
    title: 'Editar Material',
    size: 'modal-lg',
    body: _matModalBody(m),
    footer: `
      <button class="btn btn-outline" id="modal-cancel">Cancelar</button>
      <button class="btn btn-primary" id="modal-save">Salvar</button>
    `
  });
  setTimeout(() => {
    document.getElementById('modal-cancel')?.addEventListener('click', close);
    document.getElementById('modal-save')?.addEventListener('click', () => {
      const name = document.getElementById('m-name').value.trim();
      if (!name) { Toast.error('Campo obrigatório', 'Informe o nome.'); return; }
      Store.update('materials', matId, {
        name,
        categoryId: document.getElementById('m-cat').value || null,
        sku: document.getElementById('m-sku').value.trim() || null,
        unit: document.getElementById('m-unit').value.trim() || 'un',
        defaultPrice: parseFloat(document.getElementById('m-price').value) || 0,
        description: document.getElementById('m-desc').value.trim() || null,
      });
      close();
      Toast.success('Material atualizado!');
      renderMateriais();
    });
  }, 50);
}

function deleteMaterial(matId) {
  const m = Store.getById('materials', matId);
  confirmDialog({
    title: 'Excluir Material',
    message: `Deseja excluir "${m?.name}"? Esta ação não pode ser desfeita.`,
    confirmText: 'Excluir',
    type: 'danger',
    onConfirm: () => {
      Store.remove('materials', matId);
      Toast.success('Material excluído!');
      renderMateriais();
    }
  });
}

// ==========================================
// AUTOCOMPLETE — usado no modal Novo Pedido
// ==========================================
function attachMatAutocomplete(inputEl, onSelect) {
  let dropdown = null;

  function removeDropdown() {
    if (dropdown) { dropdown.remove(); dropdown = null; }
  }

  inputEl.addEventListener('input', () => {
    const q = inputEl.value.trim().toLowerCase();
    removeDropdown();
    if (q.length < 2) return;

    const matches = Store.getList('materials').filter(m =>
      m.name.toLowerCase().includes(q) || (m.sku || '').toLowerCase().includes(q)
    ).slice(0, 8);

    if (!matches.length) return;

    dropdown = document.createElement('div');
    dropdown.style.cssText = `
      position:absolute;z-index:9999;background:var(--surface);border:1px solid var(--border);
      border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,.12);min-width:280px;max-height:240px;
      overflow-y:auto;
    `;

    matches.forEach(m => {
      const item = document.createElement('div');
      item.style.cssText = 'padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--border-light,var(--border));';
      item.innerHTML = `
        <div style="font-weight:600;font-size:13px;">${m.name}</div>
        <div style="font-size:11px;color:var(--text-muted);">${m.sku ? `SKU: ${m.sku} · ` : ''}${m.unit}${m.defaultPrice ? ` · R$ ${fmt.number(m.defaultPrice)}` : ''}</div>
      `;
      item.addEventListener('mousedown', e => {
        e.preventDefault();
        onSelect(m);
        removeDropdown();
      });
      item.addEventListener('mouseenter', () => item.style.background = 'var(--gray-50)');
      item.addEventListener('mouseleave', () => item.style.background = '');
      dropdown.appendChild(item);
    });

    const rect = inputEl.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + window.scrollY + 4) + 'px';
    dropdown.style.left = (rect.left + window.scrollX) + 'px';
    dropdown.style.width = rect.width + 'px';
    document.body.appendChild(dropdown);
  });

  inputEl.addEventListener('blur', () => setTimeout(removeDropdown, 150));
}

// ==========================================
// PICKER DE MATERIAL — modal de seleção
// Usado nos orçamentos (sub-itens de serviço)
// ==========================================
function openMaterialPickerModal(onSelect) {
  const categories = Store.getList('material_categories');
  const materials = Store.getList('materials');

  const { close } = Modal.create({
    title: 'Selecionar Material do Catálogo',
    size: 'modal-lg',
    body: `
      <div style="display:flex;gap:8px;margin-bottom:14px;">
        <div class="search-wrapper" style="flex:1;">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input class="search-input" id="picker-search" type="text" placeholder="Buscar por nome ou SKU..." oninput="renderPickerList()">
        </div>
        <select class="filter-select" id="picker-cat" onchange="renderPickerList()">
          <option value="">Todas as categorias</option>
          ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
        </select>
      </div>
      <div id="picker-list" style="max-height:360px;overflow-y:auto;"></div>
    `,
    footer: `<button class="btn btn-outline" id="modal-cancel">Fechar</button>`
  });

  window._pickerOnSelect = (m) => { onSelect(m); close(); };

  setTimeout(() => {
    document.getElementById('modal-cancel')?.addEventListener('click', close);
    document.getElementById('picker-search')?.focus();
    renderPickerList();
  }, 50);
}

function renderPickerList() {
  const q = (document.getElementById('picker-search')?.value || '').toLowerCase();
  const catId = document.getElementById('picker-cat')?.value || '';
  const container = document.getElementById('picker-list');
  if (!container) return;

  const materials = Store.getList('materials').filter(m => {
    const matchQ = !q || m.name.toLowerCase().includes(q) || (m.sku || '').toLowerCase().includes(q);
    const matchCat = !catId || m.categoryId === catId;
    return matchQ && matchCat;
  });

  if (!materials.length) {
    container.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:24px;">Nenhum material encontrado.</p>`;
    return;
  }

  container.innerHTML = `
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="border-bottom:1px solid var(--border);">
          <th style="text-align:left;padding:6px 10px;font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;">Material</th>
          <th style="text-align:left;padding:6px 10px;font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;width:100px;">SKU</th>
          <th style="text-align:left;padding:6px 10px;font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;width:70px;">Unid.</th>
          <th style="text-align:left;padding:6px 10px;font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;width:110px;">Preço Padrão</th>
          <th style="width:80px;"></th>
        </tr>
      </thead>
      <tbody>
        ${materials.map(m => `
          <tr style="border-bottom:1px solid var(--border);">
            <td style="padding:10px 10px;">
              <div style="font-weight:600;font-size:13px;">${m.name}</div>
              ${m.description ? `<div style="font-size:11px;color:var(--text-muted);">${m.description}</div>` : ''}
            </td>
            <td style="padding:10px;font-family:monospace;font-size:12px;">${m.sku || '—'}</td>
            <td style="padding:10px;">${m.unit || 'un'}</td>
            <td style="padding:10px;font-weight:600;">${m.defaultPrice ? fmt.currency(m.defaultPrice) : '—'}</td>
            <td style="padding:10px;">
              <button class="btn btn-sm btn-primary" onclick="window._pickerOnSelect && window._pickerOnSelect(${JSON.stringify(m).replace(/"/g,'&quot;')})">Usar</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}
