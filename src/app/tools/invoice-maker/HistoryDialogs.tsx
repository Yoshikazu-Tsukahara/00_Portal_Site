"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { fmt } from "@/i18n";
import type { InvoiceMakerDict } from "@/i18n/apps/invoiceMaker";
import type { DocLocale, SavedInvoice } from "./types";

type SaveDialogProps = {
  open: boolean;
  copy: InvoiceMakerDict["history"];
  suggestedName: string;
  onClose: () => void;
  onSave: (name: string) => void;
};

/** 登録名を付けて履歴に保存するダイアログ */
export function SaveInvoiceDialog({
  open,
  copy,
  suggestedName,
  onClose,
  onSave,
}: SaveDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState(suggestedName);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    setName(suggestedName);
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [open, suggestedName]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className={`inv-modal-root ${visible ? "inv-modal-root--visible" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={copy.saveTitle}
    >
      <button
        type="button"
        className="inv-modal-backdrop"
        aria-label={copy.cancel}
        onClick={onClose}
      />
      <div
        className={`inv-modal-panel inv-modal-panel--sm ${
          visible ? "inv-modal-panel--visible" : ""
        }`}
      >
        <header className="inv-modal-header">
          <div className="min-w-0">
            <h2 className="inv-modal-title">{copy.saveTitle}</h2>
            <p className="inv-modal-lead">{copy.saveLead}</p>
          </div>
        </header>
        <div className="space-y-3 p-4">
          <label className="block min-w-0">
            <span className="mb-1 block text-[11px] font-medium text-zinc-500">
              {copy.nameLabel}
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={copy.namePlaceholder}
              className="input-field w-full"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) {
                  e.preventDefault();
                  onSave(name.trim());
                }
              }}
            />
          </label>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              {copy.cancel}
            </button>
            <button
              type="button"
              disabled={!name.trim()}
              onClick={() => onSave(name.trim())}
              className="btn-primary"
            >
              {copy.confirmSave}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

type LoadDialogProps = {
  open: boolean;
  copy: InvoiceMakerDict["history"];
  history: SavedInvoice[];
  locale: DocLocale;
  onClose: () => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  /** 固定サンプルをフォームへ流し込む */
  onLoadSample: () => void;
};

function formatSavedAt(iso: string, locale: DocLocale): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** 保存済み請求書一覧から呼び出す／削除するダイアログ */
export function LoadInvoiceDialog({
  open,
  copy,
  history,
  locale,
  onClose,
  onLoad,
  onDelete,
  onLoadSample,
}: LoadDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className={`inv-modal-root ${visible ? "inv-modal-root--visible" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={copy.loadTitle}
    >
      <button
        type="button"
        className="inv-modal-backdrop"
        aria-label={copy.close}
        onClick={onClose}
      />
      <div
        className={`inv-modal-panel inv-modal-panel--md ${
          visible ? "inv-modal-panel--visible" : ""
        }`}
      >
        <header className="inv-modal-header">
          <div className="min-w-0">
            <h2 className="inv-modal-title">{copy.loadTitle}</h2>
            <p className="inv-modal-lead">{copy.loadLead}</p>
          </div>
          <button type="button" onClick={onClose} className="inv-modal-close">
            {copy.close}
          </button>
        </header>

        <div className="max-h-[min(60dvh,28rem)] overflow-y-auto p-3 sm:p-4">
          <ul className="space-y-2">
            {/* 固定サンプル（削除不可・常に先頭） */}
            <li className="rounded-lg border border-emerald-200/80 bg-emerald-50/50 p-3">
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {copy.sampleName}
                  </p>
                  <p className="mt-0.5 text-[11px] text-emerald-700/80">
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800">
                      {copy.sampleBadge}
                    </span>
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={onLoadSample}
                    className="btn-primary !px-2.5 !py-1.5 text-[11px]"
                  >
                    {copy.loadAction}
                  </button>
                </div>
              </div>
            </li>

            {history.length === 0 ? (
              <li className="py-4 text-center text-[11px] text-zinc-400">
                {copy.empty}
              </li>
            ) : (
              history.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-3"
                >
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900">
                        {item.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-zinc-400">
                        {fmt(copy.savedAt, {
                          date: formatSavedAt(item.savedAt, locale),
                        })}
                        {item.data.invoiceNumber.trim() ? (
                          <span className="ml-2 text-zinc-500">
                            {item.data.invoiceNumber.trim()}
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => onLoad(item.id)}
                        className="btn-primary !px-2.5 !py-1.5 text-[11px]"
                      >
                        {copy.loadAction}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            !window.confirm(
                              fmt(copy.deleteConfirm, { name: item.name }),
                            )
                          ) {
                            return;
                          }
                          onDelete(item.id);
                        }}
                        className="btn-secondary !px-2.5 !py-1.5 text-[11px] text-red-600 hover:text-red-700"
                      >
                        {copy.deleteAction}
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>,
    document.body,
  );
}
