import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Logo() {
  const t = useTranslations("header");

  return (
    <Link href="/" aria-label={t("homeLabel")} className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-primary text-white"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 8l5-5 5 5" />
          <path d="M4 15l5-5 5 5" />
        </svg>
      </span>
      <span className="font-display text-2xl font-extrabold">
        P.H <span className="text-primary-text">CLONE</span>
      </span>
    </Link>
  );
}
