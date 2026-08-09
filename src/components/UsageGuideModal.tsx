"use client";

import { useEffect, useId, useState } from "react";
import { useI18n } from "@/i18n";

type Props = {
  open: boolean;
  onClose: (dontShowAgain: boolean) => void;
};

/**
 * サイト全体の初回利用ガイド。
 * 「次回から表示しない」は閉じるときに Host 側へ渡す。
 */
export default function UsageGuideModal({ open, onClose }: Props) {
  const { t } = useI18n();
  const copy = t.usageGuide;
  const titleId = useId();
  const checkboxId = useId();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (!open) {
      setDontShowAgain(false);
      return;
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose(dontShowAgain);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, dontShowAgain]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-zinc-950/45 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={() => onClose(dontShowAgain)}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-t-3xl border border-zinc-200/80 bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pb-1 pt-5 text-center sm:px-6">
          <h2
            id={titleId}
            className="font-display text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl"
          >
            {copy.title}
          </h2>
        </div>

        <ol className="space-y-2.5 px-5 py-4 sm:px-6">
          {copy.steps.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/80 px-3.5 py-3"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-zinc-900"
                aria-hidden
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zinc-900">
                  {step.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500 sm:text-[13px]">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="space-y-3 border-t border-zinc-100 px-5 py-4 sm:px-6">
          <label
            htmlFor={checkboxId}
            className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-zinc-600"
          >
            <input
              id={checkboxId}
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="h-4 w-4 shrink-0 rounded border-zinc-300 text-zinc-800 accent-[var(--accent-strong)]"
            />
            <span>{copy.dontShowAgain}</span>
          </label>

          <button
            type="button"
            onClick={() => onClose(dontShowAgain)}
            className="btn-secondary w-full !py-3 !text-sm"
          >
            {copy.close}
          </button>
        </div>
      </div>
    </div>
  );
}
