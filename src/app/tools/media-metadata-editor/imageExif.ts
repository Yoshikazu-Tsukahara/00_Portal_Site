import piexif from "piexifjs";
import type { ImageEditState } from "./types";
import { EMPTY_IMAGE_EDIT } from "./types";

/** JPEG 判定（Exif 書き込み対象） */
export function isJpegFile(file: File): boolean {
  return (
    file.type === "image/jpeg" ||
    file.type === "image/jpg" ||
    /\.jpe?g$/i.test(file.name)
  );
}

export function isPngFile(file: File): boolean {
  return file.type === "image/png" || /\.png$/i.test(file.name);
}

/** 画像の書き出し対応（JPEG=Exif編集、PNG=ストリップ／再エンコード） */
export function isWritableImage(file: File): boolean {
  return isJpegFile(file) || isPngFile(file);
}

function arrayBufferToBinaryString(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  let s = "";
  for (let i = 0; i < bytes.length; i += chunk) {
    s += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return s;
}

function binaryStringToUint8Array(s: string): Uint8Array {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 0xff;
  return out;
}

/** EXIF "YYYY:MM:DD HH:MM:SS" → datetime-local "YYYY-MM-DDTHH:MM" */
export function exifDateToInput(exifDate: string): string {
  const m = exifDate
    .trim()
    .match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return "";
  return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}`;
}

/** datetime-local → EXIF DateTime */
export function inputDateToExif(input: string): string {
  const m = input
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return "";
  const sec = m[6] ?? "00";
  return `${m[1]}:${m[2]}:${m[3]} ${m[4]}:${m[5]}:${sec}`;
}

function asExifString(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v.replace(/\0/g, "").trim();
  if (v instanceof Uint8Array) {
    try {
      return new TextDecoder("utf-8", { fatal: false })
        .decode(v)
        .replace(/\0/g, "")
        .trim();
    } catch {
      return "";
    }
  }
  return String(v).replace(/\0/g, "").trim();
}

/** Canvas 経由でメタデータなし画像を生成（ストリップ／PNG 再保存） */
export function stripImageViaCanvas(
  file: File,
  mime: "image/jpeg" | "image/png",
  quality = 0.92,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("canvas"));
          URL.revokeObjectURL(url);
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (!blob) reject(new Error("toBlob"));
            else resolve(blob);
          },
          mime,
          mime === "image/jpeg" ? quality : undefined,
        );
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image load"));
    };
    img.src = url;
  });
}

/** JPEG から Exif を読む */
export async function readImageExif(file: File): Promise<ImageEditState> {
  const base: ImageEditState = {
    ...EMPTY_IMAGE_EDIT,
    title: file.name.replace(/\.[^.]+$/, ""),
  };

  if (!isJpegFile(file)) {
    return base;
  }

  try {
    const buf = await file.arrayBuffer();
    const bin = arrayBufferToBinaryString(buf);
    const exifObj = piexif.load(bin);
    const zeroth = exifObj["0th"] ?? {};
    const exif = exifObj.Exif ?? {};
    const gps = exifObj.GPS ?? {};

    const description = asExifString(
      zeroth[piexif.ImageIFD.ImageDescription],
    );
    const copyright = asExifString(zeroth[piexif.ImageIFD.Copyright]);
    const dateTime =
      asExifString(exif[piexif.ExifIFD.DateTimeOriginal]) ||
      asExifString(zeroth[piexif.ImageIFD.DateTime]);
    const comment = asExifString(exif[piexif.ExifIFD.UserComment]);
    const xpTitle = asExifString(zeroth[piexif.ImageIFD.XPTitle]);

    const hasGps = Object.keys(gps).length > 0;

    return {
      title: xpTitle || description || base.title,
      description,
      comment,
      copyright,
      datetime: dateTime ? exifDateToInput(dateTime) : "",
      stripExif: false,
      hasGps,
    };
  } catch {
    return base;
  }
}

/**
 * 画像をブラウザ内で再構築して Blob を返す。
 * - stripExif: Canvas でメタデータ完全削除
 * - JPEG: piexifjs で Exif 書き換え
 * - PNG: ストリップ時のみ Canvas、それ以外は元ファイル
 */
export async function writeImageFile(
  file: File,
  edit: ImageEditState,
): Promise<Blob> {
  if (edit.stripExif) {
    const mime = isPngFile(file) ? "image/png" : "image/jpeg";
    return stripImageViaCanvas(file, mime);
  }

  if (!isJpegFile(file)) {
    // PNG 等でストリップなし → 元ファイル（Exif 書き込み非対応）
    return file;
  }

  const buf = await file.arrayBuffer();
  let bin = arrayBufferToBinaryString(buf);

  let exifObj: ReturnType<typeof piexif.load>;
  try {
    exifObj = piexif.load(bin);
  } catch {
    exifObj = {
      "0th": {},
      Exif: {},
      GPS: {},
      "1st": {},
      thumbnail: null,
    };
  }

  if (!exifObj["0th"]) exifObj["0th"] = {};
  if (!exifObj.Exif) exifObj.Exif = {};
  if (!exifObj.GPS) exifObj.GPS = {};

  // 位置情報は常に除去（プライバシー）
  exifObj.GPS = {};

  const zeroth = exifObj["0th"];
  const exif = exifObj.Exif;

  if (edit.description) {
    zeroth[piexif.ImageIFD.ImageDescription] = edit.description;
  } else {
    delete zeroth[piexif.ImageIFD.ImageDescription];
  }

  if (edit.title) {
    zeroth[piexif.ImageIFD.XPTitle] = edit.title;
    if (!edit.description) {
      zeroth[piexif.ImageIFD.ImageDescription] = edit.title;
    }
  } else {
    delete zeroth[piexif.ImageIFD.XPTitle];
  }

  if (edit.copyright) {
    zeroth[piexif.ImageIFD.Copyright] = edit.copyright;
  } else {
    delete zeroth[piexif.ImageIFD.Copyright];
  }

  const exifDate = edit.datetime ? inputDateToExif(edit.datetime) : "";
  if (exifDate) {
    zeroth[piexif.ImageIFD.DateTime] = exifDate;
    exif[piexif.ExifIFD.DateTimeOriginal] = exifDate;
    exif[piexif.ExifIFD.DateTimeDigitized] = exifDate;
  } else {
    delete zeroth[piexif.ImageIFD.DateTime];
    delete exif[piexif.ExifIFD.DateTimeOriginal];
    delete exif[piexif.ExifIFD.DateTimeDigitized];
  }

  if (edit.comment) {
    exif[piexif.ExifIFD.UserComment] = edit.comment;
  } else {
    delete exif[piexif.ExifIFD.UserComment];
  }

  // 既存の壊れた Exif を落としてから挿入
  try {
    bin = piexif.remove(bin);
  } catch {
    /* 元に Exif が無い場合など */
  }

  const exifBytes = piexif.dump(exifObj);
  const next = piexif.insert(exifBytes, bin);
  const bytes = binaryStringToUint8Array(next);
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy], { type: "image/jpeg" });
}
