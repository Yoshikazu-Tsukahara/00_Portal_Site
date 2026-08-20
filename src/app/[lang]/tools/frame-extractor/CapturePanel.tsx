"use client";

import { Download, FolderArchive } from "lucide-react";

import type { FrameExtractorDict } from "@/i18n/apps/frameExtractor";
import { fmt } from "@/i18n/fmt";
import {
  BURST_WARN_FRAMES,
  MAX_BURST_FRAMES,
  type CaptureFormat,
} from "./types";
import { formatTimecode } from "./videoEngine";

type Props = {
  copy: FrameExtractorDict;
  format: CaptureFormat;
  quality: number;
  sharpenEnabled: boolean;
  burstCount: number;
  burstIn: number;
  burstOut: number;
  bursting: boolean;
  burstCurrent: number;
  busy: boolean;
  onFormatChange: (format: CaptureFormat) => void;
  onQualityChange: (quality: number) => void;
  onToggleSharpen: (next: boolean) => void;
  onSave: () => void;
  onMarkIn: () => void;
  onMarkOut: () => void;
  onBurst: () => void;
  onCancelBurst: () => void;
};

const FORMATS: CaptureFormat[] = ["png", "jpeg", "webp"];

/** 保存形式・単体保存・連写 ZIP */
export default function CapturePanel({
  copy,
  format,
  quality,
  sharpenEnabled,
  burstCount,
  burstIn,
  burstOut,
  bursting,
  burstCurrent,
  busy,
  onFormatChange,
  onQualityChange,
  onToggleSharpen,
  onSave,
  onMarkIn,
  onMarkOut,
  onBurst,
  onCancelBurst,
}: Props) {
  const tooMany = burstCount > MAX_BURST_FRAMES;
  const warn = burstCount >= BURST_WARN_FRAMES && !tooMany;
  const showQuality = format !== "png";

  function formatLabel(f: CaptureFormat): string {
    if (f === "jpeg") return copy.formatJpeg;
    if (f === "webp") return copy.formatWebp;
    return copy.formatPng;
  }

  return (
    <section className="rounded-md border border-zinc-200/80 bg-white p-3">
      <div className="flex flex-col gap-3">
        <fieldset className="min-w-0">
          <legend className="mb-1 text-[11px] text-zinc-500">
            {copy.formatLabel}
          </legend>
          <div className="flex flex-nowrap gap-1.5">
            {FORMATS.map((f) => (
              <button
                key={f}
                type="button"
                disabled={busy}
                onClick={() => onFormatChange(f)}
                className={`flex-1 min-w-0 min-h-11 rounded-md border px-2 text-center text-xs font-medium transition-all duration-150 active:scale-[0.98] whitespace-nowrap ${
                  format === f
                    ? "border-[var(--accent-strong)] bg-[var(--accent)] text-zinc-900"
                    : "border-zinc-200 bg-[var(--background)] text-zinc-800 hover:border-[var(--accent)]"
                }`}
              >
                {formatLabel(f)}
              </button>
            ))}
          </div>
        </fieldset>

        <label
          aria-hidden={!showQuality}
          className={`flex w-full min-w-0 flex-col gap-1 text-[11px] text-zinc-500 transition-opacity ${
            showQuality ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {copy.qualityLabel} {Math.round(quality * 100)}%
          <input
            type="range"
            min={0.5}
            max={1}
            step={0.01}
            value={quality}
            disabled={busy || !showQuality}
            onChange={(e) => onQualityChange(Number(e.target.value))}
            className="h-2 w-full cursor-pointer accent-[var(--accent-strong)]"
          />
        </label>

        <label className="flex w-full min-w-0 items-center gap-2 text-[11px] text-zinc-600">
          <input
            type="checkbox"
            checked={sharpenEnabled}
            onChange={(e) => onToggleSharpen(e.target.checked)}
            disabled={busy}
            className="h-4 w-4 accent-[var(--accent-strong)]"
            aria-label={copy.sharpnessToggle}
          />
          <span>{copy.sharpnessToggle}</span>
        </label>

        <div className="flex w-full justify-start">
          <button
            type="button"
            onClick={onSave}
            disabled={busy}
            className="btn-primary inline-flex min-h-11 w-full flex-none items-center justify-center gap-2 whitespace-nowrap active:scale-[0.98] lg:w-auto lg:min-w-[13.5rem]"
          >
            <Download className="h-4 w-4" aria-hidden />
            {busy && !bursting ? copy.saving : copy.saveFrame}
          </button>
        </div>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">
        {copy.nativeResNote}
      </p>

      <div className="mt-4 space-y-2 border-t border-zinc-100 pt-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
          {copy.burstTitle}
        </h2>
        <p className="text-[11px] leading-relaxed text-zinc-500">{copy.burstHint}</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={onMarkIn}
            disabled={busy}
            className="btn-secondary !inline-flex min-h-11 items-center !px-3 text-xs active:scale-[0.98]"
          >
            {copy.burstMarkIn}
          </button>
          <button
            type="button"
            onClick={onMarkOut}
            disabled={busy}
            className="btn-secondary !inline-flex min-h-11 items-center !px-3 text-xs active:scale-[0.98]"
          >
            {copy.burstMarkOut}
          </button>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-display text-[11px] tabular-nums text-zinc-600">
          <dt className="text-zinc-400">{copy.burstStart}</dt>
          <dd>{formatTimecode(burstIn)}</dd>
          <dt className="text-zinc-400">{copy.burstEnd}</dt>
          <dd>{formatTimecode(burstOut)}</dd>
          <dt className="text-zinc-400">{copy.burstCountLabel}</dt>
          <dd>{fmt(copy.burstCount, { count: burstCount })}</dd>
        </dl>
        {warn ? (
          <p className="text-[11px] text-zinc-500">{copy.burstWarn}</p>
        ) : null}
        {tooMany ? (
          <p className="text-[11px] text-rose-600">
            {fmt(copy.burstTooMany, { max: MAX_BURST_FRAMES })}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={onBurst}
            disabled={busy || tooMany || burstCount <= 0}
            className="btn-secondary !inline-flex min-h-11 items-center gap-2 !px-3 text-xs active:scale-[0.98]"
          >
            <FolderArchive className="h-4 w-4" aria-hidden />
            {bursting
              ? fmt(copy.bursting, { current: burstCurrent, total: burstCount })
              : copy.burstZip}
          </button>
          {bursting ? (
            <button
              type="button"
              onClick={onCancelBurst}
              className="btn-secondary !inline-flex min-h-11 items-center !px-3 text-xs text-rose-600 active:scale-[0.98]"
            >
              {copy.burstCancel}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
