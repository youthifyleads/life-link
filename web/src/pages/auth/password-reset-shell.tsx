import { KeyRound, ShieldCheck, Droplets } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { env } from "@/app/config/env";
import { LanguageSwitcher } from "@/shared/components/navigation/language-switcher";

interface PasswordResetShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function PasswordResetShell({
  title,
  description,
  children,
}: PasswordResetShellProps) {
  const { t } = useTranslation();

  return (
    <main className="grid min-h-svh bg-background lg:grid-cols-[minmax(20rem,38%)_1fr]">
      <section className="bg-clinical-navy px-6 py-8 text-white sm:px-10 lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-12">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-md border border-white/25 bg-white/10">
              <Droplets
                aria-hidden="true"
                className="size-6"
                strokeWidth={1.8}
              />
            </span>
            <span className="text-xl font-semibold tracking-[-0.02em]">
              {t("common.appName", env.appName)}
            </span>
          </div>

          <div className="mt-12 max-w-md lg:mt-24">
            <h1 className="max-w-[16ch] text-3xl font-semibold leading-tight tracking-[-0.025em] sm:text-4xl">
              {t("auth.passwordRecoveryBrandTitle")}
            </h1>
            <p className="mt-5 max-w-[52ch] text-base leading-7 text-[#d3e4ec]">
              {t("auth.passwordRecoveryBrandDescription")}
            </p>
          </div>
        </div>

        <dl className="mt-10 hidden max-w-md divide-y divide-white/15 border-y border-white/15 text-sm lg:block">
          <div className="flex items-center justify-between gap-6 py-4">
            <dt className="flex items-center gap-3 text-[#d3e4ec]">
              <KeyRound aria-hidden="true" className="size-4" />
              {t("auth.recoveryCodeLabel")}
            </dt>
            <dd className="font-medium">{t("auth.sixDigitCode")}</dd>
          </div>
          <div className="flex items-center justify-between gap-6 py-4">
            <dt className="flex items-center gap-3 text-[#d3e4ec]">
              <ShieldCheck aria-hidden="true" className="size-4" />
              {t("auth.securityLabel")}
            </dt>
            <dd className="font-medium">{t("auth.singleUseCode")}</dd>
          </div>
        </dl>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-[27rem]">
          <div className="mb-6 flex justify-end">
            <LanguageSwitcher />
          </div>

          <header className="mb-8">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
              {title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </header>

          {children}

          <p className="mt-8 flex items-start gap-3 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
            <ShieldCheck
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-primary"
            />
            <span>{t("auth.passwordRecoverySecureNotice")}</span>
          </p>
        </div>
      </section>
    </main>
  );
}
