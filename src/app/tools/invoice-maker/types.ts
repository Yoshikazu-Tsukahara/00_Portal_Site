/** 帳票メーカーの型定義（すべてブラウザ内で完結する） */

import type { Locale } from "@/i18n";

/**
 * 帳票（入力ラベル・PDF印字）専用の言語。
 * ポータル全体の Locale とは独立。
 */
export type DocLocale = "ja" | "en" | "zh" | "ko" | "es" | "fr" | "de";

export const DOC_LOCALES: readonly DocLocale[] = [
  "ja",
  "en",
  "zh",
  "ko",
  "es",
  "fr",
  "de",
] as const;

/** 言語セレクト用（表示名は各言語の自称。ポータル言語に依存しない） */
export const DOC_LOCALE_OPTIONS: readonly {
  value: DocLocale;
  label: string;
}[] = [
  { value: "ja", label: "日本語" },
  { value: "en", label: "English" },
  { value: "zh", label: "🇨🇳 简体中文" },
  { value: "ko", label: "🇰🇷 한국어" },
  { value: "es", label: "🇪🇸 Español" },
  { value: "fr", label: "🇫🇷 Français" },
  { value: "de", label: "🇩🇪 Deutsch" },
] as const;

/** 書類の種類（請求書・見積書・納品書・領収書） */
export type DocumentType = "invoice" | "estimate" | "deliveryNote" | "receipt";

export const DOCUMENT_TYPES: readonly DocumentType[] = [
  "invoice",
  "estimate",
  "deliveryNote",
  "receipt",
] as const;

/** 支払期日／有効期限欄を出す書類タイプか（納品書・領収書は不要） */
export function documentTypeShowsDueDate(type: DocumentType): boolean {
  return type === "invoice" || type === "estimate";
}

/**
 * 通貨コード。CUSTOM はユーザー入力の記号を使う。
 */
export type CurrencyCode =
  | "JPY"
  | "USD"
  | "EUR"
  | "GBP"
  | "AUD"
  | "CAD"
  | "SGD"
  | "CNY"
  | "KRW"
  | "CUSTOM";

export const CURRENCY_CODES: readonly CurrencyCode[] = [
  "JPY",
  "USD",
  "EUR",
  "GBP",
  "AUD",
  "CAD",
  "SGD",
  "CNY",
  "KRW",
  "CUSTOM",
] as const;

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
  /** 書類タイプ（請求書・見積書・納品書・領収書） */
  documentType: DocumentType;
  currency: CurrencyCode;
  /**
   * currency === "CUSTOM" のときの表示記号（例: ₹, ฿, R$）。
   * 未入力時は汎用記号で表示する。
   */
  customCurrencySymbol: string;
  /** 税率（%）。0 のときは税行を印字しない */
  taxRatePercent: number;
  /** 源泉徴収税（-10.21%）を計算するか */
  withholdingTaxEnabled: boolean;
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
  /** ロゴ画像（Base64 data URL） */
  logoImageBase64?: string;
  /** 印鑑画像（Base64 data URL） */
  stampImageBase64?: string;
  /** アクセントカラー（16進数 #rrggbb）。未指定時はモノクロ */
  accentColor?: string;
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

export const TAX_RATE_PRESETS = [0, 8, 10] as const;

/** 品目行の上限 */
export const MAX_INVOICE_ITEMS = 10;

/**
 * 1ページ（A4）に収めるための入力上限。
 * 品目10行＋ヘッダー／支払／備考を想定した目安。
 */
export const FIELD_LIMITS = {
  invoiceNumber: 40,
  partyName: 60,
  partyAddress: 120,
  partyAddressLines: 4,
  partyEmail: 80,
  partyExtra: 80,
  partyExtraLines: 3,
  registrationNumber: 24,
  itemName: 60,
  unitPrice: 99_999_999,
  quantity: 9_999,
  paymentMethod: 220,
  paymentMethodLines: 5,
  notes: 220,
  notesLines: 5,
  customCurrencySymbol: 8,
} as const;

/** 文字数カット */
export function clampText(value: string, max: number): string {
  return value.length <= max ? value : value.slice(0, max);
}

/** 行数＋文字数でカット（住所・備考など） */
export function clampMultiline(
  value: string,
  maxChars: number,
  maxLines: number,
): string {
  const lines = value.replace(/\r\n/g, "\n").split("\n").slice(0, maxLines);
  return clampText(lines.join("\n"), maxChars);
}

/** 金額・数量などの非負上限 */
export function clampNonNegative(value: number, max: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(max, value);
}

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

/** サイト言語に合わせた初期の帳票言語 */
export function defaultDocLocaleFor(siteLocale: Locale): DocLocale {
  return siteLocale === "ja" ? "ja" : "en";
}

/** サイト言語に合わせた初期通貨（日本語なら円） */
export function defaultCurrencyFor(siteLocale: Locale): CurrencyCode {
  return siteLocale === "ja" ? "JPY" : "USD";
}

/** 新規請求書の初期値。日付を使うためクライアント側でのみ呼ぶ */
export function createDefaultInvoice(siteLocale: Locale): InvoiceData {
  const issueDate = toDateInputValue(new Date());
  const docLocale = defaultDocLocaleFor(siteLocale);
  return {
    docLocale,
    documentType: "invoice",
    currency: defaultCurrencyFor(siteLocale),
    customCurrencySymbol: "",
    taxRatePercent: siteLocale === "ja" ? 10 : 0,
    withholdingTaxEnabled: false,
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
