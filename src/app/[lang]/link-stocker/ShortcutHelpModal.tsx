"use client";

import { useEffect, useId, useRef } from "react";
import { buildBookmarkletHref } from "./urlParams";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  bookmarkletTitle: string;
  bookmarkletHint: string;
  dragLabel: string;
  shareHint: string;
  closeLabel: string;
};

/** 簡単登録（ブックマークレット／共有）の使い方モーダル */
export default function ShortcutHelpModal({
  open,
  onClose,
  title,
  bookmarkletTitle,
  bookmarkletHint,
  dragLabel,
  shareHint,
  closeLabel,
}: Props) {
  const titleId = useId();
  const anchorRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = anchorRef.current;
    if (!el) return;
    // javascript: は React の href だと除去されるため属性で直接セット
    el.setAttribute("href", buildBookmarkletHref(window.location.origin));
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

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-zinc-950/45 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="lunch-install-modal w-full max-w-sm overflow-hidden rounded-t-3xl border border-zinc-200/80 bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pb-2 pt-5 text-center">
          <div
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl"
            aria-hidden
          >
            💡
          </div>
          <h2
            id={titleId}
            className="text-lg font-semibold tracking-tight text-zinc-900"
          >
            {title}
          </h2>
        </div>

        <div className="space-y-4 px-5 py-3 text-left">
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-3">
            <p className="text-sm font-semibold text-zinc-800">
              {bookmarkletTitle}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              {bookmarkletHint}
            </p>
            <a
              ref={anchorRef}
              href="#"
              onClick={(e) => {
                // クリック起動ではなくドラッグ登録が目的
                e.preventDefault();
              }}
              draggable
              className="mt-3 inline-flex cursor-grab items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 active:cursor-grabbing"
            >
              <span aria-hidden>🔖</span>
              {dragLabel}
            </a>
          </div>

          <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-3">
            <p className="text-sm font-semibold text-zinc-800">📱 スマホ</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              {shareHint}
            </p>
          </div>
        </div>

        <div className="border-t border-zinc-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="lunch-confirm-btn w-full !py-3"
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
