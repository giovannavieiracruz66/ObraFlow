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
            ${canWrite() && !['recusado', 'expirado'].includes(b.status) ? `<button class="btn btn-sm btn-accent" onclick="convertBudgetToProject('${b.id}')">✓ Orçamento Aprovado</button>` : ''}
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
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:16px;margin-bottom:20px;">
        ${[
          ['Cliente', client?.name || '—'],
          ['Obra', b.projectName],
          ['Nº da Proposta', b.number],
          ['Local', [b.address, b.city].filter(Boolean).join(', ') || '—'],
          ['Responsável', b.responsible || '—'],
          ['E-mail', b.contactEmail || client?.email || '—'],
          ['Data Base', fmt.date(b.baseDate)],
          ['Validade da Proposta', fmt.date(b.validUntil)],
          ['Forma de Pagamento', b.paymentMethod || '—'],
          ['Disponibilidade Início', fmt.date(b.startAvailability)],
          ['Prazo de Execução', b.executionDeadline || '—'],
          ['Criado em', fmt.date(b.createdAt)]
        ].map(([l, v]) => `
          <div>
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-faint);margin-bottom:4px;">${l}</div>
            <div style="font-weight:700;font-size:14px;">${v}</div>
          </div>
        `).join('')}
      </div>
      <div style="margin-bottom:16px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-faint);margin-bottom:4px;">Serviços</div>
        ${b.serviceItems && b.serviceItems.length ? `
          <div class="table-wrapper" style="margin-top:8px;">
            <table>
              <thead><tr><th>SERVIÇO</th><th>QTD.</th><th>MATERIAL</th><th>MÃO DE OBRA</th><th>VALOR</th></tr></thead>
              <tbody>
                ${b.serviceItems.map(it => `
                  <tr><td class="td-main">${it.name}</td><td></td><td></td><td></td><td class="font-semibold">${fmt.currency(it.value)}</td></tr>
                  ${(it.subItems || []).map(sub => `
                    <tr>
                      <td style="padding-left:28px;color:var(--text-muted);">${sub.name}</td>
                      <td>${sub.quantity ? `${fmt.number(sub.quantity)}${sub.unit ? ' ' + sub.unit : ''}` : '—'}</td>
                      <td>${fmt.currency(sub.materialValue || 0)}</td>
                      <td>${fmt.currency(sub.laborValue || 0)}</td>
                      <td>${fmt.currency(sub.value)}</td>
                    </tr>
                  `).join('')}
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : `<p style="font-size:13px;color:var(--text-light);">${b.services || '—'}</p>`}
      </div>
      <div style="background:var(--gray-50);border-radius:10px;padding:16px;margin-bottom:16px;">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;text-align:center;">
          ${[
            ['Materiais', b.materials||0, false, false],
            ['Mão de Obra', b.labor||0, false, false],
            ['Desconto', b.discount||0, true, false],
            ['Valor Final', b.finalValue, false, true]
          ].map(([l, v, isDiscount, isFinal]) => `
            <div>
              <div style="font-size:11px;color:var(--text-faint);">${l}</div>
              <div style="font-size:${isFinal?'20':'16'}px;font-weight:800;color:${isDiscount?'var(--danger)':isFinal?'var(--primary-800)':'var(--text)'};">${isDiscount && v>0 ? '- ' : ''}${fmt.currency(v)}</div>
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
                <div style="display:flex;align-items:center;gap:8px;cursor:pointer;" onclick="openBudgetAttachment('${(att.path || '').replace(/'/g, "\\'")}')">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="color:var(--danger);"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                  <span style="font-size:13px;font-weight:600;color:var(--primary-800);text-decoration:underline;">${att.name}</span>
                </div>
                <div style="display:flex;align-items:center;gap:10px;">
                  <div style="font-size:11px;color:var(--text-faint);">${fmt.date(att.date)}</div>
                  ${canWrite() ? `
                  <button class="btn btn-sm btn-ghost" style="color:var(--danger);padding:2px 6px;" title="Excluir anexo" onclick="event.stopPropagation();deleteBudgetAttachment('${b.id}','${(att.path || '').replace(/'/g, "\\'")}')">
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                  </button>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div style="margin-bottom:16px;">
        <input type="file" id="b-upload-pdf" accept=".pdf" style="display:none;" onchange="handleBudgetUpload('${b.id}', this)">
        <button class="btn btn-sm btn-outline" id="b-upload-btn" onclick="document.getElementById('b-upload-pdf').click()">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
          Anexar Versão em PDF
        </button>
      </div>
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="font-size:13px;color:var(--text-muted);">Status:</div>
        ${badge('budget', b.status)}
        ${canWrite() && !['recusado', 'expirado'].includes(b.status) ? `<button class="btn btn-sm btn-accent" onclick="convertBudgetToProject('${b.id}')">✓ Orçamento Aprovado</button>` : ''}
      </div>
      ${b.notes ? `<div style="margin-top:12px;padding:12px;background:var(--warning-light);border-radius:8px;font-size:13px;color:var(--warning-dark);">📝 ${b.notes}</div>` : ''}
    `,
    footer: `
      <button class="btn btn-outline" onclick="printBudgetPDF('${b.id}')">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-right:4px;"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-12 0h12v6H6v-6z"/></svg>
        Emitir PDF
      </button>
      <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Fechar</button>
    `
  });
}

function printBudgetPDF(budgetId) {
  const b = Store.getById('budgets', budgetId);
  if (!b) return;
  const client = Store.getById('clients', b.clientId);

  const win = window.open('', '_blank');
  if (!win) { Toast.error('Bloqueado pelo navegador', 'Permita pop-ups para emitir o PDF.'); return; }

  win.document.write(`
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Orçamento ${b.number}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; padding: 48px; color: #1a1a1a; font-size: 11px; }
          h1 { font-size: 18px; margin: 0 0 4px; }
          .muted { color: #666; font-size: 11px; margin-bottom: 2px; }
          .company-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 16px; }
          .company-name { font-size: 13px; font-weight: 800; }
          .company-meta { font-size: 10px; color: #666; margin-top: 2px; line-height: 1.5; }
          .header-row { display:flex; justify-content:space-between; margin-bottom: 20px; padding-bottom:14px; border-bottom: 2px solid #111; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { text-align: left; padding: 6px 10px; border-bottom: 1px solid #ddd; font-size: 11px; }
          th { background: #f5f5f5; text-transform: uppercase; font-size: 10px; letter-spacing: .04em; }
          .sub-row td:first-child { padding-left: 28px; color: #666; }
          .info-grid { display:grid; grid-template-columns: repeat(3, 1fr); gap: 10px 24px; margin-bottom: 18px; }
          .info-grid .label { font-size: 9px; text-transform: uppercase; letter-spacing: .04em; color: #888; margin-bottom: 2px; }
          .info-grid .value { font-size: 11px; font-weight: 600; }
          .totals { margin-top: 20px; margin-left: auto; width: 280px; }
          .totals div { display:flex; justify-content:space-between; padding: 4px 0; font-size: 11px; }
          .totals .final { font-size: 15px; font-weight: bold; border-top: 2px solid #111; margin-top: 6px; padding-top: 8px; }
          .notes { margin-top: 28px; font-size: 11px; color: #555; }
          @media print { body { padding: 24px; } }
        </style>
      </head>
      <body>
        <div class="company-header">
          <div>
            <div class="company-name">${COMPANY_INFO.name}</div>
            <div class="company-meta">
              ${COMPANY_INFO.cnpj ? `CNPJ: ${COMPANY_INFO.cnpj}<br>` : ''}
              ${COMPANY_INFO.address ? `${COMPANY_INFO.address}<br>` : ''}
              ${COMPANY_INFO.contact || ''}
            </div>
          </div>
        </div>

        <div class="header-row">
          <div>
            <h1>Orçamento ${b.number}</h1>
            <div class="muted">${b.projectName}</div>
          </div>
          <div style="text-align:right;">
            <div class="muted">Criado em: ${fmt.date(b.createdAt)}</div>
            <div class="muted">Válido até: ${fmt.date(b.validUntil)}</div>
          </div>
        </div>

        <div class="info-grid">
          ${[
            ['Cliente', `${client?.name || '—'}${client?.company ? ' — ' + client.company : ''}`],
            ['Local', [b.address, b.city].filter(Boolean).join(', ') || '—'],
            ['Responsável', b.responsible || '—'],
            ['E-mail', b.contactEmail || client?.email || '—'],
            ['Telefone', client?.phone || '—'],
            ['Data Base', fmt.date(b.baseDate)],
            ['Forma de Pagamento', b.paymentMethod || '—'],
            ['Disponibilidade Início', fmt.date(b.startAvailability)],
            ['Prazo de Execução', b.executionDeadline || '—']
          ].map(([l, v]) => `<div><div class="label">${l}</div><div class="value">${v}</div></div>`).join('')}
        </div>

        <table>
          <thead><tr><th>Serviço</th><th>Qtd.</th><th>Valor Unitário</th><th>Valor Total</th></tr></thead>
          <tbody>
            ${b.serviceItems && b.serviceItems.length ? b.serviceItems.map(it => `
              <tr><td>${it.name}</td><td></td><td></td><td>${fmt.currency(it.value)}</td></tr>
              ${(it.subItems || []).map(sub => `
                <tr class="sub-row">
                  <td>${sub.name}</td>
                  <td>${sub.quantity ? `${fmt.number(sub.quantity)}${sub.unit ? ' ' + sub.unit : ''}` : '—'}</td>
                  <td>${fmt.currency(sub.quantity ? sub.value / sub.quantity : sub.value)}</td>
                  <td>${fmt.currency(sub.value)}</td>
                </tr>
              `).join('')}
            `).join('') : `<tr><td colspan="4">${b.services || '—'}</td></tr>`}
          </tbody>
        </table>

        <div class="totals">
          <div><span>Valor do Produto</span><span>${fmt.currency((b.materials||0) + (b.labor||0))}</span></div>
          ${b.discount ? `<div><span>Desconto</span><span>- ${fmt.currency(b.discount)}</span></div>` : ''}
          <div class="final"><span>Valor Final</span><span>${fmt.currency(b.finalValue)}</span></div>
        </div>

        ${b.notes ? `<div class="notes"><strong>Observações:</strong> ${b.notes}</div>` : ''}
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
}

window.handleBudgetUpload = async function(id, input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const b = Store.getById('budgets', id);
  if (!b) return;

  const btn = document.getElementById('b-upload-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }

  const path = `${id}/${Date.now()}_${file.name}`;
  const { error: uploadError } = await sb.storage.from('budget-attachments').upload(path, file);

  if (uploadError) {
    Toast.error('Erro ao anexar arquivo', uploadError.message);
    if (btn) { btn.disabled = false; btn.textContent = 'Anexar Versão em PDF'; }
    return;
  }

  const att = [...(b.attachments || []), { name: file.name, path, date: new Date().toISOString() }];
  Store.update('budgets', id, { attachments: att });
  Toast.success('PDF anexado!', 'O arquivo foi salvo no histórico do orçamento.');

  const modal = input.closest('.modal-overlay');
  if (modal) modal.remove();
  openBudgetDetail(id);
};

window.openBudgetAttachment = async function(path) {
  if (!path) { Toast.error('Arquivo indisponível', 'Esse anexo foi salvo antes do upload real — peça pra anexar de novo.'); return; }
  const { data, error } = await sb.storage.from('budget-attachments').createSignedUrl(path, 3600);
  if (error) { Toast.error('Erro ao abrir arquivo', error.message); return; }
  window.open(data.signedUrl, '_blank');
};

window.deleteBudgetAttachment = function(budgetId, path) {
  confirmDialog({
    title: 'Excluir Anexo',
    message: 'Tem certeza que deseja excluir este PDF? Essa ação não pode ser desfeita.',
    confirmText: 'Excluir',
    type: 'danger',
    onConfirm: async () => {
      const b = Store.getById('budgets', budgetId);
      if (!b) return;

      if (path) {
        const { error } = await sb.storage.from('budget-attachments').remove([path]);
        if (error) { Toast.error('Erro ao excluir arquivo', error.message); return; }
      }

      const att = (b.attachments || []).filter(a => a.path !== path);
      Store.update('budgets', budgetId, { attachments: att });
      Toast.success('Anexo excluído!');

      document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
      document.body.style.overflow = '';
      openBudgetDetail(budgetId);
    }
  });
};

// === ITENS DE SERVIÇO (orçamento) ===
function serviceSubItemRow(sub = {}, prefix) {
  const total = (sub.materialValue || 0) + (sub.laborValue || 0);
  return `
    <div class="svc-subitem-row" style="display:flex;gap:6px;align-items:center;margin-bottom:8px;">
      <input class="form-control svc-subname" placeholder="Nome do sub-item (ex: Escavação)" value="${sub.name ? String(sub.name).replace(/"/g, '&quot;') : ''}" style="flex:2;font-size:13px;min-width:0;">
      <input class="form-control svc-subqty" type="number" placeholder="Qtd." value="${sub.quantity || ''}" style="flex:1;font-size:13px;min-width:0;" oninput="recalcServiceItemValue(this.closest('.service-item-block'))">
      <input class="form-control svc-subunit" placeholder="Unid. (m², kg...)" value="${sub.unit ? String(sub.unit).replace(/"/g, '&quot;') : ''}" style="flex:1;font-size:13px;min-width:0;">
      <input class="form-control svc-submaterial" type="number" placeholder="Material (R$)" value="${sub.materialValue || ''}" style="flex:1;font-size:13px;min-width:0;" oninput="recalcServiceItemValue(this.closest('.service-item-block'))">
      <input class="form-control svc-sublabor" type="number" placeholder="Mão de Obra (R$)" value="${sub.laborValue || ''}" style="flex:1;font-size:13px;min-width:0;" oninput="recalcServiceItemValue(this.closest('.service-item-block'))">
      <input class="form-control svc-subtotal" type="number" value="${total || ''}" placeholder="Total" readonly style="flex:1;font-size:13px;min-width:0;background:var(--gray-50);">
      <button type="button" class="btn btn-sm btn-ghost" style="color:var(--danger);flex-shrink:0;" onclick="removeSubItemRow(this, '${prefix}')">
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
      </button>
    </div>
  `;
}

function serviceItemBlock(it = {}, prefix) {
  const subItems = it.subItems || [];
  return `
    <div class="service-item-block" style="border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px;background:var(--surface);">
      <div style="display:flex;gap:8px;align-items:center;">
        <input class="form-control svc-name" placeholder="Nome do serviço (ex: Terraplanagem)" value="${it.name ? String(it.name).replace(/"/g, '&quot;') : ''}" style="flex:2;">
        <input class="form-control svc-value" type="number" placeholder="Valor (R$)" value="${it.value || ''}" style="flex:1;" ${subItems.length ? 'readonly' : ''}>
        <button type="button" class="btn btn-sm btn-ghost" style="color:var(--danger);flex-shrink:0;" onclick="this.closest('.service-item-block').remove(); recalcBudgetTotals('${prefix}')">
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
        </button>
      </div>
      <div class="svc-subitems" style="margin-left:20px;margin-top:8px;">
        ${subItems.map(sub => serviceSubItemRow(sub, prefix)).join('')}
      </div>
      <button type="button" class="btn btn-sm btn-ghost" style="margin-left:20px;margin-top:2px;font-size:12px;" onclick="addSubItemRow(this, '${prefix}')">+ Sub-item</button>
    </div>
  `;
}

function serviceItemsBuilder(prefix, items = []) {
  const rows = items.length ? items : [{}];
  return `
    <div class="form-group form-col-span-2">
      <label class="form-label">Serviços (cada item vira um serviço na obra; sub-itens detalham de onde vem o valor)</label>
      <div id="${prefix}-service-items" oninput="recalcBudgetTotals('${prefix}')">
        ${rows.map(it => serviceItemBlock(it, prefix)).join('')}
      </div>
      <button type="button" class="btn btn-sm btn-outline" style="margin-top:4px;" onclick="addServiceItemRow('${prefix}')">+ Adicionar Serviço</button>
    </div>
  `;
}

function addServiceItemRow(prefix) {
  const container = document.getElementById(`${prefix}-service-items`);
  if (!container) return;
  container.insertAdjacentHTML('beforeend', serviceItemBlock({}, prefix));
  recalcBudgetTotals(prefix);
}

function addSubItemRow(btn, prefix) {
  const block = btn.closest('.service-item-block');
  block.querySelector('.svc-subitems').insertAdjacentHTML('beforeend', serviceSubItemRow({}, prefix));
  block.querySelector('.svc-value').readOnly = true;
  recalcServiceItemValue(block);
  recalcBudgetTotals(prefix);
}

function removeSubItemRow(btn, prefix) {
  const block = btn.closest('.service-item-block');
  btn.closest('.svc-subitem-row').remove();
  const stillHasSubItems = !!block.querySelector('.svc-subitem-row');
  block.querySelector('.svc-value').readOnly = stillHasSubItems;
  if (stillHasSubItems) recalcServiceItemValue(block);
  recalcBudgetTotals(prefix);
}

// Soma o total de todos os serviços (material dos sub-itens, mão de obra
// dos sub-itens, e o valor cheio de itens sem sub-item) e joga isso nos
// campos Materiais/Mão de Obra/Valor Final do orçamento.
function recalcBudgetTotals(prefix) {
  const container = document.getElementById(`${prefix}-service-items`);
  if (!container) return;

  let totalMaterial = 0;
  let totalLabor = 0;
  let totalFlat = 0;

  container.querySelectorAll('.service-item-block').forEach(block => {
    const subRows = block.querySelectorAll('.svc-subitem-row');
    if (subRows.length) {
      subRows.forEach(row => {
        const qty = parseFloat(row.querySelector('.svc-subqty').value) || 1;
        const material = parseFloat(row.querySelector('.svc-submaterial').value) || 0;
        const labor = parseFloat(row.querySelector('.svc-sublabor').value) || 0;
        totalMaterial += qty * material;
        totalLabor += qty * labor;
      });
    } else {
      totalFlat += parseFloat(block.querySelector('.svc-value').value) || 0;
    }
  });

  const materialsField = document.getElementById(`${prefix}-materials`);
  const laborField = document.getElementById(`${prefix}-labor`);
  if (materialsField) materialsField.value = (totalMaterial + totalFlat) || '';
  if (laborField) laborField.value = totalLabor || '';

  calcBudgetTotal(prefix);
}

function recalcServiceItemValue(block) {
  let grandTotal = 0;
  block.querySelectorAll('.svc-subitem-row').forEach(row => {
    const qty = parseFloat(row.querySelector('.svc-subqty').value) || 1;
    const material = parseFloat(row.querySelector('.svc-submaterial').value) || 0;
    const labor = parseFloat(row.querySelector('.svc-sublabor').value) || 0;
    const subTotal = qty * (material + labor);
    const totalField = row.querySelector('.svc-subtotal');
    if (totalField) totalField.value = subTotal || '';
    grandTotal += subTotal;
  });
  const valueInput = block.querySelector('.svc-value');
  if (valueInput.readOnly) valueInput.value = grandTotal || '';
}

function readServiceItems(prefix) {
  const container = document.getElementById(`${prefix}-service-items`);
  if (!container) return [];
  return [...container.querySelectorAll('.service-item-block')]
    .map(block => {
      const name = block.querySelector('.svc-name').value.trim();
      const subItems = [...block.querySelectorAll('.svc-subitem-row')]
        .map(row => {
          const quantity = parseFloat(row.querySelector('.svc-subqty').value) || 0;
          const materialValue = parseFloat(row.querySelector('.svc-submaterial').value) || 0;
          const laborValue = parseFloat(row.querySelector('.svc-sublabor').value) || 0;
          const qty = quantity || 1;
          return {
            name: row.querySelector('.svc-subname').value.trim(),
            quantity,
            unit: row.querySelector('.svc-subunit').value.trim() || null,
            materialValue,
            laborValue,
            value: qty * (materialValue + laborValue)
          };
        })
        .filter(s => s.name);
      const ownValue = parseFloat(block.querySelector('.svc-value').value) || 0;
      const value = subItems.length ? subItems.reduce((s, i) => s + i.value, 0) : ownValue;
      return { name, value, subItems };
    })
    .filter(it => it.name);
}

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
          <label class="form-label">Local (Endereço)</label>
          <input class="form-control" id="b-address" placeholder="Rua, número">
        </div>
        <div class="form-group">
          <label class="form-label">Cidade</label>
          <input class="form-control" id="b-city" placeholder="São Paulo">
        </div>
        <div class="form-group">
          <label class="form-label">Responsável</label>
          <input class="form-control" id="b-responsible" placeholder="Nome do responsável">
        </div>
        <div class="form-group">
          <label class="form-label">E-mail de Contato</label>
          <input class="form-control" id="b-email" type="email" placeholder="cliente@empresa.com">
        </div>
        <div class="form-group">
          <label class="form-label">Data de Criação</label>
          <input class="form-control" id="b-created" type="date" value="${new Date().toISOString().split('T')[0]}">
        </div>
        <div class="form-group">
          <label class="form-label">Data Base</label>
          <input class="form-control" id="b-basedate" type="date">
        </div>
        <div class="form-group">
          <label class="form-label">Validade da Proposta</label>
          <input class="form-control" id="b-valid" type="date">
        </div>
        <div class="form-group">
          <label class="form-label">Forma de Pagamento</label>
          <input class="form-control" id="b-payment" placeholder="Ex: Medições mensais">
        </div>
        <div class="form-group">
          <label class="form-label">Disponibilidade Início</label>
          <input class="form-control" id="b-startavail" type="date">
        </div>
        <div class="form-group">
          <label class="form-label">Prazo de Execução</label>
          <input class="form-control" id="b-execdeadline" placeholder="Ex: 90 dias corridos">
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
        ${serviceItemsBuilder('b')}
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
      const serviceItems = readServiceItems('b');
      Store.add('budgets', {
        number: document.getElementById('b-num').value,
        clientId, projectName: proj,
        address: document.getElementById('b-address').value.trim() || null,
        city: document.getElementById('b-city').value.trim() || null,
        responsible: document.getElementById('b-responsible').value.trim() || null,
        contactEmail: document.getElementById('b-email').value.trim() || null,
        createdAt: document.getElementById('b-created').value,
        baseDate: document.getElementById('b-basedate').value || null,
        validUntil: document.getElementById('b-valid').value,
        paymentMethod: document.getElementById('b-payment').value.trim() || null,
        startAvailability: document.getElementById('b-startavail').value || null,
        executionDeadline: document.getElementById('b-execdeadline').value.trim() || null,
        materials: mat, labor: lab, discount: disc,
        value: mat + lab, finalValue: parseFloat(document.getElementById('b-final').value)||(mat+lab-disc),
        serviceItems,
        services: serviceItems.map(i => i.name).join(', '),
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

function calcBudgetTotal(prefix = 'b') {
  const mat = parseFloat(document.getElementById(`${prefix}-materials`)?.value)||0;
  const lab = parseFloat(document.getElementById(`${prefix}-labor`)?.value)||0;
  const disc = parseFloat(document.getElementById(`${prefix}-discount`)?.value)||0;
  const finalEl = document.getElementById(`${prefix}-final`);
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
          <label class="form-label">Local (Endereço)</label>
          <input class="form-control" id="eb-address" value="${b.address || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Cidade</label>
          <input class="form-control" id="eb-city" value="${b.city || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Responsável</label>
          <input class="form-control" id="eb-responsible" value="${b.responsible || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">E-mail de Contato</label>
          <input class="form-control" id="eb-email" type="email" value="${b.contactEmail || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Data Base</label>
          <input class="form-control" id="eb-basedate" type="date" value="${b.baseDate || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Validade da Proposta</label>
          <input class="form-control" id="eb-valid" type="date" value="${b.validUntil||''}">
        </div>
        <div class="form-group">
          <label class="form-label">Forma de Pagamento</label>
          <input class="form-control" id="eb-payment" value="${b.paymentMethod || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Disponibilidade Início</label>
          <input class="form-control" id="eb-startavail" type="date" value="${b.startAvailability || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Prazo de Execução</label>
          <input class="form-control" id="eb-execdeadline" value="${b.executionDeadline || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Materiais (R$)</label>
          <input class="form-control" id="eb-materials" type="number" value="${b.materials}" oninput="calcBudgetTotal('eb')">
        </div>
        <div class="form-group">
          <label class="form-label">Mão de Obra (R$)</label>
          <input class="form-control" id="eb-labor" type="number" value="${b.labor}" oninput="calcBudgetTotal('eb')">
        </div>
        <div class="form-group">
          <label class="form-label">Desconto (R$)</label>
          <input class="form-control" id="eb-discount" type="number" value="${b.discount||0}" oninput="calcBudgetTotal('eb')">
        </div>
        <div class="form-group">
          <label class="form-label">Valor Final (R$)</label>
          <input class="form-control" id="eb-final" type="number" value="${b.finalValue}">
        </div>
        ${serviceItemsBuilder('eb', b.serviceItems || [])}
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
    if ((b.serviceItems || []).length) recalcBudgetTotals('eb');
    document.getElementById('modal-cancel')?.addEventListener('click', close);
    document.getElementById('modal-save')?.addEventListener('click', () => {
      const serviceItems = readServiceItems('eb');
      Store.update('budgets', id, {
        projectName: document.getElementById('eb-projname').value,
        status: document.getElementById('eb-status').value,
        address: document.getElementById('eb-address').value.trim() || null,
        city: document.getElementById('eb-city').value.trim() || null,
        responsible: document.getElementById('eb-responsible').value.trim() || null,
        contactEmail: document.getElementById('eb-email').value.trim() || null,
        baseDate: document.getElementById('eb-basedate').value || null,
        validUntil: document.getElementById('eb-valid').value,
        paymentMethod: document.getElementById('eb-payment').value.trim() || null,
        startAvailability: document.getElementById('eb-startavail').value || null,
        executionDeadline: document.getElementById('eb-execdeadline').value.trim() || null,
        materials: parseFloat(document.getElementById('eb-materials').value)||0,
        labor: parseFloat(document.getElementById('eb-labor').value)||0,
        discount: parseFloat(document.getElementById('eb-discount').value)||0,
        finalValue: parseFloat(document.getElementById('eb-final').value)||0,
        serviceItems,
        services: serviceItems.map(i => i.name).join(', '),
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
  const client = Store.getById('clients', b.clientId);
  confirmDialog({
    title: 'Aprovar Orçamento',
    message: `Marcar "${b.projectName}" como aprovado e criar a obra correspondente em Obras & Projetos?`,
    confirmText: 'Aprovar e Criar Obra',
    type: 'warning',
    onConfirm: async () => {
      // Usa addAwait aqui: cada inserção precisa existir de verdade no banco
      // antes da próxima (obra -> serviço pai -> sub-item), senão a chave
      // estrangeira falha por causa da ordem de chegada das requisições.
      const project = await Store.addAwait('projects', {
        name: b.projectName,
        clientId: b.clientId,
        responsible: b.responsible || Store.getCurrentUserLabel(),
        category: 'Outros',
        status: 'aprovado',
        address: b.address || '',
        city: b.city || '',
        contractValue: b.finalValue,
        receivedValue: 0,
        costValue: b.materials + b.labor,
        paymentMethod: b.paymentMethod || '',
        proposalNumber: b.number,
        contactEmail: b.contactEmail || client?.email || null,
        baseDate: b.baseDate || b.createdAt,
        proposalValidUntil: b.validUntil,
        executionDeadline: b.executionDeadline || null,
        closedAt: new Date().toISOString().split('T')[0],
        startDate: b.startAvailability || null,
        endDate: null,
        description: b.services,
        notes: `Gerado a partir do orçamento ${b.number}`,
        physicalProgress: 0
      });
      if (!project) return;

      Store.update('budgets', budgetId, { status: 'aprovado' });

      for (const item of (b.serviceItems || [])) {
        const parent = await Store.addAwait('project_services', {
          projectId: project.id,
          name: item.name,
          budgetedValue: item.value || 0,
          parentId: null
        });
        if (!parent) continue;

        for (const sub of (item.subItems || [])) {
          await Store.addAwait('project_services', {
            projectId: project.id,
            name: sub.name,
            budgetedValue: sub.value || 0,
            quantity: sub.quantity || null,
            unit: sub.unit || null,
            materialValue: sub.materialValue || null,
            laborValue: sub.laborValue || null,
            parentId: parent.id
          });
        }
      }

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
