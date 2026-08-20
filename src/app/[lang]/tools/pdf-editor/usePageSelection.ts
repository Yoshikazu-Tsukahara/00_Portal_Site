import { useCallback, useState, type MouseEvent } from "react";

/** Ctrl/Cmd・Shift 対応のページ複数選択 */
export function usePageSelection(pageIds: string[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [anchorIndex, setAnchorIndex] = useState<number | null>(null);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setAnchorIndex(null);
  }, []);

  const selectPage = useCallback(
    (index: number, pageId: string, event: MouseEvent) => {
      const isMod = event.ctrlKey || event.metaKey;
      const isShift = event.shiftKey;

      if (isShift) {
        setSelectedIds((prev) => {
          let anchor = anchorIndex;
          if (anchor === null && prev.size > 0) {
            anchor = pageIds.findIndex((id) => prev.has(id));
          }
          if (anchor === null) anchor = index;
          const start = Math.min(anchor, index);
          const end = Math.max(anchor, index);
          return new Set(pageIds.slice(start, end + 1));
        });
        setAnchorIndex((prev) => prev ?? index);
        return;
      }

      if (isMod) {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(pageId)) {
            next.delete(pageId);
          } else {
            next.add(pageId);
          }
          return next;
        });
        setAnchorIndex(index);
        return;
      }

      setSelectedIds(new Set([pageId]));
      setAnchorIndex(index);
    },
    [anchorIndex, pageIds],
  );

  const setSelection = useCallback(
    (ids: string[]) => {
      setSelectedIds(new Set(ids));
      if (ids.length === 0) {
        setAnchorIndex(null);
        return;
      }
      const idx = pageIds.findIndex((id) => id === ids[0]);
      setAnchorIndex(idx >= 0 ? idx : null);
    },
    [pageIds],
  );

  /** 削除などでページが減ったとき、存在しない ID を除外 */
  const syncSelection = useCallback((validIds: string[]) => {
    const valid = new Set(validIds);
    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => valid.has(id)));
      return next.size === prev.size ? prev : next;
    });
    setAnchorIndex((prev) => {
      if (prev === null || prev >= validIds.length) {
        return prev === null ? null : Math.max(0, validIds.length - 1);
      }
      return prev;
    });
  }, []);

  return {
    selectedIds,
    selectPage,
    setSelection,
    clearSelection,
    syncSelection,
  };
}
