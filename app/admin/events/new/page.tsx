import { requireAdminProfile } from '@/lib/auth';
import EventForm from '@/components/EventForm';

export default async function NewEventPage() {
  const { displayName } = await requireAdminProfile();
  return <main className="event-create-shell"><EventForm hostName={displayName} /></main>;
}
