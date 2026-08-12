import type { User } from '@supabase/supabase-js';

export function displayNameForUser(user: User | null | undefined, fallback = '나') {
  const candidate = user?.user_metadata?.display_name;
  if (typeof candidate === 'string' && candidate.trim()) return candidate.trim().slice(0, 80);
  const emailName = user?.email?.split('@')[0]?.trim();
  return emailName || fallback;
}

export function eventsTitle(name: string) {
  return `${name.trim() || '나'}의 이벤트`;
}
