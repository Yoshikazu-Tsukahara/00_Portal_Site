"use client";

import { Download, LoaderCircle, Trash2, X } from "lucide-react";

import { fmt, useI18n } from "@/i18n";
import type { SafeImageItem } from "./stripExif";

/** 処理済み／処理中画像のグリッド */
export default function ResultGrid({
  items,
  onRemove,
  onDownload,
}: {
  items: SafeImageItem[];
  onRemove: (id: string) => void;
  onDownload: (id: string) => void;
}) {
  const { t } = useI18n();
  const copy = t.apps.exifRemover;

  return (
    <div className="grid min-w-0 grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {items.map((item) => {
        const canDownload = item.status === "done" && item.blob !== null;
        const statusText =
          item.status === "pending"
            ? copy.item.pending
            : item.status === "processing"
              ? copy.item.processing
              : item.status === "done"
                ? copy.item.done
                : copy.item.error;

        return (
          <div
            key={item.id}
            className="group relative min-w-0 overflow-hidden rounded-md border border-zinc-200 bg-white"
          >
            <div className="relative aspect-square overflow-hidden bg-zinc-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.previewUrl}
                alt={fmt(copy.result.previewAltNamed, { name: item.originalName })}
                className="h-full w-full object-contain"
                draggable={false}
              />

              {item.status === "processing" || item.status === "pending" ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/55">
                  <LoaderCircle
                    className="size-4 animate-spin text-zinc-500"
                    aria-hidden
                  />
                </div>
              ) : null}

              <button
                type="button"
                title={copy.item.remove}
                aria-label={fmt(copy.item.removeAria, {
                  name: item.originalName,
                })}
                onClick={() => onRemove(item.id)}
                className="absolute right-1 top-1 inline-flex size-7 items-center justify-center rounded border border-zinc-200/80 bg-white/95 text-zinc-400 transition-all duration-150 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 active:scale-[0.98] md:size-6 md:opacity-0 md:group-hover:opacity-100"
              >
                <Trash2 className="size-3" aria-hidden />
              </button>
            </div>

            <div className="min-w-0 space-y-0.5 px-1.5 py-1.5">
              <p className="truncate text-[10px] font-medium leading-tight text-zinc-800">
                {item.originalName}
              </p>
              <div className="flex items-center justify-between gap-0.5">
                <span
                  className={`inline-flex min-w-0 items-center gap-0.5 truncate text-[9px] font-medium ${
                    item.status === "done"
                      ? "text-emerald-700"
                      : item.status === "error"
                        ? "text-rose-600"
                        : "text-zinc-500"
                  }`}
                >
                  {item.status === "error" ? (
                    <X className="size-2.5 shrink-0" aria-hidden />
                  ) : null}
                  {statusText}
                </span>
                <button
                  type="button"
                  disabled={!canDownload}
                  title={copy.actions.downloadOne}
                  aria-label={fmt(copy.actions.downloadOneAria, {
                    name: item.downloadName,
                  })}
                  onClick={() => onDownload(item.id)}
                  className="inline-flex size-7 shrink-0 items-center justify-center rounded text-zinc-500 transition-all duration-150 hover:bg-zinc-100 hover:text-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <Download className="size-3" aria-hidden />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
