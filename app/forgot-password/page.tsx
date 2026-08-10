import Link from 'next/link';
import ForgotPasswordForm from './ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return <main className="auth-shell">
    <Link href="/login" className="muted">← 로그인</Link>
    <section className="auth-card">
      <span className="admin-brand">Inha의 이벤트</span>
      <h1>비밀번호 찾기</h1>
      <p className="muted">가입한 이메일로 비밀번호 재설정 링크를 보내드려요.</p>
      <ForgotPasswordForm />
    </section>
  </main>;
}
