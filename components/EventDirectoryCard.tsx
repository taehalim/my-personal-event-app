'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Check, Copy, MapPin, UsersRound } from 'lucide-react';
import { publicCoverUrl } from '@/lib/formatting';
import {
  formatEventLocation,
  formatEventStartTime,
  formatEventTimeRange,
  getEventDirectoryState,
} from '@/lib/event-directory';
import type { Event } from '@/lib/types';

type AdminActions = {
  eventHref: string;
  participantsHref: string;
  copied: boolean;
  onCopy: () => void;
};

type EventDirectoryCardProps = {
  event: Event;
  href: string;
  referenceNow: string;
  participantLabel: string;
  adminActions?: AdminActions;
};

export default function EventDirectoryCard({
  event,
  href,
  referenceNow,
  participantLabel,
  adminActions,
}: EventDirectoryCardProps) {
  const cover = publicCoverUrl(event.cover_image_path);
  const state = getEventDirectoryState(event, referenceNow);
  const liveLabel = state === 'live' ? ' · 진행 중' : '';

  return <article className={`event-directory-card is-${state}`}>
    <Link className="event-directory-card-body" href={href} aria-label={`${event.title} 공개 페이지 보기${liveLabel}`}>
      <div className="event-directory-card-content">
        <div className="event-directory-time-row">
          {state === 'live' && <span className="event-directory-live-state">
            <span className="event-directory-live-dot" aria-hidden="true" />
            지금 진행 중
          </span>}
          <time className="event-directory-time" dateTime={event.start_at}>
            {state === 'live' ? formatEventTimeRange(event) : formatEventStartTime(event)}
          </time>
        </div>
        <h2>{event.title}</h2>
        <p className="event-directory-meta"><MapPin size={18} strokeWidth={1.8} /><span>{formatEventLocation(event)}</span></p>
        <p className="event-directory-meta"><UsersRound size={18} strokeWidth={1.8} /><span>{participantLabel}</span></p>
      </div>
      <div className="event-directory-card-image">
        {cover ? <Image src={cover} alt="" fill sizes="128px" /> : <span aria-hidden="true">I</span>}
      </div>
    </Link>
    {adminActions && <div className="event-directory-card-actions">
      <Link href={adminActions.eventHref} className="button admin-manage-button">이벤트 관리</Link>
      <Link href={adminActions.participantsHref} className="button admin-participants-button">참가자 관리</Link>
      <button type="button" className="button admin-copy-button" onClick={adminActions.onCopy}>
        {adminActions.copied ? <Check size={15} strokeWidth={2.2} /> : <Copy size={15} strokeWidth={2.2} />}
        {adminActions.copied ? '복사됨' : '링크 복사'}
      </button>
    </div>}
  </article>;
}
