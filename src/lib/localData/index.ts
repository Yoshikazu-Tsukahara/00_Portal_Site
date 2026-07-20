/**
 * 全ツール共通のデータ保存・バックアップ基盤。
 *
 * - LocalStorage へのオートセーブ
 * - JSON 書き出し（セーブ）/ 読み込み（ロード）
 * - データの安全性についての文言
 *
 * 使い方の概要:
 * 1. アプリデータを `saveLocalJson` / `useLocalStorageState` で保存
 * 2. AppShell の `dataManager` に appId・getData・onImport を渡す
 */

export {
  createBackupEnvelope,
  downloadBackupJson,
  parseBackupPayload,
  readBackupFile,
  type ParseBackupResult,
} from "./backup";
export { DATA_SAFETY_MESSAGE, DATA_SAFETY_SHORT } from "./messages";
export {
  loadLocalJson,
  removeLocalJson,
  saveLocalJson,
} from "./storage";
export {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  type BackupEnvelope,
  type DataManagerConfig,
} from "./types";
export { useLocalStorageState } from "./useLocalStorageState";
