"use client";

import { useEffect, useRef, useState } from "react";
import { fmt, useI18n } from "@/i18n";

export type CopyMode = "both" | "body" | "subject";

async function writeClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
}

/** コピー種別を選ぶドロップダウン（未入力警告付き） */
export default function CopyMenu({
  subjectText,
  bodyText,
  combinedText,
  emptyLabels,
}: {
  subjectText: string;
  bodyText: string;
  combinedText: string;
  emptyLabels: string[];
}) {
  const { t } = useI18n();
  const mt = t.apps.mailTemplate;
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuItems: { mode: CopyMode; label: string; hint: string }[] = [
    { mode: "both", label: mt.copy.both, hint: mt.copy.bothHint },
    { mode: "body", label: mt.copy.bodyOnly, hint: mt.copy.bodyHint },
    {
      mode: "subject",
      label: mt.copy.subjectOnly,
      hint: mt.copy.subjectHint,
    },
  ];

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const canAny =
    combinedText.trim().length > 0 ||
    bodyText.trim().length > 0 ||
    subjectText.trim().length > 0;

  function resolveText(mode: CopyMode): string {
    if (mode === "subject") return subjectText.trim();
    if (mode === "body") return bodyText.trim();
    return combinedText.trim();
  }

  async function handleCopy(mode: CopyMode) {
    const text = resolveText(mode);
    if (!text) {
      setOpen(false);
      return;
    }

    if (emptyLabels.length > 0) {
      const names = emptyLabels.slice(0, 5).join(mt.copy.listSeparator);
      const more =
        emptyLabels.length > 5
          ? fmt(mt.copy.confirmMore, { count: emptyLabels.length - 5 })
          : "";
      const ok = window.confirm(
        fmt(mt.copy.confirmEmpty, { names, more }),
      );
      if (!ok) return;
    }

    await writeClipboard(text);
    setOpen(false);
    setCopied(true);
  }

  return (
    <div ref={rootRef} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={!canAny}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`btn-primary inline-flex min-h-11 w-full items-center justify-center gap-1.5 !px-3 !py-2 text-xs transition-all duration-300 active:scale-[0.98] sm:min-h-0 sm:w-auto sm:!py-1.5 sm:text-sm ${
          copied
            ? "!scale-[1.02] !bg-emerald-600 hover:!bg-emerald-600 active:!bg-emerald-700"
            : "active:brightness-95"
        }`}
      >
        {copied ? mt.copy.done : mt.copy.button}
        {!copied ? (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1.5 w-full max-w-[min(100vw-2rem,16rem)] overflow-hidden rounded-md border border-zinc-200 bg-white py-1 shadow-lg sm:w-64 sm:max-w-none"
        >
          {menuItems.map((item) => {
            const text = resolveText(item.mode);
            const disabled = !text;
            return (
              <button
                key={item.mode}
                type="button"
                role="menuitem"
                disabled={disabled}
                onClick={() => handleCopy(item.mode)}
                className="flex min-h-11 w-full flex-col items-start justify-center gap-0.5 px-3 py-2 text-left transition-colors hover:bg-zinc-50 active:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 md:min-h-0"
              >
                <span className="break-words text-xs font-medium text-zinc-800">
                  {item.label}
                </span>
                <span className="break-words text-[10px] text-zinc-400">
                  {item.hint}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
