import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  type BackupEnvelope,
} from "./types";

/** YYYY-MM-DD（ローカル日付） */
function formatDateLocal(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** バックアップ封筒を作成 */
export function createBackupEnvelope<T>(
  appId: string,
  data: T,
): BackupEnvelope<T> {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    appId,
    exportedAt: new Date().toISOString(),
    data,
  };
}

/**
 * JSON ファイルとしてダウンロード（セーブ）。
 * ファイル名例: mail-template-backup-2026-07-20.json
 */
export function downloadBackupJson(
  fileNamePrefix: string,
  envelope: BackupEnvelope,
): void {
  const safePrefix =
    fileNamePrefix.replace(/[^\w\-]+/g, "-").replace(/-+/g, "-") || "app";
  const filename = `${safePrefix}-backup-${formatDateLocal()}.json`;
  const json = JSON.stringify(envelope, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export type ParseBackupResult =
  | { ok: true; data: unknown; envelope: BackupEnvelope }
  | { ok: false; error: string };

/**
 * バックアップ JSON を検証して data を取り出す。
 * expectedAppId と一致しない場合はエラー。
 */
export function parseBackupPayload(
  parsed: unknown,
  expectedAppId: string,
): ParseBackupResult {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      ok: false,
      error: "バックアップファイルの形式が正しくありません。",
    };
  }

  const obj = parsed as Record<string, unknown>;

  // 封筒形式
  if (obj.format === BACKUP_FORMAT) {
    if (typeof obj.appId !== "string" || obj.appId !== expectedAppId) {
      return {
        ok: false,
        error: `別のアプリ用のバックアップです（期待: ${expectedAppId}）。`,
      };
    }
    if (!("data" in obj)) {
      return { ok: false, error: "バックアップにデータが含まれていません。" };
    }
    const envelope = obj as unknown as BackupEnvelope;
    return { ok: true, data: envelope.data, envelope };
  }

  // 後方互換: 封筒なしの生データ（同一アプリ内の旧手動エクスポート想定）
  return {
    ok: true,
    data: parsed,
    envelope: createBackupEnvelope(expectedAppId, parsed),
  };
}

/** ファイルからバックアップを読み取る */
export async function readBackupFile(
  file: File,
  expectedAppId: string,
): Promise<ParseBackupResult> {
  try {
    const text = await file.text();
    const parsed: unknown = JSON.parse(text);
    return parseBackupPayload(parsed, expectedAppId);
  } catch {
    return {
      ok: false,
      error: "JSON ファイルとして読み込めませんでした。",
    };
  }
}
