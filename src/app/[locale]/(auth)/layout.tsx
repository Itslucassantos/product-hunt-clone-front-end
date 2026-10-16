import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthHeader } from "@/components/features/AuthHeader";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AuthHeader />
      <main className="flex flex-1 items-start justify-center px-6 py-12 sm:items-center">
        {children}
      </main>
    </>
  );
}
