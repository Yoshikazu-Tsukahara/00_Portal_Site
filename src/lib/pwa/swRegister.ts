"use client";

const SW_LOCAL_HOSTS = ["localhost", "127.0.0.1", "[::1]"];

/** basePath ごとの SW 登録 Promise（インストール待機用） */
const registrationByPath = new Map<
  string,
  Promise<ServiceWorkerRegistration | null>
>();

function normalizeBasePath(basePath: string): string {
  return basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
}

/** 開発（localhost）または本番でのみ SW を触る */
export function canUsePwaServiceWorker(): boolean {
  if (typeof window === "undefined") return false;
  const isLocal = SW_LOCAL_HOSTS.includes(window.location.hostname);
  return process.env.NODE_ENV === "production" || isLocal;
}

/**
 * 期待スコープ以外の同一 script 登録を外し、正しい scope で再登録する。
 * （過去の `/app/` スコープが残ると `/app` を制御できず BIP が発火しない）
 */
async function registerAppServiceWorker(
  basePath: string,
): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator) || !canUsePwaServiceWorker()) {
    return null;
  }

  const scopePath = normalizeBasePath(basePath);
  const scriptUrl = new URL(`${scopePath}/sw.js`, window.location.origin).href;
  const expectedScope = new URL(scopePath, window.location.origin).href;

  try {
    const existing = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      existing.map(async (reg) => {
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
      await new Promise<void>((resolve) => {
        const timer = window.setTimeout(() => resolve(), 2000);
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
  options?: { force?: boolean },
): Promise<ServiceWorkerRegistration | null> {
  const key = normalizeBasePath(basePath);

  if (options?.force) {
    registrationByPath.delete(key);
  }

  let pending = registrationByPath.get(key);
  if (!pending) {
    pending = registerAppServiceWorker(key).then((reg) => {
      // 失敗結果はキャッシュしない（次回クリックで再試行できるようにする）
      if (!reg) registrationByPath.delete(key);
      return reg;
    });
    registrationByPath.set(key, pending);
  }
  return pending;
}

/** 当該アプリの SW を解除（インストール不可に戻す） */
export async function unregisterAppServiceWorker(
  basePath: string,
): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const scopePath = normalizeBasePath(basePath);
  const scriptUrl = new URL(`${scopePath}/sw.js`, window.location.origin).href;
  registrationByPath.delete(scopePath);
  try {
    const existing = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      existing.map(async (reg) => {
        const scriptMatches =
          reg.active?.scriptURL === scriptUrl ||
          reg.waiting?.scriptURL === scriptUrl ||
          reg.installing?.scriptURL === scriptUrl;
        if (scriptMatches) await reg.unregister();
      }),
    );
  } catch {
    // ignore
  }
}
