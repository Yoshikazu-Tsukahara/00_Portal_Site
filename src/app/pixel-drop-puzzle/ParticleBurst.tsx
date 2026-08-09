"use client";

import { useEffect, useMemo, useRef } from "react";

/** 縦長の棒向けに列少なめ・行多めの格子 */
const COLS = 6;
const ROWS = 18;
/** CSS `.pxd-particle--run` の duration と揃える */
const PARTICLE_FLY_MS = 720;
/** buildParticles の delay 上限目安 */
const PARTICLE_MAX_DELAY_MS = 160;

type Particle = {
  key: string;
  col: number;
  row: number;
  dx: number;
  dy: number;
  rot: number;
  delayMs: number;
};

/** 格子状の飛散パラメータを生成する */
function buildParticles(): Particle[] {
  const list: Particle[] = [];
  const cx = COLS / 2;
  const cy = ROWS / 2;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const distFromCenter = Math.hypot(col - cx, row - cy);
      const angle = Math.random() * Math.PI * 2;
      const power = 22 + Math.random() * 70;
      list.push({
        key: `${row}-${col}`,
        col,
        row,
        dx: Math.cos(angle) * power,
        dy: Math.sin(angle) * power - 18,
        rot: (Math.random() - 0.5) * 420,
        delayMs: distFromCenter * 10 + Math.random() * 50,
      });
    }
  }
  return list;
}

/**
 * 失敗時：縦長の棒をピクセル粒子に分解して飛散させる。
 * background-image ではなく img + overflow で切り出し、初回デコードでも見えやすくする。
 */
export default function ParticleBurst({
  imageDataUrl,
  bgWidth,
  bgHeight,
  bgOffsetX,
  left,
  top,
  width,
  height,
  onComplete,
}: {
  imageDataUrl: string;
  bgWidth: number;
  bgHeight: number;
  bgOffsetX: number;
  left: number;
  top: number;
  width: number;
  height: number;
  onComplete?: () => void;
}) {
  const particles = useMemo<Particle[]>(() => buildParticles(), []);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const doneRef = useRef(false);

  useEffect(() => {
    doneRef.current = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wait = reduced ? 140 : PARTICLE_FLY_MS + PARTICLE_MAX_DELAY_MS;
    const timer = window.setTimeout(() => {
      if (doneRef.current) return;
      doneRef.current = true;
      onCompleteRef.current?.();
    }, wait);
    return () => window.clearTimeout(timer);
  }, []);

  const cellW = width / COLS;
  const cellH = height / ROWS;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-10"
      style={{ left, top, width, height }}
    >
      {particles.map((p) => (
        <div
          key={p.key}
          className="pxd-particle pxd-particle--run absolute overflow-hidden"
          style={{
            left: p.col * cellW,
            top: p.row * cellH,
            width: cellW + 0.5,
            height: cellH + 0.5,
            animationDelay: `${p.delayMs}ms`,
            // @ts-expect-error CSSカスタムプロパティ
            "--pxd-dx": `${p.dx}px`,
            "--pxd-dy": `${p.dy}px`,
            "--pxd-rot": `${p.rot}deg`,
          }}
        >
          {/* background-image だと初回デコード前にアニメが終わり「消えた」ように見える */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageDataUrl}
            alt=""
            draggable={false}
            style={{
              position: "absolute",
              width: bgWidth,
              height: bgHeight,
              maxWidth: "none",
              left: -(bgOffsetX + p.col * cellW),
              top: -(p.row * cellH),
              pointerEvents: "none",
            }}
          />
        </div>
      ))}
    </div>
  );
}
