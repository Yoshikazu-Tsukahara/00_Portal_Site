"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Pause,
  Play,
} from "lucide-react";

import type { FrameExtractorDict } from "@/i18n/apps/frameExtractor";
import { fmt } from "@/i18n/fmt";
import { PLAYBACK_RATES, type PlaybackRate } from "./types";

type Props = {
  copy: FrameExtractorDict;
  playing: boolean;
  disabled: boolean;
  rate: PlaybackRate;
  fpsAutoEnabled: boolean;
  onFpsAutoChange: (next: boolean) => void;
  fps: number;
  fpsOptions: readonly number[];
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onStepFrame: (delta: number) => void;
  onNudge: (seconds: number) => void;
  onRateChange: (rate: PlaybackRate) => void;
  onFpsChange: (fps: number) => void;
  onSeekTime: (time: number) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
};

/** 再生・コマ送り・クイックシーク・速度 */
export default function FrameControls({
  copy,
  playing,
  disabled,
  rate,
  fpsAutoEnabled,
  onFpsAutoChange,
  fps,
  fpsOptions,
  currentTime,
  duration,
  onTogglePlay,
  onStepFrame,
  onNudge,
  onRateChange,
  onFpsChange,
  onSeekTime,
  isFullscreen,
  onToggleFullscreen,
}: Props) {
  const max = Math.max(0, duration);
  const btn =
    "btn-secondary !inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1 !px-2 !py-1.5 text-[11px] leading-tight active:scale-[0.98] sm:flex-none sm:text-xs";

  return (
    <div className="flex flex-col gap-3">
      <input
        type="range"
        min={0}
        max={max || 0}
        step={1 / fps}
        value={Math.min(currentTime, max)}
        disabled={disabled || max <= 0}
        onChange={(e) => onSeekTime(Number(e.target.value))}
        aria-label={copy.shell.title}
        className="h-2 w-full cursor-pointer accent-[var(--accent-strong)] disabled:cursor-not-allowed"
      />

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={onTogglePlay}
          disabled={disabled}
          className="btn-primary !inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 !px-3 active:scale-[0.98]"
          aria-label={playing ? copy.pause : copy.play}
          title={playing ? copy.pause : copy.play}
        >
          {playing ? (
            <Pause className="h-4 w-4" aria-hidden />
          ) : (
            <Play className="h-4 w-4" aria-hidden />
          )}
          <span className="hidden sm:inline">
            {playing ? copy.pause : copy.play}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onStepFrame(-1)}
          disabled={disabled}
          className={btn}
          title={copy.frameBack}
        >
          <ChevronLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {copy.frameBack}
        </button>
        <button
          type="button"
          onClick={() => onStepFrame(1)}
          disabled={disabled}
          className={btn}
          title={copy.frameForward}
        >
          {copy.frameForward}
          <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
        </button>

        <button
          type="button"
          onClick={() => onNudge(-0.1)}
          disabled={disabled}
          className={btn}
        >
          {copy.seekBack01}
        </button>
        <button
          type="button"
          onClick={() => onNudge(0.1)}
          disabled={disabled}
          className={btn}
        >
          {copy.seekForward01}
        </button>
        <button
          type="button"
          onClick={() => onNudge(-1)}
          disabled={disabled}
          className={btn}
        >
          <ChevronsLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {copy.seekBack1}
        </button>
        <button
          type="button"
          onClick={() => onNudge(1)}
          disabled={disabled}
          className={btn}
        >
          {copy.seekForward1}
          <ChevronsRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <button
          type="button"
          onClick={() => onToggleFullscreen()}
          disabled={disabled}
          className="btn-secondary !inline-flex min-h-11 items-center gap-2 !px-3 active:scale-[0.98]"
          aria-label={isFullscreen ? copy.fullscreenExit : copy.fullscreenEnter}
          title={isFullscreen ? copy.fullscreenExit : copy.fullscreenEnter}
        >
          {isFullscreen ? copy.fullscreenExit : copy.fullscreenEnter}
        </button>
        <label className="flex min-w-0 flex-col gap-1 text-[11px] text-zinc-500">
          {copy.speedLabel}
          <select
            value={String(rate)}
            disabled={disabled}
            onChange={(e) => {
              const next = PLAYBACK_RATES.find(
                (r) => r === Number(e.target.value),
              );
              if (next !== undefined) onRateChange(next);
            }}
            className="input-field min-h-11 w-[7.5rem] py-1.5 text-sm text-zinc-900"
          >
            {PLAYBACK_RATES.map((r) => (
              <option key={r} value={r}>
                {fmt(copy.speedValue, { rate: r })}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-[11px] text-zinc-500">
          {copy.fpsLabel}
          <select
            value={fpsAutoEnabled ? "auto" : String(fps)}
            disabled={disabled}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "auto") {
                onFpsAutoChange(true);
                return;
              }
              onFpsAutoChange(false);
              onFpsChange(Number(v));
            }}
            className="input-field min-h-11 w-[7.5rem] py-1.5 text-sm text-zinc-900"
            title={copy.fpsHint}
          >
            <option value="auto">{copy.fpsAuto}</option>
            {fpsOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <p className="max-w-sm text-[11px] leading-relaxed text-zinc-400">
          {copy.fpsHint}
        </p>
      </div>
    </div>
  );
}
