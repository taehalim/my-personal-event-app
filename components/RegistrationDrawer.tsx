'use client';

import { useState } from 'react';
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
  const canRegister = state === 'open';

  if (!canRegister) return <span className={`public-event-sidebar-rsvp-link is-${state}`}>{label}</span>;

  return <div className={`registration-control${isOpen ? ' is-expanded' : ''}`}>
    <button type="button" className="public-event-sidebar-rsvp-link" onClick={() => setIsOpen(true)} aria-expanded={isOpen} aria-controls="event-registration-form">
      참가 신청 <ArrowRight size={16} strokeWidth={1.8} />
    </button>

    {isOpen && <section id="event-registration-form" className="registration-inline" aria-labelledby="registration-drawer-title">
        <header className="registration-inline-header">
          <div><span className="public-event-section-label">참가 신청</span><h2 id="registration-drawer-title">이벤트에 참가해 보세요</h2></div>
          <button type="button" className="registration-inline-close" onClick={() => setIsOpen(false)} aria-label="참가 신청 접기"><X size={18} strokeWidth={1.8} /></button>
        </header>
        <p className="registration-inline-description">{description}</p>
        <RegistrationForm eventId={eventId} fields={fields} initiallyExpanded />
      </section>}
  </div>;
}
