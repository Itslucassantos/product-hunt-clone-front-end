"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { useRateLimit } from "@/components/RateLimit";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { ApiRequestError } from "@/lib/api/errors";
import { errorMessageKey } from "@/lib/api/error-message-key";
import { fieldErrorsOf } from "@/lib/api/field-errors";
import type { Locale, TopicInput } from "@/types/api";

const LOCALES: Locale[] = ["en", "pt-BR"];

export type TopicFormValues = Record<Locale, { name: string; description: string }>;

export const EMPTY_TOPIC: TopicFormValues = {
  en: { name: "", description: "" },
  "pt-BR": { name: "", description: "" },
};

function previewSlug(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type TopicFormProps = {
  initial: TopicFormValues;

  slug?: string;
  onSubmit: (input: TopicInput) => Promise<void>;
  onCancel: () => void;
};

export function TopicForm({ initial, slug, onSubmit, onCancel }: TopicFormProps) {
  const t = useTranslations("admin.topics");
  const tErrors = useTranslations("errors");
  const tCommon = useTranslations("common");
  const tFields = useTranslations("errors.fields");
  const [values, setValues] = useState(initial);
  const [initialValues] = useState(() => JSON.stringify(initial));
  const dirty = JSON.stringify(values) !== initialValues;
  useUnsavedChangesWarning(dirty, tCommon("unsavedChanges"));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { limited, secondsLeft } = useRateLimit();

  const set = (locale: Locale, key: "name" | "description", value: string) => {
    setValues((current) => ({ ...current, [locale]: { ...current[locale], [key]: value } }));
    setErrors((current) => ({ ...current, [`${locale}.${key}`]: "" }));
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const found: Record<string, string> = {};
    for (const locale of LOCALES) {
      if (!values[locale].name.trim()) found[`${locale}.name`] = tFields("MISSING_TRANSLATION");
    }
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      await onSubmit({
        translations: {
          en: { name: values.en.name.trim(), description: values.en.description.trim() || null },
          "pt-BR": {
            name: values["pt-BR"].name.trim(),
            description: values["pt-BR"].description.trim() || null,
          },
        },
      });
    } catch (error) {
      const next: Record<string, string> = {};
      for (const { field, code } of fieldErrorsOf(error)) {
        const match = /^translations\.(en|pt-BR)\.(name|description)$/.exec(field);
        if (match)
          next[`${match[1]}.${match[2]}`] = tFields.has(code) ? tFields(code) : tFields("REQUIRED");
      }
      if (error instanceof ApiRequestError && error.code === "TOPIC_ALREADY_EXISTS") {
        const field = (error.details as { field?: string } | undefined)?.field;
        const match = field && /^translations\.(en|pt-BR)\.name$/.exec(field);
        for (const locale of match ? [match[1] as Locale] : LOCALES) {
          next[`${locale}.name`] = tFields("ALREADY_EXISTS");
        }
      }
      setErrors(next);
      if (Object.keys(next).length === 0) setFormError(tErrors(errorMessageKey(error)));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-label={slug ? t("editTitle") : t("newTitle")}
      className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-6"
    >
      <h2 className="font-display text-xl font-extrabold">
        {slug ? t("editTitle") : t("newTitle")}
      </h2>
      {formError && <Alert>{formError}</Alert>}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-6">
        {LOCALES.map((locale) => (
          <fieldset key={locale} className="flex flex-col gap-4">
            <legend className="mb-2 font-semibold">
              {t(locale === "en" ? "english" : "portuguese")}
            </legend>
            <FormField
              label={t("name")}
              value={values[locale].name}
              error={errors[`${locale}.name`]}
              onChange={(e) => set(locale, "name", e.target.value)}
            />
            <FormField
              label={t("description")}
              value={values[locale].description}
              error={errors[`${locale}.description`]}
              onChange={(e) => set(locale, "description", e.target.value)}
            />
          </fieldset>
        ))}
      </div>

      <FormField
        label={t("slug")}
        hint={t("slugHint")}
        value={slug ?? previewSlug(values.en.name)}
        readOnly
      />

      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={saving} disabled={limited}>
          {saving
            ? t("saving")
            : limited
              ? tCommon("retryIn", { seconds: secondsLeft })
              : t("save")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            if (!dirty || window.confirm(tCommon("unsavedChanges"))) onCancel();
          }}
          disabled={saving}
        >
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
