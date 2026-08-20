"use client";

import { Plus, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { TAG_COLOR_PRESETS, type CustomTag } from "./types";

type Props = {
  open: boolean;
  onClose: () => void;
  allTags: CustomTag[];
  labels: {
    title: string;
    newName: string;
    create: string;
    customColor: string;
    deleteConfirm: string;
    empty: string;
    rename: string;
    renameDone: string;
    delete: string;
  };
  onCreateTag: (name: string, color: string) => void;
  onUpdateTag: (tagId: string, patch: { name?: string; color?: string }) => void;
  onDeleteTag: (tagId: string) => void;
};

/** 上部「タグ編集」：タグの追加・改名・色変更・削除を一括で行う */
export default function TagManager({
  open,
  onClose,
  allTags,
  labels,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
}: Props) {
  const titleId = useId();
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(TAG_COLOR_PRESETS[0].color);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setName("");
      setEditingId(null);
      return;
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-900/40 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 id={titleId} className="text-sm font-bold text-zinc-900">
            {labels.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="close"
          >
            <X className="size-4" />
          </button>
        </div>

        {allTags.length === 0 ? (
          <p className="mb-3 rounded-xl bg-zinc-50 px-3 py-4 text-center text-xs text-zinc-500">
            {labels.empty}
          </p>
        ) : (
          <ul className="mb-3 max-h-56 space-y-1 overflow-y-auto">
            {allTags.map((tag) => {
              const editing = editingId === tag.id;
              return (
                <li
                  key={tag.id}
                  className="flex items-center gap-1.5 rounded-xl px-1.5 py-1.5 hover:bg-zinc-50"
                >
                  <span
                    className="size-3 shrink-0 rounded-full ring-1 ring-zinc-200"
                    style={{ backgroundColor: tag.color }}
                  />
                  {editing ? (
                    <input
                      value={tag.name}
                      onChange={(e) =>
                        onUpdateTag(tag.id, { name: e.target.value })
                      }
                      className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-800 outline-none ring-emerald-400/40 focus:ring-2"
                    />
                  ) : (
                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-zinc-800">
                      {tag.name}
                    </span>
                  )}
                  <input
                    type="color"
                    value={tag.color}
                    title={labels.customColor}
                    onChange={(e) =>
                      onUpdateTag(tag.id, { color: e.target.value })
                    }
                    className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setEditingId((id) => (id === tag.id ? null : tag.id))
                    }
                    className="rounded-lg px-1.5 py-1 text-[11px] text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
                  >
                    {editing ? labels.renameDone : labels.rename}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!window.confirm(labels.deleteConfirm)) return;
                      onDeleteTag(tag.id);
                    }}
                    className="rounded-lg px-1.5 py-1 text-[11px] text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                  >
                    {labels.delete}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="space-y-2 border-t border-zinc-100 pt-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={labels.newName}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-400/50"
          />
          <div className="flex flex-wrap gap-1.5">
            {TAG_COLOR_PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                title={p.label}
                onClick={() => setColor(p.color)}
                className={`size-6 rounded-full ring-2 transition ${
                  color === p.color ? "ring-emerald-600" : "ring-transparent"
                }`}
                style={{ backgroundColor: p.color }}
              />
            ))}
            <label className="flex size-6 cursor-pointer items-center justify-center overflow-hidden rounded-full ring-1 ring-zinc-300">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-9 w-9 -translate-x-1 -translate-y-1 cursor-pointer border-0"
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
            className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
          >
            <Plus className="size-3.5" />
            {labels.create}
          </button>
        </div>
      </div>
    </div>
  );
}
