import {
  DEFAULT_LOCALE,
  LOCALES,
  matchNavigatorLanguage,
} from "./localeMeta";
import type { Locale } from "./types";

/**
 * URL パス先頭の言語セグメント（SEO 向け・すべて小文字）。
 * 内部の Locale（`zh-CN` など）とは別に持ち、相互変換する。
 */
export type UrlLocale =
  | "en"
  | "ja"
  | "zh-cn"
  | "zh-tw"
  | "ko"
  | "es"
  | "fr"
  | "de"
  | "pt";

/** Locale → URL セグメント */
export const LOCALE_TO_URL: Record<Locale, UrlLocale> = {
  en: "en",
  ja: "ja",
  "zh-CN": "zh-cn",
  "zh-TW": "zh-tw",
  ko: "ko",
  es: "es",
  fr: "fr",
  de: "de",
  pt: "pt",
};

/** URL セグメント → Locale */
export const URL_TO_LOCALE: Record<UrlLocale, Locale> = {
  en: "en",
  ja: "ja",
  "zh-cn": "zh-CN",
  "zh-tw": "zh-TW",
  ko: "ko",
  es: "es",
  fr: "fr",
  de: "de",
  pt: "pt",
};

/** URL に使う言語一覧（表示順は LOCALES に合わせる） */
export const URL_LOCALES: readonly UrlLocale[] = LOCALES.map(
  (locale) => LOCALE_TO_URL[locale],
);

const URL_LOCALE_SET = new Set<string>(URL_LOCALES);

export function isUrlLocale(value: string): value is UrlLocale {
  return URL_LOCALE_SET.has(value.toLowerCase());
}

/** 内部 Locale → URL 用小文字セグメント */
export function toUrlLocale(locale: Locale): UrlLocale {
  return LOCALE_TO_URL[locale];
}

/** URL セグメント → 内部 Locale（不正なら null） */
export function fromUrlLocale(segment: string): Locale | null {
  const key = segment.toLowerCase();
  if (!isUrlLocale(key)) return null;
  return URL_TO_LOCALE[key];
}

/**
 * パス先頭の言語を読む。
 * `/ja/tools/foo` → `ja`、`/tools/foo` → null、`/zh-CN/...` も小文字化して解釈
 */
export function getLocaleFromPathname(pathname: string): Locale | null {
  const segment = firstPathSegment(pathname);
  if (!segment) return null;
  return fromUrlLocale(segment);
}

/** 言語プレフィックスを除いたパス（常に `/` 始まり。ルートは `/`） */
export function stripLocalePrefix(pathname: string): string {
  const segment = firstPathSegment(pathname);
  if (!segment || !isUrlLocale(segment)) {
    return normalizePathname(pathname);
  }
  const rest = pathname.slice(segment.length + 1); // 先頭の "/{lang}"
  if (!rest || rest === "/") return "/";
  return rest.startsWith("/") ? rest : `/${rest}`;
}

/**
 * 言語付き URL パスを作る。
 * - `path` は言語無し（`/tools/foo`）でも、既に言語付きでも可（付け替え）
 * - クエリや hash は含めない（呼び出し側で付与）
 */
export function localizedHref(locale: Locale, path: string = "/"): string {
  const urlLocale = toUrlLocale(locale);
  const bare = stripLocalePrefix(path || "/");
  if (bare === "/") return `/${urlLocale}`;
  return `/${urlLocale}${bare.endsWith("/") ? bare.slice(0, -1) : bare}`;
}

/**
 * 同じパスのまま言語だけ差し替える（言語スイッチャー用）。
 * `currentPathname` は `usePathname()` の値を想定。
 */
export function switchLocalePath(
  nextLocale: Locale,
  currentPathname: string,
): string {
  return localizedHref(nextLocale, stripLocalePrefix(currentPathname));
}

/**
 * Accept-Language ヘッダから最適な Locale を決める。
 * 非対応・解析不能は DEFAULT_LOCALE（en）。
 */
export function matchAcceptLanguageHeader(
  header: string | null | undefined,
): Locale {
  if (!header?.trim()) return DEFAULT_LOCALE;

  const candidates = header
    .split(",")
    .map((part) => {
      const [tagRaw, ...params] = part.trim().split(";");
      const tag = tagRaw?.trim() ?? "";
      let q = 1;
      for (const param of params) {
        const [k, v] = param.trim().split("=");
        if (k === "q" && v) {
          const parsed = Number.parseFloat(v);
          if (!Number.isNaN(parsed)) q = parsed;
        }
      }
      return { tag, q };
    })
    .filter((c) => c.tag.length > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of candidates) {
    const matched = matchNavigatorLanguage(tag);
    if (matched) return matched;
  }
  return DEFAULT_LOCALE;
}

/** hreflang 属性用（BCP 47。中国語は zh-CN / zh-TW） */
export function toHrefLang(locale: Locale): string {
  return locale;
}

function firstPathSegment(pathname: string): string | null {
  const normalized = normalizePathname(pathname);
  if (normalized === "/") return null;
  const segment = normalized.slice(1).split("/")[0];
  return segment || null;
}

function normalizePathname(pathname: string): string {
  if (!pathname) return "/";
  const withSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (withSlash.length > 1 && withSlash.endsWith("/")) {
    return withSlash.slice(0, -1);
  }
  return withSlash;
}
