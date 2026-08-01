/**
 * 初回ユーザー向けの固定サンプル請求書。
 * LocalStorage には保存せず、呼び出し一覧に常時表示する。
 */

import {
  createId,
  suggestInvoiceNumber,
  toDateInputValue,
  type DocLocale,
  type InvoiceData,
} from "./types";

/** 履歴と衝突しない固定 ID */
export const SAMPLE_INVOICE_ID = "__sample-web-design-demo__";

/** 来月末（ローカル日付） */
function endOfNextMonth(): string {
  const now = new Date();
  // 再来月の 0 日目 ＝ 来月の末日
  return toDateInputValue(new Date(now.getFullYear(), now.getMonth() + 2, 0));
}

export function isSampleInvoiceId(id: string): boolean {
  return id === SAMPLE_INVOICE_ID;
}

/**
 * 架空のデモデータ。発行日は呼んだ時点の「今日」、支払期日は来月末。
 * 呼び出し時は既存入力をすべて上書きする。
 */
export function createSampleInvoice(locale: DocLocale): InvoiceData {
  const issueDate = toDateInputValue(new Date());
  const dueDate = endOfNextMonth();
  const isJa = locale === "ja";

  return {
    docLocale: locale,
    currency: isJa ? "JPY" : "USD",
    taxRatePercent: isJa ? 10 : 0,
    invoiceNumber: suggestInvoiceNumber(issueDate),
    issueDate,
    dueDate,
    from: {
      name: isJa ? "山田 太郎（フリーランス）" : "Taro Yamada (Freelance)",
      address: isJa
        ? "〒150-0001\n東京都渋谷区神宮前1-2-3"
        : "1-2-3 Jingumae, Shibuya\nTokyo 150-0001, Japan",
      email: "taro.yamada@example.com",
      extra: isJa ? "TEL 090-1234-5678" : "Tel +81 90-1234-5678",
      registrationNumber: "T1234567890123",
    },
    to: {
      name: isJa
        ? "株式会社サンプルデザイン 御中"
        : "Sample Design Co., Ltd.",
      address: isJa
        ? "〒100-0001\n東京都千代田区千代田1-1"
        : "1-1 Chiyoda, Chiyoda-ku\nTokyo 100-0001, Japan",
      email: "billing@sample-design.example",
      extra: isJa ? "ご担当: 鈴木様" : "Attn: Suzuki",
      registrationNumber: "",
    },
    items: isJa
      ? [
          {
            id: createId(),
            name: "Webサイトトップページ デザイン制作",
            unitPrice: 50000,
            quantity: 1,
          },
          {
            id: createId(),
            name: "下層ページ コーディング（3P）",
            unitPrice: 45000,
            quantity: 1,
          },
          {
            id: createId(),
            name: "サーバー初期設定費用",
            unitPrice: 10000,
            quantity: 1,
          },
        ]
      : [
          {
            id: createId(),
            name: "Homepage design",
            unitPrice: 500,
            quantity: 1,
          },
          {
            id: createId(),
            name: "Inner pages coding (3 pages)",
            unitPrice: 450,
            quantity: 1,
          },
          {
            id: createId(),
            name: "Server initial setup",
            unitPrice: 100,
            quantity: 1,
          },
        ],
    paymentMethod: isJa
      ? "銀行振込：〇〇銀行 〇〇支店 普通 1234567\nクレジットカード決済：https://buy.stripe.com/sample..."
      : "Bank transfer: Example Bank / Main Branch / 1234567\nCard payment: https://buy.stripe.com/sample...",
    notes:
      "Thank you for your business!\n※振込手数料はお客様にてご負担をお願いいたします。",
  };
}
