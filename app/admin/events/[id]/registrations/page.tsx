import Link from 'next/link';
import { Download, Search, UsersRound } from 'lucide-react';
import { requireAdminProfile } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import RegistrationActions from '@/components/RegistrationActions';

const statusLabels: Record<string, string> = { pending: '대기', approved: '승인', rejected: '거절', cancelled: '취소' };

export default async function RegistrationsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ q?: string; status?: string }> }) {
  const { user } = await requireAdminProfile();
  const { id } = await params;
  const filters = await searchParams;
  const admin = createAdminClient();
  let registrationsQuery = admin.from('registrations').select('*').eq('event_id', id).order('registered_at', { ascending: false });
  if (filters.q) registrationsQuery = registrationsQuery.or(`name.ilike.%${filters.q}%,email.ilike.%${filters.q}%`);
  if (filters.status && filters.status !== 'all') registrationsQuery = registrationsQuery.eq('status', filters.status);
  const { data: event } = await admin.from('events').select('title').eq('id', id).eq('created_by', user.id).maybeSingle();
  if (!event) return <main className="registrations-page"><header className="registrations-header"><Link href="/admin" className="event-create-back">← 내 이벤트</Link></header><section className="registrations-empty"><UsersRound size={21} strokeWidth={1.7} /><h2>이벤트를 찾을 수 없어요.</h2><p>권한이 없거나 삭제된 이벤트입니다.</p></section></main>;
  const { data: registrations } = await registrationsQuery;

  return <main className="registrations-page">
    <header className="registrations-header">
      <Link href={`/admin/events/${id}`} className="event-create-back">← 이벤트 편집</Link>
      <div className="registrations-heading"><div><span className="registrations-eyebrow">참가자 관리</span><h1>{event?.title}</h1><p>신청을 확인하고 참가 상태를 관리하세요.</p></div><a className="registrations-download" href={`/api/admin/events/${id}/registrations.csv`}><Download size={16} strokeWidth={1.8} />CSV 다운로드</a></div>
    </header>
    <form className="registrations-filter"><label><Search size={17} strokeWidth={1.8} /><span className="sr-only">이름 또는 이메일 검색</span><input name="q" defaultValue={filters.q} placeholder="이름 또는 이메일 검색" /></label><select name="status" defaultValue={filters.status ?? 'all'} aria-label="참가 상태"><option value="all">전체 상태</option><option value="pending">대기</option><option value="approved">승인</option><option value="rejected">거절</option><option value="cancelled">취소</option></select><button type="submit">검색</button></form>
    {registrations?.length ? <div className="registrations-list" role="region" aria-label="참가자 목록"><table><thead><tr>{['이름', '이메일', '상태', '신청 일시', '관리'].map(heading => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{registrations.map(registration => <tr key={registration.id}><td>{registration.name}</td><td>{registration.email}</td><td><span className={`admin-status ${registration.status}`}>{statusLabels[registration.status] ?? registration.status}</span></td><td>{new Date(registration.registered_at).toLocaleString('ko-KR')}</td><td><RegistrationActions id={registration.id} status={registration.status} /></td></tr>)}</tbody></table></div> : <section className="registrations-empty"><UsersRound size={21} strokeWidth={1.7} /><h2>아직 신청한 참가자가 없어요.</h2><p>{filters.q || (filters.status && filters.status !== 'all') ? '검색 조건을 바꾸어 다시 확인해 보세요.' : '참가 신청이 들어오면 이곳에서 확인할 수 있어요.'}</p></section>}
  </main>;
}
