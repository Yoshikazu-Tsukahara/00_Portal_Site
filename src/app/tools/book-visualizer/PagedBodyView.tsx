"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type CSSProperties,
  type KeyboardEvent,
} from "react";

import { useI18n } from "@/i18n";
import {
  getPlainCaretOffset,
  normalizeEditableText,
  readEditableText,
  syncEditableText,
} from "./editableText";
import { highlightVariablesHtml } from "./variables";
import {
  bookFontCssFamily,
  fontFamiliesKey,
  fontIdForLevel,
  type BookFontId,
} from "./fonts";
import {
  levelFontScale,
  usesProportionalType,
  type PageMetrics,
} from "./metrics";
import {
  layoutConfigFrom,
  normalizeTextNewlines,
  pageBreakMarkSlot,
  paginateBody,
  type PaginatedPage,
  type PageSlice,
} from "./paginate";
import FreeBlockLayer from "./FreeBlockLayer";
import type { SnapGuide } from "./snap";
import {
  isBodyText,
  type Block,
  type BodyItem,
  type BookLayout,
  type FreeFrame,
  type TextLevel,
} from "./types";

type BodyCaret = { blockId: string; offset: number };

type LevelFonts = { h1: BookFontId; h2: BookFontId; p: BookFontId };

type PagedBodyViewProps = {
  body: BodyItem[];
  layout: BookLayout;
  metrics: PageMetrics;
  /** 章・節・本文の書体 */
  fontFamilies: LevelFonts;
  /** 表示する本文ページ（0 始まり） */
  pageIndex: number;
  /** 親で計算済みなら渡す（サムネ連打の再計算を避ける） */
  pages?: PaginatedPage[];
  editable?: boolean;
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string | null) => void;
  onChangeText?: (id: string, text: string) => void;
  /** IME 中は true。親はページネーション再計算を止めてよい */
  onComposingChange?: (composing: boolean) => void;
  /** 編集中キャレット（ブロック全文上の文字オフセット） */
  onCaretChange?: (caret: BodyCaret | null) => void;
  /** Ctrl/Cmd+Enter でページ区切り */
  onRequestPageBreak?: () => void;
  /** ページ末の区切り目印から削除 */
  onRemovePageBreak?: (breakId: string) => void;
  /**
   * スライス先頭（キャレット 0）で Backspace したとき。
   * 直前が手動ページ区切りなら削除して true を返す。
   */
  onBackspaceAtSliceStart?: (blockId: string) => boolean;
  headerText?: string;
  folioText?: string;
  headerAlign?: "left" | "center" | "right";
  folioAlign?: "left" | "center" | "right";
  /** サムネ用など、紙面自体を縮小表示する倍率 */
  scale?: number;
  /**
   * 親が CSS transform で縮小しているときの倍率（react-rnd のマウス補正用）。
   * 紙面の見た目サイズは変えず、ドラッグだけ合わせる。
   */
  interactionScale?: number;
  className?: string;
  /** この本文ページに重ねる自由配置（画像・テキストボックス） */
  freeBlocks?: Block[];
  onChangeFreeFrame?: (id: string, frame: FreeFrame) => void;
  onChangeFreeText?: (id: string, text: string) => void;
};

/**
 * Word / Google Docs 方式の本文ビュー。
 *
 * 入力はブラウザ純正（contenteditable）に任せる。
 * 独自キャレットやマス目 span は持たず、字送りは font-size /
 * line-height / letter-spacing だけで版面グリッドに合わせる。
 * ページをまたぐブロックも、そのページに載っている部分だけをその場で編集する。
 */
export default function PagedBodyView({
  body,
  layout,
  metrics,
  fontFamilies,
  pageIndex,
  pages: pagesProp,
  editable = false,
  selectedBlockId = null,
  onSelectBlock,
  onChangeText,
  onComposingChange,
  onCaretChange,
  onRequestPageBreak,
  onRemovePageBreak,
  onBackspaceAtSliceStart,
  headerText = "",
  folioText = "",
  headerAlign = "center",
  folioAlign = "center",
  scale = 1,
  interactionScale,
  className = "",
  freeBlocks = [],
  onChangeFreeFrame,
  onChangeFreeText,
}: PagedBodyViewProps) {
  const rndScale = interactionScale ?? scale;
  const { t } = useI18n();
  const copy = t.apps.bookVisualizer;
  const vertical = layout === "japanese";
  const bodyFontCss = bookFontCssFamily(fontFamilies.p);
  const fontsKey = fontFamiliesKey(fontFamilies);
  const viewRef = useRef<HTMLDivElement>(null);
  const composingRef = useRef(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  /** IME 変換中、またはページまたぎ編集中は分割結果を凍結 */
  const [frozenPages, setFrozenPages] = useState<PaginatedPage[] | null>(null);
  const [guides, setGuides] = useState<SnapGuide[]>([]);
  /**
   * またぎ編集用。編集開始時の前後を固定し、このページ分だけを差し替える。
   * （全文を紙面に展開しない＝Word の「このページ上の続き」に近い）
   */
  const spanEditRef = useRef<{
    blockId: string;
    prefix: string;
    suffix: string;
  } | null>(null);

  const config = useMemo(
    () =>
      layoutConfigFrom(
        layout,
        metrics.charsPerLine,
        metrics.linesPerPage,
        fontsKey,
        metrics.columns,
      ),
    [
      layout,
      metrics.charsPerLine,
      metrics.linesPerPage,
      fontsKey,
      metrics.columns,
    ],
  );

  // 書体変更時は凍結ページを解除し、必ず再フローさせる
  useEffect(() => {
    setFrozenPages(null);
    spanEditRef.current = null;
  }, [fontsKey]);

  const livePages = useMemo(
    () => pagesProp ?? paginateBody(body, config),
    [pagesProp, body, config],
  );
  const pages = frozenPages ?? livePages;
  const page = pages[Math.max(0, Math.min(pageIndex, pages.length - 1))] ?? {
    pageIndex: 0,
    slices: [],
    columnSlices: [[]],
    columnCount: 1 as const,
    usedLineCount: 0,
    lastColumnUsedLineCount: 0,
    lastColumnIndex: 0,
  };
  const columnSlices =
    page.columnSlices?.length > 0 ? page.columnSlices : [page.slices];
  const columnCount = Math.max(1, metrics.columns === 2 ? 2 : 1);

  // 余白は絶対値。印字エリアは用紙 − 余白の残り（contentWidth を独立丸めしない）
  const pageW = Math.round(metrics.width);
  const pageH = Math.round(metrics.height);
  const padT = Math.round(metrics.marginTop);
  const padB = Math.round(metrics.marginBottom);
  const padL = Math.round(metrics.marginLeft);
  const padR = Math.round(metrics.marginRight);
  const areaW = Math.max(1, pageW - padL - padR);
  const areaH = Math.max(1, pageH - padT - padB);

  const fontSize = Math.max(1, metrics.fontSize);
  /** 行送り（縦書き＝列ピッチ、横書き＝行ピッチ）＝印字エリアを行数で割った値 */
  const lineHeight = Math.max(0.01, metrics.lineHeight);
  /** 字送りをマス目に合わせる letter-spacing（末尾ギャップ分配済み） */
  const tracking = Math.max(0, metrics.letterSpacing);
  /** line-height 内の half-leading。端が余白に見えないよう view で打ち消す */
  const halfLeading = Math.max(0, metrics.halfLeading ?? 0);
  const cellInline = Math.max(0.01, metrics.cellInline);
  const cellBlock = Math.max(0.01, metrics.cellBlock);

  /** ブロック全文（改行正規化済み） */
  function fullTextOf(blockId: string): string {
    const block = body.find((item) => isBodyText(item) && item.id === blockId);
    return block && isBodyText(block) ? normalizeTextNewlines(block.text) : "";
  }

  /** 外から選択が変わったら、その本文へフォーカスを移す */
  useEffect(() => {
    if (!editable || !selectedBlockId) return;
    if (selectedBlockId === editingId) return;
    const el = viewRef.current?.querySelector<HTMLElement>(
      `[data-block-id="${selectedBlockId}"]`,
    );
    if (el && document.activeElement !== el) {
      el.focus({ preventScroll: true });
    }
  }, [selectedBlockId, editable, editingId, page.slices]);

  function beginEdit(slice: PageSlice) {
    const full = fullTextOf(slice.blockId);
    const spansPages =
      livePages.filter((entry) =>
        entry.slices.some((item) => item.blockId === slice.blockId),
      ).length > 1;

    spanEditRef.current = {
      blockId: slice.blockId,
      prefix: full.slice(0, slice.start),
      suffix: full.slice(slice.end),
    };

    // またぎ編集中は、打つたびに紙面が動かないよう分割を凍結
    if (spansPages) setFrozenPages(livePages);

    setEditingId(slice.blockId);
    onSelectBlock?.(slice.blockId);
  }

  function endEdit() {
    if (composingRef.current) return;
    spanEditRef.current = null;
    setFrozenPages(null);
    onComposingChange?.(false);
    setEditingId(null);
  }

  /** このページ分のテキストを、ブロック全文へ差し戻して親へ渡す */
  function commitSliceText(blockId: string, sliceText: string) {
    const span = spanEditRef.current;
    if (span && span.blockId === blockId) {
      onChangeText?.(blockId, span.prefix + sliceText + span.suffix);
      return;
    }
    onChangeText?.(blockId, sliceText);
  }

  function reportCaret(blockId: string, offsetInSlice: number) {
    const span = spanEditRef.current;
    const base = span && span.blockId === blockId ? span.prefix.length : 0;
    onCaretChange?.({ blockId, offset: base + offsetInSlice });
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLElement>,
    slice: PageSlice,
  ) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      onRequestPageBreak?.();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      composingRef.current = false;
      event.currentTarget.blur();
      return;
    }
    // 次ページ先頭の Backspace → 直前の手動ページ区切りを削除（Word と同じ）
    if (
      event.key === "Backspace" &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      slice.start === 0 &&
      onBackspaceAtSliceStart
    ) {
      const el = event.currentTarget;
      const offset = getPlainCaretOffset(el);
      if (offset === 0 && onBackspaceAtSliceStart(slice.blockId)) {
        event.preventDefault();
      }
    }
  }

  const sheetStyle: CSSProperties = {
    width: pageW * scale,
    height: pageH * scale,
    fontFamily: bodyFontCss,
  };

  const innerStyle: CSSProperties = {
    width: pageW,
    height: pageH,
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: "top left",
    fontFamily: bodyFontCss,
  };

  const colGap = Math.max(0, metrics.columnGap ?? 0);
  const colInline = Math.max(1, metrics.columnInlineSize ?? areaW);
  const colBlock = Math.max(1, metrics.columnBlockSize ?? areaH);

  const typeAreaStyle: CSSProperties = {
    left: padL,
    top: padT,
    width: areaW,
    height: areaH,
    margin: 0,
    padding: 0,
    fontSize,
    fontFamily: bodyFontCss,
    ...({
      "--bv-font-size": `${fontSize}px`,
      "--bv-cell-inline": `${cellInline}px`,
      "--bv-cell-block": `${cellBlock}px`,
    } as CSSProperties),
  };

  /** 1 段分の view。half-leading を段の外側へ押し出す */
  function columnViewStyle(): CSSProperties {
    if (vertical) {
      return {
        width: colBlock + halfLeading * 2,
        height: colInline,
        marginLeft: -halfLeading,
        marginRight: -halfLeading,
      };
    }
    return {
      width: colInline,
      height: colBlock + halfLeading * 2,
      marginTop: -halfLeading,
      marginBottom: -halfLeading,
    };
  }

  function renderColumnSlices(slices: PageSlice[], columnIndex: number) {
    if (slices.length === 0) {
      return (
        <p className="bv-empty-hint bv-paged-empty">
          {editable && columnIndex === 0 ? copy.edit.blockPlaceholder : ""}
        </p>
      );
    }
    return slices.map((slice, index) => {
      const active = editable && slice.blockId === editingId;
      const sliceText = fullTextOf(slice.blockId).slice(slice.start, slice.end);
      return (
        <EditableSlice
          key={`${columnIndex}-${slice.blockId}-${index}`}
          blockId={slice.blockId}
          text={sliceText}
          level={slice.level}
          editable={editable}
          active={active}
          selected={selectedBlockId === slice.blockId}
          placeholder={copy.edit.blockPlaceholder}
          style={sliceStyle(
            slice.level,
            fontSize,
            lineHeight,
            tracking,
            usesProportionalType(slice.level, config.wrapMode),
            bookFontCssFamily(fontIdForLevel(fontFamilies, slice.level)),
          )}
          onBeginEdit={() => beginEdit(slice)}
          onEndEdit={endEdit}
          onChangeText={(text) => commitSliceText(slice.blockId, text)}
          onCaret={(offset) => reportCaret(slice.blockId, offset)}
          onKeyDown={(event) => handleKeyDown(event, slice)}
          onCompositionStart={() => {
            composingRef.current = true;
            if (!frozenPages) setFrozenPages(livePages);
            onComposingChange?.(true);
          }}
          onCompositionEnd={() => {
            composingRef.current = false;
            if (!spanEditRef.current) setFrozenPages(null);
            onComposingChange?.(false);
          }}
        />
      );
    });
  }

  return (
    <div
      className={`bv-paged-sheet ${
        layout === "photo" ? "bv-sheet--photo" : ""
      } ${className}`}
      style={sheetStyle}
      onClick={
        editable
          ? () => {
              if (!composingRef.current) onSelectBlock?.(null);
            }
          : undefined
      }
    >
      {/* 背面 → 本文 → 前面（完成プレビューのフリップでも重ね順を保つ） */}
      <FreeBlockLayer
        blocks={freeBlocks}
        metrics={metrics}
        scale={rndScale}
        interactive={editable}
        selectedBlockId={selectedBlockId}
        plane="under"
        onSelectBlock={onSelectBlock}
        onChangeFreeFrame={onChangeFreeFrame}
        onChangeText={onChangeFreeText}
        onGuidesChange={editable ? setGuides : undefined}
      />

      <div style={innerStyle} className="bv-paged-sheet__inner">
        {headerText ? (
          <div
            className={`bv-running-header bv-running-header--${headerAlign}`}
            style={{
              height: padT,
              fontSize: Math.max(8, Math.min(11, fontSize * 0.65)),
            }}
          >
            <span className="bv-running-header__text">{headerText}</span>
          </div>
        ) : null}

        <div
          className={[
            "bv-paged-typearea",
            vertical
              ? "bv-paged-typearea--vertical"
              : "bv-paged-typearea--horizontal",
            columnCount > 1
              ? vertical
                ? "bv-paged-typearea--tiers"
                : "bv-paged-typearea--cols"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={typeAreaStyle}
        >
          {columnCount <= 1 ? (
            <div
              className="bv-paged-view"
              ref={viewRef}
              style={columnViewStyle()}
            >
              {renderColumnSlices(columnSlices[0] ?? [], 0)}
            </div>
          ) : (
            Array.from({ length: columnCount }, (_, col) => {
              const slices = columnSlices[col] ?? [];
              const tierStyle: CSSProperties = vertical
                ? {
                    // 上下２段: 上→下
                    top: col * (colInline + colGap),
                    left: 0,
                    width: colBlock,
                    height: colInline,
                  }
                : {
                    // 左右２段: 左→右
                    top: 0,
                    left: col * (colInline + colGap),
                    width: colInline,
                    height: colBlock,
                  };
              return (
                <div
                  key={col}
                  className="bv-paged-column"
                  style={tierStyle}
                >
                  <div
                    className="bv-paged-view"
                    ref={col === 0 ? viewRef : undefined}
                    style={columnViewStyle()}
                  >
                    {renderColumnSlices(slices, col)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 最終段の最終列／行のひとつ後ろ（満杯なら余白）。writing-mode は継承しない */}
        {page.manualBreakAfter && page.manualBreakId ? (
          <div
            className={[
              "bv-page-break-mark",
              vertical
                ? "bv-page-break-mark--vertical"
                : "bv-page-break-mark--horizontal",
              editable && onRemovePageBreak
                ? ""
                : "bv-page-break-mark--static",
            ]
              .filter(Boolean)
              .join(" ")}
            style={pageBreakMarkStyle({
              vertical,
              pageW,
              pageH,
              padT,
              padB,
              padL,
              areaW,
              areaH,
              cellInline,
              cellBlock,
              linesPerPage: metrics.linesPerPage,
              usedLineCount: page.lastColumnUsedLineCount ?? page.usedLineCount ?? 0,
              columns: columnCount,
              columnGap: colGap,
              columnInlineSize: colInline,
              columnBlockSize: colBlock,
              lastColumnIndex: page.lastColumnIndex ?? 0,
            })}
            // サムネイルの外枠が <button> のため、ここは button にしない
            role={editable && onRemovePageBreak ? "button" : undefined}
            tabIndex={editable && onRemovePageBreak ? 0 : undefined}
            aria-label={
              editable && onRemovePageBreak
                ? copy.edit.toolbar.pageBreakMarkHint
                : undefined
            }
            title={
              editable && onRemovePageBreak
                ? copy.edit.toolbar.pageBreakMarkHint
                : copy.edit.toolbar.pageBreak
            }
            onMouseDown={
              editable && onRemovePageBreak
                ? (event) => {
                    event.stopPropagation();
                  }
                : undefined
            }
            onClick={
              editable && onRemovePageBreak
                ? (event) => {
                    event.stopPropagation();
                    (event.currentTarget as HTMLDivElement).focus();
                  }
                : undefined
            }
            onKeyDown={
              editable && onRemovePageBreak
                ? (event) => {
                    if (
                      event.key === "Delete" ||
                      event.key === "Backspace"
                    ) {
                      event.preventDefault();
                      event.stopPropagation();
                      if (page.manualBreakId) {
                        onRemovePageBreak(page.manualBreakId);
                      }
                    }
                  }
                : undefined
            }
          >
            <span className="bv-page-break-mark__line" />
            <span className="bv-page-break-mark__label">
              {copy.edit.toolbar.pageBreakMark}
            </span>
            <span className="bv-page-break-mark__line" />
          </div>
        ) : null}

        {folioText ? (
          <div
            className={`bv-folio bv-folio--${folioAlign}`}
            style={{
              height: padB,
              fontSize: Math.max(8, Math.min(11, fontSize * 0.65)),
            }}
          >
            {folioText}
          </div>
        ) : null}
      </div>

      <FreeBlockLayer
        blocks={freeBlocks}
        metrics={metrics}
        scale={rndScale}
        interactive={editable}
        selectedBlockId={selectedBlockId}
        plane="over"
        onSelectBlock={onSelectBlock}
        onChangeFreeFrame={onChangeFreeFrame}
        onChangeText={onChangeFreeText}
        onGuidesChange={editable ? setGuides : undefined}
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
    </div>
  );
}

/**
 * 区切りマークの用紙内座標。
 * 縦書き: 右から数えて最終使用列のひとつ左（満杯なら左余白）。
 * 横書き: 上から数えて最終使用行のひとつ下（満杯なら下余白）。
 */
function pageBreakMarkStyle(args: {
  vertical: boolean;
  pageW: number;
  pageH: number;
  padT: number;
  padB: number;
  padL: number;
  areaW: number;
  areaH: number;
  cellInline: number;
  cellBlock: number;
  linesPerPage: number;
  usedLineCount: number;
  columns?: number;
  columnGap?: number;
  columnInlineSize?: number;
  columnBlockSize?: number;
  lastColumnIndex?: number;
}): CSSProperties {
  const {
    vertical,
    pageW,
    pageH,
    padT,
    padB,
    padL,
    areaW,
    areaH,
    cellInline,
    cellBlock,
    linesPerPage,
    usedLineCount,
    columns = 1,
    columnGap = 0,
    columnInlineSize = areaW,
    columnBlockSize = areaH,
    lastColumnIndex = 0,
  } = args;
  const slot = pageBreakMarkSlot(usedLineCount, linesPerPage);
  const inMargin = slot >= Math.max(1, Math.floor(linesPerPage));
  const col = Math.max(0, Math.min(lastColumnIndex, Math.max(0, columns - 1)));

  if (vertical) {
    // 上下段: 段の top オフセット＋その段内の高さで目印を置く
    const tierTop = padT + col * (columnInlineSize + columnGap);
    const markW = 11;
    const inset = Math.max(8, columnInlineSize * 0.06);
    let left: number;
    if (inMargin) {
      left = Math.max(2, (padL - markW) / 2);
    } else {
      const cell = Math.max(1, cellInline);
      left = padL + columnBlockSize - (slot + 0.5) * cell - markW / 2;
      left = Math.max(2, Math.min(left, pageW - markW - 2));
    }
    return {
      top: tierTop + inset,
      left,
      width: markW,
      height: Math.max(24, columnInlineSize - inset * 2),
    };
  }

  // 左右段: 段の left オフセット＋その段内の行位置
  const colLeft = padL + col * (columnInlineSize + columnGap);
  const markH = 11;
  const inset = Math.max(8, columnInlineSize * 0.06);
  let top: number;
  if (inMargin) {
    top = Math.max(
      padT + areaH + 2,
      pageH - padB / 2 - markH / 2,
    );
    top = Math.min(top, pageH - markH - 2);
  } else {
    const cell = Math.max(1, cellBlock);
    top = padT + (slot + 0.5) * cell - markH / 2;
    top = Math.max(2, Math.min(top, pageH - markH - 2));
  }
  return {
    top,
    left: colLeft + inset,
    width: Math.max(24, columnInlineSize - inset * 2),
    height: markH,
  };
}

/**
 * 版面グリッドへの字取り。
 * fontSize / line-height / letter-spacing は印字エリア逆算値を使う。
 */
function sliceStyle(
  level: TextLevel,
  fontSize: number,
  lineHeight: number,
  tracking: number,
  _proportional: boolean,
  fontFamily: string,
): CSSProperties {
  const scale = levelFontScale(level);
  return {
    fontSize: fontSize * scale,
    lineHeight: `${lineHeight * scale}px`,
    letterSpacing: `${tracking * scale}px`,
    fontFamily,
  };
}

/**
 * 表示と入力が同じ要素。
 * ブラウザ純正のキャレット・矢印キー・IME をそのまま使う。
 */
function EditableSlice({
  blockId,
  text,
  level,
  editable,
  active,
  selected,
  placeholder,
  style,
  onBeginEdit,
  onEndEdit,
  onChangeText,
  onCaret,
  onKeyDown,
  onCompositionStart,
  onCompositionEnd,
}: {
  blockId: string;
  text: string;
  level: TextLevel;
  editable: boolean;
  /** この要素を編集中か。編集中は DOM 側を正とする */
  active: boolean;
  selected: boolean;
  placeholder: string;
  style: CSSProperties;
  onBeginEdit: () => void;
  onEndEdit: () => void;
  onChangeText: (text: string) => void;
  onCaret: (offsetInSlice: number) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  onCompositionStart: () => void;
  onCompositionEnd: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // 外からの本文変更を DOM へ反映。編集中は触らない。非編集時は {{id}} を強調
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active || document.activeElement === el) return;
    const normalized = normalizeEditableText(text);
    if (readEditableText(el) === normalized && el.querySelector(".bv-var-token")) {
      return;
    }
    if (normalized.includes("{{")) {
      el.innerHTML = highlightVariablesHtml(normalized);
    } else {
      syncEditableText(el, normalized);
    }
  }, [text, active]);

  function emit() {
    const el = ref.current;
    if (!el) return;
    onChangeText(readEditableText(el));
  }

  function emitCaret() {
    const el = ref.current;
    if (!el) return;
    onCaret(getPlainCaretOffset(el));
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    // 書式なしテキストだけ受け取る（contenteditable の HTML 流入を防ぐ）
    event.preventDefault();
    const plain = event.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, plain);
  }

  const className = [
    "bv-paged-slice",
    `bv-paged-slice--${level}`,
    selected ? "is-selected" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      data-block-id={blockId}
      data-placeholder={placeholder}
      data-empty={text.length === 0 ? "true" : undefined}
      contentEditable={editable ? "plaintext-only" : undefined}
      suppressContentEditableWarning
      spellCheck={false}
      onMouseDown={
        editable
          ? (event) => {
              // 別スライスへ直接切り替え（余白クリックで解除してから選ぶ必要をなくす）
              event.stopPropagation();
              if (!active) onBeginEdit();
            }
          : undefined
      }
      onClick={editable ? (event) => event.stopPropagation() : undefined}
      onFocus={
        editable
          ? () => {
              // 編集開始時は強調 HTML を外し、プレーンテキストにする
              const el = ref.current;
              if (el) syncEditableText(el, text);
              onBeginEdit();
            }
          : undefined
      }
      onBlur={
        editable
          ? () => {
              emit();
              onEndEdit();
            }
          : undefined
      }
      onInput={
        editable
          ? (event) => {
              if (event.currentTarget.dataset.composing === "1") return;
              emit();
              emitCaret();
            }
          : undefined
      }
      onKeyUp={editable ? emitCaret : undefined}
      onMouseUp={editable ? emitCaret : undefined}
      onKeyDown={editable ? onKeyDown : undefined}
      onCompositionStart={
        editable
          ? (event) => {
              event.currentTarget.dataset.composing = "1";
              onCompositionStart();
            }
          : undefined
      }
      onCompositionEnd={
        editable
          ? (event) => {
              delete event.currentTarget.dataset.composing;
              onCompositionEnd();
              emit();
              emitCaret();
            }
          : undefined
      }
      onPaste={editable ? handlePaste : undefined}
    />
  );
}
