import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  ArrowRight,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import { env } from "@/app/config/env";
import { useAuth } from "@/features/authentication/model/use-auth";
import type { UserRole } from "@/features/authentication/model/auth.types";
import { normalizeApiError } from "@/shared/api/api-error";
import { BrandWordmark } from "@/shared/components/branding/brand-wordmark";
import { LanguageSwitcher } from "@/shared/components/navigation/language-switcher";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

type LoginFormValues = { email: string; password: string };

interface LoginLocationState {
  from?: string;
}

export function getDestinationForRole(role?: UserRole): string {
  if (role === "admin" || role === "platform_support") return "/admin/dashboard";
  if (role === "blood_bank_staff") return "/blood-bank/dashboard";
  if (role === "donor") return "/donor/dashboard";
  if (role === "caregiver") return "/caregiver/dashboard";
  return "/hospital/dashboard";
}

export function isPathAllowedForRole(path: string, role?: UserRole): boolean {
  if (!role) return false;
  if (path.startsWith("/hospital") && role !== "hospital_staff" && role !== "medical_lead") {
    return false;
  }
  if (path.startsWith("/blood-bank") && role !== "blood_bank_staff") {
    return false;
  }
  if (path.startsWith("/admin") && role !== "admin" && role !== "platform_support") {
    return false;
  }
  if (path.startsWith("/donor") && role !== "donor") {
    return false;
  }
  if (path.startsWith("/caregiver") && role !== "caregiver") {
    return false;
  }
  return true;
}

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, status, user } = useAuth();
  const locationState = location.state as LoginLocationState | null;

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.string().min(1, t("auth.emailRequired")).email(t("auth.emailInvalid")),
        password: z.string().min(1, t("auth.passwordRequired")),
      }),
    [t],
  );

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

  if (status === "authenticated" && user) {
    const role = user.primary_role;
    const requestedPath = locationState?.from;
    const targetPath =
      requestedPath && isPathAllowedForRole(requestedPath, role)
        ? requestedPath
        : getDestinationForRole(role);

    return <Navigate to={targetPath} replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      const authenticatedUser = await signIn(values);
      const role = authenticatedUser?.primary_role;
      const requestedPath = locationState?.from;
      const targetPath =
        requestedPath && isPathAllowedForRole(requestedPath, role)
          ? requestedPath
          : getDestinationForRole(role);

      navigate(targetPath, { replace: true });
    } catch (error) {
      const apiError = normalizeApiError(error);
      let errorMessage = apiError.message;
      if (apiError.code === "ACCOUNT_BANNED") {
        errorMessage = t(
          "auth.accountBanned",
          "This account has been suspended. Please check your email and contact customer support.",
        );
      } else if (apiError.status === 401) {
        errorMessage = t("auth.invalidCredentials");
      } else if (apiError.correlationId) {
        errorMessage = t("auth.apiErrorWithReference", {
          message: apiError.message,
          reference: apiError.correlationId,
        });
      }
      setError("root", { message: errorMessage });
    }
  });

  return (
    <main className="grid min-h-svh bg-background lg:grid-cols-[minmax(20rem,38%)_1fr]">
      <section className="relative overflow-hidden bg-clinical-navy px-6 py-8 text-white sm:px-10 lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-12">
        <div>
          <div className="flex items-center gap-5">
            <img
              src="/logo-white.svg"
              alt="Life Link Logo"
              className="h-20 w-auto shrink-0 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)] sm:h-24"
            />
            <BrandWordmark size="lg" variant="on-dark" showSubtitle />
          </div>

          <div className="mt-10 max-w-md lg:mt-16">
            <h1 className="max-w-[16ch] text-3xl font-black leading-[1.25] tracking-tight sm:text-4xl lg:text-[2.65rem] font-heading text-white">
              {t("auth.brandHeadline")}
            </h1>
            <p className="mt-4 max-w-[52ch] text-base leading-7 text-[#d3e4ec]">
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
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
              {t("auth.title")}
            </h2>
            <p className="mt-3 max-w-[52ch] text-sm leading-6 text-muted-foreground">
              {t("auth.description")}
            </p>
          </div>

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

          <div className="mt-6 text-center">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t("auth.forgotPasswordLink")}
            </Link>
          </div>

          <p className="mt-8 flex items-start gap-3 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
            <LockKeyhole
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-primary"
            />
            <span>{t("auth.secureNotice")}</span>
          </p>
        </div>
      </section>
    </main>
  );
}
