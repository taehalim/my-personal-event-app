import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { ArrowLeft, CalendarDays, Clock3, ExternalLink, Globe2, MapPin, UsersRound } from 'lucide-react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { registrationState } from '@/lib/registration';
import { appUrl, publicCoverUrl } from '@/lib/formatting';
import type { LamaEvent, RegistrationField } from '@/lib/types';
import RegistrationForm from '@/components/RegistrationForm';

async function getEvent(slug: string) {
  const supabase = await createClient();
  const { data: event } = await supabase.from('events').select('*').eq('slug', slug).maybeSingle();
  if (!event) return null;

  const { data: fields } = await supabase.from('registration_fields').select('*').eq('event_id', event.id).order('sort_order');
  const admin = createAdminClient();
  const { count } = await admin.from('registrations').select('id', { count: 'exact', head: true }).eq('event_id', event.id).eq('status', 'approved');

  return { event: event as LamaEvent, fields: (fields ?? []) as RegistrationField[], approvedCount: count ?? 0 };
}

function formatDateParts(event: LamaEvent) {
  const dateParts = new Intl.DateTimeFormat('ko-KR', {
    timeZone: event.timezone,
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(new Date(event.start_at));
  const values = Object.fromEntries(dateParts.map(part => [part.type, part.value]));
  const dateLabel = new Intl.DateTimeFormat('ko-KR', {
    timeZone: event.timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date(event.start_at));
  const formatTime = (value: string) => new Intl.DateTimeFormat('ko-KR', {
    timeZone: event.timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(value));

  return {
    month: `${values.month}월`,
    day: values.day,
    dateLabel,
    timeLabel: `${formatTime(event.start_at)}–${formatTime(event.end_at)}`,
  };
}

function getLocationSummary(event: LamaEvent) {
  if (event.location_type === 'online') return { title: '온라인 이벤트', detail: '온라인 링크로 참여' };

  const parts = (event.location_name ?? '장소 미정').split(',').map(part => part.trim()).filter(Boolean);
  const city = parts.find(part => /seoul|서울/i.test(part));
  return {
    title: parts[0] ?? '장소 미정',
    detail: city ? '서울' : parts[1] ?? null,
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getEvent(slug);
  if (!data) return { title: '이벤트를 찾을 수 없습니다.' };

  const image = publicCoverUrl(data.event.cover_image_path);
  return {
    title: data.event.title,
    description: data.event.description.slice(0, 160),
    robots: { index: false, follow: false },
    alternates: { canonical: appUrl(`/${slug}`) },
    openGraph: { title: data.event.title, description: data.event.description.slice(0, 160), url: appUrl(`/${slug}`), type: 'website', images: image ? [{ url: image }] : undefined },
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getEvent(slug);
  if (!data || data.event.status === 'draft') notFound();

  const state = registrationState(data.event, data.approvedCount);
  const disabled = state !== 'open';
  const labels = { not_open: '신청 시작 전', open: '신청 가능', closed: '신청 마감', full: '정원 마감', cancelled: '취소된 이벤트' };
  const stateDescriptions = { not_open: '신청이 곧 시작됩니다.', open: '참가 신청을 남겨 주세요.', closed: '참가 신청이 마감되었습니다.', full: '참가 정원이 모두 찼습니다.', cancelled: '취소된 이벤트입니다.' };
  const cover = publicCoverUrl(data.event.cover_image_path);
  const date = formatDateParts(data.event);
  const location = getLocationSummary(data.event);
  const locationHref = data.event.location_type === 'online' ? data.event.location_url : data.event.map_url;

  return <main className="public-event-page">
    <div className="public-event-container">
      <Link href="/" className="public-event-back"><ArrowLeft size={17} strokeWidth={1.8} /><span>Inha의 이벤트</span></Link>

      <div className="public-event-layout">
        <aside className="public-event-sidebar">
          <div className="public-event-cover">
            {cover ? <Image src={cover} alt="" fill priority sizes="(max-width: 720px) 100vw, 380px" /> : <span aria-hidden="true">I</span>}
          </div>
          <div className="public-event-sidebar-info">
            <div className="public-event-host">
              <span>주최</span>
              <strong>{data.event.host_name}</strong>
            </div>
            <div className="public-event-attendance">
              <UsersRound size={18} strokeWidth={1.7} />
              <strong>{data.approvedCount}명 참가</strong>
            </div>
          </div>
        </aside>

        <article className="public-event-content">
          <header className="public-event-hero">
            <h1>{data.event.title}</h1>
          </header>

          <section className="public-event-facts" aria-label="이벤트 일정과 장소">
            <div className="public-event-fact public-event-date-fact">
              <span className="public-event-fact-icon"><CalendarDays size={21} strokeWidth={1.7} /></span>
              <div><strong>{date.dateLabel}</strong><span><Clock3 size={15} strokeWidth={1.8} />{date.timeLabel}</span></div>
            </div>
            <div className="public-event-fact">
              <span className="public-event-fact-icon">{data.event.location_type === 'online' ? <Globe2 size={21} strokeWidth={1.7} /> : <MapPin size={21} strokeWidth={1.7} />}</span>
              <div><strong>{location.title}</strong>{location.detail && <span>{location.detail}</span>}{locationHref && <a href={locationHref} target="_blank" rel="noreferrer">{data.event.location_type === 'online' ? '온라인 링크 열기' : '지도에서 보기'} <ExternalLink size={13} strokeWidth={1.8} /></a>}</div>
            </div>
          </section>

          <section className="public-event-rsvp">
            <header className="public-event-rsvp-header">
              <div><span className="public-event-section-label">참가 신청</span><h2>{state === 'open' ? '이벤트에 참가해 보세요' : labels[state]}</h2></div>
              <span className={`public-event-rsvp-state is-${state}`}>{labels[state]}</span>
            </header>
            {disabled ? <p className="public-event-rsvp-message">{stateDescriptions[state]}</p> : <RegistrationForm eventId={data.event.id} fields={data.fields} />}
          </section>

          <section className="public-event-about">
            <h2>이벤트 소개</h2>
            <div className="public-event-description"><ReactMarkdown rehypePlugins={[rehypeSanitize]}>{data.event.description}</ReactMarkdown></div>
          </section>
        </article>
      </div>
    </div>
  </main>;
}
