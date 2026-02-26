import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getGradePoint } from '@/utils/lib/cgpa-helpers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(await cookies());

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { level, semester, session: academicSession, courses } = await request.json();

    // Validation
    if (!level || !semester || !academicSession || !courses || courses.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate GPA
    let totalPoints = 0;
    let totalUnits = 0;

    courses.forEach((course: any) => {
      const gradePoint = getGradePoint(course.grade);
      totalPoints += gradePoint * course.credit_units;
      totalUnits += course.credit_units;
    });

    const gpa = totalUnits > 0 ? totalPoints / totalUnits : 0;

    // Create semester record
    const { data: semesterData, error: semesterError } = await supabase
      .from('semesters')
      .insert({
        user_id: session.user.id,
        level,
        semester,
        session: academicSession,
        gpa: Math.round(gpa * 100) / 100,
        total_credit_units: totalUnits,
      })
      .select()
      .single();

    if (semesterError) {
      console.error('Semester error:', semesterError);
      return NextResponse.json(
        { error: 'Failed to create semester record' },
        { status: 500 }
      );
    }

    // Create course records
    const courseRecords = courses.map((course: any) => ({
      semester_id: semesterData.id,
      course_code: course.course_code,
      course_title: course.course_title,
      credit_units: course.credit_units,
      grade: course.grade,
      grade_point: getGradePoint(course.grade),
    }));

    const { error: coursesError } = await supabase
      .from('semester_courses')
      .insert(courseRecords);

    if (coursesError) {
      console.error('Courses error:', coursesError);
      // Rollback semester creation
      await supabase.from('semesters').delete().eq('id', semesterData.id);
      return NextResponse.json(
        { error: 'Failed to save courses' },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: session.user.id,
      action: 'semester_added',
      resource_type: 'semester',
      resource_id: semesterData.id,
      metadata: {
        level,
        semester,
        session: academicSession,
        gpa,
        courses_count: courses.length,
      },
    });

    return NextResponse.json({
      success: true,
      semester: semesterData,
      message: 'Semester added successfully!',
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient(await cookies());

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      semesterId,
      level,
      semester,
      session: academicSession,
      courses,
    } = await request.json();

    if (!semesterId) {
      return NextResponse.json(
        { error: 'Semester ID required' },
        { status: 400 }
      );
    }

    // Calculate new GPA
    let totalPoints = 0;
    let totalUnits = 0;

    courses.forEach((course: any) => {
      const gradePoint = getGradePoint(course.grade);
      totalPoints += gradePoint * course.credit_units;
      totalUnits += course.credit_units;
    });

    const gpa = totalUnits > 0 ? totalPoints / totalUnits : 0;

    // Update semester
    const { error: semesterError } = await supabase
      .from('semesters')
      .update({
        level,
        semester,
        session: academicSession,
        gpa: Math.round(gpa * 100) / 100,
        total_credit_units: totalUnits,
      })
      .eq('id', semesterId)
      .eq('user_id', session.user.id);

    if (semesterError) {
      return NextResponse.json(
        { error: 'Failed to update semester' },
        { status: 500 }
      );
    }

    // Delete old courses
    await supabase.from('semester_courses').delete().eq('semester_id', semesterId);

    // Insert new courses
    const courseRecords = courses.map((course: any) => ({
      semester_id: semesterId,
      course_code: course.course_code,
      course_title: course.course_title,
      credit_units: course.credit_units,
      grade: course.grade,
      grade_point: getGradePoint(course.grade),
    }));

    const { error: coursesError } = await supabase
      .from('semester_courses')
      .insert(courseRecords);

    if (coursesError) {
      return NextResponse.json(
        { error: 'Failed to update courses' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Semester updated successfully!',
    });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}