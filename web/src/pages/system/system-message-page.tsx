import { ArrowLeft, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Button } from "@/shared/components/ui/button";

interface SystemMessagePageProps {
  type: "forbidden" | "not-found";
}

export function SystemMessagePage({ type }: SystemMessagePageProps) {
  const { t } = useTranslation();
  const forbidden = type === "forbidden";

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6 py-12">
      <section className="w-full max-w-lg border-y border-border bg-surface px-2 py-10 text-center sm:border sm:px-10">
        <ShieldAlert
          aria-hidden="true"
          className="mx-auto size-9 text-primary"
        />
        <h1 className="mt-5 text-2xl font-semibold tracking-[-0.02em]">
          {t(forbidden ? "errors.forbiddenTitle" : "errors.notFoundTitle")}
        </h1>
        <p className="mx-auto mt-3 max-w-[52ch] text-sm leading-6 text-muted-foreground">
          {t(
            forbidden
              ? "errors.forbiddenDescription"
              : "errors.notFoundDescription",
          )}
        </p>
        <Button asChild className="mt-7">
          <Link to="/">
            <ArrowLeft aria-hidden="true" className="rtl:rotate-180" />
            {t("errors.returnHome")}
          </Link>
        </Button>
      </section>
    </main>
  );
}
