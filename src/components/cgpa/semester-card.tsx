"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  getSemesterName,
  getGradeColor,
  getGPABadgeColor,
} from "@/utils/lib/cgpa-helpers";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SemesterCardProps {
  semester: {
    id: string;
    level: number;
    semester: number;
    session: string;
    gpa: number;
    total_credit_units: number;
    semester_courses: Array<{
      id: string;
      course_code: string;
      course_title: string;
      credit_units: number;
      grade: string;
      grade_point: number;
    }>;
  };
  onEdit?: (semesterId: string) => void;
  onDelete?: (semesterId: string) => void;
}


export default function SemesterCard({
  semester,
  onEdit,
  onDelete,
}: SemesterCardProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const gpaColor = getGPABadgeColor(semester.gpa);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">
                {semester.level} Level - {getSemesterName(semester.semester)}
              </h3>
              <Badge className={gpaColor}>GPA: {semester.gpa.toFixed(2)}</Badge>
            </div>
            <p className="text-sm text-slate-600">
              {semester.session} • {semester.total_credit_units} Credit Units
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(semester.id)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}

            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Semester?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this semester and all its
                      courses. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(semester.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-2 text-left font-medium text-slate-700">
                    Course Code
                  </th>
                  <th className="pb-2 text-left font-medium text-slate-700">
                    Course Title
                  </th>
                  <th className="pb-2 text-center font-medium text-slate-700">
                    Units
                  </th>
                  <th className="pb-2 text-center font-medium text-slate-700">
                    Grade
                  </th>
                  <th className="pb-2 text-center font-medium text-slate-700">
                    Points
                  </th>
                  <th className="pb-2 text-center font-medium text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {semester.semester_courses.map((course) => (
                  <tr
                    key={course.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-2 font-medium text-slate-900">
                      {course.course_code}
                    </td>
                    <td className="py-2 text-slate-700">
                      {course.course_title}
                    </td>
                    <td className="py-2 text-center text-slate-700">
                      {course.credit_units}
                    </td>
                    <td className="py-2 text-center">
                      <Badge className={getGradeColor(course.grade)}>
                        {course.grade}
                      </Badge>
                    </td>
                    <td className="py-2 text-center font-medium text-slate-900">
                      {course.grade_point.toFixed(1)}
                    </td>
                    <td className="py-2 text-center">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove this course?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove this course from the semester. GPA will be recalculated.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={async () => {
                                try {
                                  const res = await fetch("/api/cgpa/semester/course", {
                                    method: "DELETE",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ courseId: course.id }),
                                  });
                                  const data = await res.json();
                                  if (!res.ok) throw new Error(data.error || "Failed to remove course");
                                  toast.success("Course removed.");
                                  router.refresh();
                                } catch (err) {
                                  toast.error(err instanceof Error ? err.message : "Failed to remove course");
                                }
                              }}
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300">
                  <td
                    colSpan={2}
                    className="pt-2 text-right font-semibold text-slate-900"
                  >
                    Total:
                  </td>
                  <td className="pt-2 text-center font-bold text-slate-900">
                    {semester.total_credit_units}
                  </td>
                  <td className="pt-2 text-center font-bold text-primary-600">
                    GPA: {semester.gpa.toFixed(2)}
                  </td>
                  <td></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
