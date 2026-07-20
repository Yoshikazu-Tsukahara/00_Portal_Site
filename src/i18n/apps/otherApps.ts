/** 各ツール共通のシェル文言（title / description） */
export type AppShellCopy = {
  title: string;
  description: string;
};

export type TextCleanerDict = {
  shell: AppShellCopy;
  loading: string;
  input: {
    heading: string;
    clear: string;
    placeholder: string;
  };
  special: {
    heading: string;
    stripHtml: string;
    stripUrls: string;
    tidyMail: string;
  };
  settings: {
    heading: string;
    controlChars: string;
    controlCharsHint: string;
    trimLineEnds: string;
    toHalfWidth: string;
    newlines: string;
    whitespace: string;
    keepNewlines: string;
    collapseBlank: string;
    removeNewlines: string;
    collapseSpaces: string;
    removeSpaces: string;
  };
  presets: {
    heading: string;
    patterns: string;
    replace: string;
    savedSets: string;
    noneYet: string;
    setNamePlaceholder: string;
    saveCurrent: string;
    rename: string;
    delete: string;
    deselect: string;
  };
  rules: {
    heading: string;
    add: string;
    enabled: string;
    delete: string;
    find: string;
    replaceWith: string;
  };
  preview: {
    result: string;
    diff: string;
    stats: string;
    copy: string;
    copied: string;
    emptyLeft: string;
    emptyReady: string;
    toastCopied: string;
  };
  diff: {
    none: string;
    removed: string;
    added: string;
    unchanged: string;
  };
  confirm: {
    clearInput: string;
    deleteSet: string;
    deleteRule: string;
  };
};

export type FolderGeneratorDict = {
  shell: AppShellCopy;
  exporting: string;
  exportZip: string;
  preview: string;
  previewHint: string;
  addToRow: string;
  toolboxHint: string;
};

export type ImageCompressorDict = {
  shell: AppShellCopy;
  zipping: string;
  downloadZip: string;
  addImages: string;
  clearAll: string;
  dropHint: string;
  dropSub: string;
};

export type PdfEditorDict = {
  shell: AppShellCopy;
  exportPdf: string;
  loading: string;
  addPdf: string;
  clearAll: string;
  dropHint: string;
  dropSub: string;
};

export const textCleanerJa: TextCleanerDict = {
  shell: {
    title: "テキスト・クレンジング",
    description:
      "不要な改行・空白・制御文字を一発掃除。独自の一括置換も。",
  },
  loading: "読み込み中…",
  input: {
    heading: "入力テキスト",
    clear: "クリア",
    placeholder: "PDFやWebからコピーした文章を貼り付け…",
  },
  special: {
    heading: "特殊クレンジング（ワンタップ）",
    stripHtml: "HTMLタグの除去",
    stripUrls: "URLの削除",
    tidyMail: "メール・記号の整理",
  },
  settings: {
    heading: "クレンジング設定",
    controlChars: "制御文字を除去",
    controlCharsHint: "タブ・改行以外の不可視制御文字を削除",
    trimLineEnds: "行末の空白を除去",
    toHalfWidth: "全角の英数・記号を半角に一括変換",
    newlines: "改行・空行",
    whitespace: "空白（スペース・タブ）",
    keepNewlines: "そのまま残す",
    collapseBlank: "連続する空行を1行にまとめる",
    removeNewlines: "改行をすべて削除",
    collapseSpaces: "半角スペース1つに統一",
    removeSpaces: "すべての空白を削除",
  },
  presets: {
    heading: "置換ルール・パターン集",
    patterns: "よく使うパターン（ワンクリック適用）",
    replace: "差替",
    savedSets: "保存したセット",
    noneYet: "まだありません…",
    setNamePlaceholder: "セット名（例: ビジネス用）",
    saveCurrent: "現在のルールを保存",
    rename: "改名",
    delete: "削除",
    deselect: "選択解除",
  },
  rules: {
    heading: "一括置換ルール",
    add: "＋ ルール追加",
    enabled: "有効",
    delete: "削除",
    find: "検索ワード",
    replaceWith: "置換ワード",
  },
  preview: {
    result: "結果",
    diff: "差分",
    stats: "{from} 字 → {to} 字",
    copy: "クリーンなテキストをコピー",
    copied: "コピー完了！",
    emptyLeft: "左側にテキストを入力すると、ここに結果が表示されます。",
    emptyReady: "入力があると、ここにクレンジング結果が表示されます。",
    toastCopied: "クリップボードにコピーしました",
  },
  diff: {
    none: "差分はありません（入力と結果が同じです）。",
    removed: "削除",
    added: "追加",
    unchanged: "変更なし",
  },
  confirm: {
    clearInput: "入力テキストをクリアしますか？",
    deleteSet: "このセットを削除しますか？",
    deleteRule: "このルールを削除しますか？",
  },
};

export const textCleanerEn: TextCleanerDict = {
  shell: {
    title: "Text Cleaner",
    description:
      "Strip unwanted line breaks, spaces, and control characters. Custom bulk replace included.",
  },
  loading: "Loading…",
  input: {
    heading: "Input text",
    clear: "Clear",
    placeholder: "Paste text copied from a PDF or the web…",
  },
  special: {
    heading: "Quick cleans",
    stripHtml: "Remove HTML tags",
    stripUrls: "Remove URLs",
    tidyMail: "Tidy email symbols",
  },
  settings: {
    heading: "Clean settings",
    controlChars: "Remove control characters",
    controlCharsHint: "Delete invisible controls except tab and newline",
    trimLineEnds: "Trim trailing spaces",
    toHalfWidth: "Convert full-width alphanumerics/symbols to half-width",
    newlines: "Line breaks",
    whitespace: "Spaces & tabs",
    keepNewlines: "Keep as-is",
    collapseBlank: "Collapse blank lines to one",
    removeNewlines: "Remove all line breaks",
    collapseSpaces: "Normalize to single spaces",
    removeSpaces: "Remove all whitespace",
  },
  presets: {
    heading: "Replace rules & patterns",
    patterns: "Common patterns (one-click)",
    replace: "Apply",
    savedSets: "Saved sets",
    noneYet: "None yet…",
    setNamePlaceholder: "Set name (e.g. Business)",
    saveCurrent: "Save current rules",
    rename: "Rename",
    delete: "Delete",
    deselect: "Deselect",
  },
  rules: {
    heading: "Bulk replace rules",
    add: "+ Add rule",
    enabled: "On",
    delete: "Delete",
    find: "Find",
    replaceWith: "Replace with",
  },
  preview: {
    result: "Result",
    diff: "Diff",
    stats: "{from} chars → {to} chars",
    copy: "Copy cleaned text",
    copied: "Copied!",
    emptyLeft: "Enter text on the left to see results here.",
    emptyReady: "Results will appear here when you have input.",
    toastCopied: "Copied to clipboard",
  },
  diff: {
    none: "No differences (input matches result).",
    removed: "Removed",
    added: "Added",
    unchanged: "Unchanged",
  },
  confirm: {
    clearInput: "Clear the input text?",
    deleteSet: "Delete this set?",
    deleteRule: "Delete this rule?",
  },
};

export const folderGeneratorJa: FolderGeneratorDict = {
  shell: {
    title: "フォルダ自動生成アプリ",
    description: "命名規則を組み立て、複数フォルダを一括生成。",
  },
  exporting: "出力中…",
  exportZip: "ZIPを出力",
  preview: "プレビュー",
  previewHint: "親の配置と子の命名で出力可",
  addToRow: "選択行へ追加",
  toolboxHint: "日付・番号・リスト",
};

export const folderGeneratorEn: FolderGeneratorDict = {
  shell: {
    title: "Folder Generator",
    description: "Build naming rules and generate many folders at once.",
  },
  exporting: "Exporting…",
  exportZip: "Export ZIP",
  preview: "Preview",
  previewHint: "Ready when parent layout and child names are set",
  addToRow: "Add to selected row",
  toolboxHint: "Date, number, list",
};

export const imageCompressorJa: ImageCompressorDict = {
  shell: {
    title: "画像一括軽量化",
    description: "リサイズ・圧縮をブラウザ内で一括処理。ZIPで保存。",
  },
  zipping: "ZIP生成中…",
  downloadZip: "一括ダウンロード（ZIP）",
  addImages: "画像を追加",
  clearAll: "すべてクリア",
  dropHint: "画像をドロップ、または選択",
  dropSub: "JPEG / PNG / WebP · 複数可 · ブラウザ内処理",
};

export const imageCompressorEn: ImageCompressorDict = {
  shell: {
    title: "Batch Image Compressor",
    description: "Resize and compress in the browser. Save as a ZIP.",
  },
  zipping: "Creating ZIP…",
  downloadZip: "Download all (ZIP)",
  addImages: "Add images",
  clearAll: "Clear all",
  dropHint: "Drop images, or choose files",
  dropSub: "JPEG / PNG / WebP · multiple · processed in-browser",
};

export const pdfEditorJa: PdfEditorDict = {
  shell: {
    title: "PDF編集",
    description: "結合・並び替え・回転・白紙挿入。ブラウザ内で完結。",
  },
  exportPdf: "PDFを出力",
  loading: "読込中…",
  addPdf: "PDFを追加",
  clearAll: "すべてクリア",
  dropHint: "PDFをドロップ、または選択",
  dropSub: "複数ファイル可 · ブラウザ内で処理",
};

export const pdfEditorEn: PdfEditorDict = {
  shell: {
    title: "PDF Editor",
    description: "Merge, reorder, rotate, insert blanks—all in the browser.",
  },
  exportPdf: "Export PDF",
  loading: "Loading…",
  addPdf: "Add PDF",
  clearAll: "Clear all",
  dropHint: "Drop PDFs, or choose files",
  dropSub: "Multiple files · processed in-browser",
};
