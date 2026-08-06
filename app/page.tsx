import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatEventDate, publicCoverUrl } from '@/lib/formatting';
import type { LamaEvent } from '@/lib/types';

async function getCurrentEvents() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .gte('end_at', new Date().toISOString())
    .order('start_at', { ascending: true });
  return (data ?? []) as LamaEvent[];
}

export default async function HomePage() {
  const events = await getCurrentEvents();

  return <main className="container" style={{ padding: '56px 0 80px' }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
      <span className="muted" aria-label="Inha's events">Inha&apos;s events</span>
      <Link className="muted" href="/login">관리자 로그인</Link>
    </header>
    <section style={{ padding: '72px 0 36px', maxWidth: 760 }}>
      <p className="pill">Events</p>
      <h1 style={{ fontSize: 'clamp(42px, 7vw, 76px)', lineHeight: 1.04, margin: '18px 0' }}>지금 함께할 수 있는 이벤트</h1>
      <p className="muted" style={{ fontSize: 18, lineHeight: 1.7, margin: 0 }}>Inha&apos;s events에서 진행 중이거나 곧 시작하는 만남을 확인해보세요.</p>
    </section>
    {events.length === 0 ? <section className="card" style={{ padding: 32 }}><h2 style={{ marginTop: 0 }}>현재 진행 중인 이벤트가 없습니다.</h2><p className="muted" style={{ marginBottom: 0 }}>새로운 이벤트가 공개되면 이곳에서 확인할 수 있습니다.</p></section> : <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>{events.map(event => { const cover = publicCoverUrl(event.cover_image_path); return <Link key={event.id} href={`/${event.slug}`} className="card" style={{ overflow: 'hidden', display: 'block' }}>{cover ? <Image src={cover} alt="" width={840} height={480} style={{ width: '100%', height: 220, objectFit: 'cover' }} /> : <div style={{ height: 220, display: 'grid', placeItems: 'center', background: '#eee9f7', fontSize: 72, color: '#7c4dce' }}>I</div>}<div style={{ padding: 24 }}><p className="muted" style={{ marginTop: 0 }}>{formatEventDate(event.start_at, event.end_at, event.timezone)}</p><h2 style={{ margin: '12px 0', fontSize: 26 }}>{event.title}</h2><p className="muted" style={{ marginBottom: 0 }}>{event.location_type === 'online' ? '온라인 이벤트' : event.location_name}</p></div></Link>; })}</section>}
  </main>;
}
