"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { computeSpin, type SpinResult } from "./probability";
import { BATCH_STOP_DELAY_MS, type SlotSettings } from "./types";

export type SlotPhase = "idle" | "spinning" | "stopping";

/**
 * スロットの演算エンジン。
 * 結果は spin() 呼び出し時点で Math.random() により確定する（目押し不可）。
 * STOP は「いつ表示を確定させるか」だけを制御する視覚演出。
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
  const onSettledRef = useRef(onSettled);
  onSettledRef.current = onSettled;

  const clearAllTimers = useCallback(() => {
    flickerIdsRef.current.forEach((id) => {
      if (id !== null) window.clearInterval(id);
    });
    flickerIdsRef.current = [];
    timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutIdsRef.current = [];
  }, []);

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

  const startFlicker = useCallback(
    (reelIndex: number, itemCount: number) => {
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
    },
    [],
  );

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

  /** 個別ストップ：指定リールだけ確定表示へ */
  const stopReel = useCallback(
    (reelIndex: number) => {
      if (phase !== "spinning" && phase !== "stopping") return;
      setPhase("stopping");
      stopOneReel(reelIndex);
    },
    [phase, stopOneReel],
  );

  /** 一括順次ストップ：左からディレイ付きで停止 */
  const stopAllSequential = useCallback(() => {
    if (!settings || phase !== "spinning") return;
    if (!pendingRef.current) return;

    setPhase("stopping");
    const count = settings.reelCount;

    for (let i = 0; i < count; i++) {
      const delay = i * BATCH_STOP_DELAY_MS;
      const t = window.setTimeout(() => {
        stopOneReel(i);
      }, delay);
      timeoutIdsRef.current.push(t);
    }
  }, [settings, phase, stopOneReel]);

  const anySpinning = reelSpinning.some(Boolean);
  const canSpin = phase === "idle";
  const canStop = phase === "spinning";

  return {
    phase,
    displayIndices,
    reelSpinning,
    anySpinning,
    canSpin,
    canStop,
    spin,
    stopReel,
    stopAllSequential,
  };
}
