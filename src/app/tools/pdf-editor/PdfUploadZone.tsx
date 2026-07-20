"use client";

import { useRef, useState } from "react";

/** PDF のドラッグ＆ドロップ / ファイル選択ゾーン */
export default function PdfUploadZone({
  onFiles,
  disabled,
  compact = false,
}: {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  /** 1画面完結向けの低背レイアウト */
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function pickPdfs(list: FileList | File[]): File[] {
    return Array.from(list).filter(
      (f) =>
        f.type === "application/pdf" ||
        f.name.toLowerCase().endsWith(".pdf"),
    );
  }

  function handleFiles(list: FileList | File[] | null) {
    if (!list) return;
    const pdfs = pickPdfs(list);
    if (pdfs.length > 0) onFiles(pdfs);
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
      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed text-center transition-colors ${
        compact ? "px-3 py-2" : "px-4 py-6"
      } ${
        disabled
          ? "cursor-not-allowed border-zinc-200 bg-zinc-50 opacity-60"
          : isDragging
            ? "border-zinc-950 bg-zinc-100"
            : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
      }`}
    >
      <p
        className={`font-medium text-zinc-800 ${
          compact ? "text-xs" : "text-sm"
        }`}
      >
        PDFをドロップ、または選択
      </p>
      {!compact ? (
        <p className="mt-1 text-[11px] text-zinc-400">
          複数ファイル可 · ブラウザ内で処理
        </p>
      ) : (
        <p className="mt-0.5 text-[10px] text-zinc-400">複数可 · ブラウザ内処理</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
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
