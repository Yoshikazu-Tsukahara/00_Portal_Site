"use client";

import { BookmarkPlus, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AppShell from "@/components/AppShell";
import { useI18n } from "@/i18n";
import { loadLocalJson, removeLocalJson, useLocalStorageState } from "@/lib/localData";
import LinkCard from "./LinkCard";
import ShortcutHelpModal from "./ShortcutHelpModal";
import TagManager from "./TagManager";
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
  extractKeepPayloadFromSearch,
  normalizeInputUrl,
  type KeepHints,
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
  /** キープは成功したがタイトル／画像が取れなかったとき */
  warning?: string;
};

export default function LinkStockerPage() {
  const { t } = useI18n();
  const copy = t.apps.linkStocker;
  const [data, setData, { hydrated }] = useLocalStorageState<LinkStockerData>(
    STORAGE_KEY,
    emptyData(),
  );

  const [urlInput, setUrlInput] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [tagManagerOpen, setTagManagerOpen] = useState(false);

  const linksRef = useRef(data.links);
  linksRef.current = data.links;
  /** 直近に自動キープした URL（二重実行防止） */
  const lastAutoKeepRef = useRef<{ url: string; at: number } | null>(null);
  const keepUrlRef = useRef<
    (raw: string, hints?: KeepHints) => Promise<boolean>
  >(async () => false);

  const links = data.links;
  const tags = data.tags;

  // 旧 v1 → v2 は「v2 未保存の初回」だけ移行。空リストを v1 で上書きしない
  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === "undefined") return;

    try {
      // すでに v2 がある（リンク0件含む）＝現在の状態が正。残存 v1 は掃除のみ
      if (window.localStorage.getItem(STORAGE_KEY) !== null) {
        if (window.localStorage.getItem(STORAGE_KEY_V1) !== null) {
          removeLocalJson(STORAGE_KEY_V1);
        }
        return;
      }
    } catch {
      return;
    }

    const legacy = loadLocalJson<unknown>(STORAGE_KEY_V1, null);
    if (!legacy) return;
    const migrated = normalizeLinkStockerData(legacy);
    if (!migrated) return;
    setData(migrated);
    removeLocalJson(STORAGE_KEY_V1);
  }, [hydrated, setData]);

  // このタブをブックマークレットの固定名に揃える
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.name = LINK_STOCKER_WINDOW_NAME;
  }, []);

  // tags プロパティ自体が壊れているときだけ補完（空配列はユーザー操作として残す）
  useEffect(() => {
    if (!hydrated) return;
    if (Array.isArray(data.tags)) return;
    setData((prev) => ({
      ...prev,
      tags: emptyData().tags,
    }));
  }, [hydrated, data.tags, setData]);

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

  function flash(message: string, ms = 1600) {
    setToast(message);
    window.setTimeout(() => setToast(null), ms);
  }

  const keepUrl = useCallback(
    async (rawUrl: string, hints: KeepHints = {}): Promise<boolean> => {
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
          body: JSON.stringify({
            url: normalized,
            title: hints.title,
            image: hints.image,
            description: hints.description,
          }),
        });
        const json = (await res.json()) as OgpResponse;

        if (!res.ok) {
          setError(json.message || copy.errors.fetchFailed);
          setUrlInput(normalized);
          return false;
        }

        const item: KeptLink = {
          id: createId(),
          url: json.url || normalized,
          title: json.title || hints.title || domainOf(normalized),
          description: json.description || hints.description || "",
          memo: "",
          image: json.image || hints.image || null,
          siteName: json.siteName,
          favicon: json.favicon,
          domain: domainOf(json.url || normalized),
          tagIds: [],
          createdAt: new Date().toISOString(),
        };

        setData((prev) => ({
          ...prev,
          tags: Array.isArray(prev.tags) ? prev.tags : emptyData().tags,
          links: [item, ...prev.links],
        }));
        setUrlInput("");
        // 本番でボット対策に弾かれた場合は、キープ成功＋注意を長めに表示
        if (json.warning === "partial") {
          flash(json.message || copy.toast.keptPartial, 4200);
        } else {
          flash(copy.toast.kept);
        }
        return true;
      } catch {
        setError(copy.errors.fetchFailed);
        setUrlInput(normalized);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [copy.errors, copy.toast.kept, copy.toast.keptPartial, setData],
  );

  keepUrlRef.current = keepUrl;

  /** クエリ / BroadcastChannel からの自動キープ（二重実行ガード付き） */
  const tryAutoKeep = useCallback(
    (raw: string, fromQuery: boolean, hints: KeepHints = {}) => {
      const normalized = normalizeInputUrl(raw);
      if (!normalized) {
        if (fromQuery) clearLinkStockerQuery();
        return;
      }

      const now = Date.now();
      const last = lastAutoKeepRef.current;
      // 同じ URL の短時間二重実行を防ぐ（BC + クエリの両方が来る想定）
      if (last && last.url === normalized && now - last.at < 4000) {
        if (fromQuery) clearLinkStockerQuery();
        return;
      }
      // 複数タブ同時受信でも 1 回だけ追加する
      try {
        const claimKey = "blank-note:link-stocker:auto-claim";
        const raw = window.localStorage.getItem(claimKey);
        if (raw) {
          const prev = JSON.parse(raw) as { url?: string; at?: number };
          if (
            prev.url === normalized &&
            typeof prev.at === "number" &&
            now - prev.at < 4000
          ) {
            if (fromQuery) clearLinkStockerQuery();
            return;
          }
        }
        window.localStorage.setItem(
          claimKey,
          JSON.stringify({ url: normalized, at: now }),
        );
      } catch {
        // ignore
      }
      lastAutoKeepRef.current = { url: normalized, at: now };

      setUrlInput(normalized);
      try {
        window.focus();
      } catch {
        // ignore
      }

      // カード追加が終わってから ?url= を消す（再実行・履歴汚染を防ぐ）
      void keepUrlRef.current(normalized, hints).finally(() => {
        if (fromQuery) clearLinkStockerQuery();
      });
    },
    [],
  );

  useEffect(() => {
    if (!hydrated) return;

    const fromSearch = () => {
      const incoming = extractKeepPayloadFromSearch(window.location.search);
      if (incoming) tryAutoKeep(incoming.url, true, incoming.hints);
    };

    fromSearch();

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(LINK_STOCKER_CHANNEL);
      channel.onmessage = (ev: MessageEvent) => {
        const msg = ev.data as {
          type?: string;
          url?: string;
          title?: string;
          image?: string;
          description?: string;
        } | null;
        if (msg?.type === "keep-request" && typeof msg.url === "string") {
          tryAutoKeep(msg.url, false, {
            title: typeof msg.title === "string" ? msg.title : undefined,
            image: typeof msg.image === "string" ? msg.image : undefined,
            description:
              typeof msg.description === "string" ? msg.description : undefined,
          });
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

  function handleCreateTag(name: string, color: string) {
    const id = createId();
    setData((prev) => ({
      ...prev,
      tags: [...prev.tags, { id, name, color }],
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
  }

  const tagManagerLabels = {
    title: copy.tagManager.title,
    newName: copy.tagManager.newName,
    create: copy.tagManager.create,
    customColor: copy.tagManager.customColor,
    deleteConfirm: copy.tagManager.deleteConfirm,
    empty: copy.tagManager.empty,
    rename: copy.tagManager.rename,
    renameDone: copy.tagManager.renameDone,
    delete: copy.tagManager.delete,
  };

  return (
    <AppShell
      title={copy.shell.title}
      description={copy.shell.description}
      isPwa
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
      {/* 内部スクロールなし：カード増加に合わせてページ全体とフッターが伸びる */}
      <div className="flex flex-col gap-3 pb-2">
        <form onSubmit={handleKeep}>
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

        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTagManagerOpen(true)}
              aria-label={copy.tagManager.buttonAria}
              className="rounded-full border border-zinc-300 bg-zinc-50 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
            >
              {copy.tagManager.button}
            </button>
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

        <div className="rounded-2xl bg-gradient-to-b from-zinc-900/5 to-transparent pb-2">
          {!hydrated ? (
            <div className="flex min-h-[40vh] items-center justify-center text-zinc-400">
              <LoaderCircle className="size-6 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white px-6 text-center">
              <p className="text-4xl" aria-hidden>
                🔗
              </p>
              <p className="mt-3 text-sm font-semibold text-zinc-800">
                {copy.empty.title}
              </p>
              <p className="mt-1.5 text-sm text-zinc-400">{copy.empty.hint}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filtered.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  allTags={tags}
                  deleteLabel={copy.card.delete}
                  deleteConfirm={copy.card.deleteConfirm}
                  noImageLabel={copy.card.noImage}
                  memoPlaceholder={copy.card.memoPlaceholder}
                  tagPickerTitle={copy.tagPicker.title}
                  tagPickerEmpty={copy.tagPicker.empty}
                  onDelete={handleDelete}
                  onUpdateMemo={handleUpdateMemo}
                  onToggleTag={handleToggleTag}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <TagManager
        open={tagManagerOpen}
        onClose={() => setTagManagerOpen(false)}
        allTags={tags}
        labels={tagManagerLabels}
        onCreateTag={handleCreateTag}
        onUpdateTag={handleUpdateTag}
        onDeleteTag={handleDeleteTag}
      />

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
          className="lunch-toast fixed left-1/2 top-20 z-[60] -translate-x-1/2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-zinc-900 shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </AppShell>
  );
}
