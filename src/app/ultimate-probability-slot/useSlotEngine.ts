"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { computeSpin, type SpinResult } from "./probability";
import {
  BATCH_STOP_DELAY_MS,
  BATCH_STOP_TEASE_STEP_MS,
  JACKPOT_INDEX,
  type SlotSettings,
} from "./types";

export type SlotPhase = "idle" | "spinning" | "stopping" | "reach";

/** 最終リール以外がすべて JACKPOT → リーチ状態 */
export function isJackpotReach(indices: number[], reelCount: number): boolean {
  if (reelCount < 2) return false;
  return indices.slice(0, reelCount - 1).every((i) => i === JACKPOT_INDEX);
}

/**
 * 停止予定リールより手前がすべてジャックポットなら、その連続本数を返す。
 * 途中でハズレがあれば 0（焦らしなし・通常ディレイへ戻す）。
 */
export function jackpotStreakBefore(
  indices: number[],
  reelIndex: number,
): number {
  if (reelIndex <= 0) return 0;
  for (let j = 0; j < reelIndex; j++) {
    if (indices[j] !== JACKPOT_INDEX) return 0;
  }
  return reelIndex;
}

/** 次に止めるリールまでの待機時間（焦らしディレイ込み） */
export function stopDelayBeforeReel(
  indices: number[],
  reelIndex: number,
): number {
  if (reelIndex <= 0) return 0;
  const streak = jackpotStreakBefore(indices, reelIndex);
  if (streak <= 0) return BATCH_STOP_DELAY_MS;
  return BATCH_STOP_DELAY_MS + streak * BATCH_STOP_TEASE_STEP_MS;
}

/**
 * スロットの演算エンジン。
 * 結果は spin() 呼び出し時点で Math.random() により確定する（目押し不可）。
 * STOP は「いつ表示を確定させるか」だけを制御する視覚演出。
 * ジャックポットリーチ時は自動停止を中断し、最終リールのみ手動停止。
 */
export function useSlotEngine(
  settings: SlotSettings | null,
  onSettled: (result: SpinResult) => void,
) {
  const [phase, setPhase] = useState<SlotPhase>("idle");
  const [displayIndices, setDisplayIndices] = useState<number[]>([]);
  /** 各リールがまだ回転中か */
  const [reelSpinning, setReelSpinning] = useState<boolean[]>([]);
  const flickerIdsRef = useRef<(number | null)[]>([]);
  const timeoutIdsRef = useRef<number[]>([]);
  const pendingRef = useRef<SpinResult | null>(null);
  const settledRef = useRef(false);
  const phaseRef = useRef<SlotPhase>("idle");
  const onSettledRef = useRef(onSettled);
  onSettledRef.current = onSettled;
  phaseRef.current = phase;

  const clearTimeoutsOnly = useCallback(() => {
    timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutIdsRef.current = [];
  }, []);

  const clearAllTimers = useCallback(() => {
    flickerIdsRef.current.forEach((id) => {
      if (id !== null) window.clearInterval(id);
    });
    flickerIdsRef.current = [];
    clearTimeoutsOnly();
  }, [clearTimeoutsOnly]);

  // リール構成（本数・絵柄数）が変わったときだけ表示を組み直す。
  // STOP 後の結果表示が、設定オブジェクトの再生成で初期状態に戻らないようにする。
  const layoutKey = settings
    ? `${settings.reelCount}:${settings.symbols?.length ?? 0}`
    : "";
  // 初回は空にして、マウント時に必ずレイアウト初期化が走るようにする
  const layoutKeyRef = useRef("");

  useEffect(() => {
    if (!settings) return;
    const count = Math.max(0, settings.reelCount ?? 0);
    const symbolCount = Math.max(0, settings.symbols?.length ?? 0);
    const layoutChanged = layoutKeyRef.current !== layoutKey;
    layoutKeyRef.current = layoutKey;

    if (layoutChanged) {
      clearAllTimers();
      pendingRef.current = null;
      settledRef.current = false;
      setPhase("idle");
      setDisplayIndices(Array.from({ length: count }, () => 0));
      setReelSpinning(Array.from({ length: count }, () => false));
      return;
    }

    // 構成は同じ：長さだけ合わせて、確定済みの絵柄インデックスは維持する
    setDisplayIndices((prev) => {
      if (prev.length === count) {
        return prev.map((idx) =>
          symbolCount > 0 ? Math.min(idx, symbolCount - 1) : 0,
        );
      }
      return Array.from({ length: count }, (_, i) => prev[i] ?? 0);
    });
    setReelSpinning((prev) => {
      if (prev.length === count) return prev;
      return Array.from({ length: count }, (_, i) => prev[i] ?? false);
    });
  }, [settings, layoutKey, clearAllTimers]);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  const startFlicker = useCallback((reelIndex: number, itemCount: number) => {
    const existing = flickerIdsRef.current[reelIndex];
    if (existing !== null && existing !== undefined) {
      window.clearInterval(existing);
    }
    const id = window.setInterval(() => {
      setDisplayIndices((prev) => {
        const next = [...prev];
        next[reelIndex] = Math.floor(Math.random() * itemCount);
        return next;
      });
    }, 40);
    flickerIdsRef.current[reelIndex] = id;
  }, []);

  const finishIfAllStopped = useCallback(
    (spinningFlags: boolean[], result: SpinResult) => {
      if (settledRef.current) return;
      if (spinningFlags.some(Boolean)) return;
      settledRef.current = true;
      pendingRef.current = null;
      setPhase("idle");
      const t = window.setTimeout(() => {
        onSettledRef.current(result);
      }, 80);
      timeoutIdsRef.current.push(t);
    },
    [],
  );

  const stopOneReel = useCallback(
    (reelIndex: number) => {
      const result = pendingRef.current;
      if (!result) return;

      const flickerId = flickerIdsRef.current[reelIndex];
      if (flickerId !== null && flickerId !== undefined) {
        window.clearInterval(flickerId);
        flickerIdsRef.current[reelIndex] = null;
      }

      setDisplayIndices((prev) => {
        const next = [...prev];
        next[reelIndex] = result.indices[reelIndex];
        return next;
      });

      setReelSpinning((prev) => {
        if (!prev[reelIndex]) return prev;
        const next = [...prev];
        next[reelIndex] = false;
        finishIfAllStopped(next, result);
        return next;
      });
    },
    [finishIfAllStopped],
  );

  /**
   * 左から1本ずつ停止を予約。最終リール直前でジャックポットリーチなら自動停止を中断。
   * 再帰スケジュールなので、途中でタイマーを破棄してポーズできる。
   */
  const scheduleStopAtRef = useRef<(reelIndex: number) => void>(() => {});

  scheduleStopAtRef.current = (reelIndex: number) => {
    const result = pendingRef.current;
    const count = settings?.reelCount ?? 0;
    if (!result || count <= 0) return;
    if (reelIndex >= count) return;

    // 最終リール：リーチなら手動停止待ちへ
    if (reelIndex === count - 1 && isJackpotReach(result.indices, count)) {
      clearTimeoutsOnly();
      setPhase("reach");
      return;
    }

    const delay = stopDelayBeforeReel(result.indices, reelIndex);
    const t = window.setTimeout(() => {
      stopOneReel(reelIndex);
      if (reelIndex + 1 < count) {
        scheduleStopAtRef.current(reelIndex + 1);
      }
    }, delay);
    timeoutIdsRef.current.push(t);
  };

  const spin = useCallback(() => {
    if (!settings || phase !== "idle") return;
    const reelCount = settings.reelCount ?? 0;
    const symbols = settings.symbols;
    if (reelCount <= 0 || !Array.isArray(symbols) || symbols.length === 0) return;

    const result = computeSpin(settings);
    pendingRef.current = result;
    settledRef.current = false;
    clearAllTimers();

    const itemCount = Math.max(symbols.length, 1);
    flickerIdsRef.current = Array.from({ length: reelCount }, () => null);

    for (let i = 0; i < reelCount; i++) {
      startFlicker(i, itemCount);
    }

    setReelSpinning(Array.from({ length: reelCount }, () => true));
    setPhase("spinning");
  }, [settings, phase, clearAllTimers, startFlicker]);

  /** 一括順次ストップ：左からディレイ付きで停止（リーチ時は最終で一時停止） */
  const stopAllSequential = useCallback(() => {
    if (!settings || phase !== "spinning") return;
    if (!pendingRef.current) return;

    setPhase("stopping");
    scheduleStopAtRef.current(0);
  }, [settings, phase]);

  /** リーチ時：最終リールだけ手動で確定 */
  const manualStopLast = useCallback(() => {
    if (!settings || phase !== "reach") return;
    if (!pendingRef.current) return;
    setPhase("stopping");
    stopOneReel(settings.reelCount - 1);
  }, [settings, phase, stopOneReel]);

  const anySpinning = reelSpinning.some(Boolean);
  const canSpin = phase === "idle";
  const canStop = phase === "spinning";
  const canManualStop = phase === "reach";
  const isReach = phase === "reach";

  return {
    phase,
    displayIndices,
    reelSpinning,
    anySpinning,
    canSpin,
    canStop,
    canManualStop,
    isReach,
    spin,
    stopAllSequential,
    manualStopLast,
  };
}
