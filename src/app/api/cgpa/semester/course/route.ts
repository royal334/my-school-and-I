import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient(await cookies());

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID required' },
        { status: 400 }
      );
    }

    // Get the course and verify ownership via semester
    const { data: course, error: courseError } = await supabase
      .from('semester_courses')
      .select('id, semester_id')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const { data: semester } = await supabase
      .from('semesters')
      .select('id, user_id')
      .eq('id', course.semester_id)
      .single();

    if (!semester || semester.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await supabase
      .from('semester_courses')
      .delete()
      .eq('id', courseId);

    // Load all remaining courses for this semester
    const { data: remaining } = await supabase
      .from('semester_courses')
      .select('grade_point, credit_units')
      .eq('semester_id', course.semester_id);

    let gpa = 0;
    let totalUnits = 0;
    if (remaining?.length) {
      let totalPoints = 0;
      remaining.forEach((c: { grade_point: number; credit_units: number }) => {
        totalPoints += c.grade_point * c.credit_units;
        totalUnits += c.credit_units;
      });
      gpa = totalUnits > 0 ? totalPoints / totalUnits : 0;
    }

    const { error: updateError } = await supabase
      .from('semesters')
      .update({
        gpa: Math.round(gpa * 100) / 100,
        total_credit_units: totalUnits,
      })
      .eq('id', course.semester_id)
      .eq('user_id', user.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update semester' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Course removed. GPA recalculated.',
    });
  } catch (error) {
    console.error('Delete course error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
