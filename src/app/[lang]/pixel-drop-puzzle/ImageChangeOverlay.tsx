"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties } from "react";
import type { PixelDropPuzzleDict } from "@/i18n/apps/pixelDropPuzzle";
import ImageCropModal from "./ImageCropModal";
import { loadImageFromFile, type LoadedGameImage } from "./imageUtil";

/**
 * プレイ中の「画像を変更」フロー用の全面オーバーレイ。
 * document.body へポータルし、サイドレールの overflow / transform の影響を受けない。
 */
export default function ImageChangeOverlay({
  open,
  copy,
  themeStyle,
  onClose,
  onConfirm,
  onRestoreDefault,
  usingDefaultImage,
}: {
  open: boolean;
  copy: PixelDropPuzzleDict["upload"];
  themeStyle: CSSProperties;
  onClose: () => void;
  onConfirm: (image: LoadedGameImage) => void;
  onRestoreDefault: () => void;
  usingDefaultImage: boolean;
}) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setPendingImage(null);
      setError(null);
      setBusy(false);
      return;
    }
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !pendingImage) {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, pendingImage, onClose]);

  if (!open || !mounted) return null;

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const img = await loadImageFromFile(file);
      setPendingImage(img);
    } catch {
      setError(copy.errorInvalidFile);
    } finally {
      setBusy(false);
    }
  }

  function handleCropConfirm(image: LoadedGameImage) {
    setPendingImage(null);
    onConfirm(image);
  }

  function handleCropCancel() {
    setPendingImage(null);
  }

  // ImageCropModal 自身が body へ portal する（二重 portal しない）
  if (pendingImage) {
    return (
      <ImageCropModal
        copy={copy}
        image={pendingImage}
        themeStyle={themeStyle}
        variant="fullscreen"
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
      />
    );
  }

  return createPortal(
    <div
      className="pxd-theme-root pxd-image-change-overlay fixed inset-0 z-[80] flex items-center justify-center bg-black/88 p-4 sm:p-6"
      style={themeStyle}
      role="dialog"
      aria-modal
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="pxd-image-change-overlay__panel pointer-events-auto w-full max-w-lg font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="pxd-records-rail__eyebrow">{copy.changeOverlayEyebrow}</p>
        <h2 id={titleId} className="pxd-image-change-overlay__title">
          {copy.changeOverlayTitle}
        </h2>
        <p className="pxd-image-change-overlay__lead">{copy.changeOverlayLead}</p>
        <div className="pxd-records-rail__divider" aria-hidden />

        <label className="pxd-upload-primary mt-2 flex cursor-pointer items-center justify-center rounded-lg px-6 py-3 text-sm font-bold tracking-wide">
          {busy ? copy.buttonBusy : copy.changeButton}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void handleFile(file);
            }}
          />
        </label>

        {!usingDefaultImage ? (
          <button
            type="button"
            onClick={onRestoreDefault}
            className="mt-3 w-full rounded-lg border border-zinc-700 py-2.5 text-sm text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
          >
            {copy.restoreDefaultButton}
          </button>
        ) : null}

        {error ? <p className="mt-3 text-center text-xs text-red-400">{error}</p> : null}
        <p className="mt-4 text-center text-[10px] leading-relaxed text-zinc-500">
          {copy.hint}
        </p>

        <div className="pxd-records-rail__divider mt-5" aria-hidden />
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full rounded-lg border border-zinc-700 py-2.5 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
        >
          {copy.changeOverlayResume}
        </button>
      </div>
    </div>,
    document.body,
  );
}
