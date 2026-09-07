// ==========================================
// ROUTER & APP INITIALIZATION
// ==========================================

const Pages = {
  dashboard: renderDashboard,
  obras: renderObras,
  medicoes: renderMedicoes,
  orcamentos: renderOrcamentos,
  financeiro: renderFinanceiro,
  clientes: renderClientes,
  cronograma: renderCronograma,
  relatorios: renderRelatorios,
  notificacoes: renderNotificacoes,
  'almoxarifado-dashboard': renderAlmoxDashboard,
  'almoxarifado-previsao': renderAlmoxPrevisao,
  'almoxarifado-recebimento': renderAlmoxRecebimento,
  'almoxarifado-historico': renderAlmoxHistorico,
  usuarios: renderUsuarios
};

// Guarda de rota: perfis com acesso restrito só podem ver as páginas listadas.
// null/undefined = acesso completo.
const ROLE_PAGES = {
  admin: null,
  gestor: null,
  portaria: ['almoxarifado-dashboard', 'almoxarifado-previsao', 'almoxarifado-recebimento', 'almoxarifado-historico']
};

// Páginas restritas ao Administrador mesmo dentro de perfis "acesso completo"
const ADMIN_ONLY_PAGES = ['usuarios'];

function navigate(page) {
  const role = Store.getRole();
  const allowed = ROLE_PAGES[role];
  if (allowed && !allowed.includes(page)) {
    Toast.warning('Acesso restrito', 'Seu perfil não tem permissão para acessar esta tela.');
    page = allowed[0];
  }
  if (ADMIN_ONLY_PAGES.includes(page) && role !== 'admin') {
    Toast.warning('Acesso restrito', 'Somente o Administrador pode acessar esta tela.');
    page = allowed ? allowed[0] : 'dashboard';
  }

  // Update sidebar active state
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('onclick') === `navigate('${page}')`) {
      a.classList.add('active');
    }
  });

  // Call the render function
  if (Pages[page]) {
    Pages[page]();
    // Quick fade-in effect
    const content = document.getElementById('page-content');
    content.style.opacity = '0';
    content.style.transform = 'translateY(10px)';
    setTimeout(() => {
      content.style.transition = 'all 0.3s ease-out';
      content.style.opacity = '1';
      content.style.transform = 'translateY(0)';
    }, 10);
  } else {
    document.getElementById('page-content').innerHTML = `
      <div class="empty-state">
        <h3>Página não encontrada</h3>
        <p>A página "${page}" não existe ou ainda não foi implementada.</p>
        <button class="btn btn-primary" onclick="navigate('dashboard')">Voltar ao Início</button>
      </div>
    `;
  }
}

// === CONTROLE DE PERFIL / MENU DINÂMICO ===
function applyRoleVisibility() {
  const role = Store.getRole();

  // Mostra/oculta qualquer elemento marcado com data-roles="admin,gestor,..."
  document.querySelectorAll('[data-roles]').forEach(el => {
    const roles = el.getAttribute('data-roles').split(',').map(r => r.trim());
    el.style.display = roles.includes(role) ? '' : 'none';
  });

  // Oculta rótulos de seção da sidebar que ficaram sem nenhum item visível
  document.querySelectorAll('.sidebar-section-label').forEach(label => {
    let el = label.nextElementSibling;
    let anyVisible = false;
    while (el && !el.classList.contains('sidebar-section-label')) {
      if (el.style.display !== 'none') anyVisible = true;
      el = el.nextElementSibling;
    }
    label.style.display = anyVisible ? '' : 'none';
  });

  // Atualiza cartão de usuário no cabeçalho
  const meta = Store.getRoleMeta();
  const nameEl = document.getElementById('hdr-user-name');
  const roleEl = document.getElementById('hdr-user-role');
  const avEl = document.getElementById('hdr-user-avatar');
  if (nameEl) nameEl.textContent = meta.name;
  if (roleEl) roleEl.textContent = meta.roleLabel;
  if (avEl) { avEl.textContent = meta.avatar; avEl.style.background = meta.color; }
}

// A inicialização do app (login, carregamento dos dados e primeira rota)
// acontece em js/auth.js, depois que a sessão do Supabase é confirmada.
