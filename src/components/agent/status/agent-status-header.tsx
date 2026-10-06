export function AgentStatusHeader({ subtitle }: { subtitle?: string }) {
  return (
    <header className="bg-primary-600 px-4 py-4 dark:bg-primary-800">
      <h1 className="text-xl tracking-tight text-white">Agent portal</h1>
      {subtitle && <p className="mt-0.5 truncate text-xs text-primary-200 dark:text-primary-300">{subtitle}</p>}
    </header>
  );
}