import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import EventForm from '@/components/EventForm';

export default async function NewEventPage() {
  await requireAdmin();
  return <main className="admin-shell event-create-shell"><header className="event-create-header"><Link href="/admin" className="event-create-back">← Inha의 이벤트</Link></header><EventForm /></main>;
}
