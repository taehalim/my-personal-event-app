import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(), process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!.trim(), {
    cookies: { getAll() { return cookieStore.getAll(); }, setAll(values: {name: string; value: string; options: CookieOptions}[]) { try { values.forEach(({name, value, options}) => cookieStore.set(name, value, options)); } catch {} } }
  });
}
