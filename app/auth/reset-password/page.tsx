'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return <main className="auth-shell">
    <Link href="/login" className="muted">← 로그인</Link>
    <section className="auth-card">
      <span className="admin-brand">My Personal Event App</span>
      <h1>새 비밀번호 설정</h1>
      <p className="muted">새롭게 사용할 비밀번호를 입력해주세요.</p>
      <form onSubmit={async event => {
        event.preventDefault();
        setError('');
        if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return; }
        if (password !== passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return; }
        setLoading(true);
        const supabase = createClient();
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) setError('비밀번호를 변경하지 못했습니다. 재설정 링크를 다시 요청해주세요.');
        else { await supabase.auth.signOut(); router.replace('/login'); }
        setLoading(false);
      }} className="auth-form">
        <div className="field"><label htmlFor="new-password">새 비밀번호</label><input id="new-password" type="password" autoComplete="new-password" minLength={6} required value={password} onChange={event => setPassword(event.target.value)} /></div>
        <div className="field"><label htmlFor="new-password-confirm">새 비밀번호 확인</label><input id="new-password-confirm" type="password" autoComplete="new-password" minLength={6} required value={passwordConfirm} onChange={event => setPasswordConfirm(event.target.value)} /></div>
        {error && <p className="error">{error}</p>}
        <button className="button" disabled={loading}>{loading ? '변경 중...' : '비밀번호 변경'}</button>
      </form>
    </section>
  </main>;
}
