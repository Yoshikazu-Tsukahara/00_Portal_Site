"use client";

import { useState } from "react";
import { Check, Copy, Plus, Sparkles, X } from "lucide-react";

import { useI18n } from "@/i18n";
import { createPromptMemo, type PromptMemo } from "./types";

type PromptsPanelProps = {
  prompts: PromptMemo[];
  onChange: (prompts: PromptMemo[]) => void;
};

/** タブ2「AI プロンプト」：よく使う指示をストックしてワンクリックでコピーする */
export default function PromptsPanel({
  prompts,
  onChange,
}: PromptsPanelProps) {
  const { t } = useI18n();
  const copy = t.apps.bookVisualizer.edit.prompts;
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyError, setCopyError] = useState("");

  function patchPrompt(id: string, patch: Partial<PromptMemo>) {
    onChange(
      prompts.map((memo) => (memo.id === id ? { ...memo, ...patch } : memo)),
    );
  }

  async function copyBody(memo: PromptMemo) {
    setCopyError("");
    try {
      await navigator.clipboard.writeText(memo.body);
      setCopiedId(memo.id);
      window.setTimeout(() => setCopiedId(null), 1600);
    } catch {
      setCopyError(copy.copyFailed);
    }
  }

  function removePrompt(id: string) {
    if (!window.confirm(copy.confirmRemove)) return;
    onChange(prompts.filter((memo) => memo.id !== id));
  }

  return (
    <div className="flex h-0 min-h-0 flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto overscroll-contain p-3 sm:p-4">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <h2 className="flex items-center gap-1.5 text-xs font-semibold tracking-tight text-zinc-100">
          <Sparkles className="size-4 text-zinc-400" aria-hidden />
          {copy.heading}
        </h2>
        <button
          type="button"
          onClick={() => onChange([...prompts, createPromptMemo()])}
          className="bv-ui-btn bv-ui-btn--sm ml-auto"
        >
          <Plus className="size-4" aria-hidden />
          {copy.add}
        </button>
      </div>
      <p className="bv-ui-hint">{copy.lead}</p>

      {copyError ? (
        <p role="alert" className="break-words text-[11px] text-red-400">
          {copyError}
        </p>
      ) : null}

      {prompts.length === 0 ? (
        <p className="bv-ui-empty">{copy.empty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {prompts.map((memo) => (
            <li key={memo.id} className="bv-ui-card">
              <div className="mb-1.5 flex min-w-0 items-center gap-1.5">
                <input
                  type="text"
                  value={memo.title}
                  onChange={(event) =>
                    patchPrompt(memo.id, { title: event.target.value })
                  }
                  placeholder={copy.titlePlaceholder}
                  className="bv-ui-field min-w-0 flex-1"
                />
                <button
                  type="button"
                  onClick={() => void copyBody(memo)}
                  className="bv-ui-btn bv-ui-btn--sm"
                >
                  {copiedId === memo.id ? (
                    <Check className="size-4" aria-hidden />
                  ) : (
                    <Copy className="size-4" aria-hidden />
                  )}
                  {copiedId === memo.id ? copy.copied : copy.copy}
                </button>
                <button
                  type="button"
                  onClick={() => removePrompt(memo.id)}
                  title={copy.remove}
                  aria-label={copy.remove}
                  className="bv-ui-icon-btn bv-ui-icon-btn--sm"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
              <textarea
                value={memo.body}
                onChange={(event) =>
                  patchPrompt(memo.id, { body: event.target.value })
                }
                placeholder={copy.bodyPlaceholder}
                rows={4}
                className="bv-ui-field resize-y"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
