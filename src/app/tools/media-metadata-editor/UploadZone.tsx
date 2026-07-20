"use client";

import { useRef, useState } from "react";
import { useI18n } from "@/i18n";

/** メディアファイルの D&D / 複数選択ゾーン */
export default function UploadZone({
  onFiles,
  disabled,
}: {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const copy = t.apps.mediaMetadata;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(list: FileList | File[] | null) {
    if (!list) return;
    const files = Array.from(list);
    if (files.length > 0) onFiles(files);
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
        handleFiles(e.dataTransfer.files);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-3 py-6 text-center transition-colors ${
        disabled
          ? "cursor-not-allowed border-zinc-200 bg-zinc-50 opacity-60"
          : isDragging
            ? "border-zinc-950 bg-zinc-100"
            : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
      }`}
    >
      <p className="text-sm font-medium text-zinc-800">{copy.dropHint}</p>
      <p className="mt-1 max-w-md text-[11px] leading-relaxed text-zinc-400">
        {copy.dropSub}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*,image/*,video/*,.mp3,.m4a,.wav,.flac,.ogg,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm"
        multiple
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
