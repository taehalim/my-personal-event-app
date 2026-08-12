'use client';

import { useState } from 'react';

export default function RegistrationActions({ id, status }: { id: string; status: string }) {
  const [current, setCurrent] = useState(status);
  const [loading, setLoading] = useState(false);
  const next = current === 'pending' ? ['approved', 'rejected'] : current === 'approved' ? ['cancelled'] : [];
  const labels: Record<string, string> = { approved: '승인', rejected: '거절', cancelled: '취소' };

  const update = async (value: string) => {
    setLoading(true);
    const response = await fetch(`/api/admin/registrations/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: value }) });
    if (response.ok) setCurrent(value);
    setLoading(false);
  };

  return <div className="registration-actions">{next.map(value => <button type="button" key={value} className={value === 'rejected' || value === 'cancelled' ? 'is-danger' : ''} disabled={loading} onClick={() => void update(value)}>{labels[value] ?? value}</button>)}</div>;
}
