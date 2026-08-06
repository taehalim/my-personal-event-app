'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { publicCoverUrl } from '@/lib/formatting';
import type { LamaEvent } from '@/lib/types';

type Tab = 'upcoming' | 'past';
type LocalDate = { month: string; day: string; weekday: string; key: string };
type EventDay = { date: LocalDate; events: LamaEvent[] };

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

function groupEventsByDate(events: LamaEvent[]): EventDay[] {
  const groups = new Map<string, EventDay>();
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

export default function PublicEventsDirectory({ events, referenceNow }: { events: LamaEvent[]; referenceNow: string }) {
  const [tab, setTab] = useState<Tab>('upcoming');
  const visibleEvents = useMemo(() => {
    const now = new Date(referenceNow);
    return events.filter(event => tab === 'upcoming' ? new Date(event.end_at) >= now : new Date(event.end_at) < now);
  }, [events, referenceNow, tab]);
  const eventDays = useMemo(() => groupEventsByDate(visibleEvents), [visibleEvents]);

  return <main className="events-directory">
    <header className="events-directory-header">
      <h1>Inha의 이벤트</h1>
      <div className="event-tabs" role="tablist" aria-label="이벤트 상태">
        <button type="button" role="tab" aria-selected={tab === 'upcoming'} className={tab === 'upcoming' ? 'active' : ''} onClick={() => setTab('upcoming')}>예정된 이벤트</button>
        <button type="button" role="tab" aria-selected={tab === 'past'} className={tab === 'past' ? 'active' : ''} onClick={() => setTab('past')}>지난 이벤트</button>
      </div>
    </header>
    {eventDays.length === 0 ? <section className="events-empty"><span className="events-empty-icon" aria-hidden="true"><CalendarDays size={22} strokeWidth={1.8} /></span><h2>{tab === 'upcoming' ? '다음 이벤트를 준비 중이에요.' : '아직 지난 이벤트가 없어요.'}</h2><p>{tab === 'upcoming' ? '새로운 만남이 열리면 이곳에서 알려드릴게요.' : '첫 이벤트가 끝나면 이곳에 기록될 거예요.'}</p></section> : <div className="events-day-list">{eventDays.map(day => <section className="events-day-group" key={day.date.key}><header className="events-day-heading"><strong>{day.date.month} {day.date.day}일</strong><span>{day.date.weekday}</span></header><div className="events-day-items">{day.events.map(event => { const cover = publicCoverUrl(event.cover_image_path); return <Link className="event-card" href={`/${event.slug}`} key={event.id}><div className="event-card-content"><span className="event-time">{formatTime(event)}</span><h2>{event.title}</h2><p className="event-host">{event.host_name} 주최</p><p className="event-location">{formatLocation(event)}</p><span className={`event-status ${event.status === 'cancelled' ? 'cancelled' : ''}`}>{event.status === 'cancelled' ? '취소' : tab === 'upcoming' ? '예정' : '종료'}</span></div><div className="event-card-image">{cover ? <Image src={cover} alt="" fill sizes="116px" /> : <span aria-hidden="true">I</span>}</div></Link>; })}</div></section>)}</div>}
  </main>;
}
