'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { publicCoverUrl } from '@/lib/formatting';
import type { LamaEvent } from '@/lib/types';

type Tab = 'upcoming' | 'past';

function localDateParts(event: LamaEvent) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: event.timezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    weekday: 'long',
  }).formatToParts(new Date(event.start_at));
  return Object.fromEntries(parts.map(part => [part.type, part.value]));
}

function formatTime(event: LamaEvent) {
  return new Intl.DateTimeFormat('en-US', { timeZone: event.timezone, hour: 'numeric', minute: '2-digit' }).format(new Date(event.start_at));
}

function formatLocation(event: LamaEvent) {
  return event.location_type === 'online' ? 'Online' : event.location_name ?? 'Location to be announced';
}

export default function PublicEventsDirectory({ events, referenceNow }: { events: LamaEvent[]; referenceNow: string }) {
  const [tab, setTab] = useState<Tab>('upcoming');
  const visibleEvents = useMemo(() => { const now = new Date(referenceNow); return events.filter(event => tab === 'upcoming' ? new Date(event.end_at) >= now : new Date(event.end_at) < now); }, [events, referenceNow, tab]);

  return <main className="events-directory">
    <header className="events-directory-header">
      <h1>Events</h1>
      <div className="event-tabs" role="tablist" aria-label="Event status">
        <button type="button" role="tab" aria-selected={tab === 'upcoming'} className={tab === 'upcoming' ? 'active' : ''} onClick={() => setTab('upcoming')}>Upcoming</button>
        <button type="button" role="tab" aria-selected={tab === 'past'} className={tab === 'past' ? 'active' : ''} onClick={() => setTab('past')}>Past</button>
      </div>
    </header>
    {visibleEvents.length === 0 ? <section className="events-empty"><h2>{tab === 'upcoming' ? 'No upcoming events' : 'No past events'}</h2><p>{tab === 'upcoming' ? 'New events will appear here when they are published.' : 'Past events will be collected here.'}</p></section> : <div className="events-timeline">{visibleEvents.map(event => { const date = localDateParts(event); const cover = publicCoverUrl(event.cover_image_path); return <div className="event-row" key={event.id}><div className="event-date"><strong>{date.month} {date.day}</strong><span>{date.weekday}</span></div><div className="event-dot" aria-hidden="true"/><Link className="event-card" href={`/${event.slug}`}><div className="event-card-content"><span className="event-time">{formatTime(event)}</span><h2>{event.title}</h2><p className="event-host">By {event.host_name}</p><p className="event-location">{formatLocation(event)}</p><span className={`event-status ${event.status === 'cancelled' ? 'cancelled' : ''}`}>{event.status === 'cancelled' ? 'Cancelled' : tab === 'upcoming' ? 'Upcoming' : 'Past'}</span></div><div className="event-card-image">{cover ? <Image src={cover} alt="" fill sizes="180px" /> : <span aria-hidden="true">I</span>}</div></Link></div>; })}</div>}
  </main>;
}
