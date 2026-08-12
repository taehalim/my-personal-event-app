import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, CalendarDays, Clock3, ExternalLink, Globe2, MapPin, UsersRound, Video } from 'lucide-react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { registrationState } from '@/lib/registration';
import { appUrl, publicCoverUrl } from '@/lib/formatting';
import type { LamaEvent, RegistrationField } from '@/lib/types';
import RegistrationDrawer from '@/components/RegistrationDrawer';
import EventBackground from '@/components/EventBackground';
import EventCanvasFrame from '@/components/EventCanvasFrame';
import EventExperienceLayout from '@/components/EventExperienceLayout';
import { isDarkEventBackground, normalizeBackgroundPreset } from '@/lib/event-backgrounds';

async function getEvent(slug: string) {
  const supabase = await createClient();
  const { data: event } = await supabase.from('events').select('*').eq('slug', slug).maybeSingle();
  if (!event) return null;

  const { data: fields } = await supabase.from('registration_fields').select('*').eq('event_id', event.id).order('sort_order');
  const admin = createAdminClient();
  const [{ count }, { data: participantRows }] = await Promise.all([
    admin.from('registrations').select('id', { count: 'exact', head: true }).eq('event_id', event.id).eq('status', 'approved'),
    admin.from('registrations').select('name').eq('event_id', event.id).eq('status', 'approved').order('registered_at', { ascending: true }).limit(8),
  ]);

  return { event: event as LamaEvent, fields: (fields ?? []) as RegistrationField[], approvedCount: count ?? 0, participants: (participantRows ?? []) as { name: string }[] };
}

function formatDateParts(event: LamaEvent) {
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

function getMapEmbedUrl(event: LamaEvent) {
  if (event.location_type !== 'in_person' || !event.location_name) return null;
  return `https://www.google.com/maps?q=${encodeURIComponent(event.location_name)}&output=embed`;
}

function cleanDescription(description: string) {
  return description.replaceAll('User Uploaded Image', '').replaceAll('\u200b', '');
}

function avatarLabel(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length > 1) return `${parts[0][0] ?? ''}${parts.at(-1)?.[0] ?? ''}`;
  return name.trim().slice(0, 2) || '?';
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
  const labels = { not_open: '신청 시작 전', open: '신청 가능', closed: '신청 마감', full: '정원 마감', cancelled: '취소된 이벤트' };
  const stateDescriptions = { not_open: '신청이 곧 시작됩니다.', open: '참가 신청을 남겨 주세요.', closed: '참가 신청이 마감되었습니다.', full: '참가 정원이 모두 찼습니다.', cancelled: '취소된 이벤트입니다.' };
  const cover = publicCoverUrl(data.event.cover_image_path);
  const date = formatDateParts(data.event);
  const location = getLocationSummary(data.event);
  const locationHref = data.event.location_type === 'online' ? data.event.location_url : data.event.map_url;
  const mapEmbedUrl = getMapEmbedUrl(data.event);
  const backgroundPreset = normalizeBackgroundPreset(data.event.background_preset);
  const isDarkCanvas = isDarkEventBackground(backgroundPreset);

  return <main className={`public-event-page event-theme-${backgroundPreset}`} data-tone={isDarkCanvas ? 'dark' : 'light'}>
    <EventBackground preset={backgroundPreset} fullViewport />
    <div className="public-event-container">
      <EventCanvasFrame header={<Link href="/" className="event-canvas-back"><ArrowLeft size={17} strokeWidth={1.8} /><span>{data.event.host_name}의 이벤트</span></Link>}>
        <EventExperienceLayout className="public-event-layout" aside={<div className="public-event-sidebar">
          <div className="public-event-sidebar-sticky">
            <div className="public-event-cover">
              {cover ? <Image src={cover} alt="" fill priority sizes="(max-width: 720px) 100vw, 380px" /> : <span aria-hidden="true">I</span>}
            </div>
            <div className="public-event-sidebar-info">
              <div className="public-event-host">
                <span className="public-event-person-label">주최자</span>
                <div className="public-event-person">
                  <span className="public-event-avatar public-event-host-avatar" aria-hidden="true">{avatarLabel(data.event.host_name)}</span>
                  <span className="public-event-person-name">{data.event.host_name}</span>
                </div>
              </div>
              <div className="public-event-attendance">
                <span className="public-event-person-label">참가자</span>
                {data.participants.length ? <div className="public-event-participant-row">
                  <div className="public-event-avatar-stack" aria-label={`참가자 ${data.approvedCount}명`}>
                    {data.participants.map((participant, index) => <span className="public-event-avatar public-event-participant-avatar" data-name={participant.name} tabIndex={0} role="img" aria-label={participant.name} key={`${participant.name}-${index}`}>{avatarLabel(participant.name)}</span>)}
                  </div>
                  <span>{data.approvedCount}명 참가</span>
                </div> : <div className="public-event-no-participants"><UsersRound size={17} strokeWidth={1.7} /><span>아직 참가자가 없어요</span></div>}
              </div>
              <RegistrationDrawer eventId={data.event.id} fields={data.fields} state={state} label={labels[state]} description={stateDescriptions[state]} />
            </div>
          </div>
        </div>}>

        <article className="public-event-content">
          <header className="public-event-hero">
            <h1>{data.event.title}</h1>
          </header>

          <section className="public-event-schedule" aria-labelledby="schedule-heading">
            <header className="public-event-section-heading"><h2 id="schedule-heading">일정</h2></header>
            <div className="public-event-facts">
              <div className="public-event-fact public-event-date-fact">
                <span className="public-event-fact-icon"><CalendarDays size={21} strokeWidth={1.7} /></span>
                <div><strong>{date.dateLabel}</strong><span><Clock3 size={15} strokeWidth={1.8} />{date.timeLabel}</span></div>
              </div>
            </div>
          </section>

          <section className="public-event-directions" aria-labelledby="directions-heading">
            <header className="public-event-section-heading public-event-directions-header">
              <h2 id="directions-heading">{data.event.location_type === 'online' ? '참여 방법' : '오시는 길'}</h2>
              {locationHref && <a className="public-event-directions-link" href={locationHref} target="_blank" rel="noreferrer">{data.event.location_type === 'online' ? '참여 링크 열기' : '길찾기'} <ExternalLink size={14} strokeWidth={1.8} /></a>}
            </header>
            <div className="public-event-fact public-event-directions-fact">
              <span className="public-event-fact-icon">{data.event.location_type === 'online' ? <Globe2 size={21} strokeWidth={1.7} /> : <MapPin size={21} strokeWidth={1.7} />}</span>
              <div><strong>{location.title}</strong>{location.detail && <span>{location.detail}</span>}</div>
            </div>
            {mapEmbedUrl && <div className="public-event-map"><iframe title={`${location.title} 지도`} src={mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>}
            {data.event.location_type === 'online' && locationHref && <a className="public-event-online-join" href={locationHref} target="_blank" rel="noreferrer">
              <span className="public-event-online-join-icon" aria-hidden="true"><Video size={20} strokeWidth={1.8} /></span>
              <span><strong>온라인으로 참여하기</strong><small>이벤트가 시작되면 참여 링크에서 만나요.</small></span>
              <ExternalLink size={17} strokeWidth={1.8} aria-hidden="true" />
            </a>}
          </section>

          <section className="public-event-about">
            <header className="public-event-section-heading"><h2>이벤트 소개</h2></header>
            <div className="public-event-description"><ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeSanitize]} components={{ img: ({ alt: _alt, ...props }) => {
              // Markdown image URLs are user content, so keep the native image element and suppress broken alt copy.
              // eslint-disable-next-line @next/next/no-img-element
              return <img {...props} alt="" loading="lazy" />;
            } }}>{cleanDescription(data.event.description)}</ReactMarkdown></div>
          </section>
        </article>
        </EventExperienceLayout>
      </EventCanvasFrame>
    </div>
  </main>;
}
