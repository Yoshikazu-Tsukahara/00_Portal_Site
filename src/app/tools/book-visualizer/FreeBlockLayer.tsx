"use client";

import { useState } from "react";

import { useI18n } from "@/i18n";
import FreeImage from "./FreeImage";
import FreeTextBox from "./FreeTextBox";
import { splitFreeBlocksByBodyPlane } from "./layers";
import type { PageMetrics } from "./metrics";
import type { SnapGuide } from "./snap";
import {
  isFreeBlock,
  type Block,
  type FreeFrame,
} from "./types";

type FreePlane = "under" | "over" | "both";

type FreeBlockLayerProps = {
  blocks: Block[];
  metrics: PageMetrics;
  scale?: number;
  interactive?: boolean;
  selectedBlockId?: string | null;
  imageAlt?: string;
  /** 描画する面。本文の前後に分けて差し込むときに使う */
  plane?: FreePlane;
  onSelectBlock?: (id: string | null) => void;
  onChangeFreeFrame?: (id: string, frame: FreeFrame) => void;
  onChangeText?: (id: string, text: string) => void;
  onTextEditEnd?: () => void;
  /** スナップガイドを親へ伝える（親が描画する場合） */
  onGuidesChange?: (guides: SnapGuide[]) => void;
};

/**
 * 自由配置（画像・テキストボックス）を本文プレーンの前後に分けて描画する。
 * zIndex < 0 → 本文の下、zIndex >= 0 → 本文の上。
 */
export default function FreeBlockLayer({
  blocks,
  metrics,
  scale = 1,
  interactive = false,
  selectedBlockId = null,
  imageAlt = "",
  plane = "both",
  onSelectBlock,
  onChangeFreeFrame,
  onChangeText,
  onTextEditEnd,
  onGuidesChange,
}: FreeBlockLayerProps) {
  const { t } = useI18n();
  const copy = t.apps.bookVisualizer;
  const [localGuides, setLocalGuides] = useState<SnapGuide[]>([]);
  const setGuides = onGuidesChange ?? setLocalGuides;

  const freeBlocks = blocks.filter(isFreeBlock);
  const { under, over } = splitFreeBlocksByBodyPlane(freeBlocks);

  if (freeBlocks.length === 0) return null;
  if (plane === "under" && under.length === 0) return null;
  if (plane === "over" && over.length === 0) return null;

  /** 吸着用：同じ用紙上の他オブジェクト枠（自分は除く） */
  function peerFramesFor(blockId: string): FreeFrame[] {
    return freeBlocks
      .filter((block) => block.id !== blockId)
      .map((block) => block.frame);
  }

  function renderBlocks(
    list: typeof freeBlocks,
    target: "under" | "over",
  ) {
    if (list.length === 0) return null;
    return (
      <div
        className={`bv-free-layer bv-free-layer--${target}`}
        aria-hidden={false}
      >
        {list.map((block) =>
          block.type === "image" ? (
            <FreeImage
              key={block.id}
              block={block}
              sheetWidth={metrics.width}
              sheetHeight={metrics.height}
              scale={scale}
              interactive={interactive}
              selected={selectedBlockId === block.id}
              alt={block.caption || imageAlt}
              peerFrames={peerFramesFor(block.id)}
              onSelect={() => onSelectBlock?.(block.id)}
              onChangeFrame={(frame) => onChangeFreeFrame?.(block.id, frame)}
              onGuidesChange={interactive ? setGuides : undefined}
            />
          ) : (
            <FreeTextBox
              key={block.id}
              block={block}
              sheetWidth={metrics.width}
              sheetHeight={metrics.height}
              scale={scale}
              interactive={interactive}
              selected={selectedBlockId === block.id}
              placeholder={copy.edit.freeTextPlaceholder}
              dragHint={copy.edit.block.freeTextDragHint}
              peerFrames={peerFramesFor(block.id)}
              onSelect={() => onSelectBlock?.(block.id)}
              onChangeFrame={(frame) => onChangeFreeFrame?.(block.id, frame)}
              onChangeText={(text) => onChangeText?.(block.id, text)}
              onGuidesChange={interactive ? setGuides : undefined}
              onEditEnd={onTextEditEnd}
            />
          ),
        )}
      </div>
    );
  }

  const showUnder = plane === "both" || plane === "under";
  const showOver = plane === "both" || plane === "over";
  // ガイドは over 側（または both）で一度だけ出す
  const showGuides = showOver;

  return (
    <>
      {showUnder ? renderBlocks(under, "under") : null}
      {showOver ? renderBlocks(over, "over") : null}
      {showGuides && !onGuidesChange && localGuides.length > 0 ? (
        <div className="bv-snap-guides" aria-hidden>
          {localGuides.map((guide, index) => (
            <div
              key={`${guide.orientation}-${guide.position}-${index}`}
              className={[
                "bv-snap-guide",
                `bv-snap-guide--${guide.orientation}`,
                guide.source === "peer" ? "bv-snap-guide--peer" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={
                guide.orientation === "v"
                  ? { left: guide.position * metrics.width }
                  : { top: guide.position * metrics.height }
              }
            />
          ))}
        </div>
      ) : null}
    </>
  );
}
