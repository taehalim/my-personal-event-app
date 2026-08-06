import { createClient } from '@/lib/supabase/server';
import type { LamaEvent } from '@/lib/types';
import PublicEventsDirectory from '@/components/PublicEventsDirectory';

async function getEvents() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('events')
    .select('*')
    .in('status', ['published', 'cancelled'])
    .order('start_at', { ascending: true });
  return (data ?? []) as LamaEvent[];
}

export default async function HomePage() {
  const events = await getEvents();
  return <PublicEventsDirectory events={events} referenceNow={new Date().toISOString()} />;
}
