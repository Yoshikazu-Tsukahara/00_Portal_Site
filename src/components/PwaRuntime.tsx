"use client";

import { usePwaRuntime, type PwaAppConfig } from "@/lib/pwa";

/**
 * 独立 PWA（AppShell の Type C）のお作法をまとめて適用するだけの部品。
 * Service Worker 登録・活性クラス・standalone 時の履歴ロックを一括で行う。
 *
 * アプリの layout.tsx に 1 つ置く:
 * ```tsx
 * <PwaRuntime basePath="/lunch-savings" classPrefix="lunch" enableServiceWorker />
 * ```
 * ※ `enableServiceWorker` はランチ貯金のみ true（他アプリはインストール不可）。
 */
export default function PwaRuntime(config: PwaAppConfig) {
  usePwaRuntime(config);
  return null;
}
