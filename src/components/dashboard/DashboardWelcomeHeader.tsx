import { DashboardWelcomeHeaderProps } from "@/utils/types";

export function DashboardWelcomeHeader({
  fullName,
}: DashboardWelcomeHeaderProps) {
  const firstName = fullName?.split(" ")[0] || "Student";

  return (
    <div className="mt-5" data-tour="student-welcome">
      <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-primary-600 dark:text-primary-300">
        Everything for campus life
      </p>
      <h1 className="text-2xl md:text-3xl">Welcome back, {firstName}.</h1>
      <p className="mt-2 text-muted-foreground">
        Here&apos;s what&apos;s happening in your academic journey.
      </p>
    </div>
  );
}
