"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Calculator, Save } from "lucide-react";
import { toast } from "sonner";
import {
  calculateSemesterGPA,
  getGradePoint,
  GRADE_RANGES,
  getGradeColor,
} from "@/utils/lib/cgpa-helpers";
import axios from "axios";

// Define Zod schema
const courseSchema = z.object({
  course_code: z.string().min(1, "Course code is required"),
  course_title: z.string().min(1, "Course title is required"),
  credit_units: z.coerce
    .number()
    .min(1, "Units must be at least 1")
    .max(6, "Units cannot exceed 6"),
  grade: z.enum(["A", "B", "C", "D", "E", "F"]),
});

const semesterSchema = z.object({
  level: z.string().min(1, "Level is required"),
  semester: z.string().min(1, "Semester is required"),
  session: z
    .string()
    .min(1, "Session is required")
    .regex(/^\d{4}\/\d{4}$/, "Format must be YYYY/YYYY"),
  courses: z.array(courseSchema).min(1, "Add at least one course"),
});

type SemesterFormValues = z.infer<typeof semesterSchema>;

interface SemesterFormProps {
  existingSemester?: {
    id: string;
    level: number;
    semester: number;
    session: string;
    courses: Array<{
      course_code: string;
      course_title: string;
      credit_units: number;
      grade: "A" | "B" | "C" | "D" | "E" | "F";
    }>;
  };
}

export default function SemesterForm({ existingSemester }: SemesterFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Initialize RHF
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SemesterFormValues>({
    resolver: zodResolver(semesterSchema),
    defaultValues: {
      level: existingSemester?.level.toString() || "",
      semester: existingSemester?.semester.toString() || "",
      session: existingSemester?.session || "",
      courses: existingSemester?.courses || [
        {
          course_code: "",
          course_title: "",
          credit_units: 0,
          grade: "A",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "courses",
  });

  // Watch courses for live GPA calculation
  const watchedCourses = watch("courses") as any[];

  const { gpa, totalUnits } = useMemo(() => {
    const validCourses = watchedCourses.filter(
      (c) => c.course_code && Number(c.credit_units) > 0,
    );
    return calculateSemesterGPA(validCourses as any);
  }, [watchedCourses]);

  const onSubmit = async (values: SemesterFormValues) => {
    setLoading(true);

    try {
      // Prepare data
      const semesterData = {
        level: parseInt(values.level),
        semester: parseInt(values.semester),
        session: values.session,
        courses: values.courses.map((course) => ({
          ...course,
          grade_point: getGradePoint(course.grade),
        })),
      };

      // API call
      const response = await fetch("/api/cgpa/semesters", {
        method: existingSemester ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...semesterData,
          semesterId: existingSemester?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save semester");
      }

      toast.success(
        existingSemester
          ? "Semester updated successfully!"
          : "Semester added successfully!",
      );
      router.push("/dashboard/cgpa");
      router.refresh();
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save semester");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Semester Information */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Semester Information</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Level */}
            <div className="space-y-2">
              <Label
                htmlFor="level"
                className={errors.level ? "text-red-500" : ""}
              >
                Level <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="level"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className={`relative z-50 pointer-events-auto bg-white ${errors.level ? "border-red-500" : ""}`}
                    >
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100 Level</SelectItem>
                      <SelectItem value="200">200 Level</SelectItem>
                      <SelectItem value="300">300 Level</SelectItem>
                      <SelectItem value="400">400 Level</SelectItem>
                      <SelectItem value="500">500 Level</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.level && (
                <p className="text-xs text-red-500">{errors.level.message}</p>
              )}
            </div>

            {/* Semester */}
            <div className="space-y-2">
              <Label
                htmlFor="semester"
                className={errors.semester ? "text-red-500" : ""}
              >
                Semester <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="semester"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className={`relative z-50 pointer-events-auto bg-white ${errors.semester ? "border-red-500" : ""}`}
                    >
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">First Semester</SelectItem>
                      <SelectItem value="2">Second Semester</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.semester && (
                <p className="text-xs text-red-500">
                  {errors.semester.message}
                </p>
              )}
            </div>

            {/* Session */}
            <div className="space-y-2">
              <Label
                htmlFor="session"
                className={errors.session ? "text-red-500" : ""}
              >
                Session <span className="text-red-500">*</span>
              </Label>
              <Input
                id="session"
                placeholder="e.g., 2024/2025"
                {...register("session")}
                className={`relative z-50 pointer-events-auto bg-white ${errors.session ? "border-red-500" : ""}`}
              />
              <p className="text-xs text-slate-500">Format: YYYY/YYYY</p>
              {errors.session && (
                <p className="text-xs text-red-500">{errors.session.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Courses & Grades</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  course_code: "",
                  course_title: "",
                  credit_units: 0,
                  grade: "A",
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-2 text-left text-sm font-medium text-slate-700">
                      Course Code
                    </th>
                    <th className="pb-2 text-left text-sm font-medium text-slate-700">
                      Course Title
                    </th>
                    <th className="pb-2 text-center text-sm font-medium text-slate-700">
                      Units
                    </th>
                    <th className="pb-2 text-center text-sm font-medium text-slate-700">
                      Grade
                    </th>
                    <th className="pb-2 text-center text-sm font-medium text-slate-700">
                      Points
                    </th>
                    <th className="pb-2 text-center text-sm font-medium text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <tr key={field.id} className="border-b border-slate-100">
                      <td className="py-2">
                        <Input
                          placeholder="ENG201"
                          {...register(`courses.${index}.course_code`)}
                          className={`relative z-50 pointer-events-auto w-28 bg-white ${
                            errors.courses?.[index]?.course_code
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                      </td>
                      <td className="py-2">
                        <Input
                          placeholder="Course name"
                          {...register(`courses.${index}.course_title`)}
                          className={`relative z-50 pointer-events-auto bg-white ${
                            errors.courses?.[index]?.course_title
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                      </td>
                      <td className="py-2 text-center">
                        <Input
                          type="number"
                          {...register(`courses.${index}.credit_units`, {
                            valueAsNumber: true,
                          })}
                          className={`relative z-50 pointer-events-auto w-16 mx-auto text-center bg-white ${
                            errors.courses?.[index]?.credit_units
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                      </td>
                      <td className="py-2 text-center">
                        <Controller
                          name={`courses.${index}.grade`}
                          control={control}
                          render={({ field: subField }) => (
                            <Select
                              onValueChange={subField.onChange}
                              value={subField.value}
                            >
                              <SelectTrigger className="relative z-50 pointer-events-auto w-20 mx-auto bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(GRADE_RANGES).map(
                                  ([grade, range]) => (
                                    <SelectItem key={grade} value={grade}>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">
                                          {grade}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                          ({range})
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ),
                                )}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </td>
                      <td className="py-2 text-center">
                        <Badge
                          className={getGradeColor(
                            watchedCourses[index]?.grade,
                          )}
                        >
                          {getGradePoint(watchedCourses[index]?.grade).toFixed(
                            1,
                          )}
                        </Badge>
                      </td>
                      <td className="py-2 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="space-y-4 md:hidden">
              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        Course {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label
                        className={`text-xs ${errors.courses?.[index]?.course_code ? "text-red-500" : ""}`}
                      >
                        Course Code
                      </Label>
                      <Input
                        placeholder="ENG201"
                        {...register(`courses.${index}.course_code`)}
                        className={`relative z-50 pointer-events-auto bg-white ${
                          errors.courses?.[index]?.course_code
                            ? "border-red-500"
                            : ""
                        }`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        className={`text-xs ${errors.courses?.[index]?.course_title ? "text-red-500" : ""}`}
                      >
                        Course Title
                      </Label>
                      <Input
                        placeholder="Course name"
                        {...register(`courses.${index}.course_title`)}
                        className={`relative z-50 pointer-events-auto bg-white ${
                          errors.courses?.[index]?.course_title
                            ? "border-red-500"
                            : ""
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label
                          className={`text-xs ${errors.courses?.[index]?.credit_units ? "text-red-500" : ""}`}
                        >
                          Units
                        </Label>
                        <Input
                          type="number"
                          {...register(`courses.${index}.credit_units`, {
                            valueAsNumber: true,
                          })}
                          className={`relative z-50 pointer-events-auto bg-white ${
                            errors.courses?.[index]?.credit_units
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Grade</Label>
                        <Controller
                          name={`courses.${index}.grade`}
                          control={control}
                          render={({ field: subField }) => (
                            <Select
                              onValueChange={subField.onChange}
                              value={subField.value}
                            >
                              <SelectTrigger className="relative z-50 pointer-events-auto bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(GRADE_RANGES).map(
                                  ([grade, range]) => (
                                    <SelectItem key={grade} value={grade}>
                                      {grade} ({range})
                                    </SelectItem>
                                  ),
                                )}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-slate-600">
                        Grade Points:
                      </span>
                      <Badge
                        className={getGradeColor(watchedCourses[index]?.grade)}
                      >
                        {getGradePoint(watchedCourses[index]?.grade).toFixed(1)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() =>
                  append({
                    course_code: "",
                    course_title: "",
                    credit_units: 0,
                    grade: "A",
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another Course
              </Button>
            </div>
            {errors.courses && (
              <p className="text-sm text-red-500">{errors.courses.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live GPA Calculator */}
      <Card className="border-primary-200 bg-primary-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary-100 p-3">
                <Calculator className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-primary-900">
                  Calculated GPA
                </h3>
                <p className="text-xs text-primary-700">
                  Based on {totalUnits} credit units
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-900">
                {gpa.toFixed(2)}
              </div>
              <div className="text-xs text-primary-700">out of 5.0</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {existingSemester ? "Update Semester" : "Save Semester"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
