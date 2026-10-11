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
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const busy = submitting || fetchStatus === "fetching";

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
      if (error) {
        const mapped = mapClerkError(error);
        setErrors(
          mapped.field === "email" || mapped.field === "password"
            ? { [mapped.field]: tErrors(mapped.messageKey) }
            : { form: tErrors(mapped.messageKey) },
        );
        return;
      }

      if (signIn.status !== "complete") {
        // Second factor and similar steps are not part of the email + password flow.
        setErrors({ form: tErrors("auth.unknown") });
        return;
      }

      const { error: finalizeError } = await signIn.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl(redirectUrl);
          if (url.startsWith("http")) window.location.href = url;
          else router.push(url);
        },
      });
      if (finalizeError) setErrors({ form: tErrors(mapClerkError(finalizeError).messageKey) });
    } finally {
      setSubmitting(false);
    }
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
