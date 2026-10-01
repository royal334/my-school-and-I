import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SemesterForm from '@/components/cgpa/semester-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Add Semester | Campus&Me',
};

export default async function AddSemesterPage() {
  const supabase = createClient( await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/cgpa">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to CGPA
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl" style={{ fontFamily: "var(--font-display)" }}>Add semester results</h1>
        <p className="text-muted-foreground">
          Enter your course grades to calculate your semester GPA
        </p>
      </div>

      {/* Form */}
      <SemesterForm />
    </div>
  );
}