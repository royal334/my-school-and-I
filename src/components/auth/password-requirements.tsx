import { PASSWORD_REQUIREMENTS } from "@/lib/validations/password";

export function PasswordRequirements({ value }: { value: string }) {
  return (
    <ul className="space-y-1 text-xs text-muted-foreground" aria-label="Password requirements">
      {PASSWORD_REQUIREMENTS.map((requirement) => {
        const satisfied = requirement.test(value);
        return (
          <li
            key={requirement.id}
            className={satisfied ? "text-success" : undefined}
          >
            {satisfied ? "✓" : "•"} {requirement.label}
          </li>
        );
      })}
    </ul>
  );
}
