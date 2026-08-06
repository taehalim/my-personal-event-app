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
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: event.timezone, month: 'short', day: 'numeric', weekday: 'long' }).formatToParts(new Date(event.start_at));
  return Object.fromEntries(parts.map(part => [part.type, part.value]));
}

function formatTime(event: LamaEvent) {
  return new Intl.DateTimeFormat('en-US', { timeZone: event.timezone, hour: 'numeric', minute: '2-digit' }).format(new Date(event.start_at));
}

function formatLocation(event: LamaEvent) {
  return event.location_type === 'online' ? 'Online' : event.location_name ?? 'Location to be announced';
}

export default function AdminEventsDirectory({ events, referenceNow }: { events: AdminEvent[]; referenceNow: string }) {
  const [tab, setTab] = useState<Tab>('upcoming');
  const visibleEvents = useMemo(() => { const now = new Date(referenceNow); return events.filter(event => tab === 'upcoming' ? new Date(event.end_at) >= now : new Date(event.end_at) < now); }, [events, referenceNow, tab]);

  return <main className="events-directory admin-events-directory">
    <header className="events-directory-header admin-events-header">
      <h1>Inha&apos;s events</h1>
      <Link href="/admin/events/new" className="button admin-create-button">Create event</Link>
      <div className="event-tabs" role="tablist" aria-label="Event status">
        <button type="button" role="tab" aria-selected={tab === 'upcoming'} className={tab === 'upcoming' ? 'active' : ''} onClick={() => setTab('upcoming')}>Upcoming</button>
        <button type="button" role="tab" aria-selected={tab === 'past'} className={tab === 'past' ? 'active' : ''} onClick={() => setTab('past')}>Past</button>
      </div>
    </header>
    {visibleEvents.length === 0 ? <section className="events-empty"><h2>{tab === 'upcoming' ? 'No upcoming events' : 'No past events'}</h2><p>{tab === 'upcoming' ? 'Create an event to share it with your community.' : 'Past events will be collected here.'}</p></section> : <div className="events-timeline">{visibleEvents.map(event => { const date = localDateParts(event); const cover = publicCoverUrl(event.cover_image_path); return <div className="event-row" key={event.id}><div className="event-date"><strong>{date.month} {date.day}</strong><span>{date.weekday}</span></div><div className="event-dot" aria-hidden="true"/><article className="event-card admin-directory-card"><div className="event-card-content"><span className="event-time">{formatTime(event)}</span><span className={`admin-status ${event.status}`}>{statusLabels[event.status]}</span><h2>{event.title}</h2><p className="event-host">By {event.host_name}</p><p className="event-location">{formatLocation(event)}</p><div className="admin-card-footer"><span className="admin-attendee-count">{event.count} approved</span><Link href={`/admin/events/${event.id}`} className="button admin-manage-button">Manage</Link></div></div><div className="event-card-image">{cover ? <Image src={cover} alt="" fill sizes="160px" /> : <span aria-hidden="true">I</span>}</div></article></div>; })}</div>}
  </main>;
}
