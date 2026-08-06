import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import RegistrationActions from '@/components/RegistrationActions';

const statusLabels: Record<string, string> = { pending: '대기', approved: '승인', rejected: '거절', cancelled: '취소' };

export default async function RegistrationsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ q?: string; status?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const filters = await searchParams;
  const admin = createAdminClient();
  let registrationsQuery = admin.from('registrations').select('*').eq('event_id', id).order('registered_at', { ascending: false });
  if (filters.q) registrationsQuery = registrationsQuery.or(`name.ilike.%${filters.q}%,email.ilike.%${filters.q}%`);
  if (filters.status && filters.status !== 'all') registrationsQuery = registrationsQuery.eq('status', filters.status);
  const [{ data: event }, { data: registrations }] = await Promise.all([admin.from('events').select('title').eq('id', id).single(), registrationsQuery]);

  return <main className="admin-shell">
    <Link href={`/admin/events/${id}`} className="muted">← 이벤트 관리</Link>
    <header className="admin-header admin-detail-header"><h1>{event?.title} 참가자</h1><a className="button secondary" href={`/api/admin/events/${id}/registrations.csv`}>CSV 다운로드</a></header>
    <form className="admin-filter-card"><input name="q" defaultValue={filters.q} placeholder="이름 또는 이메일 검색" /><select name="status" defaultValue={filters.status ?? 'all'}><option value="all">전체 상태</option><option value="pending">대기</option><option value="approved">승인</option><option value="rejected">거절</option><option value="cancelled">취소</option></select><button className="button">검색</button></form>
    <div className="admin-table-card"><table className="admin-table"><thead><tr>{['이름', '이메일', '상태', '신청 일시', '관리'].map(heading => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{(registrations ?? []).map(registration => <tr key={registration.id}><td>{registration.name}</td><td>{registration.email}</td><td><span className={`admin-status ${registration.status}`}>{statusLabels[registration.status] ?? registration.status}</span></td><td>{new Date(registration.registered_at).toLocaleString('ko-KR')}</td><td><RegistrationActions id={registration.id} status={registration.status} /></td></tr>)}</tbody></table>{!registrations?.length && <p className="muted admin-table-empty">조건에 맞는 참가자가 없습니다.</p>}</div>
  </main>;
}
