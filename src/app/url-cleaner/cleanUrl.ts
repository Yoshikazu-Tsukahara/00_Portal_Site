import {
  SHOPPING_TRACKING_PARAM_PREFIXES,
  SHOPPING_TRACKING_PARAMS,
  cleanShoppingSiteUrl,
} from "./shoppingSites";
import { cleanSnsUrl } from "./snsSites";

/** Amazon ASIN（10 文字英数字） */
const ASIN_IN_PATH = /\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?:[/?]|$)/i;

/** 削除対象のトラッキング系クエリ（小文字で比較） */
const TRACKING_PARAM_PREFIXES = [
  "utm_",
  "pd_rd",
  "pf_rd",
  "gbrd",
  "gclid",
  "fbclid",
  "mc_eid",
  "mc_cid",
  "igshid",
  "si",
  ...SHOPPING_TRACKING_PARAM_PREFIXES,
];

const TRACKING_PARAMS = new Set([
  "ref",
  "ref_",
  "tag",
  "ascsubtag",
  "linkcode",
  "creative",
  "creativeasin",
  "smid",
  "th",
  "psc",
  "qid",
  "sprefix",
  "sr",
  "dib",
  "dib_tag",
  "source",
  "campaign",
  "affiliate",
  "aff_id",
  "partner",
  "clickid",
  "mkt_tok",
  "trk",
  "trkinfo",
  "feature",
  "pp",
  ...SHOPPING_TRACKING_PARAMS,
]);

function isTrackingParam(key: string): boolean {
  const lower = key.toLowerCase();
  if (TRACKING_PARAMS.has(lower)) return true;
  return TRACKING_PARAM_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

function tryParseUrl(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const withScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url;
  } catch {
    return null;
  }
}

/** Amazon: /dp/ または /gp/product/ から ASIN だけ残す */
function cleanAmazonUrl(url: URL): string | null {
  const host = url.hostname.toLowerCase();
  if (!host.includes("amazon.")) return null;

  const match = url.pathname.match(ASIN_IN_PATH);
  if (!match) return null;

  const asin = match[1].toUpperCase();
  return `${url.origin}/dp/${asin}/`;
}

/** YouTube: 動画 ID（v=）だけ残す */
function cleanYouTubeUrl(url: URL): string {
  const host = url.hostname.toLowerCase();

  if (host === "youtu.be" || host.endsWith(".youtu.be")) {
    const id = url.pathname.replace(/^\//, "").split("/")[0]?.split("?")[0];
    if (id && /^[\w-]{11}$/.test(id)) {
      return `https://www.youtube.com/watch?v=${id}`;
    }
  }

  if (host.includes("youtube.com")) {
    const v = url.searchParams.get("v");
    if (v) return `https://www.youtube.com/watch?v=${v}`;

    const shorts = url.pathname.match(/\/shorts\/([\w-]{11})/);
    if (shorts) return `https://www.youtube.com/watch?v=${shorts[1]}`;
  }

  return stripTrackingParams(url);
}

function stripTrackingParams(url: URL): string {
  const params = new URLSearchParams(url.search);
  for (const key of [...params.keys()]) {
    if (isTrackingParam(key)) params.delete(key);
  }

  const next = new URL(url.toString());
  next.search = params.toString() ? `?${params.toString()}` : "";
  next.hash = "";
  return next.toString();
}

/**
 * 長い URL を短く整形する。
 * URL として解釈できない文字列は空文字を返す（出力欄はプレースホルダーのまま）。
 */
export function cleanUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const url = tryParseUrl(trimmed);
  if (!url) return "";

  const amazon = cleanAmazonUrl(url);
  if (amazon) return amazon;

  const shopping = cleanShoppingSiteUrl(url);
  if (shopping) return shopping;

  const sns = cleanSnsUrl(url);
  if (sns) return sns;

  const host = url.hostname.toLowerCase();
  if (host.includes("youtube.com") || host.includes("youtu.be")) {
    return cleanYouTubeUrl(url);
  }

  return stripTrackingParams(url);
}
