import Link from 'next/link';

export default function HomePage() { return <main className="container" style={{padding: '120px 0', maxWidth: 720}}><p className="pill">Lama</p><h1 style={{fontSize: 52, lineHeight: 1.08, margin: '18px 0'}}>AI 커뮤니티의 다음 만남을 시작하세요.</h1><p className="muted" style={{fontSize: 18, lineHeight: 1.7}}>행사 링크를 만들고, 참가 신청을 간단하게 받아보세요.</p><Link className="button" href="/login" style={{marginTop: 24}}>관리자 로그인</Link></main>; }
