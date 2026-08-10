"use client";

/** Chromium 系の beforeinstallprompt イベント型 */
export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

/** サイト全体でインストールを許可するアプリ（ランチ貯金のみ） */
export const PWA_INSTALLABLE_BASE_PATH = "/lunch-savings";

let cachedBip: BeforeInstallPromptEvent | null = null;
let cachedBipPath: string | null = null;
let bipListenerBound = false;

export function currentAppPath(): string {
  if (typeof window === "undefined") return "";
  const path = window.location.pathname;
  return path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;
}

export function isInstallableAppPath(path: string): boolean {
  return (
    path === PWA_INSTALLABLE_BASE_PATH ||
    path.startsWith(`${PWA_INSTALLABLE_BASE_PATH}/`)
  );
}

/** layout の PwaRuntime からも呼び、ページ hydration 前の BIP 取りこぼしを防ぐ */
export function armPwaInstallCapture() {
  if (typeof window === "undefined" || bipListenerBound) return;
  bipListenerBound = true;

  window.addEventListener("beforeinstallprompt", (e) => {
    const path = currentAppPath();
    // ランチ貯金以外はインストールさせない（ブラウザ標準 UI も抑止）
    if (!isInstallableAppPath(path)) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    cachedBip = e as BeforeInstallPromptEvent;
    cachedBipPath = path;
    window.dispatchEvent(new Event("pwa:bip"));
  });

  window.addEventListener("appinstalled", () => {
    cachedBip = null;
    cachedBipPath = null;
    window.dispatchEvent(new Event("pwa:installed"));
  });
}

export function bipForCurrentPath(): BeforeInstallPromptEvent | null {
  if (!cachedBip) return null;
  if (cachedBipPath && cachedBipPath !== currentAppPath()) return null;
  return cachedBip;
}

export function clearCachedBip() {
  cachedBip = null;
  cachedBipPath = null;
}
