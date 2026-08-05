import crypto from 'node:crypto';
import type { LamaEvent, RegistrationState } from '@/lib/types';

export function registrationState(event: LamaEvent, approvedCount: number, now = new Date()): RegistrationState {
  if (event.status === 'cancelled') return 'cancelled';
  if (event.status !== 'published') return 'not_open';
  if (!event.registration_enabled) return 'closed';
  if (event.registration_open_at && now < new Date(event.registration_open_at)) return 'not_open';
  if (event.registration_close_at && now >= new Date(event.registration_close_at)) return 'closed';
  if (event.capacity !== null && approvedCount >= event.capacity) return 'full';
  return 'open';
}
export function tokenHash(token: string) { return crypto.createHash('sha256').update(token).digest('hex'); }
export function newCancelToken() { return crypto.randomBytes(24).toString('hex'); }
