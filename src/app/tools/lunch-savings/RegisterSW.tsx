"use client";

import { useEffect } from "react";

/** Service Worker を登録（PWA 用） */
export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // 開発中は SW を登録しない（キャッシュで混乱しやすい）
    if (process.env.NODE_ENV !== "production") return;

    void navigator.serviceWorker.register("/sw.js").catch(() => {
      // 登録失敗は無視（オフライン非対応でもアプリは動く）
    });
  }, []);

  return null;
}
