// Shared field classes & helpers for the accommodation submission form.

export const inputClass =
  'w-full rounded border border-input bg-card px-3.5 py-[11px] text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-[3px] focus:ring-primary/15';

export const textareaClass = `${inputClass} resize-y`;

export const chipClass = (active: boolean) =>
  [
    'rounded-full border px-3.5 py-2 text-[13px] transition-all duration-150 motion-reduce:transition-none cursor-pointer',
    active
      ? 'border-primary bg-primary font-medium text-primary-foreground'
      : 'border-input bg-card text-foreground hover:border-primary/50',
  ].join(' ');

export const radioRowClass = (active: boolean) =>
  [
    'flex w-full cursor-pointer items-center gap-2.5 rounded border px-3.5 py-[11px] text-left text-[13px] transition-all duration-150 motion-reduce:transition-none',
    active
      ? 'border-primary bg-primary/10 font-medium text-primary'
      : 'border-input bg-card text-foreground hover:border-primary/50',
  ].join(' ');

export const radioDotClass = (active: boolean) =>
  [
    'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
    active
      ? 'border-primary bg-primary'
      : 'border-input bg-card dark:border-white/20',
  ].join(' ');

export function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium tracking-[-0.01em] text-foreground">
        {label}
        {required && <span className="ml-0.5 text-accent-600 dark:text-accent-400">*</span>}
      </label>
      {children}
      {hint && (
        <p className="text-[11px] leading-relaxed text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-error-text">{message}</p>;
}