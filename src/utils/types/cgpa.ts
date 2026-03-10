import * as z from "zod";

export const courseSchema = z.object({
  course_code: z.string().min(1, "Course code is required"),
  course_title: z.string().min(1, "Course title is required"),
  credit_units: z
    .number()
    .min(1, "Units must be at least 1")
    .max(6, "Units cannot exceed 6"),
  grade: z.enum(["A", "B", "C", "D", "E", "F"]),
});

export const semesterSchema = z.object({
  level: z.string().min(1, "Level is required"),
  semester: z.string().min(1, "Semester is required"),
  session: z
    .string()
    .min(1, "Session is required")
    .regex(/^\d{4}\/\d{4}$/, "Format must be YYYY/YYYY"),
  courses: z.array(courseSchema).min(1, "Add at least one course"),
});

export type SemesterFormValues = z.infer<typeof semesterSchema>;

export interface SemesterFormProps {
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

export interface SemesterCardProps {
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

export interface CGPASummaryProps {
  currentSemesterGPA: number | null;
  cumulativeCGPA: number;
  totalCreditUnits: number;
}
