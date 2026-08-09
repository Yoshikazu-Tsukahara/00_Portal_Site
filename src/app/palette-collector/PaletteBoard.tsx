"use client";

import { ClipboardCopy, Trash2 } from "lucide-react";
import { fmt } from "@/i18n";
import type { PaletteCollectorDict } from "@/i18n/apps/paletteCollector";
import type { ColorFormat } from "./colorMath";
import PaletteCard from "./PaletteCard";
import type { PaletteColorEntry } from "./types";

const FORMATS: ColorFormat[] = ["hex", "rgb", "hsl"];

export default function PaletteBoard({
  colors,
  format,
  selectedId,
  onSelectId,
  copy,
  onChangeFormat,
  onCopy,
  onDelete,
  onClearAll,
  onAddColor,
  onExportCss,
  onExportJson,
}: {
  colors: PaletteColorEntry[];
  format: ColorFormat;
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  copy: PaletteCollectorDict["palette"];
  onChangeFormat: (format: ColorFormat) => void;
  onCopy: (text: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onAddColor: (hex: string) => void;
  onExportCss: () => void;
  onExportJson: () => void;
}) {
  const formatLabels: Record<ColorFormat, string> = {
    hex: copy.formatHex,
    rgb: copy.formatRgb,
    hsl: copy.formatHsl,
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
            {copy.heading}
          </h2>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-gray-600">
            {fmt(copy.countLabel, { count: colors.length })}
          </span>
        </div>

        <div
          role="group"
          aria-label={copy.formatLabel}
          className="inline-flex rounded-full border border-gray-200 bg-gray-50 p-0.5"
        >
          {FORMATS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onChangeFormat(f)}
              aria-pressed={format === f}
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors sm:text-[11px] ${
                format === f
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {formatLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {colors.length > 0 ? (
        <div className="mt-2 space-y-0.5">
          <p className="text-[10px] text-gray-400">{copy.selectForLocation}</p>
          <p className="text-[10px] text-gray-400">{copy.longPressHint}</p>
        </div>
      ) : null}

      {colors.length === 0 ? (
        <div className="mt-3 flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gray-200 py-8 text-center">
          <p className="text-sm font-medium text-gray-400">{copy.empty}</p>
          <p className="text-xs text-gray-400">{copy.emptyHint}</p>
        </div>
      ) : (
        <div className="mt-2 grid max-h-[22rem] grid-cols-2 gap-1 overflow-y-auto pr-0.5">
          {colors.map((entry) => (
            <PaletteCard
              key={entry.id}
              entry={entry}
              format={format}
              selected={selectedId === entry.id}
              onSelect={() =>
                onSelectId(selectedId === entry.id ? null : entry.id)
              }
              copy={copy}
              onCopy={onCopy}
              onDelete={onDelete}
              onAddColor={onAddColor}
            />
          ))}
        </div>
      )}

      {colors.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={onExportCss}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 sm:text-xs"
          >
            <ClipboardCopy className="size-3.5" aria-hidden />
            {copy.exportCss}
          </button>
          <button
            type="button"
            onClick={onExportJson}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 sm:text-xs"
          >
            <ClipboardCopy className="size-3.5" aria-hidden />
            {copy.exportJson}
          </button>
          <button
            type="button"
            onClick={onClearAll}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-medium text-rose-600 transition-colors hover:border-rose-300 hover:bg-rose-100 sm:text-xs"
          >
            <Trash2 className="size-3.5" aria-hidden />
            {copy.clearAll}
          </button>
        </div>
      ) : null}
    </section>
  );
}
