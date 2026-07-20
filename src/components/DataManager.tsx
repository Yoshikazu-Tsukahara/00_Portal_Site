"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  createBackupEnvelope,
  DATA_SAFETY_MESSAGE,
  downloadBackupJson,
  readBackupFile,
  type DataManagerConfig,
} from "@/lib/localData";

/**
 * ヘッダー用「データ管理（バックアップ）」ボタン＋モーダル。
 * メモリーカードのように、セーブ（書き出し）とロード（読み込み）を提供する。
 */
export default function DataManager({
  appId,
  fileNamePrefix,
  getData,
  onImport,
}: DataManagerConfig) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const canTransfer = Boolean(getData && onImport);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) setStatus(null);
  }, [open]);

  const handleExport = useCallback(() => {
    if (!getData) return;
    try {
      const data = getData();
      const envelope = createBackupEnvelope(appId, data);
      downloadBackupJson(fileNamePrefix, envelope);
      setStatus("バックアップファイルをダウンロードしました。");
    } catch {
      setStatus("書き出しに失敗しました。");
    }
  }, [appId, fileNamePrefix, getData]);

  const handleImportClick = useCallback(() => {
    if (!onImport) return;
    fileRef.current?.click();
  }, [onImport]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !onImport) return;

      const confirmed = window.confirm(
        "現在のデータが上書きされますがよろしいですか？",
      );
      if (!confirmed) return;

      setBusy(true);
      setStatus(null);
      try {
        const result = await readBackupFile(file, appId);
        if (!result.ok) {
          setStatus(result.error);
          return;
        }
        const applied = onImport(result.data);
        if (applied === false) {
          setStatus("データの内容を反映できませんでした。");
          return;
        }
        setStatus("データを読み込みました。");
      } catch {
        setStatus("読み込みに失敗しました。");
      } finally {
        setBusy(false);
      }
    },
    [appId, onImport],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="データ管理（バックアップ・復元）"
        aria-haspopup="dialog"
        aria-label="データ管理（バックアップ・復元）"
        className="group inline-flex items-center gap-1.5 rounded-full border border-zinc-200/90 bg-zinc-100/80 px-2.5 py-1 text-[11px] font-medium tracking-tight text-zinc-600 shadow-[0_1px_0_rgba(24,24,27,0.04)] transition-all duration-200 ease-out hover:-translate-y-px hover:border-zinc-300 hover:bg-white hover:text-zinc-900 hover:shadow-sm active:translate-y-0 active:shadow-none sm:gap-1.5 sm:px-3 sm:py-1 sm:text-xs"
      >
        <span
          aria-hidden
          className="text-[12px] leading-none opacity-80 transition-transform duration-200 group-hover:scale-110 sm:text-[13px]"
        >
          💾
        </span>
        <span className="hidden sm:inline">バックアップ</span>
        <span className="sm:hidden">データ</span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-zinc-950/40 p-4 sm:items-center"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="flex w-full max-w-md flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
              <h2
                id={titleId}
                className="text-sm font-semibold tracking-tight text-zinc-900"
              >
                データ管理（バックアップ・復元）
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-1 text-sm text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-700"
                aria-label="閉じる"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 px-4 py-4">
              {/* 安心メッセージ */}
              <section
                className="rounded-md border border-zinc-100 bg-zinc-50 px-3 py-3"
                aria-label="データの安全性について"
              >
                <p className="mb-1.5 text-[11px] font-medium text-zinc-700">
                  データの安全性について
                </p>
                <p className="text-[11px] leading-relaxed text-zinc-500">
                  {DATA_SAFETY_MESSAGE}
                </p>
              </section>

              {canTransfer ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleExport}
                    disabled={busy}
                    className="btn-primary w-full !py-2.5 text-sm"
                  >
                    📥 データを書き出す（セーブ）
                  </button>
                  <button
                    type="button"
                    onClick={handleImportClick}
                    disabled={busy}
                    className="btn-secondary w-full !py-2.5 text-sm"
                  >
                    📤 データを読み込む（ロード）
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <p className="text-[11px] leading-relaxed text-zinc-400">
                  このツールはセッション内でのみ動作し、保存する設定データはありません。処理内容が外部に送られることもありません。
                </p>
              )}

              {status ? (
                <p
                  className="text-center text-[11px] text-zinc-600"
                  role="status"
                >
                  {status}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
