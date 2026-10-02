import { z } from "zod";

/**
 * Shared signup contract.
 *
 * Used by both the client form (react-hook-form resolver) and the server route
 * so validation can never drift between the two. The client schema is never
 * trusted on its own — /api/auth/signup re-validates with the server schema.
 */
const baseFields = {
  full_name: z.string().trim().min(1, "Full name is required").max(100),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone_number: z.string().trim().min(1, "Phone number is required"),
  // Kept as a string in the form because the level dropdown emits "100"…"500".
  level: z.string().trim().min(1, "Level is required"),
  is_new_student: z.boolean().default(false),
  matric_number: z.string().trim().default(""),
  faculty_id: z.string().trim().min(1, "Faculty is required"),
  faculty: z.string().trim().default(""),
  department_id: z.string().trim().min(1, "Department is required"),
  department: z.string().trim().default(""),
};

function requireMatricWhenNotNewStudent(
  data: { is_new_student: boolean; matric_number: string },
  ctx: z.RefinementCtx,
) {
  if (!data.is_new_student && !data.matric_number) {
    ctx.addIssue({
      code: "custom",
      message: "Matric number is required",
      path: ["matric_number"],
    });
  }
}

/** Client-side form schema — adds the confirm-password field. */
export const signupFormSchema = z
  .object({
    ...baseFields,
    confirm_password: z.string().min(1, "Confirm password is required"),
  })
  .superRefine((data, ctx) => {
    requireMatricWhenNotNewStudent(data, ctx);

    if (data.password !== data.confirm_password) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirm_password"],
      });
    }
  });

/**
 * Server-side schema. `level` is coerced to a number here and matric is
 * normalised to null for new students, so the values written to `profiles`
 * match the invariants the rest of the app relies on.
 */
export const signupServerSchema = z
  .object(baseFields)
  .superRefine(requireMatricWhenNotNewStudent)
  .transform((data) => ({
    ...data,
    level: Number(data.level),
    matric_number: data.is_new_student ? null : data.matric_number || null,
    faculty: data.faculty || null,
    department: data.department || null,
  }));

export type SignupInput = z.output<typeof signupServerSchema>;
export type SignupFormValues = z.input<typeof signupFormSchema>;