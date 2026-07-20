"use client";

import { useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FileGroup } from "./fileGroups";

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

/** ファイル単位モードの1カード */
export default function FileCard({
  group,
  onRename,
  onRemove,
  onDuplicate,
}: {
  group: FileGroup;
  onRename: (sourceId: string, name: string) => void;
  onRemove: (sourceId: string) => void;
  onDuplicate: (sourceId: string) => void;
}) {
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex h-14 w-full items-center gap-2 rounded-lg border border-zinc-200/80 bg-white px-2.5 shadow-sm ${
        isDragging ? "z-20 opacity-70 ring-1 ring-zinc-400" : ""
      }`}
    >
      <button
        type="button"
        className="flex shrink-0 cursor-grab items-center gap-1.5 touch-none px-1 active:cursor-grabbing"
        aria-label={`${group.name} を並べ替え`}
        {...attributes}
        {...listeners}
      >
        <span className="text-base leading-none" aria-hidden>
          📄
        </span>
      </button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
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
            className="input-field !w-full !px-1.5 !py-0.5 !text-xs"
            aria-label="ファイル名を編集"
          />
        ) : (
          <button
            type="button"
            className="block w-full truncate text-left text-xs font-medium text-zinc-800 hover:underline"
            title="クリックで名前を編集"
            onClick={() => setEditing(true)}
          >
            {group.name}
          </button>
        )}
        <p className="mt-0.5 text-[11px] text-zinc-400">
          {group.pageCount} ページ
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          title="複製"
          aria-label={`${group.name} を複製`}
          onClick={() => onDuplicate(group.sourceId)}
          className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-800"
        >
          <CopyIcon />
        </button>
        <button
          type="button"
          title="削除"
          aria-label={`${group.name} を削除`}
          onClick={() => onRemove(group.sourceId)}
          className="rounded p-1 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
