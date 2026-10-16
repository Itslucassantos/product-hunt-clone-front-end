"use client";

import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRateLimit } from "@/components/RateLimit";
import { Button } from "@/components/ui/Button";
import { FieldError } from "@/components/ui/FieldError";
import { FormField } from "@/components/ui/FormField";
import { FormTextarea } from "@/components/ui/FormTextarea";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StarRatingInput } from "@/components/ui/StarRatingInput";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";
import { useAuthToken } from "@/hooks/useAuthToken";
import { useTopics } from "@/hooks/useTopics";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { Link, useRouter } from "@/i18n/navigation";
import { createProduct, removeReview, saveReview, updateProduct } from "@/lib/api/endpoints";
import { errorMessageKey } from "@/lib/api/error-message-key";
import { ApiRequestError } from "@/lib/api/errors";
import { fieldErrorsOf } from "@/lib/api/field-errors";
import { uploadProductImage } from "@/lib/api/upload";
import type { ProductDetail, ProductStatus } from "@/types/api";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/png", "image/jpeg"];

type SaveStep = "upload" | "product" | "review";

type FieldKey =
  "image" | "title" | "description" | "longDescription" | "url" | "topicIds" | "rating" | "summary";
type Errors = Partial<Record<FieldKey, string>>;

const SERVER_FIELD: Record<string, FieldKey> = { imageUrl: "image", file: "image" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
      <h2 className="font-display text-xl font-extrabold">{title}</h2>
      {children}
    </section>
  );
}

export function ProductForm({ product }: { product?: ProductDetail }) {
  const t = useTranslations("admin.form");
  const tErrors = useTranslations("errors");
  const tFields = useTranslations("errors.fields");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const getAuthToken = useAuthToken();
  const topics = useTopics({ fresh: true });

  const [title, setTitle] = useState(product?.title ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [longDescription, setLongDescription] = useState(product?.longDescription ?? "");
  const [url, setUrl] = useState(product?.url ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(product?.imageUrl ?? null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [topicIds, setTopicIds] = useState<string[]>(product?.topics.map((x) => x.id) ?? []);
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? "PUBLISHED");
  const [reviewed, setReviewed] = useState(product?.review != null);
  const [rating, setRating] = useState(product?.review?.rating ?? 0);
  const [summary, setSummary] = useState(product?.review?.summary ?? "");

  const snapshot = JSON.stringify({
    title,
    description,
    longDescription,
    url,
    imageUrl,
    hasNewImage: imageFile !== null,
    topicIds: [...topicIds].sort(),
    status,
    reviewed,
    rating,
    summary,
  });
  const [initialSnapshot] = useState(snapshot);
  useUnsavedChangesWarning(snapshot !== initialSnapshot, tCommon("unsavedChanges"));

  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<{
    title: string;
    message: string;
    technical: string | null;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const { limited, secondsLeft } = useRateLimit();
  const [progress, setProgress] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);

  const summaryRef = useRef<HTMLDivElement>(null);

  const savedIdRef = useRef<string | null>(null);
  const reviewRemovedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const chooseFile = (file: File | null) => {
    setImageFile(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const errorEntries = Object.entries(errors) as [FieldKey, string][];
  const errorCount = errorEntries.length;
  const focusedAttemptRef = useRef(0);
  useEffect(() => {
    if (attempt === focusedAttemptRef.current || errorCount === 0) return;
    focusedAttemptRef.current = attempt;
    summaryRef.current?.focus();
  }, [attempt, errorCount]);

  const labels: Record<FieldKey, string> = {
    image: t("image"),
    title: t("name"),
    description: t("shortDescription"),
    longDescription: t("fullDescription"),
    url: t("site"),
    topicIds: t("topics"),
    rating: t("rating"),
    summary: t("reviewSummary"),
  };

  const clear = (key: FieldKey) =>
    setErrors((current) => {
      if (!current[key]) return current;
      const rest = { ...current };
      delete rest[key];
      return rest;
    });

  function pickImage(file: File | null) {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      setErrors((c) => ({ ...c, image: t("errors.imageType") }));
    } else if (file.size > MAX_IMAGE_BYTES) {
      setErrors((c) => ({ ...c, image: t("errors.imageSize") }));
    } else {
      clear("image");
      chooseFile(file);
    }
  }

  function validate(): Errors {
    const found: Errors = {};
    if (!title.trim()) found.title = tFields("REQUIRED");
    if (!description.trim()) found.description = tFields("REQUIRED");
    if (!url.trim()) found.url = tFields("REQUIRED");
    else if (!/^https:\/\/\S+$/i.test(url.trim())) found.url = tFields("INVALID_URL");
    if (topicIds.length === 0) found.topicIds = t("errors.chooseTopic");
    if (reviewed) {
      if (rating < 1 || rating > 5) found.rating = tFields("OUT_OF_RANGE");
      if (!summary.trim()) found.summary = tFields("REQUIRED");
    }
    return found;
  }

  function handleSaveError(error: unknown, step: SaveStep) {
    const next: Errors = {};
    for (const { field, code } of fieldErrorsOf(error)) {
      const root = field.split(".")[0];
      const key = (SERVER_FIELD[root] ?? root) as FieldKey;
      if (key in labels) next[key] = tFields.has(code) ? tFields(code) : tFields("INVALID_VALUE");
    }
    if (error instanceof ApiRequestError) {
      if (error.code === "PRODUCT_ALREADY_EXISTS") next.title = tErrors("PRODUCT_ALREADY_EXISTS");
      else if (error.code === "IMAGE_TOO_LARGE") next.image = t("errors.imageSize");
      else if (error.code === "UNSUPPORTED_IMAGE_TYPE") next.image = t("errors.imageType");
      else if (error.code === "UPSTREAM_ERROR" && progress !== null)
        next.image = t("errors.imageUpstream");
      else if (error.code === "TOPIC_NOT_FOUND") {
        next.topicIds = t("errors.topicRemoved");
        queryClient.invalidateQueries({ queryKey: ["topics"] });
      }
    }
    setErrors(next);
    if (Object.keys(next).length === 0) {
      const technical =
        error instanceof ApiRequestError
          ? [
              error.code ?? "NETWORK_ERROR",
              error.status,
              error.requestId && tCommon("requestId", { id: error.requestId }),
            ]
              .filter(Boolean)
              .join(" · ")
          : error instanceof Error
            ? error.message
            : null;
      setFormError({
        title: t(`steps.${step}`),
        message: tErrors(errorMessageKey(error)),
        technical,
      });
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setAttempt((n) => n + 1);

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    let step: SaveStep = "upload";
    setSaving(true);
    try {
      const token = await getAuthToken();

      let finalImageUrl = imageUrl;
      if (imageFile) {
        setProgress(0);
        finalImageUrl = await uploadProductImage(imageFile, token, setProgress);
        setImageUrl(finalImageUrl);
        chooseFile(null);
      }
      setProgress(null);

      const input = {
        title: title.trim(),
        description: description.trim(),
        longDescription: longDescription.trim() || null,
        url: url.trim(),
        imageUrl: finalImageUrl,
        status,
        topicIds,
      };
      step = "product";
      const id = savedIdRef.current ?? product?.id;
      let savedId: string;
      if (id) {
        await updateProduct(id, input, token);
        savedId = id;
      } else {
        savedId = (await createProduct(input, token)).id;
      }
      savedIdRef.current = savedId;
      step = "review";

      if (reviewed) {
        await saveReview(savedId, { rating, summary: summary.trim() }, token);
      } else if (product?.review && !reviewRemovedRef.current) {
        try {
          await removeReview(savedId, token);
        } catch (error) {
          if (!(error instanceof ApiRequestError && error.code === "REVIEW_NOT_FOUND")) throw error;
        }
        reviewRemovedRef.current = true;
      }

      for (const key of ["products", "topics", "admin-products"]) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      toast.success(t("saved"));
      router.push("/admin/products");
    } catch (error) {
      setProgress(null);
      handleSaveError(error, step);
      setAttempt((n) => n + 1);
    } finally {
      setSaving(false);
    }
  }

  const shownImage = preview ?? imageUrl;
  const toggleTopic = (id: string) => {
    clear("topicIds");
    setTopicIds((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  };

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Link
          href="/admin/products"
          className="inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-muted hover:underline"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          {t("back")}
        </Link>
        <h1 className="font-display text-4xl font-extrabold tracking-tight">
          {product ? t("editTitle") : t("newTitle")}
        </h1>
      </div>

      {(errorEntries.length > 0 || formError) && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="flex flex-col gap-2 rounded-2xl border border-danger p-4 text-danger"
        >
          {errorEntries.length > 0 && (
            <>
              <p className="font-semibold">{t("fixFields", { count: errorEntries.length })}</p>
              <ul className="list-inside list-disc text-sm">
                {errorEntries.map(([key, message]) => (
                  <li key={key}>
                    <a
                      href={`#field-${key}`}
                      className="underline"
                      onClick={(event) => {
                        event.preventDefault();
                        document.getElementById(`field-${key}`)?.focus();
                      }}
                    >
                      {labels[key]}
                    </a>
                    : {message}
                  </li>
                ))}
              </ul>
            </>
          )}
          {formError && (
            <>
              <p className="font-semibold">{formError.title}</p>
              <p className="text-sm">{formError.message}</p>
              {formError.technical && <p className="text-xs opacity-80">{formError.technical}</p>}
            </>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-start gap-8">
        <div className="flex min-w-0 grow-[999] basis-[520px] flex-col gap-8">
          <Section title={t("details")}>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold">{t("image")}</span>
              <div className="flex flex-wrap items-center gap-4">
                {shownImage ? (
                  <Image
                    src={shownImage}
                    alt=""
                    width={96}
                    height={96}
                    unoptimized
                    className="h-24 w-24 rounded-2xl object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed border-[color:var(--dashed)] font-display text-4xl font-extrabold uppercase text-ink-soft"
                  >
                    {title.trim().charAt(0) || "?"}
                  </span>
                )}
                <div className="flex flex-col items-start gap-2">
                  <label className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-border-strong px-4 text-[15px] font-semibold focus-within:outline focus-within:outline-2">
                    {shownImage ? t("changeImage") : t("chooseImage")}
                    <input
                      id="field-image"
                      type="file"
                      accept="image/png,image/jpeg"
                      className="sr-only"
                      aria-invalid={errors.image ? true : undefined}
                      aria-describedby="image-hint image-error"
                      onChange={(event) => {
                        pickImage(event.target.files?.[0] ?? null);
                        event.target.value = "";
                      }}
                    />
                  </label>
                  {shownImage && (
                    <button
                      type="button"
                      onClick={() => {
                        chooseFile(null);
                        setImageUrl(null);
                      }}
                      className="min-h-11 px-1 text-sm font-semibold text-danger"
                    >
                      {t("removeImage")}
                    </button>
                  )}
                </div>
              </div>
              <p id="image-hint" className="text-[13px] text-muted">
                {t("imageHint")}
              </p>
              {errors.image && <FieldError id="image-error">{errors.image}</FieldError>}
              {progress !== null && <ProgressBar value={progress} label={t("uploading")} />}
            </div>

            <FormField
              fieldId="field-title"
              label={t("name")}
              value={title}
              maxLength={120}
              error={errors.title}
              onChange={(e) => {
                setTitle(e.target.value);
                clear("title");
              }}
            />
            <FormTextarea
              fieldId="field-description"
              label={t("shortDescription")}
              hint={t("shortDescriptionHint")}
              className="min-h-20"
              value={description}
              error={errors.description}
              onChange={(e) => {
                setDescription(e.target.value);
                clear("description");
              }}
            />
            <FormTextarea
              fieldId="field-longDescription"
              label={t("fullDescription")}
              hint={t("fullDescriptionHint")}
              className="min-h-40"
              value={longDescription}
              error={errors.longDescription}
              onChange={(e) => {
                setLongDescription(e.target.value);
                clear("longDescription");
              }}
            />
            <FormField
              fieldId="field-url"
              label={t("site")}
              type="url"
              inputMode="url"
              placeholder="https://"
              hint={t("siteHint")}
              value={url}
              error={errors.url}
              onChange={(e) => {
                setUrl(e.target.value);
                clear("url");
              }}
            />
          </Section>
        </div>

        <div className="flex grow basis-[320px] flex-col gap-8">
          <Section title={t("topics")}>
            <fieldset
              id="field-topicIds"
              tabIndex={-1}
              aria-describedby={errors.topicIds ? "topics-error" : undefined}
            >
              <legend className="sr-only">{t("topics")}</legend>
              {topics.isPending && <p className="text-sm text-muted">{t("loadingTopics")}</p>}
              {topics.isError && (
                <button
                  type="button"
                  onClick={() => topics.refetch()}
                  className="text-sm font-semibold underline"
                >
                  {tErrors(errorMessageKey(topics.error))} {t("retry")}
                </button>
              )}
              <div className="flex flex-wrap gap-2">
                {topics.data?.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    aria-pressed={topicIds.includes(topic.id)}
                    onClick={() => toggleTopic(topic.id)}
                    className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${
                      topicIds.includes(topic.id)
                        ? "border-primary bg-primary text-white"
                        : "border-border-strong"
                    }`}
                  >
                    {topic.name}
                  </button>
                ))}
              </div>
              {errors.topicIds && <FieldError id="topics-error">{errors.topicIds}</FieldError>}
            </fieldset>
          </Section>

          <Section title={t("publishing")}>
            <Switch
              checked={status === "PUBLISHED"}
              onChange={(on) => setStatus(on ? "PUBLISHED" : "COMING_SOON")}
              label={status === "PUBLISHED" ? t("published") : t("comingSoon")}
            />
            <p className="text-[13px] text-muted">{t("publishingHint")}</p>
          </Section>

          <Section title={t("review")}>
            <Switch checked={reviewed} onChange={setReviewed} label={t("reviewedByUs")} />
            {reviewed && (
              <>
                <div>
                  <span className="mb-1 block text-sm font-semibold">{t("rating")}</span>
                  <StarRatingInput
                    value={rating}
                    onChange={(value) => {
                      setRating(value);
                      clear("rating");
                    }}
                  />
                  {errors.rating && <FieldError id="rating-error">{errors.rating}</FieldError>}
                </div>
                <FormTextarea
                  fieldId="field-summary"
                  label={t("reviewSummary")}
                  value={summary}
                  error={errors.summary}
                  onChange={(e) => {
                    setSummary(e.target.value);
                    clear("summary");
                  }}
                />
              </>
            )}
          </Section>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          loading={saving}
          disabled={limited}
          className="min-h-12 flex-1 sm:min-w-40 sm:flex-none"
        >
          {saving
            ? t("saving")
            : limited
              ? tCommon("retryIn", { seconds: secondsLeft })
              : t("save")}
        </Button>
        <Link
          href="/admin/products"
          className="inline-flex min-h-12 flex-1 items-center justify-center sm:min-w-40 sm:flex-none rounded-xl border border-border-strong px-5 text-[15px] font-semibold"
        >
          {t("cancel")}
        </Link>
      </div>
    </form>
  );
}
