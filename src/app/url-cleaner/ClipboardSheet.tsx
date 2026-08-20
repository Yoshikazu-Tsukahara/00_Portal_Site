"use client";

import { LoaderCircle } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { UrlCleanerDict } from "@/i18n/apps/urlCleaner";
import { readClipboardText } from "./clipboard";

type Props = {
  open: boolean;
  initialDraft: string;
  initialReadFailed: boolean;
  onClose: () => void;
  onApply: (text: string) => void;
  labels: UrlCleanerDict["clipboardSheet"];
};

/** クリップボード内容を確認してから入力欄へ渡すシート */
export default function ClipboardSheet({
  open,
  initialDraft,
  initialReadFailed,
  onClose,
  onApply,
  labels,
}: Props) {
  const titleId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState(initialDraft);
  const [readFailed, setReadFailed] = useState(initialReadFailed);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraft(initialDraft);
    setReadFailed(initialReadFailed);
    window.setTimeout(() => textareaRef.current?.focus(), 0);
  }, [open, initialDraft, initialReadFailed]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleRetryRead() {
    setRetrying(true);
    try {
      const result = await readClipboardText();
      if (result.ok) {
        setDraft(result.text);
        setReadFailed(false);
      } else {
        setReadFailed(true);
      }
    } finally {
      setRetrying(false);
    }
  }

  function handleApply() {
    const text = draft.trim();
    if (!text) return;
    onApply(text);
    onClose();
  }

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
        <div className="px-4 pb-1 pt-4 text-center sm:px-5 sm:pt-5">
          <div
            className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-xl"
            aria-hidden
          >
            📋
          </div>
          <h2
            id={titleId}
            className="text-base font-semibold tracking-tight text-zinc-900 sm:text-lg"
          >
            {labels.title}
          </h2>
          <p className="mt-1 text-[11px] leading-snug text-zinc-500 sm:text-xs">
            {labels.hint}
          </p>
        </div>

        <div className="space-y-3 px-4 pb-5 pt-3 sm:px-5">
          {readFailed ? (
            <p className="text-[11px] font-medium leading-snug text-amber-700">
              {labels.manualHint}
            </p>
          ) : null}
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={labels.empty}
            rows={3}
            spellCheck={false}
            className="min-h-[5.5rem] w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none ring-emerald-400/40 focus:ring-2"
          />

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void handleRetryRead()}
                disabled={retrying}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-white disabled:opacity-50"
              >
                {retrying ? (
                  <LoaderCircle className="size-4 animate-spin" aria-hidden />
                ) : null}
                {labels.retry}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="min-h-11 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-white"
              >
                {labels.close}
              </button>
            </div>
            <button
              type="button"
              onClick={handleApply}
              disabled={!draft.trim()}
              className="lunch-confirm-btn min-h-11 w-full !rounded-xl !py-2.5 disabled:opacity-50"
            >
              {labels.use}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
