import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(await cookies());

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete semester (courses will be deleted via CASCADE)
    const { error } = await supabase
      .from('semesters')
      .delete()
      .eq('id', params.id)
      .eq('user_id', session.user.id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete semester' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Semester deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}