// 書籍特有の柱（ヘッダー）とノンブル（ページ番号）の表示ロジック

import type { OutlineEntry } from "./outline";
import {
  firstBodyPageIndexByBlock,
  type PaginatedPage,
} from "./paginate";
import {
  isHeaderAllowedOnSpreadSide,
  resolveOutlineSpreadSide,
  resolvePageSpreadSide,
} from "./spread";
import {
  isCountedInTotal,
  isFolioOnPageType,
  isHeaderOnPageType,
  type BookData,
  type HeaderMode,
  type PageType,
} from "./types";

/**
 * 本文ブロックに効いている章名（直前までの最後の h1）。
 * ブロック自身が h1 なら、その章名になる。
 */
function chapterTitleForBodyBlock(
  book: BookData,
  blockId: string,
): string {
  let chapter = "";
  for (const item of book.body) {
    if (item.type !== "text") continue;
    if (item.level === "h1") {
      const title = item.text.trim().split("\n")[0]?.trim() ?? "";
      if (title) chapter = title;
    }
    if (item.id === blockId) return chapter;
  }
  return chapter;
}

/**
 * 指定ページより前に始まった最後の章（空ページ用）。
 */
function chapterTitleBeforeBodyPage(
  book: BookData,
  bodyPages: PaginatedPage[],
  bodyPageIndex: number,
): string {
  const firstPage = firstBodyPageIndexByBlock(bodyPages);
  const page = Math.max(0, bodyPageIndex);
  let chapter = "";
  for (const item of book.body) {
    if (item.type !== "text" || item.level !== "h1") continue;
    const title = item.text.trim().split("\n")[0]?.trim() ?? "";
    if (!title) continue;
    const start = firstPage.get(item.id);
    if (start === undefined || start >= page) break;
    chapter = title;
  }
  return chapter;
}

/**
 * 指定の本文ページの柱用章タイトル。
 *
 * ページ内で章がまたがるときは、読み始め時点の章を優先する
 * （横書き＝上端／縦書き＝右端。途中から始まる新章は採らない）。
 * ページ先頭が章見出しなら、その新章名を出す。
 */
export function findChapterTitleForBodyPage(
  book: BookData,
  bodyPages: PaginatedPage[],
  bodyPageIndex: number,
): string {
  const pageIndex = Math.max(0, bodyPageIndex);
  const page = bodyPages[pageIndex];

  if (!page || page.slices.length === 0) {
    return chapterTitleBeforeBodyPage(book, bodyPages, pageIndex);
  }

  return chapterTitleForBodyBlock(book, page.slices[0].blockId);
}

/**
 * 固定ページ用：pageIndex までに現れた最後の見出し。
 * 本文ストリームはページ位置と無関係なので見ない。
 */
export function findChapterTitle(
  book: BookData,
  pageIndex: number,
): string {
  let chapter = "";
  const last = Math.min(pageIndex, book.pages.length - 1);
  for (let i = 0; i <= last; i += 1) {
    for (const block of book.pages[i]?.blocks ?? []) {
      if (
        block.type === "text" &&
        (block.level === "h1" || block.level === "h2") &&
        block.text.trim()
      ) {
        chapter = block.text.trim().split("\n")[0] ?? "";
      }
    }
  }
  return chapter;
}

/** 柱に出す文字列（空なら非表示） */
export function resolveHeaderText(
  book: BookData,
  pageIndex: number,
  mode: HeaderMode,
  bodyContext?: { pages: PaginatedPage[]; pageIndex: number },
): string {
  if (mode === "none") return "";
  if (mode === "title") return book.title.trim();
  if (bodyContext) {
    return (
      findChapterTitleForBodyPage(
        book,
        bodyContext.pages,
        bodyContext.pageIndex,
      ) || book.title.trim()
    );
  }
  return findChapterTitle(book, pageIndex) || book.title.trim();
}

/**
 * このページに柱を出すか。
 * ページタイプ設定 × 見開きの左右配置を両方満たす必要がある。
 */
export function shouldShowHeader(book: BookData, pageIndex: number): boolean {
  const page = book.pages[pageIndex];
  if (!page) return false;
  if (!isHeaderOnPageType(book.format, page.pageType)) return false;
  const side = resolvePageSpreadSide(
    pageIndex,
    book.pages,
    book.format.paperSize,
  );
  return isHeaderAllowedOnSpreadSide(book.format.headerSpreadPlacement, side);
}

/**
 * アウトライン上のページ（本文仮想ページ含む）に柱を出すか。
 * 「見開きの柱：左のみ／右のみ」を本文ページでも反映する。
 */
export function shouldShowHeaderOnOutline(
  book: BookData,
  outline: OutlineEntry[],
  outlineIndex: number,
): boolean {
  const entry = outline[outlineIndex];
  if (!entry) return false;

  const pageType: PageType =
    entry.kind === "body" ? "standard" : entry.pageType;
  if (!isHeaderOnPageType(book.format, pageType)) return false;

  const side = resolveOutlineSpreadSide(
    outlineIndex,
    outline,
    book.format.paperSize,
  );
  return isHeaderAllowedOnSpreadSide(book.format.headerSpreadPlacement, side);
}

/**
 * ノンブル用の番号（1始まり）。
 * 総ページ数に含めないタイプは null（番号なし）。
 */
export function resolveFolioNumber(
  book: BookData,
  pageIndex: number,
): number | null {
  const page = book.pages[pageIndex];
  if (!page) return null;
  if (!isCountedInTotal(book.format, page.pageType)) return null;

  let number = 0;
  for (let i = 0; i <= pageIndex; i += 1) {
    if (isCountedInTotal(book.format, book.pages[i].pageType)) {
      number += 1;
    }
  }
  return number;
}

/** 総ページ数（カウント対象のページだけ） */
export function countTotalPages(book: BookData): number {
  return book.pages.reduce(
    (sum, page) =>
      sum + (isCountedInTotal(book.format, page.pageType) ? 1 : 0),
    0,
  );
}

/** ノンブルを紙面に出すか（表示設定 ON かつ番号がある） */
export function shouldShowFolio(book: BookData, pageIndex: number): boolean {
  const page = book.pages[pageIndex];
  if (!page) return false;
  if (!isFolioOnPageType(book.format, page.pageType)) return false;
  return resolveFolioNumber(book, pageIndex) !== null;
}
