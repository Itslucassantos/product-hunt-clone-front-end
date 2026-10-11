import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { AuthCard } from "@/components/features/AuthCard";
import { SignInForm } from "@/components/features/SignInForm";

export default async function SignInPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.signIn");

  return (
    <AuthCard title={t("title")} subtitle={t("subtitle")}>
      <Suspense>
        <SignInForm />
      </Suspense>
    </AuthCard>
  );
}
