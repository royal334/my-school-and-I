import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import {
  RECOVERY_SESSION_COOKIE,
  RECOVERY_SESSION_MAX_AGE,
} from '@/utils/constants/constants';

const DEFAULT_REDIRECT = '/dashboard';

/**
 * Only same-origin, absolute-path redirects are allowed.
 * Rejects protocol-relative ("//evil.com"), backslash ("/\evil.com") and fully
 * qualified ("https://evil.com") values that `new URL(next, base)` would
 * otherwise happily turn into an off-site redirect.
 */
function resolveNext(next: string | null): string {
  if (!next) return DEFAULT_REDIRECT;
  if (!next.startsWith('/')) return DEFAULT_REDIRECT;
  if (next.startsWith('//')) return DEFAULT_REDIRECT;
  if (next.includes('\\')) return DEFAULT_REDIRECT;
  return next;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = resolveNext(requestUrl.searchParams.get('next'));
  const type = requestUrl.searchParams.get('type');

  if (code) {
    const supabase = createClient(await cookies());

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (type === 'recovery') {
        // This is a password reset, redirect to the update password page. The
        // marker cookie is what authorises that page to render, so it can only
        // be set by a genuinely verified recovery link.
        const response = NextResponse.redirect(
          new URL('/update-password', request.url),
        );

        response.cookies.set(RECOVERY_SESSION_COOKIE, '1', {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: RECOVERY_SESSION_MAX_AGE,
        });

        return response;
      }

      // Regular login, redirect to dashboard
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // If there's an error or no code, redirect to login
  return NextResponse.redirect(new URL('/login', request.url));
}