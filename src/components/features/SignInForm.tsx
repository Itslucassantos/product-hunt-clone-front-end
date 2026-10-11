"use client";

import { useSignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Link, useRouter } from "@/i18n/navigation";
import { mapClerkError, type AuthField } from "@/lib/auth/clerk-errors";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormErrors = Partial<Record<AuthField, string>> & { form?: string };

export function SignInForm() {
  const t = useTranslations("auth");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const redirectUrl = getSafeRedirectPath(useSearchParams().get("redirect_url"));
  const { signIn, fetchStatus } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const busy = submitting || fetchStatus === "fetching";

  function showClerkError(error: Parameters<typeof mapClerkError>[0]) {
    const mapped = mapClerkError(error);
    setErrors(
      mapped.field
        ? { [mapped.field]: tErrors(mapped.messageKey) }
        : { form: tErrors(mapped.messageKey) },
    );
  }

  async function finish() {
    const { error } = await signIn.finalize({
      navigate: ({ decorateUrl }) => {
        const url = decorateUrl(redirectUrl);
        if (url.startsWith("http")) window.location.href = url;
        else router.push(url);
      },
    });
    if (error) showClerkError(error);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const next: FormErrors = {};
    if (!email.trim()) next.email = tErrors("auth.emailRequired");
    else if (!EMAIL_PATTERN.test(email.trim())) next.email = tErrors("auth.emailInvalid");
    if (!password) next.password = tErrors("auth.passwordRequired");
    setErrors(next);
    if (next.email || next.password) return;

    setSubmitting(true);
    try {
      const { error } = await signIn.password({ emailAddress: email.trim(), password });
      if (error) return showClerkError(error);

      if (signIn.status === "complete") return await finish();

      if (signIn.status === "needs_client_trust" || signIn.status === "needs_second_factor") {
        // New device: Clerk asks for a code sent to the email before the session is created.
        const { error: sendError } = await signIn.mfa.sendEmailCode();
        if (sendError) return showClerkError(sendError);
        return setAwaitingCode(true);
      }

      if (process.env.NODE_ENV === "development") {
        console.error("Unhandled sign-in status:", signIn.status);
      }
      setErrors({ form: tErrors("auth.unknown") });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!code.trim()) return setErrors({ code: tErrors("auth.codeRequired") });
    setErrors({});

    setSubmitting(true);
    try {
      const { error } = await signIn.mfa.verifyEmailCode({ code: code.trim() });
      if (error) return showClerkError(error);
      if (signIn.status !== "complete") return setErrors({ form: tErrors("auth.unknown") });
      await finish();
    } finally {
      setSubmitting(false);
    }
  }

  async function resendCode() {
    setErrors({});
    const { error } = await signIn.mfa.sendEmailCode();
    if (error) showClerkError(error);
  }

  if (awaitingCode) {
    return (
      <form onSubmit={handleCode} noValidate className="flex flex-col gap-5">
        <p className="text-muted">{t("signIn.codeSent", { email: email.trim() })}</p>
        {errors.form && <Alert>{errors.form}</Alert>}
        <FormField
          label={t("code")}
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          error={errors.code}
        />
        <Button type="submit" loading={busy} className="w-full">
          {busy ? t("signIn.verifying") : t("signIn.verify")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={resendCode}
          disabled={busy}
          className="w-full"
        >
          {t("signIn.resend")}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {errors.form && <Alert>{errors.form}</Alert>}
      <FormField
        label={t("email")}
        type="email"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
      />
      <FormField
        label={t("password")}
        type="password"
        name="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
      />
      <Button type="submit" loading={busy} className="w-full">
        {busy ? t("signIn.submitting") : t("signIn.submit")}
      </Button>
      <p className="text-center text-sm text-muted">
        {t("signIn.noAccount")}{" "}
        <Link
          href={{
            pathname: "/sign-up",
            query: redirectUrl === "/" ? {} : { redirect_url: redirectUrl },
          }}
          className="font-semibold text-primary-text underline"
        >
          {t("signIn.createOne")}
        </Link>
      </p>
    </form>
  );
}
