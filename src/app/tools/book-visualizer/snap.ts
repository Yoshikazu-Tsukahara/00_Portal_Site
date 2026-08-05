import type { FreeFrame } from "./types";

/** 表示中のスマートガイド */
export type SnapGuide = {
  orientation: "v" | "h";
  /** 用紙上の位置（0〜1） */
  position: number;
};

export type SnapResult = {
  frame: FreeFrame;
  guides: SnapGuide[];
};

const SNAP_TARGETS = [0, 0.5, 1] as const;

/**
 * ドラッグ／リサイズ後の枠を中央・端にスナップする。
 * thresholdPx は実寸 px（scale 補正前）。
 */
export function snapFrame(
  frame: FreeFrame,
  sheetWidth: number,
  sheetHeight: number,
  thresholdPx = 10,
): SnapResult {
  const guides: SnapGuide[] = [];
  let { x, y, w, h } = frame;
  const tx = thresholdPx / sheetWidth;
  const ty = thresholdPx / sheetHeight;

  const left = x;
  const right = x + w;
  const cx = x + w / 2;
  const top = y;
  const bottom = y + h;
  const cy = y + h / 2;

  // 縦ガイド（X）
  for (const target of SNAP_TARGETS) {
    if (Math.abs(left - target) <= tx) {
      x = target;
      guides.push({ orientation: "v", position: target });
    } else if (Math.abs(right - target) <= tx) {
      x = target - w;
      guides.push({ orientation: "v", position: target });
    } else if (Math.abs(cx - target) <= tx) {
      x = target - w / 2;
      guides.push({ orientation: "v", position: target });
    }
  }

  // 横ガイド（Y）
  for (const target of SNAP_TARGETS) {
    if (Math.abs(top - target) <= ty) {
      y = target;
      guides.push({ orientation: "h", position: target });
    } else if (Math.abs(bottom - target) <= ty) {
      y = target - h;
      guides.push({ orientation: "h", position: target });
    } else if (Math.abs(cy - target) <= ty) {
      y = target - h / 2;
      guides.push({ orientation: "h", position: target });
    }
  }

  w = Math.min(1, Math.max(0.05, w));
  h = Math.min(1, Math.max(0.05, h));
  x = Math.min(1 - w, Math.max(0, x));
  y = Math.min(1 - h, Math.max(0, y));

  // 重複ガイドを間引く
  const unique = guides.filter(
    (guide, index, list) =>
      list.findIndex(
        (item) =>
          item.orientation === guide.orientation &&
          Math.abs(item.position - guide.position) < 0.001,
      ) === index,
  );

  return { frame: { x, y, w, h }, guides: unique };
}

/** ピクセル矩形 → 相対枠 */
export function pixelsToFrame(
  x: number,
  y: number,
  width: number,
  height: number,
  sheetWidth: number,
  sheetHeight: number,
): FreeFrame {
  const w = Math.min(1, Math.max(0.05, width / sheetWidth));
  const h = Math.min(1, Math.max(0.05, height / sheetHeight));
  return {
    x: Math.min(1 - w, Math.max(0, x / sheetWidth)),
    y: Math.min(1 - h, Math.max(0, y / sheetHeight)),
    w,
    h,
  };
}

/** 相対枠 → ピクセル */
export function frameToPixels(
  frame: FreeFrame,
  sheetWidth: number,
  sheetHeight: number,
) {
  return {
    x: frame.x * sheetWidth,
    y: frame.y * sheetHeight,
    width: Math.max(24, frame.w * sheetWidth),
    height: Math.max(24, frame.h * sheetHeight),
  };
}
