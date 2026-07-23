"use client";

import { useEffect, useId, useMemo, useState } from "react";
import type { UltimateProbabilitySlotDict } from "@/i18n/apps/ultimateProbabilitySlot";
import { readImageAsDataUrl } from "./imageUtil";
import { formatOdds, singleSpinProbability } from "./probability";
import {
  DEFAULT_JP_IMAGE_PATH,
  JACKPOT_INDEX,
  MAX_ITEMS_PER_REEL,
  MAX_REELS,
  MIN_ITEMS_PER_REEL,
  MIN_REELS,
  buildDefaultJackpot,
  buildDefaultSettings,
  buildSymbols,
  createId,
  type SlotItem,
  type SlotSettings,
} from "./types";

type SetupCopy = UltimateProbabilitySlotDict["setup"];

export default function SetupModal({
  open,
  initial,
  copy,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: SlotSettings | null;
  copy: SetupCopy;
  onClose: () => void;
  onSave: (settings: SlotSettings) => void;
}) {
  const titleId = useId();
  const defaults = buildDefaultSettings();
  const [reelCount, setReelCount] = useState(
    initial?.reelCount ?? defaults.reelCount,
  );
  const [itemCount, setItemCount] = useState(
    initial?.symbols.length ?? defaults.symbols.length,
  );
  const [jackpot, setJackpot] = useState<SlotItem>(() =>
    initial?.symbols[JACKPOT_INDEX]
      ? {
          ...initial.symbols[JACKPOT_INDEX],
          type: "image",
          value:
            initial.symbols[JACKPOT_INDEX].type === "image" &&
            initial.symbols[JACKPOT_INDEX].value
              ? initial.symbols[JACKPOT_INDEX].value
              : DEFAULT_JP_IMAGE_PATH,
        }
      : buildDefaultJackpot(),
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const base = initial ?? buildDefaultSettings();
    setReelCount(base.reelCount);
    setItemCount(base.symbols.length);
    const jp = base.symbols[JACKPOT_INDEX];
    setJackpot(
      jp && jp.type === "image" && jp.value
        ? { ...jp, type: "image" }
        : buildDefaultJackpot(),
    );
  }, [open, initial]);

  const symbols = useMemo(
    () => buildSymbols(itemCount, jackpot),
    [itemCount, jackpot],
  );

  const previewSettings = useMemo<SlotSettings>(
    () => ({
      reelCount,
      symbols,
      mode: initial?.mode ?? "hitUntilWin",
      stopMode: "batch",
    }),
    [reelCount, symbols, initial],
  );
  const previewOdds = useMemo(
    () => formatOdds(singleSpinProbability(previewSettings)),
    [previewSettings],
  );

  const isCustomJp =
    jackpot.value.length > 0 && jackpot.value !== DEFAULT_JP_IMAGE_PATH;

  if (!open) return null;

  function applyReelCount(next: number) {
    setReelCount(Math.min(Math.max(next, MIN_REELS), MAX_REELS));
  }

  function applyItemCount(next: number) {
    setItemCount(
      Math.min(Math.max(next, MIN_ITEMS_PER_REEL), MAX_ITEMS_PER_REEL),
    );
  }

  async function handleUpload(file: File) {
    setBusy(true);
    try {
      const dataUrl = await readImageAsDataUrl(file);
      setJackpot({ id: createId(), type: "image", value: dataUrl });
    } catch {
      // 読み込み失敗時は元の値を維持
    } finally {
      setBusy(false);
    }
  }

  function resetJackpot() {
    setJackpot(buildDefaultJackpot());
  }

  function handleSave() {
    const cleaned = buildSymbols(itemCount, {
      ...jackpot,
      id: createId(),
      type: "image",
      value: jackpot.value || DEFAULT_JP_IMAGE_PATH,
    });
    onSave({
      reelCount,
      symbols: cleaned,
      mode: initial?.mode ?? "hitUntilWin",
      stopMode: "batch",
    });
  }

  return (
    <div
      className="fixed inset-0 z-[65] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && initial) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-zinc-800 bg-zinc-950 font-mono text-zinc-100 shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div>
            <h2
              id={titleId}
              className="text-base font-semibold tracking-tight text-zinc-50"
            >
              {copy.title}
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">{copy.subtitle}</p>
          </div>
          {initial ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-2 py-1 text-sm text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-200"
              aria-label={copy.cancel}
            >
              ✕
            </button>
          ) : null}
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <Stepper
              label={copy.reelsLabel}
              value={reelCount}
              min={MIN_REELS}
              max={MAX_REELS}
              onChange={applyReelCount}
            />
            <Stepper
              label={copy.itemsLabel}
              value={itemCount}
              min={MIN_ITEMS_PER_REEL}
              max={MAX_ITEMS_PER_REEL}
              onChange={applyItemCount}
            />
          </div>

          <p className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-[11px] leading-relaxed text-zinc-400">
            {copy.autoMissHint}
          </p>

          {/* JP 画像のみカスタマイズ */}
          <section className="rounded-xl border border-amber-400/25 bg-amber-400/[0.04] p-4">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h3 className="text-xs font-semibold tracking-[0.14em] text-amber-300">
                {copy.jackpotTag}
              </h3>
              <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                {copy.jackpotImageOnly}
              </span>
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-stretch">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-700 bg-black shadow-[inset_0_0_24px_rgba(0,0,0,0.6)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={jackpot.value || DEFAULT_JP_IMAGE_PATH}
                  alt=""
                  className="h-full w-full object-contain p-1.5"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                <label className="slot-spin-btn !py-2.5 cursor-pointer text-center !text-xs !tracking-[0.16em]">
                  {busy ? "…" : copy.uploadButton}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    disabled={busy}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (file) void handleUpload(file);
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={resetJackpot}
                  disabled={!isCustomJp}
                  className="slot-ghost-btn !py-2 disabled:opacity-35"
                >
                  {copy.resetJackpot}
                </button>
                <p className="text-[10px] leading-relaxed text-zinc-500">
                  {copy.uploadHint}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="border-t border-zinc-800 px-5 py-4">
          <div className="mb-3 flex items-center justify-between rounded-lg border border-zinc-800 bg-black/40 px-3 py-2">
            <span className="text-[11px] text-zinc-500">
              {copy.oddsPreviewLabel}
            </span>
            <span className="slot-readout-value text-sm text-amber-300">
              1 / {previewOdds}
            </span>
          </div>
          <div className="flex gap-2">
            {initial ? (
              <button
                type="button"
                onClick={onClose}
                className="slot-ghost-btn flex-1"
              >
                {copy.cancel}
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleSave}
              className="slot-spin-btn flex-1"
            >
              {initial ? copy.save : copy.startButton}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-2.5">
      <p className="slot-readout-label mb-1.5">{label}</p>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-700 text-zinc-300 transition-colors hover:border-zinc-500 disabled:opacity-30"
        >
          −
        </button>
        <span className="slot-readout-value text-lg text-zinc-50">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          disabled={value >= max}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-700 text-zinc-300 transition-colors hover:border-zinc-500 disabled:opacity-30"
        >
          ＋
        </button>
      </div>
    </div>
  );
}
