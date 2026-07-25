"use client";

import { BookmarkPlus, LoaderCircle } from "lucide-react";
import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { LanguageToggle, useI18n } from "@/i18n";
import { useLocalStorageState } from "@/lib/localData";
import InstallAppButton from "./InstallAppButton";
import LinkCard from "./LinkCard";
import { usePwaInstall } from "./usePwaInstall";
import {
  LINK_TAGS,
  STORAGE_KEY,
  createId,
  domainOf,
  emptyData,
  normalizeLinkStockerData,
  type KeptLink,
  type LinkStockerData,
  type LinkTag,
} from "./types";

type OgpResponse = {
  url: string;
  title: string;
  description: string;
  image: string | null;
  siteName: string | null;
  favicon: string | null;
  error?: string;
  message?: string;
};

function normalizeInputUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    const u = new URL(withProtocol);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.href;
  } catch {
    return null;
  }
}

export default function LinkStockerPage() {
  const { t } = useI18n();
  const copy = t.apps.linkStocker;
  const { isStandalone } = usePwaInstall();
  const [data, setData, { hydrated }] = useLocalStorageState<LinkStockerData>(
    STORAGE_KEY,
    emptyData(),
  );

  const [urlInput, setUrlInput] = useState("");
  const [tagDraft, setTagDraft] = useState<LinkTag | "">("");
  const [filter, setFilter] = useState<LinkTag | "all">("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const links = data.links;

  const filtered = useMemo(() => {
    const list =
      filter === "all" ? links : links.filter((l) => l.tag === filter);
    return [...list].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [links, filter]);

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1600);
  }

  async function handleKeep(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const normalized = normalizeInputUrl(urlInput);
    if (!urlInput.trim()) {
      setError(copy.errors.emptyUrl);
      return;
    }
    if (!normalized) {
      setError(copy.errors.invalidUrl);
      return;
    }

    const dup = links.some(
      (l) => l.url.replace(/\/$/, "") === normalized.replace(/\/$/, ""),
    );
    if (dup) {
      setError(copy.errors.duplicate);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ogp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized }),
      });
      const json = (await res.json()) as OgpResponse;

      if (!res.ok) {
        setError(json.message || copy.errors.fetchFailed);
        return;
      }

      const item: KeptLink = {
        id: createId(),
        url: json.url || normalized,
        title: json.title || domainOf(normalized),
        description: json.description || "",
        image: json.image,
        siteName: json.siteName,
        favicon: json.favicon,
        domain: domainOf(json.url || normalized),
        tag: tagDraft || null,
        createdAt: new Date().toISOString(),
      };

      setData((prev) => ({ links: [item, ...prev.links] }));
      setUrlInput("");
      flash(copy.toast.kept);
    } catch {
      setError(copy.errors.fetchFailed);
    } finally {
      setLoading(false);
    }
  }

  function handleDelete(id: string) {
    setData((prev) => ({ links: prev.links.filter((l) => l.id !== id) }));
    flash(copy.toast.deleted);
  }

  return (
    <AppShell
      title={copy.shell.title}
      description={copy.shell.description}
      hidePortalLink={isStandalone}
      actions={isStandalone ? <LanguageToggle /> : undefined}
      afterDataManager={<InstallAppButton copy={copy.install} />}
      dataManager={{
        appId: "link-stocker",
        fileNamePrefix: "link-stocker",
        getData: () => data,
        onImport: (raw) => {
          const parsed = normalizeLinkStockerData(raw);
          if (!parsed) return false;
          setData(parsed);
          return true;
        },
      }}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 pb-10">
        {/* 件数ハイライト（ランチ貯金の hero に相当） */}
        <section className="lunch-hero relative overflow-hidden rounded-3xl border border-emerald-200/60 px-5 py-5 text-center shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-700/80">
            {copy.stats.keptCount}
          </p>
          <p className="mt-1 text-4xl font-semibold tabular-nums tracking-tight text-emerald-800 sm:text-5xl">
            {hydrated ? links.length : "—"}
            <span className="ml-1 text-base font-medium text-emerald-700/70">
              {copy.stats.keptCountUnit}
            </span>
          </p>
        </section>

        {/* 入力カード */}
        <form
          onSubmit={handleKeep}
          className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder={copy.form.placeholder}
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={loading}
              className="min-w-0 flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none ring-emerald-400/40 focus:bg-white focus:ring-2 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !hydrated}
              className="lunch-confirm-btn !px-5 !py-2.5"
            >
              {loading ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <BookmarkPlus className="size-4" />
              )}
              <span className="ml-1.5">
                {loading ? copy.form.loading : copy.form.submit}
              </span>
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="text-[11px] font-medium text-zinc-400">
              {copy.form.tagLabel}
            </label>
            <select
              value={tagDraft}
              onChange={(e) =>
                setTagDraft((e.target.value as LinkTag | "") || "")
              }
              disabled={loading}
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-medium text-zinc-700 outline-none focus:ring-2 focus:ring-emerald-400/40"
            >
              <option value="">{copy.form.noTag}</option>
              {LINK_TAGS.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {error ? (
            <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>
          ) : null}
        </form>

        {/* 絞り込み */}
        <div className="flex flex-wrap items-center gap-2 px-0.5">
          <span className="text-[11px] font-medium text-zinc-400">
            {copy.filter.label}
          </span>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              filter === "all"
                ? "bg-emerald-600 text-white shadow-sm"
                : "border border-zinc-200 bg-white text-zinc-600 hover:border-emerald-200 hover:text-emerald-800"
            }`}
          >
            {copy.filter.all}
          </button>
          {LINK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setFilter(tag)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                filter === tag
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:border-emerald-200 hover:text-emerald-800"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* グリッド */}
        {!hydrated ? (
          <div className="flex items-center justify-center py-16 text-zinc-400">
            <LoaderCircle className="size-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-14 text-center shadow-sm">
            <p className="text-4xl" aria-hidden>
              🔗
            </p>
            <p className="mt-3 text-sm font-semibold text-zinc-800">
              {copy.empty.title}
            </p>
            <p className="mt-1.5 text-sm text-zinc-400">{copy.empty.hint}</p>
          </div>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2">
            {filtered.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                deleteLabel={copy.card.delete}
                deleteConfirm={copy.card.deleteConfirm}
                noImageLabel={copy.card.noImage}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {toast ? (
        <div
          role="status"
          className="lunch-toast fixed left-1/2 top-20 z-[60] -translate-x-1/2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </AppShell>
  );
}
