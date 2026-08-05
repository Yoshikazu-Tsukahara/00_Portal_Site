/**
 * ミニゲーム作業領域の最低サイズ。
 * ウィンドウがこれ以上なら残り領域いっぱいに広げ、
 * それ未満なら縮めずスクロールで確保する（AppShell の minStageSize）。
 */
export type MinStageSize = {
  width: number;
  height: number;
};

/** 投射フリースロー：左メモ＋コート＋右付箋が破綻しない幅 */
export const ROBOT_FREETHROW_MIN_STAGE: MinStageSize = {
  width: 960,
  height: 600,
};

/** 究極確率スロット：コンソール＋実績が読める幅 */
export const SLOT_MIN_STAGE: MinStageSize = {
  width: 900,
  height: 560,
};

/** 極小ピクセル隙間落とし：ステージ＋操作が窮屈にならない幅 */
export const PIXEL_DROP_MIN_STAGE: MinStageSize = {
  width: 800,
  height: 560,
};
