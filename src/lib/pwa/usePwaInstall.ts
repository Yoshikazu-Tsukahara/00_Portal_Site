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
import { ensurePwaServiceWorker } from "./usePwaRuntime";

export type { BeforeInstallPromptEvent } from "./bipCapture";
export {
  armPwaInstallCapture,
  PWA_INSTALLABLE_BASE_PATH,
} from "./bipCapture";

export type PwaInstallState = {
  canShow: boolean;
  isStandalone: boolean;
  isIos: boolean;
  canPrompt: boolean;
  promptInstall: () => Promise<"accepted" | "dismissed" | "unavailable">;
  /** BIP が無いとき: SW 準備→BIP 待機→必要なら 1 回だけハードリロード */
  prepareAndPrompt: () => Promise<
    "accepted" | "dismissed" | "unavailable" | "guide"
  >;
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

/**
 * PWA インストール可否と beforeinstallprompt の保持。
 * BIP が遅れてもボタン押下時に待ち、必要なら 1 回だけ再読み込みしてからネイティブ prompt を出す。
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
    if (!path.startsWith(PWA_INSTALLABLE_BASE_PATH)) {
      clearCachedBip();
      setDeferred(null);
    } else {
      setDeferred(bipForCurrentPath());
    }

    function onBip() {
      setDeferred(bipForCurrentPath());
    }

    function onInstalled() {
      setInstalled(true);
      setDeferred(null);
    }

    window.addEventListener("pwa:bip", onBip);
    window.addEventListener("pwa:installed", onInstalled);

    return () => {
      window.removeEventListener("pwa:bip", onBip);
      window.removeEventListener("pwa:installed", onInstalled);
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

  const prepareAndPrompt = useCallback(async () => {
    const path = PWA_INSTALLABLE_BASE_PATH;

    let event = deferred ?? bipForCurrentPath();
    if (!event) {
      await ensurePwaServiceWorker(path);
      event = await waitForBip(4500);
      if (event) setDeferred(event);
    }

    if (event) {
      try {
        sessionStorage.removeItem(reloadOnceKey(path));
      } catch {
        // ignore
      }
      const outcome = await runPrompt(event);
      setDeferred(null);
      if (outcome === "accepted") setInstalled(true);
      return outcome;
    }

    // BIP がまだ無い → 1 回だけハードリロード（古い SW 残留対策）
    try {
      const key = reloadOnceKey(path);
      if (sessionStorage.getItem(key) !== "1") {
        sessionStorage.setItem(key, "1");
        window.location.reload();
        return "unavailable";
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
    isInstallableAppPath(pathname.endsWith("/") && pathname.length > 1
      ? pathname.slice(0, -1)
      : pathname);
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
