import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { RECOVERY_SESSION_COOKIE } from "@/utils/constants/constants";
import UpdatePasswordForm from "./update-password-form";

export default async function UpdatePasswordPage() {
  const cookieStore = await cookies();

  // The marker is only ever set by the auth callback after a recovery link has
  // been verified. Without it this page is just a weaker, current-password-free
  // password change surface for anyone who happens to be logged in.
  if (cookieStore.get(RECOVERY_SESSION_COOKIE)?.value !== "1") {
    redirect("/forgot-password");
  }

  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/forgot-password");
  }

  return <UpdatePasswordForm />;
}