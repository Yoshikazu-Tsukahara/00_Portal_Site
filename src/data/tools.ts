// ポータルサイトに掲載するツールとジャンルの定義データ
// 新しいツールを追加する場合は、対応するジャンルの tools 配列に要素を追加するだけでOK

export type Tool = {
  /** 絵文字アイコン */
  icon: string;
  /** ツール名 */
  title: string;
  /** カードに表示する短い説明文 */
  description: string;
  /** リンク先パス（未公開の場合は "#" を指定） */
  href: string;
  /** 公開準備中のプレースホルダー（内容は ToolCard 側で共通表示） */
  comingSoon?: boolean;
};

export type Genre = {
  id: string;
  /** ジャンル名（日本語） */
  name: string;
  /** ジャンル名（英語のサブラベル） */
  label: string;
  /** ジャンルの簡単な説明 */
  description: string;
  tools: Tool[];
};

/** 各ジャンル末尾用：具体的内容を持たない Coming Soon プレースホルダー */
export const comingSoonPlaceholder: Tool = {
  icon: "",
  title: "",
  description: "",
  href: "#",
  comingSoon: true,
};

export const genres: Genre[] = [
  {
    id: "business",
    name: "業務効率化",
    label: "Business",
    description: "日々の業務をちょっとだけ楽にする、実務直結ツール",
    tools: [
      {
        icon: "✉️",
        title: "メールテンプレ整理アプリ",
        description:
          "タグ分類と変数置換で、日々のメール返信を爆速にするローカルツール。",
        href: "/tools/mail-template",
      },
      {
        icon: "📁",
        title: "フォルダ自動生成アプリ",
        description:
          "作りたいフォルダ名を一行ずつ入力するだけで、空フォルダ入りのZIPを一括生成。",
        href: "/tools/folder-generator",
      },
      {
        icon: "📄",
        title: "簡易PDF編集アプリ",
        description:
          "結合・並び替え・ページ削除をブラウザ上で完結。",
        href: "/tools/pdf-editor",
      },
      {
        icon: "🖼️",
        title: "画像一括軽量化",
        description:
          "最大幅と画質を指定して、画像をブラウザ内で一括リサイズ・圧縮。",
        href: "/tools/image-compressor",
      },
      {
        icon: "✨",
        title: "テキスト・クレンジング＆一括置換",
        description:
          "不要な改行・空白・制御文字を一発掃除。独自の置換ルールも保存可能。",
        href: "/tools/text-cleaner",
      },
    ],
  },
  {
    id: "creators",
    name: "クリエイター支援",
    label: "Creators",
    description: "発信・制作活動を支える、クリエイターのための道具箱",
    tools: [comingSoonPlaceholder],
  },
  {
    id: "utilities",
    name: "日常の便利ツール",
    label: "Utilities",
    description: "ちょっとした作業をサッと済ませる、汎用ユーティリティ",
    tools: [comingSoonPlaceholder],
  },
];
