"use client";

import {
  ImagePlus,
  Minus,
  Pipette,
  Plus,
  RefreshCw,
  Search,
  UploadCloud,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { PaletteCollectorDict } from "@/i18n/apps/paletteCollector";
import {
  buildAnalysisImageData,
  buildHexMatchOverlay,
  rgbToHex,
  type ImageRegion,
} from "./colorMath";
import {
  extractImageFileFromClipboard,
  isImageFile,
  loadImageFromFile,
} from "./imageLoad";
import type { ColorPickSource } from "./types";

export type ColorHighlight = {
  hex: string;
  source?: ColorPickSource;
};

/** ルーペ（拡大鏡）1辺のサイズ(px) */
const LOUPE_SIZE = 132;
/** ルーペに映す元画像側のサンプリング範囲(px, 奇数推奨) */
const SAMPLE_SIZE = 15;
/** クリックと領域ドラッグを区別する移動量(px) */
const DRAG_THRESHOLD = 6;
/** ズーム倍率（100% = コンテナにフィット） */
const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const ZOOM_STEP = 1.15;

/** Lucide「Pipette」と同じパス（UIのスポイト表示と一致） */
const LUCIDE_PIPETTE_PATHS = [
  "m12 9-8.414 8.414A2 2 0 0 0 3 18.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 3.828 21h1.344a2 2 0 0 0 1.414-.586L15 12",
  "m18 9 .4.4a1 1 0 1 1-3 3l-3.8-3.8a1 1 0 1 1 3-3l.4.4 3.4-3.4a1 1 0 1 1 3 3z",
  "m2 22 .414-.414",
] as const;

/** 色抽出時のスポイトカーソル（先端 2,22 をホットスポット） */
const EYEDROPPER_CURSOR = (() => {
  const paths = LUCIDE_PIPETTE_PATHS.map((d) => `<path d="${d}"/>`).join("");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">` +
    `<g stroke="#fff" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round">${paths}</g>` +
    `<g stroke="#64748b" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">${paths}</g>` +
    `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 2 22, auto`;
})();

type LoupeState = {
  hex: string;
  left: number;
  top: number;
};

type DragSession =
  | {
      kind: "region";
      startClientX: number;
      startClientY: number;
      pointerId: number;
      moved: boolean;
    }
  | {
      kind: "pan";
      startClientX: number;
      startClientY: number;
      startScrollLeft: number;
      startScrollTop: number;
      pointerId: number;
    };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeRegion(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  imgW: number,
  imgH: number,
): ImageRegion | null {
  const left = Math.floor(Math.min(x0, x1));
  const top = Math.floor(Math.min(y0, y1));
  const right = Math.ceil(Math.max(x0, x1));
  const bottom = Math.ceil(Math.max(y0, y1));
  const x = clamp(left, 0, imgW - 1);
  const y = clamp(top, 0, imgH - 1);
  const w = clamp(right - left, 1, imgW - x);
  const h = clamp(bottom - top, 1, imgH - y);
  if (w < 2 || h < 2) return null;
  return { x, y, w, h };
}

export default function ImageStage({
  image,
  onImageLoaded,
  onPickColor,
  colorHighlight,
  regionSelectMode,
  onRegionConfirmed,
  onBeforeImageReplace,
  copy,
}: {
  image: HTMLImageElement | null;
  onImageLoaded: (image: HTMLImageElement) => void;
  onPickColor: (hex: string, source?: ColorPickSource) => void;
  /** パレット選択中の色を画像上に表示 */
  colorHighlight: ColorHighlight | null;
  /** true のときだけドラッグで領域選択（通常はスポイト優先） */
  regionSelectMode: boolean;
  onRegionConfirmed: (region: ImageRegion) => void;
  /**
   * 新しい画像を読み込む直前の確認。
   * false を返すと読み込みを中断する（パレットがあるときのリセット警告用）。
   */
  onBeforeImageReplace: () => boolean;
  copy: PaletteCollectorDict["stage"];
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const highlightCanvasRef = useRef<HTMLCanvasElement>(null);
  const loupeCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<DragSession | null>(null);
  const zoomRef = useRef(1);
  const fitSizeRef = useRef({ w: 0, h: 0 });

  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loupe, setLoupe] = useState<LoupeState | null>(null);
  const [zoom, setZoom] = useState(1);
  const [fitSize, setFitSize] = useState({ w: 0, h: 0 });
  const [draftRegion, setDraftRegion] = useState<ImageRegion | null>(null);
  const [spaceHeld, setSpaceHeld] = useState(false);

  const imgW = image ? image.naturalWidth || image.width : 0;
  const imgH = image ? image.naturalHeight || image.height : 0;
  const displayW = fitSize.w * zoom;
  const displayH = fitSize.h * zoom;

  zoomRef.current = zoom;
  fitSizeRef.current = fitSize;

  const handleFile = useCallback(
    async (file: File) => {
      if (!isImageFile(file)) {
        setError(copy.invalidFile);
        return;
      }
      // パレットがある場合はここで確認。キャンセルなら読み込まない
      if (!onBeforeImageReplace()) return;
      setError(null);
      setLoading(true);
      try {
        const img = await loadImageFromFile(file);
        onImageLoaded(img);
      } catch {
        setError(copy.invalidFile);
      } finally {
        setLoading(false);
      }
    },
    [copy.invalidFile, onBeforeImageReplace, onImageLoaded],
  );

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const file = extractImageFileFromClipboard(e);
      if (!file) return;
      e.preventDefault();
      void handleFile(file);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFile]);

  // Space 押しでパンモード（拡大時）
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code !== "Space" || e.repeat) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      setSpaceHeld(true);
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === "Space") setSpaceHeld(false);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // 領域選択モード終了時は下書き枠を消す
  useEffect(() => {
    if (!regionSelectMode) setDraftRegion(null);
  }, [regionSelectMode]);

  useEffect(() => {
    setZoom(1);
    setDraftRegion(null);
    setLoupe(null);

    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    canvas.width = imgW;
    canvas.height = imgH;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(image, 0, 0);
  }, [image, imgW, imgH]);

  // 選択中パレット色の一致領域オーバーレイ
  useEffect(() => {
    const overlay = highlightCanvasRef.current;
    if (!overlay) return;

    if (!colorHighlight || !image) {
      overlay.width = 0;
      overlay.height = 0;
      return;
    }

    const analysis = buildAnalysisImageData(image, 520);
    if (!analysis) {
      overlay.width = 0;
      overlay.height = 0;
      return;
    }

    overlay.width = analysis.width;
    overlay.height = analysis.height;
    const octx = overlay.getContext("2d");
    if (!octx) return;

    const mask = buildHexMatchOverlay(analysis, colorHighlight.hex, 14, 150);
    octx.putImageData(mask, 0, 0);
  }, [colorHighlight, image, imgW, imgH]);

  // スポイト位置へスクロール（拡大・パン時）
  useEffect(() => {
    const source = colorHighlight?.source;
    const viewport = viewportRef.current;
    if (!source || !viewport || imgW <= 0 || imgH <= 0) return;

    const displayX = (source.x / imgW) * displayW;
    const displayY = (source.y / imgH) * displayH;
    viewport.scrollTo({
      left: Math.max(0, displayX - viewport.clientWidth / 2),
      top: Math.max(0, displayY - viewport.clientHeight / 2),
      behavior: "smooth",
    });
  }, [
    colorHighlight?.source?.x,
    colorHighlight?.source?.y,
    colorHighlight?.hex,
    displayW,
    displayH,
    imgW,
    imgH,
  ]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !image || imgW <= 0 || imgH <= 0) {
      setFitSize({ w: 0, h: 0 });
      return;
    }

    function measure() {
      const el = viewportRef.current;
      if (!el) return;
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      if (cw <= 0 || ch <= 0) return;
      const scale = Math.min(cw / imgW, ch / imgH);
      setFitSize({
        w: Math.max(1, Math.floor(imgW * scale)),
        h: Math.max(1, Math.floor(imgH * scale)),
      });
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    return () => ro.disconnect();
  }, [image, imgW, imgH]);

  /**
   * カーソル位置を基準にズームし、スクロール位置を補正する。
   * 拡大時は左上起点レイアウトなので、相対位置(0〜1)から scroll を直接計算できる。
   */
  const applyZoomAt = useCallback(
    (nextZoom: number, clientX?: number, clientY?: number) => {
      const viewport = viewportRef.current;
      const canvas = canvasRef.current;
      const z = clamp(Number(nextZoom.toFixed(3)), MIN_ZOOM, MAX_ZOOM);
      const prev = zoomRef.current;
      if (Math.abs(z - prev) < 0.001) {
        setZoom(z);
        return;
      }

      const vpRect = viewport?.getBoundingClientRect();
      const canvasRect = canvas?.getBoundingClientRect();
      const cx = clientX ?? (vpRect ? vpRect.left + vpRect.width / 2 : 0);
      const cy = clientY ?? (vpRect ? vpRect.top + vpRect.height / 2 : 0);

      let relX = 0.5;
      let relY = 0.5;
      if (canvasRect && canvasRect.width > 0 && canvasRect.height > 0) {
        relX = clamp((cx - canvasRect.left) / canvasRect.width, 0, 1);
        relY = clamp((cy - canvasRect.top) / canvasRect.height, 0, 1);
      }

      setZoom(z);

      requestAnimationFrame(() => {
        const vp = viewportRef.current;
        if (!vp) return;
        if (z <= 1) {
          vp.scrollLeft = 0;
          vp.scrollTop = 0;
          return;
        }
        const fit = fitSizeRef.current;
        const cssW = fit.w * z;
        const cssH = fit.h * z;
        const r = vp.getBoundingClientRect();
        vp.scrollLeft = relX * cssW - (cx - r.left);
        vp.scrollTop = relY * cssH - (cy - r.top);
      });
    },
    [],
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !image) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
      applyZoomAt(zoomRef.current * factor, e.clientX, e.clientY);
    }
    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, [image, applyZoomAt]);

  function clientToImage(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width <= 0 || canvas.height <= 0) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const x = Math.floor(((clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((clientY - rect.top) / rect.height) * canvas.height);
    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return null;
    return { x, y };
  }

  function readPixelHex(x: number, y: number): string | null {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    try {
      const data = ctx.getImageData(x, y, 1, 1).data;
      return rgbToHex({ r: data[0], g: data[1], b: data[2] });
    } catch {
      return null;
    }
  }

  function updateLoupe(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    const loupeCanvas = loupeCanvasRef.current;
    if (!canvas || !frame || !loupeCanvas) return;

    const pos = clientToImage(clientX, clientY);
    if (!pos) {
      setLoupe(null);
      return;
    }
    const hex = readPixelHex(pos.x, pos.y);
    if (!hex) return;

    const half = Math.floor(SAMPLE_SIZE / 2);
    const lctx = loupeCanvas.getContext("2d");
    if (lctx) {
      lctx.imageSmoothingEnabled = false;
      lctx.clearRect(0, 0, loupeCanvas.width, loupeCanvas.height);
      const sx = clamp(pos.x - half, 0, Math.max(0, canvas.width - SAMPLE_SIZE));
      const sy = clamp(pos.y - half, 0, Math.max(0, canvas.height - SAMPLE_SIZE));
      lctx.drawImage(
        canvas,
        sx,
        sy,
        SAMPLE_SIZE,
        SAMPLE_SIZE,
        0,
        0,
        loupeCanvas.width,
        loupeCanvas.height,
      );
      const cell = loupeCanvas.width / SAMPLE_SIZE;
      lctx.strokeStyle = "rgba(255,255,255,0.95)";
      lctx.lineWidth = 2;
      lctx.strokeRect((pos.x - sx) * cell, (pos.y - sy) * cell, cell, cell);
    }

    const frameRect = frame.getBoundingClientRect();
    setLoupe({
      hex,
      left: clamp(
        clientX - frameRect.left - LOUPE_SIZE / 2,
        8,
        frameRect.width - LOUPE_SIZE - 8,
      ),
      top: clamp(
        clientY - frameRect.top - 96,
        8,
        frameRect.height - LOUPE_SIZE - 8,
      ),
    });
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (!image) return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    // 中ボタ / Space+左 / Alt+左 → パン（拡大時）
    const wantPan =
      zoom > 1 &&
      (e.button === 1 ||
        (e.button === 0 && (spaceHeld || e.altKey)));

    if (wantPan) {
      e.preventDefault();
      dragRef.current = {
        kind: "pan",
        startClientX: e.clientX,
        startClientY: e.clientY,
        startScrollLeft: viewport.scrollLeft,
        startScrollTop: viewport.scrollTop,
        pointerId: e.pointerId,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
      setLoupe(null);
      return;
    }

    if (e.button !== 0) return;
    const pos = clientToImage(e.clientX, e.clientY);
    if (!pos) return;

    if (regionSelectMode) {
      dragRef.current = {
        kind: "region",
        startClientX: e.clientX,
        startClientY: e.clientY,
        pointerId: e.pointerId,
        moved: false,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
      setLoupe(null);
      return;
    }

    // 通常モード：クリック待ち（移動が少なければスポイト）
    dragRef.current = {
      kind: "region", // 一時的に移動量だけ見る（選択はしない）
      startClientX: e.clientX,
      startClientY: e.clientY,
      pointerId: e.pointerId,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!image) return;
    const drag = dragRef.current;
    const viewport = viewportRef.current;

    if (drag && drag.pointerId === e.pointerId) {
      if (drag.kind === "pan" && viewport) {
        viewport.scrollLeft =
          drag.startScrollLeft - (e.clientX - drag.startClientX);
        viewport.scrollTop =
          drag.startScrollTop - (e.clientY - drag.startClientY);
        return;
      }

      if (drag.kind === "region") {
        const dx = e.clientX - drag.startClientX;
        const dy = e.clientY - drag.startClientY;
        if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) {
          return;
        }
        drag.moved = true;

        if (!regionSelectMode) {
          // 通常モードでドラッグしても領域選択しない
          setLoupe(null);
          return;
        }

        const start = clientToImage(drag.startClientX, drag.startClientY);
        const end = clientToImage(e.clientX, e.clientY);
        if (!start || !end) {
          setDraftRegion(null);
          return;
        }
        setDraftRegion(
          normalizeRegion(start.x, start.y, end.x, end.y, imgW, imgH),
        );
        return;
      }
    }

    if (regionSelectMode || spaceHeld) {
      setLoupe(null);
      return;
    }
    if (clientToImage(e.clientX, e.clientY)) {
      updateLoupe(e.clientX, e.clientY);
    } else {
      setLoupe(null);
    }
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (drag.kind === "pan") return;

    if (regionSelectMode) {
      if (!drag.moved) return;
      const start = clientToImage(drag.startClientX, drag.startClientY);
      const end = clientToImage(e.clientX, e.clientY);
      const finalized =
        start && end
          ? normalizeRegion(start.x, start.y, end.x, end.y, imgW, imgH)
          : draftRegion;
      setDraftRegion(null);
      if (finalized) onRegionConfirmed(finalized);
      return;
    }

    // 通常：ほとんど動かしていなければスポイト
    if (drag.moved) return;
    const pos = clientToImage(e.clientX, e.clientY);
    if (!pos) return;
    const hex = readPixelHex(pos.x, pos.y);
    if (hex) onPickColor(hex, { x: pos.x, y: pos.y });
  }

  function handlePointerLeave() {
    if (!dragRef.current) setLoupe(null);
  }

  function handleResetZoom() {
    applyZoomAt(1);
  }

  const zoomPercent = Math.round(zoom * 100);
  const panCursor = spaceHeld && zoom > 1;
  const cursorClass = panCursor
    ? "cursor-grab"
    : regionSelectMode
      ? "cursor-crosshair"
      : "";
  const viewportCursorStyle =
    !panCursor && !regionSelectMode
      ? { cursor: EYEDROPPER_CURSOR }
      : undefined;

  if (!image) {
    return (
      <div className="flex flex-col gap-3">
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={(e) => {
            e.preventDefault();
            setIsDraggingFile(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingFile(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDraggingFile(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingFile(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void handleFile(file);
          }}
          className={`flex min-h-[16rem] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors sm:min-h-[22rem] ${
            isDraggingFile
              ? "border-orange-400 bg-orange-50"
              : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
          }`}
        >
          <UploadCloud
            className={`size-9 ${isDraggingFile ? "text-orange-500" : "text-gray-400"}`}
            aria-hidden
          />
          <div>
            <p className="text-sm font-semibold text-gray-900 sm:text-base">
              {copy.dropTitle}
            </p>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              {copy.dropHint}
            </p>
          </div>
          <p className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-medium text-gray-600 sm:text-xs">
            <ImagePlus className="size-3.5" aria-hidden />
            {copy.pasteHint}
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="mt-1 rounded-full bg-gray-900 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-gray-800 sm:text-sm"
          >
            {copy.chooseFile}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = "";
            }}
          />
        </div>

        {error ? (
          <p className="text-xs font-medium text-rose-600">{error}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center justify-end gap-1">
        <button
          type="button"
          onClick={() => applyZoomAt(zoom / ZOOM_STEP)}
          disabled={zoom <= MIN_ZOOM}
          className="inline-flex size-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-40"
          title="-"
          aria-label="-"
        >
          <Minus className="size-3.5" aria-hidden />
        </button>
        <span className="min-w-[3rem] rounded-full border border-gray-200 bg-white px-2.5 py-1 text-center text-[11px] font-semibold tabular-nums text-gray-700 shadow-sm">
          {zoomPercent}%
        </span>
        <button
          type="button"
          onClick={() => applyZoomAt(zoom * ZOOM_STEP)}
          disabled={zoom >= MAX_ZOOM}
          className="inline-flex size-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-40"
          title="+"
          aria-label="+"
        >
          <Plus className="size-3.5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={handleResetZoom}
          disabled={zoom === 1}
          title={copy.resetZoom}
          className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:cursor-default disabled:opacity-40"
        >
          <Search className="size-3" aria-hidden />
          {copy.resetZoom}
        </button>
      </div>

      <div
        ref={frameRef}
        className={`relative h-[min(56vh,28rem)] overflow-hidden rounded-2xl border bg-gray-100 ${
          regionSelectMode
            ? "border-sky-400 ring-2 ring-sky-200"
            : "border-gray-200"
        }`}
      >
        {regionSelectMode ? (
          <div className="pointer-events-none absolute top-2 left-1/2 z-30 -translate-x-1/2 rounded-full bg-sky-600 px-3 py-1 text-[11px] font-semibold text-white shadow">
            {copy.regionSelectBanner}
          </div>
        ) : null}

        <div
          ref={viewportRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          className={`h-full touch-none select-none overflow-auto ${cursorClass}`}
          style={viewportCursorStyle}
        >
          {/*
            端までスクロールできるよう、ラッパーを常に viewport 以上にする。
            ズーム1では中央寄せ、拡大時はコンテンツ実寸がスクロール領域になる。
          */}
          <div
            className={`flex ${
              zoom > 1
                ? "items-start justify-start"
                : "items-center justify-center"
            }`}
            style={{
              minWidth: "100%",
              minHeight: "100%",
              width: displayW > 0 ? Math.max(displayW, 1) : "100%",
              height: displayH > 0 ? Math.max(displayH, 1) : "100%",
            }}
          >
            <div
              className="relative shrink-0"
              style={{
                width: displayW > 0 ? displayW : undefined,
                height: displayH > 0 ? displayH : undefined,
              }}
            >
              <canvas
                ref={canvasRef}
                className="block h-full w-full max-w-none"
                style={{
                  width: displayW > 0 ? displayW : undefined,
                  height: displayH > 0 ? displayH : undefined,
                }}
              />

              {colorHighlight ? (
                <canvas
                  ref={highlightCanvasRef}
                  aria-hidden
                  className="pointer-events-none absolute inset-0 h-full w-full max-w-none opacity-80"
                  style={{
                    width: displayW > 0 ? displayW : undefined,
                    height: displayH > 0 ? displayH : undefined,
                  }}
                />
              ) : null}

              {colorHighlight?.source && imgW > 0 && imgH > 0 ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute z-[6] -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${(colorHighlight.source.x / imgW) * 100}%`,
                    top: `${(colorHighlight.source.y / imgH) * 100}%`,
                  }}
                >
                  <span className="absolute left-1/2 top-1/2 size-[1.125rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 shadow-[0_0_0_1px_rgba(15,23,42,0.12)]" />
                  <span
                    className="relative block size-2 rounded-full shadow-[0_1px_2px_rgba(15,23,42,0.2)] ring-[1.5px] ring-white"
                    style={{ backgroundColor: colorHighlight.hex }}
                  />
                </div>
              ) : null}

              {draftRegion ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute border-2 border-sky-500 bg-sky-400/25 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5)]"
                  style={{
                    left: `${(draftRegion.x / imgW) * 100}%`,
                    top: `${(draftRegion.y / imgH) * 100}%`,
                    width: `${(draftRegion.w / imgW) * 100}%`,
                    height: `${(draftRegion.h / imgH) * 100}%`,
                  }}
                />
              ) : null}
            </div>
          </div>
        </div>

        {loupe && !regionSelectMode ? (
          <div
            aria-hidden
            className="pointer-events-none absolute z-10 flex flex-col items-center gap-1"
            style={{ left: loupe.left, top: loupe.top }}
          >
            <div
              className="overflow-hidden rounded-full shadow-lg ring-2 ring-white"
              style={{ width: LOUPE_SIZE, height: LOUPE_SIZE }}
            >
              <canvas
                ref={loupeCanvasRef}
                width={LOUPE_SIZE}
                height={LOUPE_SIZE}
              />
            </div>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide shadow ring-1 ring-black/10"
              style={{
                backgroundColor: loupe.hex,
                color: isReadableOnLight(loupe.hex) ? "#111827" : "#f9fafb",
              }}
            >
              {loupe.hex.toUpperCase()}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 max-w-[85%] flex-col gap-0.5">
          <p className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 sm:text-xs">
            <Pipette className="size-3.5 shrink-0" aria-hidden />
            {regionSelectMode ? copy.regionSelectHint : copy.pickHint}
          </p>
          {colorHighlight ? (
            <p className="text-[10px] font-medium text-violet-600">
              {copy.colorLocationActive}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 sm:text-xs"
        >
          <RefreshCw className="size-3" aria-hidden />
          {copy.changeImage}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
      {zoom > 1 ? (
        <p className="text-[11px] text-gray-400">{copy.panHint}</p>
      ) : null}
      {error ? (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      ) : null}
    </div>
  );
}

function isReadableOnLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150;
}
