"use client";

import { ExternalLink, Tag, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toProxiedImageUrl } from "./imageUrl";
import TagPicker from "./TagPicker";
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
  tagPickerTitle: string;
  tagPickerEmpty: string;
  onDelete: (id: string) => void;
  onUpdateMemo: (id: string, memo: string) => void;
  onToggleTag: (linkId: string, tagId: string) => void;
};

/** やさしいライトモードのキープカード（タグは左下固定） */
export default function LinkCard({
  link,
  allTags,
  deleteLabel,
  deleteConfirm,
  noImageLabel,
  memoPlaceholder,
  tagPickerTitle,
  tagPickerEmpty,
  onDelete,
  onUpdateMemo,
  onToggleTag,
}: Props) {
  const memo = link.memo ?? "";
  const [imgBroken, setImgBroken] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(memo);
  const [tagOpen, setTagOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // 本番ドメインからのホットリンク拒否を避けるためプロキシ経由で表示
  const displayImage = toProxiedImageUrl(link.image);
  const showImage = Boolean(displayImage) && !imgBroken;
  const tags = resolveLinkTags(link, allTags);
  const accent = primaryTagColor(link, allTags);

  useEffect(() => {
    if (!editing) setDraft(memo);
  }, [memo, editing]);

  useEffect(() => {
    setImgBroken(false);
  }, [displayImage]);

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
      className="group relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
      style={
        accent
          ? {
              borderColor: accent,
              boxShadow: `0 0 0 1px ${accent}33, 0 6px 16px ${accent}18`,
            }
          : { borderColor: "rgba(228, 228, 231, 0.95)" }
      }
    >
      {/* 画像〜本文でだいたい半分ずつ（3:2 + コンパクト本文） */}
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block aspect-[3/2] w-full shrink-0 overflow-hidden bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
      >
        {showImage ? (
          <>
            {/*
              img の object-fit は親の aspect-ratio と相性が悪く上端固定になりやすいため、
              background-image で枠いっぱいに敷き、縦横とも中央を表示する。
            */}
            <div
              aria-hidden
              className="absolute inset-0 bg-zinc-100 transition duration-300 group-hover:scale-105"
              style={{
                backgroundImage: `url(${JSON.stringify(displayImage)})`,
                backgroundSize: "cover",
                backgroundPosition: "50% 50%",
                backgroundRepeat: "no-repeat",
              }}
            />
            {/* 読み込み失敗検知用（非表示） */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayImage!}
              alt=""
              className="pointer-events-none absolute h-0 w-0 opacity-0"
              onError={() => setImgBroken(true)}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-0.5 bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-2 text-center">
            <p className="text-[9px] font-bold tracking-[0.18em] text-emerald-600/70">
              {noImageLabel}
            </p>
            <p className="line-clamp-2 break-all text-xs font-semibold tracking-tight text-emerald-900">
              {link.domain}
            </p>
          </div>
        )}
      </a>

      {/* 本文：タグ行を mt-auto で左下に固定 */}
      <div className="flex min-h-0 flex-1 flex-col px-2.5 py-2">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
        >
          <h2 className="line-clamp-2 min-w-0 flex-1 text-xs font-bold leading-snug text-zinc-900">
            {link.title}
          </h2>
          <ExternalLink
            className="mt-0.5 size-3 shrink-0 text-zinc-400 opacity-0 transition group-hover:opacity-100"
            aria-hidden
          />
        </a>

        <p className="mt-0.5 truncate text-[10px] text-zinc-500">{link.domain}</p>

        <div className="mt-0.5 min-h-[1.75rem]">
          {editing ? (
            <textarea
              ref={textareaRef}
              value={draft}
              rows={2}
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
              className="w-full resize-none rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[11px] leading-relaxed text-zinc-700 outline-none ring-emerald-400/40 placeholder:text-zinc-400 focus:bg-white focus:ring-2"
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
              className="w-full rounded-md px-0.5 py-0.5 text-left transition hover:bg-zinc-50"
            >
              {memo.trim() ? (
                <p className="line-clamp-2 text-[11px] leading-relaxed text-zinc-600">
                  {memo}
                </p>
              ) : (
                <p className="text-[11px] text-zinc-400">{memoPlaceholder}</p>
              )}
            </button>
          )}
        </div>

        {/* 左下固定のタグ行（付け外しのみ） */}
        <div className="mt-auto flex flex-wrap items-center gap-1 pt-1.5">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleTag(link.id, tag.id);
              }}
              className="rounded-full px-1.5 py-0.5 text-[9px] font-medium text-white transition hover:opacity-80"
              style={{ backgroundColor: `${tag.color}cc` }}
            >
              {tag.name}
            </button>
          ))}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setTagOpen((v) => !v);
            }}
            className="inline-flex items-center gap-0.5 rounded-full border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[9px] text-zinc-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
          >
            <Tag className="size-2.5" />
            {tags.length === 0 ? "タグ" : "+"}
          </button>
        </div>
      </div>

      <TagPicker
        open={tagOpen}
        onClose={() => setTagOpen(false)}
        allTags={allTags}
        selectedIds={link.tagIds}
        title={tagPickerTitle}
        emptyHint={tagPickerEmpty}
        onToggleTag={(tagId) => onToggleTag(link.id, tagId)}
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
        className="absolute top-1.5 right-1.5 rounded-lg border border-zinc-200/80 bg-white/90 p-1 text-zinc-400 shadow-sm backdrop-blur transition hover:border-rose-200 hover:text-rose-500 sm:opacity-0 sm:group-hover:opacity-100"
      >
        <Trash2 className="size-3" />
      </button>
    </article>
  );
}
