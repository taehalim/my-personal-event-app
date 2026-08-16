import { createClient } from '@/lib/supabase/server';
import type { Event } from '@/lib/types';
import PublicEventsDirectory from '@/components/PublicEventsDirectory';
import { displayNameForUser } from '@/lib/profile';

async function getEvents() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('events')
    .select('*')
    .in('status', ['published', 'cancelled'])
    .order('start_at', { ascending: true });
  return (data ?? []) as Event[];
}

export default async function HomePage() {
  const supabase = await createClient();
  const events = await getEvents();
  const { data: { user } } = await supabase.auth.getUser();
  const ownerName = events[0]?.host_name ?? displayNameForUser(user, '나');
  return <PublicEventsDirectory events={events} referenceNow={new Date().toISOString()} ownerName={ownerName} />;
}
