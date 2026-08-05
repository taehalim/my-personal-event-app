'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() { const router = useRouter(); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [loading,setLoading]=useState(false); return <form onSubmit={async e=>{e.preventDefault();setLoading(true);setError('');const {error}=await createClient().auth.signInWithPassword({email,password});if(error)setError('이메일 또는 비밀번호를 확인해주세요.');else router.push('/admin');setLoading(false);}} style={{display:'grid',gap:16}}><div className="field"><label htmlFor="email">이메일</label><input id="email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} /></div><div className="field"><label htmlFor="password">비밀번호</label><input id="password" type="password" required value={password} onChange={e=>setPassword(e.target.value)} /></div>{error&&<p className="error">{error}</p>}<button className="button" disabled={loading}>{loading?'로그인 중...':'로그인'}</button></form>; }
