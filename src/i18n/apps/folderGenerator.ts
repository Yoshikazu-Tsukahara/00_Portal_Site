import type { AppShellCopy } from "./otherApps";

export type FolderGeneratorDict = {
  shell: AppShellCopy;
  exporting: string;
  exportZip: string;
  preview: string;
  previewHint: string;
  addToRow: string;
  toolbox: {
    heading: string;
    hint: string;
  };
  variableKinds: {
    date: { label: string; short: string };
    number: { label: string; short: string };
    list: { label: string; short: string };
  };
  format: {
    heading: string;
    hint: string;
    parent: string;
    child: string;
    empty: string;
    addText: string;
    addTextTitle: string;
    addChild: string;
    addChildTitle: string;
    textPlaceholder: string;
    reorder: string;
    delete: string;
    deleteToken: string;
  };
  settings: {
    heading: string;
    subheading: string;
    totalCount: string;
    totalCountLocked: string;
    includeGitkeep: string;
    noVariables: string;
    format: string;
    increment: string;
    baseDate: string;
    numberStyle: string;
    startNumber: string;
    digits: string;
    listManual: string;
    listPlaceholder: string;
    listCount: string;
    importHeading: string;
    importDrop: string;
    importLoading: string;
    importSub: string;
    importDone: string;
    importNoData: string;
    importFailed: string;
    importInvalidType: string;
  };
  dateFormats: {
    yyyymmdd: string;
    yyyymmddDash: string;
    yyyymmddSlash: string;
    yyyymmddJa: string;
  };
  dateIncrement: {
    fixed: string;
    daily: string;
  };
  numberStyle: {
    numeric: string;
    alpha: string;
  };
  templates: {
    select: string;
    namePlaceholder: string;
    nameAria: string;
    load: string;
    save: string;
    saved: string;
    loaded: string;
    nameRequired: string;
  };
  previewTree: {
    empty: string;
    more: string;
  };
  errors: {
    checkInput: string;
    noFolders: string;
    zipFailed: string;
  };
  messages: {
    exported: string;
  };
  defaults: {
    listItems: string;
  };
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
  toolbox: {
    heading: "ツールボックス",
    hint: "ドラッグして追加",
  },
  variableKinds: {
    date: { label: "日付", short: "日付" },
    number: { label: "番号", short: "番号" },
    list: { label: "リスト", short: "リスト" },
  },
  format: {
    heading: "フォーマット",
    hint: "「＋子」で階層追加 · 行を選択してドロップ",
    parent: "親",
    child: "子",
    empty: "フォーマットを入力・配置",
    addText: "＋文字",
    addTextTitle: "文字追加",
    addChild: "＋子",
    addChildTitle: "子追加",
    textPlaceholder: "文字",
    reorder: "並べ替え",
    delete: "削除",
    deleteToken: "{label} 削除",
  },
  settings: {
    heading: "詳細設定",
    subheading: "全変数の一覧",
    totalCount: "生成数",
    totalCountLocked: "リスト件数と連動",
    includeGitkeep: ".gitkeep を同梱",
    noVariables: "変数未配置",
    format: "フォーマット",
    increment: "増分",
    baseDate: "基準日",
    numberStyle: "種類",
    startNumber: "開始番号",
    digits: "桁数",
    listManual: "手入力（カンマ区切り）",
    listPlaceholder: "例: 企画,デザイン,開発,テスト",
    listCount: "{count} 件",
    importHeading: "Excel / CSV インポート",
    importDrop: "ドロップまたは選択",
    importLoading: "読み込み中…",
    importSub: ".xlsx / .csv · 1列目",
    importDone: "{count} 件をインポート",
    importNoData: "データなし",
    importFailed: "読み込み失敗",
    importInvalidType: ".xlsx / .csv のみ対応",
  },
  dateFormats: {
    yyyymmdd: "yyyymmdd（例: 20240719）",
    yyyymmddDash: "yyyy-mm-dd（例: 2024-07-19）",
    yyyymmddSlash: "yyyy/mm/dd（例: 2024/07/19）",
    yyyymmddJa: "yyyy年mm月dd日",
  },
  dateIncrement: {
    fixed: "固定",
    daily: "1件ごと +1日",
  },
  numberStyle: {
    numeric: "数字",
    alpha: "アルファベット",
  },
  templates: {
    select: "テンプレート",
    namePlaceholder: "名前",
    nameAria: "テンプレート名",
    load: "読込",
    save: "保存",
    saved: "保存済",
    loaded: "読込済",
    nameRequired: "名前未入力",
  },
  previewTree: {
    empty: "プレビューなし",
    more: "他 {count} 件",
  },
  errors: {
    checkInput: "入力内容を確認",
    noFolders: "フォルダ名を生成できません",
    zipFailed: "ZIP出力に失敗",
  },
  messages: {
    exported: "{count} 件のフォルダを出力",
  },
  defaults: {
    listItems: "企画,デザイン,開発",
  },
};

export const folderGeneratorEn: FolderGeneratorDict = {
  shell: {
    title: "Folder Generator",
    description:
      "Build naming rules with dates, numbers, and lists—then export nested folders as a ZIP.",
  },
  exporting: "Exporting…",
  exportZip: "Export ZIP",
  preview: "Preview",
  previewHint: "Set parent layout and child names to enable export",
  addToRow: "Add to selected row",
  toolbox: {
    heading: "Toolbox",
    hint: "Drag to add",
  },
  variableKinds: {
    date: { label: "Date", short: "Date" },
    number: { label: "Number", short: "No." },
    list: { label: "List", short: "List" },
  },
  format: {
    heading: "Format",
    hint: "Use “+ Child” for nesting · select a row, then drop",
    parent: "Parent",
    child: "Child",
    empty: "Add tokens or text here",
    addText: "+ Text",
    addTextTitle: "Add text",
    addChild: "+ Child",
    addChildTitle: "Add child folder",
    textPlaceholder: "Text",
    reorder: "Reorder",
    delete: "Delete",
    deleteToken: "Remove {label}",
  },
  settings: {
    heading: "Settings",
    subheading: "All variables in this layout",
    totalCount: "Count",
    totalCountLocked: "Synced with list length",
    includeGitkeep: "Include .gitkeep files",
    noVariables: "No variables placed yet",
    format: "Format",
    increment: "Increment",
    baseDate: "Base date",
    numberStyle: "Style",
    startNumber: "Start at",
    digits: "Digits",
    listManual: "Manual entry (comma-separated)",
    listPlaceholder: "e.g. Planning, Design, Dev, QA",
    listCount: "{count} items",
    importHeading: "Import Excel / CSV",
    importDrop: "Drop or choose file",
    importLoading: "Loading…",
    importSub: ".xlsx / .csv · first column",
    importDone: "Imported {count} items",
    importNoData: "No data found",
    importFailed: "Could not read file",
    importInvalidType: "Only .xlsx / .csv supported",
  },
  dateFormats: {
    yyyymmdd: "yyyymmdd (e.g. 20240719)",
    yyyymmddDash: "yyyy-mm-dd (e.g. 2024-07-19)",
    yyyymmddSlash: "yyyy/mm/dd (e.g. 2024/07/19)",
    yyyymmddJa: "yyyy年mm月dd日 (Japanese style)",
  },
  dateIncrement: {
    fixed: "Fixed",
    daily: "+1 day per folder",
  },
  numberStyle: {
    numeric: "Numeric",
    alpha: "Alphabetic",
  },
  templates: {
    select: "Template",
    namePlaceholder: "Name",
    nameAria: "Template name",
    load: "Load",
    save: "Save",
    saved: "Saved",
    loaded: "Loaded",
    nameRequired: "Name required",
  },
  previewTree: {
    empty: "Nothing to preview",
    more: "+{count} more",
  },
  errors: {
    checkInput: "Check your settings",
    noFolders: "Could not generate folder names",
    zipFailed: "ZIP export failed",
  },
  messages: {
    exported: "Exported {count} folders",
  },
  defaults: {
    listItems: "Planning,Design,Development",
  },
};
