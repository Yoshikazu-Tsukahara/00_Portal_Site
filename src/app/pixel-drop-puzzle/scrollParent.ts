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
