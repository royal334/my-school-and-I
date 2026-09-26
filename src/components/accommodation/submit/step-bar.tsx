export function SubmitStepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1 px-4 pt-3">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={[
            'h-[3px] flex-1 rounded-full transition-[background] duration-200',
            i <= current ? 'bg-primary' : 'bg-muted',
          ].join(' ')}
        />
      ))}
    </div>
  );
}