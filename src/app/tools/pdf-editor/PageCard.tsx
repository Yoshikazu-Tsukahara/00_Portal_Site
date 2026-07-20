"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PointerEvent as ReactPointerEvent, MouseEvent } from "react";
import type { PdfPageItem } from "./types";

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function isSelectionModifier(event: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }) {
  return event.ctrlKey || event.metaKey || event.shiftKey;
}

/** 1ページ＝1カード（固定サイズ・複数選択対応） */
export default function PageCard({
  page,
  displayIndex,
  width,
  height,
  isSelected,
  onSelect,
  onRemove,
  onRotate,
  onPreview,
}: {
  page: PdfPageItem;
  displayIndex: number;
  width: number;
  height: number;
  isSelected: boolean;
  onSelect: (event: MouseEvent) => void;
  onRemove: () => void;
  onRotate: () => void;
  onPreview: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width,
    height,
  };

  const isBlank = page.kind === "blank";

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    // 修飾キー付きクリックは選択専用 — ドラッグ開始を抑止
    if (isSelectionModifier(event)) {
      event.stopPropagation();
      return;
    }
    listeners?.onPointerDown?.(event);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-selected={isSelected || undefined}
      className={`group relative shrink-0 overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow ${
        isSelected
          ? "border-zinc-400 ring-2 ring-zinc-950 ring-offset-1"
          : "border-zinc-200/80"
      } ${isDragging ? "z-20 opacity-70 ring-1 ring-zinc-400" : ""} ${
        isBlank ? "border-dashed" : ""
      }`}
    >
      <button
        type="button"
        className={`absolute inset-0 touch-none ${
          isDragging ? "cursor-grabbing" : "cursor-pointer"
        }`}
        aria-label={`ページ ${displayIndex}${isSelected ? "（選択中）" : ""}`}
        aria-pressed={isSelected}
        onPointerDown={handlePointerDown}
        onClick={(e) => {
          if (isDragging) return;
          onSelect(e);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (isDragging) return;
          onPreview();
        }}
        {...attributes}
      />

      <div
        className={`pointer-events-none flex h-full w-full items-center justify-center overflow-hidden ${
          isSelected ? "bg-zinc-100" : "bg-zinc-50"
        }`}
        style={
          isBlank ? { transform: `rotate(${page.rotation}deg)` } : undefined
        }
      >
        {isBlank ? (
          <span className="text-[11px] font-medium text-zinc-400">白紙</span>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={page.thumbnailUrl}
            alt={`${page.sourceName} p.${(page.pageIndex ?? 0) + 1}`}
            className="max-h-full max-w-full object-contain transition-transform duration-200"
            style={{ transform: `rotate(${page.rotation}deg)` }}
            draggable={false}
          />
        )}
      </div>

      <span className="pointer-events-none absolute left-1.5 top-1.5 rounded bg-zinc-950/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
        {displayIndex}
      </span>

      <div className="absolute right-1 top-1 z-10 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          title="回転"
          aria-label={`ページ ${displayIndex} を回転`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onRotate();
          }}
          className="rounded bg-white/90 px-1 py-0.5 text-xs text-zinc-600 shadow-sm hover:bg-zinc-100 hover:text-zinc-900"
        >
          ↻
        </button>
        <button
          type="button"
          title="削除"
          aria-label={`ページ ${displayIndex} を削除`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="rounded bg-white/90 p-1 text-zinc-500 shadow-sm hover:bg-red-50 hover:text-red-600"
        >
          <TrashIcon />
        </button>
      </div>

      {!isBlank ? (
        <span className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-zinc-900/70 to-transparent px-1.5 pb-1 pt-4 text-[9px] text-white">
          {page.sourceName}
        </span>
      ) : null}
    </div>
  );
}
