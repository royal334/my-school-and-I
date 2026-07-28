// app/api/announcements/[id]/read/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// POST /api/announcements/[id]/read - Mark announcement as read
export async function POST(request: Request,{ params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('announcement_reads')
      .upsert(
        {
          announcement_id: (await params).id,
          user_id: user.id,
          read_at: new Date().toISOString(),
        },
        { onConflict: 'announcement_id,user_id' }
      );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to mark as read' },
      { status: 500 }
    );
  }
}