"use client";

import { getTagColorStyle } from "./tagColors";
import type { TagMasterItem } from "./types";

/** ラベル絞り込みチップ */
export default function TagFilterBar({
  tags,
  selectedTagId,
  onChange,
}: {
  tags: TagMasterItem[];
  selectedTagId: string | null;
  onChange: (tagId: string | null) => void;
}) {
  if (tags.length === 0) return null;

  return (
    <div
      role="group"
      aria-label="ラベルで絞り込み"
      className="flex flex-wrap gap-1"
    >
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors ${
          selectedTagId === null
            ? "border-zinc-900 bg-zinc-900 text-white"
            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
        }`}
      >
        すべて
      </button>
      {tags.map((tag) => {
        const style = getTagColorStyle(tag.color);
        const active = selectedTagId === tag.id;
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => onChange(active ? null : tag.id)}
            className={`rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors ${
              active ? style.filterActive : style.filter
            }`}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}
