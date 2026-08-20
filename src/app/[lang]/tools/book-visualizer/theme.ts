// 用紙サイズ（書籍タイプ）ごとのプレビュー質感テーマ。
// ViewMode のルートに CSS 変数と data 属性として注入する。

import type { CSSProperties } from "react";

import type { PaperSizeId } from "./paper";

/** 表紙の硬さ（フリップライブラリの density に対応） */
export type CoverType = "hard" | "soft";

/** 紙のテクスチャ種類（CSS 側で実体を定義） */
export type PaperTexture =
  | "washi"
  | "fiber"
  | "coarse"
  | "gloss"
  | "none";

export type PaperTheme = {
  id: PaperSizeId;
  /** 紙の地色 */
  paperColor: string;
  /** 印刷インク色 */
  inkColor: string;
  /** 紙の繊維テクスチャ */
  texture: PaperTexture;
  /** 表紙の硬さ */
  coverType: CoverType;
  /**
   * デジタル表示（スマホ縦読み）。
   * true のときノド影・厚み・テクスチャなど物理表現を無効化する。
   */
  digital: boolean;
};

/**
 * 10 種類の用紙サイズ → 質感テーマ。
 * 本物の物理書籍のメタファーとして定義する。
 */
export const PAPER_THEMES: Record<PaperSizeId, PaperTheme> = {
  // ① 日本語・大衆文学系
  bunko: {
    id: "bunko",
    paperColor: "#fdfbf5",
    inkColor: "#333333",
    texture: "washi",
    coverType: "soft",
    digital: false,
  },
  shinsho: {
    id: "shinsho",
    paperColor: "#fdfbf5",
    inkColor: "#333333",
    texture: "washi",
    coverType: "soft",
    digital: false,
  },
  // ② 単行本・書籍系
  shiroku: {
    id: "shiroku",
    paperColor: "#fcfcfc",
    inkColor: "#222222",
    texture: "fiber",
    coverType: "hard",
    digital: false,
  },
  a5: {
    id: "a5",
    paperColor: "#fcfcfc",
    inkColor: "#222222",
    texture: "fiber",
    coverType: "soft",
    digital: false,
  },
  // ③ 洋書ペーパーバック系
  massMarket: {
    id: "massMarket",
    paperColor: "#f1ede4",
    inkColor: "#2c2825",
    texture: "coarse",
    coverType: "soft",
    digital: false,
  },
  trade: {
    id: "trade",
    paperColor: "#e8e4db",
    inkColor: "#2c2825",
    texture: "coarse",
    coverType: "soft",
    digital: false,
  },
  // ④ 雑誌・アートブック系
  b5: {
    id: "b5",
    paperColor: "#ffffff",
    inkColor: "#000000",
    texture: "gloss",
    coverType: "soft",
    digital: false,
  },
  a4: {
    id: "a4",
    paperColor: "#ffffff",
    inkColor: "#000000",
    texture: "gloss",
    coverType: "soft",
    digital: false,
  },
  square: {
    id: "square",
    paperColor: "#ffffff",
    inkColor: "#000000",
    texture: "gloss",
    coverType: "hard",
    digital: false,
  },
  // ⑤ デジタル系
  phone: {
    id: "phone",
    paperColor: "#ffffff",
    inkColor: "#1a1a1a",
    texture: "none",
    coverType: "soft",
    digital: true,
  },
};

export function getPaperTheme(paperSize: PaperSizeId): PaperTheme {
  return PAPER_THEMES[paperSize] ?? PAPER_THEMES.bunko;
}

/** ViewMode ルートへ注入する CSS 変数（`--paper-color` はエイリアス） */
export function paperThemeCssVars(theme: PaperTheme): CSSProperties {
  return {
    "--bv-paper-color": theme.paperColor,
    "--bv-ink-color": theme.inkColor,
    "--paper-color": theme.paperColor,
    "--ink-color": theme.inkColor,
  } as CSSProperties;
}
