import { useCallback, useState } from "react";
import { duplicatePage, type PdfPageItem } from "./types";

/** ページのコピー＆ペースト用クリップボード */
export function usePageClipboard() {
  const [clipboard, setClipboard] = useState<PdfPageItem[]>([]);

  const copyPages = useCallback(
    (allPages: PdfPageItem[], ids: string[]) => {
      const idSet = new Set(ids);
      const copied = allPages
        .filter((p) => idSet.has(p.id))
        .map((p) => ({ ...p }));
      setClipboard(copied);
      return copied.length;
    },
    [],
  );

  const clearClipboard = useCallback(() => {
    setClipboard([]);
  }, []);

  return {
    clipboard,
    clipboardCount: clipboard.length,
    hasClipboard: clipboard.length > 0,
    copyPages,
    clearClipboard,
    restoreClipboard: setClipboard,
  };
}

/** クリップボードのページを指定位置に貼り付け（新 ID を付与） */
export function pasteClipboardPages(
  prev: PdfPageItem[],
  clipboard: PdfPageItem[],
  index: number,
): { pages: PdfPageItem[]; inserted: PdfPageItem[] } {
  if (clipboard.length === 0) {
    return { pages: prev, inserted: [] };
  }
  const inserted = clipboard.map((p) => duplicatePage(p));
  const next = [...prev];
  next.splice(index, 0, ...inserted);
  return { pages: next, inserted };
}
