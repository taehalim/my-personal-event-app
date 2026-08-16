'use client';

import { useMemo, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import EventDirectoryCard from '@/components/EventDirectoryCard';
import { groupEventsByDate } from '@/lib/event-directory';
import type { Event } from '@/lib/types';

type Tab = 'upcoming' | 'past';
export default function PublicEventsDirectory({ events, referenceNow, ownerName }: { events: Event[]; referenceNow: string; ownerName: string }) {
  const [tab, setTab] = useState<Tab>('upcoming');
  const visibleEvents = useMemo(() => {
    const now = new Date(referenceNow);
    return events.filter(event => tab === 'upcoming' ? new Date(event.end_at) >= now : new Date(event.end_at) < now);
  }, [events, referenceNow, tab]);
  const eventDays = useMemo(() => groupEventsByDate(visibleEvents), [visibleEvents]);

  return <main className="events-directory">
    <header className="events-directory-header">
      <h1>{ownerName}의 이벤트</h1>
      <div className="event-tabs" role="tablist" aria-label="이벤트 상태">
        <button type="button" role="tab" aria-selected={tab === 'upcoming'} className={tab === 'upcoming' ? 'active' : ''} onClick={() => setTab('upcoming')}>예정된 이벤트</button>
        <button type="button" role="tab" aria-selected={tab === 'past'} className={tab === 'past' ? 'active' : ''} onClick={() => setTab('past')}>지난 이벤트</button>
      </div>
    </header>
    {eventDays.length === 0 ? <section className="events-empty"><span className="events-empty-icon" aria-hidden="true"><CalendarDays size={22} strokeWidth={1.8} /></span><h2>{tab === 'upcoming' ? '다음 이벤트를 준비 중이에요.' : '아직 지난 이벤트가 없어요.'}</h2><p>{tab === 'upcoming' ? '새로운 만남이 열리면 이곳에서 알려드릴게요.' : '첫 이벤트가 끝나면 이곳에 기록될 거예요.'}</p></section> : <div className="events-day-list">{eventDays.map(day => <section className="events-day-group" key={day.date.key}><header className="events-day-heading"><strong>{day.date.month} {day.date.day}일</strong><span>{day.date.weekday}</span></header><div className="events-day-items">{day.events.map(event => <EventDirectoryCard key={event.id} event={event} href={`/${event.slug}`} referenceNow={referenceNow} participantLabel={event.registration_enabled ? '참가 신청 가능' : '참가 안내'} />)}</div></section>)}</div>}
  </main>;
}
