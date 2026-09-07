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

function makeUUID() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  // Fallback simples (navegadores antigos / contexto não seguro)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
