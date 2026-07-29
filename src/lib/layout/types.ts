/** サイト全体の表示幅モード（PC 向け。狭い画面では実質フル幅） */
export type LayoutMode = "default" | "wide" | "full";

export const LAYOUT_MODES: LayoutMode[] = ["default", "wide", "full"];

/** localStorage に保存するキー */
export const LAYOUT_MODE_STORAGE_KEY = "my-tool-box:layout-mode";

/** 初回訪問時・不正値のときの既定 */
export const DEFAULT_LAYOUT_MODE: LayoutMode = "default";

export function isLayoutMode(value: unknown): value is LayoutMode {
  return value === "default" || value === "wide" || value === "full";
}

/**
 * Main / Footer（および Header 内のロゴ列）に付けるクラス。
 * 左右の余白は全モード共通にし、max-width だけ変える。
 * → どの画面幅でも「標準 ≤ 広め ≤ 全幅」が崩れない。
 */
export function layoutContentClass(mode: LayoutMode): string {
  // 余白を揃えないと、全幅側の padding が増えて「広めより狭く」見える
  const base = "mx-auto w-full px-4 sm:px-6";
  switch (mode) {
    case "wide":
      return `${base} max-w-7xl`;
    case "full":
      // 上限なし（広め以上）。余分な padding は付けない
      return `${base} max-w-none`;
    case "default":
    default:
      return `${base} max-w-5xl`;
  }
}
