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
  title: "CGPA Calculator | EngiPortal",
};

export default async function CGPAPage() {


  const supabase = createClient(await cookies());

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Get all semesters for the user
  const semesters = await getUserSemesters(session.user.id);

  // Calculate CGPA
  const cgpaData =
    semesters && semesters.length > 0
      ? calculateCGPAFromSemesters(semesters)
      : { cgpa: 0, totalPoints: 0, totalUnits: 0 };

  // Get current semester GPA (most recent)
  const currentSemesterGPA =
    semesters && semesters.length > 0
      ? semesters[semesters.length - 1].gpa
      : null;


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CGPA Calculator</h1>
          <p className="text-slate-600">
            Track your academic performance and calculate your CGPA
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
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

        {!semesters || semesters.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto w-fit rounded-full bg-slate-100 p-4">
              <Calculator className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              No semesters added yet
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Start by adding your first semester results to calculate your CGPA
            </p>
            <Link href="/dashboard/cgpa/add-semester">
              <Button className="mt-4 bg-blue-500 cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                Add First Semester
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {semesters.map((semester) => (
              <SemesterCard
                key={semester.id}
                semester={semester}
                onEdit={(id) => console.log("Edit semester:", id)}
                onDelete={ (id) => console.log("Delete semester:", id) }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
