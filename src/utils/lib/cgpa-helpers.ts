// Nigerian 5-point grading system
export const GRADE_POINTS: Record<string, number> = {
  A: 5.0,
  B: 4.0,
  C: 3.0,
  D: 2.0,
  E: 1.0,
  F: 0.0,
};

export const GRADE_RANGES: Record<string, string> = {
  A: "70-100",
  B: "60-69",
  C: "50-59",
  D: "45-49",
  E: "40-44",
  F: "0-39",
};

export interface Course {
  course_code: string;
  course_title: string;
  credit_units: number;
  grade: "A" | "B" | "C" | "D" | "E" | "F";
  grade_point?: number;
}

export interface Semester {
  id?: string;
  level: number;
  semester: number;
  session: string;
  courses: Course[];
  gpa?: number;
  total_credit_units?: number;
}

/**
 * Calculate grade point from letter grade
 */
export function getGradePoint(grade: string): number {
  return GRADE_POINTS[grade.toUpperCase()] || 0;
}

/**
 * Calculate GPA for a single semester
 */
export function calculateSemesterGPA(courses: Course[]): {
  gpa: number;
  totalPoints: number;
  totalUnits: number;
} {
  let totalPoints = 0;
  let totalUnits = 0;

  courses.forEach((course) => {
    const gradePoint = getGradePoint(course.grade);
    const units = Number(course.credit_units) || 0;
    totalPoints += gradePoint * units;
    totalUnits += units;
  });

  const gpa = totalUnits > 0 ? totalPoints / totalUnits : 0;

  return {
    gpa: Math.round(gpa * 100) / 100, // Round to 2 decimal places
    totalPoints,
    totalUnits,
  };
}

/**
 * Calculate cumulative GPA from multiple semesters (using pre-calculated semester GPAs)
 */
export function calculateCGPAFromSemesters(semesters: any[]): {
  cgpa: number;
  totalPoints: number;
  totalUnits: number;
} {
  let totalPoints = 0;
  let totalUnits = 0;

  semesters.forEach((semester) => {
    const gpa = semester.gpa || 0;
    const units = semester.total_credit_units || 0;
    if (gpa && units) {
      totalPoints += gpa * units;
      totalUnits += units;
    }
  });

  const cgpa = totalUnits > 0 ? totalPoints / totalUnits : 0;

  return {
    cgpa: Math.round(cgpa * 100) / 100,
    totalPoints,
    totalUnits,
  };
}

/**
 * Calculate cumulative GPA from multiple semesters (calculating from individual courses)
 */
export function calculateCGPAFromCourses(semesters: Semester[]): {
  cgpa: number;
  totalPoints: number;
  totalUnits: number;
} {
  let totalPoints = 0;
  let totalUnits = 0;

  semesters.forEach((semester) => {
    if (semester.courses && semester.courses.length > 0) {
      const semesterResult = calculateSemesterGPA(semester.courses);
      totalPoints += semesterResult.totalPoints;
      totalUnits += semesterResult.totalUnits;
    }
  });

  const cgpa = totalUnits > 0 ? totalPoints / totalUnits : 0;

  return {
    cgpa: Math.round(cgpa * 100) / 100,
    totalPoints,
    totalUnits,
  };
}

/**
 * Get class of degree based on CGPA
 */
export function getClassOfDegree(cgpa: number): string {
  if (cgpa >= 4.5) return "First Class";
  if (cgpa >= 3.5) return "Second Class Upper";
  if (cgpa >= 2.5) return "Second Class Lower";
  if (cgpa >= 1.5) return "Third Class";
  if (cgpa >= 1.0) return "Pass";
  return "Fail";
}

/**
 * Get color class for grade
 */
export function getGradeColor(grade: string): string {
  const colors: Record<string, string> = {
    A: "bg-green-100 text-green-700 border-green-200",
    B: "bg-blue-100 text-blue-700 border-blue-200",
    C: "bg-yellow-100 text-yellow-700 border-yellow-200",
    D: "bg-orange-100 text-orange-700 border-orange-200",
    E: "bg-red-100 text-red-700 border-red-200",
    F: "bg-red-200 text-red-800 border-red-300",
  };
  return colors[grade.toUpperCase()] || "bg-gray-100 text-gray-700";
}

/**
 * Get color for CGPA/GPA text
 */
export function getGPAColor(gpa: number): string {
  if (gpa >= 4.5) return "text-green-600";
  if (gpa >= 3.5) return "text-blue-600";
  if (gpa >= 2.5) return "text-yellow-600";
  if (gpa >= 1.5) return "text-orange-600";
  return "text-red-600";
}

/**
 * Get color for GPA badges
 */
export function getGPABadgeColor(gpa: number): string {
  if (gpa >= 4.5) return "bg-green-100 text-green-700 border-green-200";
  if (gpa >= 3.5) return "bg-blue-100 text-blue-700 border-blue-200";
  if (gpa >= 2.5) return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-red-100 text-red-700 border-red-200";
}

/**
 * Format session string
 */
export function formatSession(session: string): string {
  return session; // e.g., "2024/2025"
}

/**
 * Get semester name
 */
export function getSemesterName(semester: number): string {
  return semester === 1 ? "First Semester" : "Second Semester";
}

/**
 * Validate course data
 */
export function validateCourse(course: Partial<Course>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!course.course_code || course.course_code.trim() === "") {
    errors.push("Course code is required");
  }

  if (!course.course_title || course.course_title.trim() === "") {
    errors.push("Course title is required");
  }

  if (!course.credit_units || course.credit_units <= 0) {
    errors.push("Credit units must be greater than 0");
  }

  if (!course.grade || !["A", "B", "C", "D", "E", "F"].includes(course.grade)) {
    errors.push("Valid grade is required (A-F)");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
