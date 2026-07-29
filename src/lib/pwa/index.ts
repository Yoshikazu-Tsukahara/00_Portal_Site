/**
 * 独立 PWA（AppShell の Type C）共通基盤。
 *
 * 使い方:
 * 1. アプリの layout.tsx に `<PwaRuntime basePath="/xxx" classPrefix="xxx" />` を置く
 *    （manifest / themeColor などのメタは同じ layout.tsx で宣言する）
 * 2. アプリの page.tsx で `<AppShell isPwa ...>` を使う
 *    （standalone 起動時のヘッダー切り替えは AppShell 側が面倒を見る）
 */

export type { PwaAppConfig, PwaScrollLock } from "./types";
export { usePwaRuntime } from "./usePwaRuntime";
