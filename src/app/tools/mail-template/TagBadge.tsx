"use client";

import { getTagColorStyle } from "./tagColors";
import type { TagMasterItem } from "./types";

/** コンパクトなタグバッジ */
export default function TagBadge({
  tag,
  onDark = false,
}: {
  tag: TagMasterItem;
  /** 選択中カード（暗い背景）向け */
  onDark?: boolean;
}) {
  const style = getTagColorStyle(tag.color);
  return (
    <span
      className={`inline-flex max-w-full truncate rounded border px-1.5 py-px text-[10px] font-medium leading-tight break-all ${
        onDark ? style.badgeOnDark : style.badge
      }`}
    >
      {tag.name}
    </span>
  );
}
