import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  ArrowRight,
  Building2,
  Droplets,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import { env } from "@/app/config/env";
import { useAuth } from "@/features/authentication/model/use-auth";
import type { DemoSessionRole } from "@/features/authentication/model/demo-session";
import { normalizeApiError } from "@/shared/api/api-error";
import { LanguageSwitcher } from "@/shared/components/navigation/language-switcher";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

const isDemoAuthenticationEnabled = import.meta.env.DEV;

type LoginFormValues = { email: string; password: string };

interface LoginLocationState {
  from?: string;
}

export function LoginPage() {
  const { t } = useTranslation();
  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.string().min(1, t("auth.emailRequired")).email(t("auth.emailInvalid")),
        password: z.string().min(1, t("auth.passwordRequired")),
      }),
    [t],
  );
  const { signIn, signInDemo, status, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LoginLocationState | null;
  const [isDemoSubmitting, setIsDemoSubmitting] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    document.title = `${t("auth.signIn")} | ${env.appName}`;
  }, [t]);

  if (status === "authenticated") {
    const authenticatedDestination =
      user?.primary_role === "admin"
        ? "/admin/dashboard"
        : user?.primary_role === "blood_bank_staff"
          ? "/blood-bank/dashboard"
          : user?.primary_role === "donor"
            ? "/donor/dashboard"
            : user?.primary_role === "caregiver"
              ? "/caregiver/dashboard"
              : "/hospital/dashboard";

    return (
      <Navigate
        to={isDemoAuthenticationEnabled ? authenticatedDestination : "/"}
        replace
      />
    );
  }

  const getDestination = (role: DemoSessionRole = "hospital_staff") => {
    if (isDemoAuthenticationEnabled) {
      const requestedPath = locationState?.from;
      if (requestedPath === "/ui-preview") return requestedPath;
      if (role === "admin") {
        return requestedPath?.startsWith("/admin/")
          ? requestedPath
          : "/admin/dashboard";
      }
      if (role === "blood_bank_staff") {
        return requestedPath?.startsWith("/blood-bank/")
          ? requestedPath
          : "/blood-bank/dashboard";
      }
      if (role === "donor") {
        return requestedPath?.startsWith("/donor/")
          ? requestedPath
          : "/donor/dashboard";
      }
      if (role === "caregiver") {
        return requestedPath?.startsWith("/caregiver/")
          ? requestedPath
          : "/caregiver/dashboard";
      }
      return requestedPath?.startsWith("/hospital/")
        ? requestedPath
        : "/hospital/dashboard";
    }
    return locationState?.from?.startsWith("/") ? locationState.from : "/";
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signIn(values);
      navigate(getDestination(), { replace: true });
    } catch (error) {
      const apiError = normalizeApiError(error);
      setError("root", {
        message:
          apiError.status === 401
            ? t("auth.invalidCredentials")
            : apiError.correlationId
              ? t("auth.apiErrorWithReference", {
                  message: apiError.message,
                  reference: apiError.correlationId,
                })
              : apiError.message,
      });
    }
  });

  const handleDemoSignIn = async (role: DemoSessionRole = "hospital_staff") => {
    setDemoError(null);
    setIsDemoSubmitting(true);

    try {
      await signInDemo(role);
      navigate(getDestination(role), { replace: true });
    } catch {
      setDemoError(t("auth.demoStartError"));
    } finally {
      setIsDemoSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-svh bg-background lg:grid-cols-[minmax(20rem,38%)_1fr]">
      <section className="relative overflow-hidden bg-clinical-navy px-6 py-8 text-white sm:px-10 lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-12">
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
            <h1 className="max-w-[15ch] text-3xl font-semibold leading-tight tracking-[-0.025em] sm:text-4xl">
              {t("auth.brandHeadline")}
            </h1>
            <p className="mt-5 max-w-[52ch] text-base leading-7 text-[#d3e4ec]">
              {t("auth.brandDescription")}
            </p>
          </div>
        </div>

        <dl className="mt-10 hidden max-w-md divide-y divide-white/15 border-y border-white/15 text-sm lg:block">
          <div className="flex items-center justify-between gap-6 py-4">
            <dt className="flex items-center gap-3 text-[#d3e4ec]">
              <Activity aria-hidden="true" className="size-4" />
              {t("auth.operationalFocus")}
            </dt>
            <dd className="font-medium">{t("auth.requestStatusFocus")}</dd>
          </div>
          <div className="flex items-center justify-between gap-6 py-4">
            <dt className="flex items-center gap-3 text-[#d3e4ec]">
              <ShieldCheck aria-hidden="true" className="size-4" />
              {t("auth.accessModel")}
            </dt>
            <dd className="font-medium">{t("auth.roleProtected")}</dd>
          </div>
        </dl>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-[27rem]">
          <div className="mb-6 flex justify-end">
            <LanguageSwitcher />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
              {isDemoAuthenticationEnabled
                ? t("auth.switchRole", "Development preview access")
                : t("auth.title")}
            </h2>
            <p className="mt-3 max-w-[52ch] text-sm leading-6 text-muted-foreground">
              {isDemoAuthenticationEnabled
                ? t("auth.demoNotice", "Enter the operational shell with an isolated demonstration session.")
                : t("auth.description")}
            </p>
          </div>

          {isDemoAuthenticationEnabled ? (
            <div className="space-y-5">
              {demoError ? (
                <div
                  className="rounded-md border border-destructive/30 bg-emergency-subtle px-4 py-3 text-sm leading-6 text-[#7a1a13]"
                  role="alert"
                >
                  {demoError}
                </div>
              ) : null}

              <div className="divide-y divide-border border-y border-border">
                <section
                  className="py-4"
                  aria-labelledby="hospital-demo-access"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                      <Activity aria-hidden="true" className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3
                        id="hospital-demo-access"
                        className="text-sm font-semibold"
                      >
                        {t("auth.hospitalStaffName", "Dr. Sarah Chen")}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {t("auth.hospitalStaffDesc", "Hospital Staff • General Hospital")}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="mt-3 w-full"
                    type="button"
                    size="lg"
                    disabled={isDemoSubmitting}
                    onClick={() => void handleDemoSignIn("hospital_staff")}
                  >
                    {isDemoSubmitting
                      ? t("common.loading", "Opening workspace…")
                      : t("auth.enterHospitalWorkspace")}
                    {!isDemoSubmitting ? (
                      <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
                    ) : null}
                  </Button>
                </section>

                <section
                  className="py-4"
                  aria-labelledby="blood-bank-demo-access"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                      <Building2 aria-hidden="true" className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3
                        id="blood-bank-demo-access"
                        className="text-sm font-semibold"
                      >
                        {t("auth.bloodBankStaffName", "Mariam Al-Mansoor")}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {t("auth.bloodBankStaffDesc", "Blood Bank Technician • Central Blood Bank")}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="mt-3 w-full"
                    type="button"
                    size="lg"
                    variant="secondary"
                    disabled={isDemoSubmitting}
                    onClick={() => void handleDemoSignIn("blood_bank_staff")}
                  >
                    {isDemoSubmitting
                      ? t("common.loading", "Opening workspace…")
                      : t("auth.enterBloodBankWorkspace")}
                    {!isDemoSubmitting ? (
                      <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
                    ) : null}
                  </Button>
                </section>

                <section
                  className="py-4"
                  aria-labelledby="admin-demo-access"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                      <ShieldCheck aria-hidden="true" className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3
                        id="admin-demo-access"
                        className="text-sm font-semibold"
                      >
                        {t("auth.adminName", "System Administrator")}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {t("auth.adminDesc", "Platform Operations • Governance")}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="mt-3 w-full"
                    type="button"
                    size="lg"
                    variant="secondary"
                    disabled={isDemoSubmitting}
                    onClick={() => void handleDemoSignIn("admin")}
                  >
                    {isDemoSubmitting
                      ? t("common.loading", "Opening workspace…")
                      : t("auth.enterAdminWorkspace")}
                    {!isDemoSubmitting ? (
                      <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
                    ) : null}
                  </Button>
                </section>

              </div>

              <p className="flex items-start gap-3 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-primary"
                />
                <span>
                  {t("auth.developmentOnlyNotice")}
                </span>
              </p>
            </div>
          ) : (
            <form className="space-y-5" noValidate onSubmit={onSubmit}>
              {errors.root?.message ? (
                <div
                  className="rounded-md border border-destructive/30 bg-emergency-subtle px-4 py-3 text-sm leading-6 text-[#7a1a13]"
                  role="alert"
                >
                  {errors.root.message}
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  inputMode="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  {...register("email")}
                />
                {errors.email ? (
                  <p id="email-error" className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  {...register("password")}
                />
                {errors.password ? (
                  <p id="password-error" className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>

              <Button
                className="w-full"
                type="submit"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("auth.submitting") : t("auth.submit")}
                {!isSubmitting ? <ArrowRight aria-hidden="true" className="rtl:rotate-180" /> : null}
              </Button>
            </form>
          )}

          {!isDemoAuthenticationEnabled ? (
            <p className="mt-8 flex items-start gap-3 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
              <LockKeyhole
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-primary"
              />
              <span>{t("auth.secureNotice")}</span>
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
