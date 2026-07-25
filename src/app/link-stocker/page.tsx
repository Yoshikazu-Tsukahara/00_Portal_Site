"use client";

import { BookmarkPlus, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AppShell from "@/components/AppShell";
import { LanguageToggle, useI18n } from "@/i18n";
import { loadLocalJson, useLocalStorageState } from "@/lib/localData";
import InstallAppButton from "./InstallAppButton";
import LinkCard from "./LinkCard";
import ShortcutHelpModal from "./ShortcutHelpModal";
import { usePwaInstall } from "./usePwaInstall";
import {
  LINK_STOCKER_CHANNEL,
  LINK_STOCKER_WINDOW_NAME,
  STORAGE_KEY,
  STORAGE_KEY_V1,
  createId,
  domainOf,
  emptyData,
  normalizeLinkStockerData,
  type KeptLink,
  type LinkStockerData,
} from "./types";
import {
  clearLinkStockerQuery,
  extractUrlFromSearch,
  normalizeInputUrl,
} from "./urlParams";

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

export default function LinkStockerPage() {
  const { t } = useI18n();
  const copy = t.apps.linkStocker;
  const { isStandalone } = usePwaInstall();
  const [data, setData, { hydrated }] = useLocalStorageState<LinkStockerData>(
    STORAGE_KEY,
    emptyData(),
  );

  const [urlInput, setUrlInput] = useState("");
  const [tagDraftId, setTagDraftId] = useState<string>("");
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const tagDraftRef = useRef(tagDraftId);
  tagDraftRef.current = tagDraftId;
  const linksRef = useRef(data.links);
  linksRef.current = data.links;
  /** 直近に自動キープした URL（二重実行防止） */
  const lastAutoKeepRef = useRef<{ url: string; at: number } | null>(null);
  const keepUrlRef = useRef<(raw: string) => Promise<boolean>>(async () => false);

  const links = data.links;
  const tags = data.tags;

  // 旧 v1 LocalStorage から一度だけ移行
  useEffect(() => {
    if (!hydrated) return;
    if (data.links.length > 0) return;
    const legacy = loadLocalJson<unknown>(STORAGE_KEY_V1, null);
    if (!legacy) return;
    const migrated = normalizeLinkStockerData(legacy);
    if (migrated && migrated.links.length > 0) {
      setData(migrated);
    }
  }, [hydrated, data.links.length, setData]);

  // このタブをブックマークレットの固定名に揃える
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.name = LINK_STOCKER_WINDOW_NAME;
  }, []);

  // 読み込み直後に tags 欠落を正規化
  useEffect(() => {
    if (!hydrated) return;
    if (!Array.isArray(data.tags) || data.tags.length === 0) {
      const n = normalizeLinkStockerData(data);
      if (n) setData(n);
    }
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const list =
      filter === "all"
        ? links
        : links.filter((l) => l.tagIds?.includes(filter));
    return [...list].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [links, filter]);

  const countBadge = copy.stats.badge.replace(
    "{n}",
    hydrated ? String(links.length) : "—",
  );

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 1600);
  }

  const keepUrl = useCallback(
    async (rawUrl: string): Promise<boolean> => {
      setError(null);

      const normalized = normalizeInputUrl(rawUrl);
      if (!rawUrl.trim()) {
        setError(copy.errors.emptyUrl);
        return false;
      }
      if (!normalized) {
        setError(copy.errors.invalidUrl);
        return false;
      }

      const isDup = linksRef.current.some(
        (l) => l.url.replace(/\/$/, "") === normalized.replace(/\/$/, ""),
      );
      if (isDup) {
        setError(copy.errors.duplicate);
        setUrlInput(normalized);
        return false;
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
          setUrlInput(normalized);
          return false;
        }

        const draftId = tagDraftRef.current;
        const item: KeptLink = {
          id: createId(),
          url: json.url || normalized,
          title: json.title || domainOf(normalized),
          description: json.description || "",
          memo: "",
          image: json.image,
          siteName: json.siteName,
          favicon: json.favicon,
          domain: domainOf(json.url || normalized),
          tagIds: draftId ? [draftId] : [],
          createdAt: new Date().toISOString(),
        };

        setData((prev) => ({
          ...prev,
          tags: prev.tags?.length ? prev.tags : emptyData().tags,
          links: [item, ...prev.links],
        }));
        setUrlInput("");
        flash(copy.toast.kept);
        return true;
      } catch {
        setError(copy.errors.fetchFailed);
        setUrlInput(normalized);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [copy.errors, copy.toast.kept, setData],
  );

  keepUrlRef.current = keepUrl;

  /** クエリ / BroadcastChannel からの自動キープ（二重実行ガード付き） */
  const tryAutoKeep = useCallback(
    (raw: string, fromQuery: boolean) => {
      const normalized = normalizeInputUrl(raw);
      if (!normalized) return;

      const now = Date.now();
      const last = lastAutoKeepRef.current;
      if (last && last.url === normalized && now - last.at < 4000) {
        if (fromQuery) clearLinkStockerQuery();
        return;
      }
      lastAutoKeepRef.current = { url: normalized, at: now };

      setUrlInput(normalized);
      if (fromQuery) clearLinkStockerQuery();
      void keepUrlRef.current(normalized);
      try {
        window.focus();
      } catch {
        // ignore
      }
    },
    [],
  );

  useEffect(() => {
    if (!hydrated) return;

    const fromSearch = () => {
      const incoming = extractUrlFromSearch(window.location.search);
      if (incoming) tryAutoKeep(incoming, true);
    };

    fromSearch();

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(LINK_STOCKER_CHANNEL);
      channel.onmessage = (ev: MessageEvent) => {
        const data = ev.data as { type?: string; url?: string } | null;
        if (data?.type === "keep-request" && typeof data.url === "string") {
          tryAutoKeep(data.url, false);
        }
      };
    } catch {
      // BroadcastChannel 非対応環境はクエリのみ
    }

    const onPop = () => fromSearch();
    window.addEventListener("popstate", onPop);
    window.addEventListener("focus", fromSearch);

    return () => {
      channel?.close();
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("focus", fromSearch);
    };
  }, [hydrated, tryAutoKeep]);

  async function handleKeep(e: React.FormEvent) {
    e.preventDefault();
    await keepUrl(urlInput);
  }

  function handleDelete(id: string) {
    setData((prev) => ({
      ...prev,
      links: prev.links.filter((l) => l.id !== id),
    }));
    flash(copy.toast.deleted);
  }

  function handleUpdateMemo(id: string, memo: string) {
    setData((prev) => ({
      ...prev,
      links: prev.links.map((l) => (l.id === id ? { ...l, memo } : l)),
    }));
  }

  function handleToggleTag(linkId: string, tagId: string) {
    setData((prev) => ({
      ...prev,
      links: prev.links.map((l) => {
        if (l.id !== linkId) return l;
        const has = l.tagIds.includes(tagId);
        return {
          ...l,
          tagIds: has
            ? l.tagIds.filter((id) => id !== tagId)
            : [...l.tagIds, tagId],
        };
      }),
    }));
  }

  function handleCreateTag(linkId: string, name: string, color: string) {
    const id = createId();
    setData((prev) => ({
      tags: [...prev.tags, { id, name, color }],
      links: prev.links.map((l) =>
        l.id === linkId ? { ...l, tagIds: [...l.tagIds, id] } : l,
      ),
    }));
  }

  function handleUpdateTag(
    tagId: string,
    patch: { name?: string; color?: string },
  ) {
    setData((prev) => ({
      ...prev,
      tags: prev.tags.map((t) =>
        t.id === tagId
          ? {
              ...t,
              name: patch.name !== undefined ? patch.name : t.name,
              color: patch.color !== undefined ? patch.color : t.color,
            }
          : t,
      ),
    }));
  }

  function handleDeleteTag(tagId: string) {
    setData((prev) => ({
      tags: prev.tags.filter((t) => t.id !== tagId),
      links: prev.links.map((l) => ({
        ...l,
        tagIds: l.tagIds.filter((id) => id !== tagId),
      })),
    }));
    if (filter === tagId) setFilter("all");
    if (tagDraftId === tagId) setTagDraftId("");
  }

  const tagEditorLabels = {
    title: copy.tagEditor.title,
    newName: copy.tagEditor.newName,
    create: copy.tagEditor.create,
    customColor: copy.tagEditor.customColor,
    apply: copy.tagEditor.apply,
  };

  return (
    <AppShell
      title={copy.shell.title}
      fillViewport
      wide
      hidePortalLink={isStandalone}
      afterDataManager={<InstallAppButton copy={copy.install} />}
      actions={isStandalone ? <LanguageToggle /> : undefined}
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
      <div className="flex h-[calc(100dvh-9.5rem)] min-h-[18rem] flex-col gap-2 sm:h-[calc(100dvh-8.5rem)]">
        <form onSubmit={handleKeep} className="shrink-0">
          <div className="flex items-center gap-2">
            <input
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder={copy.form.placeholder}
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={loading}
              className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none ring-emerald-400/40 focus:ring-2 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !hydrated}
              className="lunch-confirm-btn shrink-0 !rounded-xl !px-3.5 !py-2"
            >
              {loading ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <BookmarkPlus className="size-4" />
              )}
              <span className="ml-1">
                {loading ? copy.form.loading : copy.form.submit}
              </span>
            </button>
          </div>
          {error ? (
            <p className="mt-1 text-[11px] font-medium text-rose-600">{error}</p>
          ) : null}
        </form>

        <div className="flex shrink-0 items-center gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            <select
              value={tagDraftId}
              onChange={(e) => setTagDraftId(e.target.value)}
              disabled={loading}
              aria-label={copy.form.tagLabel}
              className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 outline-none focus:ring-2 focus:ring-emerald-400/40"
            >
              <option value="">
                {copy.form.tagLabel}: {copy.form.noTag}
              </option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {copy.form.tagLabel}: {tag.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                filter === "all"
                  ? "bg-emerald-600 text-white"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:border-emerald-200"
              }`}
            >
              {copy.filter.all}
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => setFilter(tag.id)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                  filter === tag.id
                    ? "text-white"
                    : "border border-zinc-200 bg-white text-zinc-600 hover:opacity-90"
                }`}
                style={
                  filter === tag.id
                    ? { backgroundColor: tag.color }
                    : { borderColor: `${tag.color}55`, color: tag.color }
                }
              >
                {tag.name}
              </button>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-emerald-800 ring-1 ring-emerald-200/80">
              {countBadge}
            </span>
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              aria-label={copy.help.buttonAria}
              className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-600 shadow-sm transition hover:border-emerald-200 hover:text-emerald-800"
            >
              {copy.help.button}
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-2xl bg-gradient-to-b from-zinc-900/5 to-transparent pb-4">
          {!hydrated ? (
            <div className="flex h-full min-h-[40vh] items-center justify-center text-zinc-400">
              <LoaderCircle className="size-6 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-full min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white px-6 text-center">
              <p className="text-4xl" aria-hidden>
                🔗
              </p>
              <p className="mt-3 text-sm font-semibold text-zinc-800">
                {copy.empty.title}
              </p>
              <p className="mt-1.5 text-sm text-zinc-400">{copy.empty.hint}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  allTags={tags}
                  deleteLabel={copy.card.delete}
                  deleteConfirm={copy.card.deleteConfirm}
                  noImageLabel={copy.card.noImage}
                  memoPlaceholder={copy.card.memoPlaceholder}
                  tagEditorLabels={tagEditorLabels}
                  onDelete={handleDelete}
                  onUpdateMemo={handleUpdateMemo}
                  onToggleTag={handleToggleTag}
                  onCreateTag={handleCreateTag}
                  onUpdateTag={handleUpdateTag}
                  onDeleteTag={handleDeleteTag}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ShortcutHelpModal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title={copy.help.modalTitle}
        bookmarkletTitle={copy.bookmarklet.title}
        bookmarkletHint={copy.bookmarklet.hint}
        dragLabel={copy.bookmarklet.dragLabel}
        shareHint={copy.share.hint}
        closeLabel={copy.help.close}
      />

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
