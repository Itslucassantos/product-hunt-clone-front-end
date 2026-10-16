import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { AdminForbidden } from "@/components/AdminForbidden";
import { AdminShell } from "@/components/features/AdminShell";
import { Footer } from "@/components/features/Footer";
import { Header } from "@/components/features/Header";
import { getMe } from "@/lib/api/endpoints";
import { ApiRequestError } from "@/lib/api/errors";

export const metadata: Metadata = { robots: { index: false, follow: false } };

async function isForbidden() {
  const { userId, getToken } = await auth();
  const token = userId ? await getToken() : null;
  if (!token) return false;

  try {
    return (await getMe(token)).role !== "ADMIN";
  } catch (error) {
    return error instanceof ApiRequestError && error.status === 403;
  }
}

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  setRequestLocale((await params).locale);

  if (await isForbidden()) {
    return (
      <>
        <Header />
        <main className="mx-auto w-full max-w-content flex-1 px-6 py-10">
          <AdminForbidden />
        </main>
        <Footer />
      </>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
