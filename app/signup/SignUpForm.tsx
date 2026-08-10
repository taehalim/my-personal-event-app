'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

function callbackUrl(next: string) {
  const url = new URL('/auth/callback', window.location.origin);
  url.searchParams.set('next', next);
  return url.toString();
}

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  return <form onSubmit={async event => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return; }
    if (password !== passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return; }

    setLoading(true);
    const { data, error: signUpError } = await createClient().auth.signUp({ email, password, options: { emailRedirectTo: callbackUrl('/login') } });
    if (signUpError) {
      setError(signUpError.message.toLowerCase().includes('already') ? '이미 가입된 이메일입니다.' : '회원가입을 완료하지 못했습니다. 입력 내용을 확인해주세요.');
    } else if (data.session) {
      setMessage('가입이 완료되었습니다. 관리자 등록 후 로그인할 수 있습니다.');
    } else {
      setMessage('인증 메일을 보냈습니다. 이메일 인증을 완료한 뒤 관리자 등록을 요청해주세요.');
    }
    setLoading(false);
  }} className="auth-form">
    <div className="field"><label htmlFor="signup-email">이메일</label><input id="signup-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /></div>
    <div className="field"><label htmlFor="signup-password">비밀번호</label><input id="signup-password" type="password" autoComplete="new-password" minLength={6} required value={password} onChange={event => setPassword(event.target.value)} /><span className="field-hint">6자 이상 입력해주세요.</span></div>
    <div className="field"><label htmlFor="signup-password-confirm">비밀번호 확인</label><input id="signup-password-confirm" type="password" autoComplete="new-password" minLength={6} required value={passwordConfirm} onChange={event => setPasswordConfirm(event.target.value)} /></div>
    {error && <p className="error">{error}</p>}
    {message && <p className="auth-form-message">{message}</p>}
    <button className="button" disabled={loading}>{loading ? '가입 중...' : '회원가입'}</button>
    <div className="auth-form-links"><Link href="/login">이미 계정이 있어요</Link><Link href="/forgot-password">비밀번호 찾기</Link></div>
  </form>;
}
