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
 * インタラクティブ時は常に Rnd（選択切替で再マウントしない）。
 */
export default function FreeImage({
  block,
  sheetWidth,
  sheetHeight,
  scale,
  interactive,
  selected,
  alt,
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

  function commitFrame(raw: FreeFrame) {
    const snapped = snapFrame(raw, sheetWidth, sheetHeight);
    onGuidesChange?.(snapped.guides);
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

  if (!interactive) {
    // 編集時の Rnd と同じく transform で置く（完成プレビューとの位置ずれを防ぐ）
    return (
      <div
        className={boxClass}
        style={{
          left: 0,
          top: 0,
          width: px.width,
          height: px.height,
          transform: `translate(${px.x}px, ${px.y}px)`,
          ...zStyle,
        }}
      >
        <ImageBody
          dataUrl={block.dataUrl}
          alt={alt}
          caption={block.caption}
          cover={cover}
        />
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
      disableDragging={!selected}
      enableResizing={selected}
      style={zStyle}
      onDrag={(_event, data) => {
        const raw = pixelsToFrame(
          data.x,
          data.y,
          px.width,
          px.height,
          sheetWidth,
          sheetHeight,
        );
        onGuidesChange?.(snapFrame(raw, sheetWidth, sheetHeight).guides);
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
      onResize={(_event, _dir, element, _delta, position) => {
        const raw = pixelsToFrame(
          position.x,
          position.y,
          element.offsetWidth,
          element.offsetHeight,
          sheetWidth,
          sheetHeight,
        );
        onGuidesChange?.(snapFrame(raw, sheetWidth, sheetHeight).guides);
      }}
      onResizeStop={(_event, _dir, element, _delta, position) => {
        commitFrame(
          pixelsToFrame(
            position.x,
            position.y,
            element.offsetWidth,
            element.offsetHeight,
            sheetWidth,
            sheetHeight,
          ),
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
      <ImageBody
        dataUrl={block.dataUrl}
        alt={alt}
        caption={block.caption}
        cover={cover}
      />
    </Rnd>
  );
}
