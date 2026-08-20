"use client";

import { useRef, useState } from "react";

import { useI18n } from "@/i18n";

/** 画像のドラッグ＆ドロップ／複数選択ゾーン */
export default function ImageDropZone({
  onFiles,
  disabled,
  compact,
}: {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  /** 一覧があるときの小さめゾーン */
  compact?: boolean;
}) {
  const { t } = useI18n();
  const copy = t.apps.exifRemover;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleList(list: FileList | File[] | null) {
    if (!list || list.length === 0) return;
    onFiles(Array.from(list));
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onClick={() => {
        if (!disabled) inputRef.current?.click();
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragging(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragging(true);
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
        if (disabled) return;
        handleList(e.dataTransfer.files);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed text-center transition-all duration-150 ${
        compact
          ? "min-h-11 px-3 py-3 sm:py-4"
          : "min-h-[12rem] px-4 py-10 sm:min-h-[14rem] sm:px-6 sm:py-14"
      } ${
        disabled
          ? "cursor-not-allowed border-zinc-200 bg-zinc-50 opacity-60"
          : isDragging
            ? "border-[var(--accent-strong)] bg-[color-mix(in_srgb,var(--accent)_28%,white)]"
            : "border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50 active:bg-zinc-100"
      }`}
    >
      <p
        className={`break-words font-semibold text-zinc-900 ${
          compact ? "text-sm" : "text-base"
        }`}
      >
        {compact ? copy.dropHintCompact : copy.dropHint}
      </p>
      {!compact ? (
        <p className="mt-2 max-w-md break-words text-sm leading-relaxed text-zinc-500">
          {copy.dropSub}
        </p>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
        multiple
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          handleList(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
