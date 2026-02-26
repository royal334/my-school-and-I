import * as z from "zod";

const courseSchema = z.object({
  course_code: z.string().min(1, "Course code is required"),
  course_title: z.string().min(1, "Course title is required"),
  credit_units: z.coerce
    .number()
    .min(1, "Units must be at least 1")
    .max(6, "Units cannot exceed 6"),
  grade: z.enum(["A", "B", "C", "D", "E", "F"]),
});

type CourseValues = z.infer<typeof courseSchema>;

const test: CourseValues = {
  course_code: "ENG101",
  course_title: "Introduction",
  credit_units: 3, // This should be a number
  grade: "A",
};

console.log(typeof test.credit_units);
