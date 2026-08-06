import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!supabaseUrl || !supabasePublishableKey) {
    return request.nextUrl.pathname.startsWith('/admin') ? NextResponse.redirect(new URL('/login', request.url)) : response;
  }
  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, { cookies: { getAll: () => request.cookies.getAll(), setAll(values: {name: string; value: string; options: CookieOptions}[]) { values.forEach(({name,value,options}) => { request.cookies.set(name,value); response.cookies.set(name,value,options); }); } } });
  await supabase.auth.getUser();
  if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/login') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.redirect(new URL('/login', request.url));
  }
  return response;
}
export const config = { matcher: ['/admin/:path*', '/login'] };
