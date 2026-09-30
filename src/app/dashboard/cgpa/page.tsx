import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserSemesters } from "@/utils/supabase/queries";
import { calculateCGPAFromSemesters } from "@/utils/lib/cgpa-helpers";
import CGPASummary from "@/components/cgpa/cgpa-summary";
import SemesterCard from "@/components/cgpa/semester-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Calculator, FileDown } from "lucide-react";
import Link from "next/link";
// import { useRouter } from 'next/navigation';
// import { toast } from 'sonner';

export const metadata = {
  title: "CGPA Calculator | CampusHub",
};

export default async function CGPAPage() {


  const supabase = createClient(await cookies());

  const {
    data: { user},
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get all semesters for the user
  const semesters = await getUserSemesters(user.id, supabase);

  // Only show semesters that have at least one course
  const semestersWithCourses =
    semesters?.filter(
      (s: any) => s.semester_courses && s.semester_courses.length > 0
    ) ?? [];

  // Calculate CGPA from semesters that have courses
  const cgpaData =
    semestersWithCourses.length > 0
      ? calculateCGPAFromSemesters(semestersWithCourses)
      : { cgpa: 0, totalPoints: 0, totalUnits: 0 };

  // Get current semester GPA (most recent semester that has courses)
  const currentSemesterGPA =
    semestersWithCourses.length > 0
      ? semestersWithCourses[semestersWithCourses.length - 1].gpa
      : null;


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>CGPA calculator</h1>
          <p className="text-muted-foreground">
            Track your academic performance and calculate your CGPA
          </p>
        </div>
        <div className="flex justify-end md:justify-start gap-3">
          {/* <Button variant="outline" size="sm">
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button> */}
          <Link href="/dashboard/cgpa/add-semester">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Semester
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <CGPASummary
        currentSemesterGPA={currentSemesterGPA}
        cumulativeCGPA={cgpaData.cgpa}
        totalCreditUnits={cgpaData.totalUnits}
      />

      {/* Semesters List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Academic Records</h2>

        {semestersWithCourses.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto w-fit rounded-full bg-muted p-4 dark:bg-muted">
              <Calculator className="h-8 w-8 text-muted-foreground dark:text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              No semesters added yet
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Start by adding your first semester results to calculate your CGPA
            </p>
            <Link href="/dashboard/cgpa/add-semester">
              <Button className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                Add First Semester
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {semestersWithCourses.map((semester: any) => (
              <SemesterCard
                key={semester.id}
                semester={semester}
                // onEdit={(id) => console.log("Edit semester:", id)}
                // onDelete={ (id) => console.log("Delete semester:", id) }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
