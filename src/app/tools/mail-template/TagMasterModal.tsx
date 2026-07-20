"use client";

import { useEffect, useId, useState } from "react";
import { TAG_COLORS } from "./tagColors";
import { createId, type TagColorId, type TagMasterItem } from "./types";

/** タグ・ラベルマスタの CRUD */
export default function TagMasterModal({
  open,
  tags,
  onClose,
  onChange,
}: {
  open: boolean;
  tags: TagMasterItem[];
  onClose: () => void;
  onChange: (next: TagMasterItem[]) => void;
}) {
  const titleId = useId();
  const [draftName, setDraftName] = useState("");
  const [draftColor, setDraftColor] = useState<TagColorId>("blue");
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    resetForm();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function resetForm() {
    setDraftName("");
    setDraftColor("blue");
    setEditingId(null);
    setError(null);
  }

  if (!open) return null;

  function startEdit(item: TagMasterItem) {
    setEditingId(item.id);
    setDraftName(item.name);
    setDraftColor(item.color);
    setError(null);
  }

  function handleSubmit() {
    const name = draftName.trim();
    setError(null);
    if (!name) {
      setError("ラベル名を入力");
      return;
    }
    const dup = tags.find(
      (t) => t.name === name && t.id !== editingId,
    );
    if (dup) {
      setError("同じラベル名が既に存在");
      return;
    }

    if (editingId) {
      onChange(
        tags.map((t) =>
          t.id === editingId ? { ...t, name, color: draftColor } : t,
        ),
      );
    } else {
      onChange([
        ...tags,
        { id: createId("tag"), name, color: draftColor },
      ]);
    }
    resetForm();
  }

  function handleDelete(id: string) {
    const target = tags.find((t) => t.id === id);
    if (!target) return;
    if (!window.confirm(`ラベル「${target.name}」を削除しますか？`)) return;
    onChange(tags.filter((t) => t.id !== id));
    if (editingId === id) resetForm();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200/70 px-4 py-3">
          <h2 id={titleId} className="text-sm font-semibold text-zinc-900">
            ラベル管理
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-zinc-400 transition-colors hover:text-zinc-700"
          >
            閉じる
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto px-4 py-3">
          <div className="rounded-md border border-zinc-200/80 bg-zinc-50/60 p-3">
            <p className="mb-2 text-[11px] font-medium text-zinc-600">
              {editingId ? "ラベルを編集" : "ラベルを追加"}
            </p>
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="ラベル名（例: 重要）"
              className="input-field mb-2 w-full !py-1.5 !text-xs"
            />
            <p className="mb-1.5 text-[10px] font-medium text-zinc-500">
              カラー（10色）
            </p>
            <div className="flex flex-wrap gap-1.5">
              {TAG_COLORS.map((c) => {
                const selected = draftColor === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    title={c.label}
                    aria-label={c.label}
                    aria-pressed={selected}
                    onClick={() => setDraftColor(c.id)}
                    className={`flex size-7 items-center justify-center rounded-md border transition-all ${
                      selected
                        ? "border-zinc-900 ring-1 ring-zinc-900"
                        : "border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    <span
                      className={`size-3.5 rounded-full ${c.swatch}`}
                      aria-hidden
                    />
                  </button>
                );
              })}
            </div>
            {error ? (
              <p className="mt-1.5 text-[11px] text-red-600">{error}</p>
            ) : null}
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                className="btn-primary !px-3 !py-1.5 !text-xs"
              >
                {editingId ? "更新" : "追加"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary !px-3 !py-1.5 !text-xs"
                >
                  取消
                </button>
              ) : null}
            </div>
          </div>

          <ul className="divide-y divide-zinc-100 rounded-md border border-zinc-200/80">
            {tags.length === 0 ? (
              <li className="px-3 py-4 text-center text-xs text-zinc-400">
                ラベルなし
              </li>
            ) : (
              tags.map((tag) => {
                const color = TAG_COLORS.find((c) => c.id === tag.color);
                return (
                  <li
                    key={tag.id}
                    className="flex items-center gap-2 px-3 py-2 text-sm"
                  >
                    <span
                      className={`size-2.5 shrink-0 rounded-full ${color?.swatch ?? "bg-zinc-400"}`}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-zinc-800">
                        {tag.name}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        {color?.label ?? tag.color}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => startEdit(tag)}
                      className="text-[11px] text-zinc-500 transition-colors hover:text-zinc-900"
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tag.id)}
                      className="text-[11px] text-zinc-400 transition-colors hover:text-red-600"
                    >
                      削除
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
