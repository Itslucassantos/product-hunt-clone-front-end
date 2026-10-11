import type { ReactNode } from "react";
import { Footer } from "@/components/features/Footer";
import { Header } from "@/components/features/Header";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-content flex-1 px-6 py-10">{children}</main>
      <Footer />
    </>
  );
}
