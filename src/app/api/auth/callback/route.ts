import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    const supabase = createClient(await cookies());
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Redirect to the password update page or dashboard
      const type = requestUrl.searchParams.get('type');
      
      if (type === 'recovery') {
        // This is a password reset, redirect to update password page
        return NextResponse.redirect(new URL('/update-password', request.url));
      }
      
      // Regular login, redirect to dashboard
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // If there's an error or no code, redirect to login
  return NextResponse.redirect(new URL('/login', request.url));
}