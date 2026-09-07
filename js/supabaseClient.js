// ==========================================
// SUPABASE — CLIENTE
// ==========================================
// A anon key é segura para ficar no frontend: ela não dá acesso irrestrito,
// as políticas de RLS configuradas no banco (supabase/schema.sql) é que
// controlam o que cada perfil (admin/gestor/portaria) pode ver e alterar.

const SUPABASE_URL = 'https://aibovpukmfrvztkpgqdc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpYm92cHVrbWZydnp0a3BncWRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3ODMyODYsImV4cCI6MjEwNDM1OTI4Nn0.mzToghmSNAinlABWzAV7pPCfL5xsZq0qhh8Zt-3I1oA';

// `supabase` (minúsculo) é o global exposto pelo UMD do @supabase/supabase-js.
// Guardamos o cliente em `sb` pra não sobrescrever esse global.
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Chama uma Edge Function do projeto (ex.: "manage-users"), anexando o
// token da sessão atual — a função decide, no servidor, se essa pessoa
// tem permissão pra fazer o que está pedindo.
async function callFunction(name, payload) {
  const { data: sessionData } = await sb.auth.getSession();
  const token = sessionData.session?.access_token;

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify(payload)
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { error: body.error || 'Erro na requisição.' };
    return body;
  } catch (e) {
    return { error: 'Não foi possível conectar ao servidor.' };
  }
}

function makeUUID() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  // Fallback simples (navegadores antigos / contexto não seguro)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
