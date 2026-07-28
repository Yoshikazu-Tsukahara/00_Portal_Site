"use client";

import { Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { fmt } from "@/i18n";
import type { PaletteCollectorDict } from "@/i18n/apps/paletteCollector";
import {
  buildAnalysisImageData,
  extractDominantColors,
  type ImageRegion,
} from "./colorMath";

export default function AutoExtractPanel({
  image,
  regionSelectMode,
  onStartRegionSelect,
  onCancelRegionSelect,
  confirmedRegion,
  onConfirmedRegionConsumed,
  copy,
  onAddAll,
}: {
  image: HTMLImageElement | null;
  regionSelectMode: boolean;
  onStartRegionSelect: () => void;
  onCancelRegionSelect: () => void;
  /** 領域確定時に親から渡され、受け取ったら自動抽出して消費する */
  confirmedRegion: ImageRegion | null;
  onConfirmedRegionConsumed: () => void;
  copy: PaletteCollectorDict["autoExtract"];
  onAddAll: (hexes: string[]) => void;
}) {
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function runExtract(region: ImageRegion | null) {
    if (!image) {
      setError(copy.noImage);
      return;
    }

    setError(null);
    setExtracting(true);
    setResult(null);
    window.requestAnimationFrame(() => {
      const analysisData = buildAnalysisImageData(image, 220, region);
      const dominant = analysisData
        ? extractDominantColors(analysisData, 5)
        : [];
      setResult(dominant.map((c) => c.hex));
      setExtracting(false);
    });
  }

  // 領域確定 → 自動抽出
  useEffect(() => {
    if (!confirmedRegion) return;
    runExtract(confirmedRegion);
    onConfirmedRegionConsumed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmedRegion]);

  // 画像が変わったら抽出プレビューもリセット
  useEffect(() => {
    setResult(null);
    setError(null);
  }, [image]);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm sm:p-4">
      <div className="min-w-0">
        <h2 className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 sm:text-base">
          <Sparkles className="size-4 text-amber-500" aria-hidden />
          {copy.heading}
        </h2>
        <p className="mt-0.5 text-[11px] text-gray-500 sm:text-xs">
          {copy.description}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!image || extracting || regionSelectMode}
          onClick={() => runExtract(null)}
          className="rounded-full bg-gray-900 px-3.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 sm:text-xs"
        >
          {extracting ? copy.extracting : copy.extractFull}
        </button>
        {regionSelectMode ? (
          <button
            type="button"
            onClick={onCancelRegionSelect}
            className="inline-flex items-center gap-1 rounded-full border border-sky-300 bg-sky-50 px-3.5 py-1.5 text-[11px] font-semibold text-sky-800 transition-colors hover:bg-sky-100 sm:text-xs"
          >
            <X className="size-3" aria-hidden />
            {copy.cancelRegionSelect}
          </button>
        ) : (
          <button
            type="button"
            disabled={!image || extracting}
            onClick={onStartRegionSelect}
            className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-[11px] font-semibold text-gray-800 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 sm:text-xs"
          >
            {copy.extractRegion}
          </button>
        )}
      </div>

      {regionSelectMode ? (
        <p className="mt-2 text-[11px] font-medium text-sky-700">
          {copy.regionSelectActive}
        </p>
      ) : null}

      {!image ? (
        <p className="mt-2 text-[11px] text-gray-400">{copy.noImage}</p>
      ) : null}
      {error ? (
        <p className="mt-2 text-[11px] font-medium text-rose-600">{error}</p>
      ) : null}

      {result && result.length > 0 ? (
        <div className="mt-3 flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50 p-2.5">
          <p className="text-[11px] text-gray-500">
            {fmt(copy.resultHint, { count: result.length })}
          </p>
          <div className="flex gap-2">
            {result.map((hex) => (
              <div
                key={hex}
                className="h-9 flex-1 rounded-lg ring-1 ring-inset ring-black/5"
                style={{ backgroundColor: hex }}
                title={hex}
              />
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setResult(null)}
              className="rounded-full px-3 py-1 text-[11px] font-medium text-gray-500 transition-colors hover:text-gray-800"
            >
              {copy.dismiss}
            </button>
            <button
              type="button"
              onClick={() => {
                onAddAll(result);
                setResult(null);
              }}
              className="rounded-full bg-emerald-600 px-3.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-500"
            >
              {copy.addAll}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
