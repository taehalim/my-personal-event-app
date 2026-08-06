'use client';

import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { LamaEvent, RegistrationField, FieldType } from '@/lib/types';
import { publicCoverUrl } from '@/lib/formatting';

type ExistingField = RegistrationField & { sort_order?: number; sortOrder?: number };
type DraftField = { type: FieldType; label: string; description: string; placeholder: string; required: boolean; optionsText: string };

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
  const [fieldsDraft, setFieldsDraft] = useState<DraftField[]>((fields ?? []).map(initialField));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (index: number, patch: Partial<DraftField>) => setFieldsDraft(current => current.map((field, fieldIndex) => fieldIndex === index ? { ...field, ...patch } : field));

  const save = async (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault();
    setLoading(true);
    setError('');
    try {
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
        mapUrl: null,
        registrationEnabled,
        registrationOpenAt: registrationOpenAt ? new Date(registrationOpenAt).toISOString() : null,
        registrationCloseAt: registrationCloseAt ? new Date(registrationCloseAt).toISOString() : null,
        capacity: capacity ? Number(capacity) : null,
        approvalMode,
        status,
        coverImagePath: coverPath || null,
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
        <div className="event-cover-preview event-cover-preview-large">{coverPath ? <Image src={publicCoverUrl(coverPath) ?? ''} alt="현재 대표 이미지" fill sizes="280px" /> : <span aria-hidden="true">대표 이미지</span>}</div>
        <label htmlFor="event-cover" className="event-file-button event-file-button-wide">이미지 선택</label>
        <input id="event-cover" className="event-file-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={inputEvent => { const file = inputEvent.target.files?.[0] ?? null; if (file && file.size > 10 * 1024 * 1024) { setError('입력 이미지는 10MB 이하여야 합니다.'); return; } setCoverFile(file); }} />
        <p className="field-hint">JPG, PNG, WEBP · 최대 10MB</p>
        {coverFile && <p className="field-hint">선택됨: {coverFile.name}</p>}
      </aside>

      <div className="event-form-main-panel">
        <div className="event-form-status-row"><label className="event-status-select"><span>공개 상태</span><select aria-label="공개 상태" value={status} onChange={inputEvent => setStatus(inputEvent.target.value as 'draft' | 'published' | 'cancelled')}><option value="published">공개</option><option value="draft">비공개 초안</option><option value="cancelled">취소</option></select></label></div>
        <div className="field event-title-field"><label htmlFor="event-title">이벤트 제목 *</label><input id="event-title" required maxLength={120} value={title} onChange={inputEvent => setTitle(inputEvent.target.value)} placeholder="예: 바이브코딩 클럽" /></div>
        <div className="event-form-compact-block event-form-schedule-block"><div className="event-form-compact-heading"><strong>일정</strong><span>Asia/Seoul</span></div><div className="event-form-date-list"><div className="event-form-date-row"><span className="event-date-marker event-date-marker-start" aria-hidden="true" /><label htmlFor="event-start">시작 *</label><input id="event-start" required type="datetime-local" value={startAt} onChange={inputEvent => setStartAt(inputEvent.target.value)} /></div><div className="event-form-date-row"><span className="event-date-marker" aria-hidden="true" /><label htmlFor="event-end">종료 *</label><input id="event-end" required type="datetime-local" value={endAt} onChange={inputEvent => setEndAt(inputEvent.target.value)} /></div></div></div>

        <div className="event-form-compact-block event-form-location-block"><div className="event-form-compact-heading"><strong>장소</strong><select aria-label="장소 유형" value={locationType} onChange={inputEvent => setLocationType(inputEvent.target.value as 'in_person' | 'online')}><option value="in_person">오프라인</option><option value="online">온라인</option></select></div>{locationType === 'in_person' ? <div className="field"><input id="event-location" required aria-label="장소" value={locationName} onChange={inputEvent => setLocationName(inputEvent.target.value)} placeholder="예: 인하대학교 60주년기념관" /></div> : <div className="field"><input id="event-location-url" required type="url" aria-label="온라인 링크" value={locationUrl} onChange={inputEvent => setLocationUrl(inputEvent.target.value)} placeholder="https://" /></div>}</div>

        <div className="field event-description-field"><label htmlFor="event-description">이벤트 설명 *</label><textarea id="event-description" required value={description} onChange={inputEvent => setDescription(inputEvent.target.value)} placeholder="참가자가 이벤트를 이해하는 데 필요한 내용을 적어 주세요." /></div>

        <section className="event-form-options"><div className="event-form-compact-heading"><strong>참가 설정</strong><span>선택 사항</span></div><div className="event-options-grid"><div className="field"><label htmlFor="event-capacity">정원</label><input id="event-capacity" type="number" min="1" value={capacity} onChange={inputEvent => setCapacity(inputEvent.target.value)} placeholder="무제한" /></div><div className="field"><label htmlFor="event-approval">승인 방식</label><select id="event-approval" value={approvalMode} onChange={inputEvent => setApprovalMode(inputEvent.target.value as 'auto' | 'manual')}><option value="auto">자동 승인</option><option value="manual">수동 승인</option></select></div></div><label className="event-checkbox"><input type="checkbox" checked={registrationEnabled} onChange={inputEvent => setRegistrationEnabled(inputEvent.target.checked)} /> 참가 신청 받기</label><details className="event-registration-advanced"><summary>신청 기간 설정 <span>{registrationOpenAt || registrationCloseAt ? '설정됨' : '기본값'}</span></summary><div className="event-options-grid"><div className="field"><label htmlFor="registration-open">신청 시작</label><input id="registration-open" type="datetime-local" value={registrationOpenAt} onChange={inputEvent => setRegistrationOpenAt(inputEvent.target.value)} /></div><div className="field"><label htmlFor="registration-close">신청 마감</label><input id="registration-close" type="datetime-local" value={registrationCloseAt} onChange={inputEvent => setRegistrationCloseAt(inputEvent.target.value)} /></div></div></details></section>

        <details className="event-form-advanced" open={fieldsDraft.length > 0}><summary>신청 질문 <span>{fieldsDraft.length ? `${fieldsDraft.length}개` : '추가하지 않음'}</span></summary><div className="event-form-advanced-content"><div className="event-form-section-header"><span className="field-hint">참가 신청 때 받을 정보를 추가할 수 있어요.</span><button type="button" className="button secondary event-add-button" onClick={() => setFieldsDraft([...fieldsDraft, { type: 'text', label: '', description: '', placeholder: '', required: false, optionsText: '' }])}>+ 질문 추가</button></div>{fieldsDraft.map((field, index) => <div key={index} className="admin-question"><div className="admin-form-section-header"><strong>질문 {index + 1}</strong><button type="button" className="button secondary event-remove-button" onClick={() => setFieldsDraft(fieldsDraft.filter((_, fieldIndex) => fieldIndex !== index))}>삭제</button></div><div className="admin-form-grid"><div className="field"><label>유형</label><select value={field.type} onChange={inputEvent => updateField(index, { type: inputEvent.target.value as FieldType })}><option value="text">짧은 답변</option><option value="textarea">긴 답변</option><option value="select">선택</option><option value="checkbox">체크박스</option></select></div><div className="field"><label>질문</label><input required value={field.label} onChange={inputEvent => updateField(index, { label: inputEvent.target.value })} placeholder="예: 소속을 알려 주세요" /></div></div>{field.type === 'select' && <div className="field"><label>선택지</label><input required value={field.optionsText} placeholder="개발자:developer, 기획자:planner" onChange={inputEvent => updateField(index, { optionsText: inputEvent.target.value })} /></div>}<label className="event-checkbox"><input type="checkbox" checked={field.required} onChange={inputEvent => updateField(index, { required: inputEvent.target.checked })} /> 필수 질문</label></div>)}</div></details>

        {error && <p className="error event-form-error">{error}</p>}
        <div className="event-form-actions"><Link href={event ? `/admin/events/${event.id}` : '/admin'} className="button secondary">취소</Link><button className="button" disabled={loading}>{loading ? '저장 중...' : event ? '변경사항 저장' : '이벤트 만들기'}</button></div>
      </div>
    </div>
  </form>;
}
