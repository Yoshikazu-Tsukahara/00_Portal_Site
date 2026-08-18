"use client";

import { useRef, useState } from "react";

import { useI18n } from "@/i18n";
import { ACCEPTED_FILE_TYPES } from "./readSheets";

/** .xlsx のドラッグ＆ドロップ／ファイル選択エリア */
export default function DropZone({
  onFiles,
  isReading = false,
  isFull = false,
}: {
  onFiles: (files: File[]) => void;
  /** 読み込み中は操作を止める */
  isReading?: boolean;
  /** 5 ファイル上限に達している */
  isFull?: boolean;
}) {
  const { t } = useI18n();
  const copy = t.apps.excelMerger.drop;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const blocked = isReading || isFull;

  function handleFiles(list: FileList | File[] | null) {
    if (!list) return;
    const files = Array.from(list);
    if (files.length > 0) onFiles(files);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-disabled={blocked}
      onKeyDown={(e) => {
        if (blocked) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onClick={() => {
        if (!blocked) inputRef.current?.click();
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!blocked) setIsDragging(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!blocked) setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (blocked) return;
        handleFiles(e.dataTransfer.files);
      }}
      className={`flex flex-col items-center justify-center rounded-md border border-dashed px-4 py-8 text-center transition-all duration-150 md:py-10 ${
        blocked
          ? "cursor-not-allowed border-zinc-200 bg-zinc-50 opacity-60"
          : isDragging
            ? "cursor-pointer border-[var(--accent-strong)] bg-[color-mix(in_srgb,var(--accent)_28%,white)]"
            : "cursor-pointer border-zinc-300 bg-white hover:border-[var(--accent-strong)] hover:bg-[color-mix(in_srgb,var(--accent)_18%,white)] active:bg-[color-mix(in_srgb,var(--accent)_28%,white)]"
      }`}
    >
      <p className="text-sm font-medium text-zinc-800">
        {isReading ? copy.reading : isFull ? copy.full : copy.hint}
      </p>
      <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500">
        {copy.sub}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        multiple
        className="hidden"
        disabled={blocked}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
