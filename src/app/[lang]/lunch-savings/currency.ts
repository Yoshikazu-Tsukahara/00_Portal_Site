import type { Locale } from "@/i18n";
import { intlLocale } from "@/i18n";

/** 対応通貨コード */
export type LunchCurrency = "JPY" | "USD" | "EUR" | "GBP";

export const LUNCH_CURRENCIES: LunchCurrency[] = [
  "JPY",
  "USD",
  "EUR",
  "GBP",
];

export type CurrencyMeta = {
  code: LunchCurrency;
  /** 表示用記号 */
  symbol: string;
  /** 小数桁（JPY=0, その他=2） */
  decimals: number;
  /** Intl 用の代表ロケール */
  numberLocale: string;
};

export const CURRENCY_META: Record<LunchCurrency, CurrencyMeta> = {
  JPY: { code: "JPY", symbol: "¥", decimals: 0, numberLocale: "ja-JP" },
  USD: { code: "USD", symbol: "$", decimals: 2, numberLocale: "en-US" },
  EUR: { code: "EUR", symbol: "€", decimals: 2, numberLocale: "de-DE" },
  GBP: { code: "GBP", symbol: "£", decimals: 2, numberLocale: "en-GB" },
};

export function isLunchCurrency(value: unknown): value is LunchCurrency {
  return (
    value === "JPY" ||
    value === "USD" ||
    value === "EUR" ||
    value === "GBP"
  );
}

/** 通貨に応じた丸め（表示・保存共通） */
export function roundMoney(amount: number, currency: LunchCurrency): number {
  const decimals = CURRENCY_META[currency].decimals;
  if (decimals <= 0) return Math.round(amount);
  const f = 10 ** decimals;
  return Math.round(amount * f) / f;
}

/**
 * 金額を通貨フォーマットで表示。
 * displayLocale は UI 言語。記号位置は Intl に任せる。
 */
export function formatMoney(
  amount: number,
  currency: LunchCurrency,
  displayLocale: Locale = "ja",
): string {
  const meta = CURRENCY_META[currency];
  const locale =
    displayLocale === "ja" ? meta.numberLocale : intlLocale(displayLocale);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: meta.code,
      minimumFractionDigits: meta.decimals,
      maximumFractionDigits: meta.decimals,
    }).format(amount);
  } catch {
    const sign = amount < 0 ? "-" : "";
    const abs = Math.abs(amount).toLocaleString(locale, {
      minimumFractionDigits: meta.decimals,
      maximumFractionDigits: meta.decimals,
    });
    return `${sign}${meta.symbol}${abs}`;
  }
}

/** テンキー表示用（記号なし・桁区切りのみ） */
export function formatMoneyDigits(
  amount: number,
  currency: LunchCurrency,
  displayLocale: Locale = "ja",
): string {
  const meta = CURRENCY_META[currency];
  const locale =
    displayLocale === "ja" ? meta.numberLocale : intlLocale(displayLocale);
  return amount.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: meta.decimals,
  });
}

/** 入力文字列を金額数値に（空は 0） */
export function parseMoneyInput(
  raw: string,
  currency: LunchCurrency,
): number {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned || cleaned === ".") return 0;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return 0;
  return roundMoney(n, currency);
}

/** @deprecated 互換。formatMoney(..., "JPY") を推奨 */
export function formatYen(amount: number): string {
  return formatMoney(amount, "JPY", "ja");
}
