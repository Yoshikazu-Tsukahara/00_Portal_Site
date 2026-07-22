"use client";

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

/** リール本体：淡々としたフラッシュで演算の冷たさを表現。絵柄は枠いっぱいに大きく表示。 */
export default function SlotMachine({
  symbols,
  reelCount,
  displayIndices,
  reelSpinning,
  stopMode,
  stopLabel,
  onStopReel,
}: {
  symbols: SlotItem[];
  reelCount: number;
  displayIndices: number[];
  reelSpinning: boolean[];
  stopMode: "individual" | "batch";
  stopLabel: string;
  onStopReel: (index: number) => void;
}) {
  return (
    <div
      className="slot-machine-grid grid min-h-0 flex-1 gap-2 sm:gap-3"
      style={{ gridTemplateColumns: `repeat(${reelCount}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: reelCount }, (_, i) => {
        const idx = displayIndices[i] ?? 0;
        const item = symbols[idx];
        const spinning = Boolean(reelSpinning[i]);
        const isJackpotFace = !spinning && idx === JACKPOT_INDEX;
        return (
          <div key={i} className="slot-reel-col">
            <div
              className={`slot-reel ${spinning ? "slot-reel--spinning" : ""} ${
                isJackpotFace ? "slot-reel--jackpot" : ""
              }`}
            >
              <span className="slot-reel__glow" aria-hidden />
              <ItemView item={item} />
              {isJackpotFace ? (
                <span
                  aria-hidden
                  className="absolute right-1.5 top-1.5 text-[10px] leading-none text-amber-400 sm:text-xs"
                >
                  ★
                </span>
              ) : null}
            </div>
            {stopMode === "individual" ? (
              <button
                type="button"
                onClick={() => onStopReel(i)}
                disabled={!spinning}
                className="slot-stop-btn"
              >
                {stopLabel}
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
