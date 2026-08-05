"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  AppWindow,
  ChevronLeft,
  ChevronRight,
  Columns2,
  Expand,
  Heading1,
  ImagePlus,
  Maximize2,
  PanelLeft,
  PanelRight,
  Pilcrow,
  Redo2,
  Scissors,
  Settings2,
  Square,
  Type,
  Undo2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { fmt, useI18n } from "@/i18n";
import {
  findChapterTitle,
  findChapterTitleForBodyPage,
  shouldShowHeaderOnOutline,
} from "./chrome";
import {
  canRedo,
  canUndo,
  clearEditHistory,
  createEditHistory,
  pushEditHistory,
  redoEdit,
  undoEdit,
  type EditHistory,
} from "./editHistory";
import { computePageMetrics } from "./metrics";
import { buildOutline, resolveOutlineFolio, type OutlineEntry } from "./outline";
import OutlineRail from "./OutlineRail";
import PageCanvas from "./PageCanvas";
import PageStage from "./PageStage";
import PagedBodyView from "./PagedBodyView";
import TocSync from "./TocSync";
import type { TocPageSlice } from "./toc";
import {
  layoutConfigFrom,
  normalizeTextNewlines,
  paginateBody,
  type PaginatedPage,
} from "./paginate";
import PropertiesPanel from "./PropertiesPanel";
import { applyLayerAction, type LayerAction } from "./layers";
import {
  isOutlineSoloEntry,
  resolveOutlineSpreadPair,
  type EditorViewMode,
} from "./spread";
import { readImageAsDataUrl } from "./storage";
import { getPaperTheme, paperThemeCssVars } from "./theme";
import {
  applyPageBreakAtCaret,
  bodyOverlayBlocks,
  canAssignCoverOrBackCover,
  createFreeTextBlock,
  createImageBlock,
  createPage,
  createPageBreak,
  createTextBlock,
  fullBleedFrame,
  insertBlankPageAfterBodyColumn,
  insertBodyOverlaySlot,
  isFreeBlock,
  isUniquePageTypeTaken,
  nextZIndex,
  normalizeCoverPageOrder,
  removeBodyColumn,
  removeBodyOverlaySlot,
  removePageBreakMerging,
  syncBodyOverlays,
  type Block,
  type BodyItem,
  type BookData,
  type BookFormat,
  type BookPage,
  type FreeFrame,
  type FreeTextWritingMode,
  type PromptMemo,
  type TextLevel,
} from "./types";

const HISTORY_COALESCE_MS = 800;
const ZOOM_STEP = 0.1;
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 3;
/** 見開きの中央すき間（px） */
const SPREAD_GAP = 12;

/** 編集画面の表示領域 */
type EditChromeMode = "normal" | "immersive" | "browser";

type EditModeProps = {
  book: BookData;
  prompts: PromptMemo[];
  onChangeBook: (patch: Partial<BookData>) => void;
  onChangePrompts: (prompts: PromptMemo[]) => void;
};

/**
 * 制作画面。
 * 本文は文字数ベースのページネーション、表紙などは PageCanvas。
 */
export default function EditMode({
  book,
  prompts,
  onChangeBook,
  onChangePrompts,
}: EditModeProps) {
  const { t } = useI18n();
  const copy = t.apps.bookVisualizer;
  const [outlineIndex, setOutlineIndex] = useState(0);
  const [viewMode, setViewMode] = useState<EditorViewMode>("single");
  const [chromeMode, setChromeMode] = useState<EditChromeMode>("normal");
  const [zoom, setZoom] = useState<number | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [showThumbs, setShowThumbs] = useState(true);
  const [showProps, setShowProps] = useState(true);
  const [imageError, setImageError] = useState("");
  const [historyTick, setHistoryTick] = useState(0);
  /** IME 変換中はページ分割を凍結 */
  const [frozenBodyPages, setFrozenBodyPages] = useState<PaginatedPage[] | null>(
    null,
  );
  /** 目次のページ分割（TocSync が実測して更新） */
  const [tocSlices, setTocSlices] = useState<TocPageSlice[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const addImageRef = useRef<HTMLInputElement>(null);
  const replaceImageRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<EditHistory>(createEditHistory());
  const bookRef = useRef(book);
  const outlineIndexRef = useRef(outlineIndex);
  const coalesceActiveRef = useRef(false);
  const coalesceTimerRef = useRef<number | null>(null);
  /** 本文編集中のキャレット（ページ区切り挿入位置） */
  const bodyCaretRef = useRef<{ blockId: string; offset: number } | null>(
    null,
  );
  /** ページ区切り直後にジャンプするブロック id */
  const pendingNavBlockIdRef = useRef<string | null>(null);

  bookRef.current = book;
  outlineIndexRef.current = outlineIndex;

  /** 通常／ウィンドウ全画面／完全フルスクリーンを切り替える */
  const applyChromeMode = useCallback((mode: EditChromeMode) => {
    setChromeMode(mode);
    const element = rootRef.current;
    if (mode === "browser") {
      if (element && document.fullscreenElement !== element) {
        void element.requestFullscreen?.().catch(() => {
          // ブラウザが拒否したらウィンドウ全画面へ落とす
          setChromeMode("immersive");
        });
      }
      return;
    }
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    }
  }, []);

  // ブラウザ側の Esc などで完全フルスクリーンが解除されたとき
  useEffect(() => {
    function syncFullscreen() {
      if (document.fullscreenElement === rootRef.current) {
        setChromeMode("browser");
        return;
      }
      setChromeMode((mode) => (mode === "browser" ? "immersive" : mode));
    }
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreen);
      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => undefined);
      }
    };
  }, []);

  // ウィンドウ全画面中は背面のスクロールを止める
  useEffect(() => {
    if (chromeMode === "normal") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [chromeMode]);

  // Esc でウィンドウ全画面だけ解除（完全フルスクリーンはブラウザが処理）
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (document.fullscreenElement) return;
      if (chromeMode !== "immersive") return;
      event.preventDefault();
      setChromeMode("normal");
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [chromeMode]);

  const handleTocSyncPages = useCallback(
    (pages: BookPage[]) => {
      // 自動増減は履歴に積まない
      onChangeBook({ pages });
    },
    [onChangeBook],
  );
  const handleTocSlices = useCallback((slices: TocPageSlice[]) => {
    setTocSlices((prev) => {
      if (
        prev.length === slices.length &&
        prev.every(
          (slice, index) =>
            slice.tocIndex === slices[index]?.tocIndex &&
            slice.entries.length === slices[index]?.entries.length &&
            slice.entries.every(
              (entry, entryIndex) =>
                entry.id === slices[index]?.entries[entryIndex]?.id,
            ),
        )
      ) {
        return prev;
      }
      return slices;
    });
  }, []);

  const metrics = computePageMetrics(book.layout, book.format);
  const fontsKey = `${book.format.fontFamilyH1}|${book.format.fontFamilyH2}|${book.format.fontFamilyP}`;
  const levelFonts = useMemo(
    () => ({
      h1: book.format.fontFamilyH1,
      h2: book.format.fontFamilyH2,
      p: book.format.fontFamilyP,
    }),
    [
      book.format.fontFamilyH1,
      book.format.fontFamilyH2,
      book.format.fontFamilyP,
    ],
  );
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
  const liveBodyPages = useMemo(
    () => paginateBody(book.body, layoutConfig),
    [book.body, layoutConfig],
  );

  // 書体変更時は凍結を解除して再ページネーションを反映
  useEffect(() => {
    setFrozenBodyPages(null);
  }, [fontsKey]);
  const bodyPages = frozenBodyPages ?? liveBodyPages;
  const bodyPageCount = Math.max(1, bodyPages.length);
  const outline = useMemo(
    () => buildOutline(book, bodyPageCount),
    [book, bodyPageCount],
  );
  const safeOutlineIndex = Math.max(
    0,
    Math.min(outlineIndex, Math.max(0, outline.length - 1)),
  );
  const currentEntry: OutlineEntry | null = outline[safeOutlineIndex] ?? null;

  const currentPage: BookPage | null =
    currentEntry?.kind === "page"
      ? (book.pages[currentEntry.pageIndex] ?? null)
      : null;

  const currentBodyOverlays = useMemo(
    () => syncBodyOverlays(book.bodyOverlays ?? [], bodyPageCount),
    [book.bodyOverlays, bodyPageCount],
  );

  const selectedBlock: Block | TextBlockLike | null = (() => {
    if (!selectedBlockId) return null;
    if (currentEntry?.kind === "body") {
      const overlay = bodyOverlayBlocks(
        currentBodyOverlays,
        currentEntry.columnIndex,
      ).find((block) => block.id === selectedBlockId);
      if (overlay) return overlay;
      const item = book.body.find(
        (entry) => entry.type === "text" && entry.id === selectedBlockId,
      );
      return item && item.type === "text" ? item : null;
    }
    if (!currentPage) return null;
    return (
      currentPage.blocks.find((block) => block.id === selectedBlockId) ?? null
    );
  })();

  type TextBlockLike = Extract<BodyItem, { type: "text" }>;

  const undoEnabled = canUndo(historyRef.current);
  const redoEnabled = canRedo(historyRef.current);
  void historyTick;

  useEffect(() => {
    return () => {
      if (coalesceTimerRef.current !== null) {
        window.clearTimeout(coalesceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (outlineIndex > outline.length - 1) {
      setOutlineIndex(Math.max(0, outline.length - 1));
    }
  }, [outline.length, outlineIndex]);

  function bumpHistoryUi() {
    setHistoryTick((value) => value + 1);
  }

  function endCoalesce() {
    coalesceActiveRef.current = false;
    if (coalesceTimerRef.current !== null) {
      window.clearTimeout(coalesceTimerRef.current);
      coalesceTimerRef.current = null;
    }
  }

  function rememberBeforeMainEdit(coalesce = false) {
    if (coalesce && coalesceActiveRef.current) {
      if (coalesceTimerRef.current !== null) {
        window.clearTimeout(coalesceTimerRef.current);
      }
      coalesceTimerRef.current = window.setTimeout(() => {
        coalesceActiveRef.current = false;
        coalesceTimerRef.current = null;
      }, HISTORY_COALESCE_MS);
      return;
    }
    pushEditHistory(historyRef.current, {
      body: bookRef.current.body,
      bodyOverlays: bookRef.current.bodyOverlays ?? [],
      pages: bookRef.current.pages,
      outlineIndex: outlineIndexRef.current,
    });
    if (coalesce) {
      coalesceActiveRef.current = true;
      if (coalesceTimerRef.current !== null) {
        window.clearTimeout(coalesceTimerRef.current);
      }
      coalesceTimerRef.current = window.setTimeout(() => {
        coalesceActiveRef.current = false;
        coalesceTimerRef.current = null;
      }, HISTORY_COALESCE_MS);
    } else {
      endCoalesce();
    }
    bumpHistoryUi();
  }

  function discardMainHistory() {
    endCoalesce();
    clearEditHistory(historyRef.current);
    bumpHistoryUi();
  }

  function handleUndo() {
    const restored = undoEdit(historyRef.current, {
      body: bookRef.current.body,
      bodyOverlays: bookRef.current.bodyOverlays ?? [],
      pages: bookRef.current.pages,
      outlineIndex: outlineIndexRef.current,
    });
    if (!restored) return;
    endCoalesce();
    onChangeBook({
      body: restored.body,
      bodyOverlays: restored.bodyOverlays,
      pages: restored.pages,
    });
    setOutlineIndex(restored.outlineIndex);
    setSelectedBlockId(null);
    bumpHistoryUi();
  }

  function handleRedo() {
    const restored = redoEdit(historyRef.current, {
      body: bookRef.current.body,
      bodyOverlays: bookRef.current.bodyOverlays ?? [],
      pages: bookRef.current.pages,
      outlineIndex: outlineIndexRef.current,
    });
    if (!restored) return;
    endCoalesce();
    onChangeBook({
      body: restored.body,
      bodyOverlays: restored.bodyOverlays,
      pages: restored.pages,
    });
    setOutlineIndex(restored.outlineIndex);
    setSelectedBlockId(null);
    bumpHistoryUi();
  }

  function changeBodyText(id: string, text: string) {
    const body = bookRef.current.body.map((item) =>
      item.type === "text" && item.id === id ? { ...item, text } : item,
    );
    bookRef.current = { ...bookRef.current, body };
    rememberBeforeMainEdit(true);
    onChangeBook({ body });
  }

  function insertBodyBlock(level: TextLevel) {
    const block = createTextBlock(level, "");
    rememberBeforeMainEdit();
    const body = [...bookRef.current.body, block];
    onChangeBook({ body });
    setSelectedBlockId(block.id);
    // 本文へフォーカス
    const bodyStart = outline.findIndex((entry) => entry.kind === "body");
    if (bodyStart >= 0) setOutlineIndex(bodyStart);
  }

  function insertPageBreakInBody() {
    if (currentEntry?.kind !== "body") return;

    const findText = (id: string | null | undefined) =>
      id
        ? bookRef.current.body.find(
            (item) => item.type === "text" && item.id === id,
          )
        : undefined;

    // 表示中のページに載っているブロックだけを対象にする（他ページの残像を使わない）
    const page = bodyPages[currentEntry.columnIndex];
    const onThisPage = (id: string | null | undefined) =>
      Boolean(id) && (page?.slices.some((slice) => slice.blockId === id) ?? false);

    // 1) 直前のキャレット位置 → 2) 選択中ブロックの末尾 → 3) 表示ページの末尾
    const caret = bodyCaretRef.current;
    let blockId: string | null = null;
    let offset: number | null = null;

    if (caret && findText(caret.blockId) && onThisPage(caret.blockId)) {
      blockId = caret.blockId;
      offset = caret.offset;
    } else if (findText(selectedBlockId) && onThisPage(selectedBlockId)) {
      blockId = selectedBlockId;
    } else {
      const last = [...(page?.slices ?? [])]
        .reverse()
        .find((slice) => findText(slice.blockId));
      if (last) {
        blockId = last.blockId;
        offset = last.end;
      }
    }

    if (!blockId) {
      // 本文が空：空段落 → 区切り → 空段落
      rememberBeforeMainEdit();
      const after = createTextBlock("p", "");
      onChangeBook({
        body: [
          ...bookRef.current.body,
          createTextBlock("p", ""),
          createPageBreak(),
          after,
        ],
      });
      pendingNavBlockIdRef.current = after.id;
      setSelectedBlockId(after.id);
      return;
    }

    const target = findText(blockId);
    if (!target || target.type !== "text") return;

    const text = normalizeTextNewlines(target.text);
    const at =
      offset === null
        ? text.length
        : Math.max(0, Math.min(text.length, offset));

    const applied = applyPageBreakAtCaret(bookRef.current.body, blockId, at);
    if (!applied) return;

    rememberBeforeMainEdit();
    onChangeBook({ body: applied.body });
    bodyCaretRef.current = { blockId: applied.focusId, offset: 0 };
    pendingNavBlockIdRef.current = applied.focusId;
    setSelectedBlockId(applied.focusId);
  }

  function removePageBreakFromBody(breakId: string) {
    const applied = removePageBreakMerging(book.body, breakId);
    if (!applied) return;
    rememberBeforeMainEdit();
    onChangeBook({ body: applied.body });
    if (applied.focusId) {
      bodyCaretRef.current = {
        blockId: applied.focusId,
        offset: applied.focusOffset,
      };
      pendingNavBlockIdRef.current = applied.focusId;
      setSelectedBlockId(applied.focusId);
    }
  }

  /** 次ページ先頭 Backspace 用。直前が手動区切りなら削除する */
  function handleBackspaceAtSliceStart(blockId: string): boolean {
    const idx = book.body.findIndex(
      (item) => item.type === "text" && item.id === blockId,
    );
    if (idx <= 0) return false;
    const prev = book.body[idx - 1];
    if (!prev || prev.type !== "pageBreak") return false;
    removePageBreakFromBody(prev.id);
    return true;
  }

  // ページ区切り直後、続きブロックがある本文ページへ移動
  useEffect(() => {
    const focusId = pendingNavBlockIdRef.current;
    if (!focusId) return;
    pendingNavBlockIdRef.current = null;
    const pageIdx = bodyPages.findIndex((page) =>
      page.slices.some((slice) => slice.blockId === focusId),
    );
    if (pageIdx < 0) return;
    const nextOutline = outline.findIndex(
      (entry) => entry.kind === "body" && entry.columnIndex === pageIdx,
    );
    if (nextOutline >= 0) setOutlineIndex(nextOutline);
  }, [bodyPages, outline]);

  function updateCurrentPageBlocks(blocks: Block[], coalesce = false) {
    if (!currentEntry || currentEntry.kind !== "page") return;
    const pageIndex = currentEntry.pageIndex;
    rememberBeforeMainEdit(coalesce);
    const pages = book.pages.map((item, index) =>
      index === pageIndex ? { ...item, blocks } : item,
    );
    onChangeBook({ pages });
  }

  /** 本文ページ上の自由配置を更新する */
  function updateBodyOverlayBlocks(
    columnIndex: number,
    blocks: Block[],
    coalesce = false,
  ) {
    rememberBeforeMainEdit(coalesce);
    const overlays = syncBodyOverlays(
      bookRef.current.bodyOverlays ?? [],
      bodyPageCount,
    );
    const next = overlays.slice();
    next[columnIndex] = blocks.filter(isFreeBlock);
    onChangeBook({ bodyOverlays: next });
  }

  function addFreeBlock(block: Block) {
    // 本文ページ上へ直接載せる（本文と重ねられる）
    if (currentEntry?.kind === "body") {
      const existing = bodyOverlayBlocks(
        currentBodyOverlays,
        currentEntry.columnIndex,
      );
      updateBodyOverlayBlocks(currentEntry.columnIndex, [...existing, block]);
      setSelectedBlockId(block.id);
      return;
    }
    if (!currentPage || currentEntry?.kind !== "page") {
      // 固定ページがなければ標準ページを作って載せる
      rememberBeforeMainEdit();
      const page = createPage([block], "standard");
      onChangeBook({ pages: [...book.pages, page] });
      setSelectedBlockId(block.id);
      return;
    }
    updateCurrentPageBlocks([...currentPage.blocks, block]);
    setSelectedBlockId(block.id);
  }

  function changeFreeFrame(id: string, frame: FreeFrame) {
    if (currentEntry?.kind === "body") {
      const existing = bodyOverlayBlocks(
        currentBodyOverlays,
        currentEntry.columnIndex,
      );
      if (!existing.some((block) => block.id === id)) return;
      updateBodyOverlayBlocks(
        currentEntry.columnIndex,
        existing.map((block) =>
          block.id === id && isFreeBlock(block) ? { ...block, frame } : block,
        ),
        true,
      );
      return;
    }
    if (!currentPage) return;
    updateCurrentPageBlocks(
      currentPage.blocks.map((block) =>
        block.id === id && isFreeBlock(block) ? { ...block, frame } : block,
      ),
      true,
    );
  }

  function changeFreeText(id: string, text: string) {
    if (currentEntry?.kind === "body") {
      const existing = bodyOverlayBlocks(
        currentBodyOverlays,
        currentEntry.columnIndex,
      );
      if (!existing.some((block) => block.id === id)) return;
      updateBodyOverlayBlocks(
        currentEntry.columnIndex,
        existing.map((block) =>
          block.id === id && block.type === "freeText"
            ? { ...block, text }
            : block,
        ),
        true,
      );
      return;
    }
    if (!currentPage) return;
    updateCurrentPageBlocks(
      currentPage.blocks.map((block) =>
        block.id === id && block.type === "freeText"
          ? { ...block, text }
          : block,
      ),
      true,
    );
  }

  function changeFormat(patch: Partial<BookFormat>) {
    discardMainHistory();
    onChangeBook({ format: { ...book.format, ...patch } });
  }

  function changePageType(pageType: BookPage["pageType"]) {
    if (!currentEntry || currentEntry.kind !== "page" || !currentPage) return;
    if (
      isUniquePageTypeTaken(book.pages, pageType, currentPage.id) &&
      pageType !== currentPage.pageType
    ) {
      return;
    }
    if (
      (pageType === "cover" || pageType === "backCover") &&
      pageType !== currentPage.pageType &&
      !canAssignCoverOrBackCover(pageType, currentPage.id, book.pages)
    ) {
      return;
    }
    discardMainHistory();
    const pages = normalizeCoverPageOrder(
      book.pages.map((item, index) =>
        index === currentEntry.pageIndex
          ? {
              ...item,
              pageType,
              blocks: item.blocks.filter((block) => block.type !== "text"),
            }
          : item,
      ),
    );
    onChangeBook({ pages });
    setSelectedBlockId(null);
  }

  /** いま選んでいるページの直後に、新しいページを追加する */
  function addPageAfterCurrent() {
    const entry = currentEntry;
    rememberBeforeMainEdit();

    // 本文ページ：空白の本文ページを直後へ差し込む
    if (entry?.kind === "body") {
      const applied = insertBlankPageAfterBodyColumn(
        bookRef.current.body,
        bodyPages,
        entry.columnIndex,
      );
      if (!applied) return;
      onChangeBook({
        body: applied.body,
        bodyOverlays: insertBodyOverlaySlot(
          bookRef.current.bodyOverlays ?? [],
          entry.columnIndex,
        ),
      });
      pendingNavBlockIdRef.current = applied.focusId;
      setSelectedBlockId(applied.focusId);
      return;
    }

    // 固定ページ：選択ページの次の位置へ標準ページを挿入
    const page = createPage([], "standard");
    const pages = [...book.pages];
    if (!entry || entry.kind !== "page") {
      const ordered = normalizeCoverPageOrder([...pages, page]);
      onChangeBook({ pages: ordered });
      const pageIndex = ordered.findIndex((item) => item.id === page.id);
      const nextOutline = buildOutline(
        { ...book, pages: ordered },
        bodyPageCount,
      );
      const nextIndex = nextOutline.findIndex(
        (item) => item.kind === "page" && item.pageIndex === pageIndex,
      );
      if (nextIndex >= 0) setOutlineIndex(nextIndex);
      return;
    }

    // 裏表紙の「次」は作れないので、直前（中身側）へ入れる
    const insertAt =
      entry.pageType === "backCover" ? entry.pageIndex : entry.pageIndex + 1;
    pages.splice(insertAt, 0, page);
    const ordered = normalizeCoverPageOrder(pages);
    onChangeBook({ pages: ordered });
    setSelectedBlockId(null);

    const pageIndex = ordered.findIndex((item) => item.id === page.id);
    const nextOutline = buildOutline(
      { ...book, pages: ordered },
      bodyPageCount,
    );
    const nextIndex = nextOutline.findIndex(
      (item) => item.kind === "page" && item.pageIndex === pageIndex,
    );
    if (nextIndex >= 0) setOutlineIndex(nextIndex);
  }

  function removeOutlineEntry(index: number) {
    const entry = outline[index];
    if (!entry) return;

    if (entry.kind === "body") {
      if (
        !window.confirm(copy.edit.thumbnails.confirmRemoveBodyPage)
      ) {
        return;
      }
      const applied = removeBodyColumn(
        bookRef.current.body,
        bodyPages,
        entry.columnIndex,
      );
      if (!applied) return;
      rememberBeforeMainEdit();
      onChangeBook({
        body: applied.body,
        bodyOverlays: removeBodyOverlaySlot(
          bookRef.current.bodyOverlays ?? [],
          entry.columnIndex,
        ),
      });
      if (applied.focusId) {
        bodyCaretRef.current = {
          blockId: applied.focusId,
          offset: applied.focusOffset,
        };
        pendingNavBlockIdRef.current = applied.focusId;
        setSelectedBlockId(applied.focusId);
      } else {
        setSelectedBlockId(null);
      }
      setOutlineIndex(Math.max(0, index - 1));
      return;
    }

    if (book.pages.length <= 0) return;
    if (!window.confirm(copy.edit.toolbar.confirmRemovePage)) return;
    rememberBeforeMainEdit();
    const pages = book.pages.filter((_, i) => i !== entry.pageIndex);
    onChangeBook({ pages });
    setSelectedBlockId(null);
    setOutlineIndex(Math.max(0, index - 1));
  }

  function reorderPages(pages: BookPage[], focusPageIndex: number) {
    rememberBeforeMainEdit();
    const ordered = normalizeCoverPageOrder(pages);
    const focusId = pages[focusPageIndex]?.id;
    const focusIndex = focusId
      ? ordered.findIndex((page) => page.id === focusId)
      : focusPageIndex;
    onChangeBook({ pages: ordered });
    const next = buildOutline(
      { ...book, pages: ordered },
      bodyPageCount,
    ).findIndex(
      (entry) =>
        entry.kind === "page" && entry.pageIndex === Math.max(0, focusIndex),
    );
    if (next >= 0) setOutlineIndex(next);
  }

  function patchSelectedFromPanel(patch: Partial<Block>) {
    if (!selectedBlock) return;
    if (selectedBlock.type === "text" && currentEntry?.kind === "body") {
      rememberBeforeMainEdit();
      const body = book.body.map((item) =>
        item.type === "text" && item.id === selectedBlock.id
          ? { ...item, ...patch, type: "text" as const, id: item.id }
          : item,
      );
      onChangeBook({ body: body as BodyItem[] });
      return;
    }
    if (currentEntry?.kind === "body" && isFreeBlock(selectedBlock)) {
      const existing = bodyOverlayBlocks(
        currentBodyOverlays,
        currentEntry.columnIndex,
      );
      updateBodyOverlayBlocks(
        currentEntry.columnIndex,
        existing.map((block) =>
          block.id === selectedBlock.id
            ? ({ ...block, ...patch } as Block)
            : block,
        ),
      );
      return;
    }
    if (!currentPage) return;
    updateCurrentPageBlocks(
      currentPage.blocks.map((block) =>
        block.id === selectedBlock.id
          ? ({ ...block, ...patch } as Block)
          : block,
      ),
    );
  }

  function imageErrorMessage(reason: "type" | "size" | "read"): string {
    if (reason === "type") return copy.edit.image.typeError;
    if (reason === "size") return copy.edit.image.sizeError;
    return copy.edit.image.readError;
  }

  async function handleAddImage(file: File | undefined) {
    if (!file) return;
    setImageError("");
    const result = await readImageAsDataUrl(file);
    if (!result.ok) {
      setImageError(imageErrorMessage(result.reason));
      return;
    }
    const z =
      currentEntry?.kind === "body"
        ? nextZIndex(
            bodyOverlayBlocks(currentBodyOverlays, currentEntry.columnIndex),
          )
        : currentPage
          ? nextZIndex(currentPage.blocks)
          : 1;
    addFreeBlock(createImageBlock(result.dataUrl, z));
  }

  async function handleReplaceImage(file: File | undefined) {
    if (!file || !selectedBlock || selectedBlock.type !== "image") return;
    setImageError("");
    const result = await readImageAsDataUrl(file);
    if (!result.ok) {
      setImageError(imageErrorMessage(result.reason));
      return;
    }
    patchSelectedFromPanel({ dataUrl: result.dataUrl });
  }

  const zoomPercentLabel =
    zoom === null
      ? copy.edit.toolbar.zoomFit
      : `${Math.round(zoom * 100)}%`;

  /** 表紙・裏表紙は見開きに組まない */
  const forceSingle =
    currentEntry != null && isOutlineSoloEntry(currentEntry);
  const showSpread = viewMode === "spread" && !forceSingle;
  const spreadPair = showSpread
    ? resolveOutlineSpreadPair(
        safeOutlineIndex,
        outline,
        book.format.paperSize,
      )
    : null;
  const stageWidth = showSpread
    ? metrics.width * 2 + SPREAD_GAP
    : metrics.width;

  function renderOutlineSheet(
    entryIndex: number,
    options: { interactive: boolean; scale?: number },
  ) {
    const sheetScale = options.scale ?? 1;
    const entry = outline[entryIndex];
    if (!entry) {
      return (
        <div
          className="bv-sheet bv-sheet--blank"
          style={{ width: metrics.width, height: metrics.height }}
        />
      );
    }

    const sheetFolio = resolveOutlineFolio(book, outline, entryIndex);
    const sheetFolioText = sheetFolio !== null ? String(sheetFolio) : "";
    // 柱「章」: そのページ読み始め時点の章名
    const sheetHeaderRaw =
      book.format.headerMode === "none"
        ? ""
        : book.format.headerMode === "title"
          ? book.title.trim()
          : entry.kind === "body"
            ? findChapterTitleForBodyPage(
                book,
                bodyPages,
                entry.columnIndex,
              ) || book.title.trim()
            : findChapterTitle(book, entry.pageIndex) || book.title.trim();
    // 見開きの柱（両／左のみ／右のみ）を本文ページでも適用
    const sheetHeader = shouldShowHeaderOnOutline(book, outline, entryIndex)
      ? sheetHeaderRaw
      : "";

    if (entry.kind === "body") {
      return (
        <PagedBodyView
          key={`body-${fontsKey}`}
          body={book.body}
          layout={book.layout}
          metrics={metrics}
          fontFamilies={levelFonts}
          pageIndex={entry.columnIndex}
          pages={bodyPages}
          editable={options.interactive}
          selectedBlockId={selectedBlockId}
          onSelectBlock={
            options.interactive ? setSelectedBlockId : undefined
          }
          onChangeText={options.interactive ? changeBodyText : undefined}
          onComposingChange={
            options.interactive
              ? (composing) => {
                  if (composing) setFrozenBodyPages(liveBodyPages);
                  else setFrozenBodyPages(null);
                }
              : undefined
          }
          onCaretChange={
            options.interactive
              ? (caret) => {
                  bodyCaretRef.current = caret;
                }
              : undefined
          }
          onRequestPageBreak={
            options.interactive ? insertPageBreakInBody : undefined
          }
          onRemovePageBreak={
            options.interactive ? removePageBreakFromBody : undefined
          }
          onBackspaceAtSliceStart={
            options.interactive ? handleBackspaceAtSliceStart : undefined
          }
          headerText={sheetHeader}
          folioText={
            book.format.folioOnPageTypes.standard ? sheetFolioText : ""
          }
          headerAlign={book.format.headerAlign}
          folioAlign={book.format.folioAlign}
          interactionScale={sheetScale}
          freeBlocks={bodyOverlayBlocks(
            currentBodyOverlays,
            entry.columnIndex,
          )}
          onChangeFreeFrame={
            options.interactive ? changeFreeFrame : undefined
          }
          onChangeFreeText={options.interactive ? changeFreeText : undefined}
        />
      );
    }

    const page = book.pages[entry.pageIndex];
    if (!page) {
      return (
        <div
          className="bv-sheet bv-sheet--blank"
          style={{ width: metrics.width, height: metrics.height }}
        />
      );
    }

    return (
      <PageCanvas
        book={book}
        page={page}
        pageIndex={entry.pageIndex}
        metrics={metrics}
        interactionScale={sheetScale}
        interactive={options.interactive}
        allowDirectInput={options.interactive}
        selectedBlockId={options.interactive ? selectedBlockId : null}
        onSelectBlock={options.interactive ? setSelectedBlockId : undefined}
        onChangeText={options.interactive ? changeFreeText : undefined}
        onChangeFreeFrame={
          options.interactive ? changeFreeFrame : undefined
        }
        headerTextOverride={sheetHeader}
        bodyPages={bodyPages}
        tocSlices={tocSlices}
      />
    );
  }

  const propertiesPanel = (
    <PropertiesPanel
      book={book}
      currentPage={currentPage}
      onChangeBook={(patch) => {
        discardMainHistory();
        onChangeBook(patch);
      }}
      onChangeFormat={changeFormat}
      onChangePage={(patch) => {
        if (patch.pageType) changePageType(patch.pageType);
      }}
      selectedBlock={selectedBlock as Block | null}
      onChangeLevel={(level) => patchSelectedFromPanel({ level })}
      onChangeCaption={(caption) => patchSelectedFromPanel({ caption })}
      onChangeFontScale={(fontScale) => patchSelectedFromPanel({ fontScale })}
      onChangeWritingMode={(writingMode: FreeTextWritingMode) =>
        patchSelectedFromPanel({ writingMode })
      }
      onChangeBlockFontFamily={(fontFamily) =>
        patchSelectedFromPanel({ fontFamily })
      }
      onReplaceImage={() => replaceImageRef.current?.click()}
      onFullBleed={() =>
        patchSelectedFromPanel({ frame: fullBleedFrame() })
      }
      onLayerAction={(action: LayerAction) => {
        if (!selectedBlock || !isFreeBlock(selectedBlock)) return;
        if (currentEntry?.kind === "body") {
          const existing = bodyOverlayBlocks(
            currentBodyOverlays,
            currentEntry.columnIndex,
          );
          updateBodyOverlayBlocks(
            currentEntry.columnIndex,
            applyLayerAction(existing, selectedBlock.id, action),
          );
          return;
        }
        if (!currentPage) return;
        updateCurrentPageBlocks(
          applyLayerAction(currentPage.blocks, selectedBlock.id, action),
        );
      }}
      onMoveBlock={(delta) => {
        if (currentEntry?.kind === "body" && selectedBlock?.type === "text") {
          const idx = book.body.findIndex(
            (item) => item.type === "text" && item.id === selectedBlock.id,
          );
          if (idx < 0) return;
          const next = idx + delta;
          if (next < 0 || next >= book.body.length) return;
          rememberBeforeMainEdit();
          const body = [...book.body];
          const [moved] = body.splice(idx, 1);
          body.splice(next, 0, moved);
          onChangeBook({ body });
          return;
        }
        if (!currentPage || !selectedBlock) return;
        const idx = currentPage.blocks.findIndex(
          (block) => block.id === selectedBlock.id,
        );
        const next = idx + delta;
        if (idx < 0 || next < 0 || next >= currentPage.blocks.length) return;
        const blocks = [...currentPage.blocks];
        const [moved] = blocks.splice(idx, 1);
        blocks.splice(next, 0, moved);
        updateCurrentPageBlocks(blocks);
      }}
      onRemoveBlock={() => {
        if (!selectedBlock) return;
        if (!window.confirm(copy.edit.block.confirmRemove)) {
          return;
        }
        if (currentEntry?.kind === "body" && selectedBlock.type === "text") {
          rememberBeforeMainEdit();
          onChangeBook({
            body: book.body.filter(
              (item) =>
                !(item.type === "text" && item.id === selectedBlock.id),
            ),
          });
          setSelectedBlockId(null);
          return;
        }
        if (currentEntry?.kind === "body" && isFreeBlock(selectedBlock)) {
          const existing = bodyOverlayBlocks(
            currentBodyOverlays,
            currentEntry.columnIndex,
          );
          updateBodyOverlayBlocks(
            currentEntry.columnIndex,
            existing.filter((block) => block.id !== selectedBlock.id),
          );
          setSelectedBlockId(null);
          return;
        }
        if (!currentPage) return;
        updateCurrentPageBlocks(
          currentPage.blocks.filter((block) => block.id !== selectedBlock.id),
        );
        setSelectedBlockId(null);
      }}
      prompts={prompts}
      onChangePrompts={onChangePrompts}
    />
  );

  const viewModeIndex = viewMode === "spread" ? 1 : 0;
  const chromeModeIndex =
    chromeMode === "browser" ? 2 : chromeMode === "immersive" ? 1 : 0;
  // プレビューと同じ紙色・テクスチャを編集紙面にも載せる
  const paperTheme = getPaperTheme(book.format.paperSize);
  const paperThemeStyle = paperTheme.digital
    ? undefined
    : paperThemeCssVars(paperTheme);

  return (
    <div
      ref={rootRef}
      data-chrome={chromeMode}
      data-paper-theme={paperTheme.id}
      data-paper-texture={paperTheme.texture}
      data-digital={paperTheme.digital ? "true" : "false"}
      style={paperThemeStyle}
      className="bv-studio flex h-full min-h-0 max-h-full flex-1 flex-col overflow-hidden rounded-xl border border-zinc-800 lg:flex-row"
    >
      <div
        className={`bv-edit-rail bv-edit-rail--thumbs ${showThumbs ? "is-open" : ""}`}
        aria-hidden={!showThumbs}
      >
        <div className="bv-edit-rail__clip">
          <div className="bv-edit-rail__body">
            <OutlineRail
              book={book}
              outline={outline}
              currentIndex={safeOutlineIndex}
              metrics={metrics}
              bodyPages={bodyPages}
              tocSlices={tocSlices}
              onSelect={setOutlineIndex}
              onAddPage={addPageAfterCurrent}
              onReorderPages={reorderPages}
              onRemoveEntry={removeOutlineEntry}
            />
          </div>
        </div>
      </div>

      <TocSync
        book={book}
        metrics={metrics}
        bodyPages={bodyPages}
        onSyncPages={handleTocSyncPages}
        onSlices={handleTocSlices}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 p-2 sm:p-3">
        <div className="bv-ui-surface flex min-w-0 flex-nowrap items-center gap-0.5 overflow-x-auto rounded-xl px-1.5 py-1">
          <button
            type="button"
            className="bv-ui-icon-btn bv-ui-icon-btn--sm"
            data-active={showThumbs}
            aria-pressed={showThumbs}
            title={copy.edit.toolbar.togglePagesHint}
            aria-label={copy.edit.toolbar.togglePages}
            onClick={() => setShowThumbs((value) => !value)}
          >
            <PanelLeft className="size-3.5" aria-hidden />
          </button>
          <button
            type="button"
            className="bv-ui-icon-btn bv-ui-icon-btn--sm bv-ui-lg-only"
            data-active={showProps}
            aria-pressed={showProps}
            title={copy.edit.toolbar.toggleSettingsHint}
            aria-label={copy.edit.toolbar.toggleSettings}
            onClick={() => setShowProps((value) => !value)}
          >
            <PanelRight className="size-3.5" aria-hidden />
          </button>
          <button
            type="button"
            className="bv-ui-icon-btn bv-ui-icon-btn--sm bv-ui-sm-only"
            title={copy.edit.panel.openLabel}
            aria-label={copy.edit.panel.openLabel}
            onClick={() => setPanelOpen(true)}
          >
            <Settings2 className="size-3.5" aria-hidden />
          </button>

          <span className="mx-0.5 h-4 w-px shrink-0 bg-zinc-800" aria-hidden />

          <button
            type="button"
            className="bv-ui-icon-btn bv-ui-icon-btn--sm"
            disabled={!undoEnabled}
            onClick={handleUndo}
            title={`${copy.edit.toolbar.undo}（${copy.edit.toolbar.undoHint}）`}
            aria-label={copy.edit.toolbar.undo}
          >
            <Undo2 className="size-3.5" aria-hidden />
          </button>
          <button
            type="button"
            className="bv-ui-icon-btn bv-ui-icon-btn--sm"
            disabled={!redoEnabled}
            onClick={handleRedo}
            title={`${copy.edit.toolbar.redo}（${copy.edit.toolbar.redoHint}）`}
            aria-label={copy.edit.toolbar.redo}
          >
            <Redo2 className="size-3.5" aria-hidden />
          </button>

          <span className="mx-0.5 h-4 w-px shrink-0 bg-zinc-800" aria-hidden />

          <button
            type="button"
            className="bv-ui-icon-btn bv-ui-icon-btn--sm"
            disabled={safeOutlineIndex <= 0}
            onClick={() => setOutlineIndex((value) => Math.max(0, value - 1))}
            title={copy.edit.toolbar.prev}
            aria-label={copy.edit.toolbar.prev}
          >
            <ChevronLeft className="size-3.5" aria-hidden />
          </button>
          <span className="shrink-0 min-w-[4.5rem] px-0.5 text-center text-[10px] tabular-nums text-zinc-400">
            {fmt(copy.edit.toolbar.pageLabel, {
              current: String(safeOutlineIndex + 1),
              total: String(Math.max(1, outline.length)),
            })}
          </span>
          <button
            type="button"
            className="bv-ui-icon-btn bv-ui-icon-btn--sm"
            disabled={safeOutlineIndex >= outline.length - 1}
            onClick={() =>
              setOutlineIndex((value) =>
                Math.min(outline.length - 1, value + 1),
              )
            }
            title={copy.edit.toolbar.next}
            aria-label={copy.edit.toolbar.next}
          >
            <ChevronRight className="size-3.5" aria-hidden />
          </button>

          <button
            type="button"
            // 押した瞬間に本文が blur するとキャレット位置を失うため、
            // フォーカス移動を止めてから区切りを挿入する
            onMouseDown={(event) => event.preventDefault()}
            onClick={insertPageBreakInBody}
            disabled={currentEntry?.kind !== "body"}
            title={copy.edit.toolbar.pageBreakHint}
            aria-label={copy.edit.toolbar.pageBreak}
            className="bv-ui-icon-btn bv-ui-icon-btn--sm ml-auto"
          >
            <Scissors className="size-3.5" aria-hidden />
          </button>
        </div>

        {imageError ? (
          <p className="shrink-0 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2.5 py-1.5 text-[11px] text-amber-300">
            {imageError}
          </p>
        ) : null}

        <div className="relative min-h-0 flex-1">
          {/* ブロック追加：エディタ内左上（アイコンのみ） */}
          <div
            role="group"
            aria-label={copy.edit.toolbar.addBlockGroup}
            className="bv-ui-float bv-ui-float--compact absolute left-2 top-2 z-10"
          >
            <button
              type="button"
              className="bv-ui-icon-btn"
              title={copy.edit.toolbar.addHeading}
              aria-label={copy.edit.toolbar.addHeading}
              onClick={() => insertBodyBlock("h1")}
            >
              <Heading1 className="size-3.5" aria-hidden />
            </button>
            <button
              type="button"
              className="bv-ui-icon-btn"
              title={copy.edit.toolbar.addText}
              aria-label={copy.edit.toolbar.addText}
              onClick={() => insertBodyBlock("p")}
            >
              <Pilcrow className="size-3.5" aria-hidden />
            </button>
            <button
              type="button"
              className="bv-ui-icon-btn"
              title={copy.edit.toolbar.addFreeText}
              aria-label={copy.edit.toolbar.addFreeText}
              onClick={() =>
                addFreeBlock(
                  createFreeTextBlock(
                    "",
                    nextZIndex(
                      currentEntry?.kind === "body"
                        ? bodyOverlayBlocks(
                            currentBodyOverlays,
                            currentEntry.columnIndex,
                          )
                        : (currentPage?.blocks ?? []),
                    ),
                    book.layout === "japanese" ? "vertical" : "horizontal",
                    book.format.fontFamilyP,
                  ),
                )
              }
            >
              <Type className="size-3.5" aria-hidden />
            </button>
            <button
              type="button"
              className="bv-ui-icon-btn"
              title={copy.edit.toolbar.addImage}
              aria-label={copy.edit.toolbar.addImage}
              onClick={() => addImageRef.current?.click()}
            >
              <ImagePlus className="size-3.5" aria-hidden />
            </button>
          </div>

          {/* 表示・全画面・拡大縮小：エディタ内右上（1つのコンパクト帯） */}
          <div className="bv-ui-float bv-ui-float--compact absolute right-2 top-2 z-10">
            <div
              role="group"
              aria-label={copy.edit.toolbar.viewModeLabel}
              className="bv-ui-seg bv-ui-seg--icons bv-ui-seg--embedded"
              style={
                {
                  "--bv-seg-count": 2,
                  "--bv-seg-index": viewModeIndex,
                } as CSSProperties
              }
            >
              <span className="bv-ui-seg__thumb" aria-hidden />
              <button
                type="button"
                className="bv-ui-seg__item"
                aria-pressed={viewMode === "single"}
                data-active={viewMode === "single"}
                title={copy.edit.toolbar.viewSingle}
                aria-label={copy.edit.toolbar.viewSingle}
                onClick={() => setViewMode("single")}
              >
                <Square className="size-3.5" aria-hidden />
              </button>
              <button
                type="button"
                className="bv-ui-seg__item"
                aria-pressed={viewMode === "spread"}
                data-active={viewMode === "spread"}
                title={copy.edit.toolbar.viewSpread}
                aria-label={copy.edit.toolbar.viewSpread}
                onClick={() => setViewMode("spread")}
              >
                <Columns2 className="size-3.5" aria-hidden />
              </button>
            </div>

            <span className="bv-ui-float__sep" aria-hidden />

            <div
              role="group"
              aria-label={copy.edit.toolbar.chromeModeLabel}
              className="bv-ui-seg bv-ui-seg--icons bv-ui-seg--embedded"
              style={
                {
                  "--bv-seg-count": 3,
                  "--bv-seg-index": chromeModeIndex,
                } as CSSProperties
              }
            >
              <span className="bv-ui-seg__thumb" aria-hidden />
              <button
                type="button"
                className="bv-ui-seg__item"
                aria-pressed={chromeMode === "normal"}
                data-active={chromeMode === "normal"}
                title={copy.edit.toolbar.chromeNormalHint}
                aria-label={copy.edit.toolbar.chromeNormal}
                onClick={() => applyChromeMode("normal")}
              >
                <AppWindow className="size-3.5" aria-hidden />
              </button>
              <button
                type="button"
                className="bv-ui-seg__item"
                aria-pressed={chromeMode === "immersive"}
                data-active={chromeMode === "immersive"}
                title={copy.edit.toolbar.chromeImmersiveHint}
                aria-label={copy.edit.toolbar.chromeImmersive}
                onClick={() => applyChromeMode("immersive")}
              >
                <Maximize2 className="size-3.5" aria-hidden />
              </button>
              <button
                type="button"
                className="bv-ui-seg__item"
                aria-pressed={chromeMode === "browser"}
                data-active={chromeMode === "browser"}
                title={copy.edit.toolbar.chromeBrowserHint}
                aria-label={copy.edit.toolbar.chromeBrowser}
                onClick={() => applyChromeMode("browser")}
              >
                <Expand className="size-3.5" aria-hidden />
              </button>
            </div>

            <span className="bv-ui-float__sep" aria-hidden />

            <div
              role="group"
              aria-label={copy.edit.toolbar.zoomLabel}
              className="flex items-center"
            >
              <button
                type="button"
                className="bv-ui-icon-btn"
                title={copy.edit.toolbar.zoomOut}
                aria-label={copy.edit.toolbar.zoomOut}
                onClick={() =>
                  setZoom((value) =>
                    value === null
                      ? 1
                      : Math.max(
                          ZOOM_MIN,
                          Number((value - ZOOM_STEP).toFixed(2)),
                        ),
                  )
                }
              >
                <ZoomOut className="size-3.5" aria-hidden />
              </button>
              <button
                type="button"
                className="bv-ui-icon-btn min-w-[2.25rem] tabular-nums text-[10px] font-medium"
                title={`${copy.edit.toolbar.zoomFitHint}（${zoomPercentLabel}）`}
                aria-label={`${copy.edit.toolbar.zoomFit} ${zoomPercentLabel}`}
                onClick={() => setZoom(null)}
              >
                {zoomPercentLabel}
              </button>
              <button
                type="button"
                className="bv-ui-icon-btn"
                title={copy.edit.toolbar.zoomIn}
                aria-label={copy.edit.toolbar.zoomIn}
                onClick={() =>
                  setZoom((value) =>
                    Math.min(
                      ZOOM_MAX,
                      Number(((value ?? 1) + ZOOM_STEP).toFixed(2)),
                    ),
                  )
                }
              >
                <ZoomIn className="size-3.5" aria-hidden />
              </button>
            </div>
          </div>

          <PageStage
            width={stageWidth}
            height={metrics.height}
            zoom={zoom}
            onZoomChange={setZoom}
            interactiveZoom
            className="bv-ui-stage h-full rounded-xl p-3 sm:p-5"
          >
            {(stageScale) =>
              showSpread && spreadPair ? (
                <div
                  className="bv-spread"
                  style={{ width: stageWidth, height: metrics.height }}
                >
                  <SpreadSlot
                    active={spreadPair.leftIndex === safeOutlineIndex}
                    onSelect={
                      spreadPair.leftIndex >= 0
                        ? () => setOutlineIndex(spreadPair.leftIndex)
                        : undefined
                    }
                  >
                    {renderOutlineSheet(spreadPair.leftIndex, {
                      interactive: spreadPair.leftIndex === safeOutlineIndex,
                      scale: stageScale,
                    })}
                  </SpreadSlot>
                  <div
                    className="bv-spread__gutter"
                    style={{ width: SPREAD_GAP }}
                    aria-hidden
                  />
                  <SpreadSlot
                    active={spreadPair.rightIndex === safeOutlineIndex}
                    onSelect={
                      spreadPair.rightIndex >= 0
                        ? () => setOutlineIndex(spreadPair.rightIndex)
                        : undefined
                    }
                  >
                    {renderOutlineSheet(spreadPair.rightIndex, {
                      interactive: spreadPair.rightIndex === safeOutlineIndex,
                      scale: stageScale,
                    })}
                  </SpreadSlot>
                </div>
              ) : (
                renderOutlineSheet(safeOutlineIndex, {
                  interactive: true,
                  scale: stageScale,
                })
              )
            }
          </PageStage>
        </div>
      </div>

      <div
        className={`bv-edit-rail bv-edit-rail--props ${showProps ? "is-open" : ""}`}
        aria-hidden={!showProps}
      >
        <div className="bv-edit-rail__clip">
          <div className="bv-edit-rail__body border-l border-zinc-800 p-2">
            <div className="flex h-full max-h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              {propertiesPanel}
            </div>
          </div>
        </div>
      </div>

      {panelOpen ? (
        <div className="fixed inset-0 z-[80] flex flex-col justify-end lg:hidden">
          <button
            type="button"
            aria-label={copy.edit.panel.closeLabel}
            onClick={() => setPanelOpen(false)}
            className="absolute inset-0 bg-zinc-950/70 backdrop-blur-[2px]"
          />
          <div className="bv-mobile-sheet relative z-10 flex max-h-[80dvh] flex-col overflow-hidden rounded-t-2xl border-t border-zinc-800 bg-zinc-950 p-2 shadow-2xl">
            <div className="flex shrink-0 items-center justify-between px-1 pb-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-100">
                <Settings2 className="size-4 text-zinc-400" aria-hidden />
                {copy.edit.panel.openLabel}
              </span>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="bv-ui-btn bv-ui-btn--sm"
              >
                <X className="size-4" aria-hidden />
                {copy.edit.panel.closeLabel}
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col">{propertiesPanel}</div>
          </div>
        </div>
      ) : null}

      <input
        ref={addImageRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          void handleAddImage(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <input
        ref={replaceImageRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          void handleReplaceImage(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}

function SpreadSlot({
  active,
  onSelect,
  children,
}: {
  active: boolean;
  onSelect?: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className={`bv-spread-slot ${active ? "bv-spread-slot--active" : ""}`}
      onClick={
        onSelect && !active
          ? (event) => {
              event.stopPropagation();
              onSelect();
            }
          : undefined
      }
      role={onSelect && !active ? "button" : undefined}
      tabIndex={onSelect && !active ? 0 : undefined}
      onKeyDown={
        onSelect && !active
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}

