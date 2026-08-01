/** 金額計算と表示フォーマット（通貨・帳票言語ごと） */

import {
  parseDateInputValue,
  type CurrencyCode,
  type DocLocale,
  type InvoiceData,
  type InvoiceItem,
} from "./types";

type CurrencyMeta = {
  symbol: string;
  /** 小数桁数（円・ウォンは 0、その他はおおむね 2） */
  fractionDigits: number;
  /** 入力欄の刻み */
  step: number;
};

const CURRENCY_META: Record<Exclude<CurrencyCode, "CUSTOM">, CurrencyMeta> = {
  JPY: { symbol: "¥", fractionDigits: 0, step: 1 },
  USD: { symbol: "$", fractionDigits: 2, step: 0.01 },
  EUR: { symbol: "€", fractionDigits: 2, step: 0.01 },
  GBP: { symbol: "£", fractionDigits: 2, step: 0.01 },
  AUD: { symbol: "A$", fractionDigits: 2, step: 0.01 },
  CAD: { symbol: "C$", fractionDigits: 2, step: 0.01 },
  SGD: { symbol: "S$", fractionDigits: 2, step: 0.01 },
  CNY: { symbol: "元", fractionDigits: 2, step: 0.01 },
  KRW: { symbol: "₩", fractionDigits: 0, step: 1 },
};

/** セレクト表示用（記号 + コード）。CUSTOM は別扱い */
export const CURRENCY_SELECT_OPTIONS: readonly {
  code: Exclude<CurrencyCode, "CUSTOM">;
  label: string;
}[] = [
  { code: "JPY", label: "¥ JPY" },
  { code: "USD", label: "$ USD" },
  { code: "EUR", label: "€ EUR" },
  { code: "GBP", label: "£ GBP" },
  { code: "AUD", label: "A$ AUD" },
  { code: "CAD", label: "C$ CAD" },
  { code: "SGD", label: "S$ SGD" },
  { code: "CNY", label: "元 CNY" },
  { code: "KRW", label: "₩ KRW" },
] as const;

export function resolveCurrencyMeta(data: {
  currency: CurrencyCode;
  customCurrencySymbol?: string;
}): CurrencyMeta {
  if (data.currency === "CUSTOM") {
    const symbol = (data.customCurrencySymbol ?? "").trim() || "¤";
    return { symbol, fractionDigits: 2, step: 0.01 };
  }
  return CURRENCY_META[data.currency];
}

export function currencySymbol(
  currency: CurrencyCode,
  customSymbol = "",
): string {
  return resolveCurrencyMeta({
    currency,
    customCurrencySymbol: customSymbol,
  }).symbol;
}

export function currencyStep(
  currency: CurrencyCode,
  customSymbol = "",
): number {
  return resolveCurrencyMeta({
    currency,
    customCurrencySymbol: customSymbol,
  }).step;
}

/** Intl 用ロケール（帳票言語 → BCP 47） */
export function intlLocale(locale: DocLocale): string {
  switch (locale) {
    case "ja":
      return "ja-JP";
    case "zh":
      return "zh-CN";
    case "ko":
      return "ko-KR";
    case "es":
      return "es-ES";
    case "fr":
      return "fr-FR";
    case "de":
      return "de-DE";
    default:
      return "en-US";
  }
}

function safeNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

function roundTo(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function itemAmount(item: InvoiceItem): number {
  return safeNumber(item.unitPrice) * safeNumber(item.quantity);
}

/** 品名が空の行はプレビュー／PDF に出さない */
export function printableItems(items: InvoiceItem[]): InvoiceItem[] {
  return items.filter((item) => item.name.trim() !== "");
}

export type InvoiceTotals = {
  subtotal: number;
  tax: number;
  /** 源泉徴収税（マイナス値） */
  withholdingTax: number;
  total: number;
};

/** 小計 → 税額 → 源泉徴収税 → 合計。端数は通貨の小数桁に丸める */
export function computeTotals(data: InvoiceData): InvoiceTotals {
  const digits = resolveCurrencyMeta(data).fractionDigits;
  const subtotal = roundTo(
    data.items.reduce((sum, item) => sum + itemAmount(item), 0),
    digits,
  );
  const tax = roundTo(subtotal * (safeNumber(data.taxRatePercent) / 100), digits);
  const withholdingTax = data.withholdingTaxEnabled
    ? roundTo(subtotal * 0.1021, digits)
    : 0;
  return {
    subtotal,
    tax,
    withholdingTax,
    total: roundTo(subtotal + tax - withholdingTax, digits),
  };
}

/** 例: ¥12,000 / $1,200.00 / €1.200,00 相当の桁区切り */
export function formatMoney(
  amount: number,
  currency: CurrencyCode,
  locale: DocLocale,
  customCurrencySymbol = "",
): string {
  const meta = resolveCurrencyMeta({
    currency,
    customCurrencySymbol,
  });
  const formatted = new Intl.NumberFormat(intlLocale(locale), {
    minimumFractionDigits: meta.fractionDigits,
    maximumFractionDigits: meta.fractionDigits,
  }).format(safeNumber(amount));
  return `${meta.symbol}${formatted}`;
}

/** 数量（小数第2位まで、余計な 0 は付けない） */
export function formatQuantity(quantity: number, locale: DocLocale): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    maximumFractionDigits: 2,
  }).format(safeNumber(quantity));
}

/** 帳票用の日付表記 */
export function formatDocDate(iso: string, locale: DocLocale): string {
  const date = parseDateInputValue(iso);
  if (!date) return iso;
  const useLongMonth = locale === "ja" || locale === "zh" || locale === "ko";
  return new Intl.DateTimeFormat(intlLocale(locale), {
    year: "numeric",
    month: useLongMonth ? "long" : "short",
    day: "numeric",
  }).format(date);
}

/** 税率の表示（10 → "10%"、8.5 → "8.5%"） */
export function formatTaxRate(rate: number): string {
  const safe = safeNumber(rate);
  return `${Number.isInteger(safe) ? safe : Number(safe.toFixed(2))}%`;
}

/**
 * 「名前を付けて保存」用のデフォルトファイル名（拡張子なし）。
 * 例: 請求書_INV-20260802-01_株式会社サンプルデザイン
 */
export function suggestPdfFileName(
  data: InvoiceData,
  documentTitle: string,
): string {
  const prefix = documentTitle.trim() || "Document";
  const number = data.invoiceNumber.trim() || "draft";
  const toName = data.to.name
    .trim()
    .replace(/[\s　]+/g, "")
    .replace(/御中|様$/u, "");
  const parts = [prefix, number, toName || null].filter(Boolean) as string[];
  return parts
    .join("_")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/_+/g, "_")
    .slice(0, 120);
}
