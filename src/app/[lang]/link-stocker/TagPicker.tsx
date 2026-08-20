"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import type { CustomTag } from "./types";

type Props = {
  open: boolean;
  onClose: () => void;
  allTags: CustomTag[];
  selectedIds: string[];
  title: string;
  emptyHint: string;
  onToggleTag: (tagId: string) => void;
};

/** カード用：既存タグの付け外しだけ */
export default function TagPicker({
  open,
  onClose,
  allTags,
  selectedIds,
  title,
  emptyHint,
  onToggleTag,
}: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-labelledby={titleId}
      className="absolute bottom-10 left-3 right-3 z-30 rounded-xl border border-zinc-200 bg-white p-3 shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p id={titleId} className="text-xs font-semibold text-zinc-800">
          {title}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          aria-label="close"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {allTags.length === 0 ? (
        <p className="py-2 text-[11px] leading-relaxed text-zinc-500">
          {emptyHint}
        </p>
      ) : (
        <ul className="max-h-40 space-y-1 overflow-y-auto">
          {allTags.map((tag) => {
            const on = selectedIds.includes(tag.id);
            return (
              <li key={tag.id}>
                <button
                  type="button"
                  onClick={() => onToggleTag(tag.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] transition ${
                    on
                      ? "bg-emerald-50 font-medium text-emerald-900 ring-1 ring-emerald-200"
                      : "text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  <span
                    className={`flex size-3.5 shrink-0 items-center justify-center rounded border ${
                      on
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-zinc-300 bg-white"
                    }`}
                    aria-hidden
                  >
                    {on ? "✓" : ""}
                  </span>
                  <span
                    className="size-2.5 shrink-0 rounded-full ring-1 ring-zinc-200"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="truncate">{tag.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
