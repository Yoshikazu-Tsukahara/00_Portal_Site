"use client";

import { Copy, Trash2 } from "lucide-react";
import { useState } from "react";
import { fmt } from "@/i18n";
import type { PaletteCollectorDict } from "@/i18n/apps/paletteCollector";
import {
  analogousColors,
  complementaryColor,
  formatColor,
  type ColorFormat,
} from "./colorMath";
import type { PaletteColorEntry } from "./types";

function SuggestionChip({
  hex,
  addAria,
  onAdd,
}: {
  hex: string;
  addAria: string;
  onAdd: (hex: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onAdd(hex)}
      aria-label={fmt(addAria, { value: hex })}
      title={hex}
      className="size-5 shrink-0 rounded-md ring-1 ring-inset ring-black/10 transition-transform hover:scale-110"
      style={{ backgroundColor: hex }}
    />
  );
}

/** コンパクトな1行リスト行（色見本＋コード＋ホバー操作） */
export default function PaletteCard({
  entry,
  format,
  selected,
  onSelect,
  copy,
  onCopy,
  onDelete,
  onAddColor,
}: {
  entry: PaletteColorEntry;
  format: ColorFormat;
  selected: boolean;
  onSelect: () => void;
  copy: PaletteCollectorDict["palette"];
  onCopy: (text: string) => void;
  onDelete: (id: string) => void;
  onAddColor: (hex: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const display = formatColor(entry.hex, format);
  const comp = complementaryColor(entry.hex);
  const [ana1, ana2] = analogousColors(entry.hex);

  return (
    <div
      className={`group rounded-lg border transition-all duration-150 hover:border-gray-200 hover:bg-white hover:shadow-sm ${
        selected
          ? "border-violet-300 bg-violet-50/80 shadow-sm ring-1 ring-violet-200"
          : expanded
            ? "border-gray-200 bg-white shadow-sm"
            : "border-transparent bg-transparent"
      }`}
    >
      <div className="flex items-center gap-2 px-1.5 py-1">
        <button
          type="button"
          onClick={() => {
            onSelect();
            setExpanded((v) => !v);
          }}
          aria-pressed={selected}
          aria-label={fmt(copy.selectColorAria, { value: display })}
          className={`size-7 shrink-0 rounded-md ring-1 ring-inset ring-black/10 transition-transform group-hover:scale-105 ${
            selected ? "ring-2 ring-violet-500 ring-offset-1" : ""
          }`}
          style={{ backgroundColor: entry.hex }}
          title={display}
        />

        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          className={`min-w-0 flex-1 truncate text-left font-mono text-[11px] font-medium transition-colors sm:text-xs ${
            selected ? "text-violet-900" : "text-gray-700 hover:text-gray-950"
          }`}
          title={fmt(copy.selectColorAria, { value: display })}
        >
          {display}
        </button>

        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            onClick={() => onCopy(display)}
            aria-label={fmt(copy.copyAria, { value: display })}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-800"
          >
            <Copy className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(entry.id)}
            aria-label={fmt(copy.deleteAria, { value: display })}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 px-2 py-1.5">
          <span className="text-[10px] font-medium text-gray-400">
            {copy.complementaryLabel}
          </span>
          <SuggestionChip
            hex={comp}
            addAria={copy.addSuggestionAria}
            onAdd={onAddColor}
          />
          <span className="ml-1 text-[10px] font-medium text-gray-400">
            {copy.analogousLabel}
          </span>
          <SuggestionChip
            hex={ana1}
            addAria={copy.addSuggestionAria}
            onAdd={onAddColor}
          />
          <SuggestionChip
            hex={ana2}
            addAria={copy.addSuggestionAria}
            onAdd={onAddColor}
          />
        </div>
      ) : null}
    </div>
  );
}
