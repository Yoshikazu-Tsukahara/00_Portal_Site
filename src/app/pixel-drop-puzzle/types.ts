// 極小ピクセル隙間落としパズル: 型定義 / LocalStorage データ構造 / 難易度計算
//
// データはすべて LocalStorage 内に閉じる（サーバー送信なし）。
// 「現在の挑戦ステージ」「最高クリア記録」「累計試行統計」「最後に使った画像」を保持する。

import type { CSSProperties } from "react";

export const STORAGE_KEY = "pixel-drop-puzzle-data";

/** ステージ開始時のライフ上限（pt） */
export const LIFE_MAX_PT = 1000;

/** LocalStorage に保存する全データ */
export type PixelDropAppData = {
  /** 現在挑戦中のステージ（1始まり） */
  stage: number;
  /** これまでにクリアした最高ステージ（0 = 未クリア） */
  clearedStage: number;
  /** 生涯の停止（STOP）試行回数 */
  totalAttempts: number;
  /** 生涯クリア回数 */
  totalClears: number;
  /** 生涯失敗回数 */
  totalFails: number;
  /** 過去最小の絶対誤差（成功時のみ更新。px） */
  bestAbsErrorPx: number | null;
  /** 直近アップロードした画像（DataURL）。再訪時に自動復元するため保持 */
  lastImage: string | null;
  /** 現在ステージの残りライフ（pt）。誤差の絶対値（px）だけ減る */
  lifePt: number;
};

export function buildEmptyAppData(): PixelDropAppData {
  return {
    stage: 1,
    clearedStage: 0,
    totalAttempts: 0,
    totalClears: 0,
    totalFails: 0,
    bestAbsErrorPx: null,
    lastImage: null,
    lifePt: LIFE_MAX_PT,
  };
}

/**
 * ステージごとの許容誤差（px）。
 * 序盤は「入門〜慣れ」向けに広め、徐々に厳しくする。
 * 末尾以降はさらに 1/10 ずつ縮小する。
 */
const TOLERANCE_BASE_STEPS = [
  20, // 1: 入門（かなり甘い）
  12, // 2
  8, // 3
  5, // 4
  3, // 5
  2, // 6
  1, // 7: ここから本格
  0.5, // 8
  0.25, // 9
  0.1, // 10
  0.05, // 11
  0.02, // 12
  0.01, // 13
] as const;

/**
 * ステージに対する許容誤差（px）を計算する。
 * テーブル終了後は末尾の値を 1 桁ずつさらに縮小し続ける（±0.001, ±0.0001, ...）。
 */
export function toleranceForStage(stage: number): number {
  const s = Math.max(1, Math.floor(stage));
  if (s <= TOLERANCE_BASE_STEPS.length) return TOLERANCE_BASE_STEPS[s - 1];
  const extra = s - TOLERANCE_BASE_STEPS.length;
  const last = TOLERANCE_BASE_STEPS[TOLERANCE_BASE_STEPS.length - 1];
  return last / Math.pow(10, extra);
}

/**
 * ステージに応じてブロックの往復周期を短縮する（ms）。
 * 序盤はゆっくり、段階数が増えた分だけ減衰を緩やかにする。下限あり。
 */
export function periodMsForStage(stage: number): number {
  const s = Math.max(1, Math.floor(stage));
  return Math.max(650, 1700 - (s - 1) * 18);
}

/** 着地直後の「惜しい…」溜め（ms）。成功・ギリ惜しい失敗で共通 */
export const IMPACT_HOLD_MS = 560;

/** 失敗粒子のあと、リザルトを出すまでの待ち（ms） */
export const FAIL_PARTICLE_BEFORE_RESULT_MS = 760;

/**
 * 着地時に溜め演出を入れるか。
 * 成功（許容内）は常に対象。失敗は許容の約2.25倍以内の惜しいミスのみ。
 */
export function shouldHoldAtImpact(
  absErrorPx: number,
  tolerancePx: number,
  success: boolean,
): boolean {
  if (success) return true;
  if (tolerancePx <= 0) return absErrorPx <= 1e-9;
  return absErrorPx <= tolerancePx * 2.25 + 1e-12;
}

/** 失敗時、粒子のあとにリザルトを遅延する「惜しい」判定（成功時は使わない） */
export function shouldDelayFailResult(
  absErrorPx: number,
  tolerancePx: number,
): boolean {
  if (tolerancePx <= 0) return absErrorPx <= 1e-9;
  return absErrorPx <= tolerancePx * 2.25 + 1e-12;
}

/**
 * 落下後の成否。
 * 誤差（px）をライフから引いたうえで判定する。
 * - depleted: ライフが 0 以下（許容内ヒットでもクリア不可）
 * - success: 許容内かつライフが残っている
 * - fail: 許容外だがライフは残っている
 */
export function resolveDropOutcome(
  lifePt: number,
  absErrorPx: number,
  tolerancePx: number,
): "success" | "fail" | "depleted" {
  const lifeAfter = lifePt - absErrorPx;
  if (lifeAfter <= 0) return "depleted";
  if (absErrorPx <= tolerancePx) return "success";
  return "fail";
}

/** 誤差適用後の残りライフ（0 未満は 0 に丸める） */
export function lifeAfterDamage(lifePt: number, absErrorPx: number): number {
  return Math.max(0, lifePt - Math.max(0, absErrorPx));
}

/**
 * 難易度順のアクセント色（1=緑 … 13=紫、以降は最終色を維持）
 * 緑 → 黄 → 赤 → 紫
 */
const STAGE_ACCENT_HEX = [
  "#22c55e",
  "#4ade80",
  "#a3e635",
  "#eab308",
  "#f59e0b",
  "#f97316",
  "#ef4444",
  "#f43f5e",
  "#ec4899",
  "#d946ef",
  "#c026d3",
  "#a855f7",
  "#9333ea",
] as const;

function hexToRgbChannels(hex: string): `${number} ${number} ${number}` {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = Number.parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `${r} ${g} ${b}`;
}

/** ステージに応じた UI アクセント（CSS 変数） */
export function stageThemeStyle(stage: number): CSSProperties {
  const s = Math.max(1, Math.floor(stage));
  const idx = Math.min(s - 1, STAGE_ACCENT_HEX.length - 1);
  const accent = STAGE_ACCENT_HEX[idx];
  return {
    ["--pxd-accent" as string]: accent,
    ["--pxd-accent-rgb" as string]: hexToRgbChannels(accent),
  };
}

export function stageAccentHex(stage: number): string {
  const s = Math.max(1, Math.floor(stage));
  const idx = Math.min(s - 1, STAGE_ACCENT_HEX.length - 1);
  return STAGE_ACCENT_HEX[idx];
}

/** 許容誤差の値から、結果表示に必要な小数桁数を決める（最低6桁） */
export function decimalsForTolerance(tolerancePx: number): number {
  if (tolerancePx <= 0) return 12;
  const raw = Math.ceil(-Math.log10(tolerancePx)) + 2;
  return Math.min(14, Math.max(6, raw));
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/** バックアップ／LocalStorage から読み込んだ生データを安全な形へ正規化 */
export function normalizeAppData(raw: unknown): PixelDropAppData | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const empty = buildEmptyAppData();

  const stage =
    isFiniteNumber(obj.stage) && obj.stage >= 1 ? Math.floor(obj.stage) : empty.stage;
  const clearedStage =
    isFiniteNumber(obj.clearedStage) && obj.clearedStage >= 0
      ? Math.floor(obj.clearedStage)
      : empty.clearedStage;
  const totalAttempts =
    isFiniteNumber(obj.totalAttempts) && obj.totalAttempts >= 0
      ? Math.floor(obj.totalAttempts)
      : empty.totalAttempts;
  const totalClears =
    isFiniteNumber(obj.totalClears) && obj.totalClears >= 0
      ? Math.floor(obj.totalClears)
      : empty.totalClears;
  const totalFails =
    isFiniteNumber(obj.totalFails) && obj.totalFails >= 0
      ? Math.floor(obj.totalFails)
      : empty.totalFails;
  const bestAbsErrorPx =
    isFiniteNumber(obj.bestAbsErrorPx) && obj.bestAbsErrorPx >= 0
      ? obj.bestAbsErrorPx
      : null;
  const lastImage =
    typeof obj.lastImage === "string" && obj.lastImage.startsWith("data:")
      ? obj.lastImage
      : null;
  const lifePt =
    isFiniteNumber(obj.lifePt) && obj.lifePt >= 0
      ? Math.min(LIFE_MAX_PT, obj.lifePt)
      : empty.lifePt;

  return {
    stage,
    clearedStage,
    totalAttempts,
    totalClears,
    totalFails,
    bestAbsErrorPx,
    lastImage,
    lifePt,
  };
}

/** ジャッジ結果 */
export type JudgeResult = {
  success: boolean;
  /** ライフ枯渇によるステージ降格 */
  lifeDepleted?: boolean;
  /** この落下後の残りライフ（pt） */
  lifeAfterPt?: number;
  /** 実測ズレ（符号付き px。実測X - 目標X） */
  deltaPx: number;
  /** 絶対誤差（px） */
  absErrorPx: number;
  /** 許容誤差（px） */
  tolerancePx: number;
  /** 理想停止タイミングとの時間差（ms、符号付き） */
  timeDeltaMs: number;
  /** ブロックが移動できた範囲（px）。確率計算の母数に使う */
  maxX: number;
};
