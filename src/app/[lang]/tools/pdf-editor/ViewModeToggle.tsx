"use client";

import { useI18n } from "@/i18n";

export type ViewMode = "page" | "file";

/** ページ単位 / ファイル単位の切替（セグメント） */
export default function ViewModeToggle({
  mode,
  onChange,
  fileModeLocked = false,
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  fileModeLocked?: boolean;
}) {
  const { t } = useI18n();
  const copy = t.apps.pdfEditor.viewMode;

  return (
    <div
      className="inline-flex rounded-md border border-zinc-200 bg-zinc-100/80 p-0.5"
      role="tablist"
      aria-label={copy.aria}
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "page"}
        onClick={() => onChange("page")}
        className={`rounded-[5px] px-2 py-1.5 text-xs font-medium transition-colors active:scale-[0.98] sm:px-2.5 sm:py-1 ${
          mode === "page"
            ? "bg-white text-zinc-900 shadow-sm"
            : "text-zinc-500 hover:text-zinc-800 active:bg-zinc-200/60"
        }`}
      >
        <span className="sm:hidden">{copy.pageShort}</span>
        <span className="hidden sm:inline">{copy.page}</span>
      </button>

      <span className="group/filetab relative inline-flex">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "file"}
          aria-disabled={fileModeLocked}
          disabled={fileModeLocked}
          title={fileModeLocked ? copy.fileLockedTitle : undefined}
          onClick={() => {
            if (!fileModeLocked) onChange("file");
          }}
          className={`rounded-[5px] px-2 py-1.5 text-xs font-medium transition-colors active:scale-[0.98] sm:px-2.5 sm:py-1 ${
            fileModeLocked
              ? "cursor-not-allowed text-zinc-300"
              : mode === "file"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 active:bg-zinc-200/60"
          }`}
        >
          <span className="sm:hidden">{copy.fileShort}</span>
          <span className="hidden sm:inline">{copy.file}</span>
        </button>
        {fileModeLocked ? (
          <span
            role="tooltip"
            className="pointer-events-none absolute left-1/2 top-full z-30 mt-1.5 w-max max-w-[min(220px,70vw)] -translate-x-1/2 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-[10px] leading-snug text-zinc-600 opacity-100 shadow-sm sm:opacity-0 sm:transition-opacity sm:group-hover/filetab:opacity-100"
          >
            {copy.fileLockedHint}
          </span>
        ) : null}
      </span>
    </div>
  );
}
