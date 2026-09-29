// app/api/marketplace/listings/[id]/save/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// POST /api/marketplace/listings/[id]/save
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('marketplace_saves')
      .insert({ listing_id: id, user_id: user.id });

    // Ignore duplicate (already saved)
    if (error && error.code !== '23505') throw error;

    // Increment saves_count
    await supabase.rpc('increment_saves_count', { listing_id: id });

    return NextResponse.json({ success: true, saved: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/marketplace/listings/[id]/save
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await supabase
      .from('marketplace_saves')
      .delete()
      .eq('listing_id', id)
      .eq('user_id', user.id);

    // Decrement saves_count
    await supabase.rpc('decrement_saves_count', { listing_id: id });

    return NextResponse.json({ success: true, saved: false });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}