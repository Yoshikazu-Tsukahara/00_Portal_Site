export type UrlCleanerDict = {
  shell: {
    title: string;
    titleShort: string;
    description: string;
  };
  form: {
    inputLabel: string;
    inputPlaceholder: string;
    outputLabel: string;
    copy: string;
    copied: string;
    clear: string;
  };
  empty: {
    title: string;
    hint: string;
  };
  paste: {
    button: string;
    buttonAria: string;
    openClipboard: string;
    openClipboardAria: string;
    failed: string;
    empty: string;
    mobileHint: string;
  };
  clipboardSheet: {
    title: string;
    hint: string;
    empty: string;
    use: string;
    close: string;
    retry: string;
    manualHint: string;
  };
  qr: {
    title: string;
    download: string;
    downloadAria: string;
    failed: string;
  };
  errors: {
    copyFailed: string;
  };
};

export const urlCleanerJa: UrlCleanerDict = {
  shell: {
    title: "URLクリーナー&QR生成",
    titleShort: "URL&QR",
    description:
      "長い URL を短く整形し、その場で QR コードも生成。完全ローカル・登録不要",
  },
  form: {
    inputLabel: "元の URL",
    inputPlaceholder: "https:// をペースト",
    outputLabel: "整形後",
    copy: "コピー",
    copied: "コピーしました！",
    clear: "クリア",
  },
  empty: {
    title: "URL を貼ってください",
    hint: "右の 📋 でペースト、または入力欄を長押し",
  },
  paste: {
    button: "ペースト",
    buttonAria: "クリップボードの内容を入力欄に貼り付ける",
    openClipboard: "クリップボード",
    openClipboardAria: "クリップボードの内容を確認してから貼り付ける",
    failed: "読み取れませんでした。右のクリップボードボタンか、入力欄の長押しをお試しください。",
    empty: "クリップボードが空です。先に URL をコピーしてください。",
    mobileHint: "📋＝即ペースト　📑＝内容を確認してから入力",
  },
  clipboardSheet: {
    title: "クリップボード",
    hint: "内容を確認してから、入力欄へ送れます。",
    empty: "クリップボードが空か、読み取れませんでした",
    use: "入力欄に入れる",
    close: "とじる",
    retry: "再読み込み",
    manualHint:
      "自動読み取りできませんでした。下の欄を長押ししてペーストするか、キーボードのペーストを使ってください。",
  },
  qr: {
    title: "QRコード",
    download: "QRコードを保存",
    downloadAria: "QRコード画像をPNGでダウンロード",
    failed: "QRコードを生成できませんでした",
  },
  errors: {
    copyFailed: "コピーに失敗しました。ブラウザの権限を確認してください。",
  },
};

export const urlCleanerEn: UrlCleanerDict = {
  shell: {
    title: "URL Cleaner & QR Gen",
    titleShort: "URL & QR",
    description:
      "Shorten long URLs and generate a QR code on the spot. 100% local, no sign-up",
  },
  form: {
    inputLabel: "Original URL",
    inputPlaceholder: "Paste https://",
    outputLabel: "Cleaned",
    copy: "Copy",
    copied: "Copied!",
    clear: "Clear",
  },
  empty: {
    title: "Paste a URL",
    hint: "Tap 📋 to paste, or long-press the field",
  },
  paste: {
    button: "Paste",
    buttonAria: "Paste clipboard text into the input field",
    openClipboard: "Clipboard",
    openClipboardAria: "Open clipboard preview before pasting",
    failed: "Could not read clipboard. Try the clipboard button or long-press the field.",
    empty: "Clipboard is empty. Copy a URL first.",
    mobileHint: "📋 = paste now　📑 = preview before input",
  },
  clipboardSheet: {
    title: "Clipboard",
    hint: "Review the text, then send it to the input field.",
    empty: "Clipboard is empty or unavailable",
    use: "Use in input",
    close: "Close",
    retry: "Reload",
    manualHint:
      "Auto-read failed. Long-press the field below to paste, or use your keyboard’s paste command.",
  },
  qr: {
    title: "QR code",
    download: "Save QR",
    downloadAria: "Download QR code as PNG",
    failed: "Could not generate QR code",
  },
  errors: {
    copyFailed: "Copy failed. Check browser clipboard permissions.",
  },
};
