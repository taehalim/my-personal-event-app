import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import EventForm from '@/components/EventForm';

export default async function NewEventPage() {
  await requireAdmin();
  return <main className="admin-shell event-create-shell"><header className="admin-header event-create-header"><div><Link href="/admin" className="event-create-back">← Inha의 이벤트</Link><span className="event-create-kicker">새 이벤트</span><h1>이벤트 만들기</h1><p>사람들이 만나고 싶은 이벤트를 만들어 보세요.</p></div></header><EventForm /></main>;
}
