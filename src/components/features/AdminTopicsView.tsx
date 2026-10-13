"use client";

import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useAuthToken } from "@/hooks/useAuthToken";
import { Link } from "@/i18n/navigation";
import {
  createTopic,
  deleteTopic,
  listTopics,
  reorderTopics,
  updateTopic,
} from "@/lib/api/endpoints";
import { errorMessageKey } from "@/lib/api/error-message-key";
import { ApiRequestError } from "@/lib/api/errors";
import type { Locale, Topic, TopicInUseDetails, TopicInput } from "@/types/api";
import { EMPTY_TOPIC, TopicForm, type TopicFormValues } from "./TopicForm";

type AdminTopic = { id: string; slug: string; productCount: number; en: Topic; ptBR: Topic };

const LOCALES: Locale[] = ["en", "pt-BR"];

function ArrowButton({
  direction,
  label,
  disabled,
  onClick,
}: {
  direction: "up" | "down";
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-xl border border-border-strong disabled:opacity-40"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={direction === "up" ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"} />
      </svg>
    </button>
  );
}

export function AdminTopicsView() {
  const t = useTranslations("admin.topics");
  const tError = useTranslations("errors");
  const toast = useToast();
  const queryClient = useQueryClient();
  const getAuthToken = useAuthToken();

  const [en, ptBR] = useQueries({
    queries: LOCALES.map((locale) => ({
      queryKey: ["topics", locale],

      queryFn: () => listTopics(locale, { fresh: true }),
      staleTime: 0,
    })),
  });

  const [editing, setEditing] = useState<"new" | AdminTopic | null>(null);
  const [toDelete, setToDelete] = useState<AdminTopic | null>(null);
  const [blocked, setBlocked] = useState<{ topic: AdminTopic; details: TopicInUseDetails } | null>(
    null,
  );

  const topics: AdminTopic[] =
    en.data?.map((topic) => ({
      id: topic.id,
      slug: topic.slug,
      productCount: topic.productCount,
      en: topic,
      ptBR: ptBR.data?.find((x) => x.id === topic.id) ?? topic,
    })) ?? [];

  const invalidate = () => {
    for (const key of ["topics", "products", "admin-products"]) {
      queryClient.invalidateQueries({ queryKey: [key] });
    }
  };

  const remove = useMutation({
    mutationFn: async (topic: AdminTopic) => deleteTopic(topic.id, await getAuthToken()),
    onSuccess: (_, topic) => {
      toast.success(t("deleted", { name: topic.en.name }));
      setToDelete(null);
      invalidate();
    },
    onError: (error, topic) => {
      setToDelete(null);
      if (error instanceof ApiRequestError && error.code === "TOPIC_IN_USE") {
        setBlocked({ topic, details: error.details as TopicInUseDetails });
      } else {
        toast.error(tError(errorMessageKey(error)));
      }
    },
  });

  const reorder = useMutation({
    mutationFn: async (ids: string[]) => reorderTopics(ids, await getAuthToken()),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ["topics"] });
      const previous = LOCALES.map(
        (l) => [l, queryClient.getQueryData<Topic[]>(["topics", l])] as const,
      );
      for (const locale of LOCALES) {
        queryClient.setQueryData<Topic[]>(
          ["topics", locale],
          (list) => list && ids.map((id) => list.find((x) => x.id === id)!),
        );
      }
      return { previous };
    },
    onError: (error, _ids, context) => {
      for (const [locale, data] of context?.previous ?? []) {
        queryClient.setQueryData(["topics", locale], data);
      }
      toast.error(tError(errorMessageKey(error)));
      invalidate();
    },
    onSuccess: () => invalidate(),
  });

  const move = (index: number, delta: -1 | 1) => {
    const ids = topics.map((x) => x.id);
    [ids[index], ids[index + delta]] = [ids[index + delta], ids[index]];
    reorder.mutate(ids);
  };

  async function save(input: TopicInput) {
    const token = await getAuthToken();
    if (editing === "new") await createTopic(input, token);
    else if (editing) await updateTopic(editing.id, input, token);
    toast.success(t("saved"));
    setEditing(null);
    invalidate();
  }

  const initial: TopicFormValues =
    editing && editing !== "new"
      ? {
          en: { name: editing.en.name, description: editing.en.description ?? "" },
          "pt-BR": { name: editing.ptBR.name, description: editing.ptBR.description ?? "" },
        }
      : EMPTY_TOPIC;

  const pending = en.isPending || ptBR.isPending;
  const error = en.error ?? ptBR.error;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">{t("title")}</h1>
        {!editing && <Button onClick={() => setEditing("new")}>{t("new")}</Button>}
      </div>

      {editing && (
        <TopicForm
          key={editing === "new" ? "new" : editing.id}
          initial={initial}
          slug={editing === "new" ? undefined : editing.slug}
          onSubmit={save}
          onCancel={() => setEditing(null)}
        />
      )}

      {pending && <Skeleton label={t("loading")} height="h-20" />}
      {error && (
        <ErrorState
          error={error}
          onRetry={() => {
            en.refetch();
            ptBR.refetch();
          }}
        />
      )}

      {en.data && ptBR.data && topics.length === 0 && (
        <EmptyState
          title={t("emptyTitle")}
          text={t("emptyText")}
          action={<Button onClick={() => setEditing("new")}>{t("new")}</Button>}
        />
      )}

      {topics.length > 0 && (
        <ul className="flex flex-col gap-3">
          {topics.map((topic, index) => (
            <li
              key={topic.id}
              className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-border bg-surface p-4"
            >
              <dl className="flex min-w-0 flex-1 basis-72 flex-wrap gap-x-8 gap-y-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">EN</dt>
                  <dd className="font-semibold">{topic.en.name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">PT</dt>
                  <dd className="font-semibold">{topic.ptBR.name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {t("slug")}
                  </dt>
                  <dd className="font-mono text-sm">{topic.slug}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {t("products")}
                  </dt>
                  <dd className="font-semibold">{topic.productCount}</dd>
                </div>
              </dl>

              <div className="flex flex-wrap items-center gap-2">
                <ArrowButton
                  direction="up"
                  label={t("moveUp", { name: topic.en.name })}
                  disabled={index === 0 || reorder.isPending}
                  onClick={() => move(index, -1)}
                />
                <ArrowButton
                  direction="down"
                  label={t("moveDown", { name: topic.en.name })}
                  disabled={index === topics.length - 1 || reorder.isPending}
                  onClick={() => move(index, 1)}
                />
                <button
                  type="button"
                  aria-label={t("editLabel", { name: topic.en.name })}
                  onClick={() => setEditing(topic)}
                  className="inline-flex min-h-11 items-center rounded-xl border border-border-strong px-4 text-[15px] font-semibold"
                >
                  {t("edit")}
                </button>
                <button
                  type="button"
                  aria-label={t("deleteLabel", { name: topic.en.name })}
                  onClick={() => setToDelete(topic)}
                  className="inline-flex min-h-11 items-center rounded-xl px-4 text-[15px] font-semibold text-danger"
                >
                  {t("delete")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title={t("deleteTitle", { name: toDelete?.en.name ?? "" })}
        description={t("deleteBody")}
        cancelLabel={t("cancel")}
        confirmLabel={t("delete")}
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete)}
      />

      <ConfirmDialog
        open={blocked !== null}
        variant="blocked"
        title={t("blockedTitle", { name: blocked?.topic.en.name ?? "" })}
        description={t("blockedBody", { count: blocked?.details.total ?? 0 })}
        cancelLabel={t("gotIt")}
        onCancel={() => setBlocked(null)}
        extraAction={
          <Link
            href="/admin/products"
            className="inline-flex min-h-11 items-center rounded-xl border border-border-strong px-5 text-[15px] font-semibold"
          >
            {t("viewProducts")}
          </Link>
        }
      >
        {blocked && (
          <ul className="mt-3 list-inside list-disc text-sm font-semibold">
            {blocked.details.products.map((product) => (
              <li key={product.productId}>{product.title}</li>
            ))}
            {blocked.details.total > blocked.details.products.length && (
              <li className="list-none text-muted">
                {t("andMore", { count: blocked.details.total - blocked.details.products.length })}
              </li>
            )}
          </ul>
        )}
      </ConfirmDialog>
    </div>
  );
}
