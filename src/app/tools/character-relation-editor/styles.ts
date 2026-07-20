import type { Character } from "./types";

/** アクセント色 → Tailwind クラス */
export const ACCENT_CLASSES: Record<
  Character["accent"],
  { border: string; soft: string; dot: string }
> = {
  zinc: {
    border: "border-l-zinc-400",
    soft: "bg-zinc-50",
    dot: "bg-zinc-400",
  },
  rose: {
    border: "border-l-rose-400",
    soft: "bg-rose-50/60",
    dot: "bg-rose-400",
  },
  amber: {
    border: "border-l-amber-400",
    soft: "bg-amber-50/60",
    dot: "bg-amber-400",
  },
  emerald: {
    border: "border-l-emerald-400",
    soft: "bg-emerald-50/60",
    dot: "bg-emerald-400",
  },
  sky: {
    border: "border-l-sky-400",
    soft: "bg-sky-50/60",
    dot: "bg-sky-400",
  },
  violet: {
    border: "border-l-violet-400",
    soft: "bg-violet-50/60",
    dot: "bg-violet-400",
  },
};

export const CARD_W = 176;
export const CARD_H = 108;

/** 方眼のマス目サイズ（px）※グリッド背景・スナップ共通 */
export const GRID_SIZE = 24;
