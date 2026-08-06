import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatEventDate } from '@/lib/formatting';

const statusLabels: Record<string, string> = { draft: '초안', published: '공개', cancelled: '취소' };

export default async function AdminPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: events } = await supabase.from('events').select('*').order('start_at', { ascending: false });
  const admin = createAdminClient();
  const enriched = await Promise.all((events ?? []).map(async event => { const { count } = await admin.from('registrations').select('id', { count: 'exact', head: true }).eq('event_id', event.id).eq('status', 'approved'); return { ...event, count: count ?? 0 }; }));

  return <main className="admin-shell">
    <header className="admin-header">
      <div><Link href="/" className="admin-brand">Inha&apos;s events</Link><h1>행사 관리</h1></div>
      <Link href="/admin/events/new" className="button">새 행사 만들기</Link>
    </header>
    {enriched.length === 0 ? <section className="admin-empty"><h2>아직 만든 행사가 없습니다.</h2><Link href="/admin/events/new" className="button">첫 행사 만들기</Link></section> : <div className="admin-event-list">{enriched.map(event => <Link key={event.id} href={`/admin/events/${event.id}`} className="admin-event-card"><div><span className={`admin-status ${event.status}`}>{statusLabels[event.status] ?? event.status}</span><h2>{event.title}</h2><p className="muted">{formatEventDate(event.start_at, event.end_at, event.timezone)}</p></div><div className="admin-event-count"><strong>{event.count}명</strong><span>승인 참가자</span></div></Link>)}</div>}
  </main>;
}
