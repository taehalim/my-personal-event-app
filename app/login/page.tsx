import LoginForm from './LoginForm';
export default function LoginPage() { return <main className="container" style={{padding: '90px 0', maxWidth: 480}}><Link href="/" className="muted">← Lama</Link><div className="card" style={{padding: 28, marginTop: 22}}><h1 style={{fontSize: 30, marginTop: 0}}>관리자 로그인</h1><p className="muted">행사를 관리하려면 로그인해주세요.</p><LoginForm /></div></main>; }
import Link from 'next/link';
