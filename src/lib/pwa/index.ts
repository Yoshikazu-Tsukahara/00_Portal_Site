/**
 * 独立 PWA（AppShell の Type C）共通基盤。
 *
 * 使い方:
 * 1. アプリの layout.tsx に `<PwaRuntime basePath="/xxx" classPrefix="xxx" />` を置く
 * 2. アプリの page.tsx で `<AppShell isPwa ...>` を使う
 *
 * インストール（manifest + SW + Install ボタン）は **ランチ貯金のみ**:
 * `<PwaRuntime ... enableServiceWorker />` + manifest メタ + InstallAppButton
 */

export type { PwaAppConfig, PwaScrollLock } from "./types";
export { usePwaRuntime } from "./usePwaRuntime";
export { ensurePwaServiceWorker } from "./swRegister";
export {
  usePwaInstall,
  armPwaInstallCapture,
  PWA_INSTALLABLE_BASE_PATH,
  type BeforeInstallPromptEvent,
  type PwaInstallState,
  type PwaInstallResult,
} from "./usePwaInstall";
export type { PwaInstallCopy } from "./installCopy";
