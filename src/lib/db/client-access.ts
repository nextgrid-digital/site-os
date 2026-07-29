import { getSupabaseAdmin } from '@/lib/supabase/server';

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function createAccessCode(projectId: string, email: string) {
  const supabase = getSupabaseAdmin();
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('audit_access_codes')
    .insert({ project_id: projectId, email, code, expires_at: expiresAt })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function verifyAccessCode(email: string, code: string) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('audit_access_codes')
    .select('*')
    .eq('email', email)
    .eq('code', code)
    .is('verified_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  await supabase
    .from('audit_access_codes')
    .update({ verified_at: new Date().toISOString() })
    .eq('id', data.id);

  return data;
}

export async function isEmailVerifiedForProject(projectId: string, email: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('audit_access_codes')
    .select('id')
    .eq('project_id', projectId)
    .eq('email', email)
    .not('verified_at', 'is', null)
    .limit(1)
    .maybeSingle();

  return Boolean(data);
}
