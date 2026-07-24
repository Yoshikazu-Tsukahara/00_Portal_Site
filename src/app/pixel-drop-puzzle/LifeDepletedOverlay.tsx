"use client";

import { useRef } from "react";
import type { PixelDropPuzzleDict } from "@/i18n/apps/pixelDropPuzzle";

/** ライフ枯渇時の冷徹な降格警告 */
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

  function continuePlay() {
    if (continuedRef.current) return;
    continuedRef.current = true;
    onContinue();
  }

  return (
    <div
      className="pxd-overlay pxd-overlay--deplete fixed inset-0 z-50 flex cursor-pointer items-center justify-center p-4"
      onPointerDown={(e) => {
        e.preventDefault();
        continuePlay();
      }}
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
        <div className="w-full rounded-md border border-red-700/70 bg-red-950/40 py-2.5 text-sm font-semibold tracking-[0.18em] text-red-200">
          {copy.continueButton}
        </div>
      </div>
    </div>
  );
}
