'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Check, Copy, MapPin, UsersRound } from 'lucide-react';
import { publicCoverUrl } from '@/lib/formatting';
import { formatEventLocation, formatEventStartTime } from '@/lib/event-directory';
import type { LamaEvent } from '@/lib/types';

type AdminActions = {
  eventHref: string;
  participantsHref: string;
  copied: boolean;
  onCopy: () => void;
};

type EventDirectoryCardProps = {
  event: LamaEvent;
  href: string;
  participantLabel: string;
  statusLabel?: string;
  adminActions?: AdminActions;
};

export default function EventDirectoryCard({
  event,
  href,
  participantLabel,
  statusLabel,
  adminActions,
}: EventDirectoryCardProps) {
  const cover = publicCoverUrl(event.cover_image_path);

  return <article className="event-directory-card">
    <Link className="event-directory-card-body" href={href} aria-label={`${event.title} 공개 페이지 보기`}>
      <div className="event-directory-card-content">
        <time className="event-directory-time" dateTime={event.start_at}>{formatEventStartTime(event)}</time>
        <h2>{event.title}</h2>
        <p className="event-directory-meta"><MapPin size={18} strokeWidth={1.8} />{formatEventLocation(event)}</p>
        <p className="event-directory-meta"><UsersRound size={18} strokeWidth={1.8} />{participantLabel}</p>
        {statusLabel && <span className={`event-directory-status${event.status === 'cancelled' ? ' cancelled' : ''}`}>{statusLabel}</span>}
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
