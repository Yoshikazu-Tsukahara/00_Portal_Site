// 目次ページ用：章見出しとノンブルの収集、段組・複数ページ分割

import { buildOutline, resolveOutlineFolio } from "./outline";
import { firstBodyPageIndexByBlock, type PaginatedPage } from "./paginate";
import { isRightBound, type PaperSizeId } from "./paper";
import {
  createPage,
  normalizeCoverPageOrder,
  type BookData,
  type BookPage,
  type TextLevel,
} from "./types";

export type TocEntry = {
  /** 見出しブロックの id */
  id: string;
  level: Extract<TextLevel, "h1" | "h2">;
  title: string;
  /** ノンブル（総数対象外ページは null） */
  folio: number | null;
  /** アウトライン上の index（ジャンプ用） */
  pageIndex: number;
  /** 本文ページの 0 始まり番号 */
  bodyPageIndex: number;
};

/** 目次の見た目バリエーション（書籍タイプ／組版から決める） */
export type TocVisualStyle = "japanese" | "western" | "photo";

/** 目次 1 ページ分のスライス */
export type TocPageSlice = {
  /** 目次ページ連番（0 始まり） */
  tocIndex: number;
  /** このページに載せる項目（読み順） */
  entries: TocEntry[];
  /**
   * 段ごとの項目。
   * columns=1 なら length 1。columns=2 なら [先に読む段, 後の段]。
   */
  columns: TocEntry[][];
};

/**
 * 本文ストリーム中の章（h1）／節（h2）を出現順に集める。
 * ノンブルは各見出しが最初に載る本文ページから算出し、
 * 本文を編集してページ分割が変わると自動で追従する。
 */
export function collectTocEntries(
  book: BookData,
  bodyPages: PaginatedPage[],
): TocEntry[] {
  const entries: TocEntry[] = [];
  const includeSection = book.format.tocDepth !== "chapter";
  const pageCount = Math.max(1, bodyPages.length);
  const outline = buildOutline(book, pageCount);
  const firstPage = firstBodyPageIndexByBlock(bodyPages);

  for (const item of book.body) {
    if (item.type !== "text") continue;
    if (item.level === "h1") {
      // 章は常に候補
    } else if (item.level === "h2" && includeSection) {
      // 節は深さ設定が section のときだけ
    } else {
      continue;
    }
    const title = item.text.trim().split("\n")[0]?.trim() ?? "";
    if (!title) continue;

    const bodyPageIndex = firstPage.get(item.id) ?? 0;
    const outlineIndex = outline.findIndex(
      (entry) =>
        entry.kind === "body" && entry.columnIndex === bodyPageIndex,
    );
    const folio =
      outlineIndex >= 0
        ? resolveOutlineFolio(book, outline, outlineIndex)
        : null;

    entries.push({
      id: item.id,
      level: item.level,
      title,
      folio,
      pageIndex: outlineIndex >= 0 ? outlineIndex : 0,
      bodyPageIndex,
    });
  }

  return entries;
}

/**
 * 書籍タイプと組版から目次デザインを選ぶ。
 */
export function resolveTocVisualStyle(
  layout: BookData["layout"],
  paperSize: PaperSizeId,
): TocVisualStyle {
  if (layout === "photo" || paperSize === "square") return "photo";
  if (layout === "japanese" || isRightBound(paperSize)) return "japanese";
  return "western";
}

/** 1 ページ分の項目を段に分配（縦横共通。表示側が読み順に並べる） */
export function splitTocColumns(
  entries: TocEntry[],
  columns: 1 | 2,
): TocEntry[][] {
  if (columns !== 2) return [entries];
  const mid = Math.ceil(entries.length / 2);
  return [entries.slice(0, mid), entries.slice(mid)];
}

/**
 * 1 ページあたりの最大件数で目次をページ分割する。
 * capacity は実測値（見切れない件数）。最低 1。
 */
export function paginateTocEntries(
  entries: TocEntry[],
  capacity: number,
  columns: 1 | 2,
): TocPageSlice[] {
  const cap = Math.max(1, Math.floor(capacity));
  if (entries.length === 0) {
    return [
      {
        tocIndex: 0,
        entries: [],
        columns: splitTocColumns([], columns),
      },
    ];
  }
  const pages: TocPageSlice[] = [];
  for (let i = 0; i < entries.length; i += cap) {
    const pageEntries = entries.slice(i, i + cap);
    pages.push({
      tocIndex: pages.length,
      entries: pageEntries,
      columns: splitTocColumns(pageEntries, columns),
    });
  }
  return pages;
}

/** pages 配列内の、指定 toc ページが何枚目か（0 始まり）。見つからなければ 0 */
export function resolveTocPageIndex(
  pages: BookPage[],
  pageId: string,
): number {
  let index = 0;
  for (const page of pages) {
    if (page.pageType !== "toc") continue;
    if (page.id === pageId) return index;
    index += 1;
  }
  return 0;
}

/** 目次ページ枚数 */
export function countTocPages(pages: BookPage[]): number {
  return pages.filter((page) => page.pageType === "toc").length;
}

/**
 * 既存の目次ページを needed 枚に揃える。
 * - もともと目次が 0 枚なら何もしない（勝手に作らない）
 * - 先頭の目次位置に連続ブロックとして配置し、既存 id / blocks を再利用
 */
export function syncTocPageCount(
  pages: BookPage[],
  needed: number,
): BookPage[] {
  const existing = pages.filter((page) => page.pageType === "toc");
  if (existing.length === 0) return pages;

  const count = Math.max(1, Math.floor(needed));
  const nextToc: BookPage[] = [];
  for (let i = 0; i < count; i += 1) {
    const prev = existing[i];
    nextToc.push(
      prev ?? createPage([], "toc"),
    );
  }

  const before: BookPage[] = [];
  const after: BookPage[] = [];
  let seenToc = false;
  for (const page of pages) {
    if (page.pageType === "toc") {
      seenToc = true;
      continue;
    }
    if (!seenToc) before.push(page);
    else after.push(page);
  }

  return normalizeCoverPageOrder([...before, ...nextToc, ...after]);
}

/** 目次ページ構成が実質同じか（id 列と枚数） */
export function tocPagesEqual(a: BookPage[], b: BookPage[]): boolean {
  const aToc = a.filter((page) => page.pageType === "toc").map((page) => page.id);
  const bToc = b.filter((page) => page.pageType === "toc").map((page) => page.id);
  if (aToc.length !== bToc.length) return false;
  return aToc.every((id, index) => id === bToc[index]);
}

/**
 * 閲覧用：既存の目次ページ枚数に合わせて項目を等分する。
 * （編集時に実測同期済みなら、ほぼ同じ分割になる）
 */
export function buildTocSlicesFromPages(
  book: BookData,
  bodyPages: PaginatedPage[],
): TocPageSlice[] {
  const entries = collectTocEntries(book, bodyPages);
  const pageCount = Math.max(1, countTocPages(book.pages));
  const columns: 1 | 2 = book.format.tocColumns === 2 ? 2 : 1;
  const capacity = Math.max(
    1,
    Math.ceil(Math.max(1, entries.length) / pageCount),
  );
  return paginateTocEntries(entries, capacity, columns);
}
