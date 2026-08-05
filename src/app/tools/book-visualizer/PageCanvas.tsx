"use client";

import { useState, type CSSProperties } from "react";

import { useI18n } from "@/i18n";
import {
  resolveFolioNumber,
  resolveHeaderText,
  shouldShowFolio,
  shouldShowHeader,
} from "./chrome";
import { bookFontCssFamily } from "./fonts";
import FreeBlockLayer from "./FreeBlockLayer";
import type { PageMetrics } from "./metrics";
import type { PaginatedPage } from "./paginate";
import type { SnapGuide } from "./snap";
import {
  resolveTocPageIndex,
  type TocPageSlice,
} from "./toc";
import TocView from "./TocView";
import {
  isFreeBlock,
  type BookData,
  type BookPage,
  type FreeFrame,
} from "./types";

type PageCanvasProps = {
  book: BookData;
  page: BookPage;
  pageIndex: number;
  metrics: PageMetrics;
  /** サムネ用など、紙面自体を縮小する倍率（現状は FreeLayer の Rnd にも流用） */
  scale?: number;
  /**
   * 親の CSS transform 倍率（react-rnd 補正用）。
   * 指定時は scale の代わりにこちらを FreeLayer へ渡す。
   */
  interactionScale?: number;
  interactive?: boolean;
  allowDirectInput?: boolean;
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string | null) => void;
  onChangeText?: (id: string, text: string) => void;
  onChangeFreeFrame?: (id: string, frame: FreeFrame) => void;
  onTextEditEnd?: () => void;
  /**
   * 指定時は shouldShowHeader の代わりにこの文字列を柱に使う。
   * 空文字なら柱を出さない（見開きの左右出し分け用）。
   */
  headerTextOverride?: string;
  /** 目次ノンブル連動用の本文ページ分割 */
  bodyPages?: PaginatedPage[];
  /** 目次のページ分割結果（無いときは空表示） */
  tocSlices?: TocPageSlice[];
};

/**
 * 固定ページ用キャンバス（表紙・目次・自由配置）。
 * 本文テキストは PagedBodyView 側。
 */
export default function PageCanvas({
  book,
  page,
  pageIndex,
  metrics,
  scale = 1,
  interactionScale,
  interactive = false,
  allowDirectInput = false,
  selectedBlockId = null,
  onSelectBlock,
  onChangeText,
  onChangeFreeFrame,
  onTextEditEnd,
  headerTextOverride,
  bodyPages,
  tocSlices = [],
}: PageCanvasProps) {
  const { t } = useI18n();
  const copy = t.apps.bookVisualizer;
  const { vertical, lineHeight } = metrics;
  const headerText =
    headerTextOverride !== undefined
      ? headerTextOverride
      : shouldShowHeader(book, pageIndex)
        ? resolveHeaderText(book, pageIndex, book.format.headerMode)
        : "";
  const folioNumber = resolveFolioNumber(book, pageIndex);
  const folio =
    shouldShowFolio(book, pageIndex) && folioNumber !== null
      ? String(folioNumber)
      : "";
  const headerAlign = book.format.headerAlign;
  const folioAlign = book.format.folioAlign;
  const [guides, setGuides] = useState<SnapGuide[]>([]);

  const isTocPage = page.pageType === "toc";
  const tocIndex = isTocPage ? resolveTocPageIndex(book.pages, page.id) : 0;
  const tocSlice = tocSlices[tocIndex] ?? tocSlices[0];
  const freeBlocks = page.blocks.filter(isFreeBlock);

  const fontCss = bookFontCssFamily(book.format.fontFamilyP);
  const sheetStyle: CSSProperties = {
    width: metrics.width,
    height: metrics.height,
    fontFamily: fontCss,
  };

  // 余白固定。印字エリアは用紙 − 余白（content* の独立丸めで余白がずれないようにする）
  const padL = Math.round(metrics.marginLeft);
  const padT = Math.round(metrics.marginTop);
  const padR = Math.round(metrics.marginRight);
  const padB = Math.round(metrics.marginBottom);
  const pageW = Math.round(metrics.width);
  const pageH = Math.round(metrics.height);
  const contentStyle: CSSProperties = {
    position: "absolute",
    left: padL,
    top: padT,
    width: Math.max(1, pageW - padL - padR),
    height: Math.max(1, pageH - padT - padB),
    margin: 0,
    padding: 0,
    fontSize: metrics.fontSize,
    lineHeight: `${lineHeight}px`,
    letterSpacing: `${metrics.letterSpacing}px`,
    writingMode: vertical ? "vertical-rl" : "horizontal-tb",
    fontFamily: fontCss,
  };

  return (
    <div
      style={sheetStyle}
      className={`bv-sheet ${
        book.layout === "photo" ? "bv-sheet--photo" : ""
      }`}
      onClick={interactive ? () => onSelectBlock?.(null) : undefined}
    >
      {headerText ? (
        <div
          className={`bv-running-header bv-running-header--${headerAlign}`}
          style={{
            height: metrics.marginTop,
            fontSize: Math.max(8, Math.min(11, metrics.fontSize * 0.65)),
          }}
          title={headerText}
        >
          <span className="bv-running-header__text">{headerText}</span>
        </div>
      ) : null}

      {/* 背面 → 本文 → 前面。DOM 順でもフリップの 3D 配下でかぶせが崩れないようにする */}
      <FreeBlockLayer
        blocks={freeBlocks}
        metrics={metrics}
        scale={interactionScale ?? scale}
        interactive={interactive}
        selectedBlockId={selectedBlockId}
        imageAlt={book.title}
        plane="under"
        onSelectBlock={onSelectBlock}
        onChangeFreeFrame={onChangeFreeFrame}
        onChangeText={onChangeText}
        onTextEditEnd={onTextEditEnd}
        onGuidesChange={interactive ? setGuides : undefined}
      />

      <div
        style={contentStyle}
        className={[
          "bv-content",
          vertical ? "bv-content--vertical-text" : "bv-content--horizontal-text",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={
          interactive
            ? (event) => {
                // 版面クリックでも選択解除（伝播だけ止めてシート二重処理を避ける）
                event.stopPropagation();
                onSelectBlock?.(null);
              }
            : undefined
        }
      >
        {isTocPage ? (
          <TocView
            book={book}
            metrics={metrics}
            entries={tocSlice?.entries ?? []}
            columnEntries={tocSlice?.columns ?? [[]]}
            showHeading={tocIndex === 0}
          />
        ) : null}
      </div>

      <FreeBlockLayer
        blocks={freeBlocks}
        metrics={metrics}
        scale={interactionScale ?? scale}
        interactive={interactive}
        selectedBlockId={selectedBlockId}
        imageAlt={book.title}
        plane="over"
        onSelectBlock={onSelectBlock}
        onChangeFreeFrame={onChangeFreeFrame}
        onChangeText={onChangeText}
        onTextEditEnd={onTextEditEnd}
        onGuidesChange={interactive ? setGuides : undefined}
      />

      {guides.length > 0 ? (
        <div className="bv-snap-guides" aria-hidden>
          {guides.map((guide, index) => (
            <div
              key={`${guide.orientation}-${guide.position}-${index}`}
              className={[
                "bv-snap-guide",
                `bv-snap-guide--${guide.orientation}`,
                guide.source === "peer" ? "bv-snap-guide--peer" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={
                guide.orientation === "v"
                  ? { left: guide.position * metrics.width }
                  : { top: guide.position * metrics.height }
              }
            />
          ))}
        </div>
      ) : null}

      {folio ? (
        <div
          className={`bv-folio bv-folio--${folioAlign}`}
          style={{
            height: metrics.marginBottom,
            fontSize: Math.max(8, Math.min(11, metrics.fontSize * 0.65)),
          }}
        >
          {folio}
        </div>
      ) : null}

      {allowDirectInput && freeBlocks.length === 0 && !isTocPage ? (
        <p className="bv-empty-hint pointer-events-none absolute inset-0 flex items-center justify-center text-center opacity-60">
          {copy.edit.canvas.emptyHint}
        </p>
      ) : null}
    </div>
  );
}
