"use client";

import type { FrameExtractorDict } from "@/i18n/apps/frameExtractor";
import type { StripThumb } from "./types";

type Props = {
  copy: FrameExtractorDict;
  thumbs: StripThumb[];
  currentFrame: number;
  playing: boolean;
  loading: boolean;
  onSelect: (time: number, frame: number) => void;
};

/** 一時停止位置の前後コマを横並びで見せるフィルムストリップ */
export default function FilmStrip({
  copy,
  thumbs,
  currentFrame,
  playing,
  loading,
  onSelect,
}: Props) {
  return (
    <section className="rounded-md border border-zinc-200/80 bg-white p-3">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
          {copy.filmstripTitle}
        </h2>
        <p className="text-[11px] text-zinc-400">
          {playing ? copy.filmstripPlaying : copy.filmstripHint}
        </p>
      </div>
      {playing ? (
        <p className="py-6 text-center text-xs text-zinc-400">
          {copy.filmstripPlaying}
        </p>
      ) : thumbs.length === 0 ? (
        <p className="py-6 text-center text-xs text-zinc-400">
          {loading ? copy.filmstripEmpty : copy.filmstripFailed}
        </p>
      ) : (
        <div className="flex gap-1.5 overflow-x-auto overscroll-auto pb-1">
          {thumbs.map((thumb) => {
            const selected = thumb.frame === currentFrame;
            return (
              <button
                key={`${thumb.frame}-${thumb.time}`}
                type="button"
                onClick={() => onSelect(thumb.time, thumb.frame)}
                className={`relative shrink-0 overflow-hidden rounded-md border transition-all duration-150 active:scale-[0.98] ${
                  selected
                    ? "border-[var(--accent-strong)] bg-[color-mix(in_srgb,var(--accent)_28%,white)]"
                    : "border-zinc-200 hover:border-zinc-400"
                }`}
                aria-current={selected ? "true" : undefined}
                aria-label={`${thumb.frame}`}
              >
                {/* サムネは Canvas 由来の data URL。next/image は使わない */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumb.dataUrl}
                  alt=""
                  className="block h-[72px] w-auto object-contain sm:h-[88px]"
                />
                <span
                  className={`absolute inset-x-0 bottom-0 px-1 py-0.5 text-center font-display text-[10px] tabular-nums ${
                    selected
                      ? "bg-[color-mix(in_srgb,var(--accent)_80%,white)] text-zinc-800"
                      : "bg-zinc-900/70 text-white"
                  }`}
                >
                  {thumb.frame}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
