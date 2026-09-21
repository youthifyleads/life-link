import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { env } from "@/app/config/env";
import { authApi } from "@/features/authentication/api/auth.api";
import { PasswordResetShell } from "@/pages/auth/password-reset-shell";
import { normalizeApiError } from "@/shared/api/api-error";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

interface ForgotPasswordFormValues {
  email: string;
}

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const schema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .trim()
          .min(1, t("auth.emailRequired"))
          .email(t("auth.emailInvalid")),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    document.title = `${t("auth.forgotPasswordTitle")} | ${env.appName}`;
  }, [t]);

  const onSubmit = handleSubmit(async ({ email }) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      await authApi.forgotPassword({ email: normalizedEmail });
      navigate(`/reset-password?email=${encodeURIComponent(normalizedEmail)}`, {
        state: { codeSentAt: Date.now() },
      });
    } catch (error) {
      const apiError = normalizeApiError(error);
      const message =
        apiError.status === 429
          ? t("auth.tooManyResetAttempts")
          : t("auth.passwordResetRequestError");
      setError("root", {
        message: apiError.correlationId
          ? t("auth.apiErrorWithReference", {
              message,
              reference: apiError.correlationId,
            })
          : message,
      });
    }
  });

  return (
    <PasswordResetShell
      title={t("auth.forgotPasswordTitle")}
      description={t("auth.forgotPasswordDescription")}
    >
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
            <Label htmlFor="recovery-email">{t("auth.email")}</Label>
            <Input
              id="recovery-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              dir="ltr"
              autoFocus
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? "recovery-email-error" : "recovery-email-hint"
              }
              {...register("email")}
            />
            {errors.email ? (
              <p id="recovery-email-error" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            ) : (
              <p
                id="recovery-email-hint"
                className="text-xs leading-5 text-muted-foreground"
              >
                {t("auth.forgotPasswordEmailHint")}
              </p>
            )}
          </div>

          <Button
            className="w-full"
            type="submit"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            ) : null}
            {isSubmitting
              ? t("auth.sendingResetCode")
              : t("auth.sendResetCode")}
            {!isSubmitting ? (
              <ArrowRight
                aria-hidden="true"
                className="size-4 rtl:rotate-180"
              />
            ) : null}
          </Button>
      </form>

      <Link
        to="/login"
        className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
        {t("auth.backToLogin")}
      </Link>
    </PasswordResetShell>
  );
}
