import Link from 'next/link';
import SignUpForm from './SignUpForm';

export default function SignUpPage() {
  return <main className="auth-shell">
    <Link href="/login" className="muted">← 로그인</Link>
    <section className="auth-card">
      <span className="admin-brand">Inha의 이벤트</span>
      <h1>관리자 회원가입</h1>
      <p className="muted">가입 후 이메일 인증과 관리자 등록이 필요합니다.</p>
      <SignUpForm />
    </section>
  </main>;
}
