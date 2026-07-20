"use client";

import { useI18n } from "@/i18n";
import { formatBytes } from "./metadataUtils";
import type { MediaItem } from "./types";

/** 読み込み済みファイル一覧 */
export default function FileList({
  items,
  selectedId,
  onSelect,
  onRemove,
}: {
  items: MediaItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const { t } = useI18n();
  const copy = t.apps.mediaMetadata;

  if (items.length === 0) {
    return (
      <p className="px-2 py-6 text-center text-xs text-zinc-400">
        {copy.listEmpty}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-100 overflow-y-auto">
      {items.map((item) => {
        const active = item.id === selectedId;
        const kindLabel =
          item.kind === "audio"
            ? copy.kindAudio
            : item.kind === "image"
              ? copy.kindImage
              : item.kind === "video"
                ? copy.kindVideo
                : copy.kindOther;
        return (
          <li key={item.id}>
            <div
              className={`flex items-start gap-2 px-2 py-2.5 transition-colors ${
                active ? "bg-zinc-100" : "hover:bg-zinc-50"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-sm font-medium text-zinc-900">
                  {item.file.name}
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-400">
                  {kindLabel} · {formatBytes(item.file.size)}
                  {item.writable ? ` · ${copy.writableBadge}` : ""}
                  {item.status === "loading" ? ` · ${copy.loading}` : ""}
                  {item.status === "error" ? ` · ${copy.readError}` : ""}
                </p>
              </button>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="shrink-0 rounded-md px-1.5 py-0.5 text-[11px] text-zinc-400 transition-colors hover:bg-white hover:text-zinc-700"
                aria-label={copy.removeFile}
              >
                ✕
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
