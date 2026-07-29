"use client";

// Web Audio API を使った効果音（外部音声ファイル一切不要・オシレーターで生成）。
// 「タイピングハッキング演出」の聴覚フィードバックを担当する。
//
// - シャッフル中の「チチチチ…」ノイズ（控えめ・間引き再生）
// - 1文字確定時の「カチッ」という高音クリック
// - 全文解読完了時の「ピキーン！」というロック解除音
//
// ブラウザの自動再生制限があるため、AudioContext はユーザー操作（ボタン押下）
// の呼び出しスタック内で初めて生成・resume する想定。

import { useCallback, useEffect, useRef } from "react";

type AudioCtx = AudioContext;

function createNoiseBuffer(ctx: AudioCtx): AudioBuffer {
  const durationSec = 0.04;
  const length = Math.floor(ctx.sampleRate * durationSec);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    // 端を少しフェードしてクリックノイズを抑える
    const envelope = Math.min(i / 40, (length - i) / 40, 1);
    data[i] = (Math.random() * 2 - 1) * envelope;
  }
  return buffer;
}

export function useCryptoAudio(muted = false) {
  const ctxRef = useRef<AudioCtx | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);
  const mutedRef = useRef(muted);
  const lastShuffleAtRef = useRef(0);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    };
  }, []);

  /** ユーザー操作（クリック等）の中で最初に呼び、AudioContext を用意する */
  const ensureContext = useCallback((): AudioCtx | null => {
    if (typeof window === "undefined") return null;
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!ctxRef.current) {
      ctxRef.current = new AudioContextClass();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume().catch(() => {});
    }
    if (!noiseBufferRef.current) {
      noiseBufferRef.current = createNoiseBuffer(ctxRef.current);
    }
    return ctxRef.current;
  }, []);

  /** シャッフル中の静かな「チチチチ…」ノイズ（約90ms間隔に間引き） */
  const playShuffleTick = useCallback(() => {
    if (mutedRef.current) return;
    const nowMs = performance.now();
    if (nowMs - lastShuffleAtRef.current < 90) return;
    lastShuffleAtRef.current = nowMs;

    const ctx = ensureContext();
    const buffer = noiseBufferRef.current;
    if (!ctx || !buffer) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = 2.8 + Math.random() * 0.9;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 2800 + Math.random() * 1200;
    bandpass.Q.value = 8;

    const gain = ctx.createGain();
    const now = ctx.currentTime;
    // シャッフルは背景ノイズなのでかなり控えめに
    gain.gain.setValueAtTime(0.028, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    source.connect(bandpass).connect(gain).connect(ctx.destination);
    source.start(now);
    source.stop(now + 0.04);
  }, [ensureContext]);

  /** 1文字確定時の小気味よい「カチッ」音 */
  const playLockTick = useCallback(() => {
    if (mutedRef.current) return;
    const ctx = ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = 1750 + Math.random() * 220;

    const gain = ctx.createGain();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }, [ensureContext]);

  /** 全文解読完了時の爽快な「ピキーン！」ロック解除音 */
  const playUnlockChime = useCallback(() => {
    if (mutedRef.current) return;
    const ctx = ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // メイン：上昇スイープ
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(1680, now + 0.28);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.13, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.62);

    // 倍音レイヤー：きらめき
    const osc2 = ctx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(1240, now + 0.04);
    osc2.frequency.exponentialRampToValueAtTime(2680, now + 0.3);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.0001, now);
    gain2.gain.exponentialRampToValueAtTime(0.055, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    // 最後のキラッ（短い高音）
    const sparkle = ctx.createOscillator();
    sparkle.type = "sine";
    sparkle.frequency.value = 3200;
    const sparkleGain = ctx.createGain();
    sparkleGain.gain.setValueAtTime(0.0001, now + 0.28);
    sparkleGain.gain.exponentialRampToValueAtTime(0.05, now + 0.3);
    sparkleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);

    osc.connect(gain).connect(ctx.destination);
    osc2.connect(gain2).connect(ctx.destination);
    sparkle.connect(sparkleGain).connect(ctx.destination);
    osc.start(now);
    osc2.start(now);
    sparkle.start(now + 0.28);
    osc.stop(now + 0.65);
    osc2.stop(now + 0.6);
    sparkle.stop(now + 0.5);
  }, [ensureContext]);

  /** 復号失敗時の低い「ブブー」エラー音 */
  const playErrorBuzz = useCallback(() => {
    if (mutedRef.current) return;
    const ctx = ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(85, now + 0.28);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 600;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(filter).connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);
  }, [ensureContext]);

  /**
   * ユーザー操作の同期処理内（await の前）で呼び、AudioContext を
   * 生成・resume しておく。ブラウザの自動再生制限の回避用。
   */
  const primeAudio = useCallback(() => {
    ensureContext();
  }, [ensureContext]);

  return {
    playShuffleTick,
    playLockTick,
    playUnlockChime,
    playErrorBuzz,
    primeAudio,
  };
}

/** モバイル端末向け触覚フィードバック（非対応環境では何もしない） */
export function vibrateCharLock(): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate?.(8);
  }
}

export function vibrateComplete(): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate?.([25, 40, 25]);
  }
}
