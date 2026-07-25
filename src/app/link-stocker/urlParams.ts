import { LINK_STOCKER_CHANNEL, LINK_STOCKER_WINDOW_NAME } from "./types";

/**
 * 入力文字列を http(s) URL に正規化。失敗時は null。
 */
export function normalizeInputUrl(raw: string): string | null {
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

/**
 * 共有／クエリ文字列から登録対象 URL を取り出す。
 */
export function extractUrlFromSearch(search: string): string | null {
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );

  const candidates = [params.get("url"), params.get("text"), params.get("title")];

  for (const candidate of candidates) {
    if (!candidate) continue;

    const asWhole = normalizeInputUrl(candidate);
    if (asWhole) return asWhole;

    const match = candidate.match(/https?:\/\/[^\s<>"'`]+/i);
    if (match) {
      const cleaned = match[0].replace(/[),.;]+$/g, "");
      const fromText = normalizeInputUrl(cleaned);
      if (fromText) return fromText;
    }
  }

  return null;
}

/** クエリを消してアプリのクリーンなパスに戻す */
export function clearLinkStockerQuery() {
  if (typeof window === "undefined") return;
  window.history.replaceState({}, "", "/link-stocker");
}

/**
 * ブックマークレット用 javascript: URL。
 * 固定ウィンドウ名で既存タブへフォーカスし、BroadcastChannel でも通知する。
 */
export function buildBookmarkletHref(origin: string): string {
  // 圧縮した IIFE（シングルクォート内に埋め込む）
  const code = [
    "(function(){",
    `var o=${JSON.stringify(origin)};`,
    "var u=location.href;",
    "try{",
    `var c=new BroadcastChannel(${JSON.stringify(LINK_STOCKER_CHANNEL)});`,
    "c.postMessage({type:'keep-request',url:u});",
    "c.close();",
    "}catch(e){}",
    `window.open(o+'/link-stocker?url='+encodeURIComponent(u),${JSON.stringify(LINK_STOCKER_WINDOW_NAME)});`,
    "})();",
  ].join("");

  return `javascript:${code}`;
}
