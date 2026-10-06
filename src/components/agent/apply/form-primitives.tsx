import { cn } from '@/lib/utils';

export const inputClass =
  'w-full rounded-lg border border-input bg-card px-3.5 py-[11px] text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-[3px] focus:ring-primary/15 dark:bg-white/[0.03]';

export const textareaClass = cn(inputClass, 'resize-y');

export const chipClass = (active: boolean) =>
  cn(
    'cursor-pointer rounded-full border px-3.5 py-2 text-[13px] transition-all duration-150 motion-reduce:transition-none',
    active
      ? 'border-primary bg-primary font-medium text-primary-foreground'
      : 'border-input bg-card text-foreground hover:border-primary/50 hover:bg-primary-50 dark:hover:bg-white/5',
  );

export const choiceRowClass = (active: boolean) =>
  cn(
    'flex w-full cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-[11px] text-left text-[13px] transition-all duration-150 motion-reduce:transition-none',
    active
      ? 'border-primary bg-primary/10 font-medium text-primary dark:text-primary-200'
      : 'border-input bg-card text-foreground hover:border-primary/50 hover:bg-primary-50/50 dark:hover:bg-white/5',
  );

export const choiceDotClass = (active: boolean) =>
  cn(
    'flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
    active ? 'border-primary bg-primary' : 'border-input bg-card dark:border-white/20',
  );

export const primaryButtonClass =
  'min-h-[50px] w-full cursor-pointer rounded-lg px-5 py-[13px] text-[15px] font-medium text-primary-foreground transition-colors disabled:cursor-not-allowed disabled:bg-primary/70 bg-primary-500';

export function FormField({
  label,
  required,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[13px] font-medium tracking-[-0.01em] text-foreground"
      >
        {label}
        {required && <span className="ml-0.5 text-accent-600 dark:text-accent-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-error-text">{message}</p>;
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-lg border border-error/20 bg-error-bg px-3.5 py-2.5 text-[13px] text-error-text"
    >
      {message}
    </p>
  );
}