"use client";

import { ExternalLink, Tag, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import TagEditor from "./TagEditor";
import {
  primaryTagColor,
  resolveLinkTags,
  type CustomTag,
  type KeptLink,
} from "./types";

type Props = {
  link: KeptLink;
  allTags: CustomTag[];
  deleteLabel: string;
  deleteConfirm: string;
  noImageLabel: string;
  memoPlaceholder: string;
  tagEditorLabels: {
    title: string;
    newName: string;
    create: string;
    customColor: string;
    apply: string;
  };
  onDelete: (id: string) => void;
  onUpdateMemo: (id: string, memo: string) => void;
  onToggleTag: (linkId: string, tagId: string) => void;
  onCreateTag: (linkId: string, name: string, color: string) => void;
  onUpdateTag: (
    tagId: string,
    patch: { name?: string; color?: string },
  ) => void;
  onDeleteTag: (tagId: string) => void;
};

/** やさしいライトモードのキープカード（タグは左下固定） */
export default function LinkCard({
  link,
  allTags,
  deleteLabel,
  deleteConfirm,
  noImageLabel,
  memoPlaceholder,
  tagEditorLabels,
  onDelete,
  onUpdateMemo,
  onToggleTag,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
}: Props) {
  const memo = link.memo ?? "";
  const [imgBroken, setImgBroken] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(memo);
  const [tagOpen, setTagOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const showImage = Boolean(link.image) && !imgBroken;
  const tags = resolveLinkTags(link, allTags);
  const accent = primaryTagColor(link, allTags);

  useEffect(() => {
    if (!editing) setDraft(memo);
  }, [memo, editing]);

  useEffect(() => {
    if (!editing) return;
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, [editing]);

  function commitMemo() {
    const next = draft.trimEnd();
    setEditing(false);
    if (next !== memo) onUpdateMemo(link.id, next);
    else setDraft(memo);
  }

  return (
    <article
      className="group relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={
        accent
          ? {
              borderColor: accent,
              boxShadow: `0 0 0 1px ${accent}33, 0 8px 20px ${accent}18`,
            }
          : { borderColor: "rgba(228, 228, 231, 0.95)" }
      }
    >
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block aspect-[16/10] w-full shrink-0 overflow-hidden bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={link.image!}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            onError={() => setImgBroken(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-3 text-center">
            <p className="text-[10px] font-bold tracking-[0.2em] text-emerald-600/70">
              {noImageLabel}
            </p>
            <p className="line-clamp-2 break-all text-base font-semibold tracking-tight text-emerald-900">
              {link.domain}
            </p>
          </div>
        )}
      </a>

      {/* 本文：タグ行を mt-auto で左下に固定 */}
      <div className="flex min-h-0 flex-1 flex-col p-3">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
        >
          <h2 className="line-clamp-2 min-w-0 flex-1 text-sm font-bold leading-snug text-zinc-900">
            {link.title}
          </h2>
          <ExternalLink
            className="mt-0.5 size-3.5 shrink-0 text-zinc-400 opacity-0 transition group-hover:opacity-100"
            aria-hidden
          />
        </a>

        <p className="mt-1 truncate text-xs text-zinc-500">{link.domain}</p>

        <div className="mt-1.5 min-h-[3.75rem]">
          {editing ? (
            <textarea
              ref={textareaRef}
              value={draft}
              rows={3}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitMemo}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  commitMemo();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  setDraft(memo);
                  setEditing(false);
                }
              }}
              className="w-full resize-none rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs leading-relaxed text-zinc-700 outline-none ring-emerald-400/40 placeholder:text-zinc-400 focus:bg-white focus:ring-2"
              placeholder={memoPlaceholder}
            />
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setEditing(true);
              }}
              className="w-full rounded-lg px-0.5 py-0.5 text-left transition hover:bg-zinc-50"
            >
              {memo.trim() ? (
                <p className="line-clamp-3 text-xs leading-relaxed text-zinc-600">
                  {memo}
                </p>
              ) : (
                <p className="text-xs text-zinc-400">{memoPlaceholder}</p>
              )}
            </button>
          )}
        </div>

        {/* 左下固定のタグ行 */}
        <div className="mt-auto flex flex-wrap items-center gap-1 pt-2">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
              style={{ backgroundColor: `${tag.color}cc` }}
            >
              {tag.name}
            </span>
          ))}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setTagOpen((v) => !v);
            }}
            className="inline-flex items-center gap-0.5 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] text-zinc-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
          >
            <Tag className="size-2.5" />
            {tags.length === 0 ? "タグ" : "+"}
          </button>
        </div>
      </div>

      <TagEditor
        open={tagOpen}
        onClose={() => setTagOpen(false)}
        allTags={allTags}
        selectedIds={link.tagIds}
        labels={tagEditorLabels}
        onToggleTag={(tagId) => onToggleTag(link.id, tagId)}
        onCreateTag={(name, color) => onCreateTag(link.id, name, color)}
        onUpdateTag={onUpdateTag}
        onDeleteTag={onDeleteTag}
      />

      <button
        type="button"
        aria-label={deleteLabel}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!window.confirm(deleteConfirm)) return;
          onDelete(link.id);
        }}
        className="absolute top-2 right-2 rounded-xl border border-zinc-200/80 bg-white/90 p-1.5 text-zinc-400 shadow-sm backdrop-blur transition hover:border-rose-200 hover:text-rose-500 sm:opacity-0 sm:group-hover:opacity-100"
      >
        <Trash2 className="size-3.5" />
      </button>
    </article>
  );
}
