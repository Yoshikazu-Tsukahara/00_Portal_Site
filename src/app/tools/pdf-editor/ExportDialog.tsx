"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fmt, useI18n } from "@/i18n";

export type ExportDialogMode = "full" | "extract";

export type ExportDialogValues = {
  addPageNumbers: boolean;
  userPassword: string;
};

/** 出力設定ダイアログ（全出力 / 選択抽出） */
export default function ExportDialog({
  open,
  mode,
  pageCount,
  isExporting,
  onClose,
  onConfirm,
}: {
  open: boolean;
  mode: ExportDialogMode;
  pageCount: number;
  isExporting: boolean;
  onClose: () => void;
  onConfirm: (values: ExportDialogValues) => void;
}) {
  const { t } = useI18n();
  const copy = t.apps.pdfEditor.exportDialog;
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [addPageNumbers, setAddPageNumbers] = useState(false);
  const [userPassword, setUserPassword] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    setAddPageNumbers(false);
    setUserPassword("");
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isExporting) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, isExporting, onClose]);

  if (!mounted || !open) return null;

  const title =
    mode === "extract"
      ? fmt(copy.extractTitle, { count: pageCount })
      : copy.fullTitle;
  const confirmLabel =
    mode === "extract"
      ? isExporting
        ? copy.extracting
        : copy.extractDownload
      : isExporting
        ? copy.exporting
        : copy.download;

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[1px]"
        aria-label={copy.close}
        disabled={isExporting}
        onClick={() => {
          if (!isExporting) onClose();
        }}
      />

      <div
        className={`relative w-full max-w-sm rounded-xl border border-zinc-200 bg-white shadow-2xl transition-all duration-200 ${
          visible ? "scale-100 opacity-100" : "scale-[0.97] opacity-0"
        }`}
      >
        <header className="flex items-center justify-between border-b border-zinc-200/80 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
            <p className="mt-0.5 text-[11px] text-zinc-500">
              {fmt(copy.settingsLine, { count: pageCount })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="btn-secondary !px-2 !py-1 text-xs disabled:opacity-40"
          >
            {copy.close}
          </button>
        </header>

        <div className="space-y-4 px-4 py-4">
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span className="text-xs text-zinc-700">{copy.addPageNumbers}</span>
            <button
              type="button"
              role="switch"
              aria-checked={addPageNumbers}
              onClick={() => setAddPageNumbers((v) => !v)}
              className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                addPageNumbers ? "bg-zinc-900" : "bg-zinc-200"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  addPageNumbers ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </label>
          {addPageNumbers ? (
            <p className="text-[11px] text-zinc-400">
              {fmt(copy.pageNumbersHint, { count: pageCount })}
            </p>
          ) : null}

          <div>
            <label
              htmlFor="export-password"
              className="mb-1 block text-xs text-zinc-700"
            >
              {copy.viewPassword}
            </label>
            <input
              id="export-password"
              type="password"
              autoComplete="new-password"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              placeholder={copy.viewPasswordPlaceholder}
              className="input-field !py-1.5 !text-xs"
            />
            <p className="mt-1 text-[11px] text-zinc-400">{copy.passwordHint}</p>
          </div>
        </div>

        <footer className="flex justify-end gap-2 border-t border-zinc-200/80 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="btn-secondary !px-3 !py-1.5 text-xs disabled:opacity-40"
          >
            {copy.cancel}
          </button>
          <button
            type="button"
            disabled={isExporting || pageCount < 1}
            onClick={() =>
              onConfirm({
                addPageNumbers,
                userPassword,
              })
            }
            className="btn-primary !px-3 !py-1.5 text-xs disabled:opacity-40"
          >
            {confirmLabel}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
