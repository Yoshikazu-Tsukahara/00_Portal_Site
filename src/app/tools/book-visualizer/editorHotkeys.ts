// 編集画面のキーボードショートカット用ヘルパー。
// 文字入力中はブラウザ標準に任せ、オブジェクト選択時だけアプリ側で処理する。

import {
  createId,
  isFreeBlock,
  type Block,
  type FreeFrame,
  type FreeTextBlock,
  type ImageBlock,
} from "./types";

export type FreeBlock = ImageBlock | FreeTextBlock;

/** 入力欄・本文編集中など、ショートカットを奪ってはいけない対象か */
export function isEditableKeyboardTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  // contenteditable 内の子ノード
  if (target.closest('[contenteditable="true"]')) return true;
  return false;
}

/** IME 変換中はショートカットを触らない */
export function isImeComposing(event: KeyboardEvent): boolean {
  return event.isComposing || event.key === "Process";
}

export function isModKey(event: KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey;
}

/** 自由オブジェクトを複製（新しい id・少しずらした位置） */
export function cloneFreeBlock(
  block: FreeBlock,
  offset = 0.03,
  zIndex?: number,
): FreeBlock {
  const frame: FreeFrame = {
    x: Math.min(1 - block.frame.w, Math.max(0, block.frame.x + offset)),
    y: Math.min(1 - block.frame.h, Math.max(0, block.frame.y + offset)),
    w: block.frame.w,
    h: block.frame.h,
  };
  const nextZ = zIndex ?? block.zIndex;
  if (block.type === "image") {
    return {
      ...block,
      id: createId("bk"),
      frame,
      zIndex: nextZ,
    };
  }
  return {
    ...block,
    id: createId("bk"),
    frame,
    zIndex: nextZ,
  };
}

/** クリップボード用に深いコピー */
export function copyFreeBlock(block: FreeBlock): FreeBlock {
  return structuredClone(block);
}

/** 矢印キー1回ぶんの相対移動量（用紙比） */
export function nudgeDelta(
  key: string,
  sheetWidth: number,
  sheetHeight: number,
  shift: boolean,
): { dx: number; dy: number } | null {
  const stepPx = shift ? 10 : 1;
  const dx = stepPx / Math.max(1, sheetWidth);
  const dy = stepPx / Math.max(1, sheetHeight);
  switch (key) {
    case "ArrowLeft":
      return { dx: -dx, dy: 0 };
    case "ArrowRight":
      return { dx, dy: 0 };
    case "ArrowUp":
      return { dx: 0, dy: -dy };
    case "ArrowDown":
      return { dx: 0, dy };
    default:
      return null;
  }
}

export function nudgeFrame(
  frame: FreeFrame,
  dx: number,
  dy: number,
): FreeFrame {
  return {
    ...frame,
    x: Math.min(1 - frame.w, Math.max(0, frame.x + dx)),
    y: Math.min(1 - frame.h, Math.max(0, frame.y + dy)),
  };
}

/** 選択中ブロックがショートカット対象の自由オブジェクトか */
export function asFreeBlock(block: Block | null | undefined): FreeBlock | null {
  if (!block || !isFreeBlock(block)) return null;
  return block;
}
