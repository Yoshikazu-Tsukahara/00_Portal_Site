"use client";

import { useI18n } from "@/i18n";
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
  const { t } = useI18n();
  const mt = t.apps.mailTemplate;

  if (tags.length === 0) return null;

  return (
    <div
      role="group"
      aria-label={mt.tags.filterAria}
      className="flex max-w-full flex-wrap gap-1.5"
    >
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`min-h-11 rounded-md border px-3 py-1.5 text-[11px] font-medium transition-colors active:scale-[0.98] md:min-h-0 md:px-2 md:py-0.5 md:text-[10px] ${
          selectedTagId === null
            ? "border-[var(--accent-strong)] bg-[var(--accent)] text-zinc-900 active:brightness-95"
            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 active:bg-zinc-100"
        }`}
      >
        {mt.tags.all}
      </button>
      {tags.map((tag) => {
        const style = getTagColorStyle(tag.color);
        const active = selectedTagId === tag.id;
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => onChange(active ? null : tag.id)}
            className={`min-h-11 max-w-full break-words rounded-md border px-3 py-1.5 text-[11px] font-medium transition-colors active:scale-[0.98] md:min-h-0 md:px-2 md:py-0.5 md:text-[10px] ${
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
