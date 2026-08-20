/** 楽天・Yahoo!ショッピング等 EC 向けの追加トラッキングパラメータ */
export const SHOPPING_TRACKING_PARAM_PREFIXES = [
  "icm_",
  "ran",
  "__y",
] as const;

export const SHOPPING_TRACKING_PARAMS = new Set([
  // 楽天
  "scid",
  "s-id",
  "sid",
  "rtg",
  "icm",
  "30days",
  "mcid",
  "l-id",
  "lid",
  "pos",
  "trflg",
  "grp",
  "grps",
  "_rtmk",
  "rancode",
  "ranmid",
  "ranuid",
  "ranea",
  // Yahoo!ショッピング
  "__ysp",
  "mcr",
  "mcc",
  "clk",
  "fr",
  "sguid",
  "rk",
  "vet",
  "ei",
  "pf",
  "st",
  "sh",
  "af",
  "mid",
  "tuid",
  "sc2",
  // メルカリ
  "tracking_id",
  "campaign_id",
  // 汎用 EC / アフィリエイト
  "wsid",
  "cvid",
  "cks",
  "cp",
  "bn",
  "prd",
  "media",
  "ad",
  "adid",
  "promo",
  "coupon",
  "coupon_code",
  "disc",
]);

function isRakutenHost(host: string): boolean {
  return host.includes("rakuten.co.jp") || host.includes("rakuten.com");
}

/** 商品ページで残すクエリ（バリエーション指定など） */
const RAKUTEN_KEEP_PARAMS = new Set(["variantid"]);

function buildQueryKeeping(url: URL, keepKeys: Set<string>): string {
  const kept = new URLSearchParams();
  for (const key of url.searchParams.keys()) {
    if (keepKeys.has(key.toLowerCase())) {
      kept.set(key, url.searchParams.get(key) ?? "");
    }
  }
  const qs = kept.toString();
  return qs ? `?${qs}` : "";
}

/** 楽天: 商品パスを短くし、トラッキングクエリを除去 */
function cleanRakutenUrl(url: URL): string | null {
  const host = url.hostname.toLowerCase();
  if (!isRakutenHost(host)) return null;

  if (host === "item.rakuten.co.jp") {
    const match = url.pathname.match(/^\/([^/]+)\/([^/]+)/);
    if (match) {
      const qs = buildQueryKeeping(url, RAKUTEN_KEEP_PARAMS);
      return `https://item.rakuten.co.jp/${match[1]}/${match[2]}/${qs}`;
    }
  }

  if (host === "books.rakuten.co.jp") {
    const match = url.pathname.match(/^\/rb\/([^/]+)/);
    if (match) return `https://books.rakuten.co.jp/rb/${match[1]}/`;
  }

  return null;
}

/** Yahoo!ショッピング: 商品 ID パスへ正規化 */
function cleanYahooShoppingUrl(url: URL): string | null {
  const host = url.hostname.toLowerCase();
  if (!host.includes("shopping.yahoo.co.jp")) return null;

  const product = url.pathname.match(/\/products\/([^/?]+)/);
  if (product) {
    return `https://shopping.yahoo.co.jp/products/${product[1]}`;
  }

  return null;
}

/** メルカリ: 商品 ID パスのみ */
function cleanMercariUrl(url: URL): string | null {
  const host = url.hostname.toLowerCase();
  if (!host.includes("mercari.com")) return null;

  const match = url.pathname.match(/^\/item\/([^/?]+)/);
  if (match) return `https://${host}/item/${match[1]}`;

  return null;
}

/**
 * 主要 EC サイト向けの専用整形。
 * 該当しない場合は null（一般トラッキング除去へ）。
 */
export function cleanShoppingSiteUrl(url: URL): string | null {
  return (
    cleanRakutenUrl(url) ??
    cleanYahooShoppingUrl(url) ??
    cleanMercariUrl(url)
  );
}
