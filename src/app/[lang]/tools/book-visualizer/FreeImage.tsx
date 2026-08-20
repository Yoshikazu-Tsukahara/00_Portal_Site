"use client";

import type { CSSProperties, MouseEvent } from "react";
import { Rnd } from "react-rnd";

import { frameToPixels, pixelsToFrame, snapFrame, type SnapGuide } from "./snap";
import type { FreeFrame, ImageBlock } from "./types";

type FreeImageProps = {
  block: ImageBlock;
  sheetWidth: number;
  sheetHeight: number;
  scale: number;
  interactive: boolean;
  selected: boolean;
  alt: string;
  /** 同じ用紙上の他オブジェクト（自分以外）の枠。スマートガイド用 */
  peerFrames?: readonly FreeFrame[];
  onSelect: () => void;
  onChangeFrame: (frame: FreeFrame) => void;
  onGuidesChange?: (guides: SnapGuide[]) => void;
};

function ImageBody({
  dataUrl,
  alt,
  caption,
  cover,
}: {
  dataUrl: string;
  alt: string;
  caption: string;
  cover: boolean;
}) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dataUrl}
        alt={alt}
        className={`pointer-events-none h-full w-full ${
          cover ? "object-cover" : "object-contain"
        }`}
        draggable={false}
      />
      {caption && !cover ? (
        <p className="bv-free-image__caption">{caption}</p>
      ) : null}
    </>
  );
}

/** フルブリード判定（ほぼ用紙全体） */
function isFullBleed(frame: FreeFrame): boolean {
  return (
    frame.x <= 0.01 &&
    frame.y <= 0.01 &&
    frame.w >= 0.98 &&
    frame.h >= 0.98
  );
}

/**
 * 用紙上を自由に動かせる画像ブロック。
 * 選択中だけドラッグ＆リサイズ。スナップ対応。
 * 非 interactive（サムネ等）は left/top の絶対配置（親 CSS scale と一致）。
 */
export default function FreeImage({
  block,
  sheetWidth,
  sheetHeight,
  scale,
  interactive,
  selected,
  alt,
  peerFrames = [],
  onSelect,
  onChangeFrame,
  onGuidesChange,
}: FreeImageProps) {
  const px = frameToPixels(block.frame, sheetWidth, sheetHeight);
  const cover = isFullBleed(block.frame);
  // 選択ブーストはしない（するとレイヤー順が選択中に見えなくなる）
  const zStyle: CSSProperties = {
    zIndex: 10 + block.zIndex,
  };
  const snapOpts = { peers: peerFrames };

  function previewSnap(raw: FreeFrame, resizeDir?: string) {
    const snapped = snapFrame(raw, sheetWidth, sheetHeight, {
      ...snapOpts,
      resizeDir,
    });
    onGuidesChange?.(snapped.guides);
    return snapped;
  }

  function commitFrame(raw: FreeFrame, resizeDir?: string) {
    const snapped = previewSnap(raw, resizeDir);
    onChangeFrame(snapped.frame);
    window.setTimeout(() => onGuidesChange?.([]), 400);
  }

  const boxClass = [
    "bv-free-image",
    selected ? "bv-free-image--selected" : "",
    interactive && !selected ? "bv-free-image--hit" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const body = (
    <ImageBody
      dataUrl={block.dataUrl}
      alt={alt}
      caption={block.caption}
      cover={cover}
    />
  );

  // サムネ／閲覧：Rnd を使わず left/top で置く（親の CSS scale とずれない）
  if (!interactive) {
    return (
      <div
        className={boxClass}
        style={{
          left: px.x,
          top: px.y,
          width: px.width,
          height: px.height,
          ...zStyle,
        }}
      >
        {body}
      </div>
    );
  }

  return (
    <Rnd
      size={{ width: px.width, height: px.height }}
      position={{ x: px.x, y: px.y }}
      scale={scale}
      bounds="parent"
      minWidth={32}
      minHeight={32}
      disableDragging={!interactive || !selected}
      enableResizing={interactive && selected}
      style={zStyle}
      onDrag={(_event, data) => {
        previewSnap(
          pixelsToFrame(
            data.x,
            data.y,
            px.width,
            px.height,
            sheetWidth,
            sheetHeight,
          ),
        );
      }}
      onDragStop={(_event, data) => {
        commitFrame(
          pixelsToFrame(
            data.x,
            data.y,
            px.width,
            px.height,
            sheetWidth,
            sheetHeight,
          ),
        );
      }}
      onResize={(_event, dir, element, _delta, position) => {
        previewSnap(
          pixelsToFrame(
            position.x,
            position.y,
            element.offsetWidth,
            element.offsetHeight,
            sheetWidth,
            sheetHeight,
          ),
          dir,
        );
      }}
      onResizeStop={(_event, dir, element, _delta, position) => {
        commitFrame(
          pixelsToFrame(
            position.x,
            position.y,
            element.offsetWidth,
            element.offsetHeight,
            sheetWidth,
            sheetHeight,
          ),
          dir,
        );
      }}
      className={boxClass}
      onMouseDown={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onClick={(event: MouseEvent) => {
        event.stopPropagation();
      }}
    >
      {body}
    </Rnd>
  );
}
