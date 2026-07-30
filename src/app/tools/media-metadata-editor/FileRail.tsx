"use client";

import { Music2, Trash2, Video } from "lucide-react";
import { formatBytes } from "./mediaCore";
import type { MediaSession } from "./types";

type Copy = {
  heading: string;
  empty: string;
  remove: string;
  audio: string;
  video: string;
};

/** 左レール：読み込み済みファイル一覧 */
export default function FileRail({
  items,
  selectedId,
  copy,
  disabled,
  onSelect,
  onRemove,
}: {
  items: MediaSession[];
  selectedId: string | null;
  copy: Copy;
  disabled?: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <aside className="flex h-full min-h-0 flex-col">
      <h2 className="mb-2 shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {copy.heading}
        {items.length > 0 ? (
          <span className="ml-1.5 text-zinc-600 normal-case tracking-normal">
            ({items.length})
          </span>
        ) : null}
      </h2>

      {items.length === 0 ? (
        <p className="text-xs text-zinc-600">{copy.empty}</p>
      ) : (
        <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-0.5">
          {items.map((item) => {
            const selected = item.id === selectedId;
            const Icon = item.mode === "audio" ? Music2 : Video;
            return (
              <li key={item.id}>
                <div
                  className={`group flex items-stretch gap-0.5 rounded-lg border transition ${
                    selected
                      ? "border-amber-500/50 bg-amber-500/10"
                      : "border-transparent bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900"
                  }`}
                >
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelect(item.id)}
                    className="flex min-w-0 flex-1 items-start gap-2 px-2.5 py-2 text-left"
                  >
                    <Icon
                      className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                        selected ? "text-amber-400" : "text-zinc-500"
                      }`}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 break-all text-xs font-medium leading-snug text-zinc-100">
                        {item.displayName || item.file.name}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-zinc-500">
                        {item.mode === "audio" ? copy.audio : copy.video}
                        {" · "}
                        {formatBytes(item.file.size)}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    title={copy.remove}
                    aria-label={copy.remove}
                    onClick={() => onRemove(item.id)}
                    className="shrink-0 px-2 text-zinc-600 opacity-70 transition hover:text-rose-400 group-hover:opacity-100 disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
