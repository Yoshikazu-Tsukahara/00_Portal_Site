/**
 * 初回ユーザー向けの固定サンプル請求書。
 * LocalStorage には保存せず、呼び出し一覧に常時表示する。
 *
 * デモ本文はサイトの「表示言語」(ヘッダー) に合わせる。
 * 読み込み時に書類言語（docLocale）もその表示言語へ揃える。
 */

import type { Locale } from "@/i18n";
import {
  createId,
  defaultCurrencyFor,
  defaultDocLocaleFor,
  defaultTaxRateFor,
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

type SampleBody = {
  currency: InvoiceData["currency"];
  taxRatePercent: number;
  from: InvoiceData["from"];
  to: InvoiceData["to"];
  items: { name: string; unitPrice: number; quantity: number }[];
  paymentMethod: string;
  notes: string;
};

const SAMPLE_JA: SampleBody = {
  currency: "JPY",
  taxRatePercent: 10,
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
    { name: "Webサイトトップページ デザイン制作", unitPrice: 50000, quantity: 1 },
    { name: "下層ページ コーディング（3P）", unitPrice: 45000, quantity: 1 },
    { name: "サーバー初期設定費用", unitPrice: 10000, quantity: 1 },
  ],
  paymentMethod:
    "銀行振込：〇〇銀行 〇〇支店 普通 1234567\nクレジットカード決済：https://buy.stripe.com/sample...",
  notes:
    "この度はお取引いただきありがとうございます。\n※振込手数料はお客様にてご負担をお願いいたします。",
};

const SAMPLE_EN: SampleBody = {
  currency: "USD",
  taxRatePercent: 0,
  from: {
    name: "Alex Morgan (Freelance Designer)",
    address:
      "128 Market Street, Suite 4B\nSan Francisco, CA 94105\nUnited States",
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
    { name: "Homepage UI design", unitPrice: 1200, quantity: 1 },
    { name: "Inner pages development (3 pages)", unitPrice: 900, quantity: 1 },
    { name: "Hosting & DNS initial setup", unitPrice: 150, quantity: 1 },
  ],
  paymentMethod:
    "Bank transfer: First National Bank / Main Branch / Checking 004821937\nCard / Stripe: https://buy.stripe.com/sample...",
  notes:
    "Thank you for your business!\nPlease cover any bank transfer fees on your side.\nPayment is due by the date shown above.",
};

const SAMPLE_KO: SampleBody = {
  currency: "KRW",
  taxRatePercent: 10,
  from: {
    name: "김민수 (프리랜서 디자이너)",
    address: "서울특별시 강남구 테헤란로 123\n디자인타워 4층",
    email: "minsu.kim@example.com",
    extra: "TEL 010-1234-5678",
    registrationNumber: "",
  },
  to: {
    name: "샘플디자인 주식회사 귀중",
    address: "서울특별시 중구 세종대로 1",
    email: "billing@sample-design.example",
    extra: "담당: 이영희 님",
    registrationNumber: "",
  },
  items: [
    { name: "웹사이트 메인 페이지 디자인", unitPrice: 1500000, quantity: 1 },
    { name: "하위 페이지 코딩 (3P)", unitPrice: 1200000, quantity: 1 },
    { name: "서버 초기 설정 비용", unitPrice: 200000, quantity: 1 },
  ],
  paymentMethod:
    "계좌이체: ○○은행 ○○지점 보통 1234567\n카드 결제: https://buy.stripe.com/sample...",
  notes:
    "거래해 주셔서 감사합니다.\n※이체 수수료는 고객님 부담으로 부탁드립니다.",
};

const SAMPLE_ZH: SampleBody = {
  currency: "CNY",
  taxRatePercent: 0,
  from: {
    name: "王小明（自由职业设计师）",
    address: "上海市静安区南京西路100号\n创意大厦 4F",
    email: "xiaoming.wang@example.com",
    extra: "电话 +86 138-0000-1234",
    registrationNumber: "",
  },
  to: {
    name: "示例设计有限公司",
    address: "北京市东城区长安街1号",
    email: "billing@sample-design.example",
    extra: "收件人：李经理",
    registrationNumber: "",
  },
  items: [
    { name: "网站首页 UI 设计", unitPrice: 8000, quantity: 1 },
    { name: "内页开发（3 页）", unitPrice: 6000, quantity: 1 },
    { name: "服务器与域名初始设置", unitPrice: 1000, quantity: 1 },
  ],
  paymentMethod:
    "银行转账：○○银行 ○○支行 普通 1234567\n信用卡：https://buy.stripe.com/sample...",
  notes: "感谢惠顾。\n※转账手续费请由贵司承担。",
};

const SAMPLE_ES: SampleBody = {
  currency: "EUR",
  taxRatePercent: 21,
  from: {
    name: "Lucía Fernández (Diseñadora freelance)",
    address: "Calle Mayor 12, 3º B\n28013 Madrid\nEspaña",
    email: "lucia.fernandez@example.com",
    extra: "Tel +34 612 345 678",
    registrationNumber: "",
  },
  to: {
    name: "Diseño Ejemplo S.L.",
    address: "Passeig de Gràcia 100\n08008 Barcelona\nEspaña",
    email: "facturacion@diseno-ejemplo.example",
    extra: "Attn: Departamento de Contabilidad",
    registrationNumber: "",
  },
  items: [
    { name: "Diseño UI de la página de inicio", unitPrice: 1100, quantity: 1 },
    { name: "Desarrollo de páginas interiores (3)", unitPrice: 850, quantity: 1 },
    { name: "Configuración inicial de hosting y DNS", unitPrice: 120, quantity: 1 },
  ],
  paymentMethod:
    "Transferencia: Banco Ejemplo / Sucursal Centro / ES12 3456 7890 1234 5678 9012\nTarjeta: https://buy.stripe.com/sample...",
  notes:
    "¡Gracias por su confianza!\nLas comisiones bancarias corren a cargo del cliente.",
};

const SAMPLE_FR: SampleBody = {
  currency: "EUR",
  taxRatePercent: 20,
  from: {
    name: "Camille Dupont (Designer freelance)",
    address: "18 rue de la Paix\n75002 Paris\nFrance",
    email: "camille.dupont@example.com",
    extra: "Tél +33 6 12 34 56 78",
    registrationNumber: "",
  },
  to: {
    name: "Exemple Design SAS",
    address: "5 avenue des Champs-Élysées\n75008 Paris\nFrance",
    email: "compta@exemple-design.example",
    extra: "À l’attention du service comptabilité",
    registrationNumber: "",
  },
  items: [
    { name: "Conception UI de la page d’accueil", unitPrice: 1100, quantity: 1 },
    { name: "Développement des pages intérieures (3)", unitPrice: 850, quantity: 1 },
    { name: "Configuration initiale hébergement & DNS", unitPrice: 120, quantity: 1 },
  ],
  paymentMethod:
    "Virement : Banque Exemple / Agence Centre / FR76 1234 5678 9012 3456 7890 123\nCarte : https://buy.stripe.com/sample...",
  notes:
    "Merci pour votre confiance.\nLes frais de virement sont à la charge du client.",
};

const SAMPLE_DE: SampleBody = {
  currency: "EUR",
  taxRatePercent: 19,
  from: {
    name: "Jonas Weber (Freelance Designer)",
    address: "Friedrichstraße 45\n10117 Berlin\nDeutschland",
    email: "jonas.weber@example.com",
    extra: "Tel +49 170 1234567",
    registrationNumber: "",
  },
  to: {
    name: "Beispiel Design GmbH",
    address: "Maximilianstraße 10\n80539 München\nDeutschland",
    email: "buchhaltung@beispiel-design.example",
    extra: "z. Hd. Buchhaltung",
    registrationNumber: "",
  },
  items: [
    { name: "UI-Design der Startseite", unitPrice: 1100, quantity: 1 },
    { name: "Umsetzung von Unterseiten (3)", unitPrice: 850, quantity: 1 },
    { name: "Hosting- & DNS-Ersteinrichtung", unitPrice: 120, quantity: 1 },
  ],
  paymentMethod:
    "Überweisung: Beispiel Bank / Filiale Mitte / DE89 3704 0044 0532 0130 00\nKarte: https://buy.stripe.com/sample...",
  notes:
    "Vielen Dank für Ihr Vertrauen.\nÜberweisungsgebühren trägt der Kunde.",
};

/** サイト表示言語 → デモ本文（通貨も言語圏に合わせる） */
function sampleBodyFor(siteLocale: Locale): SampleBody {
  switch (siteLocale) {
    case "ja":
      return SAMPLE_JA;
    case "ko":
      return SAMPLE_KO;
    case "zh-CN":
    case "zh-TW":
      return SAMPLE_ZH;
    case "es":
      return SAMPLE_ES;
    case "fr":
      return SAMPLE_FR;
    case "de":
      return SAMPLE_DE;
    case "pt":
      // 本文は英語デモを流用し、通貨・税率はポルトガル向け
      return { ...SAMPLE_EN, currency: "EUR", taxRatePercent: 23 };
    case "id":
      // 本文は英語デモ。通貨・税率はインドネシア向け（PPN 11%）
      return { ...SAMPLE_EN, currency: "SGD", taxRatePercent: 11 };
    case "en":
    default:
      return SAMPLE_EN;
  }
}

/**
 * 架空のデモデータ。
 * @param siteLocale いまのサイト表示言語（ヘッダー）
 */
export function createSampleInvoice(siteLocale: Locale): InvoiceData {
  const issueDate = toDateInputValue(new Date());
  const dueDate = endOfNextMonth();
  const body = sampleBodyFor(siteLocale);
  const docLocale: DocLocale = defaultDocLocaleFor(siteLocale);

  return {
    docLocale,
    documentType: "invoice",
    currency: body.currency || defaultCurrencyFor(siteLocale),
    customCurrencySymbol: "",
    taxRatePercent: body.taxRatePercent ?? defaultTaxRateFor(siteLocale),
    withholdingTaxEnabled: false,
    invoiceNumber: suggestInvoiceNumber(issueDate),
    issueDate,
    dueDate,
    from: { ...body.from },
    to: { ...body.to },
    items: body.items.map((item) => ({
      id: createId(),
      name: item.name,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
    })),
    paymentMethod: body.paymentMethod,
    notes: body.notes,
  };
}
