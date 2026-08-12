import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { displayNameForUser } from '@/lib/profile';
import { makeSlug } from '@/lib/slug';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { eventSchema } from '@/lib/validations';

function toEventRow(value: ReturnType<typeof eventSchema.parse>, userId: string, slug: string, hostName: string) {
  return {
    slug,
    title: value.title,
    description: value.description,
    cover_image_path: value.coverImagePath ?? null,
    background_preset: value.backgroundPreset ?? 'galaxy',
    host_name: hostName,
    start_at: value.startAt,
    end_at: value.endAt,
    timezone: value.timezone,
    location_type: value.locationType,
    location_name: value.locationName ?? null,
    location_url: value.locationUrl ?? null,
    map_url: value.mapUrl ?? null,
    registration_enabled: value.registrationEnabled,
    registration_open_at: value.registrationOpenAt ?? null,
    registration_close_at: value.registrationCloseAt ?? null,
    capacity: value.capacity ?? null,
    approval_mode: value.approvalMode,
    status: value.status,
    created_by: userId,
  };
}

async function approvedCountByEvent(eventIds: string[]) {
  if (!eventIds.length) return new Map<string, number>();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('registrations')
    .select('event_id')
    .in('event_id', eventIds)
    .eq('status', 'approved');
  if (error) throw error;

  return (data ?? []).reduce((counts, registration) => {
    counts.set(registration.event_id, (counts.get(registration.event_id) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());
}

export async function GET(request: Request) {
  const user = await getAdmin();
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } }, { status: 401 });

  const url = new URL(request.url);
  const status = url.searchParams.get('status') ?? 'all';
  const queryText = url.searchParams.get('q') ?? '';
  const supabase = await createClient();
  let query = supabase.from('events').select('*').eq('created_by', user.id).order('start_at', { ascending: false });
  if (status !== 'all') query = query.eq('status', status);
  if (queryText) query = query.ilike('title', `%${queryText}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });

  try {
    const counts = await approvedCountByEvent((data ?? []).map(event => event.id));
    return NextResponse.json({ events: (data ?? []).map(event => ({ ...event, approvedCount: counts.get(event.id) ?? 0 })) });
  } catch {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: '참가자 수를 불러오지 못했습니다.' } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAdmin();
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } }, { status: 401 });

  const parsed = eventSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: { code: 'INVALID_INPUT', message: parsed.error.issues[0]?.message ?? '입력값을 확인해주세요.' } }, { status: 400 });

  const supabase = await createClient();
  let slug = makeSlug();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data: duplicate } = await supabase.from('events').select('id').eq('slug', slug).maybeSingle();
    if (!duplicate) break;
    slug = makeSlug();
  }

  const { data: event, error } = await supabase.from('events').insert(toEventRow(parsed.data, user.id, slug, displayNameForUser(user))).select().single();
  if (error || !event) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error?.message ?? '이벤트를 생성하지 못했습니다.' } }, { status: 500 });

  if (parsed.data.fields?.length) {
    const { error: fieldError } = await supabase.from('registration_fields').insert(parsed.data.fields.map((field, index) => ({ ...field, event_id: event.id, sort_order: field.sortOrder ?? index })));
    if (fieldError) {
      await supabase.from('events').delete().eq('id', event.id);
      return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: '신청 질문을 저장하지 못했습니다.' } }, { status: 500 });
    }
  }

  return NextResponse.json({ event: { ...event, publicUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${slug}` } }, { status: 201 });
}
