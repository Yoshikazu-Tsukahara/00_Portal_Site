"use client";

import { fmt, useI18n } from "@/i18n";
import TagBadge from "./TagBadge";
import { resolveTags } from "./tagColors";
import type { MailTemplate, TagMasterItem } from "./types";

function PencilIcon() {
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

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
    </svg>
  );
}

function PinIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 17v5" />
      <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
    </svg>
  );
}

/** テンプレート一覧（左カラム） */
export default function TemplateList({
  templates,
  tags,
  selectedId,
  isFilterActive,
  onSelect,
  onEdit,
  onDelete,
  onTogglePin,
}: {
  templates: MailTemplate[];
  tags: TagMasterItem[];
  selectedId: string | null;
  /** 検索またはラベル絞り込み中 */
  isFilterActive?: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
}) {
  const { t } = useI18n();
  const mt = t.apps.mailTemplate;

  if (templates.length === 0) {
    return (
      <div className="flex h-full min-h-[120px] items-center justify-center rounded-md border border-dashed border-zinc-200 bg-zinc-50/50 px-3">
        <p className="break-words text-center text-xs text-zinc-400">
          {isFilterActive
            ? mt.list.emptyFilter
            : mt.list.empty}
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-1.5 touch-pan-y pr-0.5">
      {templates.map((tpl) => {
        const selected = tpl.id === selectedId;
        const tplTags = resolveTags(tags, tpl.tagIds ?? []);
        const pinned = Boolean(tpl.pinned);
        return (
          <li key={tpl.id} className="min-w-0 touch-pan-y">
            <div
              role="button"
              tabIndex={0}
              onClick={() => onSelect(tpl.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(tpl.id);
                }
              }}
              className={`group relative min-h-11 touch-pan-y cursor-pointer rounded-md border px-3 py-2.5 transition-colors active:scale-[0.99] ${
                selected
                  ? "border-[var(--accent-strong)] bg-[var(--accent)] text-zinc-900 active:brightness-95"
                  : pinned
                    ? "border-amber-200/80 bg-amber-50/40 text-zinc-800 hover:border-amber-300 hover:bg-amber-50/70 active:bg-amber-100/80"
                    : "border-zinc-200/80 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50 active:bg-zinc-100"
              }`}
            >
              <p className="break-words pr-20 text-sm font-medium leading-snug md:pr-16">
                {pinned ? (
                  <span
                    className={`mr-1 inline-block align-middle ${
                      selected ? "text-amber-300" : "text-amber-500"
                    }`}
                    aria-hidden
                  >
                    ★
                  </span>
                ) : null}
                {tpl.title}
              </p>
              <p
                className={`mt-0.5 truncate text-[11px] ${
                  selected ? "text-zinc-400" : "text-zinc-400"
                }`}
              >
                {tpl.subject || mt.list.noSubject}
              </p>
              {tplTags.length > 0 ? (
                <div className="mt-1.5 flex max-w-full flex-wrap gap-1 pr-12">
                  {tplTags.map((tag) => (
                    <TagBadge key={tag.id} tag={tag} onDark={selected} />
                  ))}
                </div>
              ) : null}

              <div
                className={`absolute right-1 top-1 flex gap-0.5 transition-opacity md:right-1.5 md:top-1.5 ${
                  pinned
                    ? "opacity-100"
                    : "opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
                }`}
              >
                <button
                  type="button"
                  title={pinned ? mt.pin.unpin : mt.pin.pin}
                  aria-label={
                    pinned
                      ? fmt(mt.pin.unpinAria, { title: tpl.title })
                      : fmt(mt.pin.pinAria, { title: tpl.title })
                  }
                  aria-pressed={pinned}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin(tpl.id);
                  }}
                  className={`flex size-11 items-center justify-center rounded-md transition-colors active:scale-95 md:size-8 ${
                    selected
                      ? pinned
                        ? "text-amber-300 hover:bg-white/10 active:bg-white/20"
                        : "text-zinc-300 hover:bg-white/10 hover:text-white active:bg-white/20"
                      : pinned
                        ? "text-amber-600 hover:bg-amber-100 active:bg-amber-200"
                        : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 active:bg-zinc-200"
                  }`}
                >
                  <PinIcon filled={pinned} />
                </button>
                <button
                  type="button"
                  title={mt.row.edit}
                  aria-label={fmt(mt.row.editAria, { title: tpl.title })}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(tpl.id);
                  }}
                  className={`flex size-11 items-center justify-center rounded-md transition-colors active:scale-95 md:size-8 ${
                    selected
                      ? "text-zinc-300 hover:bg-white/10 hover:text-white active:bg-white/20"
                      : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 active:bg-zinc-200"
                  }`}
                >
                  <PencilIcon />
                </button>
                <button
                  type="button"
                  title={mt.row.delete}
                  aria-label={fmt(mt.row.deleteAria, { title: tpl.title })}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(tpl.id);
                  }}
                  className={`flex size-11 items-center justify-center rounded-md transition-colors active:scale-95 md:size-8 ${
                    selected
                      ? "text-zinc-300 hover:bg-red-500/20 hover:text-red-300 active:bg-red-500/30"
                      : "text-zinc-400 hover:bg-red-50 hover:text-red-600 active:bg-red-100"
                  }`}
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
