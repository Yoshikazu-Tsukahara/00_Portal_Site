// ポータル掲載ツールの構造データ（表示文言は i18n 辞書側）
// 新しいツールを追加する場合:
// 1. ここに id / icon / href を追加
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
};

export type Genre = {
  /** 辞書キー（genres[id]） */
  id: string;
  /** ジャンル名（英語のサブラベル・デザイン用） */
  label: string;
  tools: Tool[];
};

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
        id: "mail-template",
        icon: "✉️",
        href: "/tools/mail-template",
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
      },
      {
        id: "image-compressor",
        icon: "🖼️",
        href: "/tools/image-compressor",
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
      },
    ],
  },
];
