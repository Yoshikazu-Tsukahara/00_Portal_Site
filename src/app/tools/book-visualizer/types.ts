// AI クリエイターズ・DTP スタジオのデータ型と正規化処理
// すべてブラウザ内で完結し、サーバー送信は行わない
//
// 構造:
//   - body: 論理テキストブロック配列（断片化しない。表示は paginate.ts でスライス）
//   - bodyOverlays: 本文ページごとの自由配置（画像 / テキストボックス）。本文と重ねられる
//   - pages: 表紙・目次など固定ページ＋自由配置（画像 / 自由テキスト）
// 用紙サイズは固定。文字数・行数から font-size を逆算する

import {
  defaultFontFamilyForLayout,
  defaultLevelFonts,
  isBookFontId,
  type BookFontId,
} from "./fonts";
import { isPaperSizeId, type PaperSizeId } from "./paper";

/** バックアップ検証用のアプリ識別子（変更しないこと） */
export const APP_ID = "book-visualizer";

/** LocalStorage の保存キー */
export const STORAGE_KEY = "book-visualizer:v1";

/** 共有ファイル（.mybook）の形式識別子 */
export const MYBOOK_FORMAT = "my-toolbox-mybook";
export const MYBOOK_VERSION = 3;
export const MYBOOK_EXTENSION = ".mybook";

/**
 * 画像1枚あたりの上限（元ファイルのバイト数）。
 * Base64 は約 1.37 倍に膨らむため、LocalStorage が溢れないよう控えめにする。
 */
export const IMAGE_MAX_BYTES = 3 * 1024 * 1024;

/** レイアウトモード */
export type BookLayout = "japanese" | "western" | "photo";

export const BOOK_LAYOUTS: readonly BookLayout[] = [
  "japanese",
  "western",
  "photo",
];

/**
 * テキストの階層（本文が最小、上に章・節）。
 * h1=章 / h2=節 / p=本文
 */
export type TextLevel = "h1" | "h2" | "p";

export const TEXT_LEVELS: readonly TextLevel[] = ["h1", "h2", "p"];

/** 目次にどこまでの見出しを載せるか */
export type TocDepth = "chapter" | "section";

export const TOC_DEPTHS: readonly TocDepth[] = ["chapter", "section"];

/** 柱（ランニングヘッダー）に何を出すか */
export type HeaderMode = "title" | "chapter" | "none";

export const HEADER_MODES: readonly HeaderMode[] = [
  "title",
  "chapter",
  "none",
];

/** 見開き時、柱を左右のどちらに出すか */
export type SpreadHeaderPlacement = "both" | "left" | "right";

export const SPREAD_HEADER_PLACEMENTS: readonly SpreadHeaderPlacement[] = [
  "both",
  "left",
  "right",
];

/** 柱・ノンブルの横位置 */
export type ChromeAlign = "left" | "center" | "right";

export const CHROME_ALIGNS: readonly ChromeAlign[] = [
  "left",
  "center",
  "right",
];

/** ページの役割（表紙などはノンブル非表示が定石） */
export type PageType =
  | "standard"
  | "cover"
  | "backCover"
  | "titlePage"
  | "toc";

export const PAGE_TYPES: readonly PageType[] = [
  "standard",
  "cover",
  "backCover",
  "titlePage",
  "toc",
];

export type TextBlock = {
  id: string;
  type: "text";
  level: TextLevel;
  text: string;
};

/** 本文ストリーム内の手動ページ区切り */
export type BodyPageBreak = {
  id: string;
  type: "pageBreak";
};

/** 本文ストリームの要素 */
export type BodyItem = TextBlock | BodyPageBreak;

export function isBodyPageBreak(item: BodyItem): item is BodyPageBreak {
  return item.type === "pageBreak";
}

export function isBodyText(item: BodyItem): item is TextBlock {
  return item.type === "text";
}

/**
 * 自由配置枠（画像・自由テキスト共通）。
 * 用紙全体に対する相対値（0〜1）。
 */
export type FreeFrame = {
  x: number;
  y: number;
  w: number;
  h: number;
};

/** @deprecated FreeFrame と同義（既存コード互換） */
export type ImageFrame = FreeFrame;

/** 画像は必ず Base64 データ URL で持つ */
export type ImageBlock = {
  id: string;
  type: "image";
  dataUrl: string;
  caption: string;
  frame: FreeFrame;
  /** 重なり順（大きいほど手前） */
  zIndex: number;
};

/** 自由テキスト専用の書き方向（本文レイアウトとは独立） */
export type FreeTextWritingMode = "horizontal" | "vertical";

export const FREE_TEXT_WRITING_MODES: readonly FreeTextWritingMode[] = [
  "horizontal",
  "vertical",
];

/**
 * 本文グリッドとは独立した自由テキスト。
 * タイトル文字や帯コピー向け。
 */
export type FreeTextBlock = {
  id: string;
  type: "freeText";
  text: string;
  frame: FreeFrame;
  zIndex: number;
  /** 用紙短辺に対する相対フォントサイズ（0.02〜0.2 程度） */
  fontScale: number;
  /** 本文とは別設定の縦書き／横書き */
  writingMode: FreeTextWritingMode;
  /** このボックス固有の書体 */
  fontFamily: BookFontId;
};

export type Block = TextBlock | ImageBlock | FreeTextBlock;

/** 自由配置できるブロックか */
export function isFreeBlock(
  block: Block,
): block is ImageBlock | FreeTextBlock {
  return block.type === "image" || block.type === "freeText";
}

/**
 * 1 ページ（紙 1 枚）。
 * 本文テキストは body ストリームへ移した。ここには固定ページ用・自由配置のみ。
 */
export type BookPage = {
  id: string;
  pageType: PageType;
  blocks: Block[];
  /** @deprecated v3 で body の pageBreak へ移行。読み込み時のみ参照 */
  breakAfter?: boolean;
};

/** ページタイプごとの柱／ノンブル表示フラグ */
export type PageTypeFlags = Record<PageType, boolean>;

/** 組版設定（用紙は固定、文字数・行数から文字サイズを逆算） */
export type BookFormat = {
  /** 書籍タイプ（寸法・開き方のプリセット） */
  paperSize: PaperSizeId;
  /** 1 行の文字数 */
  charsPerLine: number;
  /** 1 段あたりの行数 */
  linesPerPage: number;
  /** 段組み */
  columns: 1 | 2;
  /** 上余白（px） */
  marginTop: number;
  /** 右余白（px） */
  marginRight: number;
  /** 下余白（px） */
  marginBottom: number;
  /** 左余白（px） */
  marginLeft: number;
  /** 柱（ヘッダー）の表示内容 */
  headerMode: HeaderMode;
  /** 柱の横位置 */
  headerAlign: ChromeAlign;
  /** ページタイプごとの柱表示 */
  headerOnPageTypes: PageTypeFlags;
  /** ページタイプごとのノンブル表示 */
  folioOnPageTypes: PageTypeFlags;
  /** ページタイプを総ページ数（ノンブル連番）に含めるか */
  countInTotalPageTypes: PageTypeFlags;
  /** 見開き時の柱の出し方（両ページ／左のみ／右のみ） */
  headerSpreadPlacement: SpreadHeaderPlacement;
  /** ノンブルの横位置 */
  folioAlign: ChromeAlign;
  /** 目次に載せる見出しの深さ（章のみ／章＋節） */
  tocDepth: TocDepth;
  /**
   * 目次専用の段組み（本文の columns とは独立）。
   * 1=1 段、2=2 段（縦書き・横書きとも同じ指定。溢れはページ分割で吸収）。
   */
  tocColumns: 1 | 2;
  /** 章（h1）の書体 */
  fontFamilyH1: BookFontId;
  /** 節（h2）の書体 */
  fontFamilyH2: BookFontId;
  /** 本文（p）の書体 */
  fontFamilyP: BookFontId;
};

export const FORMAT_LIMITS = {
  charsPerLine: { min: 8, max: 60 },
  linesPerPage: { min: 4, max: 40 },
  /** 余白（キャンバス px） */
  margin: { min: 8, max: 200 },
} as const;

/** AI への指示メモ（エディター専用。共有ファイルには含めない） */
export type PromptMemo = {
  id: string;
  title: string;
  body: string;
};

/**
 * 本文ページごとの自由配置。
 * index = 本文カラム番号。各要素は image / freeText のみ。
 */
export type BodyOverlays = Block[][];

/** 1 冊分の本のデータ（= .mybook の中身） */
export type BookData = {
  title: string;
  author: string;
  layout: BookLayout;
  format: BookFormat;
  /** 本文ストリーム（ページまたぎは CSS columns。断片化しない） */
  body: BodyItem[];
  /**
   * 本文ページ上の自由配置（画像・テキストボックス）。
   * 本文テキストと重ねて表示でき、レイヤーで前後を入れ替えられる。
   */
  bodyOverlays: BodyOverlays;
  /** 表紙・目次など＋自由配置ブロック */
  pages: BookPage[];
};

/** LocalStorage に保存するスタジオ全体の状態 */
export type StudioData = {
  book: BookData;
  prompts: PromptMemo[];
};

/** 衝突しにくい ID を作る */
export function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function createTextBlock(
  level: TextLevel = "p",
  text = "",
): TextBlock {
  return { id: createId("bk"), type: "text", level, text };
}

export function createPageBreak(): BodyPageBreak {
  return { id: createId("br"), type: "pageBreak" };
}

/**
 * Word と同様、指定ブロックの文字位置で本文を分割し、ページ区切りを挿入する。
 * 区切りの直後には必ず続き用ブロックを置く（空でも次ページの受け皿になる）。
 */
export function applyPageBreakAtCaret(
  body: BodyItem[],
  blockId: string,
  offset: number,
): { body: BodyItem[]; focusId: string } | null {
  const idx = body.findIndex(
    (item) => item.type === "text" && item.id === blockId,
  );
  if (idx < 0) return null;

  const block = body[idx];
  if (!block || block.type !== "text") return null;

  const text = block.text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const at = Math.max(0, Math.min(text.length, Math.floor(offset)));
  const next = body.slice();

  // 先頭にキャレット → 空ブロックを残さず、このブロックごと次ページへ送る
  if (at === 0) {
    next.splice(idx, 0, createPageBreak());
    return { body: next, focusId: block.id };
  }

  const leftBlock: TextBlock = { ...block, text: text.slice(0, at) };
  const rightBlock = createTextBlock(block.level, text.slice(at));
  next.splice(idx, 1, leftBlock, createPageBreak(), rightBlock);
  return { body: next, focusId: rightBlock.id };
}

/**
 * 指定した本文ページの直後に、空白の本文ページを 1 枚差し込む。
 * （アウトラインの「次のページを追加」用）
 */
export function insertBlankPageAfterBodyColumn(
  body: BodyItem[],
  bodyPages: {
    slices: { blockId: string; start: number; end: number }[];
    manualBreakId?: string;
  }[],
  columnIndex: number,
): { body: BodyItem[]; focusId: string } | null {
  if (columnIndex < 0 || columnIndex >= bodyPages.length) return null;
  const page = bodyPages[columnIndex];
  if (!page) return null;

  const empty = createTextBlock("p", "");
  const hasText = (blockId: string) =>
    body.some((item) => item.type === "text" && item.id === blockId);

  // すでに手動区切りで終わっている → その直後に空ページを挟む
  if (page.manualBreakId) {
    const breakIndex = body.findIndex(
      (item) => item.type === "pageBreak" && item.id === page.manualBreakId,
    );
    if (breakIndex < 0) return null;
    const next = body.slice();
    if (breakIndex + 1 < body.length) {
      next.splice(breakIndex + 1, 0, empty, createPageBreak());
    } else {
      next.splice(breakIndex + 1, 0, empty);
    }
    return { body: next, focusId: empty.id };
  }

  const lastSlice = [...page.slices]
    .reverse()
    .find((slice) => hasText(slice.blockId));

  // 中身のない本文ページ：次ページ先頭の手前、なければ末尾へ
  if (!lastSlice) {
    const nextFirst = bodyPages[columnIndex + 1]?.slices.find((slice) =>
      hasText(slice.blockId),
    );
    if (!nextFirst) {
      return {
        body: [...body, createPageBreak(), empty],
        focusId: empty.id,
      };
    }
    const idx = body.findIndex(
      (item) => item.type === "text" && item.id === nextFirst.blockId,
    );
    if (idx < 0) return null;
    const next = body.slice();
    if (nextFirst.start <= 0) {
      next.splice(idx, 0, empty, createPageBreak());
      return { body: next, focusId: empty.id };
    }
    const block = next[idx];
    if (!block || block.type !== "text") return null;
    const text = block.text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const at = Math.min(text.length, nextFirst.start);
    next.splice(
      idx,
      1,
      { ...block, text: text.slice(0, at) },
      createPageBreak(),
      empty,
      createPageBreak(),
      createTextBlock(block.level, text.slice(at)),
    );
    return { body: next, focusId: empty.id };
  }

  const idx = body.findIndex(
    (item) => item.type === "text" && item.id === lastSlice.blockId,
  );
  if (idx < 0) return null;
  const block = body[idx];
  if (!block || block.type !== "text") return null;

  const text = block.text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const at = Math.max(0, Math.min(text.length, lastSlice.end));
  const next = body.slice();
  const rightText = text.slice(at);
  const hasFollowing = rightText.length > 0 || idx + 1 < body.length;

  // 空スライスだけで終わっているページ → そのブロックの直後へ差し込む
  if (at === 0) {
    const insert: BodyItem[] = [createPageBreak(), empty];
    if (idx + 1 < body.length) insert.push(createPageBreak());
    next.splice(idx + 1, 0, ...insert);
    return { body: next, focusId: empty.id };
  }

  const parts: BodyItem[] = [
    { ...block, text: text.slice(0, at) },
    createPageBreak(),
    empty,
  ];
  if (hasFollowing) parts.push(createPageBreak());
  if (rightText.length > 0) {
    parts.push(createTextBlock(block.level, rightText));
  }
  next.splice(idx, 1, ...parts);
  return { body: next, focusId: empty.id };
}

/**
 * 本文の仮想ページを削除する。
 * - 直前ページが手動区切りで終わっていれば、その区切りを外して合流
 * - そうでなければ、そのページ上に載っている文字範囲を本文から削る
 */
export function removeBodyColumn(
  body: BodyItem[],
  bodyPages: {
    slices: { blockId: string; start: number; end: number }[];
    manualBreakId?: string;
  }[],
  columnIndex: number,
): { body: BodyItem[]; focusId: string; focusOffset: number } | null {
  if (columnIndex < 0 || columnIndex >= bodyPages.length) return null;

  const prev = columnIndex > 0 ? bodyPages[columnIndex - 1] : undefined;
  if (prev?.manualBreakId) {
    return removePageBreakMerging(body, prev.manualBreakId);
  }

  const page = bodyPages[columnIndex];
  if (!page || page.slices.length === 0) return null;

  const rangesByBlock = new Map<string, { start: number; end: number }[]>();
  for (const slice of page.slices) {
    if (slice.end <= slice.start) continue;
    const list = rangesByBlock.get(slice.blockId) ?? [];
    list.push({ start: slice.start, end: slice.end });
    rangesByBlock.set(slice.blockId, list);
  }
  if (rangesByBlock.size === 0) return null;

  const firstSlice = page.slices.find((slice) => slice.end > slice.start);
  let focusId = firstSlice?.blockId ?? "";
  let focusOffset = firstSlice?.start ?? 0;

  const next = body.map((item) => {
    if (item.type !== "text") return item;
    const ranges = rangesByBlock.get(item.id);
    if (!ranges || ranges.length === 0) return item;
    ranges.sort((a, b) => b.start - a.start);
    let text = item.text;
    for (const range of ranges) {
      text = text.slice(0, range.start) + text.slice(range.end);
    }
    if (item.id === focusId) {
      const earliest = Math.min(...ranges.map((range) => range.start));
      focusOffset = Math.max(0, Math.min(earliest, text.length));
    }
    return { ...item, text };
  });

  return { body: next, focusId, focusOffset };
}

/**
 * 手動ページ区切りを削除する。
 * 前後が本文ブロックなら 1 つに結合し、結合位置のオフセットを返す
 * （Word で次ページ先頭の Backspace したときの動きに相当）。
 */
export function removePageBreakMerging(
  body: BodyItem[],
  breakId: string,
): { body: BodyItem[]; focusId: string; focusOffset: number } | null {
  const breakIndex = body.findIndex(
    (item) => item.type === "pageBreak" && item.id === breakId,
  );
  if (breakIndex < 0) return null;

  const prev = body[breakIndex - 1];
  const next = body[breakIndex + 1];
  const result = body.slice();

  if (
    prev &&
    next &&
    prev.type === "text" &&
    next.type === "text"
  ) {
    const mergedText =
      prev.text.replace(/\r\n/g, "\n").replace(/\r/g, "\n") +
      next.text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const focusOffset = prev.text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
      .length;
    const merged: TextBlock = { ...prev, text: mergedText };
    result.splice(breakIndex - 1, 3, merged);
    return { body: result, focusId: merged.id, focusOffset };
  }

  result.splice(breakIndex, 1);
  if (next && next.type === "text") {
    return { body: result, focusId: next.id, focusOffset: 0 };
  }
  if (prev && prev.type === "text") {
    const text = prev.text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    return { body: result, focusId: prev.id, focusOffset: text.length };
  }
  return { body: result, focusId: "", focusOffset: 0 };
}

/**
 * 柱を設定できるのは本文（標準）ページだけ。
 * 表紙・裏表紙・扉・目次などには柱を出さない。
 */
export function canShowHeaderOnPageType(pageType: PageType): boolean {
  return pageType === "standard";
}

/** 柱の既定（本文以外は出さない） */
export function defaultHeaderOnPageTypes(): PageTypeFlags {
  return {
    standard: true,
    cover: false,
    backCover: false,
    titlePage: false,
    toc: false,
  };
}

/** ノンブルの既定（表紙・裏表紙は出さない） */
export function defaultFolioOnPageTypes(): PageTypeFlags {
  return {
    standard: true,
    cover: false,
    backCover: false,
    titlePage: true,
    toc: true,
  };
}

/** 総ページ数カウントの既定（表紙・裏表紙は含めない） */
export function defaultCountInTotalPageTypes(): PageTypeFlags {
  return {
    standard: true,
    cover: false,
    backCover: false,
    titlePage: true,
    toc: true,
  };
}

/** 本で実際に使われているページタイプ（定義順） */
export function usedPageTypes(pages: BookPage[]): PageType[] {
  const used = new Set(pages.map((page) => page.pageType));
  return PAGE_TYPES.filter((type) => used.has(type));
}

/** そのページタイプで柱を出すか（本文以外／headerMode が none なら常に否） */
export function isHeaderOnPageType(
  format: BookFormat,
  pageType: PageType,
): boolean {
  if (format.headerMode === "none") return false;
  if (!canShowHeaderOnPageType(pageType)) return false;
  return format.headerOnPageTypes[pageType] ?? defaultHeaderOnPageTypes()[pageType];
}

/** そのページタイプでノンブルを出すか */
export function isFolioOnPageType(
  format: BookFormat,
  pageType: PageType,
): boolean {
  return format.folioOnPageTypes[pageType] ?? defaultFolioOnPageTypes()[pageType];
}

/** そのページタイプを総ページ数に含めるか */
export function isCountedInTotal(
  format: BookFormat,
  pageType: PageType,
): boolean {
  return (
    format.countInTotalPageTypes[pageType] ??
    defaultCountInTotalPageTypes()[pageType]
  );
}

function asSpreadHeaderPlacement(value: unknown): SpreadHeaderPlacement {
  return SPREAD_HEADER_PLACEMENTS.includes(value as SpreadHeaderPlacement)
    ? (value as SpreadHeaderPlacement)
    : "both";
}

/** 新規画像の初期配置（用紙中央やや上） */
export function defaultImageFrame(): FreeFrame {
  return { x: 0.18, y: 0.22, w: 0.45, h: 0.38 };
}

/** 新規自由テキストの初期配置 */
export function defaultFreeTextFrame(): FreeFrame {
  return { x: 0.15, y: 0.2, w: 0.7, h: 0.2 };
}

/**
 * ページ内の自由オブジェクトの次の zIndex。
 * 本文プレーン（0）より手前側に積む。
 */
export function nextZIndex(blocks: Block[]): number {
  let max = 0;
  for (const block of blocks) {
    if (isFreeBlock(block)) max = Math.max(max, block.zIndex);
  }
  return max + 1;
}

/** 本文オーバーレイ配列をページ数に合わせる（不足は空、余剰は切り捨て） */
export function syncBodyOverlays(
  overlays: BodyOverlays,
  pageCount: number,
): BodyOverlays {
  const n = Math.max(0, Math.floor(pageCount));
  const next = overlays
    .slice(0, n)
    .map((blocks) => blocks.filter(isFreeBlock));
  while (next.length < n) next.push([]);
  return next;
}

/** 指定本文ページの直後に空のオーバーレイ枠を挿入 */
export function insertBodyOverlaySlot(
  overlays: BodyOverlays,
  afterColumnIndex: number,
): BodyOverlays {
  const base = syncBodyOverlays(
    overlays,
    Math.max(overlays.length, afterColumnIndex + 1),
  );
  const next = base.slice();
  next.splice(Math.max(0, afterColumnIndex + 1), 0, []);
  return next;
}

/** 指定本文ページのオーバーレイ枠を削除 */
export function removeBodyOverlaySlot(
  overlays: BodyOverlays,
  columnIndex: number,
): BodyOverlays {
  if (columnIndex < 0 || columnIndex >= overlays.length) return overlays;
  return overlays.filter((_, index) => index !== columnIndex);
}

/** 1 本文ページ分の自由配置を取り出す */
export function bodyOverlayBlocks(
  overlays: BodyOverlays | undefined,
  columnIndex: number,
): Block[] {
  if (!overlays || columnIndex < 0) return [];
  return (overlays[columnIndex] ?? []).filter(isFreeBlock);
}

export function createImageBlock(
  dataUrl: string,
  zIndex = 1,
): ImageBlock {
  return {
    id: createId("bk"),
    type: "image",
    dataUrl,
    caption: "",
    frame: defaultImageFrame(),
    zIndex,
  };
}

export function createFreeTextBlock(
  text = "",
  zIndex = 1,
  writingMode: FreeTextWritingMode = "horizontal",
  fontFamily: BookFontId = defaultFontFamilyForLayout("japanese"),
): FreeTextBlock {
  return {
    id: createId("bk"),
    type: "freeText",
    text,
    frame: defaultFreeTextFrame(),
    zIndex,
    fontScale: 0.06,
    writingMode,
    fontFamily,
  };
}

/** フルブリード（余白ゼロで用紙全体） */
export function fullBleedFrame(): FreeFrame {
  return { x: 0, y: 0, w: 1, h: 1 };
}

/** 見開きに組まず、常に単ページで見せるタイプ（表紙・裏表紙） */
export function isSoloSpreadPageType(pageType: PageType): boolean {
  return pageType === "cover" || pageType === "backCover";
}

/** 作品内で1ページしか持てないタイプ（表紙・裏表紙） */
export function isUniquePageType(pageType: PageType): boolean {
  return pageType === "cover" || pageType === "backCover";
}

/**
 * 他ページがすでにそのユニークタイプを使っているか。
 * exceptPageId を渡すと、そのページ自身は除外する。
 */
export function isUniquePageTypeTaken(
  pages: BookPage[],
  pageType: PageType,
  exceptPageId?: string,
): boolean {
  if (!isUniquePageType(pageType)) return false;
  return pages.some(
    (page) =>
      page.pageType === pageType &&
      (exceptPageId === undefined || page.id !== exceptPageId),
  );
}

/**
 * 表紙・裏表紙の重複を解消する（先に現れた1枚だけ残し、以降は標準へ）。
 */
export function dedupeUniquePageTypes(pages: BookPage[]): BookPage[] {
  const seen = new Set<PageType>();
  return pages.map((page) => {
    if (!isUniquePageType(page.pageType)) return page;
    if (seen.has(page.pageType)) {
      const blocks =
        page.blocks.length > 0
          ? page.blocks
          : defaultBlocksForPageType("standard");
      return { ...page, pageType: "standard", blocks, breakAfter: undefined };
    }
    seen.add(page.pageType);
    return page;
  });
}

/**
 * 表紙は全体の先頭、裏表紙は全体の末尾へ並べる。
 * 途中にあっても正規化で端へ戻す（省略可・必須ではない）。
 */
export function normalizeCoverPageOrder(pages: BookPage[]): BookPage[] {
  let cover: BookPage | null = null;
  let backCover: BookPage | null = null;
  const middle: BookPage[] = [];

  for (const page of pages) {
    if (page.pageType === "cover") {
      if (!cover) {
        cover = page;
      } else {
        middle.push({
          ...page,
          pageType: "standard",
          blocks:
            page.blocks.length > 0
              ? page.blocks
              : defaultBlocksForPageType("standard"),
          breakAfter: undefined,
        });
      }
      continue;
    }
    if (page.pageType === "backCover") {
      if (!backCover) {
        backCover = page;
      } else {
        middle.push({
          ...page,
          pageType: "standard",
          blocks:
            page.blocks.length > 0
              ? page.blocks
              : defaultBlocksForPageType("standard"),
          breakAfter: undefined,
        });
      }
      continue;
    }
    middle.push(page);
  }

  return [
    ...(cover ? [cover] : []),
    ...middle,
    ...(backCover ? [backCover] : []),
  ];
}

/**
 * 表紙／裏表紙をこのページに設定してよいか。
 * - 表紙: いま先頭の固定ページだけ（なくてもよい）
 * - 裏表紙: 表紙以外なら可（正規化で必ず全体末尾へ移す。本文の後ろ）
 */
export function canAssignCoverOrBackCover(
  pageType: PageType,
  pageId: string,
  pages: BookPage[],
): boolean {
  if (pageType !== "cover" && pageType !== "backCover") return true;
  if (pages.length === 0) return false;

  const self = pages.find((page) => page.id === pageId);
  if (!self) return false;
  // 既にそのタイプなら維持できる
  if (self.pageType === pageType) return true;
  if (isUniquePageTypeTaken(pages, pageType, pageId)) return false;

  if (pageType === "cover") {
    // 先頭（裏表紙を除く最初）だけが表紙にできる
    const first = pages.find((page) => page.pageType !== "backCover");
    return first?.id === pageId;
  }

  // 裏表紙は表紙ページ以外から設定可 → 必ず末尾に配置される
  return self.pageType !== "cover";
}

/** ページタイプごとの初期ブロック（本文は body 側。ページは空でよい） */
export function defaultBlocksForPageType(_pageType: PageType): Block[] {
  return [];
}

/** 中身のないプレースホルダー本文ブロックか */
export function isEmptyPlaceholderText(block: Block): boolean {
  return block.type === "text" && block.text.trim() === "";
}

export function createPage(
  blocks?: Block[],
  pageType: PageType = "standard",
): BookPage {
  return {
    id: createId("pg"),
    pageType,
    blocks: blocks ?? defaultBlocksForPageType(pageType),
  };
}

export function createPromptMemo(): PromptMemo {
  return { id: createId("pr"), title: "", body: "" };
}

export function defaultFormat(layout: BookLayout = "japanese"): BookFormat {
  const fonts = defaultLevelFonts(layout);
  return {
    paperSize: "bunko",
    charsPerLine: 30,
    linesPerPage: 14,
    columns: 1,
    marginTop: 36,
    marginRight: 36,
    marginBottom: 36,
    marginLeft: 36,
    headerMode: "title",
    headerAlign: "center",
    headerOnPageTypes: defaultHeaderOnPageTypes(),
    folioOnPageTypes: defaultFolioOnPageTypes(),
    countInTotalPageTypes: defaultCountInTotalPageTypes(),
    headerSpreadPlacement: "both",
    folioAlign: "center",
    tocDepth: "section",
    tocColumns: 1,
    fontFamilyH1: fonts.h1,
    fontFamilyH2: fonts.h2,
    fontFamilyP: fonts.p,
  };
}

function asTocDepth(value: unknown): TocDepth {
  return value === "chapter" ? "chapter" : "section";
}

export function emptyBook(): BookData {
  return {
    title: "",
    author: "",
    layout: "japanese",
    format: defaultFormat(),
    body: [createTextBlock()],
    bodyOverlays: [],
    pages: [],
  };
}

export function emptyStudio(): StudioData {
  return { book: emptyBook(), prompts: [] };
}

/** ブロックに中身があるか */
export function isBlockFilled(block: Block): boolean {
  if (block.type === "image") return true;
  if (block.type === "freeText") return block.text.trim() !== "";
  return block.text.trim() !== "";
}

function asPageType(value: unknown): PageType {
  return PAGE_TYPES.includes(value as PageType)
    ? (value as PageType)
    : "standard";
}

/** 本文ストリームに読める文字があるか */
export function bodyHasText(body: BodyItem[]): boolean {
  return body.some(
    (item) => item.type === "text" && item.text.trim() !== "",
  );
}

/** 読める中身（本文か画像）があるか */
export function hasReadableContent(book: BookData): boolean {
  return (
    bodyHasText(book.body) ||
    book.pages.some((page) => page.blocks.some(isBlockFilled)) ||
    book.bodyOverlays.some((blocks) => blocks.some(isBlockFilled))
  );
}

/** 本に中身があるか（下書き復帰の判定用） */
export function hasBookContent(book: BookData): boolean {
  return (
    book.title.trim() !== "" ||
    book.author.trim() !== "" ||
    bodyHasText(book.body) ||
    book.pages.some((page) => page.blocks.some(isBlockFilled)) ||
    book.bodyOverlays.some((blocks) => blocks.some(isBlockFilled))
  );
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asLayout(value: unknown): BookLayout {
  return BOOK_LAYOUTS.includes(value as BookLayout)
    ? (value as BookLayout)
    : "japanese";
}

function asLevel(value: unknown): TextLevel {
  return TEXT_LEVELS.includes(value as TextLevel) ? (value as TextLevel) : "p";
}

function asHeaderMode(value: unknown): HeaderMode {
  return HEADER_MODES.includes(value as HeaderMode)
    ? (value as HeaderMode)
    : "title";
}

function asChromeAlign(value: unknown, fallback: ChromeAlign): ChromeAlign {
  return CHROME_ALIGNS.includes(value as ChromeAlign)
    ? (value as ChromeAlign)
    : fallback;
}

/** 0〜1 に丸める（壊れた frame を安全にする） */
function asUnit(value: unknown, fallback: number): number {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(1, Math.max(0, num));
}

function normalizeFrame(raw: unknown, fallback?: FreeFrame): FreeFrame {
  const base = fallback ?? defaultImageFrame();
  if (!raw || typeof raw !== "object") return base;
  const obj = raw as Record<string, unknown>;
  const w = Math.max(0.05, asUnit(obj.w, base.w));
  const h = Math.max(0.05, asUnit(obj.h, base.h));
  return {
    x: Math.min(1 - w, asUnit(obj.x, base.x)),
    y: Math.min(1 - h, asUnit(obj.y, base.y)),
    w,
    h,
  };
}

function normalizeZIndex(value: unknown, fallback: number): number {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  // 負値＝本文より背面、正値＝本文より前面（0 は本文プレーン）
  return Math.max(-9999, Math.min(9999, Math.round(num)));
}

function normalizeBodyOverlays(raw: unknown): BodyOverlays {
  if (!Array.isArray(raw)) return [];
  return raw.map((entry) => {
    if (!Array.isArray(entry)) return [];
    let z = 1;
    const blocks: Block[] = [];
    for (const item of entry) {
      const block = normalizeBlock(item, z);
      if (!block || !isFreeBlock(block)) continue;
      blocks.push(block);
      z = Math.max(z, Math.abs(block.zIndex)) + 1;
    }
    return blocks;
  });
}

/** 数値を範囲内に丸める（壊れた設定で版面が破綻しないように） */
export function clampNumber(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
): number {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, Math.round(num)));
}

/** 画像として安全に扱えるデータ URL だけ通す（外部 URL は弾く） */
function asImageDataUrl(value: unknown): string {
  const raw = asString(value);
  return /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(raw) ? raw : "";
}

function normalizeFormat(raw: unknown, layout: BookLayout = "japanese"): BookFormat {
  const base = defaultFormat(layout);
  if (!raw || typeof raw !== "object") return base;
  const obj = raw as Record<string, unknown>;
  return {
    paperSize: isPaperSizeId(obj.paperSize) ? obj.paperSize : base.paperSize,
    charsPerLine: clampNumber(
      obj.charsPerLine,
      FORMAT_LIMITS.charsPerLine.min,
      FORMAT_LIMITS.charsPerLine.max,
      base.charsPerLine,
    ),
    linesPerPage: clampNumber(
      obj.linesPerPage,
      FORMAT_LIMITS.linesPerPage.min,
      FORMAT_LIMITS.linesPerPage.max,
      base.linesPerPage,
    ),
    columns: obj.columns === 2 ? 2 : 1,
    marginTop: clampNumber(
      obj.marginTop,
      FORMAT_LIMITS.margin.min,
      FORMAT_LIMITS.margin.max,
      base.marginTop,
    ),
    marginRight: clampNumber(
      obj.marginRight,
      FORMAT_LIMITS.margin.min,
      FORMAT_LIMITS.margin.max,
      base.marginRight,
    ),
    marginBottom: clampNumber(
      obj.marginBottom,
      FORMAT_LIMITS.margin.min,
      FORMAT_LIMITS.margin.max,
      base.marginBottom,
    ),
    marginLeft: clampNumber(
      obj.marginLeft,
      FORMAT_LIMITS.margin.min,
      FORMAT_LIMITS.margin.max,
      base.marginLeft,
    ),
    headerMode: asHeaderMode(obj.headerMode),
    headerAlign: asChromeAlign(obj.headerAlign, base.headerAlign),
    headerOnPageTypes: (() => {
      const flags = normalizePageTypeFlags(
        obj.headerOnPageTypes,
        base.headerOnPageTypes,
      );
      // 旧データで目次などに柱 ON があっても本文以外は無効化する
      for (const type of PAGE_TYPES) {
        if (!canShowHeaderOnPageType(type)) flags[type] = false;
      }
      return flags;
    })(),
    folioOnPageTypes: normalizePageTypeFlags(
      obj.folioOnPageTypes,
      // 旧 showFolio:false は全タイプ非表示へ移行
      obj.showFolio === false
        ? {
            standard: false,
            cover: false,
            backCover: false,
            titlePage: false,
            toc: false,
          }
        : base.folioOnPageTypes,
    ),
    countInTotalPageTypes: normalizePageTypeFlags(
      obj.countInTotalPageTypes,
      base.countInTotalPageTypes,
    ),
    headerSpreadPlacement: asSpreadHeaderPlacement(obj.headerSpreadPlacement),
    folioAlign: asChromeAlign(obj.folioAlign, base.folioAlign),
    tocDepth: asTocDepth(obj.tocDepth),
    tocColumns: obj.tocColumns === 2 ? 2 : 1,
    // 旧単一 fontFamily は 3 階層すべてへ引き継ぐ
    ...(() => {
      const legacy = isBookFontId(obj.fontFamily) ? obj.fontFamily : null;
      return {
        fontFamilyH1: isBookFontId(obj.fontFamilyH1)
          ? obj.fontFamilyH1
          : (legacy ?? base.fontFamilyH1),
        fontFamilyH2: isBookFontId(obj.fontFamilyH2)
          ? obj.fontFamilyH2
          : (legacy ?? base.fontFamilyH2),
        fontFamilyP: isBookFontId(obj.fontFamilyP)
          ? obj.fontFamilyP
          : (legacy ?? base.fontFamilyP),
      };
    })(),
  };
}

function normalizePageTypeFlags(
  raw: unknown,
  fallback: PageTypeFlags,
): PageTypeFlags {
  const src =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const next = { ...fallback };
  for (const type of PAGE_TYPES) {
    if (typeof src[type] === "boolean") next[type] = src[type];
  }
  return next;
}

function normalizeBlock(raw: unknown, zFallback = 1): Block | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const id = asString(obj.id) || createId("bk");

  if (obj.type === "image") {
    const dataUrl = asImageDataUrl(obj.dataUrl);
    if (!dataUrl) return null;
    return {
      id,
      type: "image",
      dataUrl,
      caption: asString(obj.caption),
      frame: normalizeFrame(obj.frame),
      zIndex: normalizeZIndex(obj.zIndex, zFallback),
    };
  }

  if (obj.type === "freeText") {
    const rawScale =
      typeof obj.fontScale === "number" ? obj.fontScale : Number(obj.fontScale);
    const fontScale = Number.isFinite(rawScale) ? rawScale : 0.06;
    const writingMode: FreeTextWritingMode =
      obj.writingMode === "vertical" ? "vertical" : "horizontal";
    return {
      id,
      type: "freeText",
      text: asString(obj.text),
      frame: normalizeFrame(obj.frame, defaultFreeTextFrame()),
      zIndex: normalizeZIndex(obj.zIndex, zFallback),
      fontScale: Math.min(0.2, Math.max(0.02, fontScale)),
      writingMode,
      fontFamily: isBookFontId(obj.fontFamily)
        ? obj.fontFamily
        : defaultFontFamilyForLayout("japanese"),
    };
  }

  return {
    id,
    type: "text",
    level: asLevel(obj.level),
    text: asString(obj.text),
  };
}

/** 旧またぎ片 ID から先頭 ID を取り出す（移行専用） */
function legacyLogicalRootId(blockId: string): string {
  const matched = /^(.*)__c\d+$/.exec(blockId);
  return matched ? matched[1] : blockId;
}

/**
 * ページ上の旧テキスト＋breakAfter を body ストリームへ移す。
 * continues / __cN は同一段落へ結合する。
 */
function migratePagesToBody(pages: BookPage[]): {
  body: BodyItem[];
  pages: BookPage[];
} {
  const body: BodyItem[] = [];
  const nextPages: BookPage[] = [];

  for (const page of pages) {
    const freeOnly = page.blocks.filter((block) => block.type !== "text");
    const texts = page.blocks.filter(
      (block): block is TextBlock => block.type === "text",
    );

    for (const block of texts) {
      const rootId = legacyLogicalRootId(block.id);
      const isContinuation = /__c\d+$/.test(block.id);

      if (!isContinuation) {
        body.push({
          id: rootId,
          type: "text",
          level: block.level,
          text: block.text,
        });
        continue;
      }

      let merged = false;
      for (let i = body.length - 1; i >= 0; i -= 1) {
        const prev = body[i];
        if (prev.type === "pageBreak") break;
        if (prev.type !== "text") break;
        if (prev.id !== rootId || prev.level !== block.level) break;
        body[i] = { ...prev, text: prev.text + block.text };
        merged = true;
        break;
      }
      if (!merged) {
        body.push({
          id: rootId,
          type: "text",
          level: block.level,
          text: block.text,
        });
      }
    }

    if (page.breakAfter) {
      body.push(createPageBreak());
    }

    // 固定ページ、または自由配置が残る標準ページだけ残す
    if (page.pageType !== "standard" || freeOnly.length > 0) {
      nextPages.push({
        id: page.id,
        pageType: page.pageType,
        blocks: freeOnly,
      });
    }
  }

  return {
    body: body.length > 0 ? body : [createTextBlock()],
    pages: nextPages,
  };
}

function normalizeBodyItem(raw: unknown): BodyItem | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (obj.type === "pageBreak") {
    return {
      id: asString(obj.id) || createId("br"),
      type: "pageBreak",
    };
  }
  if (obj.type === "text" || obj.level || obj.text !== undefined) {
    return {
      id: asString(obj.id) || createId("bk"),
      type: "text",
      level: asLevel(obj.level),
      text: asString(obj.text),
    };
  }
  return null;
}

/**
 * ページ 1 枚を整える。
 * v1（ページ自体がテキスト／画像だった形式）は 1 ブロックのページへ包み直す。
 */
function normalizePage(raw: unknown): BookPage | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const id = asString(obj.id) || createId("pg");

  const pageType = asPageType(obj.pageType);

  if (Array.isArray(obj.blocks)) {
    let z = 1;
    const blocks = obj.blocks
      .map((raw) => {
        const block = normalizeBlock(raw, z);
        if (block && isFreeBlock(block)) z = Math.max(z, block.zIndex) + 1;
        return block;
      })
      .filter((block): block is Block => block !== null);
    return {
      id,
      pageType,
      blocks,
      breakAfter: obj.breakAfter === true ? true : undefined,
    };
  }

  // v1 からの移行：見出し付きの本文は「見出しブロック + 本文ブロック」に分ける
  if (obj.type === "image") {
    const block = normalizeBlock(obj);
    return block ? { id, pageType, blocks: [block] } : null;
  }
  if (obj.type === "text") {
    const blocks: Block[] = [];
    const heading = asString(obj.heading);
    if (heading) blocks.push(createTextBlock("h2", heading));
    blocks.push(createTextBlock("p", asString(obj.text)));
    return { id, pageType, blocks };
  }

  return null;
}

/** 未知の入力（読み込んだファイル等）を BookData に整える */
export function normalizeBook(raw: unknown): BookData {
  if (!raw || typeof raw !== "object") return emptyBook();
  const obj = raw as Record<string, unknown>;
  const pages = Array.isArray(obj.pages)
    ? obj.pages
        .map(normalizePage)
        .filter((page): page is BookPage => page !== null)
    : [];

  const explicitBody = Array.isArray(obj.body)
    ? obj.body
        .map(normalizeBodyItem)
        .filter((item): item is BodyItem => item !== null)
    : null;

  let body: BodyItem[];
  let nextPages: BookPage[];

  if (explicitBody && explicitBody.length > 0) {
    // v3: body がある。ページ上の残存 text は捨て、free のみ残す
    body = explicitBody;
    nextPages = pages.map((page) => ({
      ...page,
      blocks: page.blocks.filter((block) => block.type !== "text"),
      breakAfter: undefined,
    }));
  } else {
    // v2 以前: ページ上の text を body へ移行
    const migrated = migratePagesToBody(
      pages.length > 0 ? pages : [createPage()],
    );
    body = migrated.body;
    nextPages = migrated.pages;
  }

  const layout = asLayout(obj.layout);
  return {
    title: asString(obj.title),
    author: asString(obj.author),
    layout,
    format: normalizeFormat(obj.format, layout),
    body,
    bodyOverlays: normalizeBodyOverlays(obj.bodyOverlays),
    pages: normalizeCoverPageOrder(dedupeUniquePageTypes(nextPages)),
  };
}

function normalizePrompt(raw: unknown): PromptMemo | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  return {
    id: asString(obj.id) || createId("pr"),
    title: asString(obj.title),
    body: asString(obj.body),
  };
}

/** 未知の入力（バックアップ等）を StudioData に整える */
export function normalizeStudio(raw: unknown): StudioData {
  if (!raw || typeof raw !== "object") return emptyStudio();
  const obj = raw as Record<string, unknown>;
  const prompts = Array.isArray(obj.prompts)
    ? obj.prompts
        .map(normalizePrompt)
        .filter((memo): memo is PromptMemo => memo !== null)
    : [];

  return { book: normalizeBook(obj.book), prompts };
}
