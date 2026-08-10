import { formatInTimeZone } from 'date-fns-tz';
import { ko } from 'date-fns/locale';
export function formatEventDate(start: string, end: string, timezone: string) { const options = { locale: ko }; const day = formatInTimeZone(start, timezone, 'yyyy.MM.dd (EEE)', options); const s = formatInTimeZone(start, timezone, 'HH:mm', options); const e = formatInTimeZone(end, timezone, 'HH:mm', options); return `${day} ${s}–${e} (${timezone})`; }
export function appUrl(path = '') { return `${(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').trim()}${path}`; }
export function publicCoverUrl(path: string | null) {
  if (!path) return null;
  if (/^https:\/\//.test(path)) return path;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  return supabaseUrl ? `${supabaseUrl}/storage/v1/object/public/event-covers/${path}` : null;
}
