import { ArrowLeft, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { useAuth } from "@/features/authentication/model/use-auth";
import { Button } from "@/shared/components/ui/button";

interface SystemMessagePageProps {
  type: "forbidden" | "not-found";
}

export function SystemMessagePage({ type }: SystemMessagePageProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const forbidden = type === "forbidden";

  const getDashboardPath = () => {
    const role = user?.primary_role;
    if (role === "admin" || role === "platform_support") return "/admin/dashboard";
    if (role === "blood_bank_staff") return "/blood-bank/dashboard";
    if (role === "donor") return "/donor/dashboard";
    if (role === "caregiver") return "/caregiver/dashboard";
    return "/hospital/dashboard";
  };

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
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link to={forbidden && user ? getDashboardPath() : "/"}>
              <ArrowLeft aria-hidden="true" className="rtl:rotate-180" />
              {forbidden && user ? t("system.goToDashboard", "Go to your dashboard") : t("errors.returnHome")}
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
