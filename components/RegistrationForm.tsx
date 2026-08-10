'use client';
import { useState } from 'react';
import type { RegistrationField } from '@/lib/types';

type RegistrationFormProps = {
  eventId: string;
  fields: RegistrationField[];
  disabled?: boolean;
  initiallyExpanded?: boolean;
};

export default function RegistrationForm({ eventId, fields, disabled, initiallyExpanded = false }: RegistrationFormProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(initiallyExpanded);

  if (!expanded && !message && !error) {
    return (
      <div className="registration-form-compact">
        <p>이름과 이메일만 입력하면 참가 신청할 수 있어요.</p>
        <button type="button" className="button" onClick={() => setExpanded(true)}>
          참가 신청
        </button>
      </div>
    );
  }

  const updateValue = (id: string, value: unknown) => setValues(current => ({ ...current, [id]: value }));

  return (
    <form
      className="registration-form"
      onSubmit={async event => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId, name, email, answers: values, consent, website: '' }),
        });
        const json = await response.json();
        if (!response.ok) setError(json.error?.message ?? '신청에 실패했습니다.');
        else setMessage('참가 신청이 완료되었습니다. 이메일을 확인해주세요.');
        setLoading(false);
      }}
    >
      <div className="field">
        <label>이름 *</label>
        <input required value={name} onChange={event => setName(event.target.value)} disabled={disabled || loading} />
      </div>
      <div className="field">
        <label>이메일 *</label>
        <input required type="email" value={email} onChange={event => setEmail(event.target.value)} disabled={disabled || loading} />
      </div>
      {fields.map(field => (
        <div className="field" key={field.id}>
          <label>{field.label}{field.required ? ' *' : ''}</label>
          {field.description && <small className="muted">{field.description}</small>}
          {field.type === 'textarea' ? (
            <textarea required={field.required} placeholder={field.placeholder ?? ''} onChange={event => updateValue(field.id!, event.target.value)} />
          ) : field.type === 'select' ? (
            <select required={field.required} defaultValue="" onChange={event => updateValue(field.id!, event.target.value)}>
              <option value="" disabled>선택해주세요</option>
              {(field.options ?? []).map(option => <option value={option.value} key={option.value}>{option.label}</option>)}
            </select>
          ) : field.type === 'checkbox' ? (
            <label className="registration-field-checkbox">
              <input type="checkbox" required={field.required} onChange={event => updateValue(field.id!, event.target.checked)} /> 동의합니다
            </label>
          ) : (
            <input required={field.required} placeholder={field.placeholder ?? ''} onChange={event => updateValue(field.id!, event.target.value)} />
          )}
        </div>
      ))}
      <label className="registration-consent">
        <input type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)} disabled={disabled || loading} />
        이벤트 운영 및 참가 안내를 위한 개인정보 수집·이용에 동의합니다.
      </label>
      {error && <p className="error">{error}</p>}
      {message && <p className="registration-form-message">{message}</p>}
      <button className="button" disabled={disabled || loading}>{loading ? '신청 중...' : '참가 신청'}</button>
    </form>
  );
}
