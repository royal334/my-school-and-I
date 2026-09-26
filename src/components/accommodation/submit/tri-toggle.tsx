'use client';

const OPTIONS: { label: string; val: boolean | null }[] = [
  { label: 'Yes', val: true },
  { label: 'No', val: false },
  { label: "Don't know", val: null },
];

export function TriToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean | null) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[13px] font-medium text-foreground">{label}</p>
      <div className="flex gap-2">
        {OPTIONS.map(({ label: l, val }) => {
          const active = value === val;
          return (
            <button
              key={l}
              type="button"
              onClick={() => onChange(val)}
              className={[
                'min-h-[44px] flex-1 cursor-pointer rounded border py-[9px] text-[13px] transition-all duration-150 motion-reduce:transition-none',
                active
                  ? 'border-primary bg-primary font-medium text-primary-foreground'
                  : 'border-input bg-card text-foreground hover:border-primary/50',
              ].join(' ')}
            >
              {l}
            </button>
          );
        })}
      </div>
    </div>
  );
}