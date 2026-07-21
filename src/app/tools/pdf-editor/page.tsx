"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import AppShell from "@/components/AppShell";
import { fmt, useI18n } from "@/i18n";
import ExportDialog, {
  type ExportDialogMode,
  type ExportDialogValues,
} from "./ExportDialog";
import FileGroupList from "./FileGroupList";
import HistoryToolbar from "./HistoryToolbar";
import PageDragOverlay from "./PageDragOverlay";
import PageFilmstrip from "./PageFilmstrip";
import PagePreviewModal from "./PagePreviewModal";
import PdfUploadZone from "./PdfUploadZone";
import SelectionToolbar from "./SelectionToolbar";
import ViewModeToggle, { type ViewMode } from "./ViewModeToggle";
import {
  createEditorSnapshot,
  createHistoryController,
  pageOrderEquals,
  type EditorSnapshot,
} from "./editorHistory";
import {
  deriveFileGroups,
  duplicateFile,
  isStructureIntact,
  removeFilePages,
  renameFile,
  reorderPagesByFileOrder,
} from "./fileGroups";
import {
  downloadPdfBytes,
  exportMergedPdf,
  loadPdfFromFile,
} from "./pdfUtils";
import {
  createBlankPage,
  nextRotation,
  type PdfPageItem,
  type PdfSource,
} from "./types";
import {
  pasteClipboardPages,
  usePageClipboard,
} from "./usePageClipboard";
import { moveSelectedPages } from "./pageReorder";
import { usePageSelection } from "./usePageSelection";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export default function PdfEditorPage() {
  const { t } = useI18n();
  const copy = t.apps.pdfEditor;
  const dndId = useId();
  const [viewMode, setViewMode] = useState<ViewMode>("page");
  const [pages, setPages] = useState<PdfPageItem[]>([]);
  const [sources, setSources] = useState<Map<string, PdfSource>>(
    () => new Map(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragMoveCount, setDragMoveCount] = useState(1);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [historyTick, setHistoryTick] = useState(0);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportMode, setExportMode] = useState<ExportDialogMode>("full");
  const skipClickAfterDragRef = useRef(false);
  const historyRef = useRef(createHistoryController());

  const pageIds = useMemo(() => pages.map((p) => p.id), [pages]);
  const fileGroups = useMemo(
    () => deriveFileGroups(pages, sources),
    [pages, sources],
  );

  const structureIntact = useMemo(
    () => isStructureIntact(pages, sources),
    [pages, sources],
  );
  const fileModeLocked = !structureIntact;

  const {
    selectedIds,
    selectPage,
    setSelection,
    clearSelection,
    syncSelection,
  } = usePageSelection(pageIds);
  const {
    clipboard,
    clipboardCount,
    hasClipboard,
    copyPages: copyToClipboard,
    clearClipboard,
    restoreClipboard,
  } = usePageClipboard();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const canExport = pages.length > 0 && !isLoading && !isExporting;
  const selectedCount = selectedIds.size;
  const canUndo = historyRef.current.canUndo;
  const canRedo = historyRef.current.canRedo;
  void historyTick;

  const activePage = useMemo(
    () => pages.find((p) => p.id === activeId) ?? null,
    [pages, activeId],
  );

  const activeFileGroup = useMemo(
    () => fileGroups.find((g) => g.sourceId === activeId) ?? null,
    [fileGroups, activeId],
  );

  const previewPage = useMemo(
    () => (previewIndex !== null ? (pages[previewIndex] ?? null) : null),
    [pages, previewIndex],
  );

  const takeSnapshot = useCallback(
    (): EditorSnapshot =>
      createEditorSnapshot(pages, sources, selectedIds, clipboard),
    [pages, sources, selectedIds, clipboard],
  );

  const applySnapshot = useCallback(
    (snapshot: EditorSnapshot) => {
      setPages(snapshot.pages);
      setSources(snapshot.sources);
      setSelection(snapshot.selectedIds);
      restoreClipboard(snapshot.clipboard);
    },
    [restoreClipboard, setSelection],
  );

  /** 編集操作の直前に現在状態を履歴へ保存 */
  const recordHistory = useCallback(() => {
    historyRef.current.push(takeSnapshot());
    setHistoryTick((t) => t + 1);
  }, [takeSnapshot]);

  const handleUndo = useCallback(() => {
    const prev = historyRef.current.undo(takeSnapshot());
    if (!prev) return;
    applySnapshot(prev);
    setHistoryTick((t) => t + 1);
    setMessage(copy.messages.undone);
  }, [applySnapshot, takeSnapshot]);

  const handleRedo = useCallback(() => {
    const next = historyRef.current.redo(takeSnapshot());
    if (!next) return;
    applySnapshot(next);
    setHistoryTick((t) => t + 1);
    setMessage(copy.messages.redone);
  }, [applySnapshot, takeSnapshot]);

  useEffect(() => {
    syncSelection(pageIds);
  }, [pageIds, syncSelection]);

  useEffect(() => {
    if (previewIndex === null) return;
    if (pages.length === 0) {
      setPreviewIndex(null);
      return;
    }
    if (previewIndex >= pages.length) {
      setPreviewIndex(pages.length - 1);
    }
  }, [pages.length, previewIndex]);

  useEffect(() => {
    if (fileModeLocked && viewMode === "file") {
      setViewMode("page");
    }
  }, [fileModeLocked, viewMode]);

  const handleCopySelection = useCallback(() => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    recordHistory();
    const count = copyToClipboard(pages, ids);
    setMessage(fmt(copy.messages.copied, { count }));
  }, [copyToClipboard, pages, recordHistory, selectedIds]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isEditableTarget(e.target)) return;
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;

      const key = e.key.toLowerCase();

      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }
      if (key === "y" || (key === "z" && e.shiftKey)) {
        e.preventDefault();
        handleRedo();
        return;
      }
      if (key === "c") {
        if (viewMode !== "page") return;
        if (selectedIds.size === 0) return;
        e.preventDefault();
        handleCopySelection();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    handleCopySelection,
    handleRedo,
    handleUndo,
    selectedIds.size,
    viewMode,
  ]);

  async function handleFiles(files: File[]) {
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const nextSources = new Map(sources);
      const added: PdfPageItem[] = [];

      for (const file of files) {
        const { source, pages: newPages } = await loadPdfFromFile(file);
        nextSources.set(source.id, source);
        added.push(...newPages);
      }

      recordHistory();
      setSources(nextSources);
      setPages((prev) => [...prev, ...added]);
      setMessage(fmt(copy.messages.pagesAdded, { count: added.length }));
    } catch {
      setError(copy.errors.loadFailed);
    } finally {
      setIsLoading(false);
    }
  }

  function removePages(ids: string[]) {
    const idSet = new Set(ids);
    recordHistory();
    setPages((prev) => prev.filter((p) => !idSet.has(p.id)));
  }

  function rotatePages(ids: string[]) {
    const idSet = new Set(ids);
    recordHistory();
    setPages((prev) =>
      prev.map((p) =>
        idSet.has(p.id) ? { ...p, rotation: nextRotation(p.rotation) } : p,
      ),
    );
  }

  function insertBlankAt(index: number) {
    if (pages.length === 0) return;
    recordHistory();
    setPages((prev) => {
      if (prev.length === 0) return prev;
      const refIndex = index === 0 ? 0 : index - 1;
      const ref = prev[refIndex];
      const blank = createBlankPage(ref, copy.blank);
      const next = [...prev];
      next.splice(index, 0, blank);
      return next;
    });
  }

  function pasteAt(index: number) {
    if (!hasClipboard) return;
    recordHistory();
    let inserted: PdfPageItem[] = [];
    setPages((prev) => {
      const result = pasteClipboardPages(prev, clipboard, index);
      inserted = result.inserted;
      return result.pages;
    });
    if (inserted.length > 0) {
      setSelection(inserted.map((p) => p.id));
      setMessage(fmt(copy.messages.pagesPasted, { count: inserted.length }));
    }
  }

  function handleInsertAt(index: number) {
    if (hasClipboard) {
      pasteAt(index);
    } else {
      insertBlankAt(index);
    }
  }

  function handleBulkDelete() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    recordHistory();
    const idSet = new Set(ids);
    setPages((prev) => prev.filter((p) => !idSet.has(p.id)));
    clearSelection();
    setMessage(fmt(copy.messages.pagesDeleted, { count: ids.length }));
  }

  function handleBulkRotate() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    rotatePages(ids);
    setMessage(fmt(copy.messages.pagesRotated, { count: ids.length }));
  }

  function handleRemoveFile(sourceId: string) {
    const group = fileGroups.find((g) => g.sourceId === sourceId);
    recordHistory();
    setPages((prev) => removeFilePages(prev, sourceId));
    setSources((prev) => {
      const next = new Map(prev);
      next.delete(sourceId);
      return next;
    });
    clearSelection();
    setMessage(
      group
        ? fmt(copy.messages.fileDeletedNamed, {
            name: group.name,
            count: group.pageCount,
          })
        : copy.messages.fileDeleted,
    );
  }

  function handleRenameFile(sourceId: string, name: string) {
    const trimmed = name.trim() || "untitled.pdf";
    if (sources.get(sourceId)?.name === trimmed) return;
    recordHistory();
    const result = renameFile(pages, sources, sourceId, trimmed);
    setPages(result.pages);
    setSources(result.sources);
    setMessage(copy.messages.fileRenamed);
  }

  function handleDuplicateFile(sourceId: string) {
    const result = duplicateFile(pages, sources, sourceId);
    if (!result) return;
    recordHistory();
    setPages(result.pages);
    setSources(result.sources);
    const group = fileGroups.find((g) => g.sourceId === sourceId);
    setMessage(
      group
        ? fmt(copy.messages.fileDuplicatedNamed, {
            name: group.name,
            count: group.pageCount,
          })
        : copy.messages.fileDuplicated,
    );
  }

  function handleClearClipboard() {
    if (!hasClipboard) return;
    recordHistory();
    clearClipboard();
  }

  function clearAll() {
    recordHistory();
    setPages([]);
    setSources(new Map());
    clearSelection();
    clearClipboard();
    setPreviewIndex(null);
    setMessage(null);
    setError(null);
  }

  function handlePageSelect(
    index: number,
    pageId: string,
    event: React.MouseEvent,
  ) {
    if (skipClickAfterDragRef.current) {
      skipClickAfterDragRef.current = false;
      return;
    }
    selectPage(index, pageId, event);
  }

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    setActiveId(id);

    if (viewMode === "page") {
      const count =
        selectedIds.has(id) && selectedIds.size > 1 ? selectedIds.size : 1;
      setDragMoveCount(count);
    } else {
      setDragMoveCount(1);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    setDragMoveCount(1);
    skipClickAfterDragRef.current = true;

    const { active, over } = event;
    if (!over) return;

    if (viewMode === "file") {
      if (active.id === over.id) return;
      const oldIndex = fileGroups.findIndex((g) => g.sourceId === active.id);
      const newIndex = fileGroups.findIndex((g) => g.sourceId === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const nextOrder = arrayMove(
        fileGroups.map((g) => g.sourceId),
        oldIndex,
        newIndex,
      );
      const nextPages = reorderPagesByFileOrder(pages, nextOrder);
      if (pageOrderEquals(pages, nextPages)) return;
      recordHistory();
      setPages(nextPages);
      return;
    }

    const activePageId = String(active.id);
    const overPageId = String(over.id);
    if (activePageId === overPageId) return;

    const nextPages = moveSelectedPages(
      pages,
      selectedIds,
      activePageId,
      overPageId,
    );
    if (pageOrderEquals(pages, nextPages)) return;
    recordHistory();
    setPages(nextPages);
  }

  async function handleExportConfirm(values: ExportDialogValues) {
    const targetPages =
      exportMode === "extract"
        ? pages.filter((p) => selectedIds.has(p.id))
        : pages;

    if (targetPages.length === 0) return;

    setError(null);
    setMessage(null);
    setIsExporting(true);
    try {
      const bytes = await exportMergedPdf(targetPages, sources, {
        addPageNumbers: values.addPageNumbers,
        userPassword: values.userPassword,
      });
      const filename =
        exportMode === "extract" ? "extracted.pdf" : "edited.pdf";
      downloadPdfBytes(bytes, filename);
      setMessage(
        exportMode === "extract"
          ? fmt(copy.messages.pagesExtracted, { count: targetPages.length })
          : fmt(copy.messages.pagesExported, { count: targetPages.length }),
      );
      setExportOpen(false);
    } catch {
      setError(
        values.userPassword.trim()
          ? copy.errors.exportEncryptFailed
          : copy.errors.exportFailed,
      );
    } finally {
      setIsExporting(false);
    }
  }

  function openFullExport() {
    if (!canExport) return;
    setExportMode("full");
    setExportOpen(true);
  }

  function openExtractExport() {
    if (selectedIds.size === 0) return;
    setExportMode("extract");
    setExportOpen(true);
  }

  const exportPageCount =
    exportMode === "extract" ? selectedIds.size : pages.length;

  const headerActions = (
    <div className="flex items-center gap-1.5">
      <HistoryToolbar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />
      <button
        type="button"
        onClick={openFullExport}
        disabled={!canExport}
        className="btn-primary !px-3 !py-1.5 text-xs sm:text-sm"
        aria-disabled={!canExport}
      >
        {copy.exportPdf}
      </button>
    </div>
  );

  const pageStatusText = isLoading
    ? copy.loading
    : viewMode === "file"
      ? fileGroups.length > 0
        ? fmt(copy.status.filesAndPages, {
            files: fileGroups.length,
            pages: pages.length,
          })
        : copy.addPdf
      : pages.length > 0
        ? selectedCount > 0
          ? selectedCount > 1
            ? fmt(copy.status.pagesSelected, {
                pages: pages.length,
                selected: selectedCount,
              })
            : fmt(copy.status.pagesSelectedOne, { pages: pages.length })
          : hasClipboard
            ? fmt(copy.status.pagesCopying, {
                pages: pages.length,
                copying: clipboardCount,
              })
            : fmt(copy.status.pagesOnly, { count: pages.length })
        : copy.addPdf;

  return (
    <AppShell
      title={copy.shell.title}
      description={copy.shell.description}
      actions={headerActions}
      fillViewport
      dataManager={{
        appId: "pdf-editor",
        fileNamePrefix: "pdf-editor",
        // セッション完結のため永続データなし（安心メッセージのみ表示）
      }}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
        <div className="shrink-0 space-y-1.5">
          <PdfUploadZone
            onFiles={handleFiles}
            disabled={isLoading}
            compact
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <ViewModeToggle
                mode={viewMode}
                onChange={setViewMode}
                fileModeLocked={fileModeLocked}
              />
              <p className="text-xs text-zinc-500">{pageStatusText}</p>
            </div>
            <div className="flex items-center gap-2">
              {error ? (
                <p className="text-xs text-red-600" role="alert">
                  {error}
                </p>
              ) : null}
              {message ? (
                <p className="text-xs text-emerald-600" role="status">
                  {message}
                </p>
              ) : null}
              {pages.length > 0 ? (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-[11px] text-zinc-400 transition-colors hover:text-zinc-700"
                >
                  {copy.clearAll}
                </button>
              ) : null}
            </div>
          </div>

          {viewMode === "page" ? (
            <SelectionToolbar
              selectedCount={selectedCount}
              clipboardCount={clipboardCount}
              onCopy={handleCopySelection}
              onRotate={handleBulkRotate}
              onDelete={handleBulkDelete}
              onExtract={openExtractExport}
              onClearSelection={clearSelection}
              onClearClipboard={handleClearClipboard}
            />
          ) : null}
        </div>

        <ExportDialog
          open={exportOpen}
          mode={exportMode}
          pageCount={exportPageCount}
          isExporting={isExporting}
          onClose={() => {
            if (!isExporting) setExportOpen(false);
          }}
          onConfirm={handleExportConfirm}
        />

        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => {
            setActiveId(null);
            setDragMoveCount(1);
            skipClickAfterDragRef.current = false;
          }}
        >
          <div className="min-h-0 shrink-0">
            {viewMode === "page" ? (
              <PageFilmstrip
                pages={pages}
                selectedIds={selectedIds}
                onSelectPage={handlePageSelect}
                onClearSelection={clearSelection}
                onRemove={removePages}
                onRotate={rotatePages}
                onInsertAt={handleInsertAt}
                hasClipboard={hasClipboard}
                clipboardCount={clipboardCount}
                onPreviewPage={setPreviewIndex}
              />
            ) : (
              <FileGroupList
                groups={fileGroups}
                onRename={handleRenameFile}
                onRemove={handleRemoveFile}
                onDuplicate={handleDuplicateFile}
              />
            )}
          </div>

          {viewMode === "page" ? (
            <PagePreviewModal
              page={previewPage}
              currentIndex={previewIndex ?? 0}
              totalPages={pages.length}
              sources={sources}
              onClose={() => setPreviewIndex(null)}
              onNavigate={setPreviewIndex}
            />
          ) : null}

          <DragOverlay dropAnimation={null}>
            {viewMode === "page" && activePage ? (
              <PageDragOverlay page={activePage} count={dragMoveCount} />
            ) : null}
            {viewMode === "file" && activeFileGroup ? (
              <div className="flex h-14 w-full max-w-md items-center gap-2.5 rounded-lg border border-zinc-300 bg-white px-2.5 shadow-lg">
                <span aria-hidden>📄</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-zinc-800">
                    {activeFileGroup.name}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    {fmt(copy.fileCard.pageCount, {
                      count: activeFileGroup.pageCount,
                    })}
                  </p>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </AppShell>
  );
}
