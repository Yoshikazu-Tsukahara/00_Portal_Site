"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { fmt, useI18n } from "@/i18n";
import SheetCard, { SHEET_CARD_HEIGHT_CLASS } from "./SheetCard";
import type { RefGroupTint } from "./refGroupColors";
import type { FileColumn, SheetEntry } from "./types";

/** 1 ファイル = 1 列のカンバンカラム */
export default function BoardColumn({
  column,
  entryById,
  onRemoveSheet,
  onDownload,
  downloadDisabled,
  tintById,
}: {
  column: FileColumn;
  entryById: Record<string, SheetEntry>;
  onRemoveSheet: (sheetId: string) => void;
  onDownload: () => void;
  downloadDisabled?: boolean;
  tintById: Record<string, RefGroupTint>;
}) {
  const { t } = useI18n();
  const copy = t.apps.excelMerger;
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column" },
  });

  const sheets = column.sheetIds
    .map((id) => entryById[id])
    .filter((entry): entry is SheetEntry => Boolean(entry));

  return (
    <section
      className={`flex min-w-0 w-full flex-col overflow-hidden rounded-md border transition-all duration-150 ${
        isOver
          ? "border-[#217346]/50 bg-[#e8f5ee]"
          : "border-[#c5d4cb] bg-[#f3f6f4]"
      }`}
    >
      <header className="flex items-start gap-1.5 border-b border-[#c5d4cb]/80 bg-[#edf6f0] px-3 py-2.5 [box-shadow:inset_0_3px_0_0_#217346]">
        <div className="min-w-0 flex-1">
          <h3 className="min-w-0 break-all text-sm font-semibold leading-snug text-[#1f4d35]">
            {column.fileName}
          </h3>
          <p className="mt-0.5 font-display text-[10px] tracking-wide text-[#5b7a68]">
            {fmt(copy.list.count, { count: sheets.length })}
          </p>
        </div>
        <button
          type="button"
          onClick={onDownload}
          disabled={downloadDisabled || sheets.length === 0}
          aria-disabled={downloadDisabled || sheets.length === 0}
          title={copy.board.downloadColumn}
          aria-label={fmt(copy.board.downloadColumnAria, {
            name: column.fileName,
          })}
          className="btn-secondary shrink-0 !px-2 !py-1 text-[10px] active:scale-[0.98]"
        >
          {copy.board.downloadColumn}
        </button>
      </header>

      <ul
        ref={setNodeRef}
        className="app-nested-scroll flex min-h-28 flex-1 flex-col gap-2 p-2"
      >
        <SortableContext
          items={column.sheetIds}
          strategy={verticalListSortingStrategy}
        >
          {sheets.length === 0 ? (
            <li
              className={`${SHEET_CARD_HEIGHT_CLASS} flex list-none items-center justify-center rounded-md border border-dashed border-[#a8c4b4] px-2 text-center text-[11px] text-[#6b8578]`}
            >
              {copy.board.emptyColumn}
            </li>
          ) : (
            sheets.map((entry, index) => (
              <SheetCard
                key={entry.id}
                entry={entry}
                order={index + 1}
                onRemove={() => onRemoveSheet(entry.id)}
                tint={tintById[entry.id] ?? null}
              />
            ))
          )}
        </SortableContext>
      </ul>
    </section>
  );
}
