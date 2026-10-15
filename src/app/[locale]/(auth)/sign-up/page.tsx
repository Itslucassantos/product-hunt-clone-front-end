import { titleFrom } from "@/lib/metadata";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { AuthCard } from "@/components/features/AuthCard";
import { SignUpForm } from "@/components/features/SignUpForm";

export default async function SignUpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.signUp");

  return (
    <AuthCard title={t("title")} subtitle={t("subtitle")}>
      <Suspense>
        <SignUpForm />
      </Suspense>
    </AuthCard>
  );
}

export const generateMetadata = titleFrom("auth.signUp", "title");
