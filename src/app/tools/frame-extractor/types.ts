/** 保存フォーマット */
export type CaptureFormat = "png" | "jpeg" | "webp";

/** 再生速度（指定値のみ） */
export const PLAYBACK_RATES = [0.1, 0.25, 0.5, 1, 2] as const;
export type PlaybackRate = (typeof PLAYBACK_RATES)[number];

/** コマ送りの基準 fps。未指定時は 30 */
export const FPS_PRESETS = [23.976, 24, 25, 29.97, 30, 50, 60] as const;
export const DEFAULT_FPS = 30;

export const APP_ID = "frame-extractor";
export const PREFS_KEY = "frame-extractor:prefs:v1";

/** フィルムストリップの前後コマ数（合計 9 枚） */
export const STRIP_RADIUS = 4;

/** 連写の上限（ブラウザ負荷を抑える） */
export const MAX_BURST_FRAMES = 1500;
export const BURST_WARN_FRAMES = 300;

export type CapturePrefs = {
  format: CaptureFormat;
  quality: number;
  fps: number;
};

export const DEFAULT_PREFS: CapturePrefs = {
  format: "png",
  quality: 0.92,
  fps: DEFAULT_FPS,
};

/** 読み込んだ動画のセッション（Object URL は呼び出し側で破棄） */
export type VideoSession = {
  file: File;
  url: string;
  name: string;
};

/** フィルムストリップ 1 コマ */
export type StripThumb = {
  frame: number;
  time: number;
  dataUrl: string;
};

export function isVideoFile(file: File): boolean {
  if (file.type.startsWith("video/")) return true;
  return /\.(mp4|webm|mov|m4v|mkv|ogv|avi)$/i.test(file.name);
}

export function fileStem(name: string): string {
  return name.replace(/\.[^.]+$/, "") || "frame";
}

export function loadPrefs(): CapturePrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<CapturePrefs>;
    const format: CaptureFormat =
      parsed.format === "jpeg" || parsed.format === "webp" || parsed.format === "png"
        ? parsed.format
        : DEFAULT_PREFS.format;
    const quality =
      typeof parsed.quality === "number" && parsed.quality >= 0.5 && parsed.quality <= 1
        ? parsed.quality
        : DEFAULT_PREFS.quality;
    const fps =
      typeof parsed.fps === "number" && parsed.fps > 0 && parsed.fps <= 120
        ? parsed.fps
        : DEFAULT_PREFS.fps;
    return { format, quality, fps };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: CapturePrefs): void {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // 容量不足などは無視
  }
}
