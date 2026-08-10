import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const uploadPathSchema = z.string().regex(/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.webp$/i, '잘못된 이미지 경로입니다.');

async function requireExistingEvent(eventId: string) {
  const parsed = z.string().uuid().safeParse(eventId);
  if (!parsed.success) return null;
  const admin = createAdminClient();
  const { data } = await admin.from('events').select('id').eq('id', parsed.data).maybeSingle();
  return data ? parsed.data : null;
}

export async function POST(request: Request) {
  if (!await getAdmin()) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } }, { status: 401 });

  const form = await request.formData();
  const file = form.get('file');
  const eventId = form.get('eventId');
  if (!(file instanceof File) || typeof eventId !== 'string') return NextResponse.json({ error: { code: 'INVALID_INPUT', message: '이미지와 이벤트를 확인해주세요.' } }, { status: 400 });
  if (!(await requireExistingEvent(eventId))) return NextResponse.json({ error: { code: 'NOT_FOUND', message: '이벤트를 찾을 수 없습니다.' } }, { status: 404 });
  if (file.type !== 'image/webp' || file.size > 2 * 1024 * 1024) return NextResponse.json({ error: { code: 'INVALID_INPUT', message: '2MB 이하의 WebP 이미지만 업로드할 수 있습니다.' } }, { status: 400 });

  const path = `${eventId}/${crypto.randomUUID()}.webp`;
  const admin = createAdminClient();
  const { error } = await admin.storage.from('event-covers').upload(path, file, { contentType: 'image/webp', upsert: false });
  if (error) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  const { data } = admin.storage.from('event-covers').getPublicUrl(path);
  return NextResponse.json({ path, publicUrl: data.publicUrl }, { status: 201 });
}

export async function DELETE(request: Request) {
  if (!await getAdmin()) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } }, { status: 401 });
  const url = new URL(request.url);
  const eventId = url.searchParams.get('eventId') ?? '';
  const path = url.searchParams.get('path') ?? '';
  if (!(await requireExistingEvent(eventId)) || !uploadPathSchema.safeParse(path).success || !path.startsWith(`${eventId}/`)) return NextResponse.json({ error: { code: 'INVALID_INPUT', message: '이미지 경로를 확인해주세요.' } }, { status: 400 });

  const { error } = await createAdminClient().storage.from('event-covers').remove([path]);
  if (error) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
