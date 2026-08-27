import { DashboardWelcomeHeaderProps } from "@/utils/types";

export function DashboardWelcomeHeader({
  fullName,
}: DashboardWelcomeHeaderProps) {
  const firstName = fullName?.split(" ")[0] || "Student";

  return (
    <div className='mt-4' data-tour="student-welcome">
      <h1 className="text-2xl md:text-3xl" style={{ fontFamily: "var(--font-display)" }}>Welcome back, {firstName}!</h1>
      <p className="text-[#6B7B75] dark:text-[#A8C8BB]">
        Here&apos;s what&apos;s happening in your academic journey
      </p>
    </div>
  );
}
