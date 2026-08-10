import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { eventSchema } from '@/lib/validations';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAdmin()) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } }, { status: 401 });
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: event, error }, { data: fields }] = await Promise.all([
    supabase.from('events').select('*').eq('id', id).single(),
    supabase.from('registration_fields').select('*').eq('event_id', id).order('sort_order'),
  ]);
  if (error || !event) return NextResponse.json({ error: { code: 'NOT_FOUND', message: '이벤트를 찾을 수 없습니다.' } }, { status: 404 });
  const admin = createAdminClient();
  const { data: registrations } = await admin.from('registrations').select('status').eq('event_id', id);
  const summary = (registrations ?? []).reduce((acc, registration) => ({ ...acc, [registration.status]: (acc[registration.status] ?? 0) + 1 }), {} as Record<string, number>);
  return NextResponse.json({ event, fields: fields ?? [], registrationSummary: summary });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAdmin()) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } }, { status: 401 });
  const { id } = await params;
  const supabase = await createClient();
  const { data: existing } = await supabase.from('events').select('*').eq('id', id).single();
  if (!existing) return NextResponse.json({ error: { code: 'NOT_FOUND', message: '이벤트를 찾을 수 없습니다.' } }, { status: 404 });

  const body = await request.json();
  const merged = {
    title: body.title ?? existing.title,
    description: body.description ?? existing.description,
    hostName: body.hostName ?? existing.host_name,
    coverImagePath: body.coverImagePath ?? existing.cover_image_path,
    backgroundPreset: body.backgroundPreset ?? existing.background_preset ?? 'plain',
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
  };
  const parsed = eventSchema.safeParse(merged);
  if (!parsed.success) return NextResponse.json({ error: { code: 'INVALID_INPUT', message: parsed.error.issues[0]?.message ?? '입력값을 확인해주세요.' } }, { status: 400 });

  const row = {
    title: parsed.data.title,
    description: parsed.data.description,
    cover_image_path: parsed.data.coverImagePath ?? null,
    background_preset: parsed.data.backgroundPreset,
    host_name: parsed.data.hostName,
    start_at: parsed.data.startAt,
    end_at: parsed.data.endAt,
    timezone: parsed.data.timezone,
    location_type: parsed.data.locationType,
    location_name: parsed.data.locationName ?? null,
    location_url: parsed.data.locationUrl ?? null,
    map_url: parsed.data.mapUrl ?? null,
    registration_enabled: parsed.data.registrationEnabled,
    registration_open_at: parsed.data.registrationOpenAt ?? null,
    registration_close_at: parsed.data.registrationCloseAt ?? null,
    capacity: parsed.data.capacity ?? null,
    approval_mode: parsed.data.approvalMode,
    status: parsed.data.status,
    updated_at: new Date().toISOString(),
  };
  const { data: event, error } = await supabase.from('events').update(row).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });

  if (body.fields !== undefined) {
    await supabase.from('registration_fields').delete().eq('event_id', id);
    if (parsed.data.fields?.length) {
      await supabase.from('registration_fields').insert(parsed.data.fields.map((field, index) => ({
        event_id: id,
        type: field.type,
        label: field.label,
        description: field.description ?? null,
        placeholder: field.placeholder ?? null,
        options: field.options ?? null,
        required: field.required,
        sort_order: field.sortOrder ?? index,
      })));
    }
  }
  return NextResponse.json({ event });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAdmin()) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } }, { status: 401 });
  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
