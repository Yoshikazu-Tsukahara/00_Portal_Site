import type { CaptureFormat, StripThumb } from "./types";
import { STRIP_RADIUS } from "./types";

function pad(n: number, width: number): string {
  return String(Math.max(0, Math.floor(n))).padStart(width, "0");
}

/** ミリ秒付きタイムコード（00:01:23.456） */
export function formatTimecode(seconds: number): string {
  const t = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  const ms = Math.floor((t % 1) * 1000);
  return `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)}.${pad(ms, 3)}`;
}

export function timeToFrame(seconds: number, fps: number): number {
  if (!Number.isFinite(seconds) || seconds <= 0) return 0;
  return Math.round(seconds * fps);
}

export function frameToTime(frame: number, fps: number): number {
  return Math.max(0, frame) / fps;
}

export function lastFrameIndex(duration: number, fps: number): number {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  return Math.max(0, Math.floor((duration - 1e-4) * fps));
}

export function mimeOf(format: CaptureFormat): string {
  if (format === "jpeg") return "image/jpeg";
  if (format === "webp") return "image/webp";
  return "image/png";
}

export function extOf(format: CaptureFormat): string {
  if (format === "jpeg") return "jpg";
  if (format === "webp") return "webp";
  return "png";
}

function waitForFrame(video: HTMLVideoElement): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    // 一時停止中は新しいフレームが来ず rvfc が返らないブラウザがある
    if (video.paused) {
      requestAnimationFrame(() => {
        requestAnimationFrame(finish);
      });
      return;
    }

    const rvfc = video.requestVideoFrameCallback?.bind(video);
    if (typeof rvfc === "function") {
      rvfc(() => finish());
      window.setTimeout(finish, 500);
      return;
    }
    requestAnimationFrame(finish);
  });
}

function waitForSeeked(video: HTMLVideoElement, timeoutMs = 4000): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup();
      resolve();
    }, timeoutMs);
    const onSeeked = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("seek_failed"));
    };
    const cleanup = () => {
      window.clearTimeout(timer);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
    };
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
  });
}

/** 一時停止したうえで目的時間へシークし、描画フレームを待つ */
export async function seekVideo(
  video: HTMLVideoElement,
  time: number,
): Promise<void> {
  if (video.paused === false) video.pause();
  const duration = Number.isFinite(video.duration) ? video.duration : 0;
  const maxT = duration > 0 ? Math.max(0, duration - 1e-4) : 0;
  const clamped = Math.min(Math.max(0, time), maxT);
  if (Math.abs(video.currentTime - clamped) < 1e-4) {
    await waitForFrame(video);
    return;
  }
  const wait = waitForSeeked(video);
  video.currentTime = clamped;
  await wait;
  await waitForFrame(video);
}

/**
 * 表示更新の確実性を最優先しない（=高速化）ためのシーク。
 * 目的は「操作感を重くしない」ことで、保存のような厳密さは不要な箇所（コマ送り等）で使う。
 */
export async function seekVideoFast(
  video: HTMLVideoElement,
  time: number,
): Promise<void> {
  if (video.paused === false) video.pause();
  const duration = Number.isFinite(video.duration) ? video.duration : 0;
  const maxT = duration > 0 ? Math.max(0, duration - 1e-4) : 0;
  const clamped = Math.min(Math.max(0, time), maxT);
  if (Math.abs(video.currentTime - clamped) < 1e-4) return;
  const wait = waitForSeeked(video);
  video.currentTime = clamped;
  await wait;
  // seeked は「移動完了」だが、描画が追いついてない場合があるため軽く待つ
  await waitForFrame(video);
}

function drawNative(
  video: HTMLVideoElement,
  destW?: number,
  destH?: number,
): HTMLCanvasElement {
  const width = destW ?? video.videoWidth;
  const height = destH ?? video.videoHeight;
  if (!width || !height) throw new Error("video_not_ready");
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_unavailable");
  // 余計な補間（リサイズ由来のにじみ）を避ける
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(video, 0, 0, width, height);
  return canvas;
}

/** 元解像度のまま Canvas へ描画し、指定形式の Blob を返す */
export async function captureFrameBlob(
  video: HTMLVideoElement,
  format: CaptureFormat,
  quality: number,
  sharpenEnabled = false,
): Promise<Blob> {
  // requestVideoFrameCallback で「表示されたフレーム」に同期してから描画する
  // 非対応ブラウザでは requestAnimationFrame にフォールバックする
  await waitForFrame(video);
  const canvas = drawNative(video);
  if (sharpenEnabled) {
    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas_unavailable");
      const { width, height } = canvas;
      const img = ctx.getImageData(0, 0, width, height);
      applySharpenKernel(img);
      ctx.putImageData(img, 0, 0);
    } catch {
      // セキュリティ制約などで getImageData 不可のときはシャープネスをスキップ
    }
  }
  const mime = mimeOf(format);
  const q = format === "png" ? undefined : quality;
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("capture_failed"))),
      mime,
      q,
    );
  });
  return blob;
}

/**
 * 3x3 コンボリューション（例のシャープネス・カーネル）
 * [  0, -1,  0,
 *  -1,  5, -1,
 *   0, -1,  0 ]
 *
 * このカーネルは対角が 0 なので、上下左右＋中心だけで同等に計算する（高速化）。
 */
function applySharpenKernel(img: ImageData): void {
  const { data, width, height } = img;
  const out = new Uint8ClampedArray(data.length);

  const w4 = width * 4;
  for (let y = 0; y < height; y += 1) {
    const y0 = y > 0 ? y - 1 : y;
    const y1 = y;
    const y2 = y + 1 < height ? y + 1 : y;

    for (let x = 0; x < width; x += 1) {
      const x0 = x > 0 ? x - 1 : x;
      const x1 = x;
      const x2 = x + 1 < width ? x + 1 : x;

      const i = y1 * w4 + x1 * 4;

      const iL = y1 * w4 + x0 * 4;
      const iR = y1 * w4 + x2 * 4;
      const iU = y0 * w4 + x1 * 4;
      const iD = y2 * w4 + x1 * 4;

      // Alpha は中心を維持
      out[i + 3] = data[i + 3];

      // R
      {
        const v = 5 * data[i] - data[iL] - data[iR] - data[iU] - data[iD];
        out[i] = v < 0 ? 0 : v > 255 ? 255 : v;
      }
      // G
      {
        const v =
          5 * data[i + 1] - data[iL + 1] - data[iR + 1] - data[iU + 1] - data[iD + 1];
        out[i + 1] = v < 0 ? 0 : v > 255 ? 255 : v;
      }
      // B
      {
        const v =
          5 * data[i + 2] - data[iL + 2] - data[iR + 2] - data[iU + 2] - data[iD + 2];
        out[i + 2] = v < 0 ? 0 : v > 255 ? 255 : v;
      }
    }
  }

  img.data.set(out);
}

function captureThumbDataUrl(video: HTMLVideoElement, maxHeight = 88): string {
  const srcH = video.videoHeight || 1;
  const srcW = video.videoWidth || 1;
  const scale = Math.min(1, maxHeight / srcH);
  const canvas = drawNative(
    video,
    Math.max(1, Math.round(srcW * scale)),
    Math.max(1, Math.round(srcH * scale)),
  );
  return canvas.toDataURL("image/jpeg", 0.62);
}

function loadOffscreenVideo(
  src: string,
  signal?: AbortSignal,
  timeoutMs = 8000,
): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = src;
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error("offscreen_load_timeout"));
    }, timeoutMs);
    const onReady = () => {
      cleanup();
      resolve(video);
    };
    const onError = () => {
      cleanup();
      reject(new Error("ghost_load"));
    };
    const onAbort = () => {
      cleanup();
      reject(new DOMException("aborted", "AbortError"));
    };
    const cleanup = () => {
      window.clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("error", onError);
    };
    video.addEventListener("loadeddata", onReady);
    video.addEventListener("error", onError);
    if (signal?.aborted) {
      onAbort();
      return;
    }
    signal?.addEventListener("abort", onAbort);
  });
}

function disposeVideo(video: HTMLVideoElement): void {
  video.pause();
  video.removeAttribute("src");
  video.load();
}

/**
 * 中心コマの前後をオフスクリーン video で順にキャプチャする。
 * 本編プレイヤーの表示位置は動かさない。
 */
export async function captureFilmStrip(
  src: string,
  centerTime: number,
  fps: number,
  duration: number,
  signal?: AbortSignal,
  radius = STRIP_RADIUS,
): Promise<StripThumb[]> {
  const video = await loadOffscreenVideo(src, signal);
  try {
    const last = lastFrameIndex(duration || video.duration, fps);
    const center = Math.min(last, Math.max(0, timeToFrame(centerTime, fps)));
    const from = Math.max(0, center - radius);
    const to = Math.min(last, center + radius);
    const thumbs: StripThumb[] = [];
    for (let frame = from; frame <= to; frame += 1) {
      if (signal?.aborted) throw new DOMException("aborted", "AbortError");
      await seekVideo(video, frameToTime(frame, fps));
      thumbs.push({
        frame,
        time: video.currentTime,
        dataUrl: captureThumbDataUrl(video),
      });
    }
    return thumbs;
  } finally {
    disposeVideo(video);
  }
}

export function downloadBlob(blob: Blob, fileName: string): void {
  if (!blob || blob.size === 0) {
    throw new Error("empty_blob");
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  // すぐ revoke するとダウンロードが失敗するブラウザがある
  window.setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 4000);
}

export function captureFileName(
  stem: string,
  time: number,
  frame: number,
  format: CaptureFormat,
): string {
  const safe = stem.replace(/[\\/:*?"<>|]+/g, "_").slice(0, 80) || "frame";
  const tc = formatTimecode(time).replace(/:/g, "-");
  return `${safe}_f${pad(frame, 5)}_${tc}.${extOf(format)}`;
}

export function burstFileName(
  stem: string,
  index: number,
  format: CaptureFormat,
): string {
  const safe = stem.replace(/[\\/:*?"<>|]+/g, "_").slice(0, 80) || "frame";
  return `${safe}_${pad(index, 5)}.${extOf(format)}`;
}
