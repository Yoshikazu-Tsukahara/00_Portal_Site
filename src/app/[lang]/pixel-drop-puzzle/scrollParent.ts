/** AppShell の overflow 箱など、実際にスクロールしている祖先を返す */
export function getScrollParent(el: HTMLElement | null): HTMLElement | Window {
  let node = el?.parentElement ?? null;
  while (node && node !== document.documentElement) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return window;
}

export function getScrollTop(target: HTMLElement | Window): number {
  if (target instanceof HTMLElement) return target.scrollTop;
  return window.scrollY;
}

export function setScrollTop(target: HTMLElement | Window, top: number): void {
  const y = Math.max(0, top);
  if (target instanceof HTMLElement) {
    target.scrollTop = y;
  } else {
    window.scrollTo({ top: y, behavior: "auto" });
  }
}

/** スクロール領域の可視範囲（ビューポート座標） */
export type VisibleViewRect = {
  top: number;
  bottom: number;
  left: number;
  right: number;
  height: number;
};

/**
 * 実際に見えているプレイ領域の矩形。
 * AppShell の内部スクロール時は window ではなく overflow 箱を使う。
 */
export function getVisibleViewRect(
  scroller: HTMLElement | Window,
): VisibleViewRect {
  if (scroller instanceof HTMLElement) {
    const r = scroller.getBoundingClientRect();
    return {
      top: r.top,
      bottom: r.bottom,
      left: r.left,
      right: r.right,
      height: r.height,
    };
  }
  const height = window.innerHeight;
  const width = window.innerWidth;
  return {
    top: 0,
    bottom: height,
    left: 0,
    right: width,
    height,
  };
}
