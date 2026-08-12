import { notFound } from 'next/navigation';
import { requireAdminProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import EventForm from '@/components/EventForm';

export default async function EventAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, displayName } = await requireAdminProfile();
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: event }, { data: fields }] = await Promise.all([supabase.from('events').select('*').eq('id', id).eq('created_by', user.id).single(), supabase.from('registration_fields').select('*').eq('event_id', id).order('sort_order')]);
  if (!event) notFound();
  return <main className="event-create-shell"><EventForm event={event} fields={fields ?? []} hostName={displayName} /></main>;
}
