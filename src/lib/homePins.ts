/**
 * ホーム画面のピン留め（インストール）アプリ — LocalStorage。
 * ルートはアプリ／フォルダの混在。フォルダはネストしない。
 */

import { useCallback, useMemo } from "react";
import { findToolById, getAllTools, type Tool } from "@/data/tools";
import { useLocalStorageState } from "@/lib/localData";

/** LocalStorage キー（旧 string[] も同一キーでマイグレーション） */
export const HOME_PINS_STORAGE_KEY = "blank-note:home-pins";

export type HomeAppItem = { type: "app"; id: string };
export type HomeFolderItem = {
  type: "folder";
  id: string;
  name: string;
  appIds: string[];
};
export type HomeItem = HomeAppItem | HomeFolderItem;

/** 初回訪問時に並べておく実用アプリ（直感的な見本） */
export const DEFAULT_HOME_PINS: string[] = [
  "invoice-maker",
  "mail-template",
  "pdf-editor",
];

export const DEFAULT_HOME_ITEMS: HomeItem[] = DEFAULT_HOME_PINS.map((id) => ({
  type: "app" as const,
  id,
}));

export { findToolById, getAllTools };
export type { Tool };

function newFolderId(): string {
  return `folder-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return Boolean(x) && typeof x === "object";
}

/** ルート上のアイテム ID（アプリ＝toolId、フォルダ＝folderId） */
export function homeItemKey(item: HomeItem): string {
  return item.id;
}

/** LocalStorage の生データ（旧 string[] 含む）を正規化 */
export function normalizeHomeItems(raw: unknown): HomeItem[] {
  if (!Array.isArray(raw)) return [...DEFAULT_HOME_ITEMS];

  // 旧形式: string[]
  if (raw.length === 0 || raw.every((x) => typeof x === "string")) {
    const seen = new Set<string>();
    const apps: HomeItem[] = [];
    for (const id of raw as string[]) {
      if (typeof id !== "string" || !id || seen.has(id)) continue;
      seen.add(id);
      apps.push({ type: "app", id });
    }
    return collapseFolders(apps);
  }

  const seenApps = new Set<string>();
  const seenFolderIds = new Set<string>();
  const items: HomeItem[] = [];

  for (const entry of raw) {
    if (!isRecord(entry)) continue;
    if (entry.type === "app" && typeof entry.id === "string" && entry.id) {
      if (seenApps.has(entry.id)) continue;
      seenApps.add(entry.id);
      items.push({ type: "app", id: entry.id });
      continue;
    }
    if (entry.type === "folder" && typeof entry.id === "string" && entry.id) {
      if (seenFolderIds.has(entry.id)) continue;
      const appIds = Array.isArray(entry.appIds)
        ? entry.appIds.filter((id): id is string => typeof id === "string" && Boolean(id))
        : [];
      const unique: string[] = [];
      for (const id of appIds) {
        if (seenApps.has(id)) continue;
        seenApps.add(id);
        unique.push(id);
      }
      seenFolderIds.add(entry.id);
      items.push({
        type: "folder",
        id: entry.id,
        name: typeof entry.name === "string" ? entry.name : "",
        appIds: unique,
      });
    }
  }

  return collapseFolders(items);
}

/** 0〜1 個のフォルダを解消 */
export function collapseFolders(items: HomeItem[]): HomeItem[] {
  const next: HomeItem[] = [];
  for (const item of items) {
    if (item.type !== "folder") {
      next.push(item);
      continue;
    }
    if (item.appIds.length === 0) continue;
    if (item.appIds.length === 1) {
      const only = item.appIds[0];
      if (only) next.push({ type: "app", id: only });
      continue;
    }
    next.push(item);
  }
  return next;
}

function collectPinnedIds(items: HomeItem[]): Set<string> {
  const ids = new Set<string>();
  for (const item of items) {
    if (item.type === "app") ids.add(item.id);
    else item.appIds.forEach((id) => ids.add(id));
  }
  return ids;
}

function rootIndexOf(items: HomeItem[], id: string): number {
  return items.findIndex((item) => item.id === id);
}

function removeRootItem(items: HomeItem[], id: string): HomeItem[] {
  return items.filter((item) => item.id !== id);
}

/** 合成結果。不可なら null */
function combineRootItems(
  prev: HomeItem[],
  activeId: string,
  overId: string,
): HomeItem[] | null {
  const from = rootIndexOf(prev, activeId);
  const to = rootIndexOf(prev, overId);
  if (from < 0 || to < 0 || from === to) return null;

  const active = prev[from];
  const over = prev[to];
  if (!active || !over || active.type !== "app") return null;

  if (over.type === "folder") {
    if (over.appIds.includes(active.id)) return null;
    const without = removeRootItem(prev, active.id);
    const folderIdx = rootIndexOf(without, over.id);
    if (folderIdx < 0) return null;
    const folder = without[folderIdx];
    if (!folder || folder.type !== "folder") return null;
    const next = [...without];
    next[folderIdx] = {
      ...folder,
      appIds: [...folder.appIds, active.id],
    };
    return next;
  }

  const folder: HomeFolderItem = {
    type: "folder",
    id: newFolderId(),
    name: "",
    appIds: [over.id, active.id],
  };
  const next = prev.filter((_, i) => i !== from && i !== to);
  const insertAt = from < to ? to - 1 : to;
  next.splice(insertAt, 0, folder);
  return next;
}

/** 次アイテムとの合成。成功時は [next, folderId] */
function groupWithNextItem(
  prev: HomeItem[],
  id: string,
): { next: HomeItem[]; folderId: string } | null {
  const from = rootIndexOf(prev, id);
  if (from < 0 || from >= prev.length - 1) return null;
  const active = prev[from];
  const nextItem = prev[from + 1];
  if (!active || !nextItem || active.type !== "app") return null;

  if (nextItem.type === "folder") {
    if (nextItem.appIds.includes(active.id)) return null;
    const without = removeRootItem(prev, active.id);
    const folderIdx = rootIndexOf(without, nextItem.id);
    if (folderIdx < 0) return null;
    const folder = without[folderIdx];
    if (!folder || folder.type !== "folder") return null;
    const next = [...without];
    next[folderIdx] = {
      ...folder,
      appIds: [...folder.appIds, active.id],
    };
    return { next, folderId: folder.id };
  }

  const folder: HomeFolderItem = {
    type: "folder",
    id: newFolderId(),
    name: "",
    appIds: [active.id, nextItem.id],
  };
  const next = prev.filter((_, i) => i !== from && i !== from + 1);
  next.splice(from, 0, folder);
  return { next, folderId: folder.id };
}

/** ピン留め ID 配列の状態フック（インストール＝ホーム追加） */
export function useHomePins() {
  const [raw, setRaw, meta] = useLocalStorageState<unknown>(
    HOME_PINS_STORAGE_KEY,
    DEFAULT_HOME_ITEMS,
  );

  const items = useMemo(() => normalizeHomeItems(raw), [raw]);

  const setItems = useCallback(
    (next: HomeItem[] | ((prev: HomeItem[]) => HomeItem[])) => {
      setRaw((prev: unknown) => {
        const current = normalizeHomeItems(prev);
        const resolved = typeof next === "function" ? next(current) : next;
        return collapseFolders(normalizeHomeItems(resolved));
      });
    },
    [setRaw],
  );

  const pinnedIds = useMemo(() => collectPinnedIds(items), [items]);

  /** 後方互換: フラットなアプリ ID 一覧（フォルダ内含む） */
  const pins = useMemo(() => [...pinnedIds], [pinnedIds]);

  const isPinned = useCallback(
    (id: string) => pinnedIds.has(id),
    [pinnedIds],
  );
  const isInstalled = isPinned;

  const pin = useCallback(
    (id: string) => {
      setItems((prev) => {
        if (collectPinnedIds(prev).has(id)) return prev;
        return [...prev, { type: "app", id }];
      });
    },
    [setItems],
  );

  const uninstall = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next: HomeItem[] = [];
        for (const item of prev) {
          if (item.type === "app") {
            if (item.id !== id) next.push(item);
            continue;
          }
          next.push({
            ...item,
            appIds: item.appIds.filter((appId) => appId !== id),
          });
        }
        return next;
      });
    },
    [setItems],
  );

  const togglePin = useCallback(
    (id: string) => {
      if (isPinned(id)) uninstall(id);
      else pin(id);
    },
    [isPinned, pin, uninstall],
  );

  const install = pin;

  /** ルート上のアイテム並べ替え（activeId → overId の位置へ） */
  const reorder = useCallback(
    (activeId: string, overId: string) => {
      setItems((prev) => {
        const from = rootIndexOf(prev, activeId);
        const to = rootIndexOf(prev, overId);
        if (from < 0 || to < 0 || from === to) return prev;
        const next = [...prev];
        const [item] = next.splice(from, 1);
        if (item === undefined) return prev;
        next.splice(to, 0, item);
        return next;
      });
    },
    [setItems],
  );

  /** ルート上の指定インデックスへ移動（キーボード操作用） */
  const moveItem = useCallback(
    (id: string, toIndex: number) => {
      setItems((prev) => {
        const from = rootIndexOf(prev, id);
        if (from < 0 || toIndex < 0 || toIndex >= prev.length || from === toIndex) {
          return prev;
        }
        const next = [...prev];
        const [item] = next.splice(from, 1);
        if (item === undefined) return prev;
        next.splice(toIndex, 0, item);
        return next;
      });
    },
    [setItems],
  );

  /** @deprecated moveItem を使用。アプリ ID 向けエイリアス */
  const movePin = moveItem;

  /**
   * 編集モードの合成ドロップ:
   * - アプリ → アプリ: フォルダ作成
   * - アプリ → フォルダ: フォルダへ追加
   * - フォルダが active のときは false（並べ替えへ）
   */
  const combine = useCallback(
    (activeId: string, overId: string): boolean => {
      const next = combineRootItems(items, activeId, overId);
      if (!next) return false;
      setItems(next);
      return true;
    },
    [items, setItems],
  );

  /** 次のルート・アイテムとフォルダ化（キーボード用）。成功でフォルダ ID */
  const groupWithNext = useCallback(
    (id: string): string | null => {
      const result = groupWithNextItem(items, id);
      if (!result) return null;
      setItems(result.next);
      return result.folderId;
    },
    [items, setItems],
  );

  const renameFolder = useCallback(
    (folderId: string, name: string) => {
      setItems((prev) =>
        prev.map((item) =>
          item.type === "folder" && item.id === folderId
            ? { ...item, name }
            : item,
        ),
      );
    },
    [setItems],
  );

  /** フォルダを解消し、中身をその位置へ展開 */
  const dissolveFolder = useCallback(
    (folderId: string) => {
      setItems((prev) => {
        const idx = rootIndexOf(prev, folderId);
        if (idx < 0) return prev;
        const folder = prev[idx];
        if (!folder || folder.type !== "folder") return prev;
        const next = [...prev];
        next.splice(
          idx,
          1,
          ...folder.appIds.map((id): HomeAppItem => ({ type: "app", id })),
        );
        return next;
      });
    },
    [setItems],
  );

  /** フォルダからホーム（ルート末尾）へ取り出す */
  const ejectFromFolder = useCallback(
    (folderId: string, appId: string) => {
      setItems((prev) => {
        const idx = rootIndexOf(prev, folderId);
        if (idx < 0) return prev;
        const folder = prev[idx];
        if (!folder || folder.type !== "folder") return prev;
        if (!folder.appIds.includes(appId)) return prev;
        const next = [...prev];
        next[idx] = {
          ...folder,
          appIds: folder.appIds.filter((id) => id !== appId),
        };
        next.push({ type: "app", id: appId });
        return next;
      });
    },
    [setItems],
  );

  const getFolder = useCallback(
    (folderId: string): HomeFolderItem | undefined => {
      const item = items.find((x) => x.type === "folder" && x.id === folderId);
      return item?.type === "folder" ? item : undefined;
    },
    [items],
  );

  return {
    items,
    setItems,
    /** フラットなアプリ ID（互換・フォルダ内含む） */
    pins,
    isPinned,
    isInstalled,
    togglePin,
    pin,
    install,
    uninstall,
    reorder,
    movePin,
    moveItem,
    combine,
    groupWithNext,
    renameFolder,
    dissolveFolder,
    ejectFromFolder,
    getFolder,
    ...meta,
  };
}
