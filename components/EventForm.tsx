'use client';

import { useEffect, useState } from 'react';
import imageCompression from 'browser-image-compression';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { CalendarDays, Check, Clock3, FileText, Globe2, ImagePlus, Images, MapPin, Sparkles, UsersRound, Video } from 'lucide-react';
import type { FieldType, LamaEvent, RegistrationField } from '@/lib/types';
import { publicCoverUrl } from '@/lib/formatting';
import { EVENT_BACKGROUND_PRESETS, type EventBackgroundPreset } from '@/lib/event-backgrounds';
import { EVENT_COVER_LIBRARY } from '@/lib/cover-library';
import EventBackground from '@/components/EventBackground';
import styles from './EventForm.module.css';

type ExistingField = RegistrationField & { sort_order?: number; sortOrder?: number };
type DraftField = { type: FieldType; label: string; description: string; placeholder: string; required: boolean; optionsText: string };

function toLocalInputValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function dateTimeValue(value?: string | null) {
  if (!value) return '';
  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? '' : toLocalInputValue(parsed);
}

function googleMapsSearchUrl(location: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

function googleMapsEmbedUrl(location: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`;
}

function DateTimeControl({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  const parsed = value ? parseISO(value) : null;
  const valid = parsed && !Number.isNaN(parsed.getTime());
  const dateValue = valid ? format(parsed, 'yyyy-MM-dd') : '';
  const timeValue = valid ? format(parsed, 'HH:mm') : '09:00';

  const updateDate = (date: string) => onChange(date ? `${date}T${timeValue}` : '');
  const updateTime = (time: string) => {
    if (dateValue) onChange(`${dateValue}T${time}`);
  };

  return <fieldset className={styles.scheduleRow}>
    <legend>{label}</legend>
    <span className={styles.scheduleIcon} aria-hidden="true"><CalendarDays size={18} strokeWidth={1.8} /></span>
    <label className={styles.dateInput}><span className="sr-only">{label} 날짜</span><input id={`${id}-date`} type="date" value={dateValue} onChange={event => updateDate(event.target.value)} /></label>
    <label className={styles.timeInput}><Clock3 size={15} strokeWidth={1.8} aria-hidden="true" /><span className="sr-only">{label} 시간</span><input id={`${id}-time`} type="time" value={timeValue} disabled={!dateValue} onChange={event => updateTime(event.target.value)} /></label>
  </fieldset>;
}

function initialField(field: ExistingField): DraftField {
  return { type: field.type, label: field.label, description: field.description ?? '', placeholder: field.placeholder ?? '', required: field.required, optionsText: (field.options ?? []).map(option => `${option.label}:${option.value}`).join(', ') };
}

export default function EventForm({ event, fields }: { event?: LamaEvent; fields?: ExistingField[] }) {
  const router = useRouter();
  const [title, setTitle] = useState(event?.title ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [descriptionMode, setDescriptionMode] = useState<'write' | 'preview'>('write');
  const [hostName] = useState(event?.host_name ?? 'Inha');
  const [startAt, setStartAt] = useState(dateTimeValue(event?.start_at));
  const [endAt, setEndAt] = useState(dateTimeValue(event?.end_at));
  const [registrationOpenAt, setRegistrationOpenAt] = useState(dateTimeValue(event?.registration_open_at));
  const [registrationCloseAt, setRegistrationCloseAt] = useState(dateTimeValue(event?.registration_close_at));
  const [locationType, setLocationType] = useState<'in_person' | 'online'>(event?.location_type ?? 'in_person');
  const [locationName, setLocationName] = useState(event?.location_name ?? '');
  const [locationUrl, setLocationUrl] = useState(event?.location_url ?? '');
  const [capacity, setCapacity] = useState(event?.capacity?.toString() ?? '');
  const [approvalMode, setApprovalMode] = useState<'auto' | 'manual'>(event?.approval_mode ?? 'auto');
  const [status, setStatus] = useState<'draft' | 'published' | 'cancelled'>(event?.status ?? 'published');
  const [registrationEnabled, setRegistrationEnabled] = useState(event?.registration_enabled ?? true);
  const [coverPath, setCoverPath] = useState(event?.cover_image_path ?? '');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [backgroundPreset, setBackgroundPreset] = useState<EventBackgroundPreset>(event?.background_preset ?? 'plain');
  const [fieldsDraft, setFieldsDraft] = useState<DraftField[]>((fields ?? []).map(initialField));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(coverFile);
    setCoverPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [coverFile]);

  const coverPreview = coverPreviewUrl ?? publicCoverUrl(coverPath);
  const chosenLocation = locationType === 'in_person' ? locationName : locationUrl;
  const updateField = (index: number, patch: Partial<DraftField>) => setFieldsDraft(current => current.map((field, fieldIndex) => fieldIndex === index ? { ...field, ...patch } : field));

  const save = async (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!title.trim() || !description.trim() || !startAt || !endAt) throw new Error('이벤트 제목, 일정, 소개를 입력해 주세요.');
      if (locationType === 'in_person' && !locationName.trim()) throw new Error('장소를 입력해 주세요.');
      if (locationType === 'online' && !locationUrl.trim()) throw new Error('온라인 링크를 입력해 주세요.');
      const registrationFields = fieldsDraft.map((field, index) => ({
        type: field.type,
        label: field.label,
        description: field.description || null,
        placeholder: field.placeholder || null,
        options: field.type === 'select' ? field.optionsText.split(',').map(item => item.trim()).filter(Boolean).map(item => { const [label, optionValue] = item.split(':'); return { label: label.trim(), value: (optionValue ?? label).trim() }; }) : null,
        required: field.required,
        sortOrder: index,
      }));
      const payload = {
        title,
        description,
        hostName,
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
        timezone: 'Asia/Seoul',
        locationType,
        locationName: locationType === 'in_person' ? locationName : null,
        locationUrl: locationType === 'online' ? locationUrl : null,
        mapUrl: locationType === 'in_person' && locationName.trim() ? googleMapsSearchUrl(locationName) : null,
        registrationEnabled,
        registrationOpenAt: registrationOpenAt ? new Date(registrationOpenAt).toISOString() : null,
        registrationCloseAt: registrationCloseAt ? new Date(registrationCloseAt).toISOString() : null,
        capacity: capacity ? Number(capacity) : null,
        approvalMode,
        status: event ? status : 'published',
        coverImagePath: coverPath || null,
        backgroundPreset,
        fields: registrationFields,
      };
      const response = await fetch(event ? `/api/admin/events/${event.id}` : '/api/admin/events', { method: event ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error?.message ?? '저장에 실패했습니다.');
      const id = json.event.id;
      if (coverFile) {
        const compressed = await imageCompression(coverFile, { maxSizeMB: 2, maxWidthOrHeight: 1600, useWebWorker: true, fileType: 'image/webp' });
        const formData = new FormData();
        formData.append('file', compressed, 'cover.webp');
        formData.append('eventId', id);
        const uploadResponse = await fetch('/api/admin/upload', { method: 'POST', body: formData });
        const uploaded = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploaded.error?.message ?? '이미지 업로드에 실패했습니다.');
        const imageResponse = await fetch(`/api/admin/events/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ coverImagePath: uploaded.path }) });
        if (!imageResponse.ok) throw new Error('대표 이미지 저장에 실패했습니다.');
      }
      router.push(`/admin/events/${id}`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return <form onSubmit={save} className={styles.form}>
    <div className={styles.workspace}>
      <aside className={styles.sidebar}>
        <div className={styles.preview} aria-label="공개 페이지 미리보기">
          <EventBackground preset={backgroundPreset} />
          <div className={styles.previewContent}>
            <div className={styles.coverPreview}>{coverPreviewUrl ? <>
              {/* Blob URLs cannot be passed through next/image. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverPreviewUrl} alt="대표 이미지 미리보기" />
            </> : coverPreview ? <Image src={coverPreview} alt="대표 이미지 미리보기" fill sizes="260px" /> : <span className={styles.coverPlaceholder}><ImagePlus size={24} strokeWidth={1.7} />대표 이미지</span>}</div>
            <span className={styles.previewTitle}>{title.trim() || '이벤트 제목'}</span>
          </div>
        </div>

        <section className={styles.mediaSection} aria-labelledby="cover-heading">
          <div className={styles.sidebarHeading}><span><Images size={16} strokeWidth={1.8} /><strong id="cover-heading">대표 이미지</strong></span><small>공개 페이지에 표시</small></div>
          <label htmlFor="event-cover" className={styles.uploadButton}><ImagePlus size={16} strokeWidth={1.8} />내 이미지 업로드</label>
          <input id="event-cover" className={styles.fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={inputEvent => { const file = inputEvent.target.files?.[0] ?? null; if (file && file.size > 10 * 1024 * 1024) { setError('입력 이미지는 10MB 이하여야 합니다.'); return; } setCoverFile(file); }} />
          <div className={styles.coverGrid} aria-label="무료 대표 이미지 선택">
            {EVENT_COVER_LIBRARY.map(image => <button type="button" key={image.id} className={`${styles.coverOption} ${coverPath === image.url && !coverFile ? styles.selected : ''}`} onClick={() => { setCoverPath(image.url); setCoverFile(null); }} aria-pressed={coverPath === image.url && !coverFile}>
              <Image src={image.url} alt={image.label} fill sizes="76px" /><span>{image.label}</span>
            </button>)}
          </div>
          <p className={styles.hint}>{coverFile ? `${coverFile.name} 선택됨` : 'JPG, PNG, WEBP · 최대 10MB · 무료 이미지 8종'}</p>
        </section>

        <section className={styles.backgroundSection} aria-labelledby="background-heading">
          <div className={styles.sidebarHeading}><span><Sparkles size={16} strokeWidth={1.8} /><strong id="background-heading">페이지 배경</strong></span><small>즉시 미리보기</small></div>
          <div className={styles.backgroundGrid} role="radiogroup" aria-label="배경 효과 선택">
            {EVENT_BACKGROUND_PRESETS.map(preset => <button type="button" key={preset.id} className={`${styles.backgroundOption} ${backgroundPreset === preset.id ? styles.selected : ''}`} onClick={() => setBackgroundPreset(preset.id)} role="radio" aria-checked={backgroundPreset === preset.id}>
              <span className={`${styles.backgroundSwatch} ${styles[`background_${preset.id}`]}`} aria-hidden="true" /><span><strong>{preset.label}</strong><small>{preset.description}</small></span>
            </button>)}
          </div>
        </section>

        <div className={styles.hostPreview}><span>주최자</span><strong>{hostName}</strong></div>
      </aside>

      <main className={styles.main}>
        <div className={styles.topRow}>
          <span>{event ? '이벤트 편집' : '새 이벤트'}</span>
          {event && <label className={styles.statusControl}><Globe2 size={15} strokeWidth={1.8} aria-hidden="true" /><span>공개 상태</span><select value={status} onChange={inputEvent => setStatus(inputEvent.target.value as 'draft' | 'published' | 'cancelled')}><option value="published">공개</option><option value="draft">비공개 초안</option><option value="cancelled">취소</option></select></label>}
        </div>

        <div className={styles.titleField}><label htmlFor="event-title">이벤트 제목</label><input id="event-title" required maxLength={120} value={title} onChange={inputEvent => setTitle(inputEvent.target.value)} placeholder="이벤트 제목" /></div>

        <section className={styles.panel} aria-labelledby="schedule-heading">
          <div className={styles.panelHeading}><div><CalendarDays size={18} strokeWidth={1.8} /><strong id="schedule-heading">일정</strong></div><span><Globe2 size={14} strokeWidth={1.8} />Asia/Seoul</span></div>
          <div className={styles.scheduleList}><DateTimeControl id="event-start" label="시작" value={startAt} onChange={setStartAt} /><DateTimeControl id="event-end" label="종료" value={endAt} onChange={setEndAt} /></div>
        </section>

        <section className={styles.panel} aria-labelledby="location-heading">
          <div className={styles.panelHeading}><div><MapPin size={18} strokeWidth={1.8} /><strong id="location-heading">장소</strong></div></div>
          <div className={styles.locationTabs} role="tablist" aria-label="장소 유형"><button type="button" className={locationType === 'in_person' ? styles.active : ''} onClick={() => setLocationType('in_person')} role="tab" aria-selected={locationType === 'in_person'}><MapPin size={16} />오프라인</button><button type="button" className={locationType === 'online' ? styles.active : ''} onClick={() => setLocationType('online')} role="tab" aria-selected={locationType === 'online'}><Video size={16} />온라인</button></div>
          <label className={styles.locationInput}>{locationType === 'in_person' ? <MapPin size={18} strokeWidth={1.8} aria-hidden="true" /> : <Globe2 size={18} strokeWidth={1.8} aria-hidden="true" />}<span className="sr-only">{locationType === 'in_person' ? '장소 이름' : '온라인 링크'}</span><input type={locationType === 'in_person' ? 'text' : 'url'} value={chosenLocation} onChange={inputEvent => locationType === 'in_person' ? setLocationName(inputEvent.target.value) : setLocationUrl(inputEvent.target.value)} placeholder={locationType === 'in_person' ? '예: 인하대학교 60주년기념관' : 'https://meet.google.com/...'} /></label>
          {locationType === 'in_person' && locationName.trim() && <div className={styles.mapPreview}><iframe title="이벤트 장소 지도" src={googleMapsEmbedUrl(locationName)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><a href={googleMapsSearchUrl(locationName)} target="_blank" rel="noreferrer">Google Maps에서 보기 ↗</a></div>}
        </section>

        <section className={styles.panel} aria-labelledby="description-heading">
          <div className={styles.panelHeading}><div><FileText size={18} strokeWidth={1.8} /><strong id="description-heading">이벤트 소개</strong></div><div className={styles.editorTabs} role="tablist" aria-label="이벤트 소개 편집 방식"><button type="button" className={descriptionMode === 'write' ? styles.active : ''} onClick={() => setDescriptionMode('write')} role="tab" aria-selected={descriptionMode === 'write'}>작성</button><button type="button" className={descriptionMode === 'preview' ? styles.active : ''} onClick={() => setDescriptionMode('preview')} role="tab" aria-selected={descriptionMode === 'preview'}>미리보기</button></div></div>
          {descriptionMode === 'write' ? <textarea id="event-description" required value={description} onChange={inputEvent => setDescription(inputEvent.target.value)} placeholder="이벤트에서 다룰 내용과 참가자에게 필요한 안내를 적어 주세요. Markdown을 지원합니다." /> : <div className={styles.markdownPreview}>{description.trim() ? <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeSanitize]}>{description}</ReactMarkdown> : <p>작성한 이벤트 소개가 여기에 표시됩니다.</p>}</div>}
        </section>

        <section className={styles.panel} aria-labelledby="registration-heading">
          <div className={styles.panelHeading}><div><UsersRound size={18} strokeWidth={1.8} /><strong id="registration-heading">참가 설정</strong></div><span>선택 사항</span></div>
          <div className={styles.optionRows}>
            <label><span><UsersRound size={17} strokeWidth={1.8} />정원</span><input id="event-capacity" type="number" min="1" value={capacity} onChange={inputEvent => setCapacity(inputEvent.target.value)} placeholder="무제한" /></label>
            <label><span><Check size={17} strokeWidth={1.8} />승인 방식</span><select id="event-approval" value={approvalMode} onChange={inputEvent => setApprovalMode(inputEvent.target.value as 'auto' | 'manual')}><option value="auto">자동 승인</option><option value="manual">수동 승인</option></select></label>
            <label className={styles.checkboxRow}><span>참가 신청 받기</span><input type="checkbox" checked={registrationEnabled} onChange={inputEvent => setRegistrationEnabled(inputEvent.target.checked)} /></label>
          </div>
          <details className={styles.advanced}><summary>신청 기간 설정 <span>{registrationOpenAt || registrationCloseAt ? '설정됨' : '기본값'}</span></summary><div className={styles.advancedGrid}><label>신청 시작<input type="datetime-local" value={registrationOpenAt} onChange={inputEvent => setRegistrationOpenAt(inputEvent.target.value)} /></label><label>신청 마감<input type="datetime-local" value={registrationCloseAt} onChange={inputEvent => setRegistrationCloseAt(inputEvent.target.value)} /></label></div></details>
        </section>

        <details className={styles.questions} open={fieldsDraft.length > 0}><summary>신청 질문 <span>{fieldsDraft.length ? `${fieldsDraft.length}개` : '추가하지 않음'}</span></summary><div className={styles.questionsContent}><div className={styles.questionToolbar}><p>참가 신청 때 받을 정보를 추가할 수 있어요.</p><button type="button" className={styles.secondaryButton} onClick={() => setFieldsDraft([...fieldsDraft, { type: 'text', label: '', description: '', placeholder: '', required: false, optionsText: '' }])}>+ 질문 추가</button></div>{fieldsDraft.map((field, index) => <div key={index} className={styles.question}><div><strong>질문 {index + 1}</strong><button type="button" onClick={() => setFieldsDraft(fieldsDraft.filter((_, fieldIndex) => fieldIndex !== index))}>삭제</button></div><div className={styles.questionGrid}><label>유형<select value={field.type} onChange={inputEvent => updateField(index, { type: inputEvent.target.value as FieldType })}><option value="text">짧은 답변</option><option value="textarea">긴 답변</option><option value="select">선택</option><option value="checkbox">체크박스</option></select></label><label>질문<input required value={field.label} onChange={inputEvent => updateField(index, { label: inputEvent.target.value })} placeholder="예: 소속을 알려 주세요" /></label></div>{field.type === 'select' && <label>선택지<input required value={field.optionsText} placeholder="개발자:developer, 기획자:planner" onChange={inputEvent => updateField(index, { optionsText: inputEvent.target.value })} /></label>}<label className={styles.questionRequired}><input type="checkbox" checked={field.required} onChange={inputEvent => updateField(index, { required: inputEvent.target.checked })} />필수 질문</label></div>)}</div></details>

        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}><Link href={event ? `/admin/events/${event.id}` : '/admin'} className={styles.cancelButton}>취소</Link><button className={styles.saveButton} disabled={loading}>{loading ? '저장 중...' : event ? '변경사항 저장' : '이벤트 만들기'}</button></div>
      </main>
    </div>
  </form>;
}
