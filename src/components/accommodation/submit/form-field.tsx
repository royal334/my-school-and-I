// Shared field classes & helpers for the accommodation submission form.
// Light values match the original inline styles; dark: variants are additive.

export const inputClass =
  'w-full rounded border border-[#C8E8DA] bg-white px-3.5 py-[11px] text-sm leading-relaxed text-[#1A3C34] outline-none transition-colors placeholder:text-[#6B7B75]/60 focus:border-[#4A8C73] focus:ring-[3px] focus:ring-[#4A8C73]/15 dark:border-white/10 dark:bg-[#1C1F1E] dark:text-[#ECEEED] dark:placeholder:text-[#9BA19E]/50 dark:focus:border-[#7EC8A0]';

export const textareaClass = `${inputClass} resize-y`;

export const chipClass = (active: boolean) =>
  [
    'rounded-full border px-3.5 py-2 text-[13px] transition-all duration-150 motion-reduce:transition-none cursor-pointer',
    active
      ? 'border-[#4A8C73] bg-[#4A8C73] font-medium text-white'
      : 'border-[#C8E8DA] bg-white text-[#1A3C34] hover:border-[#4A8C73]/50 dark:border-white/10 dark:bg-[#1C1F1E] dark:text-[#E1E4E2]',
  ].join(' ');

export const radioRowClass = (active: boolean) =>
  [
    'flex w-full cursor-pointer items-center gap-2.5 rounded border px-3.5 py-[11px] text-left text-[13px] transition-all duration-150 motion-reduce:transition-none',
    active
      ? 'border-[#4A8C73] bg-[#4A8C73]/10 font-medium text-[#4A8C73]'
      : 'border-[#C8E8DA] bg-white text-[#1A3C34] hover:border-[#4A8C73]/50 dark:border-white/10 dark:bg-[#1C1F1E] dark:text-[#E1E4E2]',
  ].join(' ');

export const radioDotClass = (active: boolean) =>
  [
    'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
    active
      ? 'border-[#4A8C73] bg-[#4A8C73]'
      : 'border-[#C8E8DA] bg-white dark:border-white/20 dark:bg-[#1C1F1E]',
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
      <label className="text-[13px] font-medium tracking-[-0.01em] text-[#1A3C34] dark:text-[#E1E4E2]">
        {label}
        {required && <span className="ml-0.5 text-[#E8A020]">*</span>}
      </label>
      {children}
      {hint && (
        <p className="text-[11px] leading-relaxed text-[#6B7B75] dark:text-[#9BA19E]">{hint}</p>
      )}
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-[#C44B2A] dark:text-[#E8694A]">{message}</p>;
}