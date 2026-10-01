import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isUserAdmin } from '@/utils/supabase/queries';

const SUBMISSIONS_BUCKET = 'material-submissions';

export async function GET(
  _request: Request,
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

  try {
    const { id } = await params;
    const { data: submission, error: submissionError } = await supabase
      .from('material_submissions')
      .select('file_path, status')
      .eq('id', id)
      .maybeSingle();

    if (submissionError) throw submissionError;
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }
    if (submission.status === 'approved') {
      return NextResponse.json(
        { error: 'This submission has been published. View it from the materials library.' },
        { status: 410 },
      );
    }
    if (!submission.file_path) {
      return NextResponse.json({ error: 'This submission has no attached file' }, { status: 404 });
    }

    const { data: signedUrl, error: storageError } = await supabase.storage
      .from(SUBMISSIONS_BUCKET)
      .createSignedUrl(submission.file_path, 60);

    if (storageError || !signedUrl?.signedUrl) {
      console.error('Could not sign material submission file:', storageError);
      return NextResponse.json({ error: 'Could not open the submitted file' }, { status: 500 });
    }

    return NextResponse.redirect(signedUrl.signedUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}