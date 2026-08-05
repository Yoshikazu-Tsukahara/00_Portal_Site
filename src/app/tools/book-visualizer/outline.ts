// 読書・編集ナビ用：固定ページと本文ページ（文字数分割）を一本の順序にする

import {
  isCountedInTotal,
  type BookData,
  type PageType,
} from "./types";

/** アウトライン上の 1 項目 */
export type OutlineEntry =
  | {
      kind: "page";
      key: string;
      pageIndex: number;
      pageType: PageType;
    }
  | {
      kind: "body";
      key: string;
      /** 本文ページの 0 始まり番号 */
      columnIndex: number;
    };

/**
 * 表紙など → 本文カラム → 裏表紙、の順。
 * 標準ページ（自由配置のみ）は本文の前に差し込む。
 */
export function buildOutline(
  book: BookData,
  bodyColumnCount: number,
): OutlineEntry[] {
  const columns = Math.max(1, bodyColumnCount);
  const before: OutlineEntry[] = [];
  const after: OutlineEntry[] = [];

  book.pages.forEach((page, pageIndex) => {
    if (page.pageType === "backCover") {
      after.push({
        kind: "page",
        key: `page-${page.id}`,
        pageIndex,
        pageType: page.pageType,
      });
      return;
    }
    // 裏表紙以外は本文より前（標準＝自由配置用の紙）
    before.push({
      kind: "page",
      key: `page-${page.id}`,
      pageIndex,
      pageType: page.pageType,
    });
  });

  const bodyEntries: OutlineEntry[] = Array.from({ length: columns }, (_, i) => ({
    kind: "body" as const,
    key: `body-${i}`,
    columnIndex: i,
  }));

  return [...before, ...bodyEntries, ...after];
}

/** アウトライン位置のノンブル（1 始まり）。カウント対象外は null */
export function resolveOutlineFolio(
  book: BookData,
  outline: OutlineEntry[],
  outlineIndex: number,
): number | null {
  const entry = outline[outlineIndex];
  if (!entry) return null;

  if (entry.kind === "page") {
    const page = book.pages[entry.pageIndex];
    if (!page || !isCountedInTotal(book.format, page.pageType)) return null;
  } else if (!isCountedInTotal(book.format, "standard")) {
    return null;
  }

  let number = 0;
  for (let i = 0; i <= outlineIndex; i += 1) {
    const item = outline[i];
    if (item.kind === "page") {
      const page = book.pages[item.pageIndex];
      if (page && isCountedInTotal(book.format, page.pageType)) number += 1;
    } else if (isCountedInTotal(book.format, "standard")) {
      number += 1;
    }
  }
  return number;
}
