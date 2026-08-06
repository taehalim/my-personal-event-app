import { formatInTimeZone } from 'date-fns-tz';
export function formatEventDate(start: string, end: string, timezone: string) { const day = formatInTimeZone(start, timezone, 'yyyy.MM.dd (EEE)'); const s = formatInTimeZone(start, timezone, 'HH:mm'); const e = formatInTimeZone(end, timezone, 'HH:mm'); return `${day} ${s}–${e} (${timezone})`; }
export function appUrl(path = '') { return `${(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').trim()}${path}`; }
export function publicCoverUrl(path: string | null) { const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(); return path && supabaseUrl ? `${supabaseUrl}/storage/v1/object/public/event-covers/${path}` : null; }
