import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function hasAccount(email: string) {
  const admin = createAdminClient();
  for (let page = 1; page <= 50; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    if (data.users.some(user => user.email?.toLowerCase() === email)) return true;
    if (data.users.length < 200) return false;
  }
  return false;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: unknown } | null;
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: { code: 'INVALID_EMAIL', message: '이메일 주소를 확인해주세요.' } }, { status: 400 });
  }

  try {
    if (!await hasAccount(email)) {
      return NextResponse.json({ error: { code: 'ACCOUNT_NOT_FOUND', message: '가입되지 않은 이메일입니다.' } }, { status: 404 });
    }

    const redirectTo = new URL('/auth/callback', request.url);
    redirectTo.searchParams.set('next', '/auth/reset-password');
    const { error } = await createAdminClient().auth.resetPasswordForEmail(email, { redirectTo: redirectTo.toString() });
    if (error) throw error;
    return NextResponse.json({ sent: true });
  } catch {
    return NextResponse.json({ error: { code: 'RESET_FAILED', message: '재설정 메일을 보내지 못했습니다. 잠시 후 다시 시도해주세요.' } }, { status: 500 });
  }
}
