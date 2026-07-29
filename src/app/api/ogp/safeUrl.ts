/**
 * OGP / 画像プロキシ共通の URL 安全チェック（SSRF 対策の簡易版）
 */

const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "metadata.google.internal",
]);

function isPrivateIpv4(hostname: string): boolean {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(hostname);
  if (!m) return false;
  const parts = m.slice(1).map(Number);
  if (parts.some((n) => n > 255)) return false;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  return false;
}

/** http(s) かつプライベート向けでない URL のみ許可 */
export function parsePublicHttpUrl(raw: string): URL | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    const host = u.hostname.replace(/^\[|\]$/g, "").toLowerCase();
    if (!host) return null;
    if (BLOCKED_HOSTS.has(host)) return null;
    if (host.endsWith(".local") || host.endsWith(".internal")) return null;
    if (isPrivateIpv4(host)) return null;
    if (host.includes(":")) return null; // IPv6 は簡易に拒否
    return u;
  } catch {
    return null;
  }
}

export type FetchProfileName = "facebook" | "twitter" | "slack" | "browser";

/**
 * 本番（データセンター IP）ではブラウザ UA が弾かれやすい。
 * SNS クローラー向け UA の方が og:title / og:image を返しやすいサイトが多い。
 */
export function headersForProfile(
  profile: FetchProfileName,
  target: URL,
): HeadersInit {
  switch (profile) {
    case "facebook":
      return {
        "User-Agent":
          "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
        // 一部サイトは Referer なしの方が通しやすい
      };
    case "twitter":
      return {
        "User-Agent": "Twitterbot/1.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
      };
    case "slack":
      return {
        "User-Agent": "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
      };
    case "browser":
    default:
      return browserLikeHeaders(target);
  }
}

/** ブラウザに近いリクエストヘッダー（データセンターからの取得成功率を上げる） */
export function browserLikeHeaders(target: URL): HeadersInit {
  return {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    // 一部 CDN は Referer があると通しやすい
    Referer: `${target.origin}/`,
  };
}

/** 画像取得用ヘッダー（複数パターンを順に試す） */
export function imageFetchHeaderAttempts(target: URL): HeadersInit[] {
  const ua =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
  return [
    {
      "User-Agent": ua,
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
      Referer: `${target.origin}/`,
      "Sec-Fetch-Dest": "image",
      "Sec-Fetch-Mode": "no-cors",
      "Sec-Fetch-Site": "cross-site",
    },
    // Referer 付きで拒否される CDN 向け
    {
      "User-Agent": ua,
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
    },
    // SNS クローラーとして再試行
    {
      "User-Agent":
        "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      Accept: "image/*,*/*;q=0.8",
    },
  ];
}

/** @deprecated imageFetchHeaderAttempts を使う */
export function imageFetchHeaders(target: URL): HeadersInit {
  return imageFetchHeaderAttempts(target)[0];
}

/** ドメインからファビコン URL（スクレイプ失敗時の見た目用） */
export function faviconFallbackUrl(hostname: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=128`;
}
