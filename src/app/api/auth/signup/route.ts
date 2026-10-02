import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getCachedFacultiesDepartments } from "@/utils/cache";
import { signupServerSchema } from "@/lib/validations/signup";

/**
 * Columns that the deployed schema is not guaranteed to have. If PostgREST
 * rejects one, we drop it and retry rather than losing the whole profile.
 * `faculty_id` / `department_id` are deliberately NOT here — those are read by
 * announcement scoping (utils/cache/announcements.ts) and are required.
 */
const OPTIONAL_COLUMNS = ["is_new_student"] as const;

function isUndefinedColumnError(error: { code?: string; message: string }) {
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    /column .* does not exist|unknown column/i.test(error.message)
  );
}

export async function POST(request: Request) {
  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = signupServerSchema.safeParse(rawBody);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid signup details";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const input = parsed.data;
  const supabase = createClient(await cookies());
  const admin = createAdminClient();

  try {
    // Verify the faculty/department pair exists and belongs together, so a
    // tampered payload cannot store a mismatched scope on the profile.
    const { faculties, departments } = await getCachedFacultiesDepartments();
    const faculty = faculties.find((f) => f.id === input.faculty_id);
    const department = departments.find((d) => d.id === input.department_id);

    if (!faculty || !department) {
      return NextResponse.json(
        { error: "Select a valid faculty and department" },
        { status: 400 },
      );
    }

    if (department.faculty_id !== faculty.id) {
      return NextResponse.json(
        { error: "Department does not belong to the selected faculty" },
        { status: 400 },
      );
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/api/auth/callback`,
        data: {
          full_name: input.full_name,
          phone_number: input.phone_number,
          matric_number: input.matric_number,
          is_new_student: input.is_new_student,
          level: input.level,
          department: department.name,
          faculty: faculty.name,
          faculty_id: faculty.id,
          department_id: department.id,
        },
      },
    });

    if (authError) {
      if (/already (registered|exists)/i.test(authError.message)) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 409 },
        );
      }

      console.error("Signup auth error:", authError);
      return NextResponse.json(
        { error: authError.message || "Failed to create account" },
        { status: 400 },
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 },
      );
    }

    // Written with the service-role client: at this point the new user has no
    // session yet (email confirmation is enabled), so the anon key would be
    // rejected by RLS.
    const payload: Record<string, unknown> = {
      id: authData.user.id,
      email: input.email,
      full_name: input.full_name,
      phone_number: input.phone_number,
      matric_number: input.matric_number,
      level: input.level,
      faculty_id: faculty.id,
      department_id: department.id,
      is_new_student: input.is_new_student,
    };

    let profileError: { code?: string; message: string } | null = null;
    const dropped: string[] = [];

    for (;;) {
      const { error } = await admin
        .from("profiles")
        .upsert(payload, { onConflict: "id" });

      if (!error) {
        profileError = null;
        break;
      }

      profileError = error;

      const offending = OPTIONAL_COLUMNS.find(
        (column) =>
          column in payload && error.message.includes(column),
      );

      if (isUndefinedColumnError(error) && offending) {
        delete payload[offending];
        dropped.push(offending);
        continue;
      }

      break;
    }

    if (profileError) {
      // Never swallow this. Roll the auth user back so the signup can be
      // retried cleanly instead of leaving an orphaned account behind.
      console.error("Signup profile insert error:", profileError);

      await admin.auth.admin.deleteUser(authData.user.id).catch((cleanupError) => {
        console.error("Failed to roll back auth user:", cleanupError);
      });

      return NextResponse.json(
        { error: "Failed to create profile. Please try again." },
        { status: 500 },
      );
    }

    if (dropped.length > 0) {
      console.warn(
        `Signup for ${input.email}: profiles is missing column(s) ${dropped.join(", ")}. ` +
          "Add them via migration, or remove them from OPTIONAL_COLUMNS.",
      );
    }

    return NextResponse.json(
      {
        success: true,
        requiresEmailConfirmation: !authData.session,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Signup error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create account",
      },
      { status: 500 },
    );
  }
}