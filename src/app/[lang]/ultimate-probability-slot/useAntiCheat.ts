"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";

/** 同一座標の連続クリック回数（これ以上でマクロ判定） */
const SAME_COORD_STREAK_LIMIT = 3;
/** 人間には不可能な連打間隔（ms） */
const MIN_CLICK_INTERVAL_MS = 50;
/** ロックダウン時間（ms） */
export const ANTI_CHEAT_LOCKDOWN_MS = 5000;

type ClickSample = {
  t: number;
  x: number;
  y: number;
};

/**
 * オートクリッカー等の不正入力を検知し、一時ロックする。
 * - isTrusted === false → スクリプト発火
 * - 完全同一座標の連続クリック → 座標固定マクロ
 * - 50ms以下の連打 → 物理的に不可能な速度
 */
export function useAntiCheat() {
  const [lockedUntil, setLockedUntil] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const lastClickRef = useRef<ClickSample | null>(null);
  const sameStreakRef = useRef(0);

  const locked = remainingMs > 0;

  useEffect(() => {
    if (lockedUntil <= 0) {
      setRemainingMs(0);
      return;
    }

    function tick() {
      const left = Math.max(0, lockedUntil - Date.now());
      setRemainingMs(left);
      if (left <= 0) {
        setLockedUntil(0);
        // ロック解除後は連続判定をリセット（誤検知連鎖を防ぐ）
        lastClickRef.current = null;
        sameStreakRef.current = 0;
      }
    }

    tick();
    const id = window.setInterval(tick, 100);
    return () => window.clearInterval(id);
  }, [lockedUntil]);

  const triggerLockdown = useCallback(() => {
    lastClickRef.current = null;
    sameStreakRef.current = 0;
    setLockedUntil(Date.now() + ANTI_CHEAT_LOCKDOWN_MS);
    setRemainingMs(ANTI_CHEAT_LOCKDOWN_MS);
  }, []);

  /**
   * クリック／タップを検査する。
   * @returns true = 正当な操作として続行可 / false = 不正（ロック発動済み）
   */
  const inspectPointer = useCallback(
    (e: { isTrusted: boolean; clientX: number; clientY: number }) => {
      if (Date.now() < lockedUntil) return false;

      // ① スクリプト実行検知
      if (!e.isTrusted) {
        triggerLockdown();
        return false;
      }

      const t = Date.now();
      // サブピクセル差を無視し、整数座標で比較
      const x = Math.round(e.clientX);
      const y = Math.round(e.clientY);
      const prev = lastClickRef.current;

      if (prev) {
        // ③ 異常連打検知
        if (t - prev.t <= MIN_CLICK_INTERVAL_MS) {
          triggerLockdown();
          return false;
        }

        // ② 座標固定ツール検知
        if (prev.x === x && prev.y === y) {
          sameStreakRef.current += 1;
          if (sameStreakRef.current >= SAME_COORD_STREAK_LIMIT) {
            triggerLockdown();
            return false;
          }
        } else {
          sameStreakRef.current = 1;
        }
      } else {
        sameStreakRef.current = 1;
      }

      lastClickRef.current = { t, x, y };
      return true;
    },
    [lockedUntil, triggerLockdown],
  );

  /** 正当なら handler を実行するクリックラッパー */
  const guardClick = useCallback(
    (handler: () => void) => {
      return (e: MouseEvent | PointerEvent) => {
        if (!inspectPointer(e)) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        handler();
      };
    },
    [inspectPointer],
  );

  const remainingSec = Math.ceil(remainingMs / 1000);

  return {
    locked,
    remainingMs,
    remainingSec,
    guardClick,
    inspectPointer,
    triggerLockdown,
  };
}
