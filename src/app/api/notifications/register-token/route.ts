import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const token = typeof body.token === 'string' ? body.token.trim() : '';

    if (!token) {
      return NextResponse.json({ error: 'token is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('user_notification_tokens')
      .upsert(
        {
          user_id: user.id,
          device_token: token,
          device_type: 'web',
        },
        { onConflict: 'user_id,device_token' }
      );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Register token error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register token' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const token = typeof body.token === 'string' ? body.token.trim() : '';

    if (!token) {
      return NextResponse.json({ error: 'token is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('user_notification_tokens')
      .delete()
      .eq('user_id', user.id)
      .eq('device_token', token);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete token error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove token' },
      { status: 500 }
    );
  }
}
