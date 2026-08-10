"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useStandaloneDisplay } from "@/lib/useStandaloneDisplay";
import {
  armPwaInstallCapture,
  bipForCurrentPath,
  clearCachedBip,
  currentAppPath,
  isInstallableAppPath,
  PWA_INSTALLABLE_BASE_PATH,
  type BeforeInstallPromptEvent,
} from "./bipCapture";
import { ensurePwaServiceWorker } from "./swRegister";

export type { BeforeInstallPromptEvent } from "./bipCapture";
export {
  armPwaInstallCapture,
  PWA_INSTALLABLE_BASE_PATH,
} from "./bipCapture";

export type PwaInstallResult =
  | "accepted"
  | "dismissed"
  | "unavailable"
  | "guide"
  | "armed"
  | "reloading";

export type PwaInstallState = {
  canShow: boolean;
  isStandalone: boolean;
  isIos: boolean;
  canPrompt: boolean;
  promptInstall: () => Promise<"accepted" | "dismissed" | "unavailable">;
  /**
   * BIP があるときはユーザー操作のまま prompt。
   * 無いときは SW/BIP を準備し、揃ったら "armed"（もう一度タップで prompt）。
   */
  prepareAndPrompt: () => Promise<PwaInstallResult>;
};

function detectIos(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  return (
    navigator.platform === "MacIntel" &&
    typeof navigator.maxTouchPoints === "number" &&
    navigator.maxTouchPoints > 1
  );
}

function waitForBip(timeoutMs: number): Promise<BeforeInstallPromptEvent | null> {
  const existing = bipForCurrentPath();
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      window.removeEventListener("pwa:bip", onBip);
      resolve(bipForCurrentPath());
    }, timeoutMs);

    function onBip() {
      window.clearTimeout(timer);
      window.removeEventListener("pwa:bip", onBip);
      resolve(bipForCurrentPath());
    }

    window.addEventListener("pwa:bip", onBip);
  });
}

function reloadOnceKey(path: string): string {
  return `pwa-install-reload:${path}`;
}

async function runPrompt(
  event: BeforeInstallPromptEvent,
): Promise<"accepted" | "dismissed" | "unavailable"> {
  try {
    await event.prompt();
    const { outcome } = await event.userChoice;
    clearCachedBip();
    return outcome;
  } catch {
    return "unavailable";
  }
}

function normalizePath(pathname: string): string {
  return pathname.endsWith("/") && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;
}

/**
 * PWA インストール可否と beforeinstallprompt の保持。
 *
 * Chromium は prompt() にユーザー操作が必要なので、長い await のあとに
 * 勝手に prompt しない（準備完了後は "armed" を返して再タップを促す）。
 */
export function usePwaInstall(): PwaInstallState {
  const pathname = usePathname();
  const { isStandalone, ready } = useStandaloneDisplay();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [isIos, setIsIos] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    armPwaInstallCapture();
    setIsIos(detectIos());

    const path = currentAppPath();
    if (!isInstallableAppPath(path)) {
      clearCachedBip();
      setDeferred(null);
    } else {
      setDeferred(bipForCurrentPath());
      // 表示直後から SW を温め、クリック時に BIP が既にある状態を目指す
      void ensurePwaServiceWorker(PWA_INSTALLABLE_BASE_PATH);
    }

    function onBip() {
      setDeferred(bipForCurrentPath());
    }

    function onInstalled() {
      setInstalled(true);
      setDeferred(null);
    }

    window.addEventListener("pwa:bip", onBip);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("pwa:bip", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [pathname]);

  const promptInstall = useCallback(async () => {
    const event = deferred ?? bipForCurrentPath();
    if (!event) return "unavailable" as const;
    const outcome = await runPrompt(event);
    setDeferred(null);
    if (outcome === "accepted") setInstalled(true);
    return outcome;
  }, [deferred]);

  const prepareAndPrompt = useCallback(async (): Promise<PwaInstallResult> => {
    const path = PWA_INSTALLABLE_BASE_PATH;

    // クリック時点で BIP がある → ユーザー操作を保ったまま prompt
    const immediate = deferred ?? bipForCurrentPath();
    if (immediate) {
      try {
        sessionStorage.removeItem(reloadOnceKey(path));
      } catch {
        // ignore
      }
      const outcome = await runPrompt(immediate);
      setDeferred(null);
      if (outcome === "accepted") setInstalled(true);
      // prompt 失敗時は手動ガイドへ（無反応に見せない）
      return outcome === "unavailable" ? "guide" : outcome;
    }

    // BIP が無い → 準備のみ（ここでは prompt しない）
    await ensurePwaServiceWorker(path, { force: true });
    const event = await waitForBip(6000);
    if (event) {
      setDeferred(event);
      return "armed";
    }

    // まだ無い → 1 回だけハードリロード（古い SW 残留対策）
    try {
      const key = reloadOnceKey(path);
      if (sessionStorage.getItem(key) !== "1") {
        sessionStorage.setItem(key, "1");
        window.location.reload();
        return "reloading";
      }
      sessionStorage.removeItem(key);
    } catch {
      // sessionStorage 不可ならガイドへ
    }

    return "guide";
  }, [deferred]);

  const canShow =
    ready &&
    !isStandalone &&
    !installed &&
    isInstallableAppPath(normalizePath(pathname));
  const hasBip = deferred !== null || bipForCurrentPath() !== null;

  return {
    canShow,
    isStandalone,
    isIos,
    canPrompt: hasBip,
    promptInstall,
    prepareAndPrompt,
  };
}
