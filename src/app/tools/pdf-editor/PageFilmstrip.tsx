"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { fmt, useI18n } from "@/i18n";
import PageCard from "./PageCard";
import type { PdfPageItem } from "./types";

/** Acrobat 風の読みやすい固定カードサイズ */
export const CARD_WIDTH = 148;
export const CARD_HEIGHT = 192;
const GAP_Y = 12;
const PAD = 12;
/** 左右・カード間ギャップの下限 */
const MIN_GAP_X = 8;

type GapOrientation = "h" | "v";

type GapOverlay = {
  insertIndex: number;
  x: number;
  y: number;
  orientation: GapOrientation;
};

type GridLayout = {
  cols: number;
  availW: number;
};

/** コンテナ幅から1行あたりの列数を算出 */
export function computeGridLayout(
  containerW: number,
  pageCount: number,
): GridLayout {
  const availW = Math.max(0, containerW - PAD * 2);
  if (pageCount <= 0 || availW <= 0) {
    return { cols: 1, availW };
  }

  const maxCols = Math.max(
    1,
    Math.floor((availW + MIN_GAP_X) / (CARD_WIDTH + MIN_GAP_X)),
  );
  const capped = Math.min(maxCols, pageCount);

  for (let cols = capped; cols >= 1; cols--) {
    const gap = (availW - cols * CARD_WIDTH) / (cols + 1);
    if (gap >= MIN_GAP_X) {
      return { cols, availW };
    }
  }

  return { cols: 1, availW };
}

/** 満行向けの均等ギャップ（左右端＋カード間を同幅） */
export function computeFullRowGap(availW: number, cols: number): number {
  if (cols <= 0) return MIN_GAP_X;
  return Math.max(MIN_GAP_X, (availW - cols * CARD_WIDTH) / (cols + 1));
}

/** カード間の隙間 — ホバー時のみ「＋」（グリッド上に絶対配置・レイアウト非干渉） */
function InsertGap({
  insertIndex,
  onInsert,
  x,
  y,
  orientation,
  pasteMode,
  pasteCount,
  filmstrip,
}: {
  insertIndex: number;
  onInsert: (index: number) => void;
  x: number;
  y: number;
  orientation: GapOrientation;
  pasteMode: boolean;
  pasteCount: number;
  filmstrip: {
    insertBlank: string;
    insertBlankAria: string;
    pastePages: string;
    pasteAria: string;
  };
}) {
  const isVertical = orientation === "v";

  return (
    <div
      className={`group/gap absolute z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center ${
        isVertical ? "h-8 w-5" : "h-5 w-8"
      }`}
      style={{ left: x, top: y }}
      aria-label={pasteMode ? filmstrip.pasteAria : filmstrip.insertBlankAria}
    >
      <button
        type="button"
        title={
          pasteMode
            ? fmt(filmstrip.pastePages, { count: pasteCount })
            : filmstrip.insertBlank
        }
        onClick={() => onInsert(insertIndex)}
        className={`pointer-events-none flex h-6 w-6 scale-90 items-center justify-center rounded-full border text-sm font-medium opacity-0 shadow-sm transition-all duration-150 group-hover/gap:pointer-events-auto group-hover/gap:scale-100 group-hover/gap:opacity-100 ${
          pasteMode
            ? "border-zinc-400 bg-zinc-100 text-zinc-900 hover:border-zinc-600 hover:bg-zinc-200"
            : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
        }`}
      >
        ＋
      </button>
    </div>
  );
}

function toLocalRect(rect: DOMRect, origin: DOMRect) {
  return {
    left: rect.left - origin.left,
    right: rect.right - origin.left,
    top: rect.top - origin.top,
    bottom: rect.bottom - origin.top,
    cx: (rect.left + rect.right) / 2 - origin.left,
    cy: (rect.top + rect.bottom) / 2 - origin.top,
  };
}

/** 折り返しグリッド上の挿入位置を実測矩形から算出 */
function measureGapOverlays(
  cardEls: (HTMLDivElement | null)[],
  originEl: HTMLDivElement,
  fullRowGap: number,
): GapOverlay[] {
  const validEls = cardEls.filter(Boolean) as HTMLDivElement[];
  if (validEls.length === 0) return [];

  const origin = originEl.getBoundingClientRect();
  const rects = validEls.map((el) =>
    toLocalRect(el.getBoundingClientRect(), origin),
  );
  const overlays: GapOverlay[] = [];

  overlays.push({
    insertIndex: 0,
    x: rects[0].left / 2,
    y: rects[0].cy,
    orientation: "h",
  });

  for (let i = 1; i < rects.length; i++) {
    const prev = rects[i - 1];
    const next = rects[i];
    const prevDom = validEls[i - 1].getBoundingClientRect();
    const nextDom = validEls[i].getBoundingClientRect();
    const sameRow = Math.abs(prevDom.top - nextDom.top) < 8;

    if (sameRow) {
      overlays.push({
        insertIndex: i,
        x: (prev.right + next.left) / 2,
        y: (prev.cy + next.cy) / 2,
        orientation: "h",
      });
    } else {
      overlays.push({
        insertIndex: i,
        x: next.cx,
        y: (prev.bottom + next.top) / 2,
        orientation: "v",
      });
    }
  }

  const last = rects[rects.length - 1];
  overlays.push({
    insertIndex: rects.length,
    x: last.right + fullRowGap / 2,
    y: last.cy,
    orientation: "h",
  });

  return overlays;
}

/** 固定サイズカードの縦スクロール・グリッド（Acrobat 風） */
export default function PageFilmstrip({
  pages,
  selectedIds,
  onSelectPage,
  onClearSelection,
  onRemove,
  onRotate,
  onInsertAt,
  hasClipboard,
  clipboardCount,
  onPreviewPage,
}: {
  pages: PdfPageItem[];
  selectedIds: Set<string>;
  onSelectPage: (index: number, pageId: string, event: React.MouseEvent) => void;
  onClearSelection: () => void;
  onRemove: (ids: string[]) => void;
  onRotate: (ids: string[]) => void;
  /** 白紙挿入またはクリップボード貼り付け */
  onInsertAt: (index: number) => void;
  hasClipboard: boolean;
  clipboardCount: number;
  onPreviewPage: (index: number) => void;
}) {
  const { t } = useI18n();
  const filmstrip = t.apps.pdfEditor.filmstrip;
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [gridLayout, setGridLayout] = useState<GridLayout>({
    cols: 1,
    availW: 0,
  });
  const [gapOverlays, setGapOverlays] = useState<GapOverlay[]>([]);

  const rows = useMemo(() => {
    const result: PdfPageItem[][] = [];
    for (let i = 0; i < pages.length; i += gridLayout.cols) {
      result.push(pages.slice(i, i + gridLayout.cols));
    }
    return result;
  }, [pages, gridLayout.cols]);

  const setCardRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      cardRefs.current[index] = el;
    },
    [],
  );

  const remeasureGaps = useCallback(() => {
    const content = contentRef.current;
    if (!content || pages.length === 0) {
      setGapOverlays([]);
      return;
    }
    const fullRowGap = computeFullRowGap(gridLayout.availW, gridLayout.cols);
    requestAnimationFrame(() => {
      if (!contentRef.current) return;
      setGapOverlays(
        measureGapOverlays(
          cardRefs.current,
          contentRef.current,
          fullRowGap,
        ),
      );
    });
  }, [gridLayout.availW, gridLayout.cols, pages.length]);

  const updateLayout = useCallback(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    setGridLayout(computeGridLayout(scroll.clientWidth, pages.length));
  }, [pages.length]);

  useLayoutEffect(() => {
    updateLayout();
    const scroll = scrollRef.current;
    if (!scroll) return;

    const observer = new ResizeObserver(() => {
      updateLayout();
    });
    observer.observe(scroll);
    window.addEventListener("resize", updateLayout);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateLayout);
    };
  }, [updateLayout]);

  useLayoutEffect(() => {
    remeasureGaps();
  }, [gridLayout, pages, rows, remeasureGaps]);

  if (pages.length === 0) {
    return (
      <div className="flex h-[60vh] max-h-[650px] items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50/30">
        <p className="text-sm text-zinc-400">{filmstrip.noPages}</p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="h-[60vh] max-h-[650px] overflow-x-hidden overflow-y-auto rounded-lg border border-zinc-200/60 bg-zinc-50/30 [scrollbar-width:thin]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClearSelection();
      }}
    >
      <div
        ref={contentRef}
        className="relative"
        style={{ padding: PAD }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClearSelection();
        }}
      >
        <SortableContext
          items={pages.map((p) => p.id)}
          strategy={rectSortingStrategy}
        >
          <div className="flex flex-col items-start" style={{ rowGap: GAP_Y }}>
            {rows.map((row, rowIndex) => {
              const fullRowGap = computeFullRowGap(
                gridLayout.availW,
                gridLayout.cols,
              );
              const isPartialRow =
                rowIndex === rows.length - 1 &&
                row.length < gridLayout.cols;
              const startIndex = rowIndex * gridLayout.cols;

              return (
                <div
                  key={`row-${startIndex}-${row.map((p) => p.id).join("-")}`}
                  className={`flex shrink-0 justify-start ${
                    isPartialRow ? "w-fit max-w-full self-start" : "w-full"
                  }`}
                  style={
                    isPartialRow
                      ? {
                          columnGap: fullRowGap,
                          paddingLeft: fullRowGap,
                        }
                      : {
                          columnGap: fullRowGap,
                          paddingLeft: fullRowGap,
                          paddingRight: fullRowGap,
                        }
                  }
                >
                  {row.map((page, i) => {
                    const globalIndex = startIndex + i;
                    const isSelected = selectedIds.has(page.id);
                    const actionTargets =
                      isSelected && selectedIds.size > 0
                        ? [...selectedIds]
                        : [page.id];

                    return (
                      <div
                        key={page.id}
                        ref={setCardRef(globalIndex)}
                        className="shrink-0"
                        style={{
                          width: CARD_WIDTH,
                          height: CARD_HEIGHT,
                        }}
                      >
                        <PageCard
                          page={page}
                          displayIndex={globalIndex + 1}
                          width={CARD_WIDTH}
                          height={CARD_HEIGHT}
                          isSelected={isSelected}
                          onSelect={(e) =>
                            onSelectPage(globalIndex, page.id, e)
                          }
                          onRemove={() => onRemove(actionTargets)}
                          onRotate={() => onRotate(actionTargets)}
                          onPreview={() => onPreviewPage(globalIndex)}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </SortableContext>

        {gapOverlays.map((gap) => (
          <InsertGap
            key={gap.insertIndex}
            insertIndex={gap.insertIndex}
            x={gap.x}
            y={gap.y}
            orientation={gap.orientation}
            pasteMode={hasClipboard}
            pasteCount={clipboardCount}
            filmstrip={filmstrip}
            onInsert={onInsertAt}
          />
        ))}
      </div>
    </div>
  );
}
