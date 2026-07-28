"use client";

import { useEffect } from "react";

/** Palette Collector 専用 Service Worker を登録 */
export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const host = window.location.hostname;
    const isLocal =
      host === "localhost" || host === "127.0.0.1" || host === "[::1]";
    if (process.env.NODE_ENV !== "production" && !isLocal) return;

    void navigator.serviceWorker
      .register("/palette-collector/sw.js", { scope: "/palette-collector/" })
      .catch(() => {
        // 登録失敗は無視
      });
  }, []);

  return null;
}
