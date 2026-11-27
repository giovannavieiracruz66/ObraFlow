// ==========================================
// OBRAFLOW — UI COMPONENTS
// ==========================================

// === TOAST NOTIFICATIONS ===
const Toast = (() => {
  let container;
  function getContainer() {
    if (!container) {
      container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        container.id = 'toast-container';
        document.body.appendChild(container);
      }
    }
    return container;
  }

  function show(type, title, message = '', duration = 3500) {
    const icons = {
      success: `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
      error:   `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
      warning: `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
      info:    `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${icons[type]}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;
    getContainer().appendChild(toast);
    setTimeout(() => toast.style.opacity = '0', duration);
    setTimeout(() => toast.remove(), duration + 400);
  }

  return { success: (t, m) => show('success', t, m), error: (t, m) => show('error', t, m), warning: (t, m) => show('warning', t, m), info: (t, m) => show('info', t, m) };
})();

// === MODAL ===
const Modal = (() => {
  function create({ title, body, footer, size = '', onClose, titleIcon = '' }) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
      <div class="modal ${size}" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="modal-title">
            ${titleIcon ? `<span>${titleIcon}</span>` : ''}
            ${title}
          </div>
          <button class="modal-close" id="modal-close-btn">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">${body}</div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const close = () => {
      overlay.style.opacity = '0';
      setTimeout(() => { overlay.remove(); document.body.style.overflow = ''; }, 200);
      if (onClose) onClose();
    };

    overlay.querySelector('#modal-close-btn').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } });

    return { overlay, close };
  }

  return { create };
})();

// === CONFIRM DIALOG ===
function confirmDialog({ title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'danger', onConfirm }) {
  const icons = {
    danger:  `<svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`,
    warning: `<svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`
  };

  const btnClass = type === 'danger' ? 'btn-danger' : 'btn-accent';

  const { close } = Modal.create({
    title,
    body: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center;">
        <div class="confirm-icon ${type}">${icons[type]}</div>
        <p style="color:var(--text-light);font-size:14px;max-width:280px;">${message}</p>
      </div>
    `,
    footer: `
      <button class="btn btn-outline" id="confirm-cancel">${cancelText}</button>
      <button class="btn ${btnClass}" id="confirm-ok">${confirmText}</button>
    `,
    size: 'modal-sm'
  });

  setTimeout(() => {
    document.getElementById('confirm-cancel')?.addEventListener('click', close);
    document.getElementById('confirm-ok')?.addEventListener('click', () => { close(); if (onConfirm) onConfirm(); });
  }, 50);
}

// === STATUS HELPERS ===
const StatusHelpers = {
  project: {
    labels: {
      orcamento: 'Orçamento', aguardando_aprovacao: 'Aguard. Aprovação', aprovado: 'Aprovado',
      programada: 'Programada', em_andamento: 'Em Andamento', pausada: 'Pausada',
      concluida: 'Concluída', cancelada: 'Cancelada'
    },
    badges: {
      orcamento: 'badge-gray', aguardando_aprovacao: 'badge-orange', aprovado: 'badge-cyan',
      programada: 'badge-blue', em_andamento: 'badge-green', pausada: 'badge-purple',
      concluida: 'badge-teal', cancelada: 'badge-red'
    }
  },
  measurement: {
    labels: {
      em_elaboracao: 'Em Elaboração', enviada: 'Enviada', aguardando_aprovacao: 'Aguard. Aprovação',
      aprovada: 'Aprovada', faturada: 'Faturada', paga: 'Paga', recusada: 'Recusada'
    },
    badges: {
      em_elaboracao: 'badge-gray', enviada: 'badge-blue', aguardando_aprovacao: 'badge-orange',
      aprovada: 'badge-cyan', faturada: 'badge-purple', paga: 'badge-green', recusada: 'badge-red'
    }
  },
  budget: {
    labels: {
      rascunho: 'Rascunho', enviado: 'Enviado', aguardando_resposta: 'Aguardando Resposta',
      aprovado: 'Aprovado', recusado: 'Recusado', expirado: 'Expirado'
    },
    badges: {
      rascunho: 'badge-gray', enviado: 'badge-blue', aguardando_resposta: 'badge-orange',
      aprovado: 'badge-green', recusado: 'badge-red', expirado: 'badge-purple'
    }
  },
  financial: {
    labels: { previsto: 'Previsto', a_receber: 'A Receber', recebido: 'Recebido', atrasado: 'Atrasado' },
    badges: { previsto: 'badge-gray', a_receber: 'badge-blue', recebido: 'badge-green', atrasado: 'badge-red' }
  },
  order: {
    labels: { pendente: 'Pendente', parcial: 'Parcial', concluido: 'Concluído', atrasado: 'Atrasado' },
    badges: { pendente: 'badge-gray', parcial: 'badge-orange', concluido: 'badge-green', atrasado: 'badge-red' }
  }
};

function badge(entity, status) {
  const h = StatusHelpers[entity];
  if (!h) return `<span class="badge badge-gray">${status}</span>`;
  return `<span class="badge ${h.badges[status] || 'badge-gray'}">${h.labels[status] || status}</span>`;
}

// Perfis "view-only" (hoje só Diretoria) não criam/editam registros —
// usado pra esconder os botões de criação nas telas principais. A trava
// de verdade fica no banco (RLS); isso aqui é só a camada de UX.
function canWrite() {
  return Store.getRole() !== 'diretoria';
}

// === ESTRUTURA DE MEDIÇÃO ===
// Mão de obra + material -> (A) Bruto -> (B) Desconto -> Subtotal ->
// (C) Caução/Permuta -> (D) Impostos (INSS+ISS) -> Total Líquido.
// Medições antigas (sem esses campos) caem no fallback: bruto = value.
function getMeasurementBreakdown(m) {
  const hasBreakdown = !!(m.laborValue || m.materialValue || m.directBillingDiscount || m.cautionValue || m.inssValue || m.issValue);
  const n = v => Number(v) || 0;
  const labor = n(m.laborValue);
  const material = n(m.materialValue);
  const gross = hasBreakdown ? (labor + material) : n(m.value); // (A)
  const discount = n(m.directBillingDiscount); // (B)
  const subtotal = gross - discount; // (A)-(B)
  const caution = n(m.cautionValue); // (C)
  const inss = n(m.inssValue);
  const iss = n(m.issValue);
  const totalTaxes = inss + iss; // (D)
  const net = subtotal - caution - totalTaxes; // Total Líquido
  return { labor, material, gross, discount, subtotal, caution, inss, iss, totalTaxes, net, hasBreakdown };
}

// === SERVIÇOS DA OBRA (progresso acumulado por medição) ===
// Cada linha "folha" de project_services (sem sub-itens) tem um valor
// orçado; cada medição pode alocar quanto (%) daquela folha foi
// executado NESSA medição (measurement_services). Quando um serviço
// tem sub-itens, seu progresso é o somatório dos sub-itens (rollup) —
// a alocação em si só acontece nas folhas.
function getProjectServicesProgress(projectId) {
  const all = Store.getList('project_services').filter(s => s.projectId === projectId);
  const allocations = Store.getList('measurement_services');

  const computeLeaf = (s) => {
    const rows = allocations.filter(a => a.projectServiceId === s.id);
    const executedPct = Math.min(100, rows.reduce((sum, r) => sum + (r.percentage || 0), 0));
    const executedValue = (s.budgetedValue || 0) * executedPct / 100;
    return { ...s, executedPct, executedValue, subItems: [] };
  };

  const topLevel = all.filter(s => !s.parentId);

  return topLevel.map(parent => {
    const children = all.filter(s => s.parentId === parent.id).map(computeLeaf);
    if (children.length) {
      const executedValue = children.reduce((sum, c) => sum + c.executedValue, 0);
      const executedPct = parent.budgetedValue > 0 ? Math.min(100, executedValue / parent.budgetedValue * 100) : 0;
      return { ...parent, executedPct, executedValue, subItems: children };
    }
    return computeLeaf(parent);
  });
}

// === ORDER / ALMOXARIFADO STATUS ===
function getOrderStatus(order) {
  const saldo = order.quantity - order.delivered;
  const today = new Date().toISOString().split('T')[0];
  if (saldo <= 0) return 'concluido';
  if (order.expectedDate && order.expectedDate < today) return 'atrasado';
  if (order.delivered > 0) return 'parcial';
  return 'pendente';
}

// === PAGINATION ===
function paginate({ items, page, perPage = 10, containerId, renderRow, tableId, onPageChange }) {
  if (onPageChange) _pageCallbacks[containerId] = onPageChange;
  const total = items.length;
  const totalPages = Math.ceil(total / perPage);
  page = Math.min(Math.max(1, Number(page) || 1), Math.max(1, totalPages));
  const start = (page - 1) * perPage;
  const pageItems = items.slice(start, start + perPage);

  const tbody = document.querySelector(`#${tableId} tbody`);
  if (tbody) {
    // Uma linha com dado incompleto não pode travar a página inteira:
    // registra o erro no console e segue montando as outras linhas.
    tbody.innerHTML = pageItems.map(item => {
      try { return renderRow(item); }
      catch (err) { console.error(`Erro ao montar linha (${containerId}):`, err, item); return ''; }
    }).join('');
  }

  const pag = document.getElementById(`${containerId}-pag`);
  if (pag) {
    pag.innerHTML = renderPagination(page, totalPages, total, start, pageItems.length, containerId);
  }

  return pageItems;
}

function renderPagination(page, totalPages, total, start, count, id) {
  if (totalPages <= 1) return '';
  let pages = '';
  const first = Math.max(1, Math.min(page - 3, totalPages - 6));
  for (let i = first; i <= Math.min(totalPages, first + 6); i++) {
    pages += `<button class="page-btn ${i === page ? 'active' : ''}" onclick="changePage('${id}', ${i})">${i}</button>`;
  }
  return `
    <div class="pagination">
      <span class="pagination-info">Mostrando ${start + 1}–${start + count} de ${total} registros</span>
      <div class="pagination-controls">
        <button class="page-btn" onclick="changePage('${id}', ${page - 1})" ${page <= 1 ? 'disabled' : ''}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        ${pages}
        <button class="page-btn" onclick="changePage('${id}', ${page + 1})" ${page >= totalPages ? 'disabled' : ''}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  `;
}

// Progress bar helper
function progressBar(value, max = 100, color = 'blue', label = '') {
  const pct = Math.min(100, Math.max(0, (value / max * 100)));
  return `
    <div class="progress-labeled">
      ${label ? `<div class="progress-labeled-header"><span>${label}</span><span>${fmt.percent(pct)}</span></div>` : ''}
      <div class="progress-bar-wrap"><div class="progress-bar ${color}" style="width:${pct}%"></div></div>
    </div>
  `;
}

// Avatar color helper
const AVATAR_COLORS = ['#0f3460','#0ea5e9','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#f97316'];
function avatarColor(str) {
  let hash = 0;
  for (let c of str) hash = ((hash << 5) - hash) + c.charCodeAt(0);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}

// Dropdown toggle
function toggleDropdown(id) {
  const menu = document.getElementById(id);
  if (!menu) return;
  const isOpen = menu.style.display === 'block';
  // Close all
  document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = 'none');
  if (!isOpen) menu.style.display = 'block';
}
document.addEventListener('click', e => {
  if (!e.target.closest('.dropdown-wrapper')) {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = 'none');
  }
});

// Global page change handler
const paginationState = {};
const _pageCallbacks = {};

function changePage(id, page) {
  if (page < 1) return;
  paginationState[id] = page;
  if (_pageCallbacks[id]) _pageCallbacks[id](page);
}


// ==========================================
// BUSCA GLOBAL (cabeçalho)
// Procura em obras, clientes, orçamentos e medições, respeitando as
// telas que o perfil logado pode abrir.
// ==========================================
function _gsNorm(v) {
  return String(v || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function _gsEscape(v) {
  return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function _gsCanOpen(page) {
  const role = Store.getRole();
  const allowed = (typeof ROLE_PAGES !== 'undefined') ? ROLE_PAGES[role] : null;
  return !allowed || allowed.includes(page);
}

let _gsItems = [];
let _gsActive = -1;

function globalSearch(term) {
  const box = document.getElementById('global-search-results');
  if (!box) return;
  const q = _gsNorm(term).trim();
  if (q.length < 2) { box.style.display = 'none'; _gsItems = []; return; }

  const projects = Store.getList('projects');
  const clients = Store.getList('clients');
  const projName = id => projects.find(p => p.id === id)?.name || '';
  const clientName = id => clients.find(c => c.id === id)?.name || '';
  const hit = (...fields) => fields.some(f => _gsNorm(f).includes(q));
  const LIMIT = 5;
  const groups = [];

  if (_gsCanOpen('obras')) {
    const items = projects.filter(p => hit(p.name, clientName(p.clientId), p.city, p.responsible)).slice(0, LIMIT)
      .map(p => ({ title: p.name, sub: [clientName(p.clientId), p.city].filter(Boolean).join(' • '), go: () => { navigate('obras'); openProjectDetail(p.id); } }));
    if (items.length) groups.push({ label: 'Obras', items });
  }
  if (_gsCanOpen('clientes')) {
    const items = clients.filter(c => hit(c.name, c.company, c.cpfCnpj, c.email)).slice(0, LIMIT)
      .map(c => ({ title: c.name, sub: c.company || 'Pessoa Física', go: () => { navigate('clientes'); openClientDetail(c.id); } }));
    if (items.length) groups.push({ label: 'Clientes', items });
  }
  if (_gsCanOpen('orcamentos')) {
    const items = Store.getList('budgets').filter(b => hit(b.number, b.projectName, clientName(b.clientId))).slice(0, LIMIT)
      .map(b => ({ title: `${b.number || 'Orçamento'} · ${b.projectName || ''}`, sub: `${clientName(b.clientId)} • ${fmt.currency(b.finalValue ?? b.value)}`, go: () => { navigate('orcamentos'); openBudgetDetail(b.id); } }));
    if (items.length) groups.push({ label: 'Orçamentos', items });
  }
  if (_gsCanOpen('medicoes')) {
    const items = Store.getList('measurements').filter(m => hit(projName(m.projectId), m.period, `med ${m.number}`, `medicao ${m.number}`)).slice(0, LIMIT)
      .map(m => ({ title: `Medição ${m.number} · ${projName(m.projectId)}`, sub: `${m.period || ''} • ${badgeLabel('measurement', m.status)}`, go: () => { navigate('medicoes'); openEditMeasurementModal(m.id); } }));
    if (items.length) groups.push({ label: 'Medições', items });
  }

  _gsItems = groups.flatMap(g => g.items);
  _gsActive = -1;
  let idx = 0;
  box.innerHTML = groups.length
    ? groups.map(g => `
        <div class="gs-group">${g.label}</div>
        ${g.items.map(it => `
          <div class="gs-item" data-idx="${idx++}" onmousedown="event.preventDefault();globalSearchOpen(${idx - 1})">
            <div class="gs-title">${_gsEscape(it.title)}</div>
            <div class="gs-sub">${_gsEscape(it.sub)}</div>
          </div>`).join('')}
      `).join('')
    : `<div class="gs-empty">Nada encontrado para "${_gsEscape(term)}"</div>`;
  box.style.display = 'block';
}

function badgeLabel(group, value) {
  return StatusHelpers[group]?.labels?.[value] || value || '';
}

function globalSearchOpen(i) {
  const it = _gsItems[i];
  if (!it) return;
  const input = document.getElementById('global-search');
  const box = document.getElementById('global-search-results');
  if (input) { input.value = ''; input.blur(); }
  if (box) box.style.display = 'none';
  it.go();
}

function globalSearchKey(e) {
  const box = document.getElementById('global-search-results');
  if (!box || box.style.display === 'none') return;
  const els = box.querySelectorAll('.gs-item');
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    if (!els.length) return;
    _gsActive = (_gsActive + (e.key === 'ArrowDown' ? 1 : -1) + els.length) % els.length;
    els.forEach((el, i) => el.classList.toggle('active', i === _gsActive));
  } else if (e.key === 'Enter') {
    e.preventDefault();
    globalSearchOpen(_gsActive >= 0 ? _gsActive : 0);
  } else if (e.key === 'Escape') {
    box.style.display = 'none';
    e.target.blur();
  }
}

document.addEventListener('click', e => {
  if (!e.target.closest('.search-wrapper')) {
    const box = document.getElementById('global-search-results');
    if (box) box.style.display = 'none';
  }
});
