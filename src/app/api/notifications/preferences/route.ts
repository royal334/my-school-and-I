import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const preferenceKeys = [
  'announcement_notifications',
  'vendor_notifications',
  'marketplace_notifications',
  'accommodation_notifications',
  'platform_notifications',
] as const;

type PreferenceKey = (typeof preferenceKeys)[number];

export async function GET() {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ preferences: data || {} });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    return NextResponse.json({ error: 'Failed to load notification preferences' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as Record<string, unknown>;
    const updates = Object.fromEntries(
      preferenceKeys
        .filter((key) => typeof body[key] === 'boolean')
        .map((key) => [key, body[key]]),
    ) as Partial<Record<PreferenceKey, boolean>>;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid preferences supplied' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_notification_preferences')
      .upsert({ user_id: user.id, ...updates }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ preferences: data });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    return NextResponse.json({ error: 'Failed to update notification preferences' }, { status: 500 });
  }
}
