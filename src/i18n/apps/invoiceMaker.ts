import type { DocumentType } from "@/app/tools/invoice-maker/types";
import type { PwaInstallCopy } from "@/lib/pwa/installCopy";
import type { Locale } from "../types";
import type { AppShellCopy } from "./otherApps";

/** 書類タイプに応じて切り替わる UI／帳票ラベル */
export type DocumentTypeFieldLabels = {
  /** 番号欄（請求書番号・見積書番号など） */
  number: Record<DocumentType, string>;
  /**
   * 期日欄。納品書・領収書は null（フォーム／プレビューとも非表示）
   */
  dueDate: Record<DocumentType, string | null>;
  /** 発行日／納品日／領収日 */
  issueDate: Record<DocumentType, string>;
  /** 宛先（請求先・見積先・納品先・宛名） */
  to: Record<DocumentType, string>;
  /** 発行者／領収者 */
  from: Record<DocumentType, string>;
  /** 強調金額ラベル（ご請求金額・お見積金額など） */
  amountDue: Record<DocumentType, string>;
  /** 支払方法／支払条件／受領方法の見出し */
  paymentMethod: Record<DocumentType, string>;
  /** フッターの定型お礼文 */
  thanks: Record<DocumentType, string>;
};

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
    invoiceNumberPlaceholder: string;
    /** 書類タイプごとの番号・期日・発行日ラベル */
    byDocumentType: Pick<
      DocumentTypeFieldLabels,
      "number" | "dueDate" | "issueDate"
    >;
  };
  from: {
    /** 書類タイプごとの発行者見出し */
    headingByType: Record<DocumentType, string>;
    hint: string;
    namePlaceholder: string;
    addressPlaceholder: string;
    emailPlaceholder: string;
    extraPlaceholder: string;
  };
  to: {
    /** 書類タイプごとの宛先見出し */
    headingByType: DocumentTypeFieldLabels["to"];
    namePlaceholderByType: Record<DocumentType, string>;
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
    /** 書類タイプごとの見出し（支払方法／支払条件／受領方法） */
    headingByType: DocumentTypeFieldLabels["paymentMethod"];
    hintByType: Record<DocumentType, string>;
    placeholderByType: Record<DocumentType, string>;
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
    title: "帳票メーカー",
    description:
      "請求書・見積書・納品書・領収書を2カラムで入力し、プレビューからそのままPDF保存。過去の帳票もブラウザ内に残せます。",
  },
  loading: "読込中…",
  actions: {
    newInvoice: "新しい帳票",
    newInvoiceShort: "新規",
    newInvoiceConfirm:
      "宛先・品目・番号をリセットします（あなたの情報と支払／受領方法は残ります）。よろしいですか？",
  },
  toolbar: {
    save: "💾 現在の帳票を保存",
    saveShort: "💾 保存",
    load: "📂 過去の帳票を呼び出す",
    loadShort: "📂 呼出",
    preview: "プレビュー確認",
    previewShort: "確認",
    print: "📄 PDF出力 / 印刷",
    printShort: "📄 PDF",
  },
  history: {
    saveTitle: "帳票を保存",
    saveLead: "登録名を付けてブラウザ内に保存します（サーバーには送りません）。",
    nameLabel: "登録名",
    namePlaceholder: "2026年8月度_株式会社〇〇様",
    confirmSave: "保存する",
    savedToast: "保存しました",
    loadTitle: "過去の帳票",
    loadLead: "選ぶと現在の入力内容に上書きされます。",
    empty: "保存済みの帳票はまだありません。",
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
    documentTypeHint: "タイトルや宛先・金額などの見出しが切り替わります",
    typeInvoice: "請求書",
    typeEstimate: "見積書",
    typeDeliveryNote: "納品書",
    typeReceipt: "領収書",
    docLanguage: "書類の言語",
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
    invoiceNumberPlaceholder: "INV-20260801-01",
    byDocumentType: {
      number: {
        invoice: "請求書番号",
        estimate: "見積書番号",
        deliveryNote: "納品書番号",
        receipt: "領収書番号",
      },
      dueDate: {
        invoice: "支払期日",
        estimate: "有効期限",
        deliveryNote: null,
        receipt: null,
      },
      issueDate: {
        invoice: "発行日",
        estimate: "発行日",
        deliveryNote: "納品日",
        receipt: "領収日",
      },
    },
  },
  from: {
    headingByType: {
      invoice: "あなたの情報（発行者）",
      estimate: "あなたの情報（発行者）",
      deliveryNote: "あなたの情報（発行者）",
      receipt: "あなたの情報（領収者）",
    },
    hint: "この内容は自動でブラウザに保存され、次回そのまま使えます。",
    namePlaceholder: "山田 太郎 / 屋号・社名",
    addressPlaceholder: "〒000-0000\n東京都◯◯区◯◯ 1-2-3",
    emailPlaceholder: "you@example.com",
    extraPlaceholder: "TEL 090-0000-0000",
  },
  to: {
    headingByType: {
      invoice: "請求先",
      estimate: "見積先",
      deliveryNote: "納品先",
      receipt: "宛名",
    },
    namePlaceholderByType: {
      invoice: "株式会社◯◯ 御中",
      estimate: "株式会社◯◯ 御中",
      deliveryNote: "株式会社◯◯ 御中",
      receipt: "株式会社◯◯ 様",
    },
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
    headingByType: {
      invoice: "支払方法",
      estimate: "支払条件",
      deliveryNote: "支払条件",
      receipt: "受領方法",
    },
    hintByType: {
      invoice:
        "銀行口座や Stripe / PayPal の決済URLをそのまま書けます。",
      estimate: "振込・月末締めなど、見積時点の支払条件を書けます。",
      deliveryNote: "支払条件があれば任意で書けます（未入力なら帳票に出ません）。",
      receipt: "現金・クレジットカード・振込など、受け取った方法を書けます。",
    },
    placeholderByType: {
      invoice:
        "◯◯銀行 ◯◯支店 普通 1234567（ヤマダ タロウ）\nまたは https://buy.stripe.com/xxxx",
      estimate: "お振込：納品後◯日以内\nクレジットカード可",
      deliveryNote: "請求書に記載のお支払条件に準じます",
      receipt: "現金\nクレジットカード（一括）\n銀行振込",
    },
  },
  notes: {
    heading: "備考 / 特記事項",
    placeholder:
      "ご不明点があればお気軽にご連絡ください。\n※振込手数料はお客様にてご負担をお願いいたします。",
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
    buttonAria: "帳票メーカーをホーム画面に追加してアプリとして使う",
    modalTitle: "ホーム画面に追加",
    modalLead:
      "Safari からホーム画面に追加すると、帳票メーカーだけを独立アプリとしてすぐ開けます。",
    step1Title: "共有をタップ",
    step1Body: "画面下（または上）の共有アイコン［↑］をタップします。",
    step2Title: "「ホーム画面に追加」",
    step2Body: "メニューを下にスクロールし、「ホーム画面に追加」を選びます。",
    desktopTitle: "アプリとしてインストール",
    desktopLead:
      "Chrome / Edge なら、アドレスバーやメニューから帳票メーカーを独立アプリとして追加できます。",
    desktopStep1Title: "ブラウザのメニューを開く",
    desktopStep1Body:
      "画面右上の「︙」またはアドレスバー横のインストールアイコンを探します。",
    desktopStep2Title: "「アプリをインストール」",
    desktopStep2Body:
      "「帳票メーカーをインストール」や「アプリをインストール」を選ぶとホーム／デスクトップに追加されます。",
    modalClose: "わかった",
  },
};

export const invoiceMakerEn: InvoiceMakerDict = {
  shell: {
    title: "Form Maker",
    description:
      "Fill the two-column form for invoices, estimates, delivery notes, or receipts, then save as PDF. Past documents stay in your browser.",
  },
  loading: "Loading…",
  actions: {
    newInvoice: "New document",
    newInvoiceShort: "New",
    newInvoiceConfirm:
      "This resets the recipient, items, and document number (your own details and payment info stay). Continue?",
  },
  toolbar: {
    save: "💾 Save current document",
    saveShort: "💾 Save",
    load: "📂 Load past document",
    loadShort: "📂 Load",
    preview: "Preview",
    previewShort: "Preview",
    print: "📄 Export PDF / Print",
    printShort: "📄 PDF",
  },
  history: {
    saveTitle: "Save document",
    saveLead: "Name it and store it in your browser (nothing is sent to a server).",
    nameLabel: "Name",
    namePlaceholder: "Aug 2026 — Acme Inc.",
    confirmSave: "Save",
    savedToast: "Saved",
    loadTitle: "Past documents",
    loadLead: "Selecting one replaces the current form.",
    empty: "No saved documents yet.",
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
    documentTypeHint: "Title, recipient, amount labels, and more will update",
    typeInvoice: "Invoice",
    typeEstimate: "Estimate",
    typeDeliveryNote: "Delivery Note",
    typeReceipt: "Receipt",
    docLanguage: "Document language",
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
    invoiceNumberPlaceholder: "INV-20260801-01",
    byDocumentType: {
      number: {
        invoice: "Invoice #",
        estimate: "Estimate #",
        deliveryNote: "Delivery #",
        receipt: "Receipt #",
      },
      dueDate: {
        invoice: "Due Date",
        estimate: "Valid Until",
        deliveryNote: null,
        receipt: null,
      },
      issueDate: {
        invoice: "Issue Date",
        estimate: "Issue Date",
        deliveryNote: "Delivery Date",
        receipt: "Receipt Date",
      },
    },
  },
  from: {
    headingByType: {
      invoice: "Your details (From)",
      estimate: "Your details (From)",
      deliveryNote: "Your details (From)",
      receipt: "Your details (Issued by)",
    },
    hint: "Saved in your browser automatically, ready for next time.",
    namePlaceholder: "Taro Yamada / Studio name",
    addressPlaceholder: "1-2-3 Somewhere\nTokyo 000-0000, Japan",
    emailPlaceholder: "you@example.com",
    extraPlaceholder: "Tel +81 90-0000-0000",
  },
  to: {
    headingByType: {
      invoice: "Billed to",
      estimate: "Estimate for",
      deliveryNote: "Deliver to",
      receipt: "Received from",
    },
    namePlaceholderByType: {
      invoice: "Acme Inc.",
      estimate: "Acme Inc.",
      deliveryNote: "Acme Inc.",
      receipt: "Acme Inc.",
    },
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
    headingByType: {
      invoice: "Payment Method",
      estimate: "Payment Terms",
      deliveryNote: "Payment Terms",
      receipt: "Received via",
    },
    hintByType: {
      invoice: "Bank details, or a Stripe / PayPal checkout URL.",
      estimate: "Note payment terms at quote time (net 30, card, etc.).",
      deliveryNote: "Optional payment terms (left blank if not needed).",
      receipt: "How you received payment — cash, card, bank transfer, etc.",
    },
    placeholderByType: {
      invoice:
        "Bank of Example, Main Branch, 1234567 (TARO YAMADA)\nor https://buy.stripe.com/xxxx",
      estimate: "Bank transfer within 14 days of delivery\nCards accepted",
      deliveryNote: "Per terms stated on the invoice",
      receipt: "Cash\nCredit card (one-time)\nBank transfer",
    },
  },
  notes: {
    heading: "Notes / Terms",
    placeholder:
      "Questions welcome — feel free to get in touch.\nPlease cover any bank transfer fees on your side.",
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
    buttonAria: "Add Form Maker to your home screen as a standalone app",
    modalTitle: "Add to Home Screen",
    modalLead:
      "Add Form Maker from Safari to open it as its own app — not the portal.",
    step1Title: "Tap Share",
    step1Body: "Tap the Share icon [↑] at the bottom (or top) of Safari.",
    step2Title: "Add to Home Screen",
    step2Body: "Scroll the menu and choose “Add to Home Screen”.",
    desktopTitle: "Install as an app",
    desktopLead:
      "In Chrome or Edge, install Form Maker as its own app from the address bar or browser menu.",
    desktopStep1Title: "Open the browser menu",
    desktopStep1Body:
      "Look for the ⋮ menu or the install icon near the address bar.",
    desktopStep2Title: "Install app",
    desktopStep2Body:
      "Choose “Install Form Maker” / “Install app” to add it to your home screen or desktop.",
    modalClose: "Got it",
  },
};

/**
 * 帳票そのものに印字するラベル。
 * サイトの表示言語ではなく、ユーザーが選んだ「書類の言語」で切り替える。
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
  /** 書類タイプに応じて切り替わる印字ラベル一式 */
  byDocumentType: DocumentTypeFieldLabels;
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
  notes: string;
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
    byDocumentType: {
      number: {
        invoice: "請求書番号",
        estimate: "見積書番号",
        deliveryNote: "納品書番号",
        receipt: "領収書番号",
      },
      dueDate: {
        invoice: "支払期日",
        estimate: "有効期限",
        deliveryNote: null,
        receipt: null,
      },
      issueDate: {
        invoice: "発行日",
        estimate: "発行日",
        deliveryNote: "納品日",
        receipt: "領収日",
      },
      to: {
        invoice: "請求先",
        estimate: "見積先",
        deliveryNote: "納品先",
        receipt: "宛名",
      },
      from: {
        invoice: "発行者",
        estimate: "発行者",
        deliveryNote: "発行者",
        receipt: "領収者",
      },
      amountDue: {
        invoice: "ご請求金額",
        estimate: "お見積金額",
        deliveryNote: "合計金額",
        receipt: "領収金額",
      },
      paymentMethod: {
        invoice: "支払方法",
        estimate: "支払条件",
        deliveryNote: "支払条件",
        receipt: "受領方法",
      },
      thanks: {
        invoice: "お取引いただきありがとうございます。",
        estimate: "ご検討のほどよろしくお願いいたします。",
        deliveryNote: "納品いたしました。ご確認のほどよろしくお願いいたします。",
        receipt: "上記正に領収いたしました。",
      },
    },
    registrationNumber: "登録番号",
    itemName: "品目",
    unitPrice: "単価",
    quantity: "数量",
    amount: "金額",
    subtotal: "小計",
    tax: "消費税",
    withholdingTax: "源泉徴収税",
    total: "合計",
    notes: "備考 / 特記事項",
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
    byDocumentType: {
      number: {
        invoice: "Invoice #",
        estimate: "Estimate #",
        deliveryNote: "Delivery #",
        receipt: "Receipt #",
      },
      dueDate: {
        invoice: "Due Date",
        estimate: "Valid Until",
        deliveryNote: null,
        receipt: null,
      },
      issueDate: {
        invoice: "Issue Date",
        estimate: "Issue Date",
        deliveryNote: "Delivery Date",
        receipt: "Receipt Date",
      },
      to: {
        invoice: "Billed To",
        estimate: "Estimate For",
        deliveryNote: "Deliver To",
        receipt: "Received From",
      },
      from: {
        invoice: "From",
        estimate: "From",
        deliveryNote: "From",
        receipt: "Issued By",
      },
      amountDue: {
        invoice: "Amount Due",
        estimate: "Estimated Total",
        deliveryNote: "Total Amount",
        receipt: "Amount Received",
      },
      paymentMethod: {
        invoice: "Payment Method",
        estimate: "Payment Terms",
        deliveryNote: "Payment Terms",
        receipt: "Received via",
      },
      thanks: {
        invoice: "Thank you for your business.",
        estimate: "Thank you for considering this estimate.",
        deliveryNote: "Delivered. Please confirm receipt.",
        receipt: "Payment received with thanks.",
      },
    },
    registrationNumber: "Registration No.",
    itemName: "Description",
    unitPrice: "Unit Price",
    quantity: "Qty",
    amount: "Amount",
    subtotal: "Subtotal",
    tax: "Tax",
    withholdingTax: "Withholding Tax",
    total: "Total",
    notes: "Notes / Terms",
    placeholders: {
      partyName: "(not set)",
      itemName: "(no description)",
    },
  },
};
