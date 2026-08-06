import type { LamaEvent } from '@/lib/types';

export type LocalEventDate = {
  month: string;
  day: string;
  weekday: string;
  key: string;
};

export type EventDay<T extends LamaEvent = LamaEvent> = {
  date: LocalEventDate;
  events: T[];
};

export function localEventDateParts(event: LamaEvent): LocalEventDate {
  const parts = new Intl.DateTimeFormat('ko-KR', {
    timeZone: event.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
  }).formatToParts(new Date(event.start_at));
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));

  return {
    month: `${Number(values.month)}월`,
    day: String(Number(values.day)),
    weekday: values.weekday,
    key: `${values.year}-${values.month}-${values.day}`,
  };
}

export function groupEventsByDate<T extends LamaEvent>(events: T[]): EventDay<T>[] {
  const groups = new Map<string, EventDay<T>>();

  for (const event of events) {
    const date = localEventDateParts(event);
    const group = groups.get(date.key);
    if (group) group.events.push(event);
    else groups.set(date.key, { date, events: [event] });
  }

  return [...groups.values()];
}

export function formatEventStartTime(event: LamaEvent) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: event.timezone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(event.start_at));
}

export function formatEventLocation(event: LamaEvent) {
  return event.location_type === 'online' ? '온라인' : event.location_name ?? '장소 미정';
}
