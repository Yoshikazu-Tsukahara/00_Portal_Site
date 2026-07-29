import { LINK_STOCKER_CHANNEL, LINK_STOCKER_WINDOW_NAME } from "./types";

export type KeepHints = {
  title?: string;
  image?: string;
  description?: string;
};

export type KeepPayload = {
  url: string;
  hints: KeepHints;
};

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

function readHintParam(
  params: URLSearchParams,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const v = params.get(key)?.trim();
    if (v) return v;
  }
  return undefined;
}

/**
 * 共有／クエリ文字列から登録対象 URL とメタヒントを取り出す。
 * ot/oi/od はブックマークレットがページ上で拾った OGP（本番のサーバー取得失敗対策）。
 */
export function extractKeepPayloadFromSearch(
  search: string,
): KeepPayload | null {
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );

  const candidates = [
    params.get("url"),
    params.get("text"),
    // Android 共有の title に URL が入る場合がある
    params.get("title"),
  ];

  let url: string | null = null;
  for (const candidate of candidates) {
    if (!candidate) continue;

    const asWhole = normalizeInputUrl(candidate);
    if (asWhole) {
      url = asWhole;
      break;
    }

    const match = candidate.match(/https?:\/\/[^\s<>"'`]+/i);
    if (match) {
      const cleaned = match[0].replace(/[),.;]+$/g, "");
      const fromText = normalizeInputUrl(cleaned);
      if (fromText) {
        url = fromText;
        break;
      }
    }
  }

  if (!url) return null;

  const hints: KeepHints = {};
  const title = readHintParam(params, ["ot", "ogTitle"]);
  const image = readHintParam(params, ["oi", "ogImage"]);
  const description = readHintParam(params, ["od", "ogDescription"]);
  // title パラメータが URL でなければページタイトルとして使う
  const shareTitle = params.get("title")?.trim();
  if (title) hints.title = title.slice(0, 200);
  else if (shareTitle && !normalizeInputUrl(shareTitle)) {
    hints.title = shareTitle.slice(0, 200);
  }
  if (image) hints.image = image;
  if (description) hints.description = description.slice(0, 400);

  return { url, hints };
}

/** 後方互換 */
export function extractUrlFromSearch(search: string): string | null {
  return extractKeepPayloadFromSearch(search)?.url ?? null;
}

/** クエリを消してアプリのクリーンなパスに戻す */
export function clearLinkStockerQuery() {
  if (typeof window === "undefined") return;
  window.history.replaceState({}, "", "/link-stocker");
}

/**
 * ブックマークレット用 javascript: URL。
 * - 固定ウィンドウ名で、すでに開いているマイツールボックスタブを再利用（新規タブを増やさない）
 * - ページ上の OGP をクエリで渡し、本番のサーバー取得失敗を補う
 * - 同一オリジン上で実行されたときだけ BroadcastChannel でも通知（補助）
 */
export function buildBookmarkletHref(origin: string): string {
  const code = [
    "(function(){",
    `var o=${JSON.stringify(origin)};`,
    `var wn=${JSON.stringify(LINK_STOCKER_WINDOW_NAME)};`,
    "var u=location.href;",
    "function m(p,nm){",
    "var e=document.querySelector('meta[property=\"'+p+'\"]')||document.querySelector('meta[name=\"'+nm+'\"]');",
    "return e&&e.content?e.content:'';",
    "}",
    "var t=m('og:title','twitter:title')||document.title||'';",
    "var i=m('og:image','twitter:image')||'';",
    "var d=m('og:description','twitter:description')||'';",
    "try{",
    `var c=new BroadcastChannel(${JSON.stringify(LINK_STOCKER_CHANNEL)});`,
    "c.postMessage({type:'keep-request',url:u,title:t,image:i,description:d});",
    "c.close();",
    "}catch(e){}",
    "var q='url='+encodeURIComponent(u);",
    "if(t)q+='&ot='+encodeURIComponent(t.slice(0,200));",
    "if(i)q+='&oi='+encodeURIComponent(i);",
    "if(d)q+='&od='+encodeURIComponent(d.slice(0,400));",
    // 同名タブがあればそれを遷移・フォーカス。なければ 1 枚だけ新規
    "var w=window.open(o+'/link-stocker?'+q,wn);",
    "try{if(w)w.focus();}catch(e){}",
    "})();",
  ].join("");

  return `javascript:${code}`;
}
