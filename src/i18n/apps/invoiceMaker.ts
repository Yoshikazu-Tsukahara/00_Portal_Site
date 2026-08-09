import type { PwaInstallCopy } from "@/lib/pwa/installCopy";
import type { AppShellCopy } from "./otherApps";

/**
 * サイト表示言語向けの操作 UI 文言。
 * PDF／プレビューの印字見出しは docLabels.ts（書類言語 docLocale）側。
 */
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
    sampleName: string;
    sampleBadge: string;
    sampleLead: string;
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
    /** サイト言語と書類言語の違いを説明するコールアウト */
    languageSeparation: string;
    docLanguage: string;
    docLanguageHint: string;
    currency: string;
    currencyCustom: string;
    currencyCustomPlaceholder: string;
    currencyCustomHint: string;
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
    imageTypeError: string;
  };
  preview: {
    modalTitle: string;
    hint: string;
    emptyHint: string;
    /** {language} = 書類言語の自称 */
    docLanguageNote: string;
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
    sampleLead:
      "いま選んでいる「書類の言語」に合わせたデモを読み込みます（サイトの表示言語は変わりません）。",
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
    documentTypeHint: "請求書・見積書・納品書・領収書から選びます",
    languageSeparation:
      "画面の操作文言はヘッダーの表示言語に従います。下の「書類の言語」は、お客様へ渡す PDF／プレビューの見出し専用です。",
    docLanguage: "書類の言語（PDF）",
    docLanguageHint:
      "プレビューと PDF の見出し・日付表記だけが切り替わります。サイト全体の言語はヘッダーで変更してください。",
    currency: "通貨",
    currencyCustom: "カスタム記号",
    currencyCustomPlaceholder: "例: ₹ ฿ R$",
    currencyCustomHint: "リストにない通貨記号を自由に入力できます",
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
    imageTypeError: "画像ファイルを選択してください",
  },
  preview: {
    modalTitle: "プレビュー確認",
    hint: "印刷ダイアログで「PDFに保存」を選ぶとファイルとして残せます。",
    emptyHint:
      "※薄く表示されている未入力項目は、PDF出力・印刷時には印字されず空白になります。",
    docLanguageNote: "PDF／印刷の言語: {language}",
    print: "PDF出力（印刷）",
    close: "閉じる",
  },
  install: {
    button: "このアプリをインストール",
    buttonShort: "インストール",
    buttonTiny: "インストール",
    buttonAria: "帳票メーカーをインストールして、個別アプリとして使う",
    modalTitle: "アプリをインストール",
    modalLead:
      "対応ブラウザからインストールすると、帳票メーカーだけを個別アプリとしてすぐ開けます。",
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
    saveLead:
      "Name it and store it in your browser (nothing is sent to a server).",
    nameLabel: "Name",
    namePlaceholder: "Aug 2026 — Acme Inc.",
    confirmSave: "Save",
    savedToast: "Saved",
    loadTitle: "Past documents",
    loadLead: "Selecting one replaces the current form.",
    empty: "No saved documents yet.",
    sampleName: "📄 [Sample] Website design invoice (demo)",
    sampleBadge: "Demo",
    sampleLead:
      "Loads a demo that matches the current Document language (site language stays unchanged).",
    loadAction: "Load",
    deleteAction: "Delete",
    deleteConfirm: "Delete “{name}”? This cannot be undone.",
    savedAt: "Saved: {date}",
    close: "Close",
    cancel: "Cancel",
  },
  settings: {
    heading: "Document settings",
    documentType: "Document type",
    documentTypeHint: "Choose invoice, estimate, delivery note, or receipt",
    languageSeparation:
      "On-screen controls follow the site language in the header. “Document language” below only changes PDF / preview headings for your client.",
    docLanguage: "Document language (PDF)",
    docLanguageHint:
      "Switches preview and PDF headings and date formats only. Change the site language from the header.",
    currency: "Currency",
    currencyCustom: "Custom symbol",
    currencyCustomPlaceholder: "e.g. ₹ ฿ R$",
    currencyCustomHint: "Enter any currency symbol not listed above",
    taxRate: "Tax rate",
    taxRateCustomAria: "Enter tax rate in percent",
    withholdingTax: "Calculate withholding tax (-10.21%)",
    withholdingTaxHint: "10.21% will be deducted from the subtotal",
    accentColor: "Accent color",
    accentColorHint: "Change the color of headings and borders",
    logo: "Logo image",
    logoHint: "Displayed in the header area",
    logoSelect: "Select image",
    logoClear: "Remove",
    stamp: "Stamp image",
    stampHint: "Displayed next to the issuer name",
    stampSelect: "Select image",
    stampClear: "Remove",
    imageTypeError: "Please choose an image file",
  },
  preview: {
    modalTitle: "Preview",
    hint: "In the print dialog, choose “Save as PDF” to keep a file.",
    emptyHint:
      "※ Faint placeholder text for empty fields will not appear on PDF / print — those spots stay blank.",
    docLanguageNote: "PDF / print language: {language}",
    print: "Export PDF (Print)",
    close: "Close",
  },
  install: {
    button: "Install this app",
    buttonShort: "Install",
    buttonTiny: "Install",
    buttonAria: "Install Form Maker as a standalone app",
    modalTitle: "Install app",
    modalLead:
      "Install Form Maker from Safari to open it as its own app — not the portal.",
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
