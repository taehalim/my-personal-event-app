import Link from 'next/link';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return <main className="auth-shell"><Link href="/" className="muted">← Inha의 이벤트</Link><section className="auth-card"><span className="admin-brand">Inha의 이벤트</span><h1>관리자 로그인</h1><p className="muted">행사를 관리하려면 로그인해주세요.</p><LoginForm /></section></main>;
}
