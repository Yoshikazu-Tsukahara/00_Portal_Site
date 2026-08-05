import type { FreeFrame } from "./types";

/** 表示中のスマートガイド */
export type SnapGuide = {
  orientation: "v" | "h";
  /** 用紙上の位置（0〜1） */
  position: number;
  /** 用紙基準か、他オブジェクト基準か（見た目の区別用） */
  source?: "page" | "peer";
};

export type SnapResult = {
  frame: FreeFrame;
  guides: SnapGuide[];
};

/** react-rnd のリサイズ方向 */
export type ResizeDir =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "topRight"
  | "bottomRight"
  | "bottomLeft"
  | "topLeft";

export type SnapOptions = {
  /** 吸着の許容距離（実寸 px） */
  thresholdPx?: number;
  /** 同じ用紙上の他オブジェクト（自分は含めない） */
  peers?: readonly FreeFrame[];
  /**
   * リサイズ中だけ渡す。動かしている辺／角だけを吸着対象にする。
   * 未指定なら移動扱い（幅・高さは変えず位置だけ合わせる）。
   */
  resizeDir?: ResizeDir | string;
};

const PAGE_TARGETS = [0, 0.5, 1] as const;

type AxisCandidate = {
  distance: number;
  /** 適用後の座標（移動なら x/y、リサイズなら調整済みの辺） */
  value: number;
  guide: number;
  source: "page" | "peer";
  /** リサイズ時に幅／高さも更新する場合 */
  size?: number;
};

function uniqTargets(
  values: number[],
  sources: ("page" | "peer")[],
): { position: number; source: "page" | "peer" }[] {
  const out: { position: number; source: "page" | "peer" }[] = [];
  for (let i = 0; i < values.length; i++) {
    const position = values[i]!;
    const source = sources[i]!;
    if (
      out.some((item) => Math.abs(item.position - position) < 0.0005)
    ) {
      continue;
    }
    out.push({ position, source });
  }
  return out;
}

function collectTargets(peers: readonly FreeFrame[]) {
  const xs: number[] = [...PAGE_TARGETS];
  const ys: number[] = [...PAGE_TARGETS];
  const xSources: ("page" | "peer")[] = PAGE_TARGETS.map(() => "page");
  const ySources: ("page" | "peer")[] = PAGE_TARGETS.map(() => "page");

  for (const peer of peers) {
    xs.push(peer.x, peer.x + peer.w / 2, peer.x + peer.w);
    ys.push(peer.y, peer.y + peer.h / 2, peer.y + peer.h);
    xSources.push("peer", "peer", "peer");
    ySources.push("peer", "peer", "peer");
  }

  return {
    x: uniqTargets(xs, xSources),
    y: uniqTargets(ys, ySources),
  };
}

function pickBest(candidates: AxisCandidate[]): AxisCandidate | null {
  if (candidates.length === 0) return null;
  let best = candidates[0]!;
  for (let i = 1; i < candidates.length; i++) {
    const next = candidates[i]!;
    if (next.distance < best.distance - 1e-9) {
      best = next;
      continue;
    }
    // 同じ距離なら peer を優先（用紙中央より他オブジェクト揃えを優先）
    if (
      Math.abs(next.distance - best.distance) < 1e-9 &&
      next.source === "peer" &&
      best.source === "page"
    ) {
      best = next;
    }
  }
  return best;
}

/** 移動：左／中央／右（または上／中／下）のどれかがターゲットに近いとき吸着 */
function bestMoveAxis(
  origin: number,
  size: number,
  targets: { position: number; source: "page" | "peer" }[],
  threshold: number,
): AxisCandidate | null {
  const anchors = [
    { offset: 0 },
    { offset: size / 2 },
    { offset: size },
  ];
  const candidates: AxisCandidate[] = [];
  for (const target of targets) {
    for (const anchor of anchors) {
      const current = origin + anchor.offset;
      const distance = Math.abs(current - target.position);
      if (distance > threshold) continue;
      candidates.push({
        distance,
        value: target.position - anchor.offset,
        guide: target.position,
        source: target.source,
      });
    }
  }
  return pickBest(candidates);
}

/** リサイズ：指定した辺だけをターゲットへ吸着（反対側は固定） */
function bestResizeEdge(
  fixed: number,
  moving: number,
  targets: { position: number; source: "page" | "peer" }[],
  threshold: number,
  /** moving が増える方向が正（right/bottom）なら true */
  growingPositive: boolean,
  minSize: number,
): AxisCandidate | null {
  const candidates: AxisCandidate[] = [];
  for (const target of targets) {
    const distance = Math.abs(moving - target.position);
    if (distance > threshold) continue;
    let nextOrigin: number;
    let nextSize: number;
    if (growingPositive) {
      // fixed=左/上, moving=右/下
      nextOrigin = fixed;
      nextSize = target.position - fixed;
    } else {
      // fixed=右/下, moving=左/上
      nextOrigin = target.position;
      nextSize = fixed - target.position;
    }
    if (nextSize < minSize) continue;
    candidates.push({
      distance,
      value: nextOrigin,
      size: nextSize,
      guide: target.position,
      source: target.source,
    });
  }
  return pickBest(candidates);
}

function parseResizeDir(dir: string | undefined): {
  left: boolean;
  right: boolean;
  top: boolean;
  bottom: boolean;
} {
  if (!dir) {
    return { left: false, right: false, top: false, bottom: false };
  }
  return {
    left: dir === "left" || dir === "topLeft" || dir === "bottomLeft",
    right: dir === "right" || dir === "topRight" || dir === "bottomRight",
    top: dir === "top" || dir === "topLeft" || dir === "topRight",
    bottom: dir === "bottom" || dir === "bottomLeft" || dir === "bottomRight",
  };
}

function dedupeGuides(guides: SnapGuide[]): SnapGuide[] {
  return guides.filter(
    (guide, index, list) =>
      list.findIndex(
        (item) =>
          item.orientation === guide.orientation &&
          Math.abs(item.position - guide.position) < 0.001,
      ) === index,
  );
}

/**
 * ドラッグ／リサイズ後の枠を、用紙の端・中央＋他オブジェクトの端・中央へ吸着する。
 * PowerPoint のスマートガイドに近い挙動。
 */
export function snapFrame(
  frame: FreeFrame,
  sheetWidth: number,
  sheetHeight: number,
  options: SnapOptions = {},
): SnapResult {
  const thresholdPx = options.thresholdPx ?? 8;
  const peers = options.peers ?? [];
  const resize = parseResizeDir(options.resizeDir);
  const isResize = Boolean(options.resizeDir);

  const guides: SnapGuide[] = [];
  let { x, y, w, h } = frame;
  const tx = thresholdPx / sheetWidth;
  const ty = thresholdPx / sheetHeight;
  const minW = 0.05;
  const minH = 0.05;

  const targets = collectTargets(peers);

  if (!isResize) {
    const snapX = bestMoveAxis(x, w, targets.x, tx);
    if (snapX) {
      x = snapX.value;
      guides.push({
        orientation: "v",
        position: snapX.guide,
        source: snapX.source,
      });
    }
    const snapY = bestMoveAxis(y, h, targets.y, ty);
    if (snapY) {
      y = snapY.value;
      guides.push({
        orientation: "h",
        position: snapY.guide,
        source: snapY.source,
      });
    }
  } else {
    if (resize.left && !resize.right) {
      const snap = bestResizeEdge(x + w, x, targets.x, tx, false, minW);
      if (snap && snap.size !== undefined) {
        x = snap.value;
        w = snap.size;
        guides.push({
          orientation: "v",
          position: snap.guide,
          source: snap.source,
        });
      }
    } else if (resize.right && !resize.left) {
      const snap = bestResizeEdge(x, x + w, targets.x, tx, true, minW);
      if (snap && snap.size !== undefined) {
        x = snap.value;
        w = snap.size;
        guides.push({
          orientation: "v",
          position: snap.guide,
          source: snap.source,
        });
      }
    } else if (resize.left && resize.right) {
      // 角リサイズでも水平は「動いた両辺」ではなく、近い方を優先するため移動相当で左右を見る
      // → 角は縦横それぞれ 1 辺ずつの組み合わせなのでここには来ない想定
    }

    if (resize.top && !resize.bottom) {
      const snap = bestResizeEdge(y + h, y, targets.y, ty, false, minH);
      if (snap && snap.size !== undefined) {
        y = snap.value;
        h = snap.size;
        guides.push({
          orientation: "h",
          position: snap.guide,
          source: snap.source,
        });
      }
    } else if (resize.bottom && !resize.top) {
      const snap = bestResizeEdge(y, y + h, targets.y, ty, true, minH);
      if (snap && snap.size !== undefined) {
        y = snap.value;
        h = snap.size;
        guides.push({
          orientation: "h",
          position: snap.guide,
          source: snap.source,
        });
      }
    }
  }

  w = Math.min(1, Math.max(minW, w));
  h = Math.min(1, Math.max(minH, h));
  x = Math.min(1 - w, Math.max(0, x));
  y = Math.min(1 - h, Math.max(0, y));

  return { frame: { x, y, w, h }, guides: dedupeGuides(guides) };
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
