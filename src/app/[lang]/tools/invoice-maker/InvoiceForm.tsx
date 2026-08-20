"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, Eye, Upload, X } from "lucide-react";

import { fmt, type Locale } from "@/i18n";
import type { InvoiceMakerDict } from "@/i18n/apps/invoiceMaker";
import {
  computeTotals,
  CURRENCY_SELECT_OPTIONS,
  currencyStep,
  formatMoney,
  itemAmount,
} from "./calc";
import { getDocLabels, type DocLabels } from "./docLabels";
import {
  DOCUMENT_TYPES,
  DOC_LOCALE_OPTIONS,
  FIELD_LIMITS,
  MAX_INVOICE_ITEMS,
  TAX_RATE_PRESETS,
  clampMultiline,
  clampNonNegative,
  clampText,
  defaultDocLocaleFor,
  documentTypeShowsDueDate,
  type CurrencyCode,
  type DocLocale,
  type DocumentType,
  type InvoiceData,
  type InvoiceItem,
  type InvoiceParty,
} from "./types";

type PartyKey = "from" | "to";

type InvoiceFormProps = {
  data: InvoiceData;
  /** サイト表示言語（操作 UI・入力ラベル） */
  siteLocale: Locale;
  copy: InvoiceMakerDict;
  onPatch: (patch: Partial<InvoiceData>) => void;
  onPatchParty: (which: PartyKey, patch: Partial<InvoiceParty>) => void;
  onAddItem: () => void;
  onPatchItem: (id: string, patch: Partial<InvoiceItem>) => void;
  onRemoveItem: (id: string) => void;
  onPreview: () => void;
  onPrint: () => void;
};

/** 0 は空欄として見せる（入力途中で「0」が居座らないように） */
function numberFieldValue(value: number): string {
  return value === 0 ? "" : String(value);
}

function parseNumberField(raw: string, max: number): number {
  if (raw.trim() === "") return 0;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return clampNonNegative(parsed, max);
}

/** 画像ファイルを Base64 data URL に変換 */
async function readImageAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** 画像アップロードハンドラー */
function handleImageUpload(
  event: React.ChangeEvent<HTMLInputElement>,
  onBase64: (dataURL: string) => void,
  imageTypeError: string,
) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    alert(imageTypeError);
    return;
  }
  readImageAsDataURL(file).then(onBase64).catch(console.error);
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="inv-field-label">{label}</span>
      {children}
    </label>
  );
}

function Section({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="inv-section">
      <div className="mb-2.5 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1 basis-[min(100%,12rem)]">
          <h2 className="inv-section__title break-words">{title}</h2>
          {hint ? (
            <p className="mt-0.5 break-words text-[10px] leading-relaxed text-zinc-500">
              {hint}
            </p>
          ) : null}
        </div>
        {action ? (
          <div className="max-w-full shrink-0">{action}</div>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/** 発行者／宛先の共通入力 */
function PartyFields({
  party,
  which,
  fields,
  placeholders,
  onPatchParty,
  showRegistrationNumber = false,
}: {
  party: InvoiceParty;
  which: PartyKey;
  fields: DocLabels["form"]["fields"];
  placeholders: {
    namePlaceholder: string;
    addressPlaceholder: string;
    emailPlaceholder: string;
    extraPlaceholder: string;
  };
  onPatchParty: (which: PartyKey, patch: Partial<InvoiceParty>) => void;
  /** 発行者だけ登録番号（インボイス）欄を出す */
  showRegistrationNumber?: boolean;
}) {
  return (
    <div className="space-y-2.5">
      <Field label={fields.name}>
        <input
          type="text"
          value={party.name}
          onChange={(e) =>
            onPatchParty(which, {
              name: clampText(e.target.value, FIELD_LIMITS.partyName),
            })
          }
          maxLength={FIELD_LIMITS.partyName}
          placeholder={placeholders.namePlaceholder}
          className="inv-input"
        />
      </Field>
      {showRegistrationNumber ? (
        <Field label={fields.registrationNumber}>
          <input
            type="text"
            value={party.registrationNumber}
            onChange={(e) =>
              onPatchParty(which, {
                registrationNumber: clampText(
                  e.target.value,
                  FIELD_LIMITS.registrationNumber,
                ),
              })
            }
            maxLength={FIELD_LIMITS.registrationNumber}
            placeholder={fields.registrationNumberPlaceholder}
            className="inv-input"
            autoComplete="off"
            spellCheck={false}
          />
        </Field>
      ) : null}
      <Field label={fields.address}>
        <textarea
          value={party.address}
          onChange={(e) =>
            onPatchParty(which, {
              address: clampMultiline(
                e.target.value,
                FIELD_LIMITS.partyAddress,
                FIELD_LIMITS.partyAddressLines,
              ),
            })
          }
          maxLength={FIELD_LIMITS.partyAddress}
          placeholder={placeholders.addressPlaceholder}
          rows={2}
          className="inv-input resize-y"
        />
      </Field>
      <div className="inv-cols-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <Field label={fields.email}>
          <input
            type="email"
            value={party.email}
            onChange={(e) =>
              onPatchParty(which, {
                email: clampText(e.target.value, FIELD_LIMITS.partyEmail),
              })
            }
            maxLength={FIELD_LIMITS.partyEmail}
            placeholder={placeholders.emailPlaceholder}
            className="inv-input"
          />
        </Field>
        <Field label={fields.extra}>
          <textarea
            value={party.extra}
            onChange={(e) =>
              onPatchParty(which, {
                extra: clampMultiline(
                  e.target.value,
                  FIELD_LIMITS.partyExtra,
                  FIELD_LIMITS.partyExtraLines,
                ),
              })
            }
            maxLength={FIELD_LIMITS.partyExtra}
            placeholder={placeholders.extraPlaceholder}
            rows={2}
            className="inv-input resize-y"
          />
        </Field>
      </div>
    </div>
  );
}

/**
 * 2カラム入力フォーム。
 * 左: 発行者・請求先・基本情報／右: 品目・支払・言語・通貨
 */
export default function InvoiceForm({
  data,
  siteLocale,
  copy,
  onPatch,
  onPatchParty,
  onAddItem,
  onPatchItem,
  onRemoveItem,
  onPreview,
  onPrint,
}: InvoiceFormProps) {
  // 操作 UI／入力ラベル = サイト言語（最も近い書類辞書へマップ）
  // PDF 印字見出し = data.docLocale（InvoiceSheet 側）
  const uiDocLocale = defaultDocLocaleFor(siteLocale);
  const ui = getDocLabels(uiDocLocale);
  const form = ui.form;
  const byType = ui.byDocumentType;
  const totals = computeTotals(data);
  const numberLabel = byType.number[data.documentType];
  const dueDateLabel = byType.dueDate[data.documentType];
  const issueDateLabel = byType.issueDate[data.documentType];
  const showDueDate = documentTypeShowsDueDate(data.documentType);
  const paymentHeading = byType.paymentMethod[data.documentType];
  const paymentHint = form.paymentHintByType[data.documentType];
  const paymentPlaceholder = form.paymentPlaceholderByType[data.documentType];
  const toHeading = byType.to[data.documentType];
  const toNamePlaceholder = form.toNamePlaceholderByType[data.documentType];
  const fromHeading = byType.from[data.documentType];
  const moneyLocale = uiDocLocale;
  /**
   * コンパクト判定は「パネルの実幅」。
   * 表示幅トグル（縦型）では viewport が広くても中身だけ狭いため、
   * Tailwind の md: では切り替わらない。
   */
  const COMPACT_MAX_PX = 680;
  const panelRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(true);
  const [mobilePage, setMobilePage] = useState<0 | 1>(0);
  const wizard = copy.mobileWizard;

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const sync = () => {
      setCompact(el.clientWidth < COMPACT_MAX_PX);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function goMobilePage(next: 0 | 1) {
    setMobilePage(next);
    window.requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  }

  const showPage1 = !compact || mobilePage === 0;
  const showPage2 = !compact || mobilePage === 1;

  return (
    <div
      ref={panelRef}
      className={`inv-panel${compact ? " inv-panel--compact" : ""}`}
      data-compact={compact ? "true" : "false"}
    >
      {/* 狭い幅：2カラムの代わりにページ切替 */}
      {compact ? (
        <div className="inv-mobile-wizard" aria-label={wizard.page1Label}>
          <div className="inv-mobile-wizard__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mobilePage === 0}
              className={`inv-mobile-wizard__tab${
                mobilePage === 0 ? " inv-mobile-wizard__tab--on" : ""
              }`}
              onClick={() => goMobilePage(0)}
            >
              <span className="inv-mobile-wizard__step">1</span>
              {wizard.page1Label}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mobilePage === 1}
              className={`inv-mobile-wizard__tab${
                mobilePage === 1 ? " inv-mobile-wizard__tab--on" : ""
              }`}
              onClick={() => goMobilePage(1)}
            >
              <span className="inv-mobile-wizard__step">2</span>
              {wizard.page2Label}
            </button>
          </div>
          <p className="inv-mobile-wizard__progress">
            {fmt(wizard.stepOf, {
              current: String(mobilePage + 1),
              total: "2",
            })}
          </p>
        </div>
      ) : null}

      <div
        className={
          compact
            ? "inv-form-pages grid grid-cols-1 gap-6"
            : "inv-form-pages grid grid-cols-2 gap-8"
        }
      >
        {/* ---------- ページ1 / PC左列：相手・基本 ---------- */}
        <div
          className={`inv-form-page min-w-0 space-y-0${
            showPage1 ? " inv-form-page--active" : " inv-form-page--hidden"
          }`}
        >
          <Section title={form.basicsHeading}>
            <div className="space-y-2.5">
              <Field label={numberLabel}>
                <input
                  type="text"
                  value={data.invoiceNumber}
                  onChange={(e) =>
                    onPatch({
                      invoiceNumber: clampText(
                        e.target.value,
                        FIELD_LIMITS.invoiceNumber,
                      ),
                    })
                  }
                  maxLength={FIELD_LIMITS.invoiceNumber}
                  placeholder={form.invoiceNumberPlaceholder}
                  className="inv-input"
                />
              </Field>
              <div
                className={
                  showDueDate
                    ? "inv-cols-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2"
                    : "grid grid-cols-1 gap-2.5"
                }
              >
                <Field label={issueDateLabel}>
                  <input
                    type="date"
                    value={data.issueDate}
                    onChange={(e) => onPatch({ issueDate: e.target.value })}
                    className="inv-input"
                  />
                </Field>
                {showDueDate && dueDateLabel ? (
                  <Field label={dueDateLabel}>
                    <input
                      type="date"
                      value={data.dueDate}
                      onChange={(e) => onPatch({ dueDate: e.target.value })}
                      className="inv-input"
                    />
                  </Field>
                ) : null}
              </div>
            </div>
          </Section>

          <Section title={fromHeading} hint={form.fromHint}>
            <PartyFields
              party={data.from}
              which="from"
              fields={form.fields}
              placeholders={{
                namePlaceholder: form.fromNamePlaceholder,
                addressPlaceholder: form.fromAddressPlaceholder,
                emailPlaceholder: form.fromEmailPlaceholder,
                extraPlaceholder: form.fromExtraPlaceholder,
              }}
              onPatchParty={onPatchParty}
              showRegistrationNumber
            />
          </Section>

          <Section title={toHeading}>
            <PartyFields
              party={data.to}
              which="to"
              fields={form.fields}
              placeholders={{
                namePlaceholder: toNamePlaceholder,
                addressPlaceholder: form.toAddressPlaceholder,
                emailPlaceholder: form.toEmailPlaceholder,
                extraPlaceholder: form.toExtraPlaceholder,
              }}
              onPatchParty={onPatchParty}
            />
          </Section>

          {compact ? (
            <div className="mt-5 border-t border-zinc-100 pt-4">
              <button
                type="button"
                className="inv-wizard-nav-btn inv-wizard-nav-btn--next"
                onClick={() => goMobilePage(1)}
              >
                {wizard.next}
                <span className="font-normal text-zinc-500">
                  · {wizard.page2Label}
                </span>
                <ChevronRight className="size-4 shrink-0" aria-hidden />
              </button>
            </div>
          ) : null}
        </div>

        {/* ---------- ページ2 / PC右列：設定・品目 ---------- */}
        <div
          className={`inv-form-page min-w-0 space-y-0${
            showPage2 ? " inv-form-page--active" : " inv-form-page--hidden"
          }`}
        >
          <Section
            title={copy.settings.heading}
            hint={copy.settings.documentTypeHint}
          >
            <div className="space-y-2.5">
              <p
                className="rounded-md border border-sky-100 bg-sky-50/80 px-2.5 py-2 text-[10px] leading-relaxed text-sky-950/80"
                role="note"
              >
                {copy.settings.languageSeparation}
              </p>

              <div className="inv-cols-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Field label={copy.settings.documentType}>
                  <select
                    value={data.documentType}
                    onChange={(e) =>
                      onPatch({
                        documentType: e.target.value as DocumentType,
                      })
                    }
                    className="inv-input inv-select"
                  >
                    {DOCUMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {ui.titles[type]}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label={copy.settings.docLanguage}>
                  <select
                    value={data.docLocale}
                    onChange={(e) =>
                      onPatch({ docLocale: e.target.value as DocLocale })
                    }
                    className="inv-input inv-select"
                    aria-describedby="inv-doc-lang-hint"
                  >
                    {DOC_LOCALE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <p
                id="inv-doc-lang-hint"
                className="text-[10px] leading-relaxed text-zinc-500"
              >
                {copy.settings.docLanguageHint}
              </p>

              <div className="inv-cols-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Field label={copy.settings.currency}>
                  <select
                    value={data.currency}
                    onChange={(e) =>
                      onPatch({
                        currency: e.target.value as CurrencyCode,
                      })
                    }
                    className="inv-input inv-select"
                  >
                    {CURRENCY_SELECT_OPTIONS.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.label}
                      </option>
                    ))}
                    <option value="CUSTOM">
                      {copy.settings.currencyCustom}…
                    </option>
                  </select>
                </Field>

                {data.currency === "CUSTOM" ? (
                  <Field label={copy.settings.currencyCustom}>
                    <input
                      type="text"
                      value={data.customCurrencySymbol}
                      onChange={(e) =>
                        onPatch({
                          customCurrencySymbol: clampText(
                            e.target.value,
                            FIELD_LIMITS.customCurrencySymbol,
                          ),
                        })
                      }
                      maxLength={FIELD_LIMITS.customCurrencySymbol}
                      placeholder={copy.settings.currencyCustomPlaceholder}
                      className="inv-input"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </Field>
                ) : (
                  <div className="hidden sm:block" aria-hidden />
                )}
              </div>
              {data.currency === "CUSTOM" ? (
                <p className="text-[10px] leading-relaxed text-zinc-500">
                  {copy.settings.currencyCustomHint}
                </p>
              ) : null}

              <Field label={copy.settings.taxRate}>
                <div className="flex flex-wrap items-center gap-1.5">
                  {TAX_RATE_PRESETS.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => onPatch({ taxRatePercent: rate })}
                      aria-pressed={data.taxRatePercent === rate}
                      className={`inv-chip ${
                        data.taxRatePercent === rate ? "inv-chip--on" : ""
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                  <span className="inline-flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={numberFieldValue(data.taxRatePercent)}
                      onChange={(e) =>
                        onPatch({
                          taxRatePercent: parseNumberField(e.target.value, 100),
                        })
                      }
                      aria-label={copy.settings.taxRateCustomAria}
                      placeholder="0"
                      className="inv-input w-16 text-right"
                    />
                    <span className="text-[11px] text-zinc-500">%</span>
                  </span>
                </div>
              </Field>

              <label className="flex items-start gap-2 text-[13px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.withholdingTaxEnabled}
                  onChange={(e) =>
                    onPatch({ withholdingTaxEnabled: e.target.checked })
                  }
                  className="mt-0.5"
                />
                <span>
                  <span className="font-medium">{copy.settings.withholdingTax}</span>
                  {copy.settings.withholdingTaxHint && (
                    <span className="block text-[11px] text-zinc-500 mt-0.5">
                      {copy.settings.withholdingTaxHint}
                    </span>
                  )}
                </span>
              </label>

              <Field label={copy.settings.accentColor}>
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                  <input
                    type="color"
                    value={data.accentColor || "#18181b"}
                    onChange={(e) => onPatch({ accentColor: e.target.value })}
                    className="h-9 w-16 shrink-0 cursor-pointer rounded border border-zinc-200"
                  />
                  <span className="min-w-0 break-words text-[11px] text-zinc-500">
                    {copy.settings.accentColorHint}
                  </span>
                </div>
              </Field>

              <div className="inv-cols-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Field label={copy.settings.logo}>
                  <div className="flex flex-col gap-1.5">
                    {data.logoImageBase64 ? (
                      <div className="flex items-center gap-1.5">
                        <img
                          src={data.logoImageBase64}
                          alt=""
                          className="h-10 w-auto max-w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => onPatch({ logoImageBase64: undefined })}
                          className="inv-ghost-btn shrink-0 text-xs"
                          aria-label={copy.settings.logoClear}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : null}
                    <label className="inv-ghost-btn inline-flex w-full cursor-pointer items-center justify-center gap-1 text-[11px]">
                      <Upload className="h-3.5 w-3.5 shrink-0" />
                      {copy.settings.logoSelect}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageUpload(
                            e,
                            (base64) => onPatch({ logoImageBase64: base64 }),
                            copy.settings.imageTypeError,
                          )
                        }
                        className="hidden"
                      />
                    </label>
                  </div>
                </Field>

                <Field label={copy.settings.stamp}>
                  <div className="flex flex-col gap-1.5">
                    {data.stampImageBase64 ? (
                      <div className="flex items-center gap-1.5">
                        <img
                          src={data.stampImageBase64}
                          alt=""
                          className="h-10 w-10 object-contain"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            onPatch({ stampImageBase64: undefined })
                          }
                          className="inv-ghost-btn shrink-0 text-xs"
                          aria-label={copy.settings.stampClear}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : null}
                    <label className="inv-ghost-btn inline-flex w-full cursor-pointer items-center justify-center gap-1 text-[11px]">
                      <Upload className="h-3.5 w-3.5 shrink-0" />
                      {copy.settings.stampSelect}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageUpload(
                            e,
                            (base64) => onPatch({ stampImageBase64: base64 }),
                            copy.settings.imageTypeError,
                          )
                        }
                        className="hidden"
                      />
                    </label>
                  </div>
                </Field>
              </div>
            </div>
          </Section>

          <Section
            title={form.items.heading}
            action={
              <button
                type="button"
                onClick={onAddItem}
                disabled={data.items.length >= MAX_INVOICE_ITEMS}
                className="inv-ghost-btn disabled:cursor-not-allowed disabled:opacity-40"
              >
                {form.items.add}
              </button>
            }
          >
            <ul className="space-y-1.5">
              {data.items.map((item) => (
                <li key={item.id} className="inv-item-row">
                  {/*
                    コンパクト: 品名＋削除 / 単価・数量・金額（CSS grid で幅を自動配分）
                    通常幅: 品名・単価・数量・金額・削除を1行に
                    ※ viewport の sm: ではなく .inv-panel--compact で切替
                  */}
                  <div className="inv-item-row__layout">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        onPatchItem(item.id, {
                          name: clampText(
                            e.target.value,
                            FIELD_LIMITS.itemName,
                          ),
                        })
                      }
                      maxLength={FIELD_LIMITS.itemName}
                      placeholder={form.items.namePlaceholder}
                      aria-label={form.items.name}
                      className="inv-input inv-item-row__name"
                    />
                    <input
                      type="number"
                      min={0}
                      max={FIELD_LIMITS.unitPrice}
                      step={currencyStep(
                        data.currency,
                        data.customCurrencySymbol,
                      )}
                      value={numberFieldValue(item.unitPrice)}
                      onChange={(e) =>
                        onPatchItem(item.id, {
                          unitPrice: parseNumberField(
                            e.target.value,
                            FIELD_LIMITS.unitPrice,
                          ),
                        })
                      }
                      placeholder={form.items.unitPrice}
                      aria-label={form.items.unitPrice}
                      className="inv-input inv-item-row__price"
                    />
                    <input
                      type="number"
                      min={0}
                      max={FIELD_LIMITS.quantity}
                      step={1}
                      value={numberFieldValue(item.quantity)}
                      onChange={(e) =>
                        onPatchItem(item.id, {
                          quantity: parseNumberField(
                            e.target.value,
                            FIELD_LIMITS.quantity,
                          ),
                        })
                      }
                      placeholder={form.items.quantity}
                      aria-label={form.items.quantity}
                      className="inv-input inv-item-row__qty"
                    />
                    <p
                      className="inv-item-row__amount"
                      title={form.items.amount}
                    >
                      {formatMoney(
                        itemAmount(item),
                        data.currency,
                        moneyLocale,
                        data.customCurrencySymbol,
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      title={form.items.remove}
                      aria-label={form.items.removeAria}
                      className="inv-remove-btn inv-item-row__remove"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-2.5 flex items-baseline justify-between border-t border-zinc-100 pt-2">
              <span className="text-[11px] text-zinc-500">
                {form.items.subtotalLabel}
              </span>
              <span className="tabular-nums text-sm font-semibold text-zinc-900">
                {formatMoney(
                  totals.subtotal,
                  data.currency,
                  moneyLocale,
                  data.customCurrencySymbol,
                )}
              </span>
            </div>
          </Section>

          <Section title={paymentHeading} hint={paymentHint}>
            <textarea
              value={data.paymentMethod}
              onChange={(e) =>
                onPatch({
                  paymentMethod: clampMultiline(
                    e.target.value,
                    FIELD_LIMITS.paymentMethod,
                    FIELD_LIMITS.paymentMethodLines,
                  ),
                })
              }
              maxLength={FIELD_LIMITS.paymentMethod}
              placeholder={paymentPlaceholder}
              rows={3}
              className="inv-input resize-y"
            />
          </Section>

          <Section title={ui.notes}>
            <textarea
              value={data.notes}
              onChange={(e) =>
                onPatch({
                  notes: clampMultiline(
                    e.target.value,
                    FIELD_LIMITS.notes,
                    FIELD_LIMITS.notesLines,
                  ),
                })
              }
              maxLength={FIELD_LIMITS.notes}
              placeholder={form.notesPlaceholder}
              rows={2}
              className="inv-input resize-y"
            />
          </Section>
        </div>
      </div>

      {/* 確認／PDF：ページ1・2どちらでも同じ位置に表示 */}
      <div className="mt-5 flex w-full max-w-full flex-wrap items-center justify-stretch gap-2 border-t border-zinc-100 pt-4 sm:justify-end">
        <button
          type="button"
          onClick={onPreview}
          className="inv-action-btn inv-action-btn--secondary"
        >
          <Eye className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
          {compact ? copy.toolbar.previewShort : copy.toolbar.preview}
        </button>
        <button
          type="button"
          onClick={onPrint}
          className="inv-action-btn inv-action-btn--primary"
        >
          {compact ? copy.toolbar.printShort : copy.toolbar.print}
        </button>
      </div>
    </div>
  );
}
