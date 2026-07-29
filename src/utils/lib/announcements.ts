// src/lib/announcements/scopes.ts
export function getAllowedScopes(role: string | null | undefined): string[] {
  const normalizedRole = role?.toLowerCase().trim();

  switch (normalizedRole) {
    case 'super_admin':
    case 'admin':
      return ['general', 'faculty', 'department', 'level'];

    case 'faculty_president':
      return ['faculty', 'department', 'level'];

    case 'departmental_president':
    case 'department_admin':
      return ['department', 'level'];

    case 'course_rep':
    case 'student_union_rep':
      return ['level'];

    default:
      return [];
  }
}