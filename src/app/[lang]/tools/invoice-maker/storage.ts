/**
 * LocalStorage への保存と復元。
 * - draft: 編集中の請求書（入力のたびオートセーブ）
 * - history: 名前付きで明示保存した請求書一覧
 */

import { loadLocalJson, saveLocalJson } from "@/lib/localData";
import type { Locale } from "@/i18n";
import {
  createDefaultInvoice,
  createEmptyItem,
  createEmptyParty,
  createId,
  CURRENCY_CODES,
  DOC_LOCALES,
  DOCUMENT_TYPES,
  clampMultiline,
  clampNonNegative,
  clampText,
  FIELD_LIMITS,
  MAX_INVOICE_ITEMS,
  type CurrencyCode,
  type DocLocale,
  type DocumentType,
  type InvoiceAppStore,
  type InvoiceData,
  type InvoiceItem,
  type InvoiceParty,
  type SavedInvoice,
} from "./types";

const STORAGE_KEY = "invoice-maker-app:v2";
const LEGACY_KEY = "invoice-maker-app:v1";

function isCurrencyCode(value: unknown): value is CurrencyCode {
  return CURRENCY_CODES.includes(value as CurrencyCode);
}

function isDocLocale(value: unknown): value is DocLocale {
  return DOC_LOCALES.includes(value as DocLocale);
}

function isDocumentType(value: unknown): value is DocumentType {
  return DOCUMENT_TYPES.includes(value as DocumentType);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function normalizeParty(raw: unknown): InvoiceParty {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return createEmptyParty();
  }
  const o = raw as Record<string, unknown>;
  return {
    name: clampText(asString(o.name), FIELD_LIMITS.partyName),
    address: clampMultiline(
      asString(o.address),
      FIELD_LIMITS.partyAddress,
      FIELD_LIMITS.partyAddressLines,
    ),
    email: clampText(asString(o.email), FIELD_LIMITS.partyEmail),
    extra: clampMultiline(
      asString(o.extra),
      FIELD_LIMITS.partyExtra,
      FIELD_LIMITS.partyExtraLines,
    ),
    registrationNumber: clampText(
      asString(o.registrationNumber),
      FIELD_LIMITS.registrationNumber,
    ),
  };
}

function normalizeItems(raw: unknown): InvoiceItem[] {
  if (!Array.isArray(raw)) return [createEmptyItem()];
  const items = raw
    .filter((item): item is Record<string, unknown> =>
      Boolean(item && typeof item === "object" && !Array.isArray(item)),
    )
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : createId(),
      name: clampText(asString(item.name), FIELD_LIMITS.itemName),
      unitPrice: clampNonNegative(
        asNumber(item.unitPrice, 0),
        FIELD_LIMITS.unitPrice,
      ),
      quantity: clampNonNegative(
        asNumber(item.quantity, 1),
        FIELD_LIMITS.quantity,
      ),
    }));
  return items.length > 0
    ? items.slice(0, MAX_INVOICE_ITEMS)
    : [createEmptyItem()];
}

/** 1件分の請求書データを正規化。読めない場合は null */
export function parseInvoiceData(raw: unknown): InvoiceData | null {
  if (raw === null || raw === undefined) return null;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  // v1 の素の InvoiceData か、draft オブジェクトかを判別（items がある）
  if (!("items" in o) && !("invoiceNumber" in o)) return null;
  const base = createDefaultInvoice("ja");
  return {
    docLocale: isDocLocale(o.docLocale) ? o.docLocale : base.docLocale,
    documentType: isDocumentType(o.documentType)
      ? o.documentType
      : base.documentType,
    currency: isCurrencyCode(o.currency) ? o.currency : base.currency,
    customCurrencySymbol: clampText(
      asString(o.customCurrencySymbol, base.customCurrencySymbol),
      FIELD_LIMITS.customCurrencySymbol,
    ),
    taxRatePercent: Math.min(
      100,
      Math.max(0, asNumber(o.taxRatePercent, base.taxRatePercent)),
    ),
    withholdingTaxEnabled: Boolean(o.withholdingTaxEnabled),
    invoiceNumber: clampText(
      asString(o.invoiceNumber, base.invoiceNumber),
      FIELD_LIMITS.invoiceNumber,
    ),
    issueDate: asString(o.issueDate, base.issueDate),
    dueDate: asString(o.dueDate, base.dueDate),
    from: normalizeParty(o.from),
    to: normalizeParty(o.to),
    items: normalizeItems(o.items),
    paymentMethod: clampMultiline(
      asString(o.paymentMethod),
      FIELD_LIMITS.paymentMethod,
      FIELD_LIMITS.paymentMethodLines,
    ),
    notes: clampMultiline(
      asString(o.notes),
      FIELD_LIMITS.notes,
      FIELD_LIMITS.notesLines,
    ),
    logoImageBase64:
      typeof o.logoImageBase64 === "string" ? o.logoImageBase64 : undefined,
    stampImageBase64:
      typeof o.stampImageBase64 === "string" ? o.stampImageBase64 : undefined,
    accentColor: typeof o.accentColor === "string" ? o.accentColor : undefined,
  };
}

function normalizeHistory(raw: unknown): SavedInvoice[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> =>
      Boolean(item && typeof item === "object" && !Array.isArray(item)),
    )
    .map((item) => {
      const data = parseInvoiceData(item.data);
      if (!data) return null;
      return {
        id: typeof item.id === "string" ? item.id : createId("saved"),
        name:
          typeof item.name === "string" && item.name.trim()
            ? item.name.trim()
            : data.invoiceNumber || "Untitled",
        savedAt:
          typeof item.savedAt === "string" && item.savedAt
            ? item.savedAt
            : new Date().toISOString(),
        data,
      };
    })
    .filter((item): item is SavedInvoice => item !== null);
}

export function createDefaultStore(locale: Locale): InvoiceAppStore {
  return {
    draft: createDefaultInvoice(locale),
    history: [],
  };
}

/**
 * バックアップ／読込用に正規化。
 * - v2: { draft, history }
 * - v1: InvoiceData 単体 → draft として取り込み
 * - バックアップ封筒 { data: ... } にも対応
 */
export function parseImportedData(raw: unknown): InvoiceAppStore | null {
  if (raw === null || raw === undefined) return null;
  let payload: unknown = raw;
  if (
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    "data" in payload &&
    !("draft" in payload) &&
    !("items" in payload)
  ) {
    payload = (payload as { data: unknown }).data;
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }
  const o = payload as Record<string, unknown>;

  // v2 形式
  if ("draft" in o || "history" in o) {
    const draft =
      parseInvoiceData(o.draft) ?? createDefaultInvoice("ja");
    return {
      draft,
      history: normalizeHistory(o.history),
    };
  }

  // v1 形式（素の InvoiceData）
  const draft = parseInvoiceData(o);
  if (!draft) return null;
  return { draft, history: [] };
}

/** 保存済みがあれば復元。v1 からの移行にも対応 */
export function loadInvoiceStore(locale: Locale): InvoiceAppStore {
  const raw =
    loadLocalJson<unknown>(STORAGE_KEY, null) ??
    loadLocalJson<unknown>(LEGACY_KEY, null);
  const store = parseImportedData(raw) ?? createDefaultStore(locale);
  // v2 キーへ寄せておく（次回から LEGACY を読まない）
  saveInvoiceStore(store);
  return store;
}

export function saveInvoiceStore(store: InvoiceAppStore): void {
  saveLocalJson(STORAGE_KEY, store);
}

/** 下書きだけ更新して保存 */
export function saveDraft(
  draft: InvoiceData,
  history: SavedInvoice[],
): void {
  saveInvoiceStore({ draft, history });
}

/** 履歴に1件追加（先頭＝新しい順） */
export function addSavedInvoice(
  history: SavedInvoice[],
  name: string,
  data: InvoiceData,
): SavedInvoice[] {
  const entry: SavedInvoice = {
    id: createId("saved"),
    name: name.trim() || data.invoiceNumber || "Untitled",
    savedAt: new Date().toISOString(),
    // 参照共有を避けるためディープコピー相当
    data: structuredClone(data),
  };
  return [entry, ...history];
}

export function removeSavedInvoice(
  history: SavedInvoice[],
  id: string,
): SavedInvoice[] {
  return history.filter((item) => item.id !== id);
}

/** @deprecated 互換用エイリアス（バックアップの単体 InvoiceData 読込向け） */
export function parseImportedInvoiceData(raw: unknown): InvoiceData | null {
  return parseInvoiceData(raw);
}
