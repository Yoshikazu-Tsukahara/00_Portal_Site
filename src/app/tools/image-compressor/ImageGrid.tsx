"use client";

import { fmt, useI18n } from "@/i18n";
import {
  calcSizeReduction,
  formatBytes,
  type ImageItem,
} from "./imageUtils";

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

/** アップロード画像のグリッド一覧 */
export default function ImageGrid({
  items,
  onRemove,
}: {
  items: ImageItem[];
  onRemove: (id: string) => void;
}) {
  const { t } = useI18n();
  const copy = t.apps.imageCompressor.grid;

  if (items.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50/40">
        <p className="text-sm text-zinc-400">{copy.empty}</p>
      </div>
    );
  }

  return (
    <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {items.map((item) => {
        const reduction =
          item.estimatedSize !== null && item.status === "ready"
            ? calcSizeReduction(item.originalSize, item.estimatedSize)
            : null;

        return (
          <div
            key={item.id}
            className="group relative min-w-0 overflow-hidden rounded-lg border border-zinc-200/80 bg-white shadow-sm"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.previewUrl}
                alt={item.name}
                className="h-full w-full object-contain"
                draggable={false}
              />
              <button
                type="button"
                title={copy.delete}
                aria-label={fmt(copy.deleteAria, { name: item.name })}
                onClick={() => onRemove(item.id)}
                className="absolute right-1 top-1 rounded bg-white/90 p-1.5 text-zinc-400 opacity-100 shadow-sm transition-opacity hover:bg-red-50 hover:text-red-600 active:bg-red-100 md:p-1 md:opacity-0 md:group-hover:opacity-100"
              >
                <TrashIcon />
              </button>
            </div>
            <div className="min-w-0 space-y-0.5 px-2 py-1.5">
              <p className="truncate text-[11px] font-medium text-zinc-800">
                {item.name}
              </p>
              <p className="text-[10px] tabular-nums text-zinc-400">
                {item.naturalWidth}×{item.naturalHeight}
              </p>
              <div className="flex items-baseline gap-1 text-[11px] tabular-nums">
                <span className="text-zinc-500">
                  {formatBytes(item.originalSize)}
                </span>
                <span className="text-zinc-300">→</span>
                <span className="font-medium text-zinc-800">
                  {item.status === "pending"
                    ? copy.calculating
                    : item.status === "error"
                      ? copy.failed
                      : item.estimatedSize !== null
                        ? formatBytes(item.estimatedSize)
                        : "—"}
                </span>
              </div>
              {reduction ? (
                <p
                  className={`text-[10px] font-medium tabular-nums ${
                    reduction.same ? "text-zinc-400" : "text-emerald-600"
                  }`}
                >
                  {reduction.same
                    ? "0% OFF"
                    : `${reduction.offPercent}% OFF`}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
