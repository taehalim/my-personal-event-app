'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { MapPin, Users } from 'lucide-react';
import { publicCoverUrl } from '@/lib/formatting';
import type { LamaEvent } from '@/lib/types';

type AdminEvent = LamaEvent & { count: number };
type Tab = 'upcoming' | 'past';
type LocalDate = { month: string; day: string; weekday: string; key: string };
type EventDay<T extends LamaEvent> = { date: LocalDate; events: T[] };

function localDateParts(event: LamaEvent): LocalDate {
  const parts = new Intl.DateTimeFormat('ko-KR', {
    timeZone: event.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
  }).formatToParts(new Date(event.start_at));
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return { month: `${Number(values.month)}월`, day: String(Number(values.day)), weekday: values.weekday, key: `${values.year}-${values.month}-${values.day}` };
}

function groupEventsByDate<T extends LamaEvent>(events: T[]): EventDay<T>[] {
  const groups = new Map<string, EventDay<T>>();
  for (const event of events) {
    const date = localDateParts(event);
    const group = groups.get(date.key);
    if (group) group.events.push(event);
    else groups.set(date.key, { date, events: [event] });
  }
  return [...groups.values()];
}

function formatTime(event: LamaEvent) {
  return new Intl.DateTimeFormat('ko-KR', { timeZone: event.timezone, hour: 'numeric', minute: '2-digit' }).format(new Date(event.start_at));
}

function formatLocation(event: LamaEvent) {
  return event.location_type === 'online' ? '온라인' : event.location_name ?? '장소 미정';
}

export default function AdminEventsDirectory({ events, referenceNow }: { events: AdminEvent[]; referenceNow: string }) {
  const [tab, setTab] = useState<Tab>('upcoming');
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

  return <main className="events-directory admin-events-directory">
    <header className="events-directory-header admin-events-header">
      <h1>Inha의 이벤트</h1>
      <div className="event-tabs" role="tablist" aria-label="이벤트 상태">
        <button type="button" role="tab" aria-selected={tab === 'upcoming'} className={tab === 'upcoming' ? 'active' : ''} onClick={() => setTab('upcoming')}>예정</button>
        <button type="button" role="tab" aria-selected={tab === 'past'} className={tab === 'past' ? 'active' : ''} onClick={() => setTab('past')}>지난 이벤트</button>
      </div>
      <Link href="/admin/events/new" className="admin-create-button">+ 이벤트 만들기</Link>
    </header>
    {eventDays.length === 0 ? <section className="events-empty"><h2>{tab === 'upcoming' ? '예정된 이벤트가 없습니다' : '지난 이벤트가 없습니다'}</h2><p>{tab === 'upcoming' ? '새 이벤트를 만들어 참가자와 공유해 보세요.' : '지난 이벤트가 이곳에 모입니다.'}</p></section> : <div className="events-day-list">{eventDays.map(day => <section className="events-day-group admin-events-day-group" key={day.date.key}><header className="events-day-heading"><strong>{day.date.month} {day.date.day}일</strong><span>{day.date.weekday}</span></header><div className="events-day-items">{day.events.map(event => { const cover = publicCoverUrl(event.cover_image_path); return <article className="admin-event-showcase-card" key={event.id}><div className="admin-event-showcase-content"><span className="admin-event-time">{formatTime(event)}</span><h2>{event.title}</h2><p className="admin-event-meta"><MapPin size={18} strokeWidth={2}/>{formatLocation(event)}</p><p className="admin-event-meta"><Users size={18} strokeWidth={2}/>{event.count ? `${event.count}명 참가` : '참가자 없음'}</p><div className="admin-card-actions"><Link href={`/admin/events/${event.id}`} className="button admin-manage-button">이벤트 관리</Link><Link href={`/admin/events/${event.id}/registrations`} className="button admin-participants-button">참가자 관리</Link></div></div><div className="admin-event-showcase-image">{cover ? <Image src={cover} alt="" fill sizes="116px" /> : <span aria-hidden="true">I</span>}</div></article>; })}</div></section>)}</div>}
  </main>;
}
