"use client";

// 「スクランブル解読アニメーション」のコアロジック。
//
// - 未確定の文字はランダムな記号（$%&#@!?* 等）が高速にシャッフルし続ける
// - 左から順に、設定された速度で1文字ずつ確定していく
// - 確定した文字には justLocked フラグを一瞬立て、呼び出し側で
//   「拡大→発光→元に戻る」バウンスアニメーションのトリガーに使う
// - 空白・改行はそもそも解読対象ではない（見た目上シャッフルしない）ため、
//   即座に確定済み扱いにしてリズムを損なわないようにする

import { useCallback, useEffect, useRef, useState } from "react";
import { FIXED_REVEAL_SPEED_MS } from "./types";

const SCRAMBLE_POOL = "$%&#@!?*";

export type ScrambleChar = {
  /** 現在表示中の文字（未確定ならランダム記号、確定なら本来の文字） */
  char: string;
  /** 確定済みか */
  locked: boolean;
  /** 確定した直後の一瞬だけ true（拡大・発光アニメーションのトリガー） */
  justLocked: boolean;
};

function isRevealTarget(ch: string): boolean {
  return !/\s/.test(ch);
}

function randomScrambleChar(): string {
  return SCRAMBLE_POOL[Math.floor(Math.random() * SCRAMBLE_POOL.length)];
}

type UseScrambleRevealOptions = {
  /** 1文字確定するたびに呼ばれる（効果音・振動用） */
  onCharLock?: () => void;
  /** 全文確定した瞬間に呼ばれる（ロック解除音・振動用） */
  onComplete?: () => void;
};

export function useScrambleReveal({
  onCharLock,
  onComplete,
}: UseScrambleRevealOptions = {}) {
  const [chars, setChars] = useState<ScrambleChar[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const targetRef = useRef("");
  const revealIndicesRef = useRef<number[]>([]);
  const pointerRef = useRef(0);
  const shuffleIntervalRef = useRef<number | null>(null);
  const lockTimeoutRef = useRef<number | null>(null);
  const justLockedTimeoutsRef = useRef<number[]>([]);
  // 最新のコールバックを ref で保持し、start() の再生成を避ける
  const callbacksRef = useRef({ onCharLock, onComplete });
  useEffect(() => {
    callbacksRef.current = { onCharLock, onComplete };
  });

  const stopTimers = useCallback(() => {
    if (shuffleIntervalRef.current !== null) {
      window.clearInterval(shuffleIntervalRef.current);
      shuffleIntervalRef.current = null;
    }
    if (lockTimeoutRef.current !== null) {
      window.clearTimeout(lockTimeoutRef.current);
      lockTimeoutRef.current = null;
    }
    for (const id of justLockedTimeoutsRef.current) window.clearTimeout(id);
    justLockedTimeoutsRef.current = [];
  }, []);

  useEffect(() => stopTimers, [stopTimers]);

  const reset = useCallback(() => {
    stopTimers();
    setChars([]);
    setIsRunning(false);
    targetRef.current = "";
    revealIndicesRef.current = [];
    pointerRef.current = 0;
  }, [stopTimers]);

  /** 指定テキストの解読アニメーションを開始する（速度は固定） */
  const start = useCallback(
    (target: string) => {
      stopTimers();
      targetRef.current = target;

      const indices: number[] = [];
      const initial: ScrambleChar[] = Array.from(target).map((ch, i) => {
        const reveal = isRevealTarget(ch);
        if (reveal) indices.push(i);
        return {
          char: reveal ? randomScrambleChar() : ch,
          locked: !reveal,
          justLocked: false,
        };
      });
      revealIndicesRef.current = indices;
      pointerRef.current = 0;
      setChars(initial);
      setIsRunning(indices.length > 0);

      if (indices.length === 0) {
        // 空白だけの場合などは即完了扱い
        callbacksRef.current.onComplete?.();
        return;
      }

      // シャッフルループ：未確定の文字だけランダム記号を回し続ける（約30ms間隔）
      shuffleIntervalRef.current = window.setInterval(() => {
        setChars((prev) =>
          prev.map((c) => (c.locked ? c : { ...c, char: randomScrambleChar() })),
        );
      }, 30);

      const speedMs = FIXED_REVEAL_SPEED_MS;

      const lockNext = () => {
        const idxList = revealIndicesRef.current;
        const p = pointerRef.current;

        if (p >= idxList.length) {
          if (shuffleIntervalRef.current !== null) {
            window.clearInterval(shuffleIntervalRef.current);
            shuffleIntervalRef.current = null;
          }
          setIsRunning(false);
          callbacksRef.current.onComplete?.();
          return;
        }

        const idx = idxList[p];
        pointerRef.current = p + 1;

        setChars((prev) => {
          const next = prev.slice();
          next[idx] = { char: targetRef.current[idx], locked: true, justLocked: true };
          return next;
        });
        callbacksRef.current.onCharLock?.();

        const flagTimeout = window.setTimeout(() => {
          setChars((prev) => {
            if (!prev[idx]?.justLocked) return prev;
            const next = prev.slice();
            next[idx] = { ...next[idx], justLocked: false };
            return next;
          });
        }, 260);
        justLockedTimeoutsRef.current.push(flagTimeout);

        lockTimeoutRef.current = window.setTimeout(lockNext, speedMs);
      };

      lockTimeoutRef.current = window.setTimeout(lockNext, speedMs);
    },
    [stopTimers],
  );

  /** 演出を飛ばして即座に全文確定させる（スキップボタン用） */
  const skip = useCallback(() => {
    const incomplete =
      pointerRef.current < revealIndicesRef.current.length &&
      targetRef.current.length > 0;
    stopTimers();
    const target = targetRef.current;
    if (!target) return;
    setChars(
      Array.from(target).map((ch) => ({
        char: ch,
        locked: true,
        justLocked: false,
      })),
    );
    pointerRef.current = revealIndicesRef.current.length;
    setIsRunning(false);
    // 途中スキップ時のみ完了コールバック（二重再生を防ぐ）
    if (incomplete) {
      callbacksRef.current.onComplete?.();
    }
  }, [stopTimers]);

  return { chars, isRunning, start, skip, reset };
}
