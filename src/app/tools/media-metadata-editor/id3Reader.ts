import type { MetadataFields } from "./types";
import { EMPTY_FIELDS } from "./types";

/**
 * ブラウザ完結の軽量 ID3v2 リーダー（TIT2 / TPE1 / TALB / APIC 等）。
 * jsmediatags は React Native 依存を引き込むため使用しない。
 */

function synchsafeToSize(b0: number, b1: number, b2: number, b3: number): number {
  return (b0 << 21) | (b1 << 14) | (b2 << 7) | b3;
}

function decodeText(encoding: number, bytes: Uint8Array): string {
  if (bytes.length === 0) return "";
  try {
    if (encoding === 0) {
      // ISO-8859-1
      return new TextDecoder("latin1").decode(bytes).replace(/\0+$/, "");
    }
    if (encoding === 3) {
      return new TextDecoder("utf-8").decode(bytes).replace(/\0+$/g, "");
    }
    // UTF-16 with BOM (1) or UTF-16BE (2)
    return new TextDecoder("utf-16").decode(bytes).replace(/\0+$/g, "");
  } catch {
    return new TextDecoder("utf-8", { fatal: false })
      .decode(bytes)
      .replace(/\0+$/g, "");
  }
}

function splitNullTerminated(
  encoding: number,
  bytes: Uint8Array,
): { first: string; rest: Uint8Array } {
  if (encoding === 0 || encoding === 3) {
    const idx = bytes.indexOf(0);
    if (idx < 0) return { first: decodeText(encoding, bytes), rest: new Uint8Array() };
    return {
      first: decodeText(encoding, bytes.subarray(0, idx)),
      rest: bytes.subarray(idx + 1),
    };
  }
  // UTF-16: null is 0x00 0x00
  for (let i = 0; i + 1 < bytes.length; i += 2) {
    if (bytes[i] === 0 && bytes[i + 1] === 0) {
      return {
        first: decodeText(encoding, bytes.subarray(0, i)),
        rest: bytes.subarray(i + 2),
      };
    }
  }
  return { first: decodeText(encoding, bytes), rest: new Uint8Array() };
}

function sniffImageMime(data: Uint8Array): string {
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    data.length >= 8 &&
    data[0] === 0x89 &&
    data[1] === 0x50 &&
    data[2] === 0x4e &&
    data[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    data.length >= 4 &&
    data[0] === 0x52 &&
    data[1] === 0x49 &&
    data[2] === 0x46 &&
    data[3] === 0x46
  ) {
    return "image/webp";
  }
  return "image/jpeg";
}

export type Id3ReadResult = {
  fields: MetadataFields;
  artwork: { data: ArrayBuffer; mime: string } | null;
};

/** MP3 の ArrayBuffer から ID3v2 タグを抽出 */
export function parseId3FromBuffer(buffer: ArrayBuffer): Id3ReadResult {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const fields: MetadataFields = { ...EMPTY_FIELDS };
  let artwork: { data: ArrayBuffer; mime: string } | null = null;

  if (bytes.length < 10) return { fields, artwork };
  if (bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) {
    return { fields, artwork };
  }

  const versionMajor = bytes[3];
  const tagSize = synchsafeToSize(bytes[6], bytes[7], bytes[8], bytes[9]);
  let offset = 10;
  const end = Math.min(10 + tagSize, bytes.length);

  while (offset + 10 <= end) {
    const id = String.fromCharCode(
      bytes[offset],
      bytes[offset + 1],
      bytes[offset + 2],
      bytes[offset + 3],
    );
    if (id === "\0\0\0\0") break;

    let frameSize: number;
    if (versionMajor === 4) {
      frameSize = synchsafeToSize(
        bytes[offset + 4],
        bytes[offset + 5],
        bytes[offset + 6],
        bytes[offset + 7],
      );
    } else {
      frameSize =
        (bytes[offset + 4] << 24) |
        (bytes[offset + 5] << 16) |
        (bytes[offset + 6] << 8) |
        bytes[offset + 7];
    }

    const dataStart = offset + 10;
    const dataEnd = dataStart + frameSize;
    if (frameSize <= 0 || dataEnd > end) break;

    const frameData = bytes.subarray(dataStart, dataEnd);
    offset = dataEnd;

    if (frameData.length < 1) continue;
    const encoding = frameData[0];

    const setText = (key: keyof MetadataFields) => {
      const text = decodeText(encoding, frameData.subarray(1)).trim();
      if (text) fields[key] = text;
    };

    switch (id) {
      case "TIT2":
        setText("title");
        break;
      case "TPE1":
        setText("artist");
        break;
      case "TALB":
        setText("album");
        break;
      case "TYER":
      case "TDRC": {
        const y = decodeText(encoding, frameData.subarray(1)).trim();
        if (y) fields.year = y.slice(0, 4);
        break;
      }
      case "TRCK":
        setText("track");
        break;
      case "COMM": {
        // encoding + lang(3) + short desc + text
        if (frameData.length < 5) break;
        const rest = frameData.subarray(4); // skip enc + lang
        const { rest: afterDesc } = splitNullTerminated(encoding, rest);
        const text = decodeText(encoding, afterDesc).trim();
        if (text) fields.comment = text;
        break;
      }
      case "APIC": {
        // encoding + mime + \0 + picType + desc + \0 + data
        const enc = frameData[0];
        let p = 1;
        // MIME (always ISO-8859-1, null-terminated)
        let mimeEnd = p;
        while (mimeEnd < frameData.length && frameData[mimeEnd] !== 0) mimeEnd++;
        const mime =
          new TextDecoder("latin1").decode(frameData.subarray(p, mimeEnd)) ||
          "image/jpeg";
        p = mimeEnd + 1;
        if (p >= frameData.length) break;
        p += 1; // picture type
        const { rest: imageBytes } = splitNullTerminated(
          enc,
          frameData.subarray(p),
        );
        if (imageBytes.length > 0) {
          const copy = new Uint8Array(imageBytes.byteLength);
          copy.set(imageBytes);
          artwork = {
            data: copy.buffer,
            mime: mime || sniffImageMime(copy),
          };
        }
        break;
      }
      default:
        break;
    }
  }

  // unused view silences lint if needed
  void view;
  return { fields, artwork };
}

/** File から ID3 を読む（MP3 以外は空） */
export async function readId3FromFile(file: File): Promise<Id3ReadResult> {
  const buffer = await file.arrayBuffer();
  return parseId3FromBuffer(buffer);
}
