"use client";

import { Copy, Trash2, X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { fmt } from "@/i18n";
import type { PaletteCollectorDict } from "@/i18n/apps/paletteCollector";
import {
  analogousColors,
  complementaryColor,
  formatColor,
  type ColorFormat,
} from "./colorMath";
import type { PaletteColorEntry } from "./types";

const LONG_PRESS_MS = 480;
/** この距離以上動いたら長押しをキャンセル（スクロール対策） */
const MOVE_CANCEL_PX = 12;

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

/** 2列グリッド向けの色カード。コピー／削除は長押しメニューから選ぶ */
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<number | null>(null);
  const longFiredRef = useRef(false);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const display = formatColor(entry.hex, format);
  const comp = complementaryColor(entry.hex);
  const [ana1, ana2] = analogousColors(entry.hex);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  function clearTimer() {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function openMenu() {
    longFiredRef.current = true;
    setMenuOpen(true);
    try {
      navigator.vibrate?.(12);
    } catch {
      // ignore
    }
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    longFiredRef.current = false;
    startRef.current = { x: event.clientX, y: event.clientY };
    clearTimer();
    timerRef.current = window.setTimeout(openMenu, LONG_PRESS_MS);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!startRef.current || timerRef.current == null) return;
    const dx = event.clientX - startRef.current.x;
    const dy = event.clientY - startRef.current.y;
    if (dx * dx + dy * dy > MOVE_CANCEL_PX * MOVE_CANCEL_PX) {
      clearTimer();
      startRef.current = null;
    }
  }

  function handlePointerEnd() {
    clearTimer();
    startRef.current = null;
  }

  function handleClick() {
    if (longFiredRef.current) {
      longFiredRef.current = false;
      return;
    }
    onSelect();
    setExpanded((v) => !v);
  }

  function handleContextMenu(event: ReactMouseEvent) {
    event.preventDefault();
    openMenu();
  }

  const menu =
    mounted && menuOpen
      ? createPortal(
          <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
            <button
              type="button"
              aria-label={copy.cancelAction}
              className="absolute inset-0 bg-black/35"
              onClick={() => setMenuOpen(false)}
            />
            <div
              role="menu"
              aria-label={display}
              className="relative z-[1] w-full max-w-sm rounded-t-2xl border border-gray-200 bg-white p-3 shadow-xl sm:rounded-2xl"
            >
              <div className="mb-2 flex items-center gap-2 px-1">
                <span
                  className="size-7 shrink-0 rounded-md ring-1 ring-inset ring-black/10"
                  style={{ backgroundColor: entry.hex }}
                  aria-hidden
                />
                <p className="min-w-0 flex-1 truncate font-mono text-sm font-medium text-gray-800">
                  {display}
                </p>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label={copy.cancelAction}
                  className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onCopy(display);
                    setMenuOpen(false);
                  }}
                  className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-left text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 active:bg-gray-100"
                >
                  <Copy className="size-4 text-gray-500" aria-hidden />
                  {copy.copyAction}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onDelete(entry.id);
                    setMenuOpen(false);
                  }}
                  className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 active:bg-rose-100"
                >
                  <Trash2 className="size-4" aria-hidden />
                  {copy.deleteAction}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      className={`group select-none rounded-lg border transition-all duration-150 [-webkit-touch-callout:none] hover:border-gray-200 hover:bg-white hover:shadow-sm ${
        selected
          ? "border-violet-300 bg-violet-50/80 shadow-sm ring-1 ring-violet-200"
          : expanded
            ? "border-gray-200 bg-white shadow-sm"
            : "border-transparent bg-transparent"
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onPointerLeave={handlePointerEnd}
      onContextMenu={handleContextMenu}
    >
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={selected}
        aria-label={fmt(copy.selectColorAria, { value: display })}
        title={copy.longPressHint}
        className="flex w-full min-w-0 items-center gap-2 px-1.5 py-1.5 text-left"
      >
        <span
          className={`size-7 shrink-0 rounded-md ring-1 ring-inset ring-black/10 ${
            selected ? "ring-2 ring-violet-500 ring-offset-1" : ""
          }`}
          style={{ backgroundColor: entry.hex }}
          aria-hidden
        />
        <span
          className={`min-w-0 flex-1 truncate font-mono text-[11px] font-medium sm:text-xs ${
            selected ? "text-violet-900" : "text-gray-700"
          }`}
        >
          {display}
        </span>
      </button>

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

      {menu}
    </div>
  );
}
