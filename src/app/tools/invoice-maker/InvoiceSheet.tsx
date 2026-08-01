"use client";

import type { InvoiceSheetLabels } from "./docLabels";
import {
  computeTotals,
  formatDocDate,
  formatMoney,
  formatQuantity,
  formatTaxRate,
  itemAmount,
  printableItems,
} from "./calc";
import { documentTypeShowsDueDate, type InvoiceData } from "./types";

type InvoiceSheetProps = {
  data: InvoiceData;
  labels: InvoiceSheetLabels;
};

/** 住所などの複数行テキスト。未入力なら何も描かない */
function MultiLine({ text, className }: { text: string; className?: string }) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  return (
    <p className={`whitespace-pre-line break-words ${className ?? ""}`}>
      {trimmed}
    </p>
  );
}

/**
 * 印刷対象となる A4 縦の請求書。
 * 白背景＋モノクロ＋アクセント1色のミニマル構成で、画面プレビューと印刷で同じ見た目になる。
 */
export default function InvoiceSheet({ data, labels }: InvoiceSheetProps) {
  // 品名未入力の行は帳票に出さない（合計もその分だけに揃える）
  const items = printableItems(data.items);
  const totals = computeTotals({ ...data, items });
  const money = (value: number) =>
    formatMoney(
      value,
      data.currency,
      data.docLocale,
      data.customCurrencySymbol,
    );
  // 0% も含め税率行は常に出す（海外 Invoice で Tax の有無が分かるように）
  const registrationNumber = data.from.registrationNumber.trim();
  const paymentText = data.paymentMethod.trim();
  const notesText = data.notes.trim();
  const accentColor = data.accentColor || "#18181b";
  const documentTitle = labels.titles[data.documentType];
  const fieldLabels = labels.byDocumentType;
  const numberLabel = fieldLabels.number[data.documentType];
  const dueDateLabel = fieldLabels.dueDate[data.documentType];
  const issueDateLabel = fieldLabels.issueDate[data.documentType];
  const toLabel = fieldLabels.to[data.documentType];
  const fromLabel = fieldLabels.from[data.documentType];
  const amountDueLabel = fieldLabels.amountDue[data.documentType];
  const paymentMethodLabel = fieldLabels.paymentMethod[data.documentType];
  const thanksLabel = fieldLabels.thanks[data.documentType];
  const showDueDate = documentTypeShowsDueDate(data.documentType);

  const metaRows: { label: string; value: string }[] = [
    { label: numberLabel, value: data.invoiceNumber.trim() },
    {
      label: issueDateLabel,
      value: formatDocDate(data.issueDate, data.docLocale),
    },
    ...(showDueDate && dueDateLabel
      ? [
          {
            label: dueDateLabel,
            value: formatDocDate(data.dueDate, data.docLocale),
          },
        ]
      : []),
  ].filter((row) => row.value !== "");

  return (
    <article
      className="inv-sheet"
      lang={data.docLocale}
      style={
        {
          "--accent-color": accentColor,
        } as React.CSSProperties
      }
    >
      {/* .inv-sheet は flex 縦並び。この列が伸びることでフッターが用紙下端に付く */}
      <div className="flex flex-1 flex-col">
        {/* ヘッダー：タイトルと発行情報 */}
        <header className="flex items-start justify-between gap-8">
          <div className="flex items-center gap-4">
            {data.logoImageBase64 && (
              <img
                src={data.logoImageBase64}
                alt="Logo"
                className="h-12 w-auto max-w-[140px] object-contain print:color-adjust-exact"
              />
            )}
            <div>
              <h2 className="inv-sheet__title">{documentTitle}</h2>
              <span
                aria-hidden
                className="inv-sheet__rule"
                style={{ backgroundColor: accentColor }}
              />
            </div>
          </div>
          {metaRows.length > 0 ? (
            <dl className="grid shrink-0 grid-cols-[auto_auto] gap-x-4 gap-y-1 text-[11px]">
              {metaRows.map((row) => (
                <div key={row.label} className="contents">
                  <dt className="text-zinc-500">{row.label}</dt>
                  <dd className="text-right font-medium text-zinc-900">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </header>

        {/* 宛先と発行者 */}
        <section className="mt-10 grid grid-cols-2 gap-8">
          <div>
            <p className="inv-sheet__caption">{toLabel}</p>
            <p className="mt-1.5 break-words text-[15px] font-semibold text-zinc-900">
              {data.to.name.trim() || (
                <span className="font-normal text-zinc-300 print:invisible">
                  {labels.placeholders.partyName}
                </span>
              )}
            </p>
            <div className="mt-1.5 space-y-0.5 text-[11px] leading-relaxed text-zinc-600">
              <MultiLine text={data.to.address} />
              {data.to.email.trim() ? (
                <p className="break-all">{data.to.email.trim()}</p>
              ) : null}
              <MultiLine text={data.to.extra} />
            </div>
          </div>
          <div className="relative">
            <p className="inv-sheet__caption">{fromLabel}</p>
            <div className="relative">
              <p className="mt-1.5 break-words text-[13px] font-semibold text-zinc-900">
                {data.from.name.trim() || (
                  <span className="font-normal text-zinc-300 print:invisible">
                    {labels.placeholders.partyName}
                  </span>
                )}
              </p>
              {data.stampImageBase64 && (
                <img
                  src={data.stampImageBase64}
                  alt="Stamp"
                  className="absolute -right-4 -top-2 h-14 w-14 object-contain opacity-90 mix-blend-multiply print:color-adjust-exact"
                  style={{ mixBlendMode: "multiply" }}
                />
              )}
            </div>
            {registrationNumber ? (
              <p className="mt-0.5 text-xs text-zinc-500">
                {labels.registrationNumber}: {registrationNumber}
              </p>
            ) : null}
            <div className="mt-1.5 space-y-0.5 text-[11px] leading-relaxed text-zinc-600">
              <MultiLine text={data.from.address} />
              {data.from.email.trim() ? (
                <p className="break-all">{data.from.email.trim()}</p>
              ) : null}
              <MultiLine text={data.from.extra} />
            </div>
          </div>
        </section>

        {/* 請求金額（唯一の強調ブロック） */}
        <section className="inv-sheet__due">
          <span className="inv-sheet__due-label">{amountDueLabel}</span>
          <span className="inv-sheet__due-value">{money(totals.total)}</span>
        </section>

        {/* 品目 */}
        <table className="inv-sheet__table">
          <thead>
            <tr>
              <th scope="col" className="text-left">
                {labels.itemName}
              </th>
              <th scope="col" className="w-[22mm] text-right">
                {labels.unitPrice}
              </th>
              <th scope="col" className="w-[14mm] text-right">
                {labels.quantity}
              </th>
              <th scope="col" className="w-[26mm] text-right">
                {labels.amount}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="break-words">{item.name.trim()}</td>
                <td className="text-right tabular-nums">
                  {money(item.unitPrice)}
                </td>
                <td className="text-right tabular-nums">
                  {formatQuantity(item.quantity, data.docLocale)}
                </td>
                <td className="text-right font-medium tabular-nums">
                  {money(itemAmount(item))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 合計 */}
        <section className="inv-sheet__totals">
          <dl>
            <div className="inv-sheet__totals-row">
              <dt>{labels.subtotal}</dt>
              <dd className="tabular-nums">{money(totals.subtotal)}</dd>
            </div>
            <div className="inv-sheet__totals-row">
              <dt>
                {labels.tax}
                <span className="inv-sheet__totals-rate">
                  ({formatTaxRate(data.taxRatePercent)})
                </span>
              </dt>
              <dd className="tabular-nums">{money(totals.tax)}</dd>
            </div>
            {data.withholdingTaxEnabled && totals.withholdingTax > 0 && (
              <div className="inv-sheet__totals-row">
                <dt>
                  {labels.withholdingTax}
                  <span className="inv-sheet__totals-rate">(-10.21%)</span>
                </dt>
                <dd className="tabular-nums text-red-700">
                  -{money(totals.withholdingTax)}
                </dd>
              </div>
            )}
            <div className="inv-sheet__totals-row inv-sheet__totals-row--grand">
              <dt>{labels.total}</dt>
              <dd className="tabular-nums">{money(totals.total)}</dd>
            </div>
          </dl>
        </section>

        {/* 支払方法・備考（下部。未入力は印字しない） */}
        {paymentText || notesText ? (
          <section className="inv-sheet__footer-blocks">
            {paymentText ? (
              <div className="inv-sheet__pay-box">
                <p className="inv-sheet__caption">{paymentMethodLabel}</p>
                <p className="inv-sheet__pay-box-body">{paymentText}</p>
              </div>
            ) : null}
            {notesText ? (
              <div className="inv-sheet__notes-box">
                <p className="inv-sheet__caption">{labels.notes}</p>
                <p className="inv-sheet__notes-box-body">{notesText}</p>
              </div>
            ) : null}
          </section>
        ) : null}

        <footer className="mt-auto pt-10 text-center text-[10px] text-zinc-400">
          {thanksLabel}
        </footer>
      </div>
    </article>
  );
}
