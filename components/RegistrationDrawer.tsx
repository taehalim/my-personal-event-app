'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import type { RegistrationField, RegistrationState } from '@/lib/types';
import RegistrationForm from '@/components/RegistrationForm';

type RegistrationDrawerProps = {
  eventId: string;
  fields: RegistrationField[];
  state: RegistrationState;
  label: string;
  description: string;
};

export default function RegistrationDrawer({ eventId, fields, state, label, description }: RegistrationDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const canRegister = state === 'open';

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    panelRef.current?.querySelector<HTMLInputElement>('input')?.focus();
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  if (!canRegister) return <span className={`public-event-sidebar-rsvp-link is-${state}`}>{label}</span>;

  return <>
    <button ref={triggerRef} type="button" className="public-event-sidebar-rsvp-link" onClick={() => setIsOpen(true)} aria-haspopup="dialog" aria-expanded={isOpen}>
      참가 신청 <ArrowRight size={16} strokeWidth={1.8} />
    </button>

    {isOpen && <div className="registration-drawer-layer" role="presentation">
      <button type="button" className="registration-drawer-backdrop" aria-label="참가 신청 닫기" onClick={close} />
      <section className="registration-drawer" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="registration-drawer-title">
        <header className="registration-drawer-header">
          <div><span className="public-event-section-label">참가 신청</span><h2 id="registration-drawer-title">이벤트에 참가해 보세요</h2></div>
          <button type="button" className="registration-drawer-close" onClick={close} aria-label="참가 신청 닫기"><X size={18} strokeWidth={1.8} /></button>
        </header>
        <p className="registration-drawer-description">{description}</p>
        <RegistrationForm eventId={eventId} fields={fields} initiallyExpanded />
      </section>
    </div>}
  </>;
}
