import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  MatroskaInputFormat,
  MkvOutputFormat,
  MovOutputFormat,
  Mp4InputFormat,
  Mp4OutputFormat,
  Output,
  QuickTimeInputFormat,
  WebMInputFormat,
  WebMOutputFormat,
  type InputFormat,
  type MetadataTags,
  type OutputFormat,
} from "mediabunny";

import type { MetadataFields } from "./types";
import { EMPTY_FIELDS } from "./types";

/** このアプリでメタデータ書き込み対応の動画コンテナか */
export function canWriteVideoMetadata(file: File): boolean {
  const type = (file.type || "").toLowerCase();
  if (
    type === "video/mp4" ||
    type === "video/quicktime" ||
    type === "video/webm" ||
    type === "video/x-matroska" ||
    type === "video/x-m4v"
  ) {
    return true;
  }
  return /\.(mp4|m4v|mov|webm|mkv)$/i.test(file.name);
}

function createVideoInput(file: File): Input {
  return new Input({
    source: new BlobSource(file),
    formats: ALL_FORMATS,
  });
}

/** 入力フォーマットに合わせて同じ系統の出力フォーマットを選ぶ（再エンコードを避ける） */
function outputFormatForInput(format: InputFormat): OutputFormat {
  // WebM は Matroska の下位なので先に判定
  if (format instanceof WebMInputFormat) {
    return new WebMOutputFormat();
  }
  if (format instanceof MatroskaInputFormat) {
    return new MkvOutputFormat();
  }
  if (format instanceof QuickTimeInputFormat) {
    // メモリ節約のため Fast Start は使わない（大きな動画向け）
    return new MovOutputFormat({ fastStart: false });
  }
  if (format instanceof Mp4InputFormat) {
    return new Mp4OutputFormat({ fastStart: false });
  }
  // 不明でも MP4 として試す
  return new Mp4OutputFormat({ fastStart: false });
}

function mimeForOutput(format: OutputFormat, fallback: string): string {
  return format.mimeType || fallback || "video/mp4";
}

/**
 * フォーム値 → Mediabunny の MetadataTags。
 * coverJpeg が ArrayBuffer なら差し替え、null なら埋め込み画像を外す。
 * それ以外の未知タグは inputTags から可能な範囲で引き継ぐ。
 */
function fieldsToTags(
  fields: MetadataFields,
  coverJpeg: ArrayBuffer | null,
  inputTags: MetadataTags,
): MetadataTags {
  const next: MetadataTags = { ...inputTags };
  // raw はフォーマット依存で壊れやすいので載せ替えない
  delete next.raw;

  const title = fields.title.trim();
  const artist = fields.artist.trim();
  const comment = fields.comment.trim();
  const year = fields.year.trim();

  if (title) next.title = title;
  else delete next.title;

  if (artist) next.artist = artist;
  else delete next.artist;

  // UI の「コメント（Description）」は description 優先、comment にも入れる
  if (comment) {
    next.description = comment;
    next.comment = comment;
  } else {
    delete next.description;
    delete next.comment;
  }

  const yearNum = Number.parseInt(year, 10);
  if (!Number.isNaN(yearNum) && yearNum >= 1000 && yearNum <= 9999) {
    next.date = new Date(Date.UTC(yearNum, 0, 1));
  } else {
    delete next.date;
  }

  if (coverJpeg && coverJpeg.byteLength > 0) {
    next.images = [
      {
        data: new Uint8Array(coverJpeg),
        mimeType: "image/jpeg",
        kind: "coverFront",
        description: "Thumbnail",
      },
    ];
  } else {
    delete next.images;
  }

  return next;
}

export type VideoTagReadResult = {
  fields: MetadataFields;
  artwork: { data: ArrayBuffer; mime: string } | null;
};

/** 動画ファイルから既存メタデータ／サムネを読む */
export async function readVideoMetadata(file: File): Promise<VideoTagReadResult> {
  const input = createVideoInput(file);
  try {
    if (!(await input.canRead())) {
      return { fields: { ...EMPTY_FIELDS }, artwork: null };
    }

    const tags = await input.getMetadataTags();
    const fields: MetadataFields = {
      ...EMPTY_FIELDS,
      title: tags.title?.trim() ?? "",
      artist: tags.artist?.trim() ?? "",
      year: tags.date ? String(tags.date.getUTCFullYear()) : "",
      comment: (tags.description ?? tags.comment ?? "").trim(),
    };

    let artwork: VideoTagReadResult["artwork"] = null;
    const cover =
      tags.images?.find((img) => img.kind === "coverFront") ??
      tags.images?.[0];
    if (cover?.data?.byteLength) {
      const copy = new Uint8Array(cover.data.byteLength);
      copy.set(cover.data);
      artwork = {
        data: copy.buffer,
        mime: cover.mimeType || "image/jpeg",
      };
    }

    return { fields, artwork };
  } finally {
    input.dispose();
  }
}

/**
 * 動画にメタデータ（＋サムネ JPEG）を書き込んで Blob を返す。
 * 可能な限りトラックをコピー（リマックス）し、画質を落とさない。
 */
export async function writeVideoFile(
  file: File,
  fields: MetadataFields,
  artwork: { data: ArrayBuffer; mime: string } | null,
): Promise<Blob> {
  if (!canWriteVideoMetadata(file)) {
    throw new Error("unsupported_video_write");
  }

  const coverJpeg =
    artwork?.data && artwork.data.byteLength > 0
      ? artwork.data.slice(0)
      : null;
  const wantCover = coverJpeg !== null;

  // フォーマット判定と既存タグ取得（書き込み本体とは別 Input）
  let outputFormat: OutputFormat;
  let inputTags: MetadataTags = {};
  {
    const probe = createVideoInput(file);
    try {
      if (!(await probe.canRead())) {
        throw new Error("unsupported_video_write");
      }
      outputFormat = outputFormatForInput(await probe.getFormat());
      inputTags = await probe.getMetadataTags();
    } finally {
      probe.dispose();
    }
  }

  const tryConvert = async (withCover: boolean): Promise<ArrayBuffer> => {
    // Conversion は Input を消費するため、試行ごとに新規作成する
    const input = createVideoInput(file);
    try {
      const target = new BufferTarget();
      const output = new Output({
        format: outputFormat,
        target,
      });
      const tags = fieldsToTags(
        fields,
        withCover ? coverJpeg : null,
        inputTags,
      );
      const conversion = await Conversion.init({
        input,
        output,
        tags,
      });

      if (!conversion.isValid) {
        const reasons = conversion.discardedTracks
          .map((t) => `${t.track.type}:${t.reason}`)
          .join(", ");
        throw new Error(
          reasons
            ? `video_conversion_invalid:${reasons}`
            : "video_conversion_invalid",
        );
      }

      await conversion.execute();
      const buffer = target.buffer;
      if (!buffer || buffer.byteLength === 0) {
        throw new Error("empty_blob");
      }
      return buffer;
    } finally {
      input.dispose();
    }
  };

  let buffer: ArrayBuffer | null = null;
  let usedCover = false;

  if (wantCover) {
    try {
      buffer = await tryConvert(true);
      await assertVideoTagsWritten(buffer, fields, true);
      usedCover = true;
    } catch (err) {
      console.warn("video write with cover failed, retry without cover", err);
      buffer = null;
    }
  }

  if (!buffer) {
    buffer = await tryConvert(false);
    await assertVideoTagsWritten(buffer, fields, false);
  }

  if (wantCover && !usedCover) {
    console.warn("video artwork embed failed: tags saved without cover");
  }

  return new Blob([new Uint8Array(buffer)], {
    type: mimeForOutput(outputFormat, file.type),
  });
}

async function assertVideoTagsWritten(
  buffer: ArrayBuffer,
  fields: MetadataFields,
  expectCover: boolean,
): Promise<void> {
  const input = new Input({
    source: new BlobSource(new Blob([new Uint8Array(buffer)])),
    formats: ALL_FORMATS,
  });
  try {
    const tags = await input.getMetadataTags();
    const title = fields.title.trim();
    if (title && (tags.title ?? "").trim() !== title) {
      throw new Error("tag_verify_failed:title");
    }
    const artist = fields.artist.trim();
    if (artist && !(tags.artist ?? "").includes(artist.split(/[,;/]/)[0]!)) {
      throw new Error("tag_verify_failed:artist");
    }
    const comment = fields.comment.trim();
    if (comment) {
      const actual = (tags.description ?? tags.comment ?? "").trim();
      if (actual !== comment && !actual.includes(comment) && !comment.includes(actual)) {
        throw new Error("tag_verify_failed:comment");
      }
    }
    // 制作年はコンテナによって保存形式が違うため、読めなくても致命扱いしない
    const year = fields.year.trim().slice(0, 4);
    if (year && tags.date) {
      const written = String(tags.date.getUTCFullYear());
      const writtenLocal = String(tags.date.getFullYear());
      if (written !== year && writtenLocal !== year) {
        console.warn("tag_verify_soft_fail:year", { year, written, writtenLocal });
      }
    }
    if (expectCover && (!tags.images || tags.images.length === 0)) {
      throw new Error("tag_verify_failed:artwork");
    }
  } finally {
    input.dispose();
  }
}
