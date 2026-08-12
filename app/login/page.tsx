import Link from 'next/link';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return <main className="auth-shell"><Link href="/" className="muted">← 이벤트 목록</Link><section className="auth-card"><span className="admin-brand">My Personal Event App</span><h1>관리자 로그인</h1><p className="muted">이벤트를 관리하려면 로그인해주세요.</p><LoginForm /></section></main>;
}
