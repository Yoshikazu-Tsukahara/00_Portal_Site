"use client";

import { useEffect } from "react";
import { useStandaloneDisplay } from "@/lib/useStandaloneDisplay";
import type { PwaAppConfig } from "./types";

/** PWA 対応アプリを開いている間ずっと付く共通クラス */
const SHARED_ACTIVE_CLASS = "pwa-app-active";
/** ゲーム系のみ：縦のバウンスまで止める */
const SHARED_HARD_LOCK_CLASS = "pwa-app-active--hard";
/** standalone（ホーム画面から起動）中だけ付く共通クラス */
const SHARED_STANDALONE_CLASS = "pwa-standalone";

const SW_LOCAL_HOSTS = ["localhost", "127.0.0.1", "[::1]"];

/** basePath ごとの SW 登録 Promise（インストール待機用） */
const registrationByPath = new Map<string, Promise<ServiceWorkerRegistration | null>>();

function normalizeBasePath(basePath: string): string {
  return basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
}

/**
 * 期待スコープ以外の同一 script 登録を外し、正しい scope で再登録する。
 * （過去の `/app/` スコープが残ると `/app` を制御できず BIP が発火しない）
 */
async function registerAppServiceWorker(
  basePath: string,
): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;

  const scopePath = normalizeBasePath(basePath);
  const scriptUrl = new URL(`${scopePath}/sw.js`, window.location.origin).href;
  const expectedScope = new URL(scopePath, window.location.origin).href;

  try {
    const existing = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      existing.map(async (reg) => {
        // 同じアプリの SW で、スコープが期待と違うものだけ破棄
        const scriptMatches =
          reg.active?.scriptURL === scriptUrl ||
          reg.waiting?.scriptURL === scriptUrl ||
          reg.installing?.scriptURL === scriptUrl;
        if (!scriptMatches) return;
        if (reg.scope.replace(/\/$/, "") !== expectedScope.replace(/\/$/, "")) {
          await reg.unregister();
        }
      }),
    );

    const reg = await navigator.serviceWorker.register(`${scopePath}/sw.js`, {
      scope: scopePath,
      updateViaCache: "none",
    });

    // 可能ならすぐ制御下に置く（BIP 判定に controller が必要なため）
    await reg.update().catch(() => undefined);
    if (reg.installing) {
      await new Promise<void>((resolve) => {
        const sw = reg.installing;
        if (!sw) {
          resolve();
          return;
        }
        if (sw.state === "activated") {
          resolve();
          return;
        }
        sw.addEventListener("statechange", () => {
          if (sw.state === "activated" || sw.state === "redundant") resolve();
        });
      });
    }
    await navigator.serviceWorker.ready;

    if (!navigator.serviceWorker.controller && reg.active) {
      // 初回はリロード無しだと controller が付かないことがある → claim 待ち
      await new Promise<void>((resolve) => {
        const timer = window.setTimeout(() => resolve(), 1500);
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => {
            window.clearTimeout(timer);
            resolve();
          },
          { once: true },
        );
      });
    }

    return reg;
  } catch {
    return null;
  }
}

/** 指定アプリの SW 登録完了を待つ（インストールボタン用） */
export function ensurePwaServiceWorker(
  basePath: string,
): Promise<ServiceWorkerRegistration | null> {
  const key = normalizeBasePath(basePath);
  let pending = registrationByPath.get(key);
  if (!pending) {
    pending = registerAppServiceWorker(key);
    registrationByPath.set(key, pending);
  }
  return pending;
}

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
}: PwaAppConfig): { isStandalone: boolean } {
  const { isStandalone } = useStandaloneDisplay();

  useEffect(() => {
    const isLocal = SW_LOCAL_HOSTS.includes(window.location.hostname);
    if (process.env.NODE_ENV !== "production" && !isLocal) return;

    void ensurePwaServiceWorker(basePath);
  }, [basePath]);

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
