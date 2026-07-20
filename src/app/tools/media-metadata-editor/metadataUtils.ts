import { ID3Writer } from "browser-id3-writer";
import { readId3FromFile } from "./id3Reader";
import type { MetadataFields } from "./types";
import { EMPTY_FIELDS } from "./types";

/** 対応する音声 MIME / 拡張子（書き込みは MP3 のみ） */
export function isAudioFile(file: File): boolean {
  if (file.type.startsWith("audio/")) return true;
  return /\.(mp3|m4a|aac|wav|flac|ogg|wma)$/i.test(file.name);
}

export function isImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return /\.(jpe?g|png|gif|webp|bmp|tiff?)$/i.test(file.name);
}

export function isVideoFile(file: File): boolean {
  if (file.type.startsWith("video/")) return true;
  return /\.(mp4|webm|mov|mkv|avi)$/i.test(file.name);
}

export function isMp3File(file: File): boolean {
  return (
    file.type === "audio/mpeg" ||
    file.type === "audio/mp3" ||
    /\.mp3$/i.test(file.name)
  );
}

export function detectKind(file: File): "audio" | "image" | "video" | "other" {
  if (isAudioFile(file)) return "audio";
  if (isImageFile(file)) return "image";
  if (isVideoFile(file)) return "video";
  return "other";
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

/** 音声タグを読む（MP3 は自前 ID3、それ以外は空） */
export async function readMediaTags(
  file: File,
): Promise<{
  fields: MetadataFields;
  artwork: { data: ArrayBuffer; mime: string } | null;
}> {
  if (isMp3File(file)) {
    return readId3FromFile(file);
  }
  return { fields: { ...EMPTY_FIELDS }, artwork: null };
}

/** 画像の幅・高さを取得 */
export function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

/**
 * MP3 に ID3 タグとジャケットを書き込んで Blob を返す。
 * 非 MP3 は元ファイルをそのまま返す。
 */
export async function writeMediaFile(
  file: File,
  fields: MetadataFields,
  artwork: { data: ArrayBuffer; mime: string } | null,
): Promise<Blob> {
  if (!isMp3File(file)) {
    return file;
  }

  const buffer = await file.arrayBuffer();
  const writer = new ID3Writer(buffer);

  // 既存タグを落としてから書き直す（クリアしたジャケットも確実に反映）
  writer.removeTag();

  writer.setFrame("TIT2", fields.title);
  writer.setFrame(
    "TPE1",
    fields.artist
      ? fields.artist.split(/[,;/]/).map((s) => s.trim()).filter(Boolean)
      : [""],
  );
  writer.setFrame("TALB", fields.album);
  if (fields.albumArtist) {
    writer.setFrame("TPE2", fields.albumArtist);
  }
  writer.setFrame(
    "TCON",
    fields.genre
      ? fields.genre.split(/[,;/]/).map((s) => s.trim()).filter(Boolean)
      : [""],
  );
  if (fields.track) {
    writer.setFrame("TRCK", fields.track);
  }
  const yearNum = Number.parseInt(fields.year, 10);
  if (!Number.isNaN(yearNum) && yearNum > 0) {
    writer.setFrame("TYER", yearNum);
  }
  if (fields.comment) {
    writer.setFrame("COMM", {
      description: "",
      text: fields.comment,
      language: "eng",
    });
  }
  if (artwork?.data && artwork.data.byteLength > 0) {
    writer.setFrame("APIC", {
      // Cover (front)
      type: 0x03,
      data: artwork.data,
      description: "Cover",
    });
  }

  writer.addTag();
  return writer.getBlob();
}

/** 単一ファイルをダウンロード */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export function createId(): string {
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
