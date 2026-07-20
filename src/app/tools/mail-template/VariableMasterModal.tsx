"use client";

import { useEffect, useId, useState } from "react";
import { isValidVariableKey } from "./templateUtils";
import { createId, type VariableMasterItem } from "./types";

/** 変数マスタの CRUD モーダル */
export default function VariableMasterModal({
  open,
  variables,
  onClose,
  onChange,
}: {
  open: boolean;
  variables: VariableMasterItem[];
  onClose: () => void;
  onChange: (next: VariableMasterItem[]) => void;
}) {
  const titleId = useId();
  const [draftKey, setDraftKey] = useState("");
  const [draftLabel, setDraftLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraftKey("");
    setDraftLabel("");
    setError(null);
    setEditingId(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function resetForm() {
    setDraftKey("");
    setDraftLabel("");
    setEditingId(null);
    setError(null);
  }

  function startEdit(item: VariableMasterItem) {
    setEditingId(item.id);
    setDraftKey(item.key);
    setDraftLabel(item.label);
    setError(null);
  }

  function handleSubmit() {
    const key = draftKey.trim();
    const label = draftLabel.trim() || key;
    setError(null);

    if (!key) {
      setError("キーを入力");
      return;
    }
    if (!isValidVariableKey(key)) {
      setError("英数字と _ のみ（先頭は英字）");
      return;
    }
    const dup = variables.find(
      (v) => v.key === key && v.id !== editingId,
    );
    if (dup) {
      setError("同じキーが既に存在");
      return;
    }

    if (editingId) {
      onChange(
        variables.map((v) =>
          v.id === editingId ? { ...v, key, label } : v,
        ),
      );
    } else {
      onChange([
        ...variables,
        { id: createId("var"), key, label },
      ]);
    }
    resetForm();
  }

  function handleDelete(id: string) {
    const target = variables.find((v) => v.id === id);
    if (!target) return;
    if (!window.confirm(`変数「${target.label}」を削除しますか？`)) return;
    onChange(variables.filter((v) => v.id !== id));
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
            変数マスタ
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
              {editingId ? "変数を編集" : "変数を追加"}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={draftKey}
                onChange={(e) => setDraftKey(e.target.value)}
                placeholder="キー（例: company）"
                className="input-field flex-1 !py-1.5 !text-xs font-mono"
              />
              <input
                type="text"
                value={draftLabel}
                onChange={(e) => setDraftLabel(e.target.value)}
                placeholder="ラベル（例: 会社名）"
                className="input-field flex-1 !py-1.5 !text-xs"
              />
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
            {variables.length === 0 ? (
              <li className="px-3 py-4 text-center text-xs text-zinc-400">
                変数なし
              </li>
            ) : (
              variables.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center gap-2 px-3 py-2 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-zinc-800">
                      {v.label}
                    </p>
                    <p className="font-mono text-[10px] text-zinc-400">
                      {`{{${v.key}}}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startEdit(v)}
                    className="text-[11px] text-zinc-500 transition-colors hover:text-zinc-900"
                  >
                    編集
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(v.id)}
                    className="text-[11px] text-zinc-400 transition-colors hover:text-red-600"
                  >
                    削除
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
