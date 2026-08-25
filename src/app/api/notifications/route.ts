import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const unreadOnly = searchParams.get('unread_only') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let query = supabase
      .from('notifications_sent')
      .select('*, notification_type:notification_types(type_key)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    if (type && type !== 'all') {
      const { data: typeRow } = await supabase
        .from('notification_types')
        .select('id')
        .eq('type_key', type)
        .maybeSingle();

      if (typeRow) {
        query = query.eq('notification_type_id', typeRow.id);
      }
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`);
    }

    const { data: notifications, error } = await query;

    if (error) throw error;

    const { count: totalUnread } = await supabase
      .from('notifications_sent')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    return NextResponse.json({
      notifications: notifications || [],
      total_unread: totalUnread || 0,
    });
  } catch (error: unknown) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
