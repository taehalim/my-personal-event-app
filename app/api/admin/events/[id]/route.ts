import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { eventSchema } from '@/lib/validations';

const storedCoverPath = z.string().regex(/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.webp$/i);

function toEventRow(value: ReturnType<typeof eventSchema.parse>, hostName: string) {
  return {
    title: value.title,
    description: value.description,
    cover_image_path: value.coverImagePath ?? null,
    background_preset: value.backgroundPreset,
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
    updated_at: new Date().toISOString(),
  };
}

async function removeStoredCover(path: string | null) {
  if (!path || !storedCoverPath.safeParse(path).success) return;
  await createAdminClient().storage.from('event-covers').remove([path]);
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdmin();
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } }, { status: 401 });
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: event, error }, { data: fields }] = await Promise.all([
    supabase.from('events').select('*').eq('id', id).eq('created_by', user.id).single(),
    supabase.from('registration_fields').select('*').eq('event_id', id).order('sort_order'),
  ]);
  if (error || !event) return NextResponse.json({ error: { code: 'NOT_FOUND', message: '이벤트를 찾을 수 없습니다.' } }, { status: 404 });

  const { data: registrations } = await createAdminClient().from('registrations').select('status').eq('event_id', id);
  const registrationSummary = (registrations ?? []).reduce<Record<string, number>>((summary, registration) => {
    summary[registration.status] = (summary[registration.status] ?? 0) + 1;
    return summary;
  }, {});
  return NextResponse.json({ event, fields: fields ?? [], registrationSummary });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdmin();
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } }, { status: 401 });
  const { id } = await params;
  const supabase = await createClient();
  const { data: existing } = await supabase.from('events').select('*').eq('id', id).eq('created_by', user.id).single();
  if (!existing) return NextResponse.json({ error: { code: 'NOT_FOUND', message: '이벤트를 찾을 수 없습니다.' } }, { status: 404 });

  const body = await request.json();
  const parsed = eventSchema.safeParse({
    title: body.title ?? existing.title,
    description: body.description ?? existing.description,
    // The host identity belongs to the signed-in account, not to the browser
    // payload. Existing events retain their recorded host name.
    hostName: existing.host_name,
    coverImagePath: body.coverImagePath ?? existing.cover_image_path,
    backgroundPreset: body.backgroundPreset ?? existing.background_preset ?? 'galaxy',
    startAt: body.startAt ?? existing.start_at,
    endAt: body.endAt ?? existing.end_at,
    timezone: body.timezone ?? existing.timezone,
    locationType: body.locationType ?? existing.location_type,
    locationName: body.locationName ?? existing.location_name,
    locationUrl: body.locationUrl ?? existing.location_url,
    mapUrl: body.mapUrl ?? existing.map_url,
    registrationEnabled: body.registrationEnabled ?? existing.registration_enabled,
    registrationOpenAt: body.registrationOpenAt ?? existing.registration_open_at,
    registrationCloseAt: body.registrationCloseAt ?? existing.registration_close_at,
    capacity: body.capacity === undefined ? existing.capacity : body.capacity,
    approvalMode: body.approvalMode ?? existing.approval_mode,
    status: body.status ?? existing.status,
    fields: body.fields,
  });
  if (!parsed.success) return NextResponse.json({ error: { code: 'INVALID_INPUT', message: parsed.error.issues[0]?.message ?? '입력값을 확인해주세요.' } }, { status: 400 });

  const { data: event, error } = await supabase.from('events').update(toEventRow(parsed.data, existing.host_name)).eq('id', id).eq('created_by', user.id).select().single();
  if (error || !event) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error?.message ?? '이벤트를 저장하지 못했습니다.' } }, { status: 500 });

  if (body.fields !== undefined) {
    const { error: deleteFieldsError } = await supabase.from('registration_fields').delete().eq('event_id', id);
    if (deleteFieldsError) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: '신청 질문을 저장하지 못했습니다.' } }, { status: 500 });
    if (parsed.data.fields?.length) {
      const { error: insertFieldsError } = await supabase.from('registration_fields').insert(parsed.data.fields.map((field, index) => ({
        event_id: id,
        type: field.type,
        label: field.label,
        description: field.description ?? null,
        placeholder: field.placeholder ?? null,
        options: field.options ?? null,
        required: field.required,
        sort_order: field.sortOrder ?? index,
      })));
      if (insertFieldsError) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: '신청 질문을 저장하지 못했습니다.' } }, { status: 500 });
    }
  }

  if (existing.cover_image_path !== event.cover_image_path) await removeStoredCover(existing.cover_image_path);
  return NextResponse.json({ event });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdmin();
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } }, { status: 401 });
  const { id } = await params;
  const supabase = await createClient();
  const { data: existing } = await supabase.from('events').select('cover_image_path').eq('id', id).eq('created_by', user.id).maybeSingle();
  if (!existing) return NextResponse.json({ error: { code: 'NOT_FOUND', message: '이벤트를 찾을 수 없습니다.' } }, { status: 404 });
  const { error } = await supabase.from('events').delete().eq('id', id).eq('created_by', user.id);
  if (error) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  await removeStoredCover(existing.cover_image_path);
  return new NextResponse(null, { status: 204 });
}
