/**
 * LocalStorage の読み書きヘルパー。
 * サーバー通信は行わず、完全にブラウザ内で完結する。
 */

/** LocalStorage から JSON を読み込む。失敗時は fallback */
export function loadLocalJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** LocalStorage へ JSON を即時保存（オートセーブ用） */
export function saveLocalJson(key: string, data: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error("[localData] 保存に失敗しました:", key, err);
  }
}

/** キーを削除 */
export function removeLocalJson(key: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}
