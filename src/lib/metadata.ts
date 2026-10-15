import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type LocaleParams = { params: Promise<{ locale: string }> };

export const titleFrom =
  (namespace: string, key: string, { absolute = false } = {}) =>
  async ({ params }: LocaleParams): Promise<Metadata> => {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace });
    return { title: absolute ? { absolute: t(key) } : t(key) };
  };

export const adminTitleFrom =
  (key: string) =>
  async ({ params }: LocaleParams): Promise<Metadata> => {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "admin" });
    return { title: `${t("badge")} · ${t(key)}` };
  };
