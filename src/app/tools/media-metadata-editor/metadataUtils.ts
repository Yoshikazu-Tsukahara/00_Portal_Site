import { ID3Writer } from "browser-id3-writer";
import { isMp3File } from "./mediaCore";
import type { MetadataFields } from "./types";

/**
 * MP3 に ID3 タグとジャケットを書き込んで Blob を返す。
 * 非 MP3 は元ファイルをそのまま返す（動画書き込みは次フェーズ）。
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
  writer.removeTag();

  writer.setFrame("TIT2", fields.title);
  writer.setFrame(
    "TPE1",
    fields.artist
      ? fields.artist
          .split(/[,;/]/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [""],
  );
  writer.setFrame("TALB", fields.album);
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
