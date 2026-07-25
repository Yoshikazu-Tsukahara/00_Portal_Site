"use client";

import { ExternalLink, Trash2 } from "lucide-react";
import { useState } from "react";
import type { KeptLink } from "./types";

type Props = {
  link: KeptLink;
  deleteLabel: string;
  deleteConfirm: string;
  noImageLabel: string;
  onDelete: (id: string) => void;
};

/** ランチ貯金風の明るいカード（OGP サムネ付き） */
export default function LinkCard({
  link,
  deleteLabel,
  deleteConfirm,
  noImageLabel,
  onDelete,
}: Props) {
  const [imgBroken, setImgBroken] = useState(false);
  const showImage = Boolean(link.image) && !imgBroken;

  return (
    <article className="group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:border-emerald-300/70 hover:shadow-md">
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100">
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- 外部 OGP はドメイン不定のため img を使用
            <img
              src={link.image!}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              onError={() => setImgBroken(true)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 text-center">
              <p className="text-[10px] font-bold tracking-[0.2em] text-emerald-600/70">
                {noImageLabel}
              </p>
              <p className="break-all text-xl font-semibold tracking-tight text-emerald-900 sm:text-2xl">
                {link.domain}
              </p>
            </div>
          )}
          {link.tag ? (
            <span className="absolute left-2 top-2 rounded-full border border-emerald-200/80 bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 shadow-sm backdrop-blur">
              {link.tag}
            </span>
          ) : null}
        </div>

        <div className="space-y-1.5 p-3.5">
          <div className="flex items-start gap-2">
            <h2 className="line-clamp-2 min-w-0 flex-1 text-sm font-semibold leading-snug text-zinc-900">
              {link.title}
            </h2>
            <ExternalLink
              className="mt-0.5 size-3.5 shrink-0 text-zinc-400 opacity-0 transition group-hover:opacity-100"
              aria-hidden
            />
          </div>
          <p className="truncate text-[11px] font-medium text-emerald-700/80">
            {link.domain}
          </p>
          {link.description ? (
            <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500">
              {link.description}
            </p>
          ) : null}
        </div>
      </a>

      <button
        type="button"
        aria-label={deleteLabel}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!window.confirm(deleteConfirm)) return;
          onDelete(link.id);
        }}
        className="absolute bottom-3 right-3 rounded-xl border border-zinc-200 bg-white/95 p-1.5 text-zinc-400 shadow-sm transition hover:border-rose-200 hover:text-rose-500 sm:opacity-0 sm:group-hover:opacity-100"
      >
        <Trash2 className="size-3.5" />
      </button>
    </article>
  );
}
