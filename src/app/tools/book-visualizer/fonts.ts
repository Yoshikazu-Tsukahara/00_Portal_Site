// 書籍本文用フォント（Google Fonts）の定義と解決
// ※ types.ts から参照されるため、types への import はしない（循環依存回避）

/** 選択可能な書体 ID（保存・互換のキー） */
export const BOOK_FONT_IDS = [
  "noto-serif-jp",
  "shippori-mincho",
  "yuji-syuku",
  "noto-sans-jp",
  "zen-kaku-gothic-new",
  "eb-garamond",
  "merriweather",
  "playfair-display",
  "inter",
  "roboto",
] as const;

export type BookFontId = (typeof BOOK_FONT_IDS)[number];

export type BookFontDef = {
  id: BookFontId;
  /** UI・CSS で使う正式名称 */
  label: string;
  /** font-family に渡すスタック */
  cssFamily: string;
  /** 主に日本語向けか欧文向けか（パネルのグループ分け用） */
  script: "japanese" | "latin";
  /**
   * 欧文組の平均字幅目安（font-size 比）。
   * 和文は 1（全角）。未指定時はレイアウト既定を使う。
   */
  glyphRatio?: number;
};

export const BOOK_FONTS: Record<BookFontId, BookFontDef> = {
  "noto-serif-jp": {
    id: "noto-serif-jp",
    label: "Noto Serif JP",
    cssFamily: '"Noto Serif JP", "Hiragino Mincho ProN", serif',
    script: "japanese",
    glyphRatio: 1,
  },
  "shippori-mincho": {
    id: "shippori-mincho",
    label: "Shippori Mincho",
    cssFamily: '"Shippori Mincho", "Hiragino Mincho ProN", serif',
    script: "japanese",
    glyphRatio: 1,
  },
  "yuji-syuku": {
    id: "yuji-syuku",
    label: "Yuji Syuku",
    cssFamily: '"Yuji Syuku", "Hiragino Mincho ProN", serif',
    script: "japanese",
    glyphRatio: 1,
  },
  "noto-sans-jp": {
    id: "noto-sans-jp",
    label: "Noto Sans JP",
    cssFamily: '"Noto Sans JP", "Hiragino Sans", sans-serif',
    script: "japanese",
    glyphRatio: 1,
  },
  "zen-kaku-gothic-new": {
    id: "zen-kaku-gothic-new",
    label: "Zen Kaku Gothic New",
    cssFamily: '"Zen Kaku Gothic New", "Hiragino Sans", sans-serif',
    script: "japanese",
    glyphRatio: 1,
  },
  "eb-garamond": {
    id: "eb-garamond",
    label: "EB Garamond",
    cssFamily: '"EB Garamond", Georgia, "Times New Roman", serif',
    script: "latin",
    glyphRatio: 0.48,
  },
  merriweather: {
    id: "merriweather",
    label: "Merriweather",
    cssFamily: 'Merriweather, Georgia, "Times New Roman", serif',
    script: "latin",
    glyphRatio: 0.52,
  },
  "playfair-display": {
    id: "playfair-display",
    label: "Playfair Display",
    cssFamily: '"Playfair Display", Georgia, serif',
    script: "latin",
    glyphRatio: 0.5,
  },
  inter: {
    id: "inter",
    label: "Inter",
    cssFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
    script: "latin",
    glyphRatio: 0.5,
  },
  roboto: {
    id: "roboto",
    label: "Roboto",
    cssFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
    script: "latin",
    glyphRatio: 0.5,
  },
};

export function isBookFontId(value: unknown): value is BookFontId {
  return (
    typeof value === "string" &&
    (BOOK_FONT_IDS as readonly string[]).includes(value)
  );
}

/** 組版レイアウトに応じた既定書体 */
export function defaultFontFamilyForLayout(
  layout: "japanese" | "western" | "photo",
): BookFontId {
  if (layout === "japanese") return "shippori-mincho";
  if (layout === "western") return "eb-garamond";
  return "noto-sans-jp";
}

/** 章・節・本文の既定書体（同じ既定から始める） */
export function defaultLevelFonts(
  layout: "japanese" | "western" | "photo",
): { h1: BookFontId; h2: BookFontId; p: BookFontId } {
  const base = defaultFontFamilyForLayout(layout);
  return { h1: base, h2: base, p: base };
}

export function resolveBookFont(fontFamily: string | undefined): BookFontDef {
  if (isBookFontId(fontFamily)) return BOOK_FONTS[fontFamily];
  return BOOK_FONTS[defaultFontFamilyForLayout("japanese")];
}

/** CSS font-family 値 */
export function bookFontCssFamily(fontFamily: string | undefined): string {
  return resolveBookFont(fontFamily).cssFamily;
}

/** 階層 → 書体 ID（format の 3 フィールドから） */
export function fontIdForLevel(
  fonts: { h1: BookFontId; h2: BookFontId; p: BookFontId },
  level: "h1" | "h2" | "p",
): BookFontId {
  return fonts[level] ?? fonts.p;
}

/** ページネーション再計算用の依存キー */
export function fontFamiliesKey(fonts: {
  h1: string;
  h2: string;
  p: string;
}): string {
  return `${fonts.h1}|${fonts.h2}|${fonts.p}`;
}
