import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";

import { env } from "@/app/config/env";
import { authApi } from "@/features/authentication/api/auth.api";
import { PasswordStrength } from "@/features/authentication/ui/password-strength";
import { PasswordResetShell } from "@/pages/auth/password-reset-shell";
import { normalizeApiError } from "@/shared/api/api-error";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

const resendDelaySeconds = 60;

interface ResetPasswordFormValues {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

interface ResetPasswordLocationState {
  codeSentAt?: number;
}

function getRemainingSeconds(sentAt?: number) {
  if (!sentAt) return 0;
  const elapsed = Math.floor((Date.now() - sentAt) / 1000);
  return Math.max(0, resendDelaySeconds - elapsed);
}

function normalizeOtp(value: string) {
  return value
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/\D/g, "")
    .slice(0, 6);
}

export function ResetPasswordPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const locationState = location.state as ResetPasswordLocationState | null;
  const initialEmail = searchParams.get("email") ?? "";
  const [resendSeconds, setResendSeconds] = useState(() =>
    getRemainingSeconds(locationState?.codeSentAt),
  );
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(
    locationState?.codeSentAt ? t("auth.resetCodeSentShort") : null,
  );
  const [resendError, setResendError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const schema = useMemo(
    () =>
      z
        .object({
          email: z
            .string()
            .trim()
            .min(1, t("auth.emailRequired"))
            .email(t("auth.emailInvalid")),
          otp: z
            .string()
            .regex(/^\d{6}$/, t("auth.otpInvalid")),
          newPassword: z
            .string()
            .min(1, t("auth.newPasswordRequired"))
            .min(8, t("auth.passwordMinimumLength")),
          confirmPassword: z
            .string()
            .min(1, t("auth.confirmPasswordRequired")),
        })
        .refine((values) => values.newPassword === values.confirmPassword, {
          path: ["confirmPassword"],
          message: t("auth.passwordsDoNotMatch"),
        }),
    [t],
  );

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: initialEmail,
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  useEffect(() => {
    document.title = `${t("auth.resetPasswordTitle")} | ${env.appName}`;
  }, [t]);

  useEffect(() => {
    if (resendSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setResendSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  useEffect(() => {
    if (!isComplete) return;

    const redirectTimer = window.setTimeout(() => {
      navigate("/login", { replace: true });
    }, 2000);

    return () => window.clearTimeout(redirectTimer);
  }, [isComplete, navigate]);

  const getLocalizedError = (
    error: unknown,
    fallbackKey: "passwordResetRequestError" | "passwordResetError",
  ) => {
    const apiError = normalizeApiError(error);
    const message =
      apiError.status === 429
        ? t("auth.tooManyResetAttempts")
        : fallbackKey === "passwordResetError" &&
            [400, 404, 410, 422].includes(apiError.status ?? 0)
          ? t("auth.invalidOrExpiredCode")
          : t(`auth.${fallbackKey}`);

    return apiError.correlationId
      ? t("auth.apiErrorWithReference", {
          message,
          reference: apiError.correlationId,
        })
      : message;
  };

  const handleResend = async () => {
    const emailIsValid = await trigger("email");
    if (!emailIsValid) return;

    setResendError(null);
    setResendMessage(null);
    setIsResending(true);

    try {
      await authApi.forgotPassword({
        email: getValues("email").trim().toLowerCase(),
      });
      setResendSeconds(resendDelaySeconds);
      setResendMessage(t("auth.resetCodeResent"));
    } catch (error) {
      setResendError(getLocalizedError(error, "passwordResetRequestError"));
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      await authApi.resetPassword({
        email: values.email.trim().toLowerCase(),
        otp: values.otp,
        new_password: values.newPassword,
      });
      setIsComplete(true);
    } catch (error) {
      setError("root", {
        message: getLocalizedError(error, "passwordResetError"),
      });
    }
  });

  return (
    <PasswordResetShell
      title={t("auth.resetPasswordTitle")}
      description={t("auth.resetPasswordDescription")}
    >
      {isComplete ? (
        <div
          className="rounded-md border border-success/30 bg-success-subtle px-4 py-4 text-success"
          role="status"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0"
            />
            <div>
              <h3 className="text-sm font-semibold">
                {t("auth.passwordResetSuccessTitle")}
              </h3>
              <p className="mt-1 text-sm leading-6">
                {t("auth.passwordResetSuccessDescription")}
              </p>
            </div>
          </div>
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

          {resendError ? (
            <div
              className="rounded-md border border-destructive/30 bg-emergency-subtle px-4 py-3 text-sm leading-6 text-[#7a1a13]"
              role="alert"
            >
              {resendError}
            </div>
          ) : null}

          {resendMessage ? (
            <div
              className="rounded-md border border-success/30 bg-success-subtle px-4 py-3 text-sm leading-6 text-success"
              role="status"
            >
              {resendMessage}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="reset-email">{t("auth.email")}</Label>
            <Input
              id="reset-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              dir="ltr"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "reset-email-error" : undefined}
              {...register("email")}
            />
            {errors.email ? (
              <p id="reset-email-error" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="reset-otp">{t("auth.otpLabel")}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                disabled={isResending || resendSeconds > 0}
                onClick={() => void handleResend()}
              >
                {isResending ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-3.5 animate-spin"
                  />
                ) : (
                  <RotateCcw aria-hidden="true" className="size-3.5" />
                )}
                {isResending
                  ? t("auth.resendingCode")
                  : resendSeconds > 0
                    ? t("auth.resendCodeCountdown", {
                        seconds: new Intl.NumberFormat(
                          i18n.language.startsWith("ar") ? "ar-EG" : "en",
                        ).format(resendSeconds),
                      })
                    : t("auth.resendCode")}
              </Button>
            </div>
            <Input
              id="reset-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              dir="ltr"
              className="text-center text-lg font-semibold tracking-[0.35em] tabular-nums"
              aria-invalid={Boolean(errors.otp)}
              aria-describedby={errors.otp ? "reset-otp-error" : "reset-otp-hint"}
              {...register("otp", { setValueAs: normalizeOtp })}
            />
            {errors.otp ? (
              <p id="reset-otp-error" className="text-sm text-destructive">
                {errors.otp.message}
              </p>
            ) : (
              <p
                id="reset-otp-hint"
                className="text-xs leading-5 text-muted-foreground"
              >
                {t("auth.otpHint")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">{t("auth.newPassword")}</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.newPassword)}
              aria-describedby={
                errors.newPassword
                  ? "new-password-error"
                  : "password-strength"
              }
              {...register("newPassword")}
            />
            {errors.newPassword ? (
              <p id="new-password-error" className="text-sm text-destructive">
                {errors.newPassword.message}
              </p>
            ) : null}
            <div id="password-strength">
              <PasswordStrength password={newPassword} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">
              {t("auth.confirmPassword")}
            </Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={
                errors.confirmPassword ? "confirm-password-error" : undefined
              }
              {...register("confirmPassword")}
            />
            {errors.confirmPassword ? (
              <p
                id="confirm-password-error"
                className="text-sm text-destructive"
              >
                {errors.confirmPassword.message}
              </p>
            ) : null}
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
              ? t("auth.resettingPassword")
              : t("auth.resetPasswordSubmit")}
            {!isSubmitting ? (
              <ArrowRight
                aria-hidden="true"
                className="size-4 rtl:rotate-180"
              />
            ) : null}
          </Button>
        </form>
      )}

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
