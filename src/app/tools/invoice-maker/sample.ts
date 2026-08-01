/**
 * 初回ユーザー向けの固定サンプル請求書。
 * LocalStorage には保存せず、呼び出し一覧に常時表示する。
 *
 * デモ内容は「サイトの表示言語」（Header の JA / EN）に合わせて切り替える。
 * ※帳票側の言語トグル（docLocale）とは独立。
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
 * 架空のデモデータ。
 * @param siteLocale サイトの表示言語（useI18n の locale）。これに合わせて JA / EN の内容を返す。
 */
export function createSampleInvoice(siteLocale: DocLocale): InvoiceData {
  const issueDate = toDateInputValue(new Date());
  const dueDate = endOfNextMonth();

  if (siteLocale === "en") {
    return {
      docLocale: "en",
      currency: "USD",
      taxRatePercent: 0,
      invoiceNumber: suggestInvoiceNumber(issueDate),
      issueDate,
      dueDate,
      from: {
        name: "Alex Morgan (Freelance Designer)",
        address: "128 Market Street, Suite 4B\nSan Francisco, CA 94105\nUnited States",
        email: "alex.morgan@example.com",
        extra: "Tel +1 (415) 555-0198",
        registrationNumber: "",
      },
      to: {
        name: "Northwind Creative Inc.",
        address: "500 Madison Avenue, Floor 12\nNew York, NY 10022\nUnited States",
        email: "ap@northwind-creative.example",
        extra: "Attn: Accounting Dept.",
        registrationNumber: "",
      },
      items: [
        {
          id: createId(),
          name: "Homepage UI design",
          unitPrice: 1200,
          quantity: 1,
        },
        {
          id: createId(),
          name: "Inner pages development (3 pages)",
          unitPrice: 900,
          quantity: 1,
        },
        {
          id: createId(),
          name: "Hosting & DNS initial setup",
          unitPrice: 150,
          quantity: 1,
        },
      ],
      paymentMethod:
        "Bank transfer: First National Bank / Main Branch / Checking 004821937\nCard / Stripe: https://buy.stripe.com/sample...",
      notes:
        "Thank you for your business!\nPlease cover any bank transfer fees on your side.\nPayment is due by the date shown above.",
    };
  }

  // 日本語版デモ
  return {
    docLocale: "ja",
    currency: "JPY",
    taxRatePercent: 10,
    invoiceNumber: suggestInvoiceNumber(issueDate),
    issueDate,
    dueDate,
    from: {
      name: "山田 太郎（フリーランス）",
      address: "〒150-0001\n東京都渋谷区神宮前1-2-3",
      email: "taro.yamada@example.com",
      extra: "TEL 090-1234-5678",
      registrationNumber: "T1234567890123",
    },
    to: {
      name: "株式会社サンプルデザイン 御中",
      address: "〒100-0001\n東京都千代田区千代田1-1",
      email: "billing@sample-design.example",
      extra: "ご担当: 鈴木様",
      registrationNumber: "",
    },
    items: [
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
    ],
    paymentMethod:
      "銀行振込：〇〇銀行 〇〇支店 普通 1234567\nクレジットカード決済：https://buy.stripe.com/sample...",
    notes:
      "この度はお取引いただきありがとうございます。\n※振込手数料はお客様にてご負担をお願いいたします。",
  };
}
