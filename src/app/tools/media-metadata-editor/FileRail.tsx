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
  unsaved: string;
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
    <aside className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-md border border-zinc-200/80 bg-white shadow-sm">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-zinc-100 bg-zinc-50/80 px-3 py-2.5">
        <h2 className="text-xs font-semibold text-zinc-800">
          {copy.heading}
          {items.length > 0 ? (
            <span className="ml-1.5 font-normal text-zinc-400">
              ({items.length})
            </span>
          ) : null}
        </h2>
      </div>

      {items.length === 0 ? (
        <p className="px-3 py-4 text-xs text-zinc-500">{copy.empty}</p>
      ) : (
        <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2">
          {items.map((item) => {
            const selected = item.id === selectedId;
            const Icon = item.mode === "audio" ? Music2 : Video;
            return (
              <li key={item.id}>
                <div
                  className={`group flex items-stretch gap-0.5 rounded-md border transition ${
                    selected
                      ? "border-[color-mix(in_srgb,var(--accent)_35%,transparent)] bg-[color-mix(in_srgb,var(--accent)_22%,white)]"
                      : "border-transparent hover:border-zinc-200 hover:bg-zinc-50"
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
                        selected ? "text-zinc-900" : "text-zinc-400"
                      }`}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 break-all text-xs font-medium leading-snug text-zinc-900">
                        {item.displayName || item.file.name}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-zinc-500">
                        {item.mode === "audio" ? copy.audio : copy.video}
                        {" · "}
                        {formatBytes(item.file.size)}
                        {item.dirty ? (
                          <span className="ml-1 text-amber-700">
                            · {copy.unsaved}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    title={copy.remove}
                    aria-label={copy.remove}
                    onClick={() => onRemove(item.id)}
                    className="shrink-0 px-2 text-zinc-400 opacity-70 transition hover:text-rose-600 group-hover:opacity-100 disabled:opacity-40"
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
