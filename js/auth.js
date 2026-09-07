// ==========================================
// AUTENTICAÇÃO (Supabase Auth)
// ==========================================

const Auth = (() => {
  let profile = null;

  async function getSession() {
    const { data } = await sb.auth.getSession();
    return data.session;
  }

  async function loadProfile(userId) {
    const { data, error } = await sb.from('profiles').select('*').eq('id', userId).single();
    if (error) {
      console.error('Erro ao carregar perfil:', error.message);
      profile = null;
      return null;
    }
    profile = { id: data.id, name: data.name, role: data.role, avatar: data.avatar, color: data.color };
    return profile;
  }

  function getProfile() { return profile; }

  async function signIn(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return { error };
    await loadProfile(data.user.id);
    return { data };
  }

  async function signOut() {
    await sb.auth.signOut();
    profile = null;
    location.reload();
  }

  return { getSession, loadProfile, getProfile, signIn, signOut };
})();

// === TELA DE LOGIN ===
async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');

  errEl.style.display = 'none';
  if (!email || !password) {
    errEl.textContent = 'Informe e-mail e senha.';
    errEl.style.display = 'block';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Entrando...';

  const { error } = await Auth.signIn(email, password);

  if (error) {
    btn.disabled = false;
    btn.textContent = 'Entrar';
    errEl.textContent = 'E-mail ou senha inválidos.';
    errEl.style.display = 'block';
    return;
  }

  await bootApp();
}

async function bootApp() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app-container').style.display = '';

  await Store.init();
  applyRoleVisibility();

  const role = Store.getRole();
  const allowed = ROLE_PAGES[role];
  navigate(allowed ? allowed[0] : 'dashboard');

  if (typeof updateUnreadBadge === 'function') {
    updateUnreadBadge();
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const session = await Auth.getSession();
  if (session) {
    await Auth.loadProfile(session.user.id);
    await bootApp();
  } else {
    document.getElementById('login-screen').style.display = '';
    document.getElementById('app-container').style.display = 'none';
  }
});
