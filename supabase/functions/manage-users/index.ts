// ==========================================
// EDGE FUNCTION: manage-users
// Permite que o Administrador cadastre, altere o perfil e remova
// usuários do sistema, sem precisar entrar no painel do Supabase.
//
// Roda no servidor (Deno), usa a service_role key que o próprio
// Supabase injeta automaticamente como variável de ambiente — ela
// NUNCA fica exposta no navegador.
// ==========================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' }
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const authHeader = req.headers.get('Authorization') || '';
    const jwt = authHeader.replace('Bearer ', '');
    if (!jwt) return json({ error: 'Não autenticado.' }, 401);

    // Cliente com privilégio total — só existe aqui dentro, nunca no frontend.
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Valida quem está chamando a função
    const { data: callerData, error: callerErr } = await admin.auth.getUser(jwt);
    if (callerErr || !callerData.user) return json({ error: 'Sessão inválida.' }, 401);

    const { data: callerProfile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', callerData.user.id)
      .single();

    if (!callerProfile || callerProfile.role !== 'admin') {
      return json({ error: 'Apenas administradores podem gerenciar usuários.' }, 403);
    }

    const body = await req.json();
    const action = body.action;

    // === LISTAR ===
    if (action === 'list') {
      const { data: profiles, error: pErr } = await admin
        .from('profiles')
        .select('id, name, role, created_at')
        .order('created_at', { ascending: true });
      if (pErr) throw pErr;

      const { data: authList, error: aErr } = await admin.auth.admin.listUsers();
      if (aErr) throw aErr;

      const emailById: Record<string, string> = {};
      for (const u of authList.users) emailById[u.id] = u.email ?? '';

      const result = profiles.map((p) => ({ ...p, email: emailById[p.id] || null }));
      return json({ data: result });
    }

    // === CRIAR ===
    if (action === 'create') {
      const { name, email, password, role } = body;
      if (!name || !email || !password || !role) {
        return json({ error: 'Preencha nome, e-mail, senha e perfil.' }, 400);
      }
      if (!['admin', 'gestor', 'portaria', 'diretoria', 'gestor_contratos', 'gestor_orcamentos', 'financeiro'].includes(role)) {
        return json({ error: 'Perfil inválido.' }, 400);
      }

      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, role }
      });
      if (error) return json({ error: error.message }, 400);

      return json({ data: { id: data.user!.id } });
    }

    // === ALTERAR PERFIL ===
    if (action === 'update_role') {
      const { id, role } = body;
      if (!['admin', 'gestor', 'portaria', 'diretoria', 'gestor_contratos', 'gestor_orcamentos', 'financeiro'].includes(role)) {
        return json({ error: 'Perfil inválido.' }, 400);
      }
      const { error } = await admin.from('profiles').update({ role }).eq('id', id);
      if (error) throw error;
      return json({ data: true });
    }

    // === REDEFINIR SENHA ===
    if (action === 'reset_password') {
      const { id, password } = body;
      if (!password || password.length < 6) {
        return json({ error: 'A nova senha precisa ter pelo menos 6 caracteres.' }, 400);
      }
      const { error } = await admin.auth.admin.updateUserById(id, { password });
      if (error) throw error;
      return json({ data: true });
    }

    // === EXCLUIR ===
    if (action === 'delete') {
      const { id } = body;
      if (id === callerData.user.id) {
        return json({ error: 'Você não pode excluir a si mesmo.' }, 400);
      }
      const { error } = await admin.auth.admin.deleteUser(id);
      if (error) throw error;
      return json({ data: true });
    }

    return json({ error: 'Ação desconhecida.' }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Erro interno.' }, 500);
  }
});
