// メイン編集（本文ストリーム・ページ内容）専用の元に戻す／やり直し
// 右パネルの書式・タイトル等は載せない

import type { BodyItem, BodyOverlays, BookPage } from "./types";

export type EditSnapshot = {
  body: BodyItem[];
  bodyOverlays: BodyOverlays;
  pages: BookPage[];
  outlineIndex: number;
};

const MAX_STACK = 60;

function cloneBody(body: BodyItem[]): BodyItem[] {
  return structuredClone(body);
}

/** 深いコピー（ページ配列） */
export function clonePages(pages: BookPage[]): BookPage[] {
  return structuredClone(pages);
}

function cloneOverlays(overlays: BodyOverlays): BodyOverlays {
  return structuredClone(overlays);
}

function cloneSnapshot(snapshot: EditSnapshot): EditSnapshot {
  return {
    body: cloneBody(snapshot.body),
    bodyOverlays: cloneOverlays(snapshot.bodyOverlays ?? []),
    pages: clonePages(snapshot.pages),
    outlineIndex: snapshot.outlineIndex,
  };
}

export type EditHistory = {
  undoStack: EditSnapshot[];
  redoStack: EditSnapshot[];
};

export function createEditHistory(): EditHistory {
  return { undoStack: [], redoStack: [] };
}

/** 変更前の状態を積む（やり直しはクリア） */
export function pushEditHistory(
  history: EditHistory,
  snapshot: EditSnapshot,
): void {
  history.undoStack.push(cloneSnapshot(snapshot));
  if (history.undoStack.length > MAX_STACK) {
    history.undoStack.shift();
  }
  history.redoStack = [];
}

export function clearEditHistory(history: EditHistory): void {
  history.undoStack = [];
  history.redoStack = [];
}

export function canUndo(history: EditHistory): boolean {
  return history.undoStack.length > 0;
}

export function canRedo(history: EditHistory): boolean {
  return history.redoStack.length > 0;
}

/**
 * 元に戻す。成功時は復元すべきスナップショットを返す。
 * current はいまの状態（やり直し用に積む）。
 */
export function undoEdit(
  history: EditHistory,
  current: EditSnapshot,
): EditSnapshot | null {
  const prev = history.undoStack.pop();
  if (!prev) return null;
  history.redoStack.push(cloneSnapshot(current));
  return prev;
}

/** やり直し */
export function redoEdit(
  history: EditHistory,
  current: EditSnapshot,
): EditSnapshot | null {
  const next = history.redoStack.pop();
  if (!next) return null;
  history.undoStack.push(cloneSnapshot(current));
  return next;
}
