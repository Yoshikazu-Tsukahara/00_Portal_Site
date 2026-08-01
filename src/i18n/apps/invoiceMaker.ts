import type { Locale } from "../types";
import type { AppShellCopy } from "./otherApps";

/** アプリ側 UI の文言 */
export type InvoiceMakerDict = {
  shell: AppShellCopy;
  loading: string;
  actions: {
    newInvoice: string;
    newInvoiceShort: string;
    newInvoiceConfirm: string;
  };
  toolbar: {
    save: string;
    saveShort: string;
    load: string;
    loadShort: string;
    preview: string;
    previewShort: string;
    print: string;
    printShort: string;
  };
  history: {
    saveTitle: string;
    saveLead: string;
    nameLabel: string;
    namePlaceholder: string;
    confirmSave: string;
    savedToast: string;
    loadTitle: string;
    loadLead: string;
    empty: string;
    /** 固定サンプルの表示名 */
    sampleName: string;
    sampleBadge: string;
    loadAction: string;
    deleteAction: string;
    deleteConfirm: string;
    savedAt: string;
    close: string;
    cancel: string;
  };
  settings: {
    heading: string;
    docLanguage: string;
    docLanguageHint: string;
    localeJa: string;
    localeEn: string;
    currency: string;
    taxRate: string;
    taxRateCustomAria: string;
  };
  basics: {
    heading: string;
    invoiceNumber: string;
    invoiceNumberPlaceholder: string;
    issueDate: string;
    dueDate: string;
  };
  from: {
    heading: string;
    hint: string;
    namePlaceholder: string;
    addressPlaceholder: string;
    emailPlaceholder: string;
    extraPlaceholder: string;
  };
  to: {
    heading: string;
    namePlaceholder: string;
    addressPlaceholder: string;
    emailPlaceholder: string;
    extraPlaceholder: string;
  };
  fields: {
    name: string;
    address: string;
    email: string;
    extra: string;
    /** インボイス登録番号（任意） */
    registrationNumber: string;
    registrationNumberPlaceholder: string;
  };
  items: {
    heading: string;
    add: string;
    name: string;
    namePlaceholder: string;
    unitPrice: string;
    quantity: string;
    amount: string;
    remove: string;
    removeAria: string;
    removeLastAlert: string;
    maxItemsAlert: string;
    subtotalLabel: string;
  };
  payment: {
    heading: string;
    hint: string;
    placeholder: string;
  };
  notes: {
    heading: string;
    placeholder: string;
  };
  preview: {
    modalTitle: string;
    hint: string;
    /** 未入力プレースホルダは印刷されないことの案内 */
    emptyHint: string;
    print: string;
    close: string;
  };
};

export const invoiceMakerJa: InvoiceMakerDict = {
  shell: {
    title: "請求書メーカー",
    description:
      "2カラムで入力し、プレビュー確認からそのままPDFとして保存できます。過去の請求書もブラウザ内に保存できます。",
  },
  loading: "読込中…",
  actions: {
    newInvoice: "新しい請求書",
    newInvoiceShort: "新規",
    newInvoiceConfirm:
      "請求先・品目・請求書番号をリセットします（あなたの情報と支払方法は残ります）。よろしいですか？",
  },
  toolbar: {
    save: "💾 現在の請求書を保存",
    saveShort: "💾 保存",
    load: "📂 過去の請求書を呼び出す",
    loadShort: "📂 呼出",
    preview: "プレビュー確認",
    previewShort: "確認",
    print: "📄 PDF出力 / 印刷",
    printShort: "📄 PDF",
  },
  history: {
    saveTitle: "請求書を保存",
    saveLead: "登録名を付けてブラウザ内に保存します（サーバーには送りません）。",
    nameLabel: "登録名",
    namePlaceholder: "2026年8月度_株式会社〇〇様",
    confirmSave: "保存する",
    savedToast: "保存しました",
    loadTitle: "過去の請求書",
    loadLead: "選ぶと現在の入力内容に上書きされます。",
    empty: "保存済みの請求書はまだありません。",
    sampleName: "📄 【サンプル】Webサイト制作費請求書（デモ）",
    sampleBadge: "デモ",
    loadAction: "呼び出す",
    deleteAction: "削除",
    deleteConfirm: "「{name}」を削除しますか？この操作は取り消せません。",
    savedAt: "保存日時: {date}",
    close: "閉じる",
    cancel: "キャンセル",
  },
  settings: {
    heading: "書類の設定",
    docLanguage: "請求書の言語",
    docLanguageHint: "プレビューに印字される見出しの言語です",
    localeJa: "日本語",
    localeEn: "English",
    currency: "通貨",
    taxRate: "税率",
    taxRateCustomAria: "税率をパーセントで入力",
  },
  basics: {
    heading: "基本情報",
    invoiceNumber: "請求書番号",
    invoiceNumberPlaceholder: "INV-20260801-01",
    issueDate: "発行日",
    dueDate: "支払期日",
  },
  from: {
    heading: "あなたの情報（発行者）",
    hint: "この内容は自動でブラウザに保存され、次回そのまま使えます。",
    namePlaceholder: "山田 太郎 / 屋号・社名",
    addressPlaceholder: "〒000-0000\n東京都◯◯区◯◯ 1-2-3",
    emailPlaceholder: "you@example.com",
    extraPlaceholder: "TEL 090-0000-0000",
  },
  to: {
    heading: "請求先",
    namePlaceholder: "株式会社◯◯ 御中",
    addressPlaceholder: "〒000-0000\n東京都◯◯区◯◯ 4-5-6",
    emailPlaceholder: "billing@example.com",
    extraPlaceholder: "担当者名・部署など",
  },
  fields: {
    name: "名前 / 社名",
    address: "住所",
    email: "メール",
    extra: "補足",
    registrationNumber: "登録番号（任意）",
    registrationNumberPlaceholder: "T1234567890123",
  },
  items: {
    heading: "品目",
    add: "＋ 行を追加",
    name: "品名",
    namePlaceholder: "Webサイト制作費",
    unitPrice: "単価",
    quantity: "数量",
    amount: "金額",
    remove: "削除",
    removeAria: "この行を削除",
    removeLastAlert: "品目は1行以上必要です。",
    maxItemsAlert: "品目は最大10行までです。",
    subtotalLabel: "小計（税抜）",
  },
  payment: {
    heading: "支払方法",
    hint: "銀行口座や Stripe / PayPal の決済URLをそのまま書けます。",
    placeholder:
      "◯◯銀行 ◯◯支店 普通 1234567（ヤマダ タロウ）\nまたは https://buy.stripe.com/xxxx",
  },
  notes: {
    heading: "備考 / 特記事項",
    placeholder:
      "Thank you for your business!\n※振込手数料はお客様にてご負担をお願いいたします。",
  },
  preview: {
    modalTitle: "プレビュー確認",
    hint: "印刷ダイアログで「PDFに保存」を選ぶとファイルとして残せます。",
    emptyHint:
      "※薄く表示されている未入力項目は、PDF出力・印刷時には印字されず空白になります。",
    print: "PDF出力（印刷）",
    close: "閉じる",
  },
};

export const invoiceMakerEn: InvoiceMakerDict = {
  shell: {
    title: "Invoice Maker",
    description:
      "Fill the two-column form, preview the A4 invoice, then save as PDF. Past invoices stay in your browser.",
  },
  loading: "Loading…",
  actions: {
    newInvoice: "New invoice",
    newInvoiceShort: "New",
    newInvoiceConfirm:
      "This resets the recipient, items, and invoice number (your own details and payment info stay). Continue?",
  },
  toolbar: {
    save: "💾 Save current invoice",
    saveShort: "💾 Save",
    load: "📂 Load past invoice",
    loadShort: "📂 Load",
    preview: "Preview",
    previewShort: "Preview",
    print: "📄 Export PDF / Print",
    printShort: "📄 PDF",
  },
  history: {
    saveTitle: "Save invoice",
    saveLead: "Name it and store it in your browser (nothing is sent to a server).",
    nameLabel: "Name",
    namePlaceholder: "Aug 2026 — Acme Inc.",
    confirmSave: "Save",
    savedToast: "Saved",
    loadTitle: "Past invoices",
    loadLead: "Selecting one replaces the current form.",
    empty: "No saved invoices yet.",
    sampleName: "📄 [Sample] Website design invoice (demo)",
    sampleBadge: "Demo",
    loadAction: "Load",
    deleteAction: "Delete",
    deleteConfirm: "Delete “{name}”? This cannot be undone.",
    savedAt: "Saved: {date}",
    close: "Close",
    cancel: "Cancel",
  },
  settings: {
    heading: "Document settings",
    docLanguage: "Invoice language",
    docLanguageHint: "Language printed on the preview headings",
    localeJa: "日本語",
    localeEn: "English",
    currency: "Currency",
    taxRate: "Tax rate",
    taxRateCustomAria: "Enter tax rate in percent",
  },
  basics: {
    heading: "Basics",
    invoiceNumber: "Invoice number",
    invoiceNumberPlaceholder: "INV-20260801-01",
    issueDate: "Issue date",
    dueDate: "Due date",
  },
  from: {
    heading: "Your details (From)",
    hint: "Saved in your browser automatically, ready for next time.",
    namePlaceholder: "Taro Yamada / Studio name",
    addressPlaceholder: "1-2-3 Somewhere\nTokyo 000-0000, Japan",
    emailPlaceholder: "you@example.com",
    extraPlaceholder: "Tel +81 90-0000-0000",
  },
  to: {
    heading: "Billed to",
    namePlaceholder: "Acme Inc.",
    addressPlaceholder: "4-5-6 Elsewhere\nTokyo 000-0000, Japan",
    emailPlaceholder: "billing@example.com",
    extraPlaceholder: "Contact person, department, etc.",
  },
  fields: {
    name: "Name / Company",
    address: "Address",
    email: "Email",
    extra: "Extra",
    registrationNumber: "Registration No. (optional)",
    registrationNumberPlaceholder: "T1234567890123",
  },
  items: {
    heading: "Items",
    add: "+ Add row",
    name: "Description",
    namePlaceholder: "Website design",
    unitPrice: "Unit price",
    quantity: "Qty",
    amount: "Amount",
    remove: "Remove",
    removeAria: "Remove this row",
    removeLastAlert: "At least one item row is required.",
    maxItemsAlert: "You can add up to 10 item rows.",
    subtotalLabel: "Subtotal (ex. tax)",
  },
  payment: {
    heading: "Payment method",
    hint: "Bank details, or a Stripe / PayPal checkout URL.",
    placeholder:
      "Bank of Example, Main Branch, 1234567 (TARO YAMADA)\nor https://buy.stripe.com/xxxx",
  },
  notes: {
    heading: "Notes / Terms",
    placeholder:
      "Thank you for your business!\nPlease cover any bank transfer fees on your side.",
  },
  preview: {
    modalTitle: "Preview",
    hint: "In the print dialog, choose “Save as PDF” to keep a file.",
    emptyHint:
      "※ Faint placeholder text for empty fields will not appear on PDF / print — those spots stay blank.",
    print: "Export PDF (Print)",
    close: "Close",
  },
};

/**
 * 請求書そのものに印字するラベル。
 * サイトの表示言語ではなく、ユーザーが選んだ「請求書の言語」で切り替える。
 */
export type InvoiceSheetLabels = {
  title: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  from: string;
  billedTo: string;
  /** 印字用：登録番号: T... */
  registrationNumber: string;
  itemName: string;
  unitPrice: string;
  quantity: string;
  amount: string;
  subtotal: string;
  tax: string;
  total: string;
  amountDue: string;
  paymentMethod: string;
  notes: string;
  thanks: string;
  /** 未入力時にプレビューへ薄く出すダミー文言 */
  placeholders: {
    partyName: string;
    itemName: string;
  };
};

export const invoiceSheetLabels: Record<Locale, InvoiceSheetLabels> = {
  ja: {
    title: "請求書",
    invoiceNumber: "請求書番号",
    issueDate: "発行日",
    dueDate: "支払期日",
    from: "発行者",
    billedTo: "請求先",
    registrationNumber: "登録番号",
    itemName: "品目",
    unitPrice: "単価",
    quantity: "数量",
    amount: "金額",
    subtotal: "小計",
    tax: "消費税",
    total: "合計",
    amountDue: "ご請求金額",
    paymentMethod: "お支払い方法",
    notes: "備考 / 特記事項",
    thanks: "お取引いただきありがとうございます。",
    placeholders: {
      partyName: "（未入力）",
      itemName: "（品名未入力）",
    },
  },
  en: {
    title: "INVOICE",
    invoiceNumber: "Invoice No.",
    issueDate: "Issue Date",
    dueDate: "Due Date",
    from: "From",
    billedTo: "Billed To",
    registrationNumber: "Registration No.",
    itemName: "Description",
    unitPrice: "Unit Price",
    quantity: "Qty",
    amount: "Amount",
    subtotal: "Subtotal",
    tax: "Tax",
    total: "Total",
    amountDue: "Amount Due",
    paymentMethod: "Payment Method",
    notes: "Notes / Terms",
    thanks: "Thank you for your business.",
    placeholders: {
      partyName: "(not set)",
      itemName: "(no description)",
    },
  },
};
