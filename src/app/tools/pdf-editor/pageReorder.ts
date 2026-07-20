import type { PdfPageItem } from "./types";

/**
 * 複数選択ページをドロップ先へ一括移動（相対順序を維持）。
 * ① 選択を元の並びで抽出 → ② 配列から除去 → ③ ドロップ位置に挿入
 */
export function moveSelectedPages(
  pages: PdfPageItem[],
  selectedIds: Set<string> | string[],
  activeId: string,
  overId: string,
): PdfPageItem[] {
  const selectedSet = new Set(selectedIds);

  // 掴んだページが未選択なら、その1枚だけを移動対象にする
  const movingIds = selectedSet.has(activeId)
    ? selectedSet
    : new Set([activeId]);

  // ① 元のページ順で抽出
  const moving = pages.filter((p) => movingIds.has(p.id));
  if (moving.length === 0) return pages;

  // ② 取り除く
  const remaining = pages.filter((p) => !movingIds.has(p.id));
  if (remaining.length === pages.length) return pages;

  const activeIndex = pages.findIndex((p) => p.id === activeId);
  const overIndex = pages.findIndex((p) => p.id === overId);
  if (activeIndex === -1 || overIndex === -1) return pages;

  // ③ ドロップ先インデックス（remaining 上）
  let insertIndex: number;
  if (!movingIds.has(overId)) {
    const overInRemaining = remaining.findIndex((p) => p.id === overId);
    if (overInRemaining === -1) return pages;
    // 下方向 → over の後ろ / 上方向 → over の前
    insertIndex =
      activeIndex < overIndex ? overInRemaining + 1 : overInRemaining;
  } else {
    // over も選択中 → over より前にある「非選択」の枚数が挿入位置
    insertIndex = 0;
    for (let i = 0; i < overIndex; i += 1) {
      if (!movingIds.has(pages[i].id)) insertIndex += 1;
    }
  }

  insertIndex = Math.max(0, Math.min(insertIndex, remaining.length));
  const next = [...remaining];
  next.splice(insertIndex, 0, ...moving);
  return next;
}
