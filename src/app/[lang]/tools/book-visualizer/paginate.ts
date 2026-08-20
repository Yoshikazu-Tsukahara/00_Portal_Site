// 文字数ベースのページネーション（DOM 非依存）。
// テキストは断片化せず、表示用スライスだけを都度計算する。

import { wrapParagraph, type WrapMode } from "./kinsoku";
import { levelCharsPerLine, levelLineCost } from "./metrics";
import {
  isBodyPageBreak,
  type BodyItem,
  type BookLayout,
  type TextLevel,
} from "./types";

/** 組版設定（ページ分割の唯一の根拠）。字数・行数は本文（p）・1 段基準 */
export type LayoutConfig = {
  charsPerLine: number;
  /** 1 段あたりの行数（縦書きなら列数） */
  linesPerPage: number;
  /** 1 ページ内の段数（縦書き＝上下、横書き＝左右） */
  columns: 1 | 2;
  writingMode: "vertical-rl" | "horizontal-tb";
  /** cjk=日本語の字取り＋句読点禁則 / latin=欧文の単語折り返し */
  wrapMode: WrapMode;
  /**
   * 書体キー。折り返し自体は字数基準だが、フォント変更時に
   * useMemo / paginateBody を必ず再実行するための依存キー。
   */
  fontFamily: string;
};

/** ページ分割に渡す論理ブロック（保存データは断片化しない） */
export type PaginateBlock = {
  id: string;
  /** 見出しは字数・行コストを本文倍率で換算する */
  type: "p" | "h1" | "h2" | "pageBreak";
  text: string;
};

/** 折り返し後の 1 行と、元テキスト上の文字範囲 */
export type WrappedLine = {
  text: string;
  /** block.text 上の開始位置（含む） */
  start: number;
  /** block.text 上の終了位置（含まない） */
  end: number;
};

/** 1 ページ上の、あるブロック由来の連続テキスト */
export type PageSlice = {
  blockId: string;
  textSlice: string;
  /** 元テキスト上の開始位置（含む） */
  start: number;
  /** 元テキスト上の終了位置（含まない） */
  end: number;
  /** 表示用の階層（見つからないときは p） */
  level: TextLevel;
};

/** 計算済みの 1 ページ */
export type PaginatedPage = {
  pageIndex: number;
  /**
   * 読み順の全スライス（全段を連結）。
   * 目次・柱・削除処理など既存呼び出し用。
   */
  slices: PageSlice[];
  /** 段ごとのスライス（length === columnCount） */
  columnSlices: PageSlice[][];
  columnCount: 1 | 2;
  /** ページ末が手動のページ区切りで終わったか */
  manualBreakAfter?: boolean;
  /** 末尾の手動ページ区切りの id（表示・削除用） */
  manualBreakId?: string;
  /**
   * 本文換算で使った行／列数の合計（全段、見出し倍率込み）。
   */
  usedLineCount: number;
  /** 最終使用段の、その段内での使用行数（区切りマーク位置用） */
  lastColumnUsedLineCount: number;
  /** 最終使用段の index（0 始まり） */
  lastColumnIndex: number;
};

/** 1 ページの最大文字数目安（1 段の行数 × 字数 × 段数） */
export function pageCapacity(config: LayoutConfig): number {
  const cols = config.columns === 2 ? 2 : 1;
  return (
    Math.max(1, config.charsPerLine) *
    Math.max(1, config.linesPerPage) *
    cols
  );
}

/** BookLayout → writingMode */
export function writingModeOf(layout: BookLayout): LayoutConfig["writingMode"] {
  return layout === "japanese" ? "vertical-rl" : "horizontal-tb";
}

/** 本文ストリーム → 分割用ブロック列 */
export function bodyToPaginateBlocks(body: BodyItem[]): PaginateBlock[] {
  return body.map((item) => {
    if (isBodyPageBreak(item)) {
      return { id: item.id, type: "pageBreak" as const, text: "" };
    }
    const type: PaginateBlock["type"] =
      item.level === "h1" ? "h1" : item.level === "h2" ? "h2" : "p";
    // オフセット計算と保存文字列を一致させる
    return { id: item.id, type, text: normalizeTextNewlines(item.text) };
  });
}

function levelOf(type: PaginateBlock["type"]): TextLevel {
  if (type === "h1") return "h1";
  if (type === "h2") return "h2";
  return "p";
}

/** 改行コードを \n に揃える */
export function normalizeTextNewlines(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

/**
 * 文字列を行へ分割し、元テキストの文字範囲も返す。
 * 明示改行 `\n` は行の区切り。
 * wrapMode で CJK 禁則 / 欧文単語折り返しを切り替える。
 */
export function wrapToLinesWithRanges(
  text: string,
  charsPerLine: number,
  wrapMode: WrapMode = "cjk",
): WrappedLine[] {
  const cpl = Math.max(1, charsPerLine);
  const normalized = normalizeTextNewlines(text);
  const lines: WrappedLine[] = [];
  const parts = normalized.split("\n");
  let offset = 0;

  for (let p = 0; p < parts.length; p += 1) {
    const part = parts[p] ?? "";
    if (part.length === 0) {
      lines.push({ text: "", start: offset, end: offset });
    } else {
      for (const range of wrapParagraph(part, cpl, wrapMode)) {
        lines.push({
          text: part.slice(range.start, range.end),
          start: offset + range.start,
          end: offset + range.end,
        });
      }
    }
    offset += part.length;
    if (p < parts.length - 1) {
      offset += 1; // 分割で除いた \n を消費
    }
  }
  return lines;
}

function emptyColumnSlices(columnCount: 1 | 2): PageSlice[][] {
  return Array.from({ length: columnCount }, () => []);
}

/**
 * 論理ブロック配列をページへ切り分ける。
 * 容量の基準は本文: charsPerLine × linesPerPage × columns。
 * 見出しは大きい分だけ 1 行の字数を減らし、行コストを倍率で加算する。
 * 段は 1 段目→2 段目の順に埋め、すべて埋まってから次ページへ。
 */
export function paginateBlocks(
  blocks: PaginateBlock[],
  config: LayoutConfig,
): PaginatedPage[] {
  const bodyCharsPerLine = Math.max(1, Math.floor(config.charsPerLine));
  const linesPerColumn = Math.max(1, Math.floor(config.linesPerPage));
  const columnCount: 1 | 2 = config.columns === 2 ? 2 : 1;
  /** 本文 1 行 = 100。見出しは倍率×100（浮動小数の誤差を避ける） */
  const LINE_UNIT = 100;
  const columnBudget = linesPerColumn * LINE_UNIT;

  const pages: PaginatedPage[] = [];
  let columnSlices = emptyColumnSlices(columnCount);
  let colIndex = 0;
  /** 各段の本文換算使用量（LINE_UNIT 単位） */
  let columnLinesUsed = Array.from({ length: columnCount }, () => 0);
  /** ページ全体の使用量 */
  let pageLinesUsed = 0;
  /** いま積んでいるブロックの行バッファ（現在段） */
  let openBlockId: string | null = null;
  let openLevel: TextLevel = "p";
  let openLines: string[] = [];
  let openStart = 0;
  let openEnd = 0;

  function pushOpenSlice() {
    if (openBlockId === null) return;
    columnSlices[colIndex]!.push({
      blockId: openBlockId,
      textSlice: openLines.join("\n"),
      start: openStart,
      end: openEnd,
      level: openLevel,
    });
    openBlockId = null;
    openLines = [];
    openStart = 0;
    openEnd = 0;
  }

  function flushPage(manualBreak?: { id: string }) {
    pushOpenSlice();
    let lastCol = 0;
    for (let i = 0; i < columnCount; i += 1) {
      if ((columnSlices[i]?.length ?? 0) > 0 || (columnLinesUsed[i] ?? 0) > 0) {
        lastCol = i;
      }
    }
    pages.push({
      pageIndex: pages.length,
      slices: columnSlices.flat(),
      columnSlices,
      columnCount,
      manualBreakAfter: manualBreak ? true : undefined,
      manualBreakId: manualBreak?.id,
      usedLineCount: pageLinesUsed / LINE_UNIT,
      lastColumnUsedLineCount: (columnLinesUsed[lastCol] ?? 0) / LINE_UNIT,
      lastColumnIndex: lastCol,
    });
    columnSlices = emptyColumnSlices(columnCount);
    columnLinesUsed = Array.from({ length: columnCount }, () => 0);
    colIndex = 0;
    pageLinesUsed = 0;
  }

  function advanceColumnOrPage() {
    pushOpenSlice();
    if (colIndex + 1 < columnCount) {
      colIndex += 1;
      return;
    }
    flushPage();
  }

  function addLine(blockId: string, level: TextLevel, line: WrappedLine) {
    const cost = Math.round(levelLineCost(level) * LINE_UNIT);
    const usedInCol = columnLinesUsed[colIndex] ?? 0;
    // 残り行が足りなければ次の段／ページへ（空ページへは載せる）
    if (usedInCol > 0 && usedInCol + cost > columnBudget) {
      advanceColumnOrPage();
    }
    if (openBlockId !== blockId) {
      pushOpenSlice();
      openBlockId = blockId;
      openLevel = level;
      openLines = [line.text];
      openStart = line.start;
      openEnd = line.end;
    } else {
      openLines.push(line.text);
      openEnd = line.end;
    }
    columnLinesUsed[colIndex] = (columnLinesUsed[colIndex] ?? 0) + cost;
    pageLinesUsed += cost;
  }

  for (const block of blocks) {
    if (block.type === "pageBreak") {
      // 手動改ページ：現ページを確定して次へ（空でも明示的な空白ページを残す）
      if (
        pageLinesUsed > 0 ||
        columnSlices.some((col) => col.length > 0) ||
        openBlockId !== null
      ) {
        flushPage({ id: block.id });
      } else {
        pages.push({
          pageIndex: pages.length,
          slices: [],
          columnSlices: emptyColumnSlices(columnCount),
          columnCount,
          manualBreakAfter: true,
          manualBreakId: block.id,
          usedLineCount: 0,
          lastColumnUsedLineCount: 0,
          lastColumnIndex: 0,
        });
      }
      continue;
    }

    const level = levelOf(block.type);
    const cpl = levelCharsPerLine(
      bodyCharsPerLine,
      level,
      config.wrapMode,
    );
    const lines = wrapToLinesWithRanges(block.text, cpl, config.wrapMode);
    // 空ブロックも最低 1 行分のクリック領域を確保
    if (lines.length === 0) {
      addLine(block.id, level, { text: "", start: 0, end: 0 });
      continue;
    }
    for (const line of lines) {
      addLine(block.id, level, line);
    }
  }

  // 末尾を確定。本文が空なら空ページ 1 枚
  if (
    pageLinesUsed > 0 ||
    columnSlices.some((col) => col.length > 0) ||
    openBlockId !== null
  ) {
    flushPage();
  }
  if (pages.length === 0) {
    pages.push({
      pageIndex: 0,
      slices: [],
      columnSlices: emptyColumnSlices(columnCount),
      columnCount,
      usedLineCount: 0,
      lastColumnUsedLineCount: 0,
      lastColumnIndex: 0,
    });
  }

  return pages;
}

/**
 * 区切りマークを置くグリッドスロット（0 始まり）。
 * 最終使用行／列のひとつ後ろ。ページ末まで埋まっていれば linesPerPage（＝余白側）。
 */
export function pageBreakMarkSlot(
  usedLineCount: number,
  linesPerPage: number,
): number {
  const max = Math.max(1, Math.floor(linesPerPage));
  if (usedLineCount <= 0) return 0;
  return Math.min(max, Math.ceil(usedLineCount));
}

/** ブロック id → 本文ページで最初に出現する index（0 始まり） */
export function firstBodyPageIndexByBlock(
  bodyPages: PaginatedPage[],
): Map<string, number> {
  const map = new Map<string, number>();
  for (let i = 0; i < bodyPages.length; i += 1) {
    for (const slice of bodyPages[i]?.slices ?? []) {
      if (!map.has(slice.blockId)) map.set(slice.blockId, i);
    }
  }
  return map;
}

/** BodyItem[] から直接ページ分割 */
export function paginateBody(
  body: BodyItem[],
  config: LayoutConfig,
): PaginatedPage[] {
  return paginateBlocks(bodyToPaginateBlocks(body), config);
}

/** 書籍レイアウト → 折り返し方式（欧文だけ単語単位） */
export function wrapModeOf(layout: BookLayout): WrapMode {
  return layout === "western" ? "latin" : "cjk";
}

/** format + layout から LayoutConfig を作る */
export function layoutConfigFrom(
  layout: BookLayout,
  charsPerLine: number,
  linesPerPage: number,
  fontFamily = "",
  columns: 1 | 2 = 1,
): LayoutConfig {
  return {
    charsPerLine: Math.max(1, Math.floor(charsPerLine)),
    linesPerPage: Math.max(1, Math.floor(linesPerPage)),
    columns: columns === 2 ? 2 : 1,
    writingMode: writingModeOf(layout),
    wrapMode: wrapModeOf(layout),
    fontFamily,
  };
}
