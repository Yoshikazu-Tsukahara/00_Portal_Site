// 組版（DTP）の計算。
//
// 固定: 用紙・上下左右マージン（字数/行数を変えても余白は不変）
// 逆算: 印字エリア = 用紙 − 余白 を charsPerLine × linesPerPage で割り、
//       fontSize / letterSpacing / lineHeight を決める
//
// 見た目の「余白が膨らむ」対策:
// - letter-spacing は「文字の間」にしか入らないため、cpl 個分のマスを
//   (cpl−1) 個の隙間に分配して末尾ギャップを消す
// - line-height > fontSize の half-leading は PageMetrics.halfLeading で返し、
//   表示側で打ち消す

import { resolveBookFont } from "./fonts";
import type { WrapMode } from "./kinsoku";
import { getPaperPreset } from "./paper";
import {
  clampNumber,
  defaultFormat,
  FORMAT_LIMITS,
  type BookFormat,
  type BookLayout,
  type TextLevel,
} from "./types";

/** 印字エリアの最小辺（これ未満にならないよう余白側だけ縮める） */
const MIN_PRINT_AREA = 40;

/** 段間アキの下限（px） */
const COLUMN_GAP_MIN = 12;

/** レイアウトごとの平均字幅（font-size 比）。欧文の字サイズ逆算に使う */
export const GLYPH_RATIO: Record<BookLayout, number> = {
  japanese: 1,
  western: 0.55,
  photo: 1,
};

const LATIN_HEADING_GLYPH_RATIO = 0.72;

export const LEVEL_FONT_SCALE: Record<TextLevel, number> = {
  h1: 1.4,
  h2: 1.18,
  p: 1,
};

export function levelFontScale(level: TextLevel): number {
  return LEVEL_FONT_SCALE[level] ?? 1;
}

export function usesProportionalType(
  _level: TextLevel,
  wrapMode: WrapMode,
): boolean {
  return wrapMode === "latin";
}

export function levelCharsPerLine(
  bodyCharsPerLine: number,
  level: TextLevel,
  wrapMode: WrapMode = "cjk",
): number {
  const base = Math.max(1, Math.floor(bodyCharsPerLine));
  const scale = levelFontScale(level);
  if (scale <= 1) return base;
  if (wrapMode === "latin") {
    const bodyGlyph = GLYPH_RATIO.western;
    return Math.max(
      1,
      Math.floor((base * bodyGlyph) / (LATIN_HEADING_GLYPH_RATIO * scale)),
    );
  }
  return Math.max(1, Math.floor(base / scale));
}

export function levelLineCost(level: TextLevel): number {
  return levelFontScale(level);
}

export type PageMetrics = {
  width: number;
  height: number;
  contentWidth: number;
  contentHeight: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  fontSize: number;
  /** 行ピッチ（縦書き＝列幅、横書き＝行高）。CSS line-height */
  lineHeight: number;
  /**
   * CSS letter-spacing。
   * 満行で印字エリアの字取り方向をぴったり埋めるよう (cpl−1) 個の隙間に分配済み。
   */
  letterSpacing: number;
  /**
   * line-height と fontSize の差の半分（half-leading）。
   * 行ボックス端の空きが「余白」に見えないよう、表示側で打ち消す。
   */
  halfLeading: number;
  /** 段数（1 or 2）。縦書き＝上下、横書き＝左右 */
  columns: 1 | 2;
  columnGap: number;
  /** 1 段のインライン方向サイズ（横書き＝幅、縦書き＝高さ＝字取り方向） */
  columnInlineSize: number;
  /** 1 段のブロック方向サイズ（横書き＝高さ＝行送り方向、縦書き＝幅） */
  columnBlockSize: number;
  vertical: boolean;
  charsPerLine: number;
  linesPerPage: number;
  gridInline: number;
  gridBlock: number;
  cellInline: number;
  cellBlock: number;
};

function safeMargin(value: unknown, fallback: number): number {
  return clampNumber(
    value,
    FORMAT_LIMITS.margin.min,
    FORMAT_LIMITS.margin.max,
    fallback,
  );
}

/** 余白固定。印字エリアが最小を割るときだけ余白を比例縮小（膨らませない） */
function resolveFixedMargins(
  pageWidth: number,
  pageHeight: number,
  raw: { top: number; right: number; bottom: number; left: number },
) {
  let marginTop = Math.round(raw.top);
  let marginRight = Math.round(raw.right);
  let marginBottom = Math.round(raw.bottom);
  let marginLeft = Math.round(raw.left);

  const maxMarginX = Math.max(0, pageWidth - MIN_PRINT_AREA);
  const marginX = marginLeft + marginRight;
  if (marginX > maxMarginX && marginX > 0) {
    const scale = maxMarginX / marginX;
    marginLeft = Math.floor(marginLeft * scale);
    marginRight = Math.max(0, maxMarginX - marginLeft);
  }

  const maxMarginY = Math.max(0, pageHeight - MIN_PRINT_AREA);
  const marginY = marginTop + marginBottom;
  if (marginY > maxMarginY && marginY > 0) {
    const scale = maxMarginY / marginY;
    marginTop = Math.floor(marginTop * scale);
    marginBottom = Math.max(0, maxMarginY - marginTop);
  }

  return {
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    printAreaWidth: pageWidth - marginLeft - marginRight,
    printAreaHeight: pageHeight - marginTop - marginBottom,
  };
}

/**
 * 字取り方向を cpl マスで埋める letter-spacing。
 * CSS は文字「間」にしか入らないので、(cpl−1) 個に総ギャップを分配する。
 * → N×fontAdvance + (N−1)×ls = N×charPitch
 */
function letterSpacingToFill(
  charPitch: number,
  fontAdvance: number,
  charsPerLine: number,
): number {
  const gap = charPitch - fontAdvance;
  if (gap <= 0 || charsPerLine <= 1) return Math.max(0, gap);
  return (gap * charsPerLine) / (charsPerLine - 1);
}

/**
 * 用紙・余白を絶対固定し、印字エリアから組版量を逆算する。
 */
export function computePageMetrics(
  layout: BookLayout,
  format: BookFormat,
): PageMetrics {
  const defaults = defaultFormat(layout);
  const paper = getPaperPreset(format.paperSize);
  const vertical = layout === "japanese";
  // 字幅の目安は本文（p）書体を基準にする
  const font = resolveBookFont(format.fontFamilyP);
  // 欧文組は書体ごとの字幅目安を使い、字サイズ逆算を書体に追従させる
  const glyphRatio =
    layout === "western"
      ? (font.glyphRatio ?? GLYPH_RATIO.western)
      : (font.glyphRatio ?? GLYPH_RATIO[layout] ?? GLYPH_RATIO.japanese);

  const charsPerLine = clampNumber(
    format.charsPerLine,
    FORMAT_LIMITS.charsPerLine.min,
    FORMAT_LIMITS.charsPerLine.max,
    defaults.charsPerLine,
  );
  const linesPerPage = clampNumber(
    format.linesPerPage,
    FORMAT_LIMITS.linesPerPage.min,
    FORMAT_LIMITS.linesPerPage.max,
    defaults.linesPerPage,
  );

  const {
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    printAreaWidth,
    printAreaHeight,
  } = resolveFixedMargins(paper.width, paper.height, {
    top: safeMargin(format.marginTop, defaults.marginTop),
    right: safeMargin(format.marginRight, defaults.marginRight),
    bottom: safeMargin(format.marginBottom, defaults.marginBottom),
    left: safeMargin(format.marginLeft, defaults.marginLeft),
  });

  const cpl = Math.max(1, charsPerLine);
  const lpp = Math.max(1, linesPerPage);
  const columns: 1 | 2 = format.columns === 2 ? 2 : 1;
  const columnGap =
    columns > 1
      ? Math.max(
          COLUMN_GAP_MIN,
          Math.round(Math.min(printAreaWidth, printAreaHeight) * 0.04),
        )
      : 0;

  if (vertical) {
    // 縦書き: 字＝縦、行（列）＝横。2 段は上下に分ける
    const tierHeight =
      columns > 1
        ? (printAreaHeight - columnGap) / columns
        : printAreaHeight;
    const charPitch = tierHeight / cpl;
    const linePitch = printAreaWidth / lpp;
    const fontSize = Math.max(1, Math.min(charPitch, linePitch));
    const fontAdvance = fontSize * glyphRatio;
    const letterSpacing = letterSpacingToFill(charPitch, fontAdvance, cpl);
    const halfLeading = Math.max(0, (linePitch - fontSize) / 2);

    return {
      width: paper.width,
      height: paper.height,
      contentWidth: printAreaWidth,
      contentHeight: printAreaHeight,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      fontSize,
      lineHeight: linePitch,
      letterSpacing,
      halfLeading,
      columns,
      columnGap,
      columnInlineSize: tierHeight,
      columnBlockSize: printAreaWidth,
      vertical,
      charsPerLine: cpl,
      linesPerPage: lpp,
      gridInline: printAreaWidth,
      gridBlock: tierHeight,
      cellInline: linePitch,
      cellBlock: charPitch,
    };
  }

  // 横書き: 字＝横、行＝縦。2 段は左右に分ける
  const colWidth =
    columns > 1 ? (printAreaWidth - columnGap) / columns : printAreaWidth;
  const charPitch = colWidth / cpl;
  const linePitch = printAreaHeight / lpp;
  const fontSize = Math.max(
    1,
    Math.min(linePitch, charPitch / Math.max(0.01, glyphRatio)),
  );
  const fontAdvance = fontSize * glyphRatio;
  const letterSpacing = letterSpacingToFill(charPitch, fontAdvance, cpl);
  const halfLeading = Math.max(0, (linePitch - fontSize) / 2);

  return {
    width: paper.width,
    height: paper.height,
    contentWidth: printAreaWidth,
    contentHeight: printAreaHeight,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    fontSize,
    lineHeight: linePitch,
    letterSpacing,
    halfLeading,
    columns,
    columnGap,
    columnInlineSize: colWidth,
    columnBlockSize: printAreaHeight,
    vertical,
    charsPerLine: cpl,
    linesPerPage: lpp,
    gridInline: colWidth,
    gridBlock: printAreaHeight,
    cellInline: charPitch,
    cellBlock: linePitch,
  };
}
