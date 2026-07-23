"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  computeOptimalReelLayout,
  REEL_LAYOUT_GAP_PX,
  type ReelLayoutPlan,
} from "./reelLayout";
import { JACKPOT_INDEX, type SlotItem } from "./types";

function ItemView({ item }: { item: SlotItem | undefined }) {
  if (!item) return <span className="text-zinc-600">?</span>;
  if (item.type === "image") {
    if (!item.value) return <span className="text-zinc-600">?</span>;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.value}
        alt=""
        className="slot-reel__image"
        draggable={false}
      />
    );
  }
  return (
    <span className="slot-reel__glyph select-none leading-none">{item.value}</span>
  );
}

function ReelCell({
  index,
  symbols,
  displayIndices,
  reelSpinning,
  isReach,
  reachTone,
  reelCount,
}: {
  index: number;
  symbols: SlotItem[];
  displayIndices: number[];
  reelSpinning: boolean[];
  isReach: boolean;
  reachTone: "chance" | "pinch";
  reelCount: number;
}) {
  const idx = displayIndices[index] ?? 0;
  const item = symbols[idx];
  const spinning = Boolean(reelSpinning[index]);
  const isJackpotFace = !spinning && idx === JACKPOT_INDEX;
  const isLastReel = index === reelCount - 1;
  const isReachReel = isReach && isLastReel && spinning;

  return (
    <div className="slot-reel-col">
      <div className="slot-reel-stage">
        <div
          className={`slot-reel ${spinning ? "slot-reel--spinning" : ""} ${
            isJackpotFace ? "slot-reel--jackpot" : ""
          } ${
            isReachReel
              ? `slot-reel--reach slot-reel--reach-${reachTone}`
              : ""
          }`}
        >
          <span className="slot-reel__glow" aria-hidden />
          <div className="slot-reel__content">
            <ItemView item={item} />
          </div>
        </div>
      </div>
    </div>
  );
}

const FALLBACK_LAYOUT: ReelLayoutPlan = {
  rows: 1,
  topCount: 3,
  bottomCount: 0,
  reelSize: 96,
};

/**
 * リール本体。
 * コンテナサイズを ResizeObserver で監視し、1行/2行のうち
 * リール面積が最大になる配置を自動選択する。
 * 停止順（Z順）は index 0 から左上→右下で固定。
 */
export default function SlotMachine({
  symbols,
  reelCount,
  displayIndices,
  reelSpinning,
  isReach = false,
  reachTone = "chance",
}: {
  symbols: SlotItem[];
  reelCount: number;
  displayIndices: number[];
  reelSpinning: boolean[];
  isReach?: boolean;
  /** 当たるまで＝chance、外し続ける＝pinch */
  reachTone?: "chance" | "pinch";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<ReelLayoutPlan>(() => ({
    ...FALLBACK_LAYOUT,
    topCount: reelCount,
  }));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setLayout(
        computeOptimalReelLayout(
          rect.width,
          rect.height,
          reelCount,
          REEL_LAYOUT_GAP_PX,
        ),
      );
    };

    update();
    const observer = new ResizeObserver(() => {
      update();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [reelCount]);

  const size = Math.max(0, Math.floor(layout.reelSize * 100) / 100);
  const gridStyle: CSSProperties = {
    ["--reel-size" as string]: `${size}px`,
    ["--reel-gap" as string]: `${REEL_LAYOUT_GAP_PX}px`,
  };

  const topIndices = Array.from({ length: layout.topCount }, (_, i) => i);
  const bottomIndices =
    layout.rows === 2
      ? Array.from(
          { length: layout.bottomCount },
          (_, i) => layout.topCount + i,
        )
      : [];

  return (
    <div
      ref={containerRef}
      className={`slot-machine-grid ${
        layout.rows === 2 ? "slot-machine-grid--rows-2" : "slot-machine-grid--rows-1"
      }`}
      style={gridStyle}
    >
      <div className="slot-machine-row">
        {topIndices.map((i) => (
          <ReelCell
            key={i}
            index={i}
            symbols={symbols}
            displayIndices={displayIndices}
            reelSpinning={reelSpinning}
            isReach={isReach}
            reachTone={reachTone}
            reelCount={reelCount}
          />
        ))}
      </div>
      {layout.rows === 2 ? (
        <div className="slot-machine-row">
          {bottomIndices.map((i) => (
            <ReelCell
              key={i}
              index={i}
              symbols={symbols}
              displayIndices={displayIndices}
              reelSpinning={reelSpinning}
              isReach={isReach}
              reachTone={reachTone}
              reelCount={reelCount}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
