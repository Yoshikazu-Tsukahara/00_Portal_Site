"use client";

import { useEffect, useId, useMemo, useState } from "react";
import type { UltimateProbabilitySlotDict } from "@/i18n/apps/ultimateProbabilitySlot";
import { readImageAsDataUrl } from "./imageUtil";
import { formatOdds, singleSpinProbability } from "./probability";
import {
  MAX_ITEMS_PER_REEL,
  MAX_REELS,
  MIN_ITEMS_PER_REEL,
  MIN_REELS,
  buildDefaultSettings,
  buildDefaultItem,
  createId,
  type SlotItem,
  type SlotItemType,
  type SlotSettings,
} from "./types";

type SetupCopy = UltimateProbabilitySlotDict["setup"];

function resizeSymbols(current: SlotItem[], count: number): SlotItem[] {
  return Array.from({ length: count }, (_, i) => {
    const prev = current[i];
    return prev ?? buildDefaultItem(i);
  });
}

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
  const [reelCount, setReelCount] = useState(initial?.reelCount ?? defaults.reelCount);
  const [symbols, setSymbols] = useState<SlotItem[]>(
    () => initial?.symbols ?? defaults.symbols,
  );
  const [busyCell, setBusyCell] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const base = initial ?? buildDefaultSettings();
    setReelCount(base.reelCount);
    setSymbols(base.symbols);
  }, [open, initial]);

  const previewSettings = useMemo<SlotSettings>(
    () => ({
      reelCount,
      symbols,
      mode: initial?.mode ?? "hitUntilWin",
      stopMode: initial?.stopMode ?? "batch",
    }),
    [reelCount, symbols, initial],
  );
  const previewOdds = useMemo(
    () => formatOdds(singleSpinProbability(previewSettings)),
    [previewSettings],
  );

  if (!open) return null;

  function applyReelCount(next: number) {
    setReelCount(Math.min(Math.max(next, MIN_REELS), MAX_REELS));
  }

  function applySymbolCount(next: number) {
    const clamped = Math.min(Math.max(next, MIN_ITEMS_PER_REEL), MAX_ITEMS_PER_REEL);
    setSymbols((prev) => resizeSymbols(prev, clamped));
  }

  function updateItem(itemIndex: number, patch: Partial<SlotItem>) {
    setSymbols((prev) =>
      prev.map((item, ii) => (ii === itemIndex ? { ...item, ...patch } : item)),
    );
  }

  function changeType(itemIndex: number, type: SlotItemType) {
    const current = symbols[itemIndex];
    const defaultsMap: Record<SlotItemType, string> = {
      text: "TEXT",
      number: "7",
      emoji: "⭐",
      image: "",
    };
    updateItem(itemIndex, {
      type,
      value: current && current.type === type ? current.value : defaultsMap[type],
    });
  }

  async function handleUpload(itemIndex: number, file: File) {
    setBusyCell(itemIndex);
    try {
      const dataUrl = await readImageAsDataUrl(file);
      updateItem(itemIndex, { type: "image", value: dataUrl });
    } catch {
      // 読み込み失敗時は元の値を維持
    } finally {
      setBusyCell(null);
    }
  }

  function handleSave() {
    // 保存時に各絵柄の id を新鮮にし、全リールで同一セットとして使う
    const cleaned = symbols.map((s) => ({ ...s, id: createId() }));
    onSave({
      reelCount,
      symbols: cleaned,
      mode: initial?.mode ?? "hitUntilWin",
      stopMode: initial?.stopMode ?? "batch",
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
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-zinc-800 bg-zinc-950 font-mono text-zinc-100 shadow-2xl sm:rounded-2xl"
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
              value={symbols.length}
              min={MIN_ITEMS_PER_REEL}
              max={MAX_ITEMS_PER_REEL}
              onChange={applySymbolCount}
            />
          </div>

          <p className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-[11px] leading-relaxed text-zinc-400">
            {copy.sharedSymbolsHint}
          </p>

          <div className="space-y-2">
            {symbols.map((item, itemIndex) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-2.5"
              >
                <span className="w-14 shrink-0 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                  {itemIndex === 0 ? (
                    <span className="text-amber-400">{copy.jackpotTag}</span>
                  ) : (
                    `#${itemIndex + 1}`
                  )}
                </span>

                <select
                  value={item.type}
                  onChange={(e) =>
                    changeType(itemIndex, e.target.value as SlotItemType)
                  }
                  className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-200 focus:border-amber-400/50 focus:outline-none"
                >
                  <option value="text">{copy.typeText}</option>
                  <option value="number">{copy.typeNumber}</option>
                  <option value="emoji">{copy.typeEmoji}</option>
                  <option value="image">{copy.typeImage}</option>
                </select>

                {item.type === "image" ? (
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-800 bg-black/40 text-[10px] text-zinc-600">
                      {item.value ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.value}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        "—"
                      )}
                    </div>
                    <label className="slot-ghost-btn cursor-pointer !py-1.5 !text-[11px]">
                      {busyCell === itemIndex ? "…" : copy.uploadButton}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = "";
                          if (file) void handleUpload(itemIndex, file);
                        }}
                      />
                    </label>
                    {item.value ? (
                      <button
                        type="button"
                        onClick={() => updateItem(itemIndex, { value: "" })}
                        className="text-[11px] text-zinc-500 hover:text-rose-400"
                      >
                        {copy.removeImage}
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <input
                    type="text"
                    inputMode={item.type === "number" ? "numeric" : undefined}
                    value={item.value}
                    onChange={(e) =>
                      updateItem(itemIndex, {
                        value:
                          item.type === "number"
                            ? e.target.value.replace(/[^0-9\-]/g, "").slice(0, 6)
                            : e.target.value.slice(0, 12),
                      })
                    }
                    placeholder={
                      item.type === "number"
                        ? copy.valuePlaceholderNumber
                        : item.type === "emoji"
                          ? copy.valuePlaceholderEmoji
                          : copy.valuePlaceholderText
                    }
                    className="min-w-0 flex-1 rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-base text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400/50 focus:outline-none"
                  />
                )}
              </div>
            ))}
          </div>

          <p className="text-[11px] leading-relaxed text-zinc-500">{copy.uploadHint}</p>
        </div>

        <div className="border-t border-zinc-800 px-5 py-4">
          <div className="mb-3 flex items-center justify-between rounded-lg border border-zinc-800 bg-black/40 px-3 py-2">
            <span className="text-[11px] text-zinc-500">{copy.oddsPreviewLabel}</span>
            <span className="slot-readout-value text-sm text-amber-300">
              1 / {previewOdds}
            </span>
          </div>
          <div className="flex gap-2">
            {initial ? (
              <button type="button" onClick={onClose} className="slot-ghost-btn flex-1">
                {copy.cancel}
              </button>
            ) : null}
            <button type="button" onClick={handleSave} className="slot-spin-btn flex-1">
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
