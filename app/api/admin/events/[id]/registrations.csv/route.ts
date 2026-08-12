import { getAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdmin();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();
  const { data: event } = await admin.from('events').select('id').eq('id', id).eq('created_by', user.id).maybeSingle();
  if (!event) return new Response('Not found', { status: 404 });

  const { data } = await admin.from('registrations').select('name,email,status,consent_at,registered_at,cancelled_at,answers').eq('event_id', id).order('registered_at');
  const rows = [['name', 'email', 'status', 'consent_at', 'registered_at', 'cancelled_at', 'answers'], ...(data ?? []).map(row => [row.name, row.email, row.status, row.consent_at, row.registered_at, row.cancelled_at ?? '', JSON.stringify(row.answers)])];
  const csv = `\ufeff${rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n')}`;
  return new Response(csv, { status: 200, headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="registrations-${id}.csv"` } });
}
