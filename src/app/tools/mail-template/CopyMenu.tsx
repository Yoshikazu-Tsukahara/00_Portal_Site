"use client";

import { useEffect, useRef, useState } from "react";

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

const MENU_ITEMS: {
  mode: CopyMode;
  label: string;
  hint: string;
}[] = [
  {
    mode: "both",
    label: "件名と本文をまとめてコピー",
    hint: "件名・本文を結合",
  },
  {
    mode: "body",
    label: "本文のみコピー",
    hint: "本文だけ",
  },
  {
    mode: "subject",
    label: "件名のみコピー",
    hint: "件名だけ",
  },
];

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
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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
      const names = emptyLabels.slice(0, 5).join("、");
      const more =
        emptyLabels.length > 5 ? ` ほか${emptyLabels.length - 5}件` : "";
      const ok = window.confirm(
        `未入力の変数がありますが、このままコピーしますか？\n（${names}${more}）`,
      );
      if (!ok) return;
    }

    await writeClipboard(text);
    setOpen(false);
    setCopied(true);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={!canAny}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`btn-primary inline-flex items-center gap-1.5 !px-3 !py-1.5 text-xs transition-all duration-300 sm:text-sm ${
          copied ? "!scale-[1.02] !bg-emerald-600 hover:!bg-emerald-600" : ""
        }`}
      >
        {copied ? "コピー完了！" : "コピー"}
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
          className="absolute right-0 z-20 mt-1.5 w-64 overflow-hidden rounded-md border border-zinc-200 bg-white py-1 shadow-lg"
        >
          {MENU_ITEMS.map((item) => {
            const text = resolveText(item.mode);
            const disabled = !text;
            return (
              <button
                key={item.mode}
                type="button"
                role="menuitem"
                disabled={disabled}
                onClick={() => handleCopy(item.mode)}
                className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="text-xs font-medium text-zinc-800">
                  {item.label}
                </span>
                <span className="text-[10px] text-zinc-400">{item.hint}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
