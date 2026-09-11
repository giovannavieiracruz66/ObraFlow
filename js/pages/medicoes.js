// ==========================================
// MEDIÇÕES PAGE
// ==========================================

let medicFilter = { status: '', projectId: '', search: '', page: 1 };

function renderMedicoes() {
  const measurements = Store.getList('measurements');
  const projects = Store.getList('projects');
  const getProjectName = id => projects.find(p => p.id === id)?.name || '—';

  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Medições</h1>
        <p>${measurements.length} medições cadastradas</p>
      </div>
      <div class="page-header-actions">
        ${canWrite() ? `
        <button class="btn btn-primary" onclick="openNewMeasurementModal()">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nova Medição
        </button>` : ''}
      </div>
    </div>

    <!-- STATUS SUMMARY -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px;">
      ${[
        ['Em Elaboração', measurements.filter(m=>m.status==='em_elaboracao').length, 'gray'],
        ['Aguardando Aprovação', measurements.filter(m=>['aguardando_aprovacao','enviada'].includes(m.status)).length, 'orange'],
        ['Aprovadas', measurements.filter(m=>m.status==='aprovada').length, 'cyan'],
        ['Pagas', measurements.filter(m=>m.status==='paga').length, 'green'],
      ].map(([l, v, c]) => `
        <div class="kpi-card ${c}">
          <div class="kpi-value">${v}</div>
          <div class="kpi-label">${l}</div>
        </div>
      `).join('')}
    </div>

    <!-- FILTERS -->
    <div class="filters-bar">
      <div class="search-wrapper">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="search-input" type="text" placeholder="Buscar medição..." value="${medicFilter.search}" oninput="medicFilter.search=this.value;medicFilter.page=1;renderMedicContent()">
      </div>
      <select class="filter-select" onchange="medicFilter.projectId=this.value;medicFilter.page=1;renderMedicContent()">
        <option value="">Todas as obras</option>
        ${projects.map(p => `<option value="${p.id}" ${medicFilter.projectId===p.id?'selected':''}>${p.name}</option>`).join('')}
      </select>
      <select class="filter-select" onchange="medicFilter.status=this.value;medicFilter.page=1;renderMedicContent()">
        <option value="">Todos os status</option>
        ${Object.entries(StatusHelpers.measurement.labels).map(([v,l]) => `<option value="${v}" ${medicFilter.status===v?'selected':''}>${l}</option>`).join('')}
      </select>
      <button class="btn btn-sm btn-ghost" onclick="medicFilter={status:'',projectId:'',search:'',page:1};renderMedicContent()">Limpar</button>
    </div>

    <!-- TABLE -->
    <div class="card">
      <div class="table-wrapper">
        <table id="medic-table">
          <thead>
            <tr><th>#</th><th>OBRA</th><th>PERÍODO</th><th>BRUTO</th><th>LÍQUIDO</th><th>APROVADO</th><th>VENCIMENTO</th><th>PAGO EM</th><th>STATUS</th><th></th></tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
      <div id="medic-pag"></div>
    </div>
  `;

  renderMedicContent();
}

function renderMedicContent() {
  const measurements = Store.getList('measurements');
  const projects = Store.getList('projects');
  const getProjectName = id => projects.find(p => p.id === id)?.name || '—';

  let filtered = measurements.filter(m => {
    const proj = getProjectName(m.projectId);
    const matchSearch = !medicFilter.search || proj.toLowerCase().includes(medicFilter.search.toLowerCase()) || m.period?.toLowerCase().includes(medicFilter.search.toLowerCase());
    const matchProject = !medicFilter.projectId || m.projectId === medicFilter.projectId;
    const matchStatus = !medicFilter.status || m.status === medicFilter.status;
    return matchSearch && matchProject && matchStatus;
  });

  paginate({
    items: filtered,
    page: medicFilter.page || 1,
    perPage: 10,
    containerId: 'medic',
    tableId: 'medic-table',
    renderRow: m => {
      const b = getMeasurementBreakdown(m);
      return `
      <tr>
        <td class="td-main">Med. ${m.number}</td>
        <td>
          <div style="font-weight:600;color:var(--text);">${getProjectName(m.projectId)}</div>
          <div style="font-size:11px;color:var(--text-faint);">${m.period}</div>
        </td>
        <td>${m.period}</td>
        <td class="font-semibold">${fmt.currency(b.gross)}</td>
        <td class="font-semibold" style="color:var(--primary-700);">${fmt.currency(b.net)}</td>
        <td>${m.approvedValue ? fmt.currency(m.approvedValue) : '—'}</td>
        <td>${fmt.date(m.paymentDue)}</td>
        <td>${fmt.date(m.paidAt)}</td>
        <td>${badge('measurement', m.status)}</td>
        <td>
          <div style="display:flex;gap:4px;">
            <button class="btn btn-sm btn-ghost" title="Emitir PDF" onclick="printMeasurementPDF('${m.id}')">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-12 0h12v6H6v-6z"/></svg>
            </button>
            <button class="btn btn-sm btn-ghost" onclick="openEditMeasurementModal('${m.id}')">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button class="btn btn-sm btn-ghost" style="color:var(--danger);" onclick="deleteMeasurement('${m.id}')">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
    }
  });
}

// === ESTRUTURA DE MEDIÇÃO (campos + resumo calculado ao vivo) ===
function measurementBreakdownFields(prefix, m = {}) {
  return `
    <div class="form-group">
      <label class="form-label">Total Mão de Obra (R$)</label>
      <input class="form-control" id="${prefix}-labor" type="number" placeholder="0" value="${m.laborValue || ''}" oninput="computeAndRenderMedSummary('${prefix}')">
    </div>
    <div class="form-group">
      <label class="form-label">Total Material (R$)</label>
      <input class="form-control" id="${prefix}-material" type="number" placeholder="0" value="${m.materialValue || ''}" oninput="computeAndRenderMedSummary('${prefix}')">
    </div>
    <div class="form-group">
      <label class="form-label">Desconto Faturamento Direto (R$)</label>
      <input class="form-control" id="${prefix}-discount" type="number" placeholder="0" value="${m.directBillingDiscount || ''}" oninput="computeAndRenderMedSummary('${prefix}')">
    </div>
    <div class="form-group">
      <label class="form-label">Caução / Permuta (R$)</label>
      <input class="form-control" id="${prefix}-caution" type="number" placeholder="0" value="${m.cautionValue || ''}" oninput="computeAndRenderMedSummary('${prefix}')">
    </div>
    <div class="form-group">
      <label class="form-label">INSS (R$)</label>
      <input class="form-control" id="${prefix}-inss" type="number" placeholder="0" value="${m.inssValue || ''}" oninput="computeAndRenderMedSummary('${prefix}')">
    </div>
    <div class="form-group">
      <label class="form-label">ISS (R$)</label>
      <input class="form-control" id="${prefix}-iss" type="number" placeholder="0" value="${m.issValue || ''}" oninput="computeAndRenderMedSummary('${prefix}')">
    </div>
    <div class="form-group form-col-span-2">
      <div class="card" style="background:var(--gray-50);">
        <div class="card-header"><div class="card-title" style="font-size:13px;">Estrutura de Medição</div></div>
        <div class="card-body" id="${prefix}-summary" style="padding:14px 20px;"></div>
      </div>
    </div>
  `;
}

function medRow(label, value, opts = {}) {
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;
      padding:${opts.border ? '10px' : '4px'} 0 4px;
      ${opts.border ? 'border-top:1px solid var(--border);margin-top:6px;' : ''}
      ${opts.indent ? 'padding-left:18px;' : ''}">
      <span style="font-size:13px;${opts.bold ? 'font-weight:700;color:var(--text);' : 'color:var(--text-light);'}">${label}</span>
      ${value !== null ? `<span style="font-size:13px;${opts.bold ? 'font-weight:700;color:var(--text);' : ''}">${fmt.currency(value)}</span>` : ''}
    </div>
  `;
}

function renderMedSummaryHTML(b) {
  return `
    ${medRow('Total Mão de Obra', b.labor)}
    ${medRow('Total Material', b.material)}
    ${medRow('Total da Medição Bruta', b.gross, { bold: true, border: true })}
    ${medRow('Desconto Faturamento Direto', b.discount, { border: true })}
    ${medRow('Subtotal', b.subtotal, { bold: true, border: true })}
    ${medRow('Caução / Permuta', b.caution, { border: true })}
    ${medRow('Impostos', null, { border: true, bold: true })}
    ${medRow('INSS', b.inss, { indent: true })}
    ${medRow('ISS', b.iss, { indent: true })}
    ${medRow('Total dos Impostos', b.totalTaxes, { indent: true, bold: true })}
    ${medRow('Total Líquido', b.net, { bold: true, border: true })}
  `;
}

function computeAndRenderMedSummary(prefix) {
  const val = (id) => parseFloat(document.getElementById(`${prefix}-${id}`)?.value) || 0;
  const labor = val('labor');
  const material = val('material');
  const gross = labor + material;
  const discount = val('discount');
  const subtotal = gross - discount;
  const caution = val('caution');
  const inss = val('inss');
  const iss = val('iss');
  const totalTaxes = inss + iss;
  const net = subtotal - caution - totalTaxes;
  const breakdown = { labor, material, gross, discount, subtotal, caution, inss, iss, totalTaxes, net };

  const summaryEl = document.getElementById(`${prefix}-summary`);
  if (summaryEl) summaryEl.innerHTML = renderMedSummaryHTML(breakdown);

  return breakdown;
}

// === ALOCAÇÃO POR SERVIÇO (quanto de cada serviço foi executado nesta medição) ===
function renderMedServiceAlloc(prefix, projectId, measurementId = null) {
  const container = document.getElementById(`${prefix}-services-alloc`);
  if (!container) return;
  if (!projectId) { container.innerHTML = ''; return; }

  const services = getProjectServicesProgress(projectId);
  if (!services.length) { container.innerHTML = ''; return; }

  const withAllocState = (s) => {
    const ownAlloc = measurementId ? Store.getList('measurement_services').find(a => a.measurementId === measurementId && a.projectServiceId === s.id) : null;
    const ownPct = ownAlloc ? ownAlloc.percentage : 0;
    const baselinePct = Math.max(0, s.executedPct - ownPct);
    const maxAllowed = Math.max(0, 100 - baselinePct);
    return { ...s, ownPct, baselinePct, maxAllowed };
  };

  const leafInput = (s) => `
    <div style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
        <span style="font-weight:600;color:var(--text);">${s.name}</span>
        <span style="color:var(--text-faint);">Já executado: ${s.baselinePct.toFixed(1)}% • Orçado: ${fmt.currency(s.budgetedValue)}</span>
      </div>
      <input class="form-control svc-alloc-pct" data-service-id="${s.id}" data-budgeted="${s.budgetedValue}" type="number" min="0" max="${s.maxAllowed}" value="${s.ownPct || ''}" placeholder="% executado nesta medição" oninput="updateMedServiceTotal('${prefix}')">
    </div>
  `;

  const blocks = services.map(s => {
    if (s.subItems && s.subItems.length) {
      return `
        <div style="margin-bottom:16px;">
          <div style="font-size:12px;font-weight:700;color:var(--primary-800);margin-bottom:8px;">${s.name}</div>
          <div style="padding-left:16px;border-left:2px solid var(--border);">
            ${s.subItems.map(sub => leafInput(withAllocState(sub))).join('')}
          </div>
        </div>
      `;
    }
    return leafInput(withAllocState(s));
  }).join('');

  container.innerHTML = `
    <div class="card" style="background:var(--gray-50);">
      <div class="card-header"><div class="card-title" style="font-size:13px;">Alocação por Serviço</div></div>
      <div class="card-body" style="padding:14px 20px;">
        ${blocks}
        <div id="${prefix}-services-total" style="font-size:12px;font-weight:700;color:var(--primary-800);border-top:1px solid var(--border);padding-top:10px;margin-top:4px;"></div>
      </div>
    </div>
  `;
  updateMedServiceTotal(prefix);
}

function updateMedServiceTotal(prefix) {
  const inputs = document.querySelectorAll(`#${prefix}-services-alloc .svc-alloc-pct`);
  if (!inputs.length) return;
  let totalBudget = 0, weightedPct = 0;
  inputs.forEach(inp => {
    const budgeted = parseFloat(inp.dataset.budgeted) || 0;
    const pct = parseFloat(inp.value) || 0;
    totalBudget += budgeted;
    weightedPct += budgeted * pct;
  });
  const overallPct = totalBudget > 0 ? (weightedPct / totalBudget) : 0;

  const totalEl = document.getElementById(`${prefix}-services-total`);
  if (totalEl) totalEl.textContent = `% desta medição (média ponderada pelos serviços): ${overallPct.toFixed(1)}%`;

  const pctField = document.getElementById(`${prefix}-pct`);
  if (pctField) pctField.value = overallPct.toFixed(1);
}

function readMedServiceAllocations(prefix) {
  const inputs = document.querySelectorAll(`#${prefix}-services-alloc .svc-alloc-pct`);
  return [...inputs]
    .map(inp => ({
      projectServiceId: inp.dataset.serviceId,
      percentage: parseFloat(inp.value) || 0,
      budgetedValue: parseFloat(inp.dataset.budgeted) || 0
    }))
    .filter(a => a.percentage > 0);
}

async function saveMedServiceAllocations(measurementId, allocations) {
  for (const a of allocations) {
    await Store.addAwait('measurement_services', {
      measurementId,
      projectServiceId: a.projectServiceId,
      percentage: a.percentage,
      value: a.budgetedValue * a.percentage / 100
    });
  }
}

function openNewMeasurementModal(preProjectId = '') {
  const projects = Store.getList('projects');

  const { close } = Modal.create({
    title: 'Nova Medição',
    size: 'modal-lg',
    body: `
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Obra *</label>
          <select class="form-control" id="med-project" onchange="renderMedServiceAlloc('med', this.value)">
            <option value="">Selecionar obra</option>
            ${projects.map(p => `<option value="${p.id}" ${p.id===preProjectId?'selected':''}>${p.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Período</label>
          <input class="form-control" id="med-period" placeholder="Ex: Jan/2025">
        </div>
        <div class="form-group">
          <label class="form-label">Data da Medição</label>
          <input class="form-control" id="med-date" type="date" value="${new Date().toISOString().split('T')[0]}">
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-control" id="med-status">
            ${Object.entries(StatusHelpers.measurement.labels).map(([v,l]) => `<option value="${v}">${l}</option>`).join('')}
          </select>
        </div>

        ${measurementBreakdownFields('med')}

        <div class="form-group">
          <label class="form-label">Valor Aprovado (R$)</label>
          <input class="form-control" id="med-approved" type="number" placeholder="0">
        </div>
        <div class="form-group">
          <label class="form-label">% Executado nesta Med.</label>
          <input class="form-control" id="med-pct" type="number" min="0" max="100" placeholder="0">
        </div>
        <div class="form-group">
          <label class="form-label">Vencimento do Pagamento</label>
          <input class="form-control" id="med-due" type="date">
        </div>
        <div class="form-group">
          <label class="form-label">Data de Envio</label>
          <input class="form-control" id="med-sent" type="date">
        </div>
        <div class="form-group">
          <label class="form-label">Data de Aprovação</label>
          <input class="form-control" id="med-apprdate" type="date">
        </div>
        <div class="form-group form-col-span-2" id="med-services-alloc"></div>
        <div class="form-group form-col-span-2">
          <label class="form-label">Descrição dos Serviços Realizados</label>
          <textarea class="form-control" id="med-desc" rows="3" placeholder="Descreva os serviços medidos..."></textarea>
        </div>
        <div class="form-group form-col-span-2">
          <label class="form-label">Observações</label>
          <textarea class="form-control" id="med-notes" rows="2"></textarea>
        </div>
      </div>
    `,
    footer: `
      <button class="btn btn-outline" id="modal-cancel">Cancelar</button>
      <button class="btn btn-primary" id="modal-save">Salvar Medição</button>
    `
  });

  setTimeout(() => {
    computeAndRenderMedSummary('med');
    renderMedServiceAlloc('med', preProjectId);
    document.getElementById('modal-cancel')?.addEventListener('click', close);
    document.getElementById('modal-save')?.addEventListener('click', async () => {
      const projectId = document.getElementById('med-project').value;
      if (!projectId) { Toast.error('Campo obrigatório', 'Selecione a obra.'); return; }
      const b = computeAndRenderMedSummary('med');
      const allocations = readMedServiceAllocations('med');
      const existingMeds = Store.getList('measurements').filter(m => m.projectId === projectId);
      const measurement = await Store.addAwait('measurements', {
        number: existingMeds.length + 1,
        projectId,
        period: document.getElementById('med-period').value,
        date: document.getElementById('med-date').value,
        status: document.getElementById('med-status').value,
        value: b.gross,
        laborValue: b.labor,
        materialValue: b.material,
        directBillingDiscount: b.discount,
        cautionValue: b.caution,
        inssValue: b.inss,
        issValue: b.iss,
        approvedValue: parseFloat(document.getElementById('med-approved').value) || null,
        percentage: parseFloat(document.getElementById('med-pct').value) || 0,
        paymentDue: document.getElementById('med-due').value || null,
        sentAt: document.getElementById('med-sent').value || null,
        approvedAt: document.getElementById('med-apprdate').value || null,
        paidAt: null,
        description: document.getElementById('med-desc').value,
        notes: document.getElementById('med-notes').value
      });
      if (!measurement) return;
      await saveMedServiceAllocations(measurement.id, allocations);
      close();
      Toast.success('Medição cadastrada!');
      renderMedicoes();
    });
  }, 50);
}

function openEditMeasurementModal(id) {
  const m = Store.getById('measurements', id);
  if (!m) return;

  const { close } = Modal.create({
    title: `Editar Medição #${m.number}`,
    size: 'modal-lg',
    body: `
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Período</label>
          <input class="form-control" id="emed-period" value="${m.period||''}">
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-control" id="emed-status">
            ${Object.entries(StatusHelpers.measurement.labels).map(([v,l]) => `<option value="${v}" ${m.status===v?'selected':''}>${l}</option>`).join('')}
          </select>
        </div>
        ${measurementBreakdownFields('emed', m)}

        <div class="form-group">
          <label class="form-label">Valor Aprovado (R$)</label>
          <input class="form-control" id="emed-approved" type="number" value="${m.approvedValue||''}">
        </div>
        <div class="form-group">
          <label class="form-label">% Executado</label>
          <input class="form-control" id="emed-pct" type="number" value="${m.percentage}">
        </div>
        <div class="form-group">
          <label class="form-label">Vencimento</label>
          <input class="form-control" id="emed-due" type="date" value="${m.paymentDue||''}">
        </div>
        <div class="form-group">
          <label class="form-label">Data de Aprovação</label>
          <input class="form-control" id="emed-apprdate" type="date" value="${m.approvedAt||''}">
        </div>
        <div class="form-group">
          <label class="form-label">Data do Pagamento</label>
          <input class="form-control" id="emed-paid" type="date" value="${m.paidAt||''}">
        </div>
        <div class="form-group form-col-span-2" id="emed-services-alloc"></div>
        <div class="form-group form-col-span-2">
          <label class="form-label">Descrição</label>
          <textarea class="form-control" id="emed-desc" rows="3">${m.description||''}</textarea>
        </div>
        <div class="form-group form-col-span-2">
          <label class="form-label">Observações</label>
          <textarea class="form-control" id="emed-notes" rows="2">${m.notes||''}</textarea>
        </div>
      </div>
    `,
    footer: `
      <button class="btn btn-outline" id="modal-cancel">Cancelar</button>
      <button class="btn btn-primary" id="modal-save">Salvar</button>
    `
  });

  setTimeout(() => {
    computeAndRenderMedSummary('emed');
    renderMedServiceAlloc('emed', m.projectId, m.id);
    document.getElementById('modal-cancel')?.addEventListener('click', close);
    document.getElementById('modal-save')?.addEventListener('click', async () => {
      const b = computeAndRenderMedSummary('emed');
      const allocations = readMedServiceAllocations('emed');
      Store.update('measurements', id, {
        period: document.getElementById('emed-period').value,
        status: document.getElementById('emed-status').value,
        value: b.gross,
        laborValue: b.labor,
        materialValue: b.material,
        directBillingDiscount: b.discount,
        cautionValue: b.caution,
        inssValue: b.inss,
        issValue: b.iss,
        approvedValue: parseFloat(document.getElementById('emed-approved').value) || null,
        percentage: parseFloat(document.getElementById('emed-pct').value) || 0,
        paymentDue: document.getElementById('emed-due').value || null,
        approvedAt: document.getElementById('emed-apprdate').value || null,
        paidAt: document.getElementById('emed-paid').value || null,
        description: document.getElementById('emed-desc').value,
        notes: document.getElementById('emed-notes').value
      });

      Store.getList('measurement_services').filter(a => a.measurementId === id).forEach(a => Store.remove('measurement_services', a.id));
      await saveMedServiceAllocations(id, allocations);

      close();
      Toast.success('Medição atualizada!');
      renderMedicoes();
    });
  }, 50);
}

function printMeasurementPDF(measurementId) {
  const m = Store.getById('measurements', measurementId);
  if (!m) return;
  const project = Store.getById('projects', m.projectId);
  const client = project ? Store.getById('clients', project.clientId) : null;
  const b = getMeasurementBreakdown(m);

  const allocations = Store.getList('measurement_services')
    .filter(a => a.measurementId === measurementId)
    .map(a => ({ ...a, serviceName: Store.getById('project_services', a.projectServiceId)?.name || '—' }));

  const win = window.open('', '_blank');
  if (!win) { Toast.error('Bloqueado pelo navegador', 'Permita pop-ups para emitir o PDF.'); return; }

  win.document.write(`
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Medição ${m.number} - ${project?.name || ''}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; padding: 48px; color: #1a1a1a; font-size: 11px; }
          h1 { font-size: 18px; margin: 0 0 4px; }
          .muted { color: #666; font-size: 11px; margin-bottom: 2px; }
          .company-header { margin-bottom: 16px; }
          .company-name { font-size: 13px; font-weight: 800; }
          .company-meta { font-size: 10px; color: #666; margin-top: 2px; line-height: 1.5; }
          .header-row { display:flex; justify-content:space-between; margin-bottom: 20px; padding-bottom:14px; border-bottom: 2px solid #111; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { text-align: left; padding: 6px 10px; border-bottom: 1px solid #ddd; font-size: 11px; }
          th { background: #f5f5f5; text-transform: uppercase; font-size: 10px; letter-spacing: .04em; }
          .breakdown { margin-top: 20px; margin-left: auto; width: 320px; }
          .breakdown div { display:flex; justify-content:space-between; padding: 4px 0; font-size: 11px; }
          .breakdown .bold { font-weight: bold; }
          .breakdown .border { border-top: 1px solid #ddd; margin-top: 6px; padding-top: 8px; }
          .breakdown .final { font-size: 15px; font-weight: bold; border-top: 2px solid #111; margin-top: 6px; padding-top: 8px; }
          .approval { margin-top: 60px; display: flex; justify-content: space-between; }
          .approval div { width: 45%; border-top: 1px solid #444; text-align: center; padding-top: 6px; font-size: 11px; color: #555; }
          .notes { margin-top: 28px; font-size: 11px; color: #555; }
          @media print { body { padding: 24px; } }
        </style>
      </head>
      <body>
        <div class="company-header">
          <div class="company-name">${COMPANY_INFO.name}</div>
          <div class="company-meta">
            ${COMPANY_INFO.cnpj ? `CNPJ: ${COMPANY_INFO.cnpj}<br>` : ''}
            ${COMPANY_INFO.address ? `${COMPANY_INFO.address}<br>` : ''}
            ${COMPANY_INFO.contact || ''}
          </div>
        </div>

        <div class="header-row">
          <div>
            <h1>Medição #${m.number}</h1>
            <div class="muted">${project?.name || '—'}</div>
          </div>
          <div style="text-align:right;">
            <div class="muted">Período: ${m.period || '—'}</div>
            <div class="muted">Data: ${fmt.date(m.date)}</div>
          </div>
        </div>

        <div class="muted"><strong>Cliente:</strong> ${client?.name || '—'}${client?.company ? ' — ' + client.company : ''}</div>
        ${m.description ? `<div class="muted" style="margin-top:8px;"><strong>Serviços realizados:</strong> ${m.description}</div>` : ''}

        ${allocations.length ? `
          <table>
            <thead><tr><th>Serviço</th><th>% Executado nesta Medição</th><th>Valor</th></tr></thead>
            <tbody>
              ${allocations.map(a => `<tr><td>${a.serviceName}</td><td>${a.percentage.toFixed(1)}%</td><td>${fmt.currency(a.value)}</td></tr>`).join('')}
            </tbody>
          </table>
        ` : ''}

        <div class="breakdown">
          <div><span>Total Mão de Obra</span><span>${fmt.currency(b.labor)}</span></div>
          <div><span>Total Material</span><span>${fmt.currency(b.material)}</span></div>
          <div class="bold border"><span>Total da Medição Bruta</span><span>${fmt.currency(b.gross)}</span></div>
          <div class="border"><span>Desconto Faturamento Direto</span><span>- ${fmt.currency(b.discount)}</span></div>
          <div class="bold border"><span>Subtotal</span><span>${fmt.currency(b.subtotal)}</span></div>
          <div class="border"><span>Caução / Permuta</span><span>- ${fmt.currency(b.caution)}</span></div>
          <div class="border"><span>Impostos (INSS + ISS)</span><span>- ${fmt.currency(b.totalTaxes)}</span></div>
          <div class="final"><span>Total Líquido</span><span>${fmt.currency(b.net)}</span></div>
          <div style="margin-top:10px;"><span>% Executado</span><span>${(m.percentage || 0).toFixed(1)}%</span></div>
        </div>

        ${m.notes ? `<div class="notes"><strong>Observações:</strong> ${m.notes}</div>` : ''}

        <div class="approval">
          <div>${project?.responsible || 'Responsável Técnico'}</div>
          <div>${client?.name || 'Cliente'} (aprovação)</div>
        </div>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
}

function deleteMeasurement(id) {
  const m = Store.getById('measurements', id);
  confirmDialog({
    title: 'Excluir Medição',
    message: `Excluir Medição #${m?.number}?`,
    confirmText: 'Excluir',
    type: 'danger',
    onConfirm: () => {
      Store.remove('measurements', id);
      Toast.success('Medição excluída!');
      renderMedicoes();
    }
  });
}
