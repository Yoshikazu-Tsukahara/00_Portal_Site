/** サイト全体の表示幅モード（PC 向け。狭い画面では実質フル幅） */
export type LayoutMode = "default" | "wide" | "full";

export const LAYOUT_MODES: LayoutMode[] = ["default", "wide", "full"];

/** localStorage に保存するキー */
export const LAYOUT_MODE_STORAGE_KEY = "my-tool-box:layout-mode";

/** html 要素の data 属性名（data-layout-mode） */
export const LAYOUT_MODE_DATASET_ATTR = "layoutMode";

/** 初回訪問時・不正値のときの既定 */
export const DEFAULT_LAYOUT_MODE: LayoutMode = "default";

export function isLayoutMode(value: unknown): value is LayoutMode {
  return value === "default" || value === "wide" || value === "full";
}

/**
 * Main / Footer（および Header 内のロゴ列）に付けるクラス。
 * 左右の余白は全モード共通。
 * max-width はここではなく `html[data-layout-mode]` + `.layout-content` の CSS が担当する。
 * （ページ遷移の RSC が標準幅で描画しても、既に付いている data 属性で幅が維持される）
 */
export function layoutContentClass(_mode?: LayoutMode): string {
  return "layout-content mx-auto w-full px-4 sm:px-6";
}

/**
 * 初回ペイント前に localStorage から data-layout-mode を復元するインラインスクリプト。
 * React ハイドレーションより先に幅を確定させ、チラつきを防ぐ。
 */
export const LAYOUT_MODE_BOOTSTRAP_SCRIPT = `(function(){try{var k=${JSON.stringify(LAYOUT_MODE_STORAGE_KEY)};var m=localStorage.getItem(k);if(m==="default"||m==="wide"||m==="full"){document.documentElement.dataset.${LAYOUT_MODE_DATASET_ATTR}=m;}else{document.documentElement.dataset.${LAYOUT_MODE_DATASET_ATTR}="default";}}catch(e){document.documentElement.dataset.${LAYOUT_MODE_DATASET_ATTR}="default";}})();`;
