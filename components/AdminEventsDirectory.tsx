'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import EventDirectoryCard from '@/components/EventDirectoryCard';
import { groupEventsByDate } from '@/lib/event-directory';
import type { LamaEvent } from '@/lib/types';

type AdminEvent = LamaEvent & { count: number };
type Tab = 'upcoming' | 'past';
export default function AdminEventsDirectory({ events, referenceNow, ownerName }: { events: AdminEvent[]; referenceNow: string; ownerName: string }) {
  const [tab, setTab] = useState<Tab>('upcoming');
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null);
  const visibleEvents = useMemo(() => {
    const now = new Date(referenceNow);
    return events
      .filter(event => tab === 'upcoming' ? new Date(event.end_at) >= now : new Date(event.end_at) < now)
      .sort((a, b) => {
        const difference = new Date(a.start_at).getTime() - new Date(b.start_at).getTime();
        return tab === 'upcoming' ? difference : -difference;
      });
  }, [events, referenceNow, tab]);
  const eventDays = useMemo(() => groupEventsByDate(visibleEvents), [visibleEvents]);

  async function copyPublicLink(event: AdminEvent) {
    await navigator.clipboard.writeText(new URL(`/${event.slug}`, window.location.origin).toString());
    setCopiedEventId(event.id);
    window.setTimeout(() => setCopiedEventId(current => current === event.id ? null : current), 1800);
  }

  return <main className="events-directory admin-events-directory">
    <header className="events-directory-header admin-events-header">
      <h1>{ownerName}의 이벤트</h1>
      <div className="event-tabs" role="tablist" aria-label="이벤트 상태">
        <button type="button" role="tab" aria-selected={tab === 'upcoming'} className={tab === 'upcoming' ? 'active' : ''} onClick={() => setTab('upcoming')}>예정된 이벤트</button>
        <button type="button" role="tab" aria-selected={tab === 'past'} className={tab === 'past' ? 'active' : ''} onClick={() => setTab('past')}>지난 이벤트</button>
      </div>
      <Link href="/admin/events/new" className="admin-create-button">+ 이벤트 만들기</Link>
    </header>
    {eventDays.length === 0 ? <section className="events-empty"><span className="events-empty-icon" aria-hidden="true"><CalendarPlus size={22} strokeWidth={1.8} /></span><h2>{tab === 'upcoming' ? '아직 조용하네요. 첫 이벤트를 만들어볼까요?' : '아직 지난 이벤트가 없어요.'}</h2><p>{tab === 'upcoming' ? '멋진 만남의 시작은 첫 이벤트에서 시작돼요.' : '첫 이벤트가 끝나면 이곳에서 다시 만나요.'}</p>{tab === 'upcoming' && <Link href="/admin/events/new" className="events-empty-action">이벤트 만들기 <span aria-hidden="true">→</span></Link>}</section> : <div className="events-day-list">{eventDays.map(day => <section className="events-day-group admin-events-day-group" key={day.date.key}><header className="events-day-heading"><strong>{day.date.month} {day.date.day}일</strong><span>{day.date.weekday}</span></header><div className="events-day-items">{day.events.map(event => { const isCopied = copiedEventId === event.id; return <EventDirectoryCard key={event.id} event={event} href={`/${event.slug}`} referenceNow={referenceNow} participantLabel={event.count ? `${event.count}명 참가` : '참가자 없음'} adminActions={{ eventHref: `/admin/events/${event.id}`, participantsHref: `/admin/events/${event.id}/registrations`, copied: isCopied, onCopy: () => { void copyPublicLink(event); } }} />; })}</div></section>)}</div>}
  </main>;
}
