import { useTranslation } from "react-i18next";

interface PasswordStrengthProps {
  password: string;
}

function getPasswordStrength(password: string) {
  if (!password) return 0;

  return [
    password.length >= 8,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
}

const strengthTone = [
  "bg-muted",
  "bg-destructive",
  "bg-warning",
  "bg-primary",
  "bg-success",
] as const;

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { t } = useTranslation();
  const score = getPasswordStrength(password);
  const label =
    score === 0
      ? t("auth.passwordStrengthNotSet")
      : score === 1
        ? t("auth.passwordStrengthWeak")
        : score === 2
          ? t("auth.passwordStrengthFair")
          : score === 3
            ? t("auth.passwordStrengthGood")
            : t("auth.passwordStrengthStrong");

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-muted-foreground">
          {t("auth.passwordStrength")}
        </span>
        <span className="font-semibold text-foreground">{label}</span>
      </div>
      <div
        className="grid grid-cols-4 gap-1.5"
        role="progressbar"
        aria-label={t("auth.passwordStrength")}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={score}
        aria-valuetext={label}
      >
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            aria-hidden="true"
            className={`h-1.5 rounded-sm ${
              score >= segment ? strengthTone[score] : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-xs leading-5 text-muted-foreground">
        {t("auth.passwordStrengthHint")}
      </p>
    </div>
  );
}
