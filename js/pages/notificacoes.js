// ==========================================
// NOTIFICAÇÕES PAGE
// ==========================================

function renderNotificacoes() {
  const notifications = Store.getList('notifications').sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  const content = document.getElementById('page-content');
  
  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Notificações</h1>
        <p>Avisos, alertas e atualizações do sistema</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-outline" onclick="markAllAsRead()">Marcar todas como lidas</button>
      </div>
    </div>

    <div class="card">
      <div class="card-body" style="padding:0;">
        ${notifications.length ? notifications.map(n => {
          let icon = '';
          let color = '';
          if (n.type === 'alert') { icon = icons.alert_red; color = 'var(--danger-light)'; }
          else if (n.type === 'warning') { icon = icons.alert_orange; color = 'var(--warning-light)'; }
          else if (n.type === 'success') { icon = icons.check; color = 'var(--success-light)'; }
          else { icon = icons.info_blue; color = 'var(--info-light)'; }

          return `
            <div class="notification-item ${n.read ? 'read' : ''}" style="display:flex;gap:16px;padding:20px;border-bottom:1px solid var(--border);background:${n.read ? 'transparent' : 'rgba(15,52,96,0.02)'};transition:all 0.2s;">
              <div style="width:40px;height:40px;border-radius:12px;background:${color};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <div style="color:${color.replace('-light','-dark')}">${icon}</div>
              </div>
              <div style="flex:1;">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                  <div style="font-weight:600;color:var(--text);">${n.title}</div>
                  <div style="font-size:12px;color:var(--text-faint);">${fmt.date(n.createdAt)}</div>
                </div>
                <div style="font-size:14px;color:var(--text-light);">${n.message}</div>
                ${!n.read ? `<button class="btn btn-sm btn-ghost" style="margin-top:8px;padding:0;height:auto;" onclick="markAsRead('${n.id}')">Marcar como lida</button>` : ''}
              </div>
            </div>
          `;
        }).join('') : '<div style="padding:40px;text-align:center;color:var(--text-muted);">Nenhuma notificação encontrada.</div>'}
      </div>
    </div>
  `;
}

function markAsRead(id) {
  Store.update('notifications', id, { read: true });
  renderNotificacoes();
  updateUnreadBadge();
}

function markAllAsRead() {
  const list = Store.getList('notifications');
  list.forEach(n => {
    if (!n.read) Store.update('notifications', n.id, { read: true });
  });
  renderNotificacoes();
  updateUnreadBadge();
}

function updateUnreadBadge() {
  const list = Store.getList('notifications');
  const unread = list.filter(n => !n.read).length;
  const badge = document.querySelector('.nav-badge');
  if (badge) {
    if (unread > 0) {
      badge.textContent = unread;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
}
