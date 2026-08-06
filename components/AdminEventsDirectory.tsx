'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { publicCoverUrl } from '@/lib/formatting';
import type { EventStatus, LamaEvent } from '@/lib/types';

type AdminEvent = LamaEvent & { count: number };
type Tab = 'upcoming' | 'past';
const statusLabels: Record<EventStatus, string> = { draft: '초안', published: '공개', cancelled: '취소' };

function localDateParts(event: LamaEvent) {
  const parts = new Intl.DateTimeFormat('ko-KR', { timeZone: event.timezone, month: 'short', day: 'numeric', weekday: 'long' }).formatToParts(new Date(event.start_at));
  return Object.fromEntries(parts.map(part => [part.type, part.value]));
}

function formatTime(event: LamaEvent) {
  return new Intl.DateTimeFormat('ko-KR', { timeZone: event.timezone, hour: 'numeric', minute: '2-digit' }).format(new Date(event.start_at));
}

function formatLocation(event: LamaEvent) {
  return event.location_type === 'online' ? '온라인' : event.location_name ?? '장소 미정';
}

export default function AdminEventsDirectory({ events, referenceNow }: { events: AdminEvent[]; referenceNow: string }) {
  const [tab, setTab] = useState<Tab>('upcoming');
  const visibleEvents = useMemo(() => { const now = new Date(referenceNow); return events.filter(event => tab === 'upcoming' ? new Date(event.end_at) >= now : new Date(event.end_at) < now); }, [events, referenceNow, tab]);

  return <main className="events-directory admin-events-directory">
    <header className="events-directory-header admin-events-header">
      <h1>Inha&apos;s events</h1>
      <Link href="/admin/events/new" className="button admin-create-button">행사 만들기</Link>
      <div className="event-tabs" role="tablist" aria-label="행사 상태">
        <button type="button" role="tab" aria-selected={tab === 'upcoming'} className={tab === 'upcoming' ? 'active' : ''} onClick={() => setTab('upcoming')}>예정</button>
        <button type="button" role="tab" aria-selected={tab === 'past'} className={tab === 'past' ? 'active' : ''} onClick={() => setTab('past')}>지난 행사</button>
      </div>
    </header>
    {visibleEvents.length === 0 ? <section className="events-empty"><h2>{tab === 'upcoming' ? '예정된 행사가 없습니다' : '지난 행사가 없습니다'}</h2><p>{tab === 'upcoming' ? '새 행사를 만들어 참가자와 공유해 보세요.' : '지난 행사가 이곳에 모입니다.'}</p></section> : <div className="events-timeline">{visibleEvents.map(event => { const date = localDateParts(event); const cover = publicCoverUrl(event.cover_image_path); return <div className="event-row" key={event.id}><div className="event-date"><strong>{date.month} {date.day}일</strong><span>{date.weekday}</span></div><div className="event-dot" aria-hidden="true"/><article className="event-card admin-directory-card"><div className="event-card-content"><span className="event-time">{formatTime(event)}</span><span className={`admin-status ${event.status}`}>{statusLabels[event.status]}</span><h2>{event.title}</h2><p className="event-host">{event.host_name} 주최</p><p className="event-location">{formatLocation(event)}</p><div className="admin-card-footer"><span className="admin-attendee-count">승인 {event.count}명</span><Link href={`/admin/events/${event.id}`} className="button admin-manage-button">관리</Link></div></div><div className="event-card-image">{cover ? <Image src={cover} alt="" fill sizes="160px" /> : <span aria-hidden="true">I</span>}</div></article></div>; })}</div>}
  </main>;
}
