"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fmt, useI18n } from "@/i18n";
import { renderPagePreviewHighRes } from "./pdfUtils";
import type { PdfPageItem, PdfSource } from "./types";

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {direction === "left" ? (
        <path d="M15 18l-6-6 6-6" />
      ) : (
        <path d="M9 18l6-6-6-6" />
      )}
    </svg>
  );
}

/** ダブルクリックで開くページ拡大モーダル（ページ送り対応） */
export default function PagePreviewModal({
  page,
  currentIndex,
  totalPages,
  sources,
  onClose,
  onNavigate,
}: {
  page: PdfPageItem | null;
  currentIndex: number;
  totalPages: number;
  sources: Map<string, PdfSource>;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const { t } = useI18n();
  const labels = t.apps.pdfEditor;
  const preview = labels.preview;
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const displayIndex = currentIndex + 1;
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < totalPages - 1;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    window.setTimeout(onClose, 180);
  }, [onClose]);

  const goPrev = useCallback(() => {
    if (canGoPrev) onNavigate(currentIndex - 1);
  }, [canGoPrev, currentIndex, onNavigate]);

  const goNext = useCallback(() => {
    if (canGoNext) onNavigate(currentIndex + 1);
  }, [canGoNext, currentIndex, onNavigate]);

  const isOpen = page !== null;

  // 開閉アニメーション
  useEffect(() => {
    if (!isOpen) {
      setVisible(false);
      return;
    }
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  // ページ切替時に高解像度プレビューを読込
  useEffect(() => {
    if (!page) {
      setPreviewUrl(null);
      setError(false);
      setLoading(false);
      return;
    }

    setPreviewUrl(null);
    setError(false);

    if (page.kind === "blank") {
      setLoading(false);
      return;
    }

    const source = sources.get(page.sourceId ?? "");
    if (!source || page.pageIndex === undefined) {
      setError(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    renderPagePreviewHighRes(source, page.pageIndex)
      .then((url) => {
        if (cancelled) return;
        if (url) {
          setPreviewUrl(url);
        } else {
          setError(true);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, sources]);

  useEffect(() => {
    if (!page) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleClose();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [page, handleClose, goPrev, goNext]);

  if (!mounted || !page) return null;

  const isBlank = page.kind === "blank";
  const imageSrc = previewUrl ?? (isBlank ? null : page.thumbnailUrl);

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={fmt(preview.aria, { index: displayIndex })}
    >
      <button
        type="button"
        className="absolute inset-0 bg-zinc-950/45 backdrop-blur-[2px]"
        aria-label={preview.close}
        onClick={handleClose}
      />

      <div
        className={`pointer-events-none relative flex w-full max-w-[min(96vw,820px)] items-center justify-center gap-2 transition-all duration-200 ${
          visible ? "scale-100 opacity-100" : "scale-[0.97] opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={goPrev}
          disabled={!canGoPrev}
          aria-label={preview.prev}
          className="pointer-events-auto btn-secondary !p-2 disabled:pointer-events-none disabled:opacity-35"
        >
          <ChevronIcon direction="left" />
        </button>

        <div className="pointer-events-auto flex max-h-[min(90vh,880px)] w-full max-w-[min(92vw,680px)] flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl">
          <header className="flex shrink-0 items-center gap-3 border-b border-zinc-200/80 px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-900">
                {fmt(preview.pageOf, {
                  current: displayIndex,
                  total: totalPages,
                })}
              </p>
              <p className="truncate text-[11px] text-zinc-500">
                {isBlank
                  ? labels.blank
                  : `${page.sourceName} · p.${(page.pageIndex ?? 0) + 1}`}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary !p-1.5"
              aria-label={preview.close}
            >
              <CloseIcon />
            </button>
          </header>

          <div className="flex min-h-[min(60vh,520px)] flex-1 items-center justify-center overflow-auto bg-zinc-50 p-4">
            {loading ? (
              <p className="text-sm text-zinc-400">{labels.loading}</p>
            ) : error ? (
              <p className="text-sm text-red-600">{preview.failed}</p>
            ) : isBlank ? (
              <div
                className="flex items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white shadow-sm"
                style={{
                  width: Math.min(480, page.width * 0.6),
                  height: Math.min(620, page.height * 0.6),
                  transform: `rotate(${page.rotation}deg)`,
                }}
              >
                <span className="text-sm font-medium text-zinc-400">{labels.blank}</span>
              </div>
            ) : imageSrc ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={imageSrc}
                alt={`${page.sourceName} p.${(page.pageIndex ?? 0) + 1}`}
                className="max-h-[min(78vh,820px)] max-w-full object-contain shadow-sm"
                style={{ transform: `rotate(${page.rotation}deg)` }}
              />
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={!canGoNext}
          aria-label={preview.next}
          className="pointer-events-auto btn-secondary !p-2 disabled:pointer-events-none disabled:opacity-35"
        >
          <ChevronIcon direction="right" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
