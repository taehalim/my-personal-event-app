import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function getAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
  return data ? user : null;
}

export async function requireAdmin() { const user = await getAdmin(); if (!user) redirect('/login'); return user; }
