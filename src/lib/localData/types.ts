/**
 * 全ツール共通のバックアップファイル形式。
 * 書き出し JSON はこの封筒（エンベロープ）で包む。
 */
export const BACKUP_FORMAT = "blank-note-backup" as const;
export const BACKUP_VERSION = 1 as const;

export type BackupEnvelope<T = unknown> = {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  /** アプリ識別子（例: "mail-template"）。読込時の取り違え防止用 */
  appId: string;
  /** ISO 8601 */
  exportedAt: string;
  data: T;
};

/** AppShell / DataManager に渡す設定 */
export type DataManagerConfig = {
  /** アプリ識別子（バックアップ検証用。変更しないこと） */
  appId: string;
  /** ダウンロードファイル名の接頭辞（例: mail-template） */
  fileNamePrefix: string;
  /**
   * 書き出し対象データ。未指定の場合は「安心メッセージのみ」表示
   * （セッション完結ツール向け）
   */
  getData?: () => unknown;
  /**
   * 読み込んだ data をアプリへ反映。
   * false を返すか throw すると失敗扱い。
   */
  onImport?: (data: unknown) => boolean | void;
};
