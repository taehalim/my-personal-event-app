import { requireAdminProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminEventsDirectory from '@/components/AdminEventsDirectory';
import type { LamaEvent } from '@/lib/types';

export default async function AdminPage() {
  const supabase = await createClient();
  const { user, displayName } = await requireAdminProfile();
  const { data: events } = await supabase.from('events').select('*').eq('created_by', user.id).order('start_at', { ascending: true });
  const eventIds = (events ?? []).map(event => event.id);
  const admin = createAdminClient();
  const { data: registrations } = eventIds.length ? await admin.from('registrations').select('event_id').in('event_id', eventIds).eq('status', 'approved') : { data: [] };
  const counts = (registrations ?? []).reduce((result, registration) => {
    result.set(registration.event_id, (result.get(registration.event_id) ?? 0) + 1);
    return result;
  }, new Map<string, number>());
  const enriched = (events ?? []).map(event => ({ ...(event as LamaEvent), count: counts.get(event.id) ?? 0 }));
  return <AdminEventsDirectory events={enriched} referenceNow={new Date().toISOString()} ownerName={displayName} />;
}
