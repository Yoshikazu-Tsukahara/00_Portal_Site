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
    failed: string;
    empty: string;
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
    hint: "中央の「ペースト」、欄の端をクリックして直接入力、または長押し",
  },
  paste: {
    button: "ペースト",
    buttonAria: "クリップボードの内容を入力欄に貼り付ける",
    failed:
      "読み取れませんでした。入力欄を長押しするか、キーボードのペーストをお試しください。",
    empty: "クリップボードが空です。先に URL をコピーしてください。",
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
    hint: "Use Paste in the center, click the field edge to type, or long-press",
  },
  paste: {
    button: "Paste",
    buttonAria: "Paste clipboard text into the input field",
    failed: "Could not read clipboard. Long-press the field or use keyboard paste.",
    empty: "Clipboard is empty. Copy a URL first.",
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
