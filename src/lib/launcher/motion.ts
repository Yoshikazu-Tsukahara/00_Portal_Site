/** ホーム起動／フォルダ開閉アニメ用の原点情報 */
export type LaunchOrigin = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** OS の「動きを減らす」設定 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** 要素（なければフォールバック）から起動原点を取る */
export function readLaunchOrigin(
  el: Element | null | undefined,
): LaunchOrigin | null {
  if (!el || typeof window === "undefined") return null;
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

/**
 * 修飾キー付きクリック等はネイティブ遷移のまま（新規タブなど）。
 */
export function shouldSkipLaunchAnimation(e: {
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  button: number;
}): boolean {
  return (
    e.metaKey ||
    e.ctrlKey ||
    e.shiftKey ||
    e.altKey ||
    e.button === 1
  );
}

/**
 * アイコン矩形 → 画面中央パネルへの初期 transform 用 CSS 変数。
 * panelW/H は実測前の近似でも可（アニメ開始直後に十分見える）。
 */
export function originToCssVars(
  origin: LaunchOrigin | null,
  panelW: number,
  panelH: number,
): Record<string, string> {
  if (!origin || typeof window === "undefined") {
    return {
      "--launcher-from-x": "0px",
      "--launcher-from-y": "0px",
      "--launcher-from-scale": "0.92",
    };
  }
  const cx = origin.x + origin.width / 2;
  const cy = origin.y + origin.height / 2;
  const vx = window.innerWidth / 2;
  const vy = window.innerHeight / 2;
  const scale = Math.max(
    0.12,
    Math.min(origin.width / panelW, origin.height / panelH),
  );
  return {
    "--launcher-from-x": `${cx - vx}px`,
    "--launcher-from-y": `${cy - vy}px`,
    "--launcher-from-scale": String(scale),
  };
}
