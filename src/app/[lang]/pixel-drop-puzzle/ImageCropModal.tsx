"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import type { CSSProperties } from "react";
import type { PixelDropPuzzleDict } from "@/i18n/apps/pixelDropPuzzle";
import {
  clampCropTransform,
  minCoverScale,
  renderCropToGameImage,
  type CropTransform,
  type LoadedGameImage,
} from "./imageUtil";

export default function ImageCropModal({
  copy,
  image,
  themeStyle,
  variant = "default",
  onConfirm,
  onCancel,
}: {
  copy: PixelDropPuzzleDict["upload"];
  image: HTMLImageElement;
  themeStyle?: CSSProperties;
  /** fullscreen = プレイ中の画像変更フロー用の大きな全面 UI */
  variant?: "default" | "fullscreen";
  onConfirm: (result: LoadedGameImage) => void;
  onCancel: () => void;
}) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [viewSize, setViewSize] = useState({ w: 0, h: 0 });
  const [transform, setTransform] = useState<CropTransform | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    baseOx: number;
    baseOy: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // portal 描画後に計測する（mounted 前は frame が無いので、必ず mounted 依存）
  useLayoutEffect(() => {
    if (!mounted) return;
    const el = frameRef.current;
    if (!el) return;

    function measure() {
      const rect = el!.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (w > 0 && h > 0) {
        setViewSize((prev) =>
          prev.w === w && prev.h === h ? prev : { w, h },
        );
      }
    }

    measure();
    // レイアウト確定の次フレームでも一度測る（flex + aspect-ratio 対策）
    const raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [mounted, variant]);

  useEffect(() => {
    if (viewSize.w <= 0 || viewSize.h <= 0) return;
    if (!image.naturalWidth || !image.naturalHeight) return;

    const scale = minCoverScale(
      image.naturalWidth,
      image.naturalHeight,
      viewSize.w,
      viewSize.h,
    );
    const drawnW = image.naturalWidth * scale;
    const drawnH = image.naturalHeight * scale;
    setTransform(
      clampCropTransform(
        image.naturalWidth,
        image.naturalHeight,
        viewSize.w,
        viewSize.h,
        scale,
        (viewSize.w - drawnW) / 2,
        (viewSize.h - drawnH) / 2,
      ),
    );
  }, [image, viewSize.w, viewSize.h]);

  const applyTransform = useCallback(
    (next: CropTransform) => {
      if (viewSize.w <= 0 || viewSize.h <= 0) return;
      setTransform(
        clampCropTransform(
          image.naturalWidth,
          image.naturalHeight,
          viewSize.w,
          viewSize.h,
          next.scale,
          next.offsetX,
          next.offsetY,
        ),
      );
    },
    [image.naturalWidth, image.naturalHeight, viewSize.w, viewSize.h],
  );

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (!transform) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseOx: transform.offsetX,
      baseOy: transform.offsetY,
    };
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || !transform) return;
    applyTransform({
      ...transform,
      offsetX: drag.baseOx + (e.clientX - drag.startX),
      offsetY: drag.baseOy + (e.clientY - drag.startY),
    });
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    dragRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* 既に解放済み */
    }
  }

  const minScale =
    viewSize.w > 0 && viewSize.h > 0
      ? minCoverScale(image.naturalWidth, image.naturalHeight, viewSize.w, viewSize.h)
      : 1;
  const maxScale = minScale * 4;

  function handleConfirm() {
    if (!transform || viewSize.w <= 0 || viewSize.h <= 0) return;
    onConfirm(renderCropToGameImage(image, viewSize.w, viewSize.h, transform));
  }

  const isFullscreen = variant === "fullscreen";
  const shellClass = isFullscreen
    ? "pxd-image-change-overlay fixed inset-0 z-[80] flex items-center justify-center bg-black/92 p-3 sm:p-6"
    : "fixed inset-0 z-[70] flex items-end justify-center bg-black/80 p-4 sm:items-center";

  const panelClass = isFullscreen
    ? "pxd-image-change-overlay__panel flex max-h-[min(96dvh,920px)] w-full max-w-5xl flex-col rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl sm:p-6"
    : "w-full max-w-3xl rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono shadow-2xl sm:p-5";

  // 高さは aspect-ratio だけで確定させる（flex-1 だと初期計測が 0 になりやすい）
  const frameClass =
    "pxd-crop-frame relative mx-auto w-full shrink-0 touch-none overflow-hidden rounded-lg bg-black";

  if (!mounted) return null;

  return createPortal(
    <div
      className={`pxd-theme-root ${shellClass}`}
      style={themeStyle}
      role="dialog"
      aria-modal
      aria-labelledby="pxd-crop-title"
    >
      <div className={`${panelClass} font-mono`}>
        <div className="mb-3 shrink-0 space-y-1 text-center sm:text-left">
          <p
            id="pxd-crop-title"
            className="text-sm font-semibold text-zinc-100 sm:text-base"
          >
            {copy.cropTitle}
          </p>
          <p className="text-xs leading-relaxed text-zinc-500 sm:text-sm">
            {copy.cropLead}
          </p>
        </div>

        <div
          ref={frameRef}
          className={frameClass}
          style={{
            aspectRatio: "16 / 9",
            maxHeight: isFullscreen ? "min(62dvh, 720px)" : undefined,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {transform && viewSize.h > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.src}
              alt=""
              draggable={false}
              className="absolute left-0 top-0 max-w-none select-none"
              style={{
                width: image.naturalWidth * transform.scale,
                height: image.naturalHeight * transform.scale,
                transform: `translate(${transform.offsetX}px, ${transform.offsetY}px)`,
              }}
            />
          ) : null}
          <div
            className="pxd-crop-ring pointer-events-none absolute inset-0 ring-1 ring-inset"
            aria-hidden
          />
        </div>

        <label className="mt-4 flex shrink-0 items-center gap-3 text-[11px] text-zinc-500 sm:text-xs">
          <span className="shrink-0">{copy.cropZoomLabel}</span>
          <input
            type="range"
            min={minScale}
            max={maxScale}
            step={(maxScale - minScale) / 200}
            value={transform?.scale ?? minScale}
            disabled={!transform}
            className="min-w-0 flex-1 [accent-color:var(--pxd-accent)]"
            onChange={(e) => {
              if (!transform) return;
              const scale = Number(e.target.value);
              const drawnW = image.naturalWidth * scale;
              const drawnH = image.naturalHeight * scale;
              applyTransform({
                scale,
                offsetX: (viewSize.w - drawnW) / 2,
                offsetY: (viewSize.h - drawnH) / 2,
              });
            }}
          />
        </label>

        <div className="mt-4 flex shrink-0 gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-zinc-700 py-2.5 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200 sm:py-3"
          >
            {copy.cropCancel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!transform}
            className="pxd-crop-confirm flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors disabled:opacity-40 sm:py-3"
          >
            {copy.cropConfirm}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
