import { DashboardWelcomeHeaderProps } from "@/utils/types";

export function DashboardWelcomeHeader({
  fullName,
}: DashboardWelcomeHeaderProps) {
  const firstName = fullName?.split(" ")[0] || "Student";

  return (
    <div className='mt-4'>
      <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {firstName}! 👋</h1>
      <p className="text-muted-foreground">
        Here's what's happening in your academic journey
      </p>
    </div>
  );
}
