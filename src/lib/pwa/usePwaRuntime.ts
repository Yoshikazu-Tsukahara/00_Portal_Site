"use client";

import { useEffect } from "react";
import { useStandaloneDisplay } from "@/lib/useStandaloneDisplay";
import type { PwaAppConfig } from "./types";
import { armPwaInstallCapture } from "./bipCapture";
import {
  canUsePwaServiceWorker,
  ensurePwaServiceWorker,
  unregisterAppServiceWorker,
} from "./swRegister";

/** PWA 対応アプリを開いている間ずっと付く共通クラス */
const SHARED_ACTIVE_CLASS = "pwa-app-active";
/** ゲーム系のみ：縦のバウンスまで止める */
const SHARED_HARD_LOCK_CLASS = "pwa-app-active--hard";
/** standalone（ホーム画面から起動）中だけ付く共通クラス */
const SHARED_STANDALONE_CLASS = "pwa-standalone";

export { ensurePwaServiceWorker } from "./swRegister";

/**
 * 独立 PWA（Type C）共通のランタイム処理。
 *
 * 1. 専用 Service Worker の登録（本番と localhost のみ）
 * 2. html / body への活性クラス付与（バウンス抑制などの土台）
 * 3. standalone 起動時の履歴バック抑止（誤操作でポータルへ戻らないように）
 *
 * 直接使うより `<PwaRuntime />` をアプリの layout.tsx に置くのが基本。
 */
export function usePwaRuntime({
  basePath,
  classPrefix,
  scrollLock = "soft",
  enableServiceWorker = false,
}: PwaAppConfig): { isStandalone: boolean } {
  const { isStandalone } = useStandaloneDisplay();

  useEffect(() => {
    if (!canUsePwaServiceWorker()) return;

    if (enableServiceWorker) {
      // SW 登録より先に BIP を掴む（ページの Install ボタン hydration 前に発火しうる）
      armPwaInstallCapture();
      void ensurePwaServiceWorker(basePath);
    } else {
      void unregisterAppServiceWorker(basePath);
    }
  }, [basePath, enableServiceWorker]);

  useEffect(() => {
    const classes = [SHARED_ACTIVE_CLASS, `${classPrefix}-app-active`];
    if (scrollLock === "hard") classes.push(SHARED_HARD_LOCK_CLASS);

    const targets = [document.documentElement, document.body];
    targets.forEach((el) => el.classList.add(...classes));

    return () => {
      targets.forEach((el) => el.classList.remove(...classes));
    };
  }, [classPrefix, scrollLock]);

  useEffect(() => {
    if (!isStandalone) return;

    const classes = [SHARED_STANDALONE_CLASS, `${classPrefix}-pwa-standalone`];
    const targets = [document.documentElement, document.body];
    targets.forEach((el) => el.classList.add(...classes));

    function lockHistory() {
      window.history.pushState({ pwaApp: classPrefix }, "", window.location.href);
    }

    lockHistory();
    window.addEventListener("popstate", lockHistory);

    return () => {
      targets.forEach((el) => el.classList.remove(...classes));
      window.removeEventListener("popstate", lockHistory);
    };
  }, [classPrefix, isStandalone]);

  return { isStandalone };
}
