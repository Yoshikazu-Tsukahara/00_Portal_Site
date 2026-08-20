"use client";

import {
  Check,
  ClipboardPaste,
  Copy,
  LoaderCircle,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { useI18n } from "@/i18n";
import QrCodePanel from "./QrCodePanel";
import { readClipboardText } from "./clipboard";
import { cleanUrl } from "./cleanUrl";

export default function UrlCleanerPage() {
  const { t } = useI18n();
  const copy = t.apps.urlCleaner;
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [pasting, setPasting] = useState(false);
  const [pasteError, setPasteError] = useState<string | null>(null);

  const cleaned = useMemo(() => cleanUrl(input), [input]);
  const savedChars =
    cleaned && input.trim() ? Math.max(0, input.trim().length - cleaned.length) : 0;

  async function handlePaste() {
    setPasteError(null);
    setPasting(true);
    try {
      const result = await readClipboardText();
      if (!result.ok) {
        setPasteError(copy.paste.failed);
        return;
      }
      if (!result.text.trim()) {
        setPasteError(copy.paste.empty);
        return;
      }
      setInput(result.text.trim());
    } finally {
      setPasting(false);
    }
  }

  async function handleCopy() {
    if (!cleaned) return;
    try {
      await navigator.clipboard.writeText(cleaned);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.alert(copy.errors.copyFailed);
    }
  }

  function handleClear() {
    setInput("");
    setPasteError(null);
  }

  return (
    <AppShell
      title={copy.shell.title}
      titleShort={copy.shell.titleShort}
      description={copy.shell.description}
      isPwa
    >
      <div className="flex min-w-0 w-full max-w-full flex-col gap-2 pb-1">
        {/* 入力カード */}
        <section className="rounded-2xl border border-zinc-200/90 bg-white p-2.5 sm:p-3">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              {copy.form.inputLabel}
            </span>
            {input ? (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-0.5 text-[10px] font-medium text-zinc-400 transition hover:text-zinc-700"
              >
                <X className="size-3" aria-hidden />
                {copy.form.clear}
              </button>
            ) : null}
          </div>

          <div className="relative rounded-xl border border-zinc-200 bg-white ring-emerald-400/40 focus-within:ring-2">
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (pasteError) setPasteError(null);
              }}
              placeholder={input ? copy.form.inputPlaceholder : undefined}
              rows={2}
              spellCheck={false}
              autoComplete="off"
              aria-label={copy.form.inputLabel}
              className={`max-h-32 w-full resize-none break-all rounded-xl bg-transparent px-3 py-2 text-sm leading-snug text-zinc-900 outline-none placeholder:text-zinc-400 ${
                input
                  ? "min-h-[3.25rem]"
                  : "min-h-[4.5rem] sm:min-h-[5rem]"
              }`}
            />
            {!input ? (
              <button
                type="button"
                onClick={() => void handlePaste()}
                disabled={pasting}
                title={copy.paste.button}
                aria-label={copy.paste.buttonAria}
                className="absolute left-1/2 top-1/2 z-10 inline-flex min-h-11 -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 text-sm font-semibold text-emerald-800 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-100 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pasting ? (
                  <LoaderCircle className="size-4 animate-spin" aria-hidden />
                ) : (
                  <ClipboardPaste className="size-4" aria-hidden />
                )}
                <span>{copy.paste.button}</span>
              </button>
            ) : null}
          </div>

          {pasteError ? (
            <p className="mt-1.5 text-[11px] font-medium leading-snug text-rose-600">
              {pasteError}
            </p>
          ) : null}
        </section>

        {/* 出力 */}
        {cleaned ? (
          <section className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-white p-2.5 sm:p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                    {copy.form.outputLabel}
                  </span>
                  {savedChars > 0 ? (
                    <span className="rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-emerald-800">
                      −{savedChars.toLocaleString()}
                    </span>
                  ) : null}
                </div>
                <p className="break-all font-mono text-[13px] leading-snug text-zinc-800">
                  {cleaned}
                </p>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="lunch-confirm-btn mt-2.5 w-full !rounded-xl !py-2.5 active:scale-[0.98] sm:w-auto sm:!px-5"
                >
                  {copied ? (
                    <Check className="size-4" aria-hidden />
                  ) : (
                    <Copy className="size-4" aria-hidden />
                  )}
                  <span className="ml-1.5">
                    {copied ? copy.form.copied : copy.form.copy}
                  </span>
                </button>
              </div>

              <div className="border-t border-emerald-200/60 pt-3 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
                <QrCodePanel value={cleaned} labels={copy.qr} />
              </div>
            </div>
          </section>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-200/90 bg-zinc-50/60 px-4 py-5 text-center sm:py-6">
            <p className="text-xl leading-none" aria-hidden>
              ✂️
            </p>
            <p className="mt-2 text-xs font-semibold text-zinc-700">
              {copy.empty.title}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-zinc-400">
              {copy.empty.hint}
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
