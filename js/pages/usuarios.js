// ==========================================
// GERENCIAR USUÁRIOS (somente Administrador)
// Fala com a Edge Function "manage-users", que roda no servidor e usa
// privilégios elevados — por isso login/senha nunca são criados
// diretamente pelo navegador.
// ==========================================

const ROLE_LABELS_UI = { admin: 'Administrador', gestor: 'Gestor de Obras', portaria: 'Portaria' };

function generateTempPassword() {
  const part = () => Math.random().toString(36).slice(-4);
  return `${part()}${part()}#${Math.floor(Math.random() * 90 + 10)}`;
}

async function renderUsuarios() {
  const content = document.getElementById('page-content');

  if (Store.getRole() !== 'admin') {
    content.innerHTML = `
      <div class="empty-state">
        <h3>Acesso restrito</h3>
        <p>Somente o Administrador pode gerenciar usuários.</p>
      </div>
    `;
    return;
  }

  content.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Gerenciar Usuários</h1>
        <p>Cadastre pessoas e defina o que cada uma pode acessar no sistema</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-primary" onclick="openNewUserModal()">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Usuário
        </button>
      </div>
    </div>
    <div id="usuarios-content">
      <div class="empty-state"><h3>Carregando...</h3></div>
    </div>
  `;

  await renderUsuariosContent();
}

async function renderUsuariosContent() {
  const container = document.getElementById('usuarios-content');
  if (!container) return;

  const res = await callFunction('manage-users', { action: 'list' });
  if (res.error) {
    container.innerHTML = `<div class="empty-state"><h3>Erro ao carregar usuários</h3><p>${res.error}</p></div>`;
    return;
  }

  const users = res.data || [];
  const currentId = Auth.getProfile()?.id;

  container.innerHTML = `
    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead><tr><th>NOME</th><th>E-MAIL</th><th>PERFIL DE ACESSO</th><th>CRIADO EM</th><th></th></tr></thead>
          <tbody>
            ${users.length ? users.map(u => `
              <tr>
                <td class="td-main">${u.name}${u.id === currentId ? ' <span class="badge badge-blue">Você</span>' : ''}</td>
                <td>${u.email || '—'}</td>
                <td>
                  <select class="filter-select" style="height:32px;" onchange="changeUserRole('${u.id}', this.value)" ${u.id === currentId ? 'disabled' : ''}>
                    ${Object.entries(ROLE_LABELS_UI).map(([v, l]) => `<option value="${v}" ${u.role === v ? 'selected' : ''}>${l}</option>`).join('')}
                  </select>
                </td>
                <td>${fmt.date(u.created_at)}</td>
                <td>
                  <div style="display:flex;gap:4px;">
                    <button class="btn btn-sm btn-outline" onclick="openResetPasswordModal('${u.id}', '${u.name.replace(/'/g, "\\'")}')">Redefinir senha</button>
                    ${u.id === currentId ? '' : `
                      <button class="btn btn-sm btn-ghost" style="color:var(--danger);" onclick="deleteUser('${u.id}','${u.name.replace(/'/g, "\\'")}')">
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                      </button>`}
                  </div>
                </td>
              </tr>
            `).join('') : `<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-muted);">Nenhum usuário cadastrado</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openNewUserModal() {
  const tempPassword = generateTempPassword();

  const { close } = Modal.create({
    title: 'Novo Usuário',
    size: 'modal-lg',
    body: `
      <div class="form-grid">
        <div class="form-group form-col-span-2">
          <label class="form-label">Nome Completo *</label>
          <input class="form-control" id="nu-name" placeholder="Ex: Maria Souza">
        </div>
        <div class="form-group form-col-span-2">
          <label class="form-label">E-mail *</label>
          <input class="form-control" id="nu-email" type="email" placeholder="maria@empresa.com">
        </div>
        <div class="form-group">
          <label class="form-label">Perfil de Acesso *</label>
          <select class="form-control" id="nu-role">
            ${Object.entries(ROLE_LABELS_UI).map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Senha Temporária *</label>
          <input class="form-control" id="nu-password" value="${tempPassword}">
        </div>
      </div>
      <p style="font-size:12px;color:var(--text-muted);margin-top:12px;">Anote essa senha e repasse pra pessoa por fora do sistema (WhatsApp, verbalmente etc). Ela consegue trocar a própria senha depois de logar.</p>
    `,
    footer: `
      <button class="btn btn-outline" id="modal-cancel">Cancelar</button>
      <button class="btn btn-primary" id="modal-save">Criar Usuário</button>
    `
  });

  setTimeout(() => {
    document.getElementById('modal-cancel')?.addEventListener('click', close);
    document.getElementById('modal-save')?.addEventListener('click', async () => {
      const name = document.getElementById('nu-name').value.trim();
      const email = document.getElementById('nu-email').value.trim();
      const role = document.getElementById('nu-role').value;
      const password = document.getElementById('nu-password').value;

      if (!name || !email || !password) {
        Toast.error('Campos obrigatórios', 'Preencha nome, e-mail e senha.');
        return;
      }

      const btn = document.getElementById('modal-save');
      btn.disabled = true;
      btn.textContent = 'Criando...';

      const res = await callFunction('manage-users', { action: 'create', name, email, password, role });

      if (res.error) {
        btn.disabled = false;
        btn.textContent = 'Criar Usuário';
        Toast.error('Erro ao criar usuário', res.error);
        return;
      }

      close();
      Toast.success('Usuário criado!', `${name} já pode entrar com o e-mail e a senha temporária.`);
      renderUsuariosContent();
    });
  }, 50);
}

async function changeUserRole(id, role) {
  const res = await callFunction('manage-users', { action: 'update_role', id, role });
  if (res.error) {
    Toast.error('Erro ao alterar perfil', res.error);
    renderUsuariosContent();
    return;
  }
  Toast.success('Perfil atualizado!');
}

function openResetPasswordModal(id, name) {
  const tempPassword = generateTempPassword();

  const { close } = Modal.create({
    title: `Redefinir senha de ${name}`,
    size: 'modal-sm',
    body: `
      <div class="form-group">
        <label class="form-label">Nova senha</label>
        <input class="form-control" id="rp-password" value="${tempPassword}">
      </div>
    `,
    footer: `
      <button class="btn btn-outline" id="modal-cancel">Cancelar</button>
      <button class="btn btn-primary" id="modal-save">Redefinir</button>
    `
  });

  setTimeout(() => {
    document.getElementById('modal-cancel')?.addEventListener('click', close);
    document.getElementById('modal-save')?.addEventListener('click', async () => {
      const password = document.getElementById('rp-password').value;
      if (!password || password.length < 6) {
        Toast.error('Senha muito curta', 'Use pelo menos 6 caracteres.');
        return;
      }

      const btn = document.getElementById('modal-save');
      btn.disabled = true;
      btn.textContent = 'Salvando...';

      const res = await callFunction('manage-users', { action: 'reset_password', id, password });

      if (res.error) {
        btn.disabled = false;
        btn.textContent = 'Redefinir';
        Toast.error('Erro ao redefinir senha', res.error);
        return;
      }

      close();
      Toast.success('Senha redefinida!', `Nova senha de ${name}: ${password}`);
    });
  }, 50);
}

function deleteUser(id, name) {
  confirmDialog({
    title: 'Excluir Usuário',
    message: `Tem certeza que deseja excluir o acesso de "${name}"? Essa ação não pode ser desfeita.`,
    confirmText: 'Excluir',
    type: 'danger',
    onConfirm: async () => {
      const res = await callFunction('manage-users', { action: 'delete', id });
      if (res.error) {
        Toast.error('Erro ao excluir', res.error);
        return;
      }
      Toast.success('Usuário excluído!');
      renderUsuariosContent();
    }
  });
}
