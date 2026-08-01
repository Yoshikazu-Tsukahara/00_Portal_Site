"use client";

import type { ReactNode } from "react";
import { Eye, Upload, X } from "lucide-react";

import type { InvoiceMakerDict } from "@/i18n/apps/invoiceMaker";
import {
  computeTotals,
  currencyStep,
  currencySymbol,
  formatMoney,
  itemAmount,
} from "./calc";
import {
  CURRENCY_CODES,
  FIELD_LIMITS,
  MAX_INVOICE_ITEMS,
  TAX_RATE_PRESETS,
  clampMultiline,
  clampNonNegative,
  clampText,
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
) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    alert("画像ファイルを選択してください");
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
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="inv-section__title">{title}</h2>
          {hint ? (
            <p className="mt-0.5 break-words text-[10px] leading-relaxed text-zinc-500">
              {hint}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

/** 発行者／宛先の共通入力 */
function PartyFields({
  party,
  which,
  copy,
  placeholders,
  onPatchParty,
  showRegistrationNumber = false,
}: {
  party: InvoiceParty;
  which: PartyKey;
  copy: InvoiceMakerDict;
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
      <Field label={copy.fields.name}>
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
        <Field label={copy.fields.registrationNumber}>
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
            placeholder={copy.fields.registrationNumberPlaceholder}
            className="inv-input"
            autoComplete="off"
            spellCheck={false}
          />
        </Field>
      ) : null}
      <Field label={copy.fields.address}>
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
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <Field label={copy.fields.email}>
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
        <Field label={copy.fields.extra}>
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
  copy,
  onPatch,
  onPatchParty,
  onAddItem,
  onPatchItem,
  onRemoveItem,
  onPreview,
  onPrint,
}: InvoiceFormProps) {
  const localeOptions: { value: DocLocale; label: string }[] = [
    { value: "ja", label: copy.settings.localeJa },
    { value: "en", label: copy.settings.localeEn },
  ];
  const documentTypeOptions: { value: DocumentType; label: string }[] = [
    { value: "invoice", label: copy.settings.typeInvoice },
    { value: "estimate", label: copy.settings.typeEstimate },
    { value: "deliveryNote", label: copy.settings.typeDeliveryNote },
    { value: "receipt", label: copy.settings.typeReceipt },
  ];
  const totals = computeTotals(data);
  const numberLabel = copy.basics.byDocumentType.number[data.documentType];
  const dueDateLabel = copy.basics.byDocumentType.dueDate[data.documentType];
  const issueDateLabel = copy.basics.byDocumentType.issueDate[data.documentType];
  const showDueDate = documentTypeShowsDueDate(data.documentType);
  const paymentHeading = copy.payment.headingByType[data.documentType];
  const paymentHint = copy.payment.hintByType[data.documentType];
  const paymentPlaceholder = copy.payment.placeholderByType[data.documentType];
  const toHeading = copy.to.headingByType[data.documentType];
  const toNamePlaceholder = copy.to.namePlaceholderByType[data.documentType];
  const fromHeading = copy.from.headingByType[data.documentType];

  return (
    <div className="inv-panel">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        {/* ---------- 左列 ---------- */}
        <div className="min-w-0 space-y-0">
          <Section title={copy.basics.heading}>
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
                  placeholder={copy.basics.invoiceNumberPlaceholder}
                  className="inv-input"
                />
              </Field>
              <div
                className={
                  showDueDate
                    ? "grid grid-cols-1 gap-2.5 sm:grid-cols-2"
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

          <Section title={fromHeading} hint={copy.from.hint}>
            <PartyFields
              party={data.from}
              which="from"
              copy={copy}
              placeholders={copy.from}
              onPatchParty={onPatchParty}
              showRegistrationNumber
            />
          </Section>

          <Section title={toHeading}>
            <PartyFields
              party={data.to}
              which="to"
              copy={copy}
              placeholders={{
                namePlaceholder: toNamePlaceholder,
                addressPlaceholder: copy.to.addressPlaceholder,
                emailPlaceholder: copy.to.emailPlaceholder,
                extraPlaceholder: copy.to.extraPlaceholder,
              }}
              onPatchParty={onPatchParty}
            />
          </Section>
        </div>

        {/* ---------- 右列 ---------- */}
        <div className="min-w-0 space-y-0">
          <Section
            title={copy.settings.heading}
            hint={copy.settings.documentTypeHint}
          >
            <div className="space-y-2.5">
              <Field label={copy.settings.documentType}>
                <select
                  value={data.documentType}
                  onChange={(e) =>
                    onPatch({ documentType: e.target.value as DocumentType })
                  }
                  className="inv-input"
                >
                  {documentTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={copy.settings.docLanguage}>
                <div className="inv-seg">
                  {localeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onPatch({ docLocale: option.value })}
                      aria-pressed={data.docLocale === option.value}
                      className={`inv-seg__btn ${
                        data.docLocale === option.value
                          ? "inv-seg__btn--on"
                          : ""
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label={copy.settings.currency}>
                <div className="inv-seg">
                  {CURRENCY_CODES.map((code: CurrencyCode) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => onPatch({ currency: code })}
                      aria-pressed={data.currency === code}
                      className={`inv-seg__btn ${
                        data.currency === code ? "inv-seg__btn--on" : ""
                      }`}
                    >
                      <span className="mr-1">{currencySymbol(code)}</span>
                      {code}
                    </button>
                  ))}
                </div>
              </Field>

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
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={data.accentColor || "#18181b"}
                    onChange={(e) => onPatch({ accentColor: e.target.value })}
                    className="h-9 w-16 cursor-pointer rounded border border-zinc-200"
                  />
                  <span className="text-[11px] text-zinc-500">
                    {copy.settings.accentColorHint}
                  </span>
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-2.5">
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
                          handleImageUpload(e, (base64) =>
                            onPatch({ logoImageBase64: base64 }),
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
                          handleImageUpload(e, (base64) =>
                            onPatch({ stampImageBase64: base64 }),
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
            title={copy.items.heading}
            action={
              <button
                type="button"
                onClick={onAddItem}
                disabled={data.items.length >= MAX_INVOICE_ITEMS}
                className="inv-ghost-btn disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copy.items.add}
              </button>
            }
          >
            <ul className="space-y-1.5">
              {data.items.map((item) => (
                <li key={item.id} className="inv-item-row">
                  {/*
                    スマホ: 品名＋削除 / 単価・数量・金額
                    sm以上: 品名・単価・数量・金額・削除を1行に
                  */}
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                    <div className="flex min-w-0 flex-1 items-center gap-1.5">
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
                        placeholder={copy.items.namePlaceholder}
                        aria-label={copy.items.name}
                        className="inv-input !py-1 min-w-0 flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        title={copy.items.remove}
                        aria-label={copy.items.removeAria}
                        className="inv-remove-btn sm:hidden"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        max={FIELD_LIMITS.unitPrice}
                        step={currencyStep(data.currency)}
                        value={numberFieldValue(item.unitPrice)}
                        onChange={(e) =>
                          onPatchItem(item.id, {
                            unitPrice: parseNumberField(
                              e.target.value,
                              FIELD_LIMITS.unitPrice,
                            ),
                          })
                        }
                        placeholder={copy.items.unitPrice}
                        aria-label={copy.items.unitPrice}
                        className="inv-input !py-1 w-[6.5rem] text-right sm:w-[5.5rem]"
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
                        placeholder={copy.items.quantity}
                        aria-label={copy.items.quantity}
                        className="inv-input !py-1 w-14 text-right sm:w-[3.75rem]"
                      />
                      <p
                        className="inv-item-row__amount w-[4.5rem] shrink-0 text-right"
                        title={copy.items.amount}
                      >
                        {formatMoney(
                          itemAmount(item),
                          data.currency,
                          data.docLocale,
                        )}
                      </p>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        title={copy.items.remove}
                        aria-label={copy.items.removeAria}
                        className="inv-remove-btn hidden sm:flex"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-2.5 flex items-baseline justify-between border-t border-zinc-100 pt-2">
              <span className="text-[11px] text-zinc-500">
                {copy.items.subtotalLabel}
              </span>
              <span className="tabular-nums text-sm font-semibold text-zinc-900">
                {formatMoney(totals.subtotal, data.currency, data.docLocale)}
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

          <Section title={copy.notes.heading}>
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
              placeholder={copy.notes.placeholder}
              rows={2}
              className="inv-input resize-y"
            />
          </Section>
        </div>
      </div>

      {/* メイン枠の右下：別枠は作らずパネル内に配置 */}
      <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-zinc-100 pt-4">
        <button
          type="button"
          onClick={onPreview}
          className="inv-action-btn inv-action-btn--secondary"
        >
          <Eye className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
          <span className="sm:hidden">{copy.toolbar.previewShort}</span>
          <span className="hidden sm:inline">{copy.toolbar.preview}</span>
        </button>
        <button
          type="button"
          onClick={onPrint}
          className="inv-action-btn inv-action-btn--primary"
        >
          <span className="sm:hidden">{copy.toolbar.printShort}</span>
          <span className="hidden sm:inline">{copy.toolbar.print}</span>
        </button>
      </div>
    </div>
  );
}
