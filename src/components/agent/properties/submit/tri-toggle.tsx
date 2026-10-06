"use client";

interface TriToggleProps {
  label: string;
  value: boolean | null;
  onChange: (v: boolean | null) => void;
}

export function TriToggle({ label, value, onChange }: TriToggleProps) {
  const opts = [
    { label: "Yes", val: true },
    { label: "No", val: false },
    { label: "Don't know", val: null as boolean | null },
  ];

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
      <div className="flex gap-2">
        {opts.map(({ label: l, val }) => {
          const active = value === val;
          return (
            <button
              key={l}
              type="button"
              onClick={() => onChange(val)}
              className={[
                "flex-1 min-h-[38px] rounded-lg border text-sm transition-colors cursor-pointer",
                active
                  ? "border-primary bg-primary text-primary-foreground font-medium"
                  : "border-input bg-card text-foreground hover:border-primary/50",
              ].join(" ")}
            >
              {l}
            </button>
          );
        })}
      </div>
    </div>
  );
}
