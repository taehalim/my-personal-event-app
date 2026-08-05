import Link from 'next/link';
import CancelForm from './CancelForm';
export default async function CancelPage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{token?:string}>}){const {slug}=await params;const {token}=await searchParams;return <main className="container" style={{padding:'100px 0',maxWidth:560}}><div className="card" style={{padding:28}}><h1>참가 취소</h1><p className="muted">참가 신청을 취소하시겠습니까?</p><CancelForm slug={slug} token={token??''}/><Link href={`/${slug}`} className="button secondary" style={{marginTop:12}}>행사 페이지로 돌아가기</Link></div></main>}
