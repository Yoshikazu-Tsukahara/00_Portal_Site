/**
 * ミニゲーム作業領域の最低サイズ。
 * ウィンドウがこれ以上なら残り領域いっぱいに広げ、
 * それ未満なら縮めず Header〜Footer を含むページ全体が伸びてスクロールする
 *（AppShell の minStageSize + SiteChrome の MIN_STAGE_PAGE_SCROLL_PATHS）。
 */
export type MinStageSize = {
  width: number;
  height: number;
};

/**
 * 投射フリースロー：左メモ＋コート＋右付箋が破綻しない幅（PC 向け）。
 * スマホ／縦型では AppShell が minWidth を適用しない。
 */
export const ROBOT_FREETHROW_MIN_STAGE: MinStageSize = {
  width: 960,
  height: 600,
};

/**
 * 究極確率スロット：コンソール＋実績が読める幅（PC 向け）。
 * スマホ／縦型では AppShell が minWidth を適用しない（横スクロール防止）。
 */
export const SLOT_MIN_STAGE: MinStageSize = {
  width: 900,
  height: 560,
};

/**
 * 極小ピクセル隙間落とし：ステージ＋操作が窮屈にならない幅（PC 向け）。
 * スマホ／縦型では AppShell が minWidth を適用しない。
 */
export const PIXEL_DROP_MIN_STAGE: MinStageSize = {
  width: 800,
  height: 560,
};
