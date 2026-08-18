import { arrayMove } from "@dnd-kit/sortable";

import type { FileColumn } from "./types";

/** シートが今どの列にいるか */
export function findColumnIdBySheet(
  columns: FileColumn[],
  sheetId: string,
): string | null {
  return columns.find((column) => column.sheetIds.includes(sheetId))?.id ?? null;
}

/**
 * シートを指定列の指定位置へ移す。
 * 同じ列なら並べ替え、違う列なら移動（結合）。
 */
export function moveSheetToColumn(
  columns: FileColumn[],
  sheetId: string,
  toColumnId: string,
  toIndex: number,
): FileColumn[] {
  const fromColumnId = findColumnIdBySheet(columns, sheetId);
  if (!fromColumnId) return columns;

  const next = columns.map((column) => ({
    ...column,
    sheetIds: [...column.sheetIds],
  }));
  const from = next.find((column) => column.id === fromColumnId);
  const to = next.find((column) => column.id === toColumnId);
  if (!from || !to) return columns;

  const fromIndex = from.sheetIds.indexOf(sheetId);
  if (fromIndex === -1) return columns;

  if (fromColumnId === toColumnId) {
    const last = Math.max(0, from.sheetIds.length - 1);
    const newIndex = Math.max(0, Math.min(toIndex, last));
    if (fromIndex === newIndex) return columns;
    from.sheetIds = arrayMove(from.sheetIds, fromIndex, newIndex);
    return next;
  }

  from.sheetIds.splice(fromIndex, 1);
  const insertAt = Math.max(0, Math.min(toIndex, to.sheetIds.length));
  to.sheetIds.splice(insertAt, 0, sheetId);
  return next;
}

/** 列からシートを外す（カードの ×） */
export function removeSheetFromColumns(
  columns: FileColumn[],
  sheetId: string,
): FileColumn[] {
  return columns.map((column) => ({
    ...column,
    sheetIds: column.sheetIds.filter((id) => id !== sheetId),
  }));
}

/** 中身がある列だけ（書き出し対象） */
export function nonEmptyColumns(columns: FileColumn[]): FileColumn[] {
  return columns.filter((column) => column.sheetIds.length > 0);
}

/**
 * ドラッグ中の「いまポインタがある先」へシートを移す。
 * 同じ位置なら元の配列を返す（再描画の連鎖を防ぐ）。
 */
export function applySheetDragOver(
  columns: FileColumn[],
  activeId: string,
  overId: string,
): FileColumn[] {
  if (activeId === overId) return columns;

  const columnIds = new Set(columns.map((column) => column.id));
  const fromId = findColumnIdBySheet(columns, activeId);
  const toId = columnIds.has(overId)
    ? overId
    : findColumnIdBySheet(columns, overId);
  if (!fromId || !toId) return columns;

  const to = columns.find((column) => column.id === toId);
  if (!to) return columns;

  if (columnIds.has(overId)) {
    if (fromId === toId) return columns;
    return moveSheetToColumn(columns, activeId, toId, to.sheetIds.length);
  }

  const overIndex = to.sheetIds.indexOf(overId);
  if (overIndex === -1) return columns;
  return moveSheetToColumn(columns, activeId, toId, overIndex);
}
