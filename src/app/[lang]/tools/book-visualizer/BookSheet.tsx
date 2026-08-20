"use client";

import { useMemo } from "react";

import {
  resolveHeaderText,
  shouldShowHeaderOnOutline,
} from "./chrome";
import type { PageMetrics } from "./metrics";
import { buildOutline, resolveOutlineFolio } from "./outline";
import PageCanvas from "./PageCanvas";
import PagedBodyView from "./PagedBodyView";
import type { PaginatedPage } from "./paginate";
import {
  buildTocSlicesFromPages,
  type TocPageSlice,
} from "./toc";
import {
  bodyOverlayBlocks,
  type BookData,
  type BookPage,
} from "./types";

/** リーダーが表示する 1 枚 */
export type Sheet =
  | { kind: "page"; page: BookPage; pageIndex: number }
  | { kind: "body"; columnIndex: number };

/** 固定ページ＋本文仮想ページを読書順に並べる */
export function buildSheets(
  book: BookData,
  bodyPageCount = 1,
): Sheet[] {
  return buildOutline(book, bodyPageCount).map((entry) => {
    if (entry.kind === "page") {
      return {
        kind: "page" as const,
        page: book.pages[entry.pageIndex],
        pageIndex: entry.pageIndex,
      };
    }
    return {
      kind: "body" as const,
      columnIndex: entry.columnIndex,
    };
  });
}

type BookSheetProps = {
  sheet: Sheet;
  book: BookData;
  metrics: PageMetrics;
  bodyPages?: PaginatedPage[];
  /**
   * 編集画面と同じ実測ベースの目次分割。
   * 無いときは枚数等分のフォールバック（初回計測前など）。
   */
  tocSlices?: TocPageSlice[];
};

/**
 * 読書時の 1 ページ。
 * 本文は文字数グリッドの閲覧レイヤー、固定ページは PageCanvas。
 * （編集画面の紙面と同じ中身になるよう、柱・ノンブル・目次分割を揃える）
 */
export default function BookSheet({
  sheet,
  book,
  metrics,
  bodyPages,
  tocSlices: tocSlicesProp,
}: BookSheetProps) {
  const tocSlices = useMemo(
    () =>
      tocSlicesProp && tocSlicesProp.length > 0
        ? tocSlicesProp
        : buildTocSlicesFromPages(book, bodyPages ?? []),
    [tocSlicesProp, book, bodyPages],
  );
  const outline = buildOutline(book, bodyPages?.length ?? 1);
  const outlineIndex =
    sheet.kind === "body"
      ? outline.findIndex(
          (entry) =>
            entry.kind === "body" && entry.columnIndex === sheet.columnIndex,
        )
      : outline.findIndex(
          (entry) =>
            entry.kind === "page" && entry.pageIndex === sheet.pageIndex,
        );
  const headerText =
    outlineIndex >= 0 &&
    shouldShowHeaderOnOutline(book, outline, outlineIndex)
      ? resolveHeaderText(
          book,
          sheet.kind === "page" ? sheet.pageIndex : 0,
          book.format.headerMode,
          sheet.kind === "body" && bodyPages
            ? { pages: bodyPages, pageIndex: sheet.columnIndex }
            : undefined,
        )
      : "";
  const sheetFolio =
    outlineIndex >= 0
      ? resolveOutlineFolio(book, outline, outlineIndex)
      : null;
  const bodyFolioText =
    sheet.kind === "body" &&
    book.format.folioOnPageTypes.standard &&
    sheetFolio !== null
      ? String(sheetFolio)
      : "";

  if (sheet.kind === "body") {
    return (
      <PagedBodyView
        body={book.body}
        layout={book.layout}
        metrics={metrics}
        fontFamilies={{
          h1: book.format.fontFamilyH1,
          h2: book.format.fontFamilyH2,
          p: book.format.fontFamilyP,
        }}
        pageIndex={sheet.columnIndex}
        pages={bodyPages}
        editable={false}
        headerText={headerText}
        folioText={bodyFolioText}
        headerAlign={book.format.headerAlign}
        folioAlign={book.format.folioAlign}
        freeBlocks={bodyOverlayBlocks(
          book.bodyOverlays,
          sheet.columnIndex,
        )}
      />
    );
  }

  return (
    <PageCanvas
      book={book}
      page={sheet.page}
      pageIndex={sheet.pageIndex}
      metrics={metrics}
      headerTextOverride={headerText}
      bodyPages={bodyPages}
      tocSlices={tocSlices}
    />
  );
}
