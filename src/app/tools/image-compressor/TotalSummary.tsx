"use client";

import { formatBytes } from "./imageUtils";

/** 全体の合計サイズ・総削減率 */
export default function TotalSummary({
  originalTotal,
  compressedTotal,
  offPercent,
  ready,
  count,
}: {
  originalTotal: number;
  compressedTotal: number | null;
  offPercent: number | null;
  ready: boolean;
  count: number;
}) {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white px-2.5 py-1 text-[11px] tabular-nums shadow-sm sm:px-3 sm:text-xs">
      <span className="text-zinc-500">{formatBytes(originalTotal)}</span>
      <span className="text-zinc-300">→</span>
      <span className="font-medium text-zinc-900">
        {!ready || compressedTotal === null
          ? "算出中…"
          : formatBytes(compressedTotal)}
      </span>
      {ready && offPercent !== null ? (
        <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 sm:text-[11px]">
          {offPercent}% OFF
        </span>
      ) : null}
    </div>
  );
}
