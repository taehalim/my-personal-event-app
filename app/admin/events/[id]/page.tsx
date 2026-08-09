import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import EventForm from '@/components/EventForm';
import DeleteEventButton from '@/components/DeleteEventButton';

export default async function EventAdminPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: event }, { data: fields }] = await Promise.all([supabase.from('events').select('*').eq('id', id).single(), supabase.from('registration_fields').select('*').eq('event_id', id).order('sort_order')]);
  if (!event) notFound();
  return <main className="admin-shell event-create-shell">
    <header className="event-editor-header">
      <Link href="/admin" className="event-create-back">← Inha의 이벤트</Link>
      <div className="event-editor-actions">
        <a href={`/${event.slug}`} target="_blank" rel="noreferrer" className="event-editor-link">공개 링크 보기 ↗</a>
        <Link href={`/admin/events/${id}/registrations`} className="event-editor-link">참가자 관리</Link>
        <DeleteEventButton id={id} />
      </div>
    </header>
    <EventForm event={event} fields={fields ?? []} />
  </main>;
}
