/** 請求書メーカーの型定義（すべてブラウザ内で完結する） */

import type { Locale } from "@/i18n";

/** 請求書に印字する言語。サイトの表示言語とは独立して選べる */
export type DocLocale = Locale;

export type CurrencyCode = "JPY" | "USD" | "EUR";

/** 発行者・請求先の共通項目 */
export type InvoiceParty = {
  name: string;
  /** 住所（改行可） */
  address: string;
  email: string;
  /** 電話番号などの補足（改行可） */
  extra: string;
  /**
   * インボイス制度の登録番号（適格請求書発行事業者番号）。
   * 発行者側で使う想定。未入力なら帳票に出さない。
   */
  registrationNumber: string;
};

export type InvoiceItem = {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

export type InvoiceData = {
  docLocale: DocLocale;
  currency: CurrencyCode;
  /** 税率（%）。0 のときは税行を印字しない */
  taxRatePercent: number;
  invoiceNumber: string;
  /** YYYY-MM-DD */
  issueDate: string;
  /** YYYY-MM-DD */
  dueDate: string;
  from: InvoiceParty;
  to: InvoiceParty;
  items: InvoiceItem[];
  /** 銀行口座や決済 URL などのフリーテキスト */
  paymentMethod: string;
  notes: string;
};

/** 名前付きで保存した請求書（履歴） */
export type SavedInvoice = {
  id: string;
  /** 一覧に出す登録名 */
  name: string;
  /** ISO 8601 */
  savedAt: string;
  data: InvoiceData;
};

/** LocalStorage 全体（下書き＋履歴） */
export type InvoiceAppStore = {
  draft: InvoiceData;
  history: SavedInvoice[];
};

export const CURRENCY_CODES = ["JPY", "USD", "EUR"] as const;

export const TAX_RATE_PRESETS = [0, 8, 10] as const;

/** 支払期日の既定オフセット（発行日から何日後か） */
const DEFAULT_DUE_DAYS = 30;

export function createId(prefix = "item"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyItem(): InvoiceItem {
  return { id: createId(), name: "", unitPrice: 0, quantity: 1 };
}

export function createEmptyParty(): InvoiceParty {
  return { name: "", address: "", email: "", extra: "", registrationNumber: "" };
}

/** Date → YYYY-MM-DD（UTC ではなくローカル日付で扱う） */
export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** YYYY-MM-DD に日数を足す。パースできない場合はそのまま返す */
export function addDays(iso: string, days: number): string {
  const parsed = parseDateInputValue(iso);
  if (!parsed) return iso;
  parsed.setDate(parsed.getDate() + days);
  return toDateInputValue(parsed);
}

/** YYYY-MM-DD → Date（不正なら null） */
export function parseDateInputValue(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** 日付ベースの請求書番号（例: INV-20260801-01） */
export function suggestInvoiceNumber(issueDate: string): string {
  const compact = issueDate.replace(/-/g, "");
  return `INV-${compact || "00000000"}-01`;
}

/** サイト言語に合わせた初期通貨（日本語なら円） */
export function defaultCurrencyFor(locale: DocLocale): CurrencyCode {
  return locale === "ja" ? "JPY" : "USD";
}

/** 新規請求書の初期値。日付を使うためクライアント側でのみ呼ぶ */
export function createDefaultInvoice(locale: DocLocale): InvoiceData {
  const issueDate = toDateInputValue(new Date());
  return {
    docLocale: locale,
    currency: defaultCurrencyFor(locale),
    taxRatePercent: locale === "ja" ? 10 : 0,
    invoiceNumber: suggestInvoiceNumber(issueDate),
    issueDate,
    dueDate: addDays(issueDate, DEFAULT_DUE_DAYS),
    from: createEmptyParty(),
    to: createEmptyParty(),
    items: [createEmptyItem()],
    paymentMethod: "",
    notes: "",
  };
}

/**
 * 「次の請求書」を作る。発行者情報・支払方法・通貨設定は引き継ぎ、
 * 請求先と品目だけを空にする（毎回入力するのは請求内容だけ）。
 */
export function createNextInvoice(previous: InvoiceData): InvoiceData {
  const issueDate = toDateInputValue(new Date());
  return {
    ...previous,
    invoiceNumber: suggestInvoiceNumber(issueDate),
    issueDate,
    dueDate: addDays(issueDate, DEFAULT_DUE_DAYS),
    to: createEmptyParty(),
    items: [createEmptyItem()],
    notes: "",
  };
}

/**
 * 履歴保存時の登録名候補。
 * 例:「2026年8月度_株式会社〇〇様」／「Invoice #INV-…」
 */
export function suggestSaveName(data: InvoiceData): string {
  const toName = data.to.name.trim();
  const number = data.invoiceNumber.trim();
  const date = parseDateInputValue(data.issueDate);

  if (data.docLocale === "ja") {
    const monthLabel = date
      ? `${date.getFullYear()}年${date.getMonth() + 1}月度`
      : "";
    if (monthLabel && toName) return `${monthLabel}_${toName}`;
    if (toName) return toName;
    if (number) return `請求書番号 ${number}`;
    return "無題の請求書";
  }

  const monthLabel = date
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
      }).format(date)
    : "";
  if (monthLabel && toName) return `${monthLabel} — ${toName}`;
  if (toName) return toName;
  if (number) return `Invoice ${number}`;
  return "Untitled invoice";
}
