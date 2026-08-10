'use client';

import { useEffect, useState } from 'react';
import imageCompression from 'browser-image-compression';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, FileText, Globe2, ImagePlus, MapPin, UsersRound, Video, X } from 'lucide-react';
import type { LamaEvent, RegistrationField, FieldType } from '@/lib/types';
import { publicCoverUrl } from '@/lib/formatting';
import { EVENT_BACKGROUND_PRESETS, type EventBackgroundPreset } from '@/lib/event-backgrounds';

type ExistingField = RegistrationField & { sort_order?: number; sortOrder?: number };
type DraftField = { type: FieldType; label: string; description: string; placeholder: string; required: boolean; optionsText: string };

const calendarWeekdays = ['일', '월', '화', '수', '목', '금', '토'];
const timeOptions = Array.from({ length: 48 }, (_, index) => `${String(Math.floor(index / 2)).padStart(2, '0')}:${index % 2 ? '30' : '00'}`);

function parseDateValue(value: string) {
  const parsed = value ? parseISO(value) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function toLocalInputValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function googleMapsSearchUrl(location: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

function googleMapsEmbedUrl(location: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`;
}

function DateTimePicker({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  const selected = parseDateValue(value);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(startOfMonth(selected));
  useEffect(() => { if (value) setMonth(startOfMonth(parseDateValue(value))); }, [value]);
  const days = eachDayOfInterval({ start: startOfWeek(month, { weekStartsOn: 0 }), end: endOfWeek(endOfMonth(month), { weekStartsOn: 0 }) });
  const setDate = (date: Date) => { const next = new Date(date); next.setHours(selected.getHours(), selected.getMinutes(), 0, 0); onChange(toLocalInputValue(next)); };
  const setTime = (time: string) => { const [hours, minutes] = time.split(':').map(Number); const next = new Date(selected); next.setHours(hours, minutes, 0, 0); onChange(toLocalInputValue(next)); };
  return <div className="event-form-date-row event-form-date-picker" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }}>
    <span className="event-form-date-icon" aria-hidden="true"><CalendarDays size={18} strokeWidth={1.8} /></span>
    <span className="event-form-date-label">{label}</span>
    <button type="button" className={`event-date-value ${open ? 'is-open' : ''}`} aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen(current => !current)}>
      <CalendarDays size={16} strokeWidth={1.8} aria-hidden="true" /><span>{value ? format(selected, 'M월 d일 (EEE)', { locale: ko }) : '날짜 선택'}</span><span className="event-date-time"><Clock3 size={14} strokeWidth={1.8} aria-hidden="true" />{value ? format(selected, 'HH:mm') : '시간 선택'}</span>
    </button>
    {open && <div className="event-date-popover" role="dialog" aria-label={`${label} 날짜와 시간 선택`}>
      <div className="event-date-popover-header"><strong>{format(month, 'yyyy년 M월', { locale: ko })}</strong><div><button type="button" aria-label="이전 달" onClick={() => setMonth(subMonths(month, 1))}><ChevronLeft size={17} /></button><button type="button" aria-label="다음 달" onClick={() => setMonth(addMonths(month, 1))}><ChevronRight size={17} /></button></div></div>
      <div className="event-calendar-weekdays">{calendarWeekdays.map(day => <span key={day}>{day}</span>)}</div>
      <div className="event-calendar-grid">{days.map(day => <button type="button" key={day.toISOString()} className={`${isSameMonth(day, month) ? '' : 'is-outside'} ${isSameDay(day, selected) ? 'is-selected' : ''}`} onClick={() => setDate(day)}>{format(day, 'd')}</button>)}</div>
      <div className="event-date-time-picker"><Clock3 size={15} aria-hidden="true" /><label htmlFor={`${id}-time`}>시간</label><select id={`${id}-time`} value={format(selected, 'HH:mm')} onChange={event => setTime(event.target.value)}>{timeOptions.map(time => <option key={time} value={time}>{time}</option>)}</select></div>
    </div>}
    <input id={id} type="hidden" value={value} readOnly aria-label={label} />
  </div>;
}

function LocationPicker({ locationType, locationName, locationUrl, onTypeChange, onLocationNameChange, onLocationUrlChange }: { locationType: 'in_person' | 'online'; locationName: string; locationUrl: string; onTypeChange: (value: 'in_person' | 'online') => void; onLocationNameChange: (value: string) => void; onLocationUrlChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = locationType === 'in_person' ? locationName : locationUrl;
  return <div className="event-location-picker">
    <button type="button" className={`event-location-trigger ${selected ? 'has-location' : ''}`} onClick={() => setOpen(current => !current)} aria-expanded={open}>
      <span className="event-location-icon">{locationType === 'online' ? <Video size={19} strokeWidth={1.8} aria-hidden="true" /> : <MapPin size={19} strokeWidth={1.8} aria-hidden="true" />}</span><span><strong>{selected || '장소 추가'}</strong><small>{selected ? (locationType === 'online' ? '온라인 링크' : '오프라인 장소') : '오프라인 장소 또는 온라인 링크'}</small></span><ChevronRight className="event-location-chevron" size={18} aria-hidden="true" />
    </button>
    {locationType === 'in_person' && locationName.trim() && <div className="event-location-map-preview"><iframe title="이벤트 장소 지도" src={googleMapsEmbedUrl(locationName)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><a href={googleMapsSearchUrl(locationName)} target="_blank" rel="noreferrer"><MapPin size={14} />Google Maps에서 보기</a></div>}
    {open && <div className="event-location-popover" role="dialog" aria-label="장소 추가">
      <div className="event-location-popover-header"><strong>어디서 만날까요?</strong><button type="button" aria-label="장소 선택 닫기" onClick={() => setOpen(false)}><X size={18} /></button></div>
      <div className="event-location-type-switch" role="tablist" aria-label="장소 유형"><button type="button" className={locationType === 'in_person' ? 'active' : ''} onClick={() => onTypeChange('in_person')}><MapPin size={16} />오프라인</button><button type="button" className={locationType === 'online' ? 'active' : ''} onClick={() => onTypeChange('online')}><Video size={16} />온라인</button></div>
      {locationType === 'in_person' ? <label className="event-location-input"><MapPin size={17} aria-hidden="true" /><input autoFocus value={locationName} onChange={event => onLocationNameChange(event.target.value)} placeholder="장소 이름을 입력해 주세요" aria-label="장소 이름" /></label> : <label className="event-location-input"><Globe2 size={17} aria-hidden="true" /><input autoFocus type="url" value={locationUrl} onChange={event => onLocationUrlChange(event.target.value)} placeholder="온라인 링크를 입력해 주세요" aria-label="온라인 링크" /></label>}
      <p className="event-location-hint">장소를 입력하면 참가자에게 이벤트 상세 페이지에 표시됩니다.</p><button type="button" className="event-location-done" onClick={() => setOpen(false)}><Check size={16} />완료</button>
    </div>}
  </div>;
}

function initialField(field: ExistingField): DraftField {
  return { type: field.type, label: field.label, description: field.description ?? '', placeholder: field.placeholder ?? '', required: field.required, optionsText: (field.options ?? []).map(option => `${option.label}:${option.value}`).join(', ') || '' };
}

export default function EventForm({ event, fields }: { event?: LamaEvent; fields?: ExistingField[] }) {
  const router = useRouter();
  const [title, setTitle] = useState(event?.title ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [hostName] = useState(event?.host_name ?? 'Inha');
  const [startAt, setStartAt] = useState(event?.start_at?.slice(0, 16) ?? '');
  const [endAt, setEndAt] = useState(event?.end_at?.slice(0, 16) ?? '');
  const [registrationOpenAt, setRegistrationOpenAt] = useState(event?.registration_open_at?.slice(0, 16) ?? '');
  const [registrationCloseAt, setRegistrationCloseAt] = useState(event?.registration_close_at?.slice(0, 16) ?? '');
  const [locationType, setLocationType] = useState<'in_person' | 'online'>(event?.location_type ?? 'in_person');
  const [locationName, setLocationName] = useState(event?.location_name ?? '');
  const [locationUrl, setLocationUrl] = useState(event?.location_url ?? '');
  const [capacity, setCapacity] = useState(event?.capacity?.toString() ?? '');
  const [approvalMode, setApprovalMode] = useState<'auto' | 'manual'>(event?.approval_mode ?? 'auto');
  const [status, setStatus] = useState<'draft' | 'published' | 'cancelled'>(event?.status ?? 'published');
  const [registrationEnabled, setRegistrationEnabled] = useState(event?.registration_enabled ?? true);
  const [coverPath, setCoverPath] = useState(event?.cover_image_path ?? '');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [backgroundPreset, setBackgroundPreset] = useState<EventBackgroundPreset>(event?.background_preset ?? 'plain');
  const [fieldsDraft, setFieldsDraft] = useState<DraftField[]>((fields ?? []).map(initialField));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (index: number, patch: Partial<DraftField>) => setFieldsDraft(current => current.map((field, fieldIndex) => fieldIndex === index ? { ...field, ...patch } : field));

  const save = async (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!title.trim() || !description.trim() || !startAt || !endAt) throw new Error('이벤트 제목, 일정, 설명을 입력해 주세요.');
      if (locationType === 'in_person' && !locationName.trim()) throw new Error('장소를 입력해 주세요.');
      if (locationType === 'online' && !locationUrl.trim()) throw new Error('온라인 링크를 입력해 주세요.');
      const registrationFields = fieldsDraft.map((field, index) => ({
        type: field.type,
        label: field.label,
        description: field.description || null,
        placeholder: field.placeholder || null,
        options: field.type === 'select' ? field.optionsText.split(',').map(item => item.trim()).filter(Boolean).map(item => { const [label, value] = item.split(':'); return { label: label.trim(), value: (value ?? label).trim() }; }) : null,
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
        await fetch(`/api/admin/events/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ coverImagePath: uploaded.path }) });
      }
      router.push(`/admin/events/${id}`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return <form onSubmit={save} className="admin-form event-form">
    <div className="event-form-workspace">
      <aside className="event-form-media-panel">
        <div className="event-cover-preview event-cover-preview-large">{coverPath ? <Image src={publicCoverUrl(coverPath) ?? ''} alt="현재 대표 이미지" fill sizes="240px" /> : <span aria-hidden="true"><ImagePlus size={22} strokeWidth={1.7} /><span>대표 이미지</span></span>}</div>
        <label htmlFor="event-cover" className="event-file-button event-file-button-wide"><ImagePlus size={16} strokeWidth={1.8} />대표 이미지 추가</label>
        <input id="event-cover" className="event-file-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={inputEvent => { const file = inputEvent.target.files?.[0] ?? null; if (file && file.size > 10 * 1024 * 1024) { setError('입력 이미지는 10MB 이하여야 합니다.'); return; } setCoverFile(file); }} />
        <p className="field-hint">JPG, PNG, WEBP · 최대 10MB</p>
        {coverFile && <p className="field-hint">선택됨: {coverFile.name}</p>}
        <div className="event-form-host-preview"><span>주최</span><strong>{hostName}</strong></div>
        <div className="event-background-picker">
          <div className="event-background-picker-heading"><strong>배경 효과</strong><span>공개 페이지</span></div>
          <div className="event-background-options" role="radiogroup" aria-label="배경 효과 선택">
            {EVENT_BACKGROUND_PRESETS.map(preset => <button type="button" key={preset.id} className={`event-background-option ${backgroundPreset === preset.id ? 'is-selected' : ''}`} onClick={() => setBackgroundPreset(preset.id)} role="radio" aria-checked={backgroundPreset === preset.id}>
              <span className={`event-background-preview event-background-preview-${preset.id}`} aria-hidden="true"><span /></span>
              <span className="event-background-option-copy"><strong>{preset.label}</strong><small>{preset.description}</small></span>
            </button>)}
          </div>
        </div>
      </aside>

      <div className="event-form-main-panel">
        {event && <div className="event-form-status-row"><label className="event-status-select"><Globe2 size={16} strokeWidth={1.8} aria-hidden="true" /><span>상태</span><select aria-label="공개 상태" value={status} onChange={inputEvent => setStatus(inputEvent.target.value as 'draft' | 'published' | 'cancelled')}><option value="published">공개</option><option value="draft">비공개 초안</option><option value="cancelled">취소</option></select></label></div>}
        <div className="field event-title-field"><label htmlFor="event-title">이벤트 제목 *</label><input id="event-title" required maxLength={120} value={title} onChange={inputEvent => setTitle(inputEvent.target.value)} placeholder="이벤트 제목" /></div>
        <div className="event-form-compact-block event-form-schedule-block event-editor-section"><div className="event-form-compact-heading"><strong>일정</strong><span><Globe2 size={14} aria-hidden="true" />Asia/Seoul</span></div><div className="event-form-date-list"><DateTimePicker id="event-start" label="시작" value={startAt} onChange={setStartAt} /><DateTimePicker id="event-end" label="종료" value={endAt} onChange={setEndAt} /></div></div>

        <LocationPicker locationType={locationType} locationName={locationName} locationUrl={locationUrl} onTypeChange={setLocationType} onLocationNameChange={setLocationName} onLocationUrlChange={setLocationUrl} />

        <div className="field event-description-field event-editor-section"><div className="event-form-field-heading"><label htmlFor="event-description"><FileText size={17} strokeWidth={1.8} aria-hidden="true" />이벤트 소개 *</label><span>Markdown 지원</span></div><textarea id="event-description" required value={description} onChange={inputEvent => setDescription(inputEvent.target.value)} placeholder="이벤트에서 다룰 내용과 참가자에게 필요한 안내를 적어 주세요." /></div>

        <section className="event-form-options event-editor-section"><div className="event-form-compact-heading"><strong>참가 설정</strong><span>선택 사항</span></div><div className="event-option-row"><UsersRound size={19} strokeWidth={1.8} aria-hidden="true" /><label htmlFor="event-capacity">정원</label><input id="event-capacity" type="number" min="1" value={capacity} onChange={inputEvent => setCapacity(inputEvent.target.value)} placeholder="무제한" /></div><div className="event-option-row"><Check size={19} strokeWidth={1.8} aria-hidden="true" /><label htmlFor="event-approval">승인 방식</label><select id="event-approval" value={approvalMode} onChange={inputEvent => setApprovalMode(inputEvent.target.value as 'auto' | 'manual')}><option value="auto">자동 승인</option><option value="manual">수동 승인</option></select></div><label className="event-checkbox"><input type="checkbox" checked={registrationEnabled} onChange={inputEvent => setRegistrationEnabled(inputEvent.target.checked)} /> 참가 신청 받기</label><details className="event-registration-advanced"><summary>신청 기간 설정 <span>{registrationOpenAt || registrationCloseAt ? '설정됨' : '기본값'}</span></summary><div className="event-options-grid"><div className="field"><label htmlFor="registration-open">신청 시작</label><input id="registration-open" type="datetime-local" value={registrationOpenAt} onChange={inputEvent => setRegistrationOpenAt(inputEvent.target.value)} /></div><div className="field"><label htmlFor="registration-close">신청 마감</label><input id="registration-close" type="datetime-local" value={registrationCloseAt} onChange={inputEvent => setRegistrationCloseAt(inputEvent.target.value)} /></div></div></details></section>

        <details className="event-form-advanced" open={fieldsDraft.length > 0}><summary>신청 질문 <span>{fieldsDraft.length ? `${fieldsDraft.length}개` : '추가하지 않음'}</span></summary><div className="event-form-advanced-content"><div className="event-form-section-header"><span className="field-hint">참가 신청 때 받을 정보를 추가할 수 있어요.</span><button type="button" className="button secondary event-add-button" onClick={() => setFieldsDraft([...fieldsDraft, { type: 'text', label: '', description: '', placeholder: '', required: false, optionsText: '' }])}>+ 질문 추가</button></div>{fieldsDraft.map((field, index) => <div key={index} className="admin-question"><div className="admin-form-section-header"><strong>질문 {index + 1}</strong><button type="button" className="button secondary event-remove-button" onClick={() => setFieldsDraft(fieldsDraft.filter((_, fieldIndex) => fieldIndex !== index))}>삭제</button></div><div className="admin-form-grid"><div className="field"><label>유형</label><select value={field.type} onChange={inputEvent => updateField(index, { type: inputEvent.target.value as FieldType })}><option value="text">짧은 답변</option><option value="textarea">긴 답변</option><option value="select">선택</option><option value="checkbox">체크박스</option></select></div><div className="field"><label>질문</label><input required value={field.label} onChange={inputEvent => updateField(index, { label: inputEvent.target.value })} placeholder="예: 소속을 알려 주세요" /></div></div>{field.type === 'select' && <div className="field"><label>선택지</label><input required value={field.optionsText} placeholder="개발자:developer, 기획자:planner" onChange={inputEvent => updateField(index, { optionsText: inputEvent.target.value })} /></div>}<label className="event-checkbox"><input type="checkbox" checked={field.required} onChange={inputEvent => updateField(index, { required: inputEvent.target.checked })} /> 필수 질문</label></div>)}</div></details>

        {error && <p className="error event-form-error">{error}</p>}
        <div className="event-form-actions"><Link href={event ? `/admin/events/${event.id}` : '/admin'} className="button secondary">취소</Link><button className="button" disabled={loading}>{loading ? '저장 중...' : event ? '변경사항 저장' : '이벤트 만들기'}</button></div>
      </div>
    </div>
  </form>;
}
