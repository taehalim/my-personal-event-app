'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

function callbackUrl() {
  const url = new URL('/auth/callback', window.location.origin);
  url.searchParams.set('next', '/auth/reset-password');
  return url.toString();
}

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  return <form onSubmit={async event => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    const { error: resetError } = await createClient().auth.resetPasswordForEmail(email, { redirectTo: callbackUrl() });
    if (resetError) setError('재설정 메일을 보내지 못했습니다. 이메일 주소를 확인해주세요.');
    else setMessage('재설정 메일을 보냈습니다. 이메일의 링크를 열어 새 비밀번호를 설정해주세요.');
    setLoading(false);
  }} className="auth-form">
    <div className="field"><label htmlFor="reset-email">이메일</label><input id="reset-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /></div>
    {error && <p className="error">{error}</p>}
    {message && <p className="auth-form-message">{message}</p>}
    <button className="button" disabled={loading}>{loading ? '전송 중...' : '재설정 메일 보내기'}</button>
    <div className="auth-form-links"><Link href="/login">로그인으로 돌아가기</Link><Link href="/signup">회원가입</Link></div>
  </form>;
}
