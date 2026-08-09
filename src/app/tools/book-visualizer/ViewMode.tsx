"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { fmt, useI18n } from "@/i18n";
import { buildSheets } from "./BookSheet";
import type { FlipController } from "./FlipBook";
import { computePageMetrics } from "./metrics";
import { layoutConfigFrom, paginateBody } from "./paginate";
import { isRightBound } from "./paper";
import { getPaperTheme, paperThemeCssVars } from "./theme";
import TocSync from "./TocSync";
import type { TocPageSlice } from "./toc";
import type { BookData } from "./types";
import VariablesReaderModal from "./VariablesReaderModal";
import {
  applyVariablesToBook,
  resolveVariableValues,
} from "./variables";

// page-flip は読み込み時に document を触るため、サーバー側では読み込まない
const FlipBook = dynamic(() => import("./FlipBook"), { ssr: false });

type ViewModeProps = {
  book: BookData;
  /** 読むのをやめて呼び出し元へ戻る */
  onClose: () => void;
  /** ホームへ */
  onGoHome: () => void;
  /** 読み込んだ本を自分の下書きとして取り込む（閲覧専用のときは省略） */
  onAdopt?: () => void;
};

/** UI を自動で隠すまでの時間（ミリ秒） */
const CHROME_HIDE_DELAY = 3500;

function IconFullscreen() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M2.5 6V3.2a.7.7 0 0 1 .7-.7H6M10 2.5h2.8a.7.7 0 0 1 .7.7V6M13.5 10v2.8a.7.7 0 0 1-.7.7H10M6 13.5H3.2a.7.7 0 0 1-.7-.7V10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconExitFullscreen() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M6 2.5v2.8a.7.7 0 0 1-.7.7H2.5M10 2.5v2.8a.7.7 0 0 0 .7.7h2.8M6 13.5v-2.8a.7.7 0 0 0-.7-.7H2.5M10 13.5v-2.8a.7.7 0 0 1 .7-.7h2.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 没入型の読書画面。
 * 名前変換がある本は、置換 → paginateBody の順で紙面を組んでからめくる。
 */
export default function ViewMode({
  book,
  onClose,
  onGoHome,
  onAdopt,
}: ViewModeProps) {
  const { t } = useI18n();
  const copy = t.apps.bookVisualizer.view;
  /** null = モーダル待ち。変数なし本は最初から空オブジェクトで開始 */
  const [readerInput, setReaderInput] = useState<Record<string, string> | null>(
    () => (book.variables.length > 0 ? null : {}),
  );

  const readyToRender = readerInput !== null;

  /** 置換後の一時 Book（paginate の入力） */
  const viewBook = useMemo(() => {
    if (readerInput === null) return null;
    const values = resolveVariableValues(book.variables, readerInput);
    return applyVariablesToBook(book, values);
  }, [book, readerInput]);

  const metrics = computePageMetrics(book.layout, book.format);
  const fontsKey = `${book.format.fontFamilyH1}|${book.format.fontFamilyH2}|${book.format.fontFamilyP}`;
  const layoutConfig = useMemo(
    () =>
      layoutConfigFrom(
        book.layout,
        book.format.charsPerLine,
        book.format.linesPerPage,
        fontsKey,
        book.format.columns,
      ),
    [
      book.layout,
      book.format.charsPerLine,
      book.format.linesPerPage,
      fontsKey,
      book.format.columns,
    ],
  );

  // 最重要: 置換済み body を渡してからページ分割する
  const bodyPages = useMemo(() => {
    if (!viewBook) return [];
    return paginateBody(viewBook.body, layoutConfig);
  }, [viewBook, layoutConfig]);

  const sheets = useMemo(() => {
    if (!viewBook) return [];
    return buildSheets(viewBook, bodyPages.length);
  }, [viewBook, bodyPages.length]);

  const rootRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<FlipController | null>(null);
  const hideTimer = useRef<number | null>(null);
  const [index, setIndex] = useState(0);
  const [portrait, setPortrait] = useState(false);
  const [chromeShown, setChromeShown] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  /** 編集と同じく DOM 実測で求めた目次分割 */
  const [tocSlices, setTocSlices] = useState<TocPageSlice[]>([]);

  const handleTocSlices = useCallback((slices: TocPageSlice[]) => {
    setTocSlices((prev) => {
      if (
        prev.length === slices.length &&
        prev.every(
          (slice, i) =>
            slice.tocIndex === slices[i]?.tocIndex &&
            slice.entries.length === slices[i]?.entries.length &&
            slice.entries.every(
              (entry, entryIndex) =>
                entry.id === slices[i]?.entries[entryIndex]?.id,
            ),
        )
      ) {
        return prev;
      }
      return slices;
    });
  }, []);

  const isRightToLeft = isRightBound(book.format.paperSize);
  const paperTheme = getPaperTheme(book.format.paperSize);
  const themeStyle = paperThemeCssVars(paperTheme);
  const total = sheets.length;
  const current = total === 0 ? 0 : Math.min(index, total - 1);
  // 見開きでは最後の 2 枚、単ページでは最後の 1 枚を「読み終わり」とみなす
  const atLast = total > 0 && current >= total - (portrait ? 1 : 2);
  const chromeVisible = chromeShown || atLast;

  /** 操作があったら UI を出し、しばらく無操作なら消す */
  const revealChrome = useCallback(() => {
    setChromeShown(true);
    if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(
      () => setChromeShown(false),
      CHROME_HIDE_DELAY,
    );
  }, []);

  useEffect(() => {
    if (!readyToRender) return;
    hideTimer.current = window.setTimeout(
      () => setChromeShown(false),
      CHROME_HIDE_DELAY,
    );
    return () => {
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    };
  }, [readyToRender]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // 全画面表示（ブラウザ非対応時は何も起きない）
  useEffect(() => {
    function sync() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    const element = rootRef.current;
    if (!element) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    } else {
      void element.requestFullscreen?.().catch(() => undefined);
    }
  }, []);

  // 読み終えた本を離れるときは全画面も解除する
  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => undefined);
      }
    };
  }, []);

  const goNext = useCallback(() => flipRef.current?.next(), []);
  const goPrev = useCallback(() => flipRef.current?.prev(), []);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        // 全画面中の Esc はブラウザが全画面解除に使う
        if (document.fullscreenElement) return;
        onClose();
        return;
      }
      if (!readyToRender) return;
      const forward = isRightToLeft ? "ArrowLeft" : "ArrowRight";
      const backward = isRightToLeft ? "ArrowRight" : "ArrowLeft";
      if (event.key === forward) {
        revealChrome();
        goNext();
      } else if (event.key === backward) {
        revealChrome();
        goPrev();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [
    goNext,
    goPrev,
    isRightToLeft,
    onClose,
    readyToRender,
    revealChrome,
  ]);

  const chromeClass = chromeVisible
    ? "opacity-100"
    : "pointer-events-none opacity-0";

  // 右開きは右から左へ読むので、左側のボタンが「次のページ」になる
  const leftZone = isRightToLeft
    ? { label: copy.next, action: goNext }
    : { label: copy.prev, action: goPrev };
  const rightZone = isRightToLeft
    ? { label: copy.prev, action: goPrev }
    : { label: copy.next, action: goNext };

  const displayTitle = viewBook?.title.trim() || book.title.trim() || copy.untitled;

  return (
    <div
      ref={rootRef}
      className="bv-reader"
      data-paper-theme={paperTheme.id}
      data-cover-type={paperTheme.coverType}
      data-paper-texture={paperTheme.texture}
      data-digital={paperTheme.digital ? "true" : "false"}
      /* デジタルは CSS 側でダークモード追従するため、色変数は物理本テーマだけ注入 */
      style={paperTheme.digital ? undefined : themeStyle}
      onPointerMove={readyToRender ? revealChrome : undefined}
      onPointerDown={readyToRender ? revealChrome : undefined}
    >
      {!readyToRender ? (
        <>
          <div className="absolute inset-x-0 top-0 z-30 flex items-center gap-2 px-3 py-2.5">
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full border border-zinc-300/70 bg-white/80 px-3 py-1.5 text-[11px] text-zinc-600 transition-colors hover:bg-white"
            >
              ✕ {copy.close}
            </button>
          </div>
          <VariablesReaderModal
            variables={book.variables}
            onConfirm={setReaderInput}
          />
        </>
      ) : null}

      {readyToRender && viewBook ? (
        <>
          <div
            className={`absolute inset-x-0 top-0 z-20 flex items-center gap-2 px-3 py-2.5 transition-opacity duration-300 ${chromeClass}`}
          >
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full border border-zinc-300/70 bg-white/80 px-3 py-1.5 text-[11px] text-zinc-600 transition-colors hover:bg-white"
            >
              ✕ {copy.close}
            </button>
            <p className="min-w-0 flex-1 truncate text-center text-[11px] text-zinc-500">
              {displayTitle}
            </p>
            <span className="shrink-0 text-[11px] tabular-nums text-zinc-500">
              {total === 0
                ? "—"
                : fmt(copy.position, {
                    current: current + 1,
                    total,
                  })}
            </span>
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? copy.exitFullscreen : copy.fullscreen}
              title={isFullscreen ? copy.exitFullscreen : copy.fullscreen}
              className="shrink-0 rounded-full border border-zinc-300/70 bg-white/80 p-1.5 text-zinc-600 transition-colors hover:bg-white"
            >
              {isFullscreen ? <IconExitFullscreen /> : <IconFullscreen />}
            </button>
          </div>

          {/* 編集画面と同じ実測で目次を分割（書籍データは変更しない） */}
          <TocSync
            book={viewBook}
            metrics={metrics}
            bodyPages={bodyPages}
            onSlices={handleTocSlices}
          />

          <div className="bv-reader__stage relative min-h-0 flex-1">
            {total > 0 ? (
              <FlipBook
                book={viewBook}
                metrics={metrics}
                bodyPages={bodyPages}
                sheets={sheets}
                tocSlices={tocSlices}
                rightToLeft={isRightToLeft}
                coverType={paperTheme.coverType}
                digital={paperTheme.digital}
                onChangeIndex={setIndex}
                onChangePortrait={setPortrait}
                controllerRef={flipRef}
              />
            ) : (
              <p className="flex h-full items-center justify-center px-6 text-center text-sm text-zinc-500">
                {copy.empty}
              </p>
            )}

            {/* 本のドラッグを邪魔しないよう、ページ送りは画面端の小さなボタンにする */}
            {total > 0 ? (
              <>
                <button
                  type="button"
                  onClick={leftZone.action}
                  aria-label={leftZone.label}
                  className={`bv-reader__arrow left-2 transition-opacity duration-300 ${chromeClass}`}
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={rightZone.action}
                  aria-label={rightZone.label}
                  className={`bv-reader__arrow right-2 transition-opacity duration-300 ${chromeClass}`}
                >
                  ›
                </button>
              </>
            ) : null}
          </div>

          {/* 最終ページ：ホーム／最初から／編集（旧奥付の操作） */}
          {atLast ? (
            <div
              className={`absolute inset-x-0 bottom-0 z-20 flex flex-wrap items-center justify-center gap-2 bg-gradient-to-t from-white/85 to-transparent px-3 pb-4 pt-8 transition-opacity duration-300 ${chromeClass}`}
            >
              <button type="button" onClick={onGoHome} className="btn-primary">
                {copy.endHome}
              </button>
              <button
                type="button"
                onClick={() => flipRef.current?.goTo(0)}
                className="btn-secondary"
              >
                {copy.endRestart}
              </button>
              {onAdopt ? (
                <button type="button" onClick={onAdopt} className="btn-secondary">
                  {copy.endEdit}
                </button>
              ) : null}
            </div>
          ) : (
            <p
              className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 px-3 pb-3 pt-6 text-center text-[10px] text-zinc-500 transition-opacity duration-300 ${chromeClass}`}
            >
              {copy.hint}
            </p>
          )}
        </>
      ) : null}
    </div>
  );
}
