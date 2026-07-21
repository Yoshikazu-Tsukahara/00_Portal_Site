import type { AppShellCopy } from "./otherApps";

export type PdfEditorDict = {
  shell: AppShellCopy;
  exportPdf: string;
  loading: string;
  addPdf: string;
  clearAll: string;
  dropHint: string;
  dropSub: string;
  blank: string;
  page: string;
  pages: string;
  file: string;
  files: string;
  selected: string;
  selectedOne: string;
  copying: string;
  viewMode: {
    aria: string;
    page: string;
    file: string;
    fileLockedTitle: string;
    fileLockedHint: string;
  };
  history: {
    aria: string;
    undo: string;
    undoTitle: string;
    redo: string;
    redoTitle: string;
  };
  selection: {
    aria: string;
    selected: string;
    copy: string;
    extract: string;
    rotate: string;
    delete: string;
    clearSelection: string;
    copying: string;
    pasteHint: string;
    clearCopy: string;
  };
  pageCard: {
    pageAria: string;
    pageSelected: string;
    rotate: string;
    rotateAria: string;
    delete: string;
    deleteAria: string;
  };
  fileCard: {
    reorderAria: string;
    editName: string;
    editNameTitle: string;
    duplicate: string;
    duplicateAria: string;
    delete: string;
    deleteAria: string;
    pageCount: string;
  };
  filmstrip: {
    noPages: string;
    insertBlank: string;
    insertBlankAria: string;
    pastePages: string;
    pasteAria: string;
  };
  fileList: {
    noFiles: string;
  };
  preview: {
    aria: string;
    close: string;
    prev: string;
    next: string;
    loading: string;
    failed: string;
    pageOf: string;
  };
  exportDialog: {
    extractTitle: string;
    fullTitle: string;
    extracting: string;
    extractDownload: string;
    exporting: string;
    download: string;
    close: string;
    settingsLine: string;
    addPageNumbers: string;
    pageNumbersHint: string;
    viewPassword: string;
    viewPasswordPlaceholder: string;
    passwordHint: string;
    cancel: string;
  };
  dragOverlay: {
    moving: string;
  };
  messages: {
    undone: string;
    redone: string;
    copied: string;
    pagesAdded: string;
    pagesPasted: string;
    pagesDeleted: string;
    pagesRotated: string;
    fileDeleted: string;
    fileDeletedNamed: string;
    fileRenamed: string;
    fileDuplicated: string;
    fileDuplicatedNamed: string;
    pagesExported: string;
    pagesExtracted: string;
  };
  errors: {
    loadFailed: string;
    exportFailed: string;
    exportEncryptFailed: string;
  };
  status: {
    filesAndPages: string;
    pagesOnly: string;
    pagesSelected: string;
    pagesSelectedOne: string;
    pagesCopying: string;
  };
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
  blank: "白紙",
  page: "ページ",
  pages: "ページ",
  file: "ファイル",
  files: "ファイル",
  selected: "件選択",
  selectedOne: "1 件選択",
  copying: "件コピー中",
  viewMode: {
    aria: "表示モード",
    page: "ページ単位",
    file: "ファイル単位",
    fileLockedTitle:
      "ページ構成が変更されたため、ファイル単位での編集はできません",
    fileLockedHint:
      "ページ構成が変更されたため、ファイル単位での編集はできません",
  },
  history: {
    aria: "履歴操作",
    undo: "元に戻す",
    undoTitle: "元に戻す (Ctrl+Z)",
    redo: "やり直す",
    redoTitle: "やり直す (Ctrl+Y)",
  },
  selection: {
    aria: "ページ操作",
    selected: "{count} 件選択",
    copy: "コピー",
    extract: "{count} ページを抽出",
    rotate: "回転",
    delete: "削除",
    clearSelection: "選択解除",
    copying: "{count} 件コピー中",
    pasteHint: "＋で貼り付け",
    clearCopy: "コピー解除",
  },
  pageCard: {
    pageAria: "ページ {index}",
    pageSelected: "（選択中）",
    rotate: "回転",
    rotateAria: "ページ {index} を回転",
    delete: "削除",
    deleteAria: "ページ {index} を削除",
  },
  fileCard: {
    reorderAria: "{name} を並べ替え",
    editName: "ファイル名を編集",
    editNameTitle: "クリックで名前を編集",
    duplicate: "複製",
    duplicateAria: "{name} を複製",
    delete: "削除",
    deleteAria: "{name} を削除",
    pageCount: "{count} ページ",
  },
  filmstrip: {
    noPages: "ページなし",
    insertBlank: "白紙",
    insertBlankAria: "白紙を挿入",
    pastePages: "{count} ページを貼り付け",
    pasteAria: "コピーしたページを貼り付け",
  },
  fileList: {
    noFiles: "ファイルなし",
  },
  preview: {
    aria: "ページ {index} のプレビュー",
    close: "閉じる",
    prev: "前のページ",
    next: "次のページ",
    loading: "読込中…",
    failed: "プレビュー読込に失敗",
    pageOf: "{current} / {total} ページ",
  },
  exportDialog: {
    extractTitle: "選択した {count} ページを抽出",
    fullTitle: "PDFを出力",
    extracting: "抽出中…",
    extractDownload: "抽出してダウンロード",
    exporting: "出力中…",
    download: "ダウンロード",
    close: "閉じる",
    settingsLine: "{count} ページ · 出力設定",
    addPageNumbers: "ページ番号を自動付与",
    pageNumbersHint: "各ページ下部中央に「1 / {count}」形式で印字",
    viewPassword: "閲覧パスワード",
    viewPasswordPlaceholder: "閲覧パスワード (任意)",
    passwordHint: "入力時のみ、開封にパスワードが必要な PDF を生成",
    cancel: "キャンセル",
  },
  dragOverlay: {
    moving: "{count} ページを移動中",
  },
  messages: {
    undone: "元に戻した",
    redone: "やり直した",
    copied: "{count} ページをコピー",
    pagesAdded: "{count} ページを追加",
    pagesPasted: "{count} ページを貼り付け",
    pagesDeleted: "{count} ページを削除",
    pagesRotated: "{count} ページを回転",
    fileDeleted: "ファイルを削除",
    fileDeletedNamed: "{name} を削除（{count} ページ）",
    fileRenamed: "ファイル名を更新",
    fileDuplicated: "ファイルを複製",
    fileDuplicatedNamed: "{name} を複製（{count} ページ）",
    pagesExported: "{count} ページを出力",
    pagesExtracted: "{count} ページを抽出",
  },
  errors: {
    loadFailed: "PDF読込に失敗",
    exportFailed: "PDF出力に失敗",
    exportEncryptFailed: "PDF出力または暗号化に失敗",
  },
  status: {
    filesAndPages: "{files} ファイル · {pages} ページ",
    pagesOnly: "{count} ページ",
    pagesSelected: "{pages} ページ · {selected} 件選択",
    pagesSelectedOne: "{pages} ページ · 1 件選択",
    pagesCopying: "{pages} ページ · {copying} 件コピー中",
  },
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
  blank: "Blank",
  page: "page",
  pages: "pages",
  file: "file",
  files: "files",
  selected: "selected",
  selectedOne: "1 selected",
  copying: "copied",
  viewMode: {
    aria: "View mode",
    page: "By page",
    file: "By file",
    fileLockedTitle: "File view is unavailable after page structure changes",
    fileLockedHint: "File view is unavailable after page structure changes",
  },
  history: {
    aria: "History",
    undo: "Undo",
    undoTitle: "Undo (Ctrl+Z)",
    redo: "Redo",
    redoTitle: "Redo (Ctrl+Y)",
  },
  selection: {
    aria: "Page actions",
    selected: "{count} selected",
    copy: "Copy",
    extract: "Extract {count} pages",
    rotate: "Rotate",
    delete: "Delete",
    clearSelection: "Clear selection",
    copying: "{count} copied",
    pasteHint: "Use + to paste",
    clearCopy: "Clear clipboard",
  },
  pageCard: {
    pageAria: "Page {index}",
    pageSelected: " (selected)",
    rotate: "Rotate",
    rotateAria: "Rotate page {index}",
    delete: "Delete",
    deleteAria: "Delete page {index}",
  },
  fileCard: {
    reorderAria: "Reorder {name}",
    editName: "Edit file name",
    editNameTitle: "Click to edit name",
    duplicate: "Duplicate",
    duplicateAria: "Duplicate {name}",
    delete: "Delete",
    deleteAria: "Delete {name}",
    pageCount: "{count} pages",
  },
  filmstrip: {
    noPages: "No pages",
    insertBlank: "Blank",
    insertBlankAria: "Insert blank page",
    pastePages: "Paste {count} pages",
    pasteAria: "Paste copied pages",
  },
  fileList: {
    noFiles: "No files",
  },
  preview: {
    aria: "Preview of page {index}",
    close: "Close",
    prev: "Previous page",
    next: "Next page",
    loading: "Loading…",
    failed: "Could not load preview",
    pageOf: "{current} / {total} pages",
  },
  exportDialog: {
    extractTitle: "Extract {count} selected pages",
    fullTitle: "Export PDF",
    extracting: "Extracting…",
    extractDownload: "Extract & download",
    exporting: "Exporting…",
    download: "Download",
    close: "Close",
    settingsLine: "{count} pages · Export settings",
    addPageNumbers: "Add page numbers",
    pageNumbersHint: 'Prints "1 / {count}" centered at the bottom of each page',
    viewPassword: "View password",
    viewPasswordPlaceholder: "View password (optional)",
    passwordHint: "When set, the PDF requires a password to open",
    cancel: "Cancel",
  },
  dragOverlay: {
    moving: "Moving {count} pages",
  },
  messages: {
    undone: "Undone",
    redone: "Redone",
    copied: "Copied {count} pages",
    pagesAdded: "Added {count} pages",
    pagesPasted: "Pasted {count} pages",
    pagesDeleted: "Deleted {count} pages",
    pagesRotated: "Rotated {count} pages",
    fileDeleted: "File removed",
    fileDeletedNamed: "Removed {name} ({count} pages)",
    fileRenamed: "File name updated",
    fileDuplicated: "File duplicated",
    fileDuplicatedNamed: "Duplicated {name} ({count} pages)",
    pagesExported: "Exported {count} pages",
    pagesExtracted: "Extracted {count} pages",
  },
  errors: {
    loadFailed: "Could not load PDF",
    exportFailed: "PDF export failed",
    exportEncryptFailed: "PDF export or encryption failed",
  },
  status: {
    filesAndPages: "{files} files · {pages} pages",
    pagesOnly: "{count} pages",
    pagesSelected: "{pages} pages · {selected} selected",
    pagesSelectedOne: "{pages} pages · 1 selected",
    pagesCopying: "{pages} pages · {copying} copied",
  },
};
