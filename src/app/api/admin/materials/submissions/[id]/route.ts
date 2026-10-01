// app/api/admin/materials/submissions/[id]/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';
import { isUserAdmin } from '@/utils/supabase/queries';
import { generateUniqueFileName } from '@/utils/lib';
import { MATERIAL_TYPES } from '@/utils/constants/constants';

const SUBMISSIONS_BUCKET = 'material-submissions';
const MATERIALS_BUCKET = 'materials';

const VALID_LEVELS = new Set([100, 200, 300, 400, 500]);
const VALID_SEMESTERS = new Set([1, 2]);
const VALID_TYPES = new Set<string>(MATERIAL_TYPES);

/** Finds the course a submission belongs to, creating it when the codebook lacks it. */
async function resolveCourseId(
  supabase: SupabaseClient,
  courseCode: string,
  courseTitle: string,
  level: number,
  semester: number,
  creditUnits: number,
): Promise<string> {
  const code = courseCode.trim().toUpperCase();

  const { data: existing } = await supabase
    .from('courses')
    .select('id')
    .eq('course_code', code)
    .eq('level', level)
    .eq('semester', semester)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from('courses')
    .insert({
      course_code: code,
      course_title: courseTitle.trim(),
      level,
      semester,
      credit_units: creditUnits,
    })
    .select('id')
    .single();

  if (error) throw error;
  return created.id;
}

// PATCH /api/admin/materials/submissions/:id
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(await isUserAdmin(user.id, supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const action = body.action;
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'Action must be "approve" or "reject"' }, { status: 400 });
  }

  try {
    const { data: submission, error: loadError } = await supabase
      .from('material_submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (loadError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (submission.status !== 'pending') {
      return NextResponse.json(
        { error: `This submission was already ${submission.status}` },
        { status: 409 },
      );
    }

    const reviewedAt = new Date().toISOString();

    if (action === 'reject') {
      const reason = typeof body.rejectionReason === 'string' ? body.rejectionReason.trim() : '';

      if (!reason) {
        return NextResponse.json(
          { error: 'A reason is required when rejecting a submission' },
          { status: 400 },
        );
      }

      const { data: rejected, error: rejectError } = await supabase
        .from('material_submissions')
        .update({
          status: 'rejected',
          reviewed_at: reviewedAt,
          reviewed_by: user.id,
          rejection_reason: reason,
        })
        .eq('id', id)
        .select()
        .single();

      if (rejectError) throw rejectError;

      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'material_submission_rejected',
        resource_type: 'material_submission',
        resource_id: id,
        metadata: { title: submission.title, reason },
      });

      return NextResponse.json({ success: true, submission: rejected });
    }

    // --- approve ---------------------------------------------------------
    const courseCode = typeof body.courseCode === 'string' ? body.courseCode.trim() : '';
    const courseTitle = typeof body.courseTitle === 'string' ? body.courseTitle.trim() : '';
    const level = Number(body.level);
    const semester = Number(body.semester);
    const creditUnits = Number(body.creditUnits);
    const type = typeof body.type === 'string' ? body.type : '';
    const isPremium = Boolean(body.isPremium);
    const description =
      typeof body.description === 'string' && body.description.trim()
        ? body.description.trim()
        : null;

    if (!courseCode || !courseTitle) {
      return NextResponse.json(
        { error: 'Course code and course title are required' },
        { status: 400 },
      );
    }
    if (!VALID_LEVELS.has(level) || !VALID_SEMESTERS.has(semester)) {
      return NextResponse.json({ error: 'Level or semester is invalid' }, { status: 400 });
    }
    if (!Number.isSafeInteger(creditUnits) || creditUnits <= 0) {
      return NextResponse.json({ error: 'Credit units must be a positive whole number' }, { status: 400 });
    }
    if (!VALID_TYPES.has(type)) {
      return NextResponse.json({ error: 'Material type is invalid' }, { status: 400 });
    }
    if (!submission.file_path || !submission.file_name) {
      return NextResponse.json(
        { error: 'This submission has no attached file' },
        { status: 400 },
      );
    }

    const courseId = await resolveCourseId(
      supabase,
      courseCode,
      courseTitle,
      level,
      semester,
      creditUnits,
    );

    // Supabase can only move objects within one bucket, so read the staged file
    // out of the submissions bucket and write it into the library bucket.
    const destination = `materials/${courseId}/${generateUniqueFileName(submission.file_name)}`;
    const { data: blob, error: downloadError } = await supabase.storage
      .from(SUBMISSIONS_BUCKET)
      .download(submission.file_path);

    if (downloadError || !blob) {
      return NextResponse.json(
        { error: 'Could not read the submitted file from storage' },
        { status: 500 },
      );
    }

    const { error: uploadError } = await supabase.storage
      .from(MATERIALS_BUCKET)
      .upload(destination, blob, {
        contentType: 'application/pdf',
        upsert: false,
        cacheControl: '3600',
      });

    if (uploadError) throw uploadError;

    // Past this point any failure has to take the copied object back out.
    const rollbackStorage = () => supabase.storage.from(MATERIALS_BUCKET).remove([destination]);

    const { data: material, error: insertError } = await supabase
      .from('materials')
      .insert({
        course_id: courseId,
        title: submission.title,
        type,
        description,
        file_path: destination,
        file_size_bytes: submission.file_size,
        file_name: submission.file_name,
        uploaded_by: submission.user_id,
        is_premium: isPremium,
        is_approved: true,
        approved_by: user.id,
        approved_at: reviewedAt,
      })
      .select()
      .single();

    if (insertError) {
      await rollbackStorage();
      throw insertError;
    }

    const { data: approved, error: approveError } = await supabase
      .from('material_submissions')
      .update({
        status: 'approved',
        reviewed_at: reviewedAt,
        reviewed_by: user.id,
        rejection_reason: null,
      })
      .eq('id', id)
      .select()
      .single();

    if (approveError) {
      await rollbackStorage();
      await supabase.from('materials').delete().eq('id', material.id);
      throw approveError;
    }

    // The live copy is in place, so drop the staging copy.
    await supabase.storage.from(SUBMISSIONS_BUCKET).remove([submission.file_path]);

    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'material_submission_approved',
      resource_type: 'material_submission',
      resource_id: id,
      metadata: { material_id: material.id, course_id: courseId, title: submission.title },
    });

    return NextResponse.json({ success: true, submission: approved, material });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    console.error('Error processing material submission:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
