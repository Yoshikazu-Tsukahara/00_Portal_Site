import { isFreeBlock, type Block, type ImageBlock, type FreeTextBlock } from "./types";

export type LayerAction =
  | "front"
  | "forward"
  | "backward"
  | "back";

/** 本文テキストの仮想プレーン。これより小さい z は背面、大きい z は前面 */
export const BODY_PLANE_Z = 0;

type FreeBlock = ImageBlock | FreeTextBlock;

type StackItem =
  | { kind: "body" }
  | { kind: "free"; block: FreeBlock };

/** 自由配置を本文プレーンの前後に分ける */
export function splitFreeBlocksByBodyPlane(blocks: Block[]): {
  under: FreeBlock[];
  over: FreeBlock[];
} {
  const free = blocks.filter(isFreeBlock);
  const under = free
    .filter((block) => block.zIndex < BODY_PLANE_Z)
    .sort((a, b) => a.zIndex - b.zIndex);
  const over = free
    .filter((block) => block.zIndex >= BODY_PLANE_Z)
    .sort((a, b) => a.zIndex - b.zIndex);
  return { under, over };
}

function buildStack(free: FreeBlock[]): StackItem[] {
  const sorted = [...free].sort(
    (a, b) => a.zIndex - b.zIndex || a.id.localeCompare(b.id),
  );
  const below = sorted.filter((block) => block.zIndex < BODY_PLANE_Z);
  const above = sorted.filter((block) => block.zIndex >= BODY_PLANE_Z);
  return [
    ...below.map((block) => ({ kind: "free" as const, block })),
    { kind: "body" },
    ...above.map((block) => ({ kind: "free" as const, block })),
  ];
}

function assignZFromStack(stack: StackItem[]): Map<string, number> {
  const bodyIndex = stack.findIndex((item) => item.kind === "body");
  const zMap = new Map<string, number>();
  stack.forEach((item, index) => {
    if (item.kind !== "free") return;
    // 本文位置を 0 とし、手前は正・背面は負（0 は本文専用なので飛ばない）
    zMap.set(item.block.id, index - bodyIndex);
  });
  return zMap;
}

/**
 * 選択中の自由配置ブロックの zIndex を付け替える。
 * スタックに「本文」プレーンを含め、前後へ送ると本文をまたげる。
 */
export function applyLayerAction(
  blocks: Block[],
  blockId: string,
  action: LayerAction,
): Block[] {
  const free = blocks.filter(isFreeBlock);
  if (!free.some((block) => block.id === blockId)) return blocks;

  const stack = buildStack(free);
  const index = stack.findIndex(
    (item) => item.kind === "free" && item.block.id === blockId,
  );
  if (index < 0) return blocks;

  let nextStack = stack;
  if (action === "front" && index < stack.length - 1) {
    const item = stack[index];
    nextStack = [...stack.slice(0, index), ...stack.slice(index + 1), item];
  } else if (action === "back" && index > 0) {
    const item = stack[index];
    nextStack = [item, ...stack.slice(0, index), ...stack.slice(index + 1)];
  } else if (action === "forward" && index < stack.length - 1) {
    nextStack = [...stack];
    [nextStack[index], nextStack[index + 1]] = [
      nextStack[index + 1],
      nextStack[index],
    ];
  } else if (action === "backward" && index > 0) {
    nextStack = [...stack];
    [nextStack[index - 1], nextStack[index]] = [
      nextStack[index],
      nextStack[index - 1],
    ];
  } else {
    return blocks;
  }

  // 本文プレーンは動かさない（自由ブロック同士の入れ替えで相対位置だけ変わる）
  // forward/backward で本文と隣接入れ替え＝本文をまたぐ、が意図どおり

  const zMap = assignZFromStack(nextStack);

  return blocks.map((block) => {
    if (!isFreeBlock(block)) return block;
    const zIndex = zMap.get(block.id);
    return zIndex === undefined ? block : { ...block, zIndex };
  });
}
