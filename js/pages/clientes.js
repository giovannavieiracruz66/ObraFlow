// ==========================================
// CLIENTES PAGE
// ==========================================

let clientFilter = { search: '', page: 1 };

function renderClientes() {
  const clients = Store.getList('clients');
  const content = document.getElementById('page-content');

  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Clientes</h1>
        <p>${clients.length} clientes cadastrados</p>
      </div>
      <div class="page-header-actions">
        ${canWrite() ? `
        <button class="btn btn-primary" onclick="openNewClientModal()">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Cliente
        </button>` : ''}
      </div>
    </div>

    <!-- FILTERS -->
    <div class="filters-bar">
      <div class="search-wrapper">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="search-input" type="text" placeholder="Buscar cliente ou empresa..." value="${clientFilter.search}" oninput="clientFilter.search=this.value;clientFilter.page=1;renderClientContent()">
      </div>
    </div>

    <!-- GRID -->
    <div id="client-content" style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;"></div>
    <div id="client-pag"></div>
  `;

  renderClientContent();
}

function renderClientContent() {
  const clients = Store.getList('clients');
  let filtered = clients.filter(c => {
    return !clientFilter.search || c.name.toLowerCase().includes(clientFilter.search.toLowerCase()) || (c.company || '').toLowerCase().includes(clientFilter.search.toLowerCase());
  });

  const perPage = 12;
  const page = clientFilter.page || 1;
  const total = filtered.length;
  const totalPages = Math.ceil(total / perPage);
  const pageItems = filtered.slice((page-1)*perPage, page*perPage);

  const container = document.getElementById('client-content');
  if (!pageItems.length) {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="empty-state-icon"><svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div><h3>Nenhum cliente</h3><button class="btn btn-primary" onclick="openNewClientModal()">Novo Cliente</button></div>`;
    return;
  }

  container.innerHTML = pageItems.map(c => {
    const stats = Store.getClientStats(c.id);
    const color = avatarColor(c.name);
    return `
      <div class="client-card" onclick="openClientDetail('${c.id}')">
        <div class="client-avatar-lg" style="background:${color};">${initials(c.name)}</div>
        <div class="client-name">${c.name}</div>
        <div class="client-company">${c.company || 'Pessoa Física'}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">
          <svg style="display:inline;margin-right:4px;" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
          ${c.phone}
        </div>
        <div style="font-size:12px;color:var(--text-muted);">
          <svg style="display:inline;margin-right:4px;" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          ${c.email}
        </div>
        <div class="client-stats">
          <div class="client-stat">
            <div class="client-stat-value">${stats.projects.length}</div>
            <div class="client-stat-label">Obras</div>
          </div>
          <div class="client-stat">
            <div class="client-stat-value">${fmt.currency(stats.totalContracted).replace('R$','').trim()}</div>
            <div class="client-stat-label">Contratado</div>
          </div>
          <div class="client-stat">
            <div class="client-stat-value">${stats.budgets.length}</div>
            <div class="client-stat-label">Orçamentos</div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('client-pag').innerHTML = total > perPage ? renderPagination(page, totalPages, total, (page-1)*perPage, pageItems.length, 'client') : '';
}

function openClientDetail(id) {
  const c = Store.getById('clients', id);
  if (!c) return;
  const stats = Store.getClientStats(id);
  const color = avatarColor(c.name);

  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div style="margin-bottom:16px;">
      <button class="btn btn-ghost btn-sm" onclick="Pages.clientes()">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        Voltar para Clientes
      </button>
    </div>

    <!-- Client Header -->
    <div style="background:linear-gradient(135deg,var(--primary-900),var(--primary-700));border-radius:18px;padding:32px;margin-bottom:24px;position:relative;overflow:hidden;">
      <div style="display:flex;align-items:center;gap:20px;position:relative;z-index:1;">
        <div style="width:64px;height:64px;border-radius:16px;background:${color};display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:white;flex-shrink:0;">${initials(c.name)}</div>
        <div>
          <h2 style="color:white;font-size:22px;font-weight:800;margin-bottom:2px;">${c.name}</h2>
          <p style="color:rgba(255,255,255,0.7);font-size:14px;">${c.company || 'Pessoa Física'} • ${c.city || c.address?.split(',').pop()?.trim() || ''}</p>
        </div>
        <div style="margin-left:auto;display:flex;gap:8px;">
          <button class="btn btn-outline" style="color:white;border-color:rgba(255,255,255,0.3);" onclick="openEditClientModal('${id}')">Editar</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-top:24px;position:relative;z-index:1;">
        ${[
          ['Total de Obras', stats.projects.length],
          ['Em Andamento', stats.activeProjects],
          ['Concluídas', stats.completedProjects],
          ['Total Contratado', fmt.currency(stats.totalContracted)],
          ['Pagamentos Pend.', fmt.currency(stats.pending)]
        ].map(([l,v]) => `
          <div style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:12px 14px;">
            <div style="font-size:10px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;">${l}</div>
            <div style="font-size:18px;font-weight:800;color:white;">${v}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Info + Projects -->
    <div style="display:grid;grid-template-columns:320px 1fr;gap:24px;">
      <!-- Info Card -->
      <div class="card">
        <div class="card-header"><div class="card-title">Informações</div></div>
        <div class="card-body" style="display:flex;flex-direction:column;gap:12px;">
          ${[
            ['CPF/CNPJ', c.cpfCnpj],
            ['Telefone', c.phone],
            ['WhatsApp', c.whatsapp],
            ['E-mail', c.email],
            ['Endereço', c.address],
            ['Cidade', c.city]
          ].map(([l,v]) => v ? `
            <div>
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-faint);font-weight:700;">${l}</div>
              <div style="font-size:13px;font-weight:600;color:var(--text);margin-top:2px;">${v}</div>
            </div>
          ` : '').join('')}
          ${c.notes ? `<div><div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-faint);font-weight:700;">Observações</div><div style="font-size:13px;color:var(--text-light);margin-top:2px;">${c.notes}</div></div>` : ''}
        </div>
      </div>
      <!-- Projects -->
      <div>
        <div class="card" style="margin-bottom:20px;">
          <div class="card-header">
            <div class="card-title">Obras</div>
            <button class="btn btn-sm btn-primary" onclick="openNewProjectModal({clientId:'${id}'})">+ Nova Obra</button>
          </div>
          <div class="table-wrapper">
            <table>
              <thead><tr><th>OBRA</th><th>STATUS</th><th>VALOR</th><th>PROGRESSO</th></tr></thead>
              <tbody>
                ${stats.projects.length ? stats.projects.map(p => `
                  <tr onclick="openProjectDetail('${p.id}')" style="cursor:pointer;">
                    <td class="td-main">${p.name}</td>
                    <td>${badge('project', p.status)}</td>
                    <td class="font-semibold">${fmt.currency(p.contractValue)}</td>
                    <td><div class="progress-bar-wrap" style="min-width:80px;"><div class="progress-bar blue" style="width:${p.physicalProgress}%"></div></div></td>
                  </tr>
                `).join('') : '<tr><td colspan="4" style="text-align:center;padding:16px;color:var(--text-muted);">Sem obras</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Orçamentos</div></div>
          <div class="table-wrapper">
            <table>
              <thead><tr><th>NÚMERO</th><th>PROJETO</th><th>VALOR</th><th>STATUS</th></tr></thead>
              <tbody>
                ${stats.budgets.length ? stats.budgets.map(b => `
                  <tr>
                    <td class="td-main">${b.number}</td>
                    <td>${b.projectName}</td>
                    <td class="font-semibold">${fmt.currency(b.finalValue)}</td>
                    <td>${badge('budget', b.status)}</td>
                  </tr>
                `).join('') : '<tr><td colspan="4" style="text-align:center;padding:16px;color:var(--text-muted);">Sem orçamentos</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

function openNewClientModal() {
  const { close } = Modal.create({
    title: 'Novo Cliente',
    size: 'modal-lg',
    body: `
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Nome *</label>
          <input class="form-control" id="nc-name" placeholder="Nome completo">
        </div>
        <div class="form-group">
          <label class="form-label">Empresa</label>
          <input class="form-control" id="nc-company" placeholder="Nome da empresa (opcional)">
        </div>
        <div class="form-group">
          <label class="form-label">CPF / CNPJ</label>
          <input class="form-control" id="nc-doc" placeholder="000.000.000-00">
        </div>
        <div class="form-group">
          <label class="form-label">Telefone</label>
          <input class="form-control" id="nc-phone" placeholder="(11) 99999-9999">
        </div>
        <div class="form-group">
          <label class="form-label">WhatsApp</label>
          <input class="form-control" id="nc-whatsapp" placeholder="11999999999">
        </div>
        <div class="form-group">
          <label class="form-label">E-mail</label>
          <input class="form-control" id="nc-email" type="email" placeholder="email@exemplo.com">
        </div>
        <div class="form-group">
          <label class="form-label">Cidade</label>
          <input class="form-control" id="nc-city" placeholder="São Paulo">
        </div>
        <div class="form-group">
          <label class="form-label">Endereço</label>
          <input class="form-control" id="nc-address" placeholder="Rua, número, bairro">
        </div>
        <div class="form-group form-col-span-2">
          <label class="form-label">Observações</label>
          <textarea class="form-control" id="nc-notes" rows="2" placeholder="Observações sobre o cliente..."></textarea>
        </div>
      </div>
    `,
    footer: `
      <button class="btn btn-outline" id="modal-cancel">Cancelar</button>
      <button class="btn btn-primary" id="modal-save">Salvar Cliente</button>
    `
  });

  setTimeout(() => {
    document.getElementById('modal-cancel')?.addEventListener('click', close);
    document.getElementById('modal-save')?.addEventListener('click', () => {
      const name = document.getElementById('nc-name').value.trim();
      if (!name) { Toast.error('Campo obrigatório', 'Informe o nome.'); return; }
      Store.add('clients', {
        name, company: document.getElementById('nc-company').value,
        cpfCnpj: document.getElementById('nc-doc').value,
        phone: document.getElementById('nc-phone').value,
        whatsapp: document.getElementById('nc-whatsapp').value,
        email: document.getElementById('nc-email').value,
        city: document.getElementById('nc-city').value,
        address: document.getElementById('nc-address').value,
        notes: document.getElementById('nc-notes').value
      });
      close();
      Toast.success('Cliente cadastrado!');
      renderClientes();
    });
  }, 50);
}

function openEditClientModal(id) {
  const c = Store.getById('clients', id);
  if (!c) return;

  const { close } = Modal.create({
    title: 'Editar Cliente',
    size: 'modal-lg',
    body: `
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Nome</label>
          <input class="form-control" id="ec-name" value="${c.name}">
        </div>
        <div class="form-group">
          <label class="form-label">Empresa</label>
          <input class="form-control" id="ec-company" value="${c.company||''}">
        </div>
        <div class="form-group">
          <label class="form-label">CPF / CNPJ</label>
          <input class="form-control" id="ec-doc" value="${c.cpfCnpj||''}">
        </div>
        <div class="form-group">
          <label class="form-label">Telefone</label>
          <input class="form-control" id="ec-phone" value="${c.phone||''}">
        </div>
        <div class="form-group">
          <label class="form-label">E-mail</label>
          <input class="form-control" id="ec-email" value="${c.email||''}">
        </div>
        <div class="form-group">
          <label class="form-label">Cidade</label>
          <input class="form-control" id="ec-city" value="${c.city||''}">
        </div>
        <div class="form-group form-col-span-2">
          <label class="form-label">Endereço</label>
          <input class="form-control" id="ec-address" value="${c.address||''}">
        </div>
        <div class="form-group form-col-span-2">
          <label class="form-label">Observações</label>
          <textarea class="form-control" id="ec-notes" rows="2">${c.notes||''}</textarea>
        </div>
      </div>
    `,
    footer: `
      <button class="btn btn-outline" id="modal-cancel">Cancelar</button>
      <button class="btn btn-danger" id="modal-delete">Excluir</button>
      <button class="btn btn-primary" id="modal-save">Salvar</button>
    `
  });

  setTimeout(() => {
    document.getElementById('modal-cancel')?.addEventListener('click', close);
    document.getElementById('modal-delete')?.addEventListener('click', () => {
      close();
      confirmDialog({
        title: 'Excluir Cliente', message: `Excluir ${c.name}?`, confirmText: 'Excluir', type: 'danger',
        onConfirm: () => { Store.remove('clients', id); Toast.success('Cliente excluído!'); renderClientes(); }
      });
    });
    document.getElementById('modal-save')?.addEventListener('click', () => {
      Store.update('clients', id, {
        name: document.getElementById('ec-name').value,
        company: document.getElementById('ec-company').value,
        cpfCnpj: document.getElementById('ec-doc').value,
        phone: document.getElementById('ec-phone').value,
        email: document.getElementById('ec-email').value,
        city: document.getElementById('ec-city').value,
        address: document.getElementById('ec-address').value,
        notes: document.getElementById('ec-notes').value
      });
      close();
      Toast.success('Cliente atualizado!');
      renderClientes();
    });
  }, 50);
}
