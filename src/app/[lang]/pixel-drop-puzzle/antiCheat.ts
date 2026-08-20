// 不正操作（オートクリッカー／マクロ）検知
// UIにはルールとして書かず、検知時のみロックダウン演出を出す。

export const ANTI_CHEAT_MIN_INTERVAL_MS = 50;
/** 同一座標がこの回数連続したらマクロ判定 */
export const ANTI_CHEAT_SAME_COORD_STREAK = 3;
/** ロックダウン時間（ms） */
export const ANTI_CHEAT_LOCKDOWN_MS = 3500;

export type PointerSample = {
  x: number;
  y: number;
  t: number;
};

export type AntiCheatVerdict =
  | { ok: true }
  | { ok: false; reason: "untrusted" | "same_coord" | "too_fast" };

/**
 * ポインタ入力を評価する。
 * history は呼び出し側で保持し、ok のときだけ push する想定。
 */
export function evaluatePointerAntiCheat(
  sample: PointerSample,
  history: readonly PointerSample[],
  isTrusted: boolean,
): AntiCheatVerdict {
  if (!isTrusted) return { ok: false, reason: "untrusted" };

  const last = history.length > 0 ? history[history.length - 1] : null;
  if (last && sample.t - last.t <= ANTI_CHEAT_MIN_INTERVAL_MS) {
    return { ok: false, reason: "too_fast" };
  }

  let streak = 1;
  for (let i = history.length - 1; i >= 0; i -= 1) {
    const h = history[i];
    if (h.x === sample.x && h.y === sample.y) {
      streak += 1;
      if (streak >= ANTI_CHEAT_SAME_COORD_STREAK) {
        return { ok: false, reason: "same_coord" };
      }
    } else {
      break;
    }
  }

  return { ok: true };
}

/** キーボード DROP 用（座標なし）。信頼性と連打だけ見る */
export function evaluateKeyAntiCheat(
  nowMs: number,
  lastKeyMs: number | null,
  isTrusted: boolean,
): AntiCheatVerdict {
  if (!isTrusted) return { ok: false, reason: "untrusted" };
  if (
    lastKeyMs !== null &&
    nowMs - lastKeyMs <= ANTI_CHEAT_MIN_INTERVAL_MS
  ) {
    return { ok: false, reason: "too_fast" };
  }
  return { ok: true };
}

/** 履歴を末尾に追加し、長さを抑える */
export function pushPointerSample(
  history: PointerSample[],
  sample: PointerSample,
  maxLen = 12,
): void {
  history.push(sample);
  if (history.length > maxLen) {
    history.splice(0, history.length - maxLen);
  }
}
