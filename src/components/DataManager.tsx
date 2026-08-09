"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  createBackupEnvelope,
  downloadBackupJson,
  readBackupFile,
  type DataManagerConfig,
} from "@/lib/localData";
import { useI18n } from "@/i18n";

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
  const { t } = useI18n();
  const dm = t.dataManager;
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
      setStatus(dm.exportOk);
    } catch {
      setStatus(dm.exportFail);
    }
  }, [appId, fileNamePrefix, getData, dm.exportOk, dm.exportFail]);

  const handleImportClick = useCallback(() => {
    if (!onImport) return;
    fileRef.current?.click();
  }, [onImport]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !onImport) return;

      const confirmed = window.confirm(dm.importConfirm);
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
          setStatus(dm.importInvalid);
          return;
        }
        setStatus(dm.importOk);
      } catch {
        setStatus(dm.importFail);
      } finally {
        setBusy(false);
      }
    },
    [appId, onImport, dm],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={dm.buttonTitle}
        aria-haspopup="dialog"
        aria-label={dm.buttonAria}
        className="app-shell-chrome-btn group inline-flex items-center gap-1.5 rounded-full border border-zinc-200/90 bg-zinc-100/80 px-2.5 py-1 text-[11px] font-medium tracking-tight text-zinc-600 shadow-[0_1px_0_rgba(24,24,27,0.04)] transition-all duration-200 ease-out hover:-translate-y-px hover:border-zinc-300 hover:bg-white hover:text-zinc-900 hover:shadow-sm active:translate-y-0 active:shadow-none sm:gap-1.5 sm:px-3 sm:py-1 sm:text-xs"
      >
        <span
          aria-hidden
          className="text-[12px] leading-none opacity-80 transition-transform duration-200 group-hover:scale-110 sm:text-[13px]"
        >
          💾
        </span>
        <span className="app-shell-chrome-label hidden sm:inline">
          {dm.buttonLabel}
        </span>
        <span className="app-shell-chrome-label sm:hidden">
          {dm.buttonLabelShort}
        </span>
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
                {dm.dialogTitle}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-1 text-sm text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-700"
                aria-label={dm.close}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 px-4 py-4">
              <section
                className="rounded-md border border-zinc-100 bg-zinc-50 px-3 py-3"
                aria-label={dm.safetyHeading}
              >
                <p className="mb-1.5 text-[11px] font-medium text-zinc-700">
                  {dm.safetyHeading}
                </p>
                <p className="text-[11px] leading-relaxed text-zinc-500">
                  {t.messages.safety}
                </p>
              </section>

              {canTransfer ? (
                <div className="space-y-2">
                  <section
                    className="rounded-md border border-amber-200/70 bg-amber-50/50 px-3 py-2.5"
                    aria-label={dm.backupReasonHeading}
                  >
                    <p className="mb-1 text-[11px] font-medium text-zinc-700">
                      {dm.backupReasonHeading}
                    </p>
                    <p className="text-[11px] leading-relaxed text-zinc-500">
                      {t.messages.persistence}
                    </p>
                  </section>
                  <button
                    type="button"
                    onClick={handleExport}
                    disabled={busy}
                    className="btn-primary w-full !py-2.5 text-sm"
                  >
                    {dm.export}
                  </button>
                  <button
                    type="button"
                    onClick={handleImportClick}
                    disabled={busy}
                    className="btn-secondary w-full !py-2.5 text-sm"
                  >
                    {dm.import}
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
                  {dm.noData}
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
