import { cn } from "@/lib/utils";
import Img from "next/image";

type CampusHubMarkProps = {
  className?: string;
  title?: string;
};

export function CampusHubMark({ className, title }: CampusHubMarkProps) {
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-900 text-primary-300 shadow-sm dark:bg-primary-800",
        className,
      )}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 13.5 20 9l8 4.5v9L20 27l-8-4.5v-9Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M20 9v18M12 13.5l16 9M28 13.5l-16 9"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity=".72"
        />
        <circle cx="20" cy="18" r="3.2" fill="#F59E0B" />
        <circle cx="20" cy="9" r="2" fill="currentColor" />
        <circle cx="28" cy="22.5" r="2" fill="currentColor" />
        <circle cx="12" cy="22.5" r="2" fill="currentColor" />
      </svg>
    </span>
  );
}

type CampusHubLogoProps = {
  className?: string;
  markClassName?: string;
  compact?: boolean;
  inverted?: boolean;
};

export function CampusHubLogo({
  className,
  markClassName,
  compact = false,
  inverted = false,
}: CampusHubLogoProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label="CampusHub"
    >
      <Img src="/campushub-logo.png" alt="CampusHub" width={40} height={40} />
      {!compact && (
        <span
          className={cn(
            "font-display text-xl font-bold tracking-tight",
            inverted ? "text-primary-400 dark:text-primary-500" : "text-foreground dark:text-primary-400",
          )}
        >
          Campus
          <span className={inverted ? "text-primary-500 dark:text-white" : "text-primary-600 dark:text-primary-300"}>
            &
            </span>
          <span className={inverted ? "text-primary-700 dark:text-primary-400" : "text-primary-600 dark:text-primary-400"}>
            Me
          </span>
        </span>
      )}
    </span>
  );
}
