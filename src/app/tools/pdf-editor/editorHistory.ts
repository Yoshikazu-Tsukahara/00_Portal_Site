import type { PdfPageItem, PdfSource } from "./types";

/** Undo/Redo 用の編集状態スナップショット */
export type EditorSnapshot = {
  pages: PdfPageItem[];
  sources: Map<string, PdfSource>;
  selectedIds: string[];
  clipboard: PdfPageItem[];
};

const MAX_HISTORY = 50;

function clonePages(pages: PdfPageItem[]): PdfPageItem[] {
  return pages.map((p) => ({ ...p }));
}

function cloneSources(sources: Map<string, PdfSource>): Map<string, PdfSource> {
  const next = new Map<string, PdfSource>();
  for (const [id, source] of sources) {
    next.set(id, {
      id: source.id,
      name: source.name,
      pageCount: source.pageCount,
      // バイナリは不変のため参照共有（メモリ節約）
      bytes: source.bytes,
    });
  }
  return next;
}

/** 現在の編集状態をディープコピー（バイト列は参照共有） */
export function createEditorSnapshot(
  pages: PdfPageItem[],
  sources: Map<string, PdfSource>,
  selectedIds: Iterable<string>,
  clipboard: PdfPageItem[],
): EditorSnapshot {
  return {
    pages: clonePages(pages),
    sources: cloneSources(sources),
    selectedIds: [...selectedIds],
    clipboard: clonePages(clipboard),
  };
}

export function pageOrderEquals(a: PdfPageItem[], b: PdfPageItem[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i].id !== b[i].id || a[i].rotation !== b[i].rotation) {
      return false;
    }
  }
  return true;
}

/**
 * past / future スタックによる Undo・Redo 管理。
 * 新しい編集の直前に push() で現在状態を保存する。
 */
export function createHistoryController() {
  const past: EditorSnapshot[] = [];
  const future: EditorSnapshot[] = [];

  return {
    get canUndo() {
      return past.length > 0;
    },
    get canRedo() {
      return future.length > 0;
    },
    /** 編集前の現在状態を past に積み、future をクリア */
    push(snapshot: EditorSnapshot) {
      past.push(snapshot);
      if (past.length > MAX_HISTORY) {
        past.shift();
      }
      future.length = 0;
    },
    /** 現在状態を future に退避し、past から1つ取り出して返す */
    undo(current: EditorSnapshot): EditorSnapshot | null {
      const prev = past.pop();
      if (!prev) return null;
      future.push(current);
      return prev;
    },
    /** 現在状態を past に退避し、future から1つ取り出して返す */
    redo(current: EditorSnapshot): EditorSnapshot | null {
      const next = future.pop();
      if (!next) return null;
      past.push(current);
      return next;
    },
    clear() {
      past.length = 0;
      future.length = 0;
    },
  };
}

export type HistoryController = ReturnType<typeof createHistoryController>;
