'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return <form onSubmit={async event => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const { error: signInError } = await createClient().auth.signInWithPassword({ email, password });
    if (signInError) setError('이메일 또는 비밀번호를 확인해주세요.');
    else router.push('/admin');
    setLoading(false);
  }} className="auth-form">
    <div className="field"><label htmlFor="email">이메일</label><input id="email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /></div>
    <div className="field"><label htmlFor="password">비밀번호</label><input id="password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} /></div>
    {error && <p className="error">{error}</p>}
    <button className="button" disabled={loading}>{loading ? '로그인 중...' : '로그인'}</button>
    <div className="auth-form-links"><Link href="/signup">회원가입</Link><Link href="/forgot-password">비밀번호 찾기</Link></div>
  </form>;
}
