"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { bookFontCssFamily } from "./fonts";
import type { PageMetrics } from "./metrics";
import type { PaginatedPage } from "./paginate";
import {
  collectTocEntries,
  countTocPages,
  paginateTocEntries,
  syncTocPageCount,
  tocPagesEqual,
  type TocEntry,
  type TocPageSlice,
} from "./toc";
import { TocProbeBody } from "./TocView";
import type { BookData, BookPage } from "./types";

type TocSyncProps = {
  book: BookData;
  metrics: PageMetrics;
  bodyPages: PaginatedPage[];
  /** 目次ページ枚数を書籍データへ反映（編集モードのみ） */
  onSyncPages?: (pages: BookPage[]) => void;
  /** 分割結果を親へ渡す（描画用） */
  onSlices?: (slices: TocPageSlice[]) => void;
};

type CapacitySearch = {
  key: string;
  lo: number;
  hi: number;
  best: number;
  /** いまプローブに載せている件数 */
  testing: number;
};

function rectOutside(inner: DOMRect, outer: DOMRect, tol: number): boolean {
  return (
    inner.bottom > outer.bottom + tol ||
    inner.right > outer.right + tol ||
    inner.left < outer.left - tol ||
    inner.top < outer.top - tol
  );
}

/**
 * 見切れ判定。
 * overflow:hidden 配下では scrollWidth/Height が増えないことがあるため、
 * 項目・タイトル・ノンブルの実座標が枠をはみ出していないかを見る。
 * （リーダー点々のクリップは装飾なので許容する）
 */
function overflows(root: HTMLElement): boolean {
  const tol = 1.5;
  if (
    root.scrollHeight > root.clientHeight + tol ||
    root.scrollWidth > root.clientWidth + tol
  ) {
    return true;
  }

  const rootRect = root.getBoundingClientRect();
  if (rootRect.width < 1 || rootRect.height < 1) return false;

  for (const node of root.querySelectorAll(".bv-toc__list, .bv-toc__panes")) {
    const el = node as HTMLElement;
    if (
      el.scrollHeight > el.clientHeight + tol ||
      el.scrollWidth > el.clientWidth + tol
    ) {
      return true;
    }
  }

  for (const node of root.querySelectorAll(".bv-toc__item, .bv-toc__heading")) {
    const r = (node as HTMLElement).getBoundingClientRect();
    if (r.width < 0.5 || r.height < 0.5) continue;
    if (rectOutside(r, rootRect, tol)) return true;
  }

  for (const node of root.querySelectorAll(".bv-toc__title, .bv-toc__folio")) {
    const el = node as HTMLElement;
    const r = el.getBoundingClientRect();
    if (r.width < 0.5 || r.height < 0.5) continue;
    if (rectOutside(r, rootRect, tol)) return true;
    const item = el.closest(".bv-toc__item");
    if (item instanceof HTMLElement) {
      const ir = item.getBoundingClientRect();
      if (rectOutside(r, ir, tol)) return true;
    }
  }
  return false;
}

function entriesSignature(entries: TocEntry[]): string {
  return entries
    .map((entry) => `${entry.id}\t${entry.title}\t${entry.folio ?? ""}`)
    .join("\n");
}

function slicesSignature(slices: TocPageSlice[]): string {
  return slices
    .map((slice) => slice.entries.map((entry) => entry.id).join(","))
    .join("|");
}

/**
 * 目次の「1 ページに収まる最大項目数」を測り、
 * 必要枚数の目次ページへ同期する。
 * 縦書き・横書きとも同じ分割ロジック。
 *
 * 計測は 1 フレームに 1 回だけ probe を差し替え（flushSync は使わない）。
 */
export default function TocSync({
  book,
  metrics,
  bodyPages,
  onSyncPages,
  onSlices,
}: TocSyncProps) {
  const entries = useMemo(
    () => collectTocEntries(book, bodyPages),
    [book, bodyPages],
  );
  const columns: 1 | 2 = book.format.tocColumns === 2 ? 2 : 1;
  const hasToc = countTocPages(book.pages) > 0;
  const fontCss = bookFontCssFamily(book.format.fontFamilyP);

  const measureKey = useMemo(
    () =>
      [
        hasToc ? "1" : "0",
        entriesSignature(entries),
        String(columns),
        String(metrics.contentWidth),
        String(metrics.contentHeight),
        String(metrics.fontSize),
        String(metrics.lineHeight),
        String(metrics.letterSpacing),
        metrics.vertical ? "v" : "h",
        book.format.paperSize,
        book.layout,
        book.format.tocDepth,
        book.format.fontFamilyP,
      ].join("|"),
    [
      hasToc,
      entries,
      columns,
      metrics.contentWidth,
      metrics.contentHeight,
      metrics.fontSize,
      metrics.lineHeight,
      metrics.letterSpacing,
      metrics.vertical,
      book.format.paperSize,
      book.layout,
      book.format.tocDepth,
      book.format.fontFamilyP,
    ],
  );

  const probeRef = useRef<HTMLDivElement>(null);
  const onSyncPagesRef = useRef(onSyncPages);
  const onSlicesRef = useRef(onSlices);
  const searchRef = useRef<CapacitySearch | null>(null);
  const lastSlicesKeyRef = useRef("");
  const entriesRef = useRef(entries);
  const pagesRef = useRef(book.pages);
  onSyncPagesRef.current = onSyncPages;
  onSlicesRef.current = onSlices;
  entriesRef.current = entries;
  pagesRef.current = book.pages;

  const [probeCount, setProbeCount] = useState(0);
  const [capacity, setCapacity] = useState(1);
  /** 計測完了のたびに進め、capacity が同じでも同期 effect を走らせる */
  const [measureEpoch, setMeasureEpoch] = useState(0);
  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  function finishSearch(best: number) {
    searchRef.current = null;
    setCapacity((value) => (value === best ? value : best));
    setProbeCount((value) => (value === best ? value : best));
    setMeasureEpoch((value) => value + 1);
  }

  // 計測開始（依存が変わったときだけ）
  useEffect(() => {
    if (!hasToc) {
      searchRef.current = null;
      setCapacity((value) => (value === 1 ? value : 1));
      setProbeCount((value) => (value === 0 ? value : 0));
      setMeasureEpoch((value) => value + 1);
      return;
    }
    if (entries.length === 0) {
      searchRef.current = null;
      setCapacity((value) => (value === 1 ? value : 1));
      setProbeCount((value) => (value === 0 ? value : 0));
      setMeasureEpoch((value) => value + 1);
      return;
    }

    const testing = Math.max(1, (1 + entries.length) >> 1);
    searchRef.current = {
      key: measureKey,
      lo: 1,
      hi: entries.length,
      best: 1,
      testing,
    };
    setProbeCount(testing);
  }, [measureKey, hasToc, entries.length]);

  // 描画後に 1 ステップ評価（lifecycle 内で flushSync しない）
  useEffect(() => {
    const search = searchRef.current;
    if (!search || search.key !== measureKey) return;
    if (probeCount !== search.testing) return;
    if (!hasToc) return;

    const probe = probeRef.current;
    if (!probe) return;

    const rafId = requestAnimationFrame(() => {
      const current = searchRef.current;
      if (!current || current.key !== measureKey) return;
      if (probeCount !== current.testing) return;
      if (!probeRef.current) return;

      const mid = current.testing;
      let { lo, hi, best } = current;

      if (!overflows(probeRef.current)) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }

      if (lo > hi || (lo + hi) >> 1 === mid) {
        finishSearch(best);
        return;
      }

      const next = (lo + hi) >> 1;
      searchRef.current = {
        key: measureKey,
        lo,
        hi,
        best,
        testing: next,
      };
      setProbeCount(next);
    });

    return () => cancelAnimationFrame(rafId);
  }, [probeCount, measureKey, hasToc]);

  // 分割結果の通知とページ枚数同期（計測完了後のみ）
  useEffect(() => {
    if (!hasToc) {
      if (lastSlicesKeyRef.current !== "") {
        lastSlicesKeyRef.current = "";
        onSlicesRef.current?.([]);
      }
      return;
    }

    // 計測中は途中結果でページを増やし減らしない
    if (searchRef.current && searchRef.current.key === measureKey) return;

    const currentEntries = entriesRef.current;
    const col = columnsRef.current;
    const slices = paginateTocEntries(currentEntries, capacity, col);
    const slicesKey = slicesSignature(slices);
    if (slicesKey !== lastSlicesKeyRef.current) {
      lastSlicesKeyRef.current = slicesKey;
      onSlicesRef.current?.(slices);
    }

    const sync = onSyncPagesRef.current;
    if (!sync) return;
    const pages = pagesRef.current;
    const next = syncTocPageCount(pages, slices.length);
    if (!tocPagesEqual(pages, next)) {
      sync(next);
    }
  }, [hasToc, capacity, measureEpoch, measureKey]);

  if (!hasToc) return null;

  const probeEntries = entries.slice(0, Math.max(0, probeCount));

  return (
    <div
      ref={probeRef}
      className="bv-toc-root--probe"
      aria-hidden
      style={{
        position: "fixed",
        left: -10000,
        top: 0,
        width: metrics.contentWidth,
        height: metrics.contentHeight,
        overflow: "hidden",
        // PageCanvas の印字エリアと同じ条件で測る
        fontSize: metrics.fontSize,
        lineHeight: `${metrics.lineHeight}px`,
        letterSpacing: `${metrics.letterSpacing}px`,
        writingMode: metrics.vertical ? "vertical-rl" : "horizontal-tb",
        fontFamily: fontCss,
        visibility: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        className="bv-toc-root"
        style={{ fontSize: Math.max(10, metrics.fontSize) }}
      >
        <TocProbeBody
          book={book}
          metrics={metrics}
          entries={probeEntries}
          columns={columns}
          showHeading
        />
      </div>
    </div>
  );
}
