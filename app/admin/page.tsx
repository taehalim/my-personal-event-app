import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminEventsDirectory from '@/components/AdminEventsDirectory';
import type { LamaEvent } from '@/lib/types';

export default async function AdminPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: events } = await supabase.from('events').select('*').order('start_at', { ascending: true });
  const admin = createAdminClient();
  const enriched = await Promise.all((events ?? []).map(async event => { const { count } = await admin.from('registrations').select('id', { count: 'exact', head: true }).eq('event_id', event.id).eq('status', 'approved'); return { ...(event as LamaEvent), count: count ?? 0 }; }));
  return <AdminEventsDirectory events={enriched} referenceNow={new Date().toISOString()} />;
}
