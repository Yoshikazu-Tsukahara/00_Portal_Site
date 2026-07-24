"use client";

import { useMemo } from "react";

/** 縦長の棒向けに列少なめ・行多めの格子 */
const COLS = 6;
const ROWS = 18;

type Particle = {
  key: string;
  col: number;
  row: number;
  dx: number;
  dy: number;
  rot: number;
  delayMs: number;
};

/** 格子状の飛散パラメータを生成する（コンポーネント外の純粋関数として分離） */
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
 * 失敗時：縦長の棒をピクセル粒子に分解して「サーッ」と消滅させる。
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
}: {
  imageDataUrl: string;
  bgWidth: number;
  bgHeight: number;
  bgOffsetX: number;
  left: number;
  top: number;
  width: number;
  height: number;
}) {
  const particles = useMemo<Particle[]>(() => buildParticles(), []);

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
          className="pxd-particle absolute"
          style={{
            left: p.col * cellW,
            top: p.row * cellH,
            width: cellW + 0.5,
            height: cellH + 0.5,
            backgroundImage: `url(${imageDataUrl})`,
            backgroundSize: `${bgWidth}px ${bgHeight}px`,
            backgroundPosition: `${-(bgOffsetX + p.col * cellW)}px ${-(p.row * cellH)}px`,
            backgroundRepeat: "no-repeat",
            animationDelay: `${p.delayMs}ms`,
            // @ts-expect-error CSSカスタムプロパティ
            "--pxd-dx": `${p.dx}px`,
            "--pxd-dy": `${p.dy}px`,
            "--pxd-rot": `${p.rot}deg`,
          }}
        />
      ))}
    </div>
  );
}
