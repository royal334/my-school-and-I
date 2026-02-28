type DashboardWelcomeHeaderProps = {
  fullName?: string | null;
};

export function DashboardWelcomeHeader({ fullName }: DashboardWelcomeHeaderProps) {
  const firstName = fullName?.split(' ')[0] || 'Student';

  return (
    <div>
      <h1 className="text-3xl font-bold">
        Welcome back, {firstName}! 👋
      </h1>
      <p className="text-slate-600">
        Here's what's happening in your academic journey
      </p>
    </div>
  );
}

