"use client";

import { useCallback, useId, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { WorkSheet } from "xlsx";

import AppShell from "@/components/AppShell";
import { fmt, useI18n } from "@/i18n";
import BoardColumn from "./BoardColumn";
import DropZone from "./DropZone";
import { SheetCardFace } from "./SheetCard";
import {
  applySheetDragOver,
  findColumnIdBySheet,
  nonEmptyColumns,
  removeSheetFromColumns,
} from "./boardUtils";
import {
  downloadBoardColumns,
  downloadColumnWorkbook,
} from "./exportWorkbook";
import { isSupportedFile, readSheetsFromFiles } from "./readSheets";
import { buildRefTintById } from "./refGroupColors";
import { MAX_COLUMNS, type FileColumn, type SheetEntry } from "./types";

export default function ExcelMergerPage() {
  const { t } = useI18n();
  const copy = t.apps.excelMerger;
  const dndId = useId();

  const [columns, setColumns] = useState<FileColumn[]>([]);
  const [entryById, setEntryById] = useState<Record<string, SheetEntry>>({});
  const [activeSheetId, setActiveSheetId] = useState<string | null>(null);
  const [overlaySize, setOverlaySize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [valuesOnly, setValuesOnly] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // シート実体は再レンダリングに関係しないため ref で保持する
  const worksheetsRef = useRef<Map<string, WorkSheet>>(new Map());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const sheetCount = useMemo(
    () => columns.reduce((sum, column) => sum + column.sheetIds.length, 0),
    [columns],
  );
  const columnIdSet = useMemo(
    () => new Set(columns.map((column) => column.id)),
    [columns],
  );
  const canExport =
    nonEmptyColumns(columns).length > 0 && !isExporting && !isReading;

  const boardEntries = useMemo(
    () =>
      columns.flatMap((column) =>
        column.sheetIds
          .map((id) => entryById[id])
          .filter((entry): entry is SheetEntry => Boolean(entry)),
      ),
    [columns, entryById],
  );
  const tintById = useMemo(
    () => buildRefTintById(boardEntries),
    [boardEntries],
  );

  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      const pointerHits = pointerWithin(args);
      const sheetHits = pointerHits.filter(
        (hit) => !columnIdSet.has(String(hit.id)),
      );
      if (sheetHits.length > 0) return sheetHits;
      if (pointerHits.length > 0) return pointerHits;
      return closestCorners(args);
    },
    [columnIdSet],
  );

  const activeEntry = activeSheetId ? entryById[activeSheetId] : undefined;
  const isBoardFull = columns.length >= MAX_COLUMNS;

  async function handleFiles(files: File[]) {
    setMessage(null);
    setError(null);

    const remaining = MAX_COLUMNS - columns.length;
    if (remaining <= 0) {
      setError(copy.errors.tooManyFiles);
      return;
    }

    const supported = files.filter(isSupportedFile);
    if (supported.length === 0) {
      setError(copy.errors.invalidType);
      return;
    }

    const accepted = supported.slice(0, remaining);
    const skippedType = files.length - supported.length;
    const skippedLimit = supported.length - accepted.length;

    setIsReading(true);
    try {
      const result = await readSheetsFromFiles(accepted);
      if (result.entries.length === 0) {
        setError(copy.errors.noSheets);
        return;
      }
      for (const [id, sheet] of result.worksheets) {
        worksheetsRef.current.set(id, sheet);
      }
      setEntryById((prev) => {
        const next = { ...prev };
        for (const entry of result.entries) next[entry.id] = entry;
        return next;
      });
      setColumns((prev) => [...prev, ...result.columns].slice(0, MAX_COLUMNS));
      setMessage(fmt(copy.messages.loaded, { count: result.entries.length }));
      if (skippedType > 0 || skippedLimit > 0) {
        setError(
          skippedLimit > 0 ? copy.errors.tooManyFiles : copy.errors.invalidType,
        );
      }
    } catch {
      setError(copy.errors.readFailed);
    } finally {
      setIsReading(false);
    }
  }

  function removeEntry(id: string) {
    worksheetsRef.current.delete(id);
    setEntryById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setColumns((prev) => removeSheetFromColumns(prev, id));
    setMessage(null);
  }

  function clearAll() {
    worksheetsRef.current.clear();
    setEntryById({});
    setColumns([]);
    setMessage(null);
    setError(null);
  }

  function measureDragSize(event: DragStartEvent): {
    width: number;
    height: number;
  } {
    const initial = event.active.rect.current.initial;
    if (initial && initial.width > 1 && initial.height > 1) {
      return { width: initial.width, height: initial.height };
    }
    const target = event.activatorEvent.target;
    if (target instanceof Element) {
      const el = target.closest("li");
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 1 && rect.height > 1) {
          return { width: rect.width, height: rect.height };
        }
      }
    }
    return { width: 160, height: 92 };
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveSheetId(String(event.active.id));
    setOverlaySize(measureDragSize(event));
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    setColumns((prev) => {
      const fromId = findColumnIdBySheet(prev, activeId);
      const columnIds = new Set(prev.map((column) => column.id));
      const toId = columnIds.has(overId)
        ? overId
        : findColumnIdBySheet(prev, overId);
      // 同じ列内はドラッグ中に state を動かすと、当たり判定が入れ替わって無限再描画になる
      if (!fromId || !toId || fromId === toId) return prev;
      return applySheetDragOver(prev, activeId, overId);
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveSheetId(null);
    setOverlaySize(null);
    const { active, over } = event;
    if (!over) return;
    setColumns((prev) =>
      applySheetDragOver(prev, String(active.id), String(over.id)),
    );
  }

  async function handleExport() {
    setMessage(null);
    setError(null);

    if (nonEmptyColumns(columns).length === 0) {
      setError(copy.errors.noSheets);
      return;
    }

    setIsExporting(true);
    try {
      const result = await downloadBoardColumns(
        columns,
        entryById,
        worksheetsRef.current,
        { valuesOnly },
      );
      if (result.sheetCount === 0) {
        setError(copy.errors.noSheets);
        return;
      }
      setMessage(
        result.zipped
          ? fmt(copy.messages.exportedZip, {
              files: result.fileCount,
              sheets: result.sheetCount,
            })
          : fmt(copy.messages.exported, { count: result.sheetCount }),
      );
    } catch {
      setError(copy.errors.exportFailed);
    } finally {
      setIsExporting(false);
    }
  }

  async function handleExportColumn(column: FileColumn) {
    setMessage(null);
    setError(null);
    if (column.sheetIds.length === 0) {
      setError(copy.errors.noSheets);
      return;
    }

    setIsExporting(true);
    try {
      const count = await downloadColumnWorkbook(
        column,
        entryById,
        worksheetsRef.current,
        { valuesOnly },
      );
      if (count === 0) {
        setError(copy.errors.noSheets);
        return;
      }
      setMessage(fmt(copy.messages.exported, { count }));
    } catch {
      setError(copy.errors.exportFailed);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <AppShell
      title={copy.shell.title}
      description={copy.shell.description}
      actions={
        <button
          type="button"
          onClick={handleExport}
          disabled={!canExport}
          aria-disabled={!canExport}
          className="btn-primary !px-3 !py-1.5 text-xs active:scale-[0.98] sm:text-sm"
        >
          {isExporting ? copy.merging : copy.mergeShort}
        </button>
      }
    >
      <div className="min-w-0 max-w-full space-y-4">
        <DropZone
          onFiles={handleFiles}
          isReading={isReading}
          isFull={isBoardFull}
        />

        <section className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="font-display text-xs uppercase tracking-wide text-[#3d6b52]">
                {copy.list.heading}
              </h2>
              {columns.length > 0 ? (
                <span className="rounded-md border border-[#c5d4cb] bg-[#edf6f0] px-1.5 py-0.5 text-[10px] text-[#3d6b52]">
                  {fmt(copy.list.fileCount, { count: columns.length })}
                  {" · "}
                  {fmt(copy.list.count, { count: sheetCount })}
                </span>
              ) : null}
            </div>
            {columns.length > 0 ? (
              <button
                type="button"
                onClick={clearAll}
                className="btn-secondary !px-2.5 !py-1 text-[11px]"
              >
                {copy.list.clearAll}
              </button>
            ) : null}
          </div>

          {columns.length === 0 ? (
            <p className="rounded-md border border-dashed border-[#c5d4cb] bg-[#f7faf8] px-4 py-6 text-center text-xs text-[#6b8578]">
              {copy.list.empty}
            </p>
          ) : (
            <>
              <p className="text-[11px] leading-relaxed text-zinc-500">
                {copy.list.hint}
              </p>
              <DndContext
                id={dndId}
                sensors={sensors}
                collisionDetection={collisionDetection}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={() => {
                  setActiveSheetId(null);
                  setOverlaySize(null);
                }}
              >
                <div
                  className="grid w-full min-w-0 gap-2 sm:gap-3"
                  style={{
                    gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
                  }}
                >
                  {columns.map((column) => (
                    <BoardColumn
                      key={column.id}
                      column={column}
                      entryById={entryById}
                      onRemoveSheet={removeEntry}
                      onDownload={() => handleExportColumn(column)}
                      downloadDisabled={isExporting || isReading}
                      tintById={tintById}
                    />
                  ))}
                </div>
                <DragOverlay dropAnimation={null} zIndex={80} className="cursor-grabbing">
                  {activeEntry ? (
                    <div
                      className="box-border"
                      style={{
                        width: overlaySize?.width ?? 160,
                      }}
                    >
                      <SheetCardFace
                        entry={activeEntry}
                        overlay
                        tint={tintById[activeEntry.id] ?? null}
                      />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
              <p className="text-[10px] leading-relaxed text-zinc-400">
                {copy.list.formattingNote}
              </p>
            </>
          )}
        </section>

        <div className="space-y-3 border-t border-zinc-200/70 pt-4">
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={valuesOnly}
              onChange={(event) => setValuesOnly(event.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-950"
            />
            <span>
              <span className="font-medium">{copy.valuesOnly.label}</span>
              <span className="mt-0.5 block text-[11px] leading-relaxed text-zinc-400">
                {copy.valuesOnly.hint}
              </span>
            </span>
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleExport}
              disabled={!canExport}
              aria-disabled={!canExport}
              className="btn-primary active:scale-[0.98]"
            >
              {isExporting ? copy.merging : copy.merge}
            </button>
            {error ? (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="text-sm text-emerald-600" role="status">
                {message}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
