"use client";

import { useId } from "react";
import type { PixelDropPuzzleDict } from "@/i18n/apps/pixelDropPuzzle";

/** 進行リセット用の確認ダイアログ（重大操作のため明示的な確認が必要） */
export default function ResetConfirmModal({
  open,
  copy,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  copy: PixelDropPuzzleDict["hud"];
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const titleId = useId();
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[75] flex items-center justify-center bg-black/88 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-pxd-no-drop
      onPointerDown={(e) => {
        // 背景タップはキャンセル扱い（DROP に伝播させない）
        e.stopPropagation();
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className="pxd-rules-modal pointer-events-auto"
        data-pxd-no-drop
        onPointerDown={(e) => e.stopPropagation()}
      >
        <p className="pxd-records-rail__eyebrow">{copy.resetConfirmEyebrow}</p>
        <h2 id={titleId} className="pxd-rules-modal__title">
          {copy.resetConfirmTitle}
        </h2>
        <p className="pxd-rules-modal__lead">{copy.resetConfirm}</p>
        <div className="pxd-records-rail__divider" aria-hidden />
        <div className="pxd-reset-confirm__actions">
          <button
            type="button"
            onClick={onCancel}
            className="pxd-reset-confirm__cancel"
          >
            {copy.resetConfirmCancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="pxd-reset-confirm__confirm"
          >
            {copy.resetConfirmOk}
          </button>
        </div>
      </div>
    </div>
  );
}
