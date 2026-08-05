"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Printer } from "lucide-react";

import { fmt } from "@/i18n";
import type { InvoiceMakerDict } from "@/i18n/apps/invoiceMaker";

/** A4 幅 210mm を CSS ピクセル換算（96dpi） */
const SHEET_WIDTH_PX = 794;

type PreviewModalProps = {
  open: boolean;
  copy: InvoiceMakerDict["preview"];
  /** 書類言語の自称（PDF 印字言語の明示） */
  docLanguageLabel: string;
  onClose: () => void;
  onPrint: () => void;
  children: ReactNode;
};

/**
 * A4 完成形を中央に出すプレビューモーダル。
 * シートは枠幅に合わせて縮小し、印刷は別途 PrintLayer 経由で実寸出力する。
 */
export default function PreviewModal({
  open,
  copy,
  docLanguageLabel,
  onClose,
  onPrint,
  children,
}: PreviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState(0);

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

  useEffect(() => {
    if (!open || !mounted) return;
    const frame = frameRef.current;
    const sheet = sheetRef.current;
    if (!frame || !sheet) return;

    function sync() {
      if (!frame || !sheet) return;
      const next = Math.min(1, frame.clientWidth / SHEET_WIDTH_PX);
      setScale(next);
      setScaledHeight(sheet.offsetHeight * next);
    }

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(frame);
    observer.observe(sheet);
    return () => observer.disconnect();
  }, [open, mounted, children]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className={`inv-modal-root ${visible ? "inv-modal-root--visible" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={copy.modalTitle}
    >
      <button
        type="button"
        className="inv-modal-backdrop"
        aria-label={copy.close}
        onClick={onClose}
      />
      <div
        className={`inv-modal-panel inv-modal-panel--preview ${
          visible ? "inv-modal-panel--visible" : ""
        }`}
      >
        <header className="inv-modal-header print:hidden">
          <div className="min-w-0">
            <h2 className="inv-modal-title">{copy.modalTitle}</h2>
            <p className="inv-modal-lead">{copy.hint}</p>
            <p className="mt-1 text-[11px] font-medium text-sky-800/90 print:hidden">
              {fmt(copy.docLanguageNote, { language: docLanguageLabel })}
            </p>
            <p
              className="mt-1.5 break-words text-[11px] leading-relaxed text-amber-700/90 print:hidden"
              role="note"
            >
              {copy.emptyHint}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button type="button" onClick={onPrint} className="inv-print-btn">
              <Printer className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
              {copy.print}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inv-modal-close"
            >
              {copy.close}
            </button>
          </div>
        </header>

        <div ref={frameRef} className="inv-modal-preview-frame">
          <div
            style={{
              height: scaledHeight || undefined,
              visibility: scaledHeight ? undefined : "hidden",
            }}
          >
            <div
              ref={sheetRef}
              style={{
                width: SHEET_WIDTH_PX,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
              className="shadow-[0_1px_2px_rgba(24,24,27,0.06),0_18px_40px_-24px_rgba(24,24,27,0.35)]"
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
