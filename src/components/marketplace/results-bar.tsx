interface ResultsBarProps {
  total: number;
}

export function ResultsBar({ total }: ResultsBarProps) {
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <p className="text-[13px] text-muted-foreground">
        {total} listing{total !== 1 ? 's' : ''}
      </p>
    </div>
  );
}