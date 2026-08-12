'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteEventButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const deleteEvent = async () => {
    setLoading(true);
    const response = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
    if (response.ok) router.push('/admin');
    else setLoading(false);
  };

  if (confirming) {
    return <span className="event-editor-delete-confirm" role="alert">
      <span>이벤트와 참가 기록을 삭제할까요?</span>
      <button type="button" className="event-editor-delete-cancel" onClick={() => setConfirming(false)} disabled={loading}>취소</button>
      <button type="button" className="event-editor-delete-confirm-button" onClick={deleteEvent} disabled={loading}>{loading ? '삭제 중…' : '영구 삭제'}</button>
    </span>;
  }

  return <button type="button" className="event-editor-delete" onClick={() => setConfirming(true)}>이벤트 삭제</button>;
}
