"use client";

import { useEffect } from "react";

/**
 * ランチ貯金専用 Service Worker を登録。
 * スクリプト配置を /lunch-savings/sw.js にし、スコープをアプリ配下に限定する。
 */
export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const host = window.location.hostname;
    const isLocal =
      host === "localhost" || host === "127.0.0.1" || host === "[::1]";
    // 本番と localhost のみ登録
    if (process.env.NODE_ENV !== "production" && !isLocal) return;

    void navigator.serviceWorker
      .register("/lunch-savings/sw.js", { scope: "/lunch-savings/" })
      .catch(() => {
        // 登録失敗は無視（オフライン非対応でもアプリは動く）
      });
  }, []);

  return null;
}
