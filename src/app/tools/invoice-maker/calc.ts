/** 金額計算と表示フォーマット（通貨・言語ごと） */

import {
  parseDateInputValue,
  type CurrencyCode,
  type DocLocale,
  type InvoiceData,
  type InvoiceItem,
} from "./types";

type CurrencyMeta = {
  symbol: string;
  /** 小数桁数（円は 0、ドル・ユーロは 2） */
  fractionDigits: number;
  /** 入力欄の刻み */
  step: number;
};

const CURRENCY_META: Record<CurrencyCode, CurrencyMeta> = {
  JPY: { symbol: "¥", fractionDigits: 0, step: 1 },
  USD: { symbol: "$", fractionDigits: 2, step: 0.01 },
  EUR: { symbol: "€", fractionDigits: 2, step: 0.01 },
};

export function currencySymbol(currency: CurrencyCode): string {
  return CURRENCY_META[currency].symbol;
}

export function currencyStep(currency: CurrencyCode): number {
  return CURRENCY_META[currency].step;
}

function intlLocale(locale: DocLocale): string {
  return locale === "ja" ? "ja-JP" : "en-US";
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
  const digits = CURRENCY_META[data.currency].fractionDigits;
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
): string {
  const meta = CURRENCY_META[currency];
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

/** 帳票用の日付表記（ja: 2026年8月1日 / en: Aug 1, 2026） */
export function formatDocDate(iso: string, locale: DocLocale): string {
  const date = parseDateInputValue(iso);
  if (!date) return iso;
  return new Intl.DateTimeFormat(intlLocale(locale), {
    year: "numeric",
    month: locale === "ja" ? "long" : "short",
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
export function suggestPdfFileName(data: InvoiceData): string {
  const prefix = data.docLocale === "ja" ? "請求書" : "Invoice";
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
