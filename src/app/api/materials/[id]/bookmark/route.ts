// app/api/materials/[id]/bookmark/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabase
      .from('material_saves')
      .upsert(
        {
          material_id: id,
          user_id: user.id,
        },
        {
          onConflict: 'material_id,user_id',
          ignoreDuplicates: true,
        }
      );

    const { data: savedRows, error: savedError } = await supabase
      .from("material_saves")
      .select("material_id")
      .eq("user_id", user.id);

    if (savedError) throw savedError;

    if (error) throw error;

    return NextResponse.json({ success: true, saved: savedRows ?? [] });
  } catch (error: unknown) {
    console.error('Failed to save material bookmark:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabase
      .from('material_saves')
      .delete()
      .eq('material_id', id)
      .eq('user_id', user.id);

    const { data: savedRows, error: savedError } = await supabase
      .from("material_saves")
      .select("material_id")
      .eq("user_id", user.id);

    if (savedError) throw savedError;

    if (error) throw error;

    return NextResponse.json({ success: true, saved: savedRows ?? [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}