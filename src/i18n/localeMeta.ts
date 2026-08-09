import type { Dictionary, Locale } from "./types";

/** 未対応言語・判定不能時のフォールバック */
export const DEFAULT_LOCALE: Locale = "en";

/** 対応言語一覧（表示順） */
export const LOCALES: readonly Locale[] = [
  "en",
  "ja",
  "zh-CN",
  "zh-TW",
  "ko",
  "es",
  "fr",
  "de",
  "pt",
] as const;

/** その言語での自称（ドロップダウン表示用） */
export const LOCALE_NATIVE_LABELS: Record<Locale, string> = {
  en: "English",
  ja: "日本語",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  ko: "한국어",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
};

/** ヘッダー等の短縮表示（jp / en など） */
export const LOCALE_SHORT_LABELS: Record<Locale, string> = {
  en: "en",
  ja: "jp",
  "zh-CN": "zh",
  "zh-TW": "tw",
  ko: "ko",
  es: "es",
  fr: "fr",
  de: "de",
  pt: "pt",
};

/** Intl / toLocaleString 用の BCP 47 タグ */
export const INTL_BY_LOCALE: Record<Locale, string> = {
  en: "en-US",
  ja: "ja-JP",
  "zh-CN": "zh-CN",
  "zh-TW": "zh-TW",
  ko: "ko-KR",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  pt: "pt-BR",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** 日付・数値フォーマット用の Intl ロケール文字列 */
export function intlLocale(locale: Locale): string {
  return INTL_BY_LOCALE[locale] ?? "en-US";
}

/**
 * 中国語タグを簡体／繁体へ振り分ける。
 * 例: zh-TW / zh-HK / zh-Hant → zh-TW、zh-CN / zh-Hans / zh → zh-CN
 */
function matchChineseLocale(tag: string): Locale | null {
  const lower = tag.toLowerCase();
  if (!lower.startsWith("zh")) return null;
  if (
    lower.includes("tw") ||
    lower.includes("hk") ||
    lower.includes("mo") ||
    lower.includes("hant")
  ) {
    return "zh-TW";
  }
  return "zh-CN";
}

/**
 * navigator の 1 タグ（例: 'ja', 'en-US', 'zh-TW'）をアプリ Locale へ写す。
 * 1) 完全一致 2) 中国語の地域分岐 3) 前方 2 文字（プライマリサブタグ）
 */
export function matchNavigatorLanguage(tag: string): Locale | null {
  const normalized = tag.trim().replace(/_/g, "-");
  if (!normalized) return null;

  const lower = normalized.toLowerCase();
  for (const locale of LOCALES) {
    if (locale.toLowerCase() === lower) return locale;
  }

  const chinese = matchChineseLocale(normalized);
  if (chinese) return chinese;

  // 要件どおり前方 2 文字で対応言語を探す（'fr-CA' → 'fr'）
  const primary = lower.slice(0, 2);
  if (isLocale(primary)) return primary;

  return null;
}

/** ブラウザの言語設定一覧を読む（SSR や API 欠落時は空） */
export function readBrowserLanguages(): readonly string[] {
  if (typeof navigator === "undefined") return [];
  if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
    return navigator.languages;
  }
  if (navigator.language) return [navigator.language];
  return [];
}

/**
 * ブラウザ言語から初期 Locale を決める。
 * languages を優先順に試し、どれも非対応なら DEFAULT_LOCALE（en）。
 */
export function detectBrowserLocale(
  languages: readonly string[] = readBrowserLanguages(),
): Locale {
  for (const tag of languages) {
    const matched = matchNavigatorLanguage(tag);
    if (matched) return matched;
  }
  return DEFAULT_LOCALE;
}

/**
 * 初期言語の解決。
 * (A) localStorage の有効値 → それを使う（再保存不要）
 * (B)(C) なければブラウザ判定（非対応は en）→ 保存が必要
 */
export function resolveInitialLocale(stored: string | null): {
  locale: Locale;
  shouldPersist: boolean;
} {
  if (stored && isLocale(stored)) {
    return { locale: stored, shouldPersist: false };
  }
  return { locale: detectBrowserLocale(), shouldPersist: true };
}

/** 深い部分辞書（未訳キーは en へフォールバック） */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? U[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

export type PartialDictionary = DeepPartial<Dictionary>;
