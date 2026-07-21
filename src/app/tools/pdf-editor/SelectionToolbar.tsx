"use client";

import { fmt, useI18n } from "@/i18n";

/** 選択・クリップボード操作パネル */
export default function SelectionToolbar({
  selectedCount,
  clipboardCount,
  onCopy,
  onRotate,
  onDelete,
  onExtract,
  onClearSelection,
  onClearClipboard,
}: {
  selectedCount: number;
  clipboardCount: number;
  onCopy: () => void;
  onRotate: () => void;
  onDelete: () => void;
  onExtract?: () => void;
  onClearSelection: () => void;
  onClearClipboard: () => void;
}) {
  const { t } = useI18n();
  const copy = t.apps.pdfEditor.selection;

  if (selectedCount < 1 && clipboardCount === 0) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5"
      role="toolbar"
      aria-label={copy.aria}
    >
      {selectedCount > 0 ? (
        <>
          <span className="text-xs font-medium text-zinc-600">
            {fmt(copy.selected, { count: selectedCount })}
          </span>
          <span aria-hidden className="h-3.5 w-px shrink-0 bg-zinc-200" />
          <button
            type="button"
            onClick={onCopy}
            className="btn-secondary !px-2 !py-1 text-xs"
          >
            {copy.copy}
          </button>
          {onExtract ? (
            <button
              type="button"
              onClick={onExtract}
              className="btn-secondary !px-2 !py-1 text-xs"
            >
              {fmt(copy.extract, { count: selectedCount })}
            </button>
          ) : null}
          {selectedCount >= 2 ? (
            <>
              <button
                type="button"
                onClick={onRotate}
                className="btn-secondary !px-2 !py-1 text-xs"
              >
                {copy.rotate}
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center justify-center rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                {copy.delete}
              </button>
              <button
                type="button"
                onClick={onClearSelection}
                className="text-[11px] text-zinc-400 transition-colors hover:text-zinc-700"
              >
                {copy.clearSelection}
              </button>
            </>
          ) : null}
        </>
      ) : null}

      {clipboardCount > 0 ? (
        <>
          {selectedCount > 0 ? (
            <span aria-hidden className="h-3.5 w-px shrink-0 bg-zinc-200" />
          ) : null}
          <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-700">
            {fmt(copy.copying, { count: clipboardCount })}
          </span>
          <span className="text-[11px] text-zinc-400">{copy.pasteHint}</span>
          <button
            type="button"
            onClick={onClearClipboard}
            className="ml-auto text-[11px] text-zinc-400 transition-colors hover:text-zinc-700"
          >
            {copy.clearCopy}
          </button>
        </>
      ) : null}
    </div>
  );
}
