import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import EventForm from '@/components/EventForm';

export default async function NewEventPage() {
  await requireAdmin();
  return <main className="admin-shell"><header className="admin-header admin-detail-header"><div><Link href="/admin" className="muted">← 행사 관리</Link><h1>새 행사 만들기</h1></div></header><EventForm /></main>;
}
