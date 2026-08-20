import { ID3Writer } from "browser-id3-writer";
import { parseId3FromBuffer } from "./id3Reader";
import { fileLooksLikeMp3 } from "./mediaCore";
import type { MetadataFields } from "./types";

/** ArrayBuffer / TypedArray を独立した ArrayBuffer にコピー */
function toStandaloneBuffer(data: ArrayBuffer | ArrayBufferView): ArrayBuffer {
  if (ArrayBuffer.isView(data)) {
    const view = new Uint8Array(
      data.buffer,
      data.byteOffset,
      data.byteLength,
    );
    const copy = new Uint8Array(view.byteLength);
    copy.set(view);
    return copy.buffer;
  }
  const src = new Uint8Array(data);
  const copy = new Uint8Array(src.byteLength);
  copy.set(src);
  return copy.buffer;
}

function isJpeg(data: ArrayBuffer): boolean {
  const u = new Uint8Array(data);
  return u.length >= 3 && u[0] === 0xff && u[1] === 0xd8 && u[2] === 0xff;
}

/**
 * APIC 用に JPEG バイト列へ正規化する。
 * PNG / WebP 等でも canvas 経由で JPEG にし、埋め込み失敗を防ぐ。
 */
export async function normalizeArtworkToJpeg(
  data: ArrayBuffer,
  mimeHint = "image/jpeg",
): Promise<ArrayBuffer> {
  const raw = toStandaloneBuffer(data);
  if (isJpeg(raw)) return raw;

  const blob = new Blob([raw], { type: mimeHint || "image/png" });
  const bitmap = await createImageBitmap(blob);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, bitmap.width);
    canvas.height = Math.max(1, bitmap.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas_unavailable");
    ctx.drawImage(bitmap, 0, 0);
    const jpegBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("jpeg_encode_failed"))),
        "image/jpeg",
        0.92,
      );
    });
    return toStandaloneBuffer(await jpegBlob.arrayBuffer());
  } finally {
    bitmap.close();
  }
}

function normalizeComparable(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/** 書き込んだタグが読めるかざっくり検証（空欄はスキップ） */
function assertTagsWritten(
  buffer: ArrayBuffer,
  fields: MetadataFields,
  expectCover: boolean,
): void {
  const read = parseId3FromBuffer(buffer);

  const title = normalizeComparable(fields.title);
  if (title && normalizeComparable(read.fields.title) !== title) {
    throw new Error("tag_verify_failed:title");
  }

  const artist = normalizeComparable(fields.artist);
  if (artist) {
    const actual = normalizeComparable(read.fields.artist);
    const first = artist.split(/[,;/]/)[0]?.trim() ?? artist;
    // TPE1 は "/" 連結されることがある
    if (actual !== artist && !actual.includes(first)) {
      throw new Error("tag_verify_failed:artist");
    }
  }

  const album = normalizeComparable(fields.album);
  if (album && normalizeComparable(read.fields.album) !== album) {
    throw new Error("tag_verify_failed:album");
  }

  const track = normalizeComparable(fields.track);
  if (track && !normalizeComparable(read.fields.track).startsWith(track)) {
    throw new Error("tag_verify_failed:track");
  }

  const year = normalizeComparable(fields.year).slice(0, 4);
  if (year && !normalizeComparable(read.fields.year).startsWith(year)) {
    throw new Error("tag_verify_failed:year");
  }

  if (expectCover && (!read.artwork || read.artwork.data.byteLength === 0)) {
    throw new Error("tag_verify_failed:artwork");
  }
}

function buildWriter(
  songBuffer: ArrayBuffer,
  fields: MetadataFields,
  coverJpeg: ArrayBuffer | null,
): ID3Writer {
  // 毎回独立バッファを渡す（ライブラリが内部で付け替えるため）
  const writer = new ID3Writer(toStandaloneBuffer(songBuffer));
  writer.removeTag();

  if (fields.title.trim()) {
    writer.setFrame("TIT2", fields.title.trim());
  }

  const artists = fields.artist
    .split(/[,;/]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (artists.length > 0) {
    writer.setFrame("TPE1", artists);
  }

  if (fields.album.trim()) {
    writer.setFrame("TALB", fields.album.trim());
  }

  if (fields.track.trim()) {
    writer.setFrame("TRCK", fields.track.trim());
  }

  const yearNum = Number.parseInt(fields.year, 10);
  if (!Number.isNaN(yearNum) && yearNum >= 1000 && yearNum <= 9999) {
    writer.setFrame("TYER", yearNum);
  }

  if (fields.comment.trim()) {
    writer.setFrame("COMM", {
      description: "",
      text: fields.comment.trim(),
      language: "eng",
    });
  }

  if (coverJpeg && coverJpeg.byteLength > 0) {
    // APIC は JPEG バイトを独立バッファで渡す（共有バッファ事故を防ぐ）
    writer.setFrame("APIC", {
      type: 3,
      data: toStandaloneBuffer(coverJpeg),
      description: "Cover",
      useUnicodeEncoding: false,
    });
  }

  return writer;
}

/**
 * MP3 に ID3 タグとジャケットを書き込んで Blob を返す。
 * 書き込み後に読み戻して検証する。非 MP3 は元ファイルをそのまま返す。
 */
export async function writeMediaFile(
  file: File,
  fields: MetadataFields,
  artwork: { data: ArrayBuffer; mime: string } | null,
): Promise<Blob> {
  if (!(await fileLooksLikeMp3(file))) {
    return file.slice(0, file.size, file.type || "audio/mpeg");
  }

  const songBuffer = toStandaloneBuffer(await file.arrayBuffer());

  let coverJpeg: ArrayBuffer | null = null;
  let wantCover = false;
  if (artwork?.data && artwork.data.byteLength > 0) {
    wantCover = true;
    try {
      coverJpeg = await normalizeArtworkToJpeg(artwork.data, artwork.mime);
    } catch (err) {
      console.warn("artwork normalize failed", err);
      coverJpeg = null;
    }
  }

  const tryWrite = (withCover: boolean): ArrayBuffer => {
    const writer = buildWriter(
      songBuffer,
      fields,
      withCover ? coverJpeg : null,
    );
    // addTag() の戻り値＝完成した MP3 バッファを使う（getBlob 経由の取りこぼし防止）
    return toStandaloneBuffer(writer.addTag());
  };

  let tagged: ArrayBuffer | null = null;
  let usedCover = false;

  if (coverJpeg) {
    try {
      tagged = tryWrite(true);
      assertTagsWritten(tagged, fields, true);
      usedCover = true;
    } catch (err) {
      console.warn("write with cover failed, retry without cover", err);
      tagged = null;
    }
  }

  if (!tagged) {
    tagged = tryWrite(false);
    assertTagsWritten(tagged, fields, false);
  }

  if (wantCover && !usedCover) {
    console.warn("artwork_embed_failed: tags saved without cover");
  }

  if (!tagged || tagged.byteLength === 0) {
    throw new Error("empty_blob");
  }

  // Uint8Array で渡して環境差による Blob 取りこぼしを防ぐ
  return new Blob([new Uint8Array(tagged)], { type: "audio/mpeg" });
}

/**
 * 単一ファイルをダウンロード。
 * URL をすぐ revoke するとブラウザによってはダウンロードが失敗するため、遅延破棄する。
 */
export function downloadBlob(blob: Blob, fileName: string) {
  if (!blob || blob.size === 0) {
    throw new Error("empty_blob");
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName || "download.mp3";
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  window.setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 4000);
}
