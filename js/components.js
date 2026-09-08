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
  const labor = m.laborValue || 0;
  const material = m.materialValue || 0;
  const gross = hasBreakdown ? (labor + material) : (m.value || 0); // (A)
  const discount = m.directBillingDiscount || 0; // (B)
  const subtotal = gross - discount; // (A)-(B)
  const caution = m.cautionValue || 0; // (C)
  const inss = m.inssValue || 0;
  const iss = m.issValue || 0;
  const totalTaxes = inss + iss; // (D)
  const net = subtotal - caution - totalTaxes; // Total Líquido
  return { labor, material, gross, discount, subtotal, caution, inss, iss, totalTaxes, net, hasBreakdown };
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
function paginate({ items, page, perPage = 10, containerId, renderRow, tableId }) {
  const total = items.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const pageItems = items.slice(start, start + perPage);

  const tbody = document.querySelector(`#${tableId} tbody`);
  if (tbody) {
    tbody.innerHTML = pageItems.map(renderRow).join('');
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
  for (let i = 1; i <= Math.min(totalPages, 7); i++) {
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
function changePage(id, page) {
  paginationState[id] = page;
  if (window.rerender) window.rerender();
}
