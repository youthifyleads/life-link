import { useTranslation } from "react-i18next";

export function PageLoader() {
  const { t } = useTranslation();
  const label = t("common.loading");

  return (
    <div
      className="flex min-h-svh items-center justify-center bg-background px-6"
      role="status"
      aria-live="polite"
    >
      <div
        className="w-full max-w-sm space-y-4"
        aria-label={label}
      >
        <div className="h-7 w-40 animate-pulse rounded-sm bg-muted" />
        <div className="h-11 w-full animate-pulse rounded-md bg-muted" />
        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
}
