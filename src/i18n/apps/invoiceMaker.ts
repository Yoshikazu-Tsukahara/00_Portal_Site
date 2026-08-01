import type { Locale } from "../types";
import type { PwaInstallCopy } from "@/lib/pwa/installCopy";
import type { AppShellCopy } from "./otherApps";

/** アプリ側 UI の文言 */
export type InvoiceMakerDict = {
  shell: AppShellCopy;
  install: PwaInstallCopy;
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
    documentType: string;
    documentTypeHint: string;
    typeInvoice: string;
    typeEstimate: string;
    typeDeliveryNote: string;
    typeReceipt: string;
    docLanguage: string;
    docLanguageHint: string;
    localeJa: string;
    localeEn: string;
    currency: string;
    taxRate: string;
    taxRateCustomAria: string;
    withholdingTax: string;
    withholdingTaxHint: string;
    accentColor: string;
    accentColorHint: string;
    logo: string;
    logoHint: string;
    logoSelect: string;
    logoClear: string;
    stamp: string;
    stampHint: string;
    stampSelect: string;
    stampClear: string;
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
    documentType: "書類の種類",
    documentTypeHint: "プレビューのタイトルが切り替わります",
    typeInvoice: "請求書",
    typeEstimate: "見積書",
    typeDeliveryNote: "納品書",
    typeReceipt: "領収書",
    docLanguage: "請求書の言語",
    docLanguageHint: "プレビューに印字される見出しの言語です",
    localeJa: "日本語",
    localeEn: "English",
    currency: "通貨",
    taxRate: "税率",
    taxRateCustomAria: "税率をパーセントで入力",
    withholdingTax: "源泉徴収税 (-10.21%) を計算する",
    withholdingTaxHint: "小計に対して10.21%を引いた額が最終合計になります",
    accentColor: "アクセントカラー",
    accentColorHint: "見出しや罫線の色を変更できます",
    logo: "ロゴ画像",
    logoHint: "ヘッダー部分に表示されます",
    logoSelect: "画像を選択",
    logoClear: "削除",
    stamp: "印鑑画像（角印）",
    stampHint: "発行者名の横に表示されます",
    stampSelect: "画像を選択",
    stampClear: "削除",
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
  install: {
    button: "このアプリをホーム画面に追加",
    buttonShort: "ホームに追加",
    buttonTiny: "追加",
    buttonAria: "請求書メーカーをホーム画面に追加してアプリとして使う",
    modalTitle: "ホーム画面に追加",
    modalLead:
      "Safari からホーム画面に追加すると、請求書メーカーだけを独立アプリとしてすぐ開けます。",
    step1Title: "共有をタップ",
    step1Body: "画面下（または上）の共有アイコン［↑］をタップします。",
    step2Title: "「ホーム画面に追加」",
    step2Body: "メニューを下にスクロールし、「ホーム画面に追加」を選びます。",
    desktopTitle: "アプリとしてインストール",
    desktopLead:
      "Chrome / Edge なら、アドレスバーやメニューから請求書メーカーを独立アプリとして追加できます。",
    desktopStep1Title: "ブラウザのメニューを開く",
    desktopStep1Body:
      "画面右上の「︙」またはアドレスバー横のインストールアイコンを探します。",
    desktopStep2Title: "「アプリをインストール」",
    desktopStep2Body:
      "「請求書メーカーをインストール」や「アプリをインストール」を選ぶとホーム／デスクトップに追加されます。",
    modalClose: "わかった",
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
    documentType: "Document Type",
    documentTypeHint: "The preview title will change accordingly",
    typeInvoice: "Invoice",
    typeEstimate: "Estimate",
    typeDeliveryNote: "Delivery Note",
    typeReceipt: "Receipt",
    docLanguage: "Invoice language",
    docLanguageHint: "Language printed on the preview headings",
    localeJa: "日本語",
    localeEn: "English",
    currency: "Currency",
    taxRate: "Tax rate",
    taxRateCustomAria: "Enter tax rate in percent",
    withholdingTax: "Calculate withholding tax (-10.21%)",
    withholdingTaxHint: "10.21% will be deducted from the subtotal",
    accentColor: "Accent Color",
    accentColorHint: "Change the color of headings and borders",
    logo: "Logo Image",
    logoHint: "Displayed in the header area",
    logoSelect: "Select Image",
    logoClear: "Remove",
    stamp: "Stamp Image",
    stampHint: "Displayed next to the issuer name",
    stampSelect: "Select Image",
    stampClear: "Remove",
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
  install: {
    button: "Add this app to Home Screen",
    buttonShort: "Add to Home",
    buttonTiny: "Add",
    buttonAria: "Add Invoice Maker to your home screen as a standalone app",
    modalTitle: "Add to Home Screen",
    modalLead:
      "Add Invoice Maker from Safari to open it as its own app — not the portal.",
    step1Title: "Tap Share",
    step1Body: "Tap the Share icon [↑] at the bottom (or top) of Safari.",
    step2Title: "Add to Home Screen",
    step2Body: "Scroll the menu and choose “Add to Home Screen”.",
    desktopTitle: "Install as an app",
    desktopLead:
      "In Chrome or Edge, install Invoice Maker as its own app from the address bar or browser menu.",
    desktopStep1Title: "Open the browser menu",
    desktopStep1Body:
      "Look for the ⋮ menu or the install icon near the address bar.",
    desktopStep2Title: "Install app",
    desktopStep2Body:
      "Choose “Install Invoice Maker” / “Install app” to add it to your home screen or desktop.",
    modalClose: "Got it",
  },
};

/**
 * 請求書そのものに印字するラベル。
 * サイトの表示言語ではなく、ユーザーが選んだ「請求書の言語」で切り替える。
 */
export type InvoiceSheetLabels = {
  /** 書類タイプごとのタイトル */
  titles: {
    invoice: string;
    estimate: string;
    deliveryNote: string;
    receipt: string;
  };
  /** 後方互換性のため title も残す（invoice と同じ） */
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
  /** 源泉徴収税ラベル */
  withholdingTax: string;
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
    titles: {
      invoice: "請求書",
      estimate: "見積書",
      deliveryNote: "納品書",
      receipt: "領収書",
    },
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
    withholdingTax: "源泉徴収税",
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
    titles: {
      invoice: "INVOICE",
      estimate: "ESTIMATE",
      deliveryNote: "DELIVERY NOTE",
      receipt: "RECEIPT",
    },
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
    withholdingTax: "Withholding Tax",
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
