"use client";

import type { UltimateProbabilitySlotDict } from "@/i18n/apps/ultimateProbabilitySlot";

/** 的中 / アンチビンゴ失敗時の、淡々としたシステム風フラッシュ表示 */
export default function FlashOverlay({
  kind,
  copy,
  onDismiss,
}: {
  kind: "hit" | "fail";
  copy: UltimateProbabilitySlotDict["flash"];
  onDismiss: () => void;
}) {
  const title = kind === "hit" ? copy.hitTitle : copy.failTitle;
  const body = kind === "hit" ? copy.hitBody : copy.failBody;
  const continueLabel = kind === "hit" ? copy.hitContinue : copy.failContinue;

  return (
    <div
      className={`slot-flash-overlay slot-flash-overlay--${kind}`}
      role="alertdialog"
      aria-modal="true"
    >
      <p className="slot-flash-title">{title}</p>
      <p className="max-w-sm text-sm leading-relaxed text-zinc-300">{body}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="slot-ghost-btn mt-4 !px-6"
      >
        {continueLabel}
      </button>
    </div>
  );
}
