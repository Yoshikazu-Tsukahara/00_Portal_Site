"use client";

import { useEffect, useState, type ReactNode } from "react";

import { useI18n } from "@/i18n";
import CopyMenu from "./CopyMenu";

type PaneTab = "source" | "preview";

/**
 * 変数入力は常時表示。
 * 原稿編集と変数適用プレビューはタブで切替。
 */
export default function PreviewPane({
  sourceSubject,
  sourceBody,
  previewSubject,
  previewBody,
  combinedText,
  emptyLabels,
  variablesSlot,
  resetKey,
  onSourceSubjectChange,
  onSourceBodyChange,
  onReloadFromTemplate,
}: {
  sourceSubject: string;
  sourceBody: string;
  previewSubject: string;
  previewBody: string;
  combinedText: string;
  emptyLabels: string[];
  /** タブの上に常時出す（変数入力など） */
  variablesSlot?: ReactNode;
  /** 変わると編集タブへ戻す（テンプレ切替時など） */
  resetKey?: string | null;
  onSourceSubjectChange: (value: string) => void;
  onSourceBodyChange: (value: string) => void;
  onReloadFromTemplate: () => void;
}) {
  const { t } = useI18n();
  const mt = t.apps.mailTemplate;
  const [tab, setTab] = useState<PaneTab>("source");

  useEffect(() => {
    setTab("source");
  }, [resetKey]);

  return (
    <div className="flex w-full max-w-full flex-col gap-3">
      {variablesSlot ? (
        <div className="border-b border-zinc-100 pb-2 md:pb-3">
          {variablesSlot}
        </div>
      ) : null}

      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="inline-flex w-full rounded-md border border-zinc-200 bg-zinc-100/80 p-0.5 sm:w-auto"
          role="tablist"
          aria-label={mt.preview.tabAria}
        >
          {(
            [
              ["source", mt.preview.sourceHeading],
              ["preview", mt.preview.heading],
            ] as const
          ).map(([id, label]) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`mail-pane-${id}`}
                id={`mail-tab-${id}`}
                onClick={() => setTab(id)}
                className={`min-w-0 flex-1 rounded-[5px] px-2.5 py-1.5 text-xs font-medium transition-colors active:scale-[0.98] sm:flex-none sm:px-3 ${
                  active
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 active:bg-zinc-200/60"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:justify-end">
          {tab === "source" ? (
            <button
              type="button"
              onClick={onReloadFromTemplate}
              className="btn-secondary !px-2 !py-1.5 text-[11px] leading-tight active:scale-[0.98] active:bg-zinc-100"
              title={mt.preview.reloadHint}
            >
              {mt.preview.reload}
            </button>
          ) : (
            <CopyMenu
              subjectText={previewSubject}
              bodyText={previewBody}
              combinedText={combinedText}
              emptyLabels={emptyLabels}
            />
          )}
        </div>
      </div>

      <p className="text-[10px] leading-snug text-zinc-400">
        {tab === "source" ? mt.preview.sourceHint : mt.preview.previewHint}
      </p>

      {tab === "source" ? (
        <div
          id="mail-pane-source"
          role="tabpanel"
          aria-labelledby="mail-tab-source"
          className="flex min-w-0 flex-col gap-2"
        >
          <div className="min-w-0 shrink-0 rounded-md border border-zinc-200/80 bg-white p-2 md:p-3">
            <label
              htmlFor="mail-source-subject"
              className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-zinc-400"
            >
              {mt.preview.subject}
            </label>
            <input
              id="mail-source-subject"
              type="text"
              value={sourceSubject}
              onChange={(e) => onSourceSubjectChange(e.target.value)}
              placeholder={mt.preview.emptySubject}
              className="input-field w-full !px-2 !py-1.5 text-sm font-medium text-zinc-900"
              spellCheck={false}
            />
          </div>

          <div className="min-w-0 shrink-0 rounded-md border border-zinc-200/80 bg-white p-2 md:p-3">
            <label
              htmlFor="mail-source-body"
              className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-zinc-400"
            >
              {mt.preview.body}
            </label>
            <textarea
              id="mail-source-body"
              value={sourceBody}
              onChange={(e) => onSourceBodyChange(e.target.value)}
              placeholder={mt.preview.emptyBody}
              rows={12}
              className="input-field min-h-[12rem] w-full resize-y !px-2 !py-1.5 font-sans text-sm leading-relaxed text-zinc-800"
              spellCheck={false}
            />
          </div>
        </div>
      ) : (
        <div
          id="mail-pane-preview"
          role="tabpanel"
          aria-labelledby="mail-tab-preview"
          className="flex min-w-0 flex-col gap-2"
        >
          <div className="min-w-0 shrink-0 rounded-md border border-zinc-200/80 bg-zinc-50/60 p-2 md:p-3">
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
              {mt.preview.subject}
            </p>
            <p className="break-words text-sm font-medium text-zinc-900">
              {previewSubject.trim()
                ? previewSubject
                : mt.preview.emptySubject}
            </p>
          </div>

          <div className="min-w-0 shrink-0 rounded-md border border-zinc-200/80 bg-zinc-50/60 p-2 md:p-3">
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
              {mt.preview.body}
            </p>
            <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-zinc-800">
              {previewBody.trim() ? previewBody : mt.preview.emptyBody}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
