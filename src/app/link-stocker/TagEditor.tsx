"use client";

import { Plus, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import {
  TAG_COLOR_PRESETS,
  type CustomTag,
} from "./types";

type Props = {
  open: boolean;
  onClose: () => void;
  allTags: CustomTag[];
  selectedIds: string[];
  labels: {
    title: string;
    newName: string;
    create: string;
    customColor: string;
    apply: string;
  };
  onToggleTag: (tagId: string) => void;
  onCreateTag: (name: string, color: string) => void;
  onUpdateTag: (tagId: string, patch: { name?: string; color?: string }) => void;
  onDeleteTag: (tagId: string) => void;
};

/** カード用：タグの付与／作成／色変更ポップオーバー */
export default function TagEditor({
  open,
  onClose,
  allTags,
  selectedIds,
  labels,
  onToggleTag,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
}: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(TAG_COLOR_PRESETS[0].color);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setName("");
      setEditingId(null);
      return;
    }
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
      className="absolute bottom-10 left-3 right-3 z-30 rounded-xl border border-white/15 bg-zinc-950/95 p-3 shadow-2xl backdrop-blur-md"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p id={titleId} className="text-xs font-semibold text-zinc-200">
          {labels.title}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
          aria-label="close"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <ul className="mb-3 max-h-36 space-y-1 overflow-y-auto">
        {allTags.map((tag) => {
          const on = selectedIds.includes(tag.id);
          const editing = editingId === tag.id;
          return (
            <li
              key={tag.id}
              className="flex items-center gap-1.5 rounded-lg px-1 py-1 hover:bg-white/5"
            >
              <button
                type="button"
                onClick={() => onToggleTag(tag.id)}
                className={`flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1 text-left text-[11px] ${
                  on ? "bg-white/10 text-white" : "text-zinc-400"
                }`}
              >
                <span
                  className="size-2.5 shrink-0 rounded-full ring-1 ring-white/20"
                  style={{ backgroundColor: tag.color }}
                />
                {editing ? (
                  <input
                    value={tag.name}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      onUpdateTag(tag.id, { name: e.target.value })
                    }
                    className="min-w-0 flex-1 rounded bg-zinc-900 px-1 py-0.5 text-[11px] text-zinc-100 outline-none ring-1 ring-white/20"
                  />
                ) : (
                  <span className="truncate">{tag.name}</span>
                )}
              </button>
              <input
                type="color"
                value={tag.color}
                title={labels.customColor}
                onChange={(e) => onUpdateTag(tag.id, { color: e.target.value })}
                className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent"
              />
              <button
                type="button"
                onClick={() =>
                  setEditingId((id) => (id === tag.id ? null : tag.id))
                }
                className="rounded px-1 text-[10px] text-zinc-500 hover:text-zinc-300"
              >
                {editing ? "OK" : "✎"}
              </button>
              <button
                type="button"
                onClick={() => onDeleteTag(tag.id)}
                className="rounded px-1 text-[10px] text-rose-400/80 hover:text-rose-300"
              >
                ×
              </button>
            </li>
          );
        })}
      </ul>

      <div className="space-y-2 border-t border-white/10 pt-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={labels.newName}
          className="w-full rounded-lg border border-white/10 bg-zinc-900 px-2 py-1.5 text-[11px] text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-400/50"
        />
        <div className="flex flex-wrap gap-1.5">
          {TAG_COLOR_PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              title={p.label}
              onClick={() => setColor(p.color)}
              className={`size-5 rounded-full ring-2 transition ${
                color === p.color ? "ring-white" : "ring-transparent"
              }`}
              style={{ backgroundColor: p.color }}
            />
          ))}
          <label className="flex size-5 cursor-pointer items-center justify-center overflow-hidden rounded-full ring-1 ring-white/30">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-8 w-8 -translate-x-1 -translate-y-1 cursor-pointer border-0"
              title={labels.customColor}
            />
          </label>
        </div>
        <button
          type="button"
          disabled={!name.trim()}
          onClick={() => {
            const n = name.trim();
            if (!n) return;
            onCreateTag(n, color);
            setName("");
          }}
          className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-emerald-600/90 px-2 py-1.5 text-[11px] font-semibold text-white disabled:opacity-40"
        >
          <Plus className="size-3.5" />
          {labels.create}
        </button>
      </div>
    </div>
  );
}
