"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { fmt, useI18n } from "@/i18n";
import type { FileGroup } from "./fileGroups";
import PdfFileGlyph from "./PdfFileGlyph";

/** ファイル単位カードの固定サイズ（ページ単位と同様に左詰めグリッド用） */
export const FILE_CARD_WIDTH = 148;
export const FILE_CARD_HEIGHT = 172;

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

function CopyIcon() {
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
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

function isSelectionModifier(event: {
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}) {
  return event.ctrlKey || event.metaKey || event.shiftKey;
}

/** カード面の見た目（通常＝無色／選択＝青い枠） */
function cardSurfaceClass(isSelected: boolean, isDragging: boolean): string {
  if (isSelected) {
    return `border-[var(--accent-strong)] bg-[var(--accent)] shadow-sm ring-1 ring-[var(--accent-strong)] ${
      isDragging ? "opacity-70" : ""
    }`;
  }
  return `border-transparent bg-transparent shadow-none ${
    isDragging ? "opacity-60" : ""
  }`;
}

/** ドラッグ中オーバーレイなど、見た目だけのファイルカード面 */
export function FileCardFace({
  name,
  pageCountLabel,
  selected = false,
  className = "",
}: {
  name: string;
  pageCountLabel: string;
  selected?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center rounded-md border px-1.5 pb-2 pt-3 ${cardSurfaceClass(selected, false)} ${className}`}
    >
      <PdfFileGlyph className="h-[4.25rem] w-[3.5rem] shrink-0" />
      <p
        className="mt-2 line-clamp-3 w-full break-all text-center text-[11px] font-medium leading-snug text-zinc-900"
        title={name}
      >
        {name}
      </p>
      <p className="mt-auto pt-1 text-[10px] tabular-nums text-zinc-600">
        {pageCountLabel}
      </p>
    </div>
  );
}

/** ファイル単位モードの1カード（PDFファイル型・縦長） */
export default function FileCard({
  group,
  isSelected,
  onSelect,
  onRename,
  onRemove,
  onDuplicate,
}: {
  group: FileGroup;
  isSelected: boolean;
  onSelect: (event: MouseEvent) => void;
  onRename: (sourceId: string, name: string) => void;
  onRemove: (sourceId: string) => void;
  onDuplicate: (sourceId: string) => void;
}) {
  const { t } = useI18n();
  const copy = t.apps.pdfEditor.fileCard;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.sourceId });

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(group.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(group.name);
  }, [group.name, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function commitRename() {
    const next = draft.trim();
    setEditing(false);
    if (!next || next === group.name) {
      setDraft(group.name);
      return;
    }
    onRename(group.sourceId, next);
  }

  const pageCountLabel = fmt(copy.pageCount, { count: group.pageCount });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: FILE_CARD_WIDTH,
    height: FILE_CARD_HEIGHT,
  };

  const { "aria-pressed": _dndAriaPressed, ...dndAttributes } = attributes;

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-selected={isSelected || undefined}
      className={`group relative shrink-0 ${isDragging ? "z-20" : ""}`}
    >
      <div
        className={`relative flex h-full w-full flex-col items-center rounded-md border px-1.5 pb-2 pt-3 ${cardSurfaceClass(isSelected, isDragging)}`}
      >
        <button
          type="button"
          className={`absolute inset-0 touch-none rounded-md ${
            isDragging ? "cursor-grabbing" : "cursor-pointer"
          }`}
          aria-label={fmt(copy.reorderAria, { name: group.name })}
          aria-pressed={isSelected}
          onPointerDown={(event) => {
            if (isSelectionModifier(event)) {
              event.stopPropagation();
              return;
            }
            listeners?.onPointerDown?.(event);
          }}
          onClick={(e) => {
            if (isDragging) return;
            onSelect(e);
          }}
          {...dndAttributes}
        />

        <PdfFileGlyph className="pointer-events-none relative z-[1] h-[4.25rem] w-[3.5rem] shrink-0" />

        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitRename();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                setDraft(group.name);
                setEditing(false);
              }
            }}
            className="input-field relative z-[2] mt-2 !w-full !px-1 !py-0.5 !text-[11px]"
            aria-label={copy.editName}
          />
        ) : (
          <button
            type="button"
            className="relative z-[2] mt-2 line-clamp-3 w-full break-all text-center text-[11px] font-medium leading-snug text-zinc-900 hover:underline"
            title={copy.editNameTitle}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
          >
            {group.name}
          </button>
        )}

        <p className="relative z-[1] mt-auto pt-1 text-[10px] tabular-nums text-zinc-600">
          {pageCountLabel}
        </p>
      </div>

      <div className="absolute right-1 top-1 z-10 flex gap-0.5 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
        <button
          type="button"
          title={copy.duplicate}
          aria-label={fmt(copy.duplicateAria, { name: group.name })}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(group.sourceId);
          }}
          className="rounded border border-zinc-300/80 bg-white/95 p-1.5 text-zinc-500 shadow-sm transition-colors hover:bg-white hover:text-zinc-800 active:bg-zinc-100 sm:p-1"
        >
          <CopyIcon />
        </button>
        <button
          type="button"
          title={copy.delete}
          aria-label={fmt(copy.deleteAria, { name: group.name })}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(group.sourceId);
          }}
          className="rounded border border-zinc-300/80 bg-white/95 p-1.5 text-zinc-500 shadow-sm transition-colors hover:bg-red-50 hover:text-red-600 active:bg-red-100 sm:p-1"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
