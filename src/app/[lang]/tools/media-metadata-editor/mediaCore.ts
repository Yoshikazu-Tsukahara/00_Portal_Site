import { readId3FromFile } from "./id3Reader";
import {
  EMPTY_ARTWORK,
  EMPTY_FIELDS,
  type ArtworkState,
  type MediaMode,
  type MediaSession,
  type MetadataFields,
} from "./types";
import { readVideoMetadata } from "./videoMetadata";

/** 音声として扱うか */
export function isAudioFile(file: File): boolean {
  if (file.type.startsWith("audio/")) return true;
  return /\.(mp3|m4a|aac|wav|flac|ogg|wma)$/i.test(file.name);
}

/** 動画として扱うか */
export function isVideoFile(file: File): boolean {
  if (file.type.startsWith("video/")) return true;
  return /\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(file.name);
}

/** MIME / 拡張子から MP3 と判定（同期・高速） */
export function isMp3File(file: File): boolean {
  const type = (file.type || "").toLowerCase();
  return (
    type === "audio/mpeg" ||
    type === "audio/mp3" ||
    type === "audio/x-mpeg" ||
    type === "audio/mpeg3" ||
    type === "audio/x-mp3" ||
    /\.mp3$/i.test(file.name)
  );
}

/** 拡張子・MIME が曖昧でも中身が MP3 っぽいか（ID3 / MPEG 同期語） */
export async function fileLooksLikeMp3(file: File): Promise<boolean> {
  if (isMp3File(file)) return true;
  try {
    const head = new Uint8Array(await file.slice(0, 3).arrayBuffer());
    if (
      head.length >= 3 &&
      head[0] === 0x49 &&
      head[1] === 0x44 &&
      head[2] === 0x33
    ) {
      return true;
    }
    if (head.length >= 2 && head[0] === 0xff && (head[1] & 0xe0) === 0xe0) {
      return true;
    }
  } catch {
    // 判定不能なら false
  }
  return false;
}

/** MIME / 拡張子から音楽 or 動画モードを判定。対象外は null */
export function detectMediaMode(file: File): MediaMode | null {
  // 両方に当てはまる稀なケースは type を優先
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.startsWith("video/")) return "video";
  if (isAudioFile(file)) return "audio";
  if (isVideoFile(file)) return "video";
  return null;
}

export function createId(): string {
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

/** ArtworkState の Object URL を解放 */
export function revokeArtwork(artwork: ArtworkState) {
  if (artwork.previewUrl) {
    URL.revokeObjectURL(artwork.previewUrl);
  }
}

/** セッション全体の Object URL を解放 */
export function revokeSession(session: MediaSession | null) {
  if (!session) return;
  if (session.mediaUrl) URL.revokeObjectURL(session.mediaUrl);
  revokeArtwork(session.artwork);
}

function artworkFromBuffer(
  data: ArrayBuffer,
  mime: string,
  dirty: boolean,
): ArtworkState {
  // TypedArray.buffer の共有を避けるため必ず独立バッファにする
  const bytes = new Uint8Array(data.byteLength);
  bytes.set(new Uint8Array(data));
  // slice でプレビュー用 Blob と書き込み用 data を完全に分離
  const standalone = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  );
  const previewBytes = new Uint8Array(standalone.byteLength);
  previewBytes.set(new Uint8Array(standalone));
  const blob = new Blob([previewBytes], { type: mime });
  return {
    previewUrl: URL.createObjectURL(blob),
    data: standalone,
    mime,
    dirty,
  };
}

/** カバー画像ファイル（JPG/PNG 等）から ArtworkState を作る */
export async function artworkFromImageFile(file: File): Promise<ArtworkState> {
  const mime =
    file.type === "image/png" ||
    file.type === "image/jpeg" ||
    file.type === "image/webp"
      ? file.type
      : /\.png$/i.test(file.name)
        ? "image/png"
        : /\.webp$/i.test(file.name)
          ? "image/webp"
          : "image/jpeg";
  const data = await file.arrayBuffer();
  return artworkFromBuffer(data, mime, true);
}

/**
 * video 要素の現在フレームを canvas でキャプチャし、JPEG の ArtworkState を返す。
 * crossOrigin 制約のあるソースでは失敗することがある（ローカル Object URL は通常 OK）。
 */
export async function captureVideoFrame(
  video: HTMLVideoElement,
  quality = 0.92,
): Promise<ArtworkState> {
  if (!video.videoWidth || !video.videoHeight) {
    throw new Error("video_not_ready");
  }

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_unavailable");

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("capture_failed"))),
      "image/jpeg",
      quality,
    );
  });

  const data = await blob.arrayBuffer();
  return artworkFromBuffer(data, "image/jpeg", true);
}

/** ファイルを読み込み、編集セッションを組み立てる（すべてクライアント内） */
export async function loadMediaSession(file: File): Promise<MediaSession> {
  const mode = detectMediaMode(file);
  if (!mode) {
    throw new Error("unsupported_type");
  }

  const id = createId();
  const mediaUrl = URL.createObjectURL(file);
  let fields: MetadataFields = { ...EMPTY_FIELDS };
  let artwork: ArtworkState = { ...EMPTY_ARTWORK };

  if (mode === "audio" && (await fileLooksLikeMp3(file))) {
    try {
      const tags = await readId3FromFile(file);
      fields = {
        title: tags.fields.title,
        artist: tags.fields.artist,
        year: tags.fields.year,
        album: tags.fields.album,
        track: tags.fields.track,
        comment: tags.fields.comment,
      };
      if (tags.artwork) {
        artwork = artworkFromBuffer(
          tags.artwork.data,
          tags.artwork.mime,
          false,
        );
      }
    } catch {
      // タグが読めなくてもプレビューは続行
    }
  } else if (mode === "video") {
    try {
      const tags = await readVideoMetadata(file);
      fields = { ...EMPTY_FIELDS, ...tags.fields };
      if (tags.artwork) {
        artwork = artworkFromBuffer(
          tags.artwork.data,
          tags.artwork.mime,
          false,
        );
      }
    } catch {
      // タグが読めなくてもプレビューは続行
    }
  }

  return {
    id,
    file,
    mode,
    mediaUrl,
    displayName: file.name,
    fields,
    artwork,
    dirty: false,
    savedOutput: null,
    status: "ready",
  };
}

/** ダウンロード用に危険文字を除き、空ならフォールバック */
export function sanitizeDownloadName(name: string, fallback: string): string {
  const cleaned = name
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || fallback;
}

/** 拡張子を保ったままベース名だけ差し替える（拡張子が無い場合はそのまま） */
export function withOriginalExtension(
  displayName: string,
  originalName: string,
): string {
  const origExt = originalName.includes(".")
    ? originalName.slice(originalName.lastIndexOf("."))
    : "";
  const trimmed = displayName.trim();
  if (!origExt) return trimmed || originalName;
  if (trimmed.toLowerCase().endsWith(origExt.toLowerCase())) return trimmed;
  // ユーザーが拡張子を消した場合は元の拡張子を付ける
  const base = trimmed.replace(/\.[^.]+$/, "") || "file";
  return `${base}${origExt}`;
}
