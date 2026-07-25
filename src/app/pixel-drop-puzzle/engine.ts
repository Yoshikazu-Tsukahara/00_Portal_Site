// 極小ピクセル隙間落としパズル: 座標・物理エンジン
//
// 棒のXは「壁時計（performance.now）の連続関数」として算出する。
// STOP 時は samplePatrolAt でクリック瞬間の理論座標をサブフレーム精度で確定し、
// 描画フレーム（60Hz 等）の飛び飛び位置には一切依存しない。
// 落下Yは等加速度（½gt²）で積分。成功時の隙間ハマりだけ別途イージング演出。

import { GAME_GROUND_ASPECT } from "./imageUtil";

/** ステージ全体の最小高さ（ビューポート高さ比） */
export const STAGE_MIN_VH = 260;
/** 棒の開始位置（ビューポート高さ比、ステージ上端から） */
export const BLOCK_START_VH = 10;
/** 地表の下に残す余白（px）。盤面はステージ最下端に揃える */
export const GROUND_BOTTOM_PAD_PX = 0;

/**
 * 等加速度落下の重力（px / ms²）。
 * 位置は s = ½ g t²、速度は v = g t（初速度 0）に従う。
 */
export const FALL_GRAVITY_PX_PER_MS2 = 0.001;

/** 1 フレームあたりの dt 上限（ms）。タブ復帰時の跳びを抑える */
export const FALL_MAX_DT_MS = 32;

/** 初速度 0 の等加速度落下を 1 ステップ進める */
export function stepFallMotion(
  y: number,
  vy: number,
  dtMs: number,
): { y: number; vy: number } {
  let dt = dtMs;
  if (dt < 0) dt = 0;
  if (dt > FALL_MAX_DT_MS) dt = FALL_MAX_DT_MS;
  const vyNext = vy + FALL_GRAVITY_PX_PER_MS2 * dt;
  return { y: y + vyNext * dt, vy: vyNext };
}

/** 成功時・隙間へハマる演出の基本時間（ms）。距離に応じて伸ばす */
export const SEAT_FALL_BASE_MS = 1800;
/** 上記演出で、落下距離 1000px あたり追加する時間（ms） */
export const SEAT_FALL_MS_PER_1000PX = 400;

/** 隙間挿入フェーズの所要時間（上空からの物理落下とは別） */
export function fallSeatDurationMs(distancePx: number): number {
  return (
    SEAT_FALL_BASE_MS +
    (Math.max(0, distancePx) / 1000) * SEAT_FALL_MS_PER_1000PX
  );
}

/** 隙間へハマる ease-in cubic（t³）。気持ちよく「落ち込む」用 */
export function fallSeatEase(t: number): number {
  const u = Math.min(1, Math.max(0, t));
  return u * u * u;
}

/** 盤面（地表画像）の最大表示幅（px） */
export const MAX_BOARD_WIDTH = 560;

export type PlayGeometry = {
  /** プレイフィールドの実表示幅（px） */
  width: number;
  /** 地表画像の実表示高さ（px）＝棒の高さ */
  groundHeight: number;
  /** 隙間（＝棒）の幅（px）。許容誤差0pxで棒と完全一致 */
  gapWidth: number;
  /** 隙間の左端X（px、中央揃え） */
  gapX: number;
  /** 棒が移動できる左端Xの最大値（= width - gapWidth） */
  maxX: number;
  /** ステージ全体の高さ（px） */
  stageHeight: number;
  /** 棒の初期Y（ステージ上端からのpx） */
  blockStartY: number;
  /** 地表の上端Y（ステージ上端からのpx）＝棒の着地Y */
  groundTopY: number;
};

/** ビューポート高さ（SSR時はフォールバック） */
function viewportHeight(): number {
  if (typeof window === "undefined") return 800;
  return window.innerHeight || 800;
}

/**
 * コンテナ幅から縦長ステージの実測ジオメトリを計算する。
 * 地表画像は横長 16:9 固定（切り取り済み画像と一致）。
 */
export function computeGeometry(
  containerWidth: number,
  _imageWidth: number,
  _imageHeight: number,
): PlayGeometry {
  const vh = viewportHeight();

  // 盤面は画面いっぱいにせず、見やすい幅に抑えて中央寄せ
  const MIN_BOARD_WIDTH = 280;
  const width = Math.min(
    MAX_BOARD_WIDTH,
    Math.max(MIN_BOARD_WIDTH, Math.floor(containerWidth)),
  );
  const groundHeight = width / GAME_GROUND_ASPECT;

  // 溝幅は盤面幅に比例（棒が細すぎ／太すぎにならない範囲）
  const gapWidth = Math.min(Math.max(width * 0.1, 36), Math.round(width * 0.14));
  const gapX = (width - gapWidth) / 2;
  const maxX = width - gapWidth;

  const blockStartY = (BLOCK_START_VH / 100) * vh;
  const minStage = (STAGE_MIN_VH / 100) * vh;
  // 上空〜地表まで十分な落下距離を確保
  const fallGap = Math.max(vh * 1.35, minStage - groundHeight - blockStartY - GROUND_BOTTOM_PAD_PX);
  const stageHeight = blockStartY + fallGap + groundHeight + GROUND_BOTTOM_PAD_PX;
  const groundTopY = stageHeight - GROUND_BOTTOM_PAD_PX - groundHeight;

  return {
    width,
    groundHeight,
    gapWidth,
    gapX,
    maxX,
    stageHeight,
    blockStartY,
    groundTopY,
  };
}

/**
 * 隠し仕様：パトロール速度の減衰段階（1=最速 … 5=最遅）。
 * UIには一切出さない。プレイヤーが待つほど狙いやすくなるギミック。
 */
export const PATROL_SPEED_LEVEL_MAX = 5;
/** 何往復ごとに1段階遅くなるか */
export const PATROL_TRIPS_PER_SPEED_LEVEL = 10;

/** 速度段階ごとの周期倍率（大きいほど遅い）。index 0 = 第1段階（デフォルト最速） */
const PATROL_SPEED_PERIOD_FACTORS = [1, 1.28, 1.62, 2.05, 2.6] as const;

/** ステージ基本周期 × 速度段階 → 実効往復周期（ms） */
export function periodMsForPatrolSpeedLevel(
  basePeriodMs: number,
  speedLevel: number,
): number {
  const level = Math.min(
    PATROL_SPEED_LEVEL_MAX,
    Math.max(1, Math.floor(speedLevel)),
  );
  return basePeriodMs * PATROL_SPEED_PERIOD_FACTORS[level - 1];
}

/**
 * 周期変更時に位相をスケールし直し、位置・進行方向を保つ。
 * （単純に period だけ変えると棒が一瞬ワープする）
 */
export function remapPatrolPhaseMs(
  phaseMs: number,
  oldPeriodMs: number,
  newPeriodMs: number,
): number {
  if (oldPeriodMs <= 0 || newPeriodMs <= 0) return 0;
  const frac = ((phaseMs % oldPeriodMs) + oldPeriodMs) % oldPeriodMs;
  return (frac / oldPeriodMs) * newPeriodMs;
}

/** パトロール時計の可変状態（速度減衰用） */
export type PatrolSpeedState = {
  periodMs: number;
  phaseMs: number;
  completedTrips: number;
  speedLevel: number;
};

/**
 * 経過時間ぶん位相を進め、往復完了で速度段階を更新する。
 * 速度切替時は位相をスケールし、位置が飛ばないようにする。
 *
 * @param clampDtMs 描画用 rAF 向けの dt 上限。判定サンプリングでは必ず null（無制限）にし、
 *                  クリック瞬間の壁時計を欠落させない。
 */
export function advancePatrolSpeedState(
  state: PatrolSpeedState,
  dtMs: number,
  basePeriodMs: number,
  clampDtMs: number | null = null,
): void {
  let dt = dtMs;
  if (dt < 0) dt = 0;
  if (clampDtMs !== null && dt > clampDtMs) dt = clampDtMs;

  state.phaseMs += dt;

  while (state.phaseMs >= state.periodMs && state.periodMs > 0) {
    state.phaseMs -= state.periodMs;
    state.completedTrips += 1;

    if (
      state.completedTrips % PATROL_TRIPS_PER_SPEED_LEVEL === 0 &&
      state.speedLevel < PATROL_SPEED_LEVEL_MAX
    ) {
      const oldPeriod = state.periodMs;
      state.speedLevel += 1;
      state.periodMs = periodMsForPatrolSpeedLevel(basePeriodMs, state.speedLevel);
      state.phaseMs = remapPatrolPhaseMs(state.phaseMs, oldPeriod, state.periodMs);
    }
  }
}

/** パトロール時計（速度減衰 + 最終サンプル時刻） */
export type PatrolClockState = PatrolSpeedState & { lastNow: number };

/**
 * 指定タイムスタンプ時点のパトロール状態と理論Xを、描画フレームに依存せず算出する。
 * STOP 判定はこの結果だけを使い、DOM の見た目位置は参照しない（サブフレーム精度）。
 */
export function samplePatrolAt(
  state: PatrolClockState,
  atNowMs: number,
  basePeriodMs: number,
  maxX: number,
): PatrolClockState & { x: number } {
  const sample: PatrolClockState = {
    periodMs: state.periodMs,
    phaseMs: state.phaseMs,
    completedTrips: state.completedTrips,
    speedLevel: state.speedLevel,
    lastNow: state.lastNow,
  };
  // 判定用：壁時計どおりフルに進める（フレームスキップのクランプなし）
  advancePatrolSpeedState(sample, atNowMs - sample.lastNow, basePeriodMs, null);
  sample.lastNow = atNowMs;
  const x = triangleWave(sample.phaseMs, sample.periodMs, maxX);
  return { ...sample, x };
}

/** 三角波：0 → maxX → 0 を periodMs 周期で往復（時刻の純関数・連続座標） */
export function triangleWave(elapsedMs: number, periodMs: number, maxX: number): number {
  if (periodMs <= 0 || maxX <= 0) return 0;
  const half = periodMs / 2;
  // 周期内位相を [0, period) に正規化（負の経過にも耐える）
  const t = ((elapsedMs % periodMs) + periodMs) % periodMs;
  // 線形往復：上昇辺・下降辺とも連続（フレーム量子化なし）
  if (t < half) {
    return (t / half) * maxX;
  }
  return maxX - ((t - half) / half) * maxX;
}

/**
 * パトロール開始時の位相（ms）をランダム生成する。
 * - 初期X位置をランダム
 * - 進行方向（右行き／左行き）もランダム
 * これにより「開始から○秒後」の固定タイミング狙いを無効化する。
 */
export function randomPatrolPhaseMs(periodMs: number, maxX: number): number {
  if (periodMs <= 0) return 0;
  if (maxX <= 0) return Math.random() * periodMs;

  const half = periodMs / 2;
  const startX = Math.random() * maxX;
  const goingRight = Math.random() < 0.5;
  const ratio = startX / maxX;

  if (goingRight) {
    // 上昇辺：0 → maxX
    return ratio * half;
  }
  // 下降辺：maxX → 0
  return half + (1 - ratio) * half;
}

/** 周期 periodMs の円環上での符号付き最短距離 */
function circularDelta(a: number, b: number, periodMs: number): number {
  let d = (a - b) % periodMs;
  if (d > periodMs / 2) d -= periodMs;
  if (d < -periodMs / 2) d += periodMs;
  return d;
}

/**
 * 理想停止タイミングとの時間差（ms）。演出用の参考値。
 * 成功判定そのものには使わない。
 */
export function idealStopTimeDeltaMs(
  elapsedMs: number,
  periodMs: number,
  maxX: number,
  targetX: number,
): number {
  if (periodMs <= 0 || maxX <= 0) return 0;
  const half = periodMs / 2;
  const clampedTarget = Math.min(Math.max(targetX, 0), maxX);
  const tRise = (clampedTarget / maxX) * half;
  const tFall = periodMs - tRise;
  const tInCycle = ((elapsedMs % periodMs) + periodMs) % periodMs;

  const dRise = circularDelta(tInCycle, tRise, periodMs);
  const dFall = circularDelta(tInCycle, tFall, periodMs);

  return Math.abs(dRise) <= Math.abs(dFall) ? dRise : dFall;
}
