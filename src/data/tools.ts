// ポータル掲載ツールの構造データ（表示文言は i18n 辞書側）
// 新しいツールを追加する場合:
// 1. ここに id / icon / href を追加（スマホ対応なら isMobileSupported: true）
// 2. src/i18n/ja.ts と en.ts の tools / genres に文言を追加

export type Tool = {
  /** 辞書キー（tools[id]） */
  id: string;
  /** 絵文字アイコン */
  icon: string;
  /** リンク先パス（未公開の場合は "#" を指定） */
  href: string;
  /** 公開準備中のプレースホルダー（内容は ToolCard 側で共通表示） */
  comingSoon?: boolean;
  /**
   * スマホ／縦長画面向けレスポンシブ対応済みか。
   * true → 「スマホ対応」バッジ、false → 「PC推奨」バッジ、未指定 → バッジなし
   */
  isMobileSupported?: boolean;
  /**
   * true のとき、説明ページの「端末内保存・非送信」共通枠を出さない
   * （ユーザーデータを扱わないミニゲームなど）
   */
  omitLocalDataNote?: boolean;
};

export type Genre = {
  /** 辞書キー（genres[id]） */
  id: string;
  /** ジャンル名（英語のサブラベル・デザイン用） */
  label: string;
  tools: Tool[];
};

/** ツール ID から所属ジャンルを取得 */
export function findGenreByToolId(toolId: string): Genre | undefined {
  return genres.find((g) => g.tools.some((t) => t.id === toolId));
}

/** 掲載ツールをフラット化（comingSoon 除く） */
export function getAllTools(): Tool[] {
  return genres.flatMap((g) => g.tools.filter((t) => !t.comingSoon));
}

export function findToolById(id: string): Tool | undefined {
  return getAllTools().find((t) => t.id === id);
}

/**
 * ライブラリ用カバー／アイコン画像パス。
 * 後日差し替えやすいよう public/icons または public/covers を参照する。
 */
export function getToolIconSrc(toolId: string): string {
  return `/icons/${toolId}-512.png`;
}

/** 静的カバー（public/covers/{id}.png）を持つツール */
const TOOLS_WITH_STATIC_COVER = new Set<string>([
  "invoice-maker",
  "mail-template",
  "folder-generator",
  "ultimate-probability-slot",
  "pdf-editor",
  "image-compressor",
  "text-cleaner",
  "media-metadata-editor",
  "book-visualizer",
  "palette-collector",
  "robot-freethrow",
  "pixel-drop-puzzle",
  "crypto-message",
  "lunch-savings",
  "link-stocker",
]);

/** 静的カバーがあるときだけパスを返す（無ければ null → ライブプレビュー） */
export function getToolCoverSrc(toolId: string): string | null {
  if (!TOOLS_WITH_STATIC_COVER.has(toolId)) return null;
  return `/covers/${toolId}.png`;
}

/**
 * ライブラリ説明ページ用の最終更新日（YYYY-MM-DD）。
 * 未登録はサイト共通の既定日。
 */
export const TOOL_UPDATED_AT: Record<string, string> = {
  "invoice-maker": "2026-07-20",
  "mail-template": "2026-08-01",
  "folder-generator": "2026-06-12",
  "pdf-editor": "2026-07-28",
  "image-compressor": "2026-07-10",
  "text-cleaner": "2026-06-01",
  "media-metadata-editor": "2026-05-22",
  "character-relation-editor": "2026-06-18",
  "book-visualizer": "2026-08-05",
  "palette-collector": "2026-07-02",
  "lunch-savings": "2026-07-15",
  "link-stocker": "2026-06-30",
  "ultimate-probability-slot": "2026-05-10",
  "pixel-drop-puzzle": "2026-06-08",
  "robot-freethrow": "2026-07-25",
  "crypto-message": "2026-07-08",
};

export function getToolUpdatedAt(toolId: string): string {
  return TOOL_UPDATED_AT[toolId] ?? "2026-08-01";
}

/** 各ジャンル末尾用：具体的内容を持たない Coming Soon プレースホルダー */
export const comingSoonPlaceholder: Tool = {
  id: "coming-soon",
  icon: "",
  href: "#",
  comingSoon: true,
};

export const genres: Genre[] = [
  {
    id: "business",
    label: "Business",
    tools: [
      {
        id: "invoice-maker",
        icon: "🧾",
        href: "/tools/invoice-maker",
        isMobileSupported: true,
      },
      {
        id: "mail-template",
        icon: "✉️",
        href: "/tools/mail-template",
        isMobileSupported: true,
      },
      {
        id: "folder-generator",
        icon: "📁",
        href: "/tools/folder-generator",
      },
      {
        id: "pdf-editor",
        icon: "📄",
        href: "/tools/pdf-editor",
        isMobileSupported: true,
      },
      {
        id: "image-compressor",
        icon: "🖼️",
        href: "/tools/image-compressor",
        isMobileSupported: true,
      },
      {
        id: "text-cleaner",
        icon: "✨",
        href: "/tools/text-cleaner",
      },
    ],
  },
  {
    id: "creators",
    label: "Creators",
    tools: [
      {
        id: "media-metadata-editor",
        icon: "🎵",
        href: "/tools/media-metadata-editor",
      },
      {
        id: "character-relation-editor",
        icon: "🕸️",
        href: "/tools/character-relation-editor",
      },
      {
        id: "book-visualizer",
        icon: "📖",
        href: "/tools/book-visualizer",
        isMobileSupported: true,
      },
      {
        id: "palette-collector",
        icon: "🎨",
        href: "/palette-collector",
      },
    ],
  },
  {
    id: "utilities",
    label: "Utilities",
    tools: [
      {
        id: "lunch-savings",
        icon: "🍱",
        href: "/lunch-savings",
        isMobileSupported: true,
      },
      {
        id: "link-stocker",
        icon: "🔗",
        href: "/link-stocker",
      },
    ],
  },
  {
    id: "minigames",
    label: "Mini Games",
    tools: [
      {
        id: "ultimate-probability-slot",
        icon: "🎰",
        href: "/ultimate-probability-slot",
        isMobileSupported: true,
        omitLocalDataNote: true,
      },
      {
        id: "pixel-drop-puzzle",
        icon: "🧩",
        href: "/pixel-drop-puzzle",
        isMobileSupported: true,
        omitLocalDataNote: true,
      },
      {
        id: "robot-freethrow",
        icon: "🏀",
        href: "/robot-freethrow",
        omitLocalDataNote: true,
      },
      {
        id: "crypto-message",
        icon: "🔐",
        href: "/crypto-message",
        isMobileSupported: true,
      },
      // モンスタードライバーはポータル一覧非表示（ルート /monster-driver は残置）
    ],
  },
];
