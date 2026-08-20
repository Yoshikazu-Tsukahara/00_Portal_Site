"use client";

import { useEffect, useId } from "react";
import type { CharacterRelationDict } from "@/i18n/apps/characterRelation";

/** 「すべてクリア」用の確認ダイアログ */
export default function ClearConfirmModal({
  open,
  copy,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  copy: CharacterRelationDict;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-zinc-950/40 p-4 sm:items-center"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white shadow-lg"
      >
        <div className="border-b border-zinc-100 px-4 py-3">
          <h2
            id={titleId}
            className="text-sm font-semibold tracking-tight text-zinc-900"
          >
            {copy.sample.clear}
          </h2>
        </div>
        <p className="px-4 py-4 text-sm leading-relaxed text-zinc-600">
          {copy.confirmClearAll}
        </p>
        <div className="flex justify-end gap-2 border-t border-zinc-100 px-4 py-3">
          <button type="button" onClick={onCancel} className="btn-secondary">
            {copy.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100"
          >
            {copy.sample.clear}
          </button>
        </div>
      </div>
    </div>
  );
}
