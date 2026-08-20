/** 変数キーごとの入力履歴（LocalStorage） */

const HISTORY_KEY = "mail-template-input-history:v1";
const MAX_PER_KEY = 10;

export type InputHistoryMap = Record<string, string[]>;

export function loadInputHistory(): InputHistoryMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const result: InputHistoryMap = {};
    for (const [key, value] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      if (!Array.isArray(value)) continue;
      result[key] = value
        .filter((v): v is string => typeof v === "string")
        .map((v) => v.trim())
        .filter(Boolean)
        .slice(0, MAX_PER_KEY);
    }
    return result;
  } catch {
    return {};
  }
}

function writeInputHistory(map: InputHistoryMap): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(map));
}

/** 履歴マップをまるごと置き換え（バックアップ復元用） */
export function saveInputHistory(map: InputHistoryMap): void {
  writeInputHistory(map);
}

/**
 * 履歴に追加（先頭へ。大文字小文字無視で重複排除）。
 * 空文字は無視。
 */
export function pushInputHistory(
  map: InputHistoryMap,
  key: string,
  value: string,
): InputHistoryMap {
  const trimmed = value.trim();
  if (!trimmed) return map;

  const prev = map[key] ?? [];
  const next = [
    trimmed,
    ...prev.filter((v) => v.toLowerCase() !== trimmed.toLowerCase()),
  ].slice(0, MAX_PER_KEY);

  const updated = { ...map, [key]: next };
  writeInputHistory(updated);
  return updated;
}

/** 特定キーの履歴を削除 */
export function clearInputHistoryForKey(
  map: InputHistoryMap,
  key: string,
): InputHistoryMap {
  const updated = { ...map };
  delete updated[key];
  writeInputHistory(updated);
  return updated;
}

/** 特定キーの履歴から1件だけ削除 */
export function removeInputHistoryItem(
  map: InputHistoryMap,
  key: string,
  value: string,
): InputHistoryMap {
  const prev = map[key];
  if (!prev?.length) return map;

  const target = value.trim().toLowerCase();
  const next = prev.filter((v) => v.toLowerCase() !== target);
  if (next.length === prev.length) return map;

  const updated = { ...map };
  if (next.length === 0) {
    delete updated[key];
  } else {
    updated[key] = next;
  }
  writeInputHistory(updated);
  return updated;
}

/**
 * サジェスト候補。
 * query が空なら最新順すべて、あれば部分一致（大小無視）。
 */
export function getSuggestions(
  map: InputHistoryMap,
  key: string,
  query: string,
  limit = 6,
): string[] {
  const list = map[key] ?? [];
  const q = query.trim().toLowerCase();
  if (!q) return list.slice(0, limit);
  return list
    .filter((v) => v.toLowerCase().includes(q) && v.toLowerCase() !== q)
    .slice(0, limit);
}
