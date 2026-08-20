import { isRightBound, type PaperSizeId } from "./paper";
import type { OutlineEntry } from "./outline";
import {
  isSoloSpreadPageType,
  type BookPage,
  type SpreadHeaderPlacement,
} from "./types";

/** エディターの表示モード */
export type EditorViewMode = "single" | "spread";

export type SpreadPair = {
  /** 見開きの左ページ（0始まり。無いときは -1） */
  leftIndex: number;
  /** 見開きの右ページ（0始まり。無いときは -1） */
  rightIndex: number;
};

/** 見開きにおけるページの左右 */
export type SpreadSide = "left" | "right";

/** アウトライン上で見開きに組まない項目（表紙・裏表紙） */
export function isOutlineSoloEntry(entry: OutlineEntry): boolean {
  return entry.kind === "page" && isSoloSpreadPageType(entry.pageType);
}

/**
 * フロー内インデックスを左右の見開きペアへ（連続 0-1, 2-3, …）。
 * 表紙の次から「2・3枚目」が見開きになる。
 */
function pairFlowIndices(
  flowPos: number,
  flowLength: number,
  paperSize: PaperSizeId,
): { left: number; right: number } {
  if (flowLength <= 0 || flowPos < 0) return { left: -1, right: -1 };
  const pairStart = flowPos - (flowPos % 2);
  const first = pairStart;
  const second = pairStart + 1;
  if (isRightBound(paperSize)) {
    // 右開き: 右＝先に読む側（ペア先頭）
    return {
      left: second < flowLength ? second : -1,
      right: first,
    };
  }
  // 左開き: 左＝ペア先頭、右＝その次
  return {
    left: first,
    right: second < flowLength ? second : -1,
  };
}

/**
 * アウトライン用見開き。
 * - 表紙・裏表紙は単ページ（呼び出し側で single 表示）
 * - それ以外は連続ペア。1枚目が表紙なら 2|3, 4|5…（全書籍タイプ共通）
 */
export function resolveOutlineSpreadPair(
  outlineIndex: number,
  outline: OutlineEntry[],
  paperSize: PaperSizeId,
): SpreadPair {
  if (outline.length === 0) return { leftIndex: -1, rightIndex: -1 };
  const entry = outline[outlineIndex];
  if (!entry || isOutlineSoloEntry(entry)) {
    return { leftIndex: -1, rightIndex: -1 };
  }

  const flow = outline
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !isOutlineSoloEntry(item));
  const flowPos = flow.findIndex((entry) => entry.index === outlineIndex);
  if (flowPos < 0) return { leftIndex: -1, rightIndex: -1 };

  const { left, right } = pairFlowIndices(flowPos, flow.length, paperSize);
  return {
    leftIndex: left >= 0 ? flow[left].index : -1,
    rightIndex: right >= 0 ? flow[right].index : -1,
  };
}

/**
 * 選択中ページを含む見開きの左右インデックスを求める（通し番号ベース・旧ロジック）。
 * エディター本体は resolveOutlineSpreadPair / resolveEditorSpreadPair を使う。
 */
export function resolveSpreadPair(
  pageIndex: number,
  pageCount: number,
  paperSize: PaperSizeId,
): SpreadPair {
  if (pageCount <= 0) return { leftIndex: -1, rightIndex: -1 };
  const index = Math.max(0, Math.min(pageIndex, pageCount - 1));
  const { left, right } = pairFlowIndices(index, pageCount, paperSize);
  return { leftIndex: left, rightIndex: right };
}

/**
 * 見開きに参加するページ（表紙・裏表紙を除く）と、元のページ番号。
 * 実物の本と同様、表紙は見開きの外側。
 */
export function getSpreadFlowEntries(
  pages: BookPage[],
): { absoluteIndex: number; page: BookPage }[] {
  return pages
    .map((page, absoluteIndex) => ({ absoluteIndex, page }))
    .filter(({ page }) => !isSoloSpreadPageType(page.pageType));
}

/**
 * 指定ページが見開きの左右どちら側か。
 */
export function resolvePageSpreadSide(
  pageIndex: number,
  pages: BookPage[],
  paperSize: PaperSizeId,
): SpreadSide {
  if (isSoloSpreadPageType(pages[pageIndex]?.pageType ?? "standard")) {
    return "right";
  }

  const flow = getSpreadFlowEntries(pages);
  const flowIndex = flow.findIndex((entry) => entry.absoluteIndex === pageIndex);
  if (flowIndex < 0) return "right";

  const pairStart = flowIndex - (flowIndex % 2);
  if (isRightBound(paperSize)) {
    return flowIndex === pairStart ? "right" : "left";
  }
  return flowIndex === pairStart ? "left" : "right";
}

/** 見開きの柱配置設定で、この側に柱を出してよいか */
export function isHeaderAllowedOnSpreadSide(
  placement: SpreadHeaderPlacement,
  side: SpreadSide,
): boolean {
  if (placement === "both") return true;
  return placement === side;
}

/** アウトライン項目が見開きの左右どちら側か（柱の出し分け用） */
export function resolveOutlineSpreadSide(
  outlineIndex: number,
  outline: OutlineEntry[],
  paperSize: PaperSizeId,
): SpreadSide {
  const entry = outline[outlineIndex];
  if (!entry || isOutlineSoloEntry(entry)) return "right";

  const pair = resolveOutlineSpreadPair(outlineIndex, outline, paperSize);
  if (pair.leftIndex === outlineIndex) return "left";
  if (pair.rightIndex === outlineIndex) return "right";
  return "right";
}

/**
 * 見開きモードでも単ページ表示すべきか。
 * 表紙・裏表紙だけ（本文ページは見開きに参加）。
 */
export function shouldShowAsSingleInSpread(
  pageIndex: number,
  pages: BookPage[],
): boolean {
  const page = pages[pageIndex];
  if (!page) return true;
  return isSoloSpreadPageType(page.pageType);
}

/**
 * 固定 pages[] 用の見開き。
 * 表紙・裏表紙を除いた列で連続ペア（表紙の次＝2|3）。
 */
export function resolveEditorSpreadPair(
  pageIndex: number,
  pages: BookPage[],
  paperSize: PaperSizeId,
): SpreadPair {
  if (shouldShowAsSingleInSpread(pageIndex, pages)) {
    return { leftIndex: -1, rightIndex: -1 };
  }

  const flow = getSpreadFlowEntries(pages);
  const flowIndex = flow.findIndex((entry) => entry.absoluteIndex === pageIndex);
  if (flowIndex < 0) return { leftIndex: -1, rightIndex: -1 };

  const { left, right } = pairFlowIndices(flowIndex, flow.length, paperSize);
  return {
    leftIndex: left >= 0 ? flow[left].absoluteIndex : -1,
    rightIndex: right >= 0 ? flow[right].absoluteIndex : -1,
  };
}
