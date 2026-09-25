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
      <p className="text-[13px] font-medium text-[#1A3C34] dark:text-[#E1E4E2]">{label}</p>
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
                  ? 'border-[#4A8C73] bg-[#4A8C73] font-medium text-white'
                  : 'border-[#C8E8DA] bg-white text-[#1A3C34] hover:border-[#4A8C73]/50 dark:border-white/10 dark:bg-[#1C1F1E] dark:text-[#E1E4E2]',
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