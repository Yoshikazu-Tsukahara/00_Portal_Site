"use client";

import { useRef } from "react";
import type { PixelDropPuzzleDict } from "@/i18n/apps/pixelDropPuzzle";

/** ライフ枯渇時の冷徹な降格警告（全画面タップ無効・ボタン明示タップのみ） */
export default function LifeDepletedOverlay({
  copy,
  fromStage,
  toStage,
  onContinue,
}: {
  copy: PixelDropPuzzleDict["deplete"];
  fromStage: number;
  toStage: number;
  onContinue: () => void;
}) {
  const continuedRef = useRef(false);

  function acceptDowngrade() {
    if (continuedRef.current) return;
    continuedRef.current = true;
    onContinue();
  }

  return (
    <div
      className="pxd-overlay pxd-overlay--deplete fixed inset-0 z-50 flex cursor-default items-center justify-center p-4"
      role="presentation"
    >
      <div className="pointer-events-none w-full max-w-md space-y-5 text-center font-mono">
        <p className="pxd-deplete-title text-sm font-bold tracking-[0.12em] text-red-400 sm:text-base">
          {copy.title}
        </p>
        <p className="text-[11px] leading-relaxed tracking-wide text-zinc-400 sm:text-xs">
          {copy.body}
        </p>
        <div className="rounded-md border border-red-900/70 bg-black/75 px-4 py-3 text-[11px] text-red-300">
          <div className="flex items-baseline justify-between gap-3">
            <span className="tracking-wide text-zinc-500">{copy.stageLabel}</span>
            <span className="tabular-nums tracking-wider">
              {fromStage} → {toStage}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={acceptDowngrade}
          onPointerDown={(e) => e.stopPropagation()}
          className="pxd-deplete-accept pointer-events-auto w-full rounded-md border border-red-700/70 bg-red-950/40 py-2.5 text-sm font-semibold tracking-[0.18em] text-red-200 transition-transform hover:bg-zinc-800 active:scale-95"
        >
          {copy.continueButton}
        </button>
      </div>
    </div>
  );
}
