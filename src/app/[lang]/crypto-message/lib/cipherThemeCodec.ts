// 暗号化バイト列 ⇔ 「見た目テーマ」文字列の相互変換。
// 内部的にはすべて16進数（hex）の1桁＝0〜15を経由し、
// テーマごとの記号テーブルへマッピングするだけなので完全に可逆。

import type { CipherTheme } from "../types";

const HEX_CHARS = "0123456789abcdef";

/** ルーン文字（古エルダー・フサルク）16種：hexの1桁に対応 */
const RUNE_TABLE = [
  "ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ",
  "ᚻ", "ᚾ", "ᛁ", "ᛃ", "ᛇ", "ᛈ", "ᛉ", "ᛊ",
];

/** モールス信号16種（数字0-9 + 英字a-fのモールス）：hexの1桁に対応 */
const MORSE_TABLE = [
  "-----", ".----", "..---", "...--", "....-", // 0-4
  ".....", "-....", "--...", "---..", "----.", // 5-9
  ".-", "-...", "-.-.", "-..", ".", "..-.", // a-f
];

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array | null {
  if (hex.length === 0 || hex.length % 2 !== 0) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    const byteStr = hex.slice(i * 2, i * 2 + 2);
    const value = Number.parseInt(byteStr, 16);
    if (Number.isNaN(value)) return null;
    bytes[i] = value;
  }
  return bytes;
}

/** 暗号化バイト列 → 選択テーマの見た目文字列 */
export function bytesToThemedString(
  bytes: Uint8Array,
  theme: CipherTheme,
): string {
  const hex = bytesToHex(bytes);

  if (theme === "cyber") {
    // 41 6C 69 63 65... の形式（1バイト＝2桁ずつ空白区切り）
    const pairs: string[] = [];
    for (let i = 0; i < hex.length; i += 2) {
      pairs.push(hex.slice(i, i + 2).toUpperCase());
    }
    return pairs.join(" ");
  }

  const table = theme === "fantasy" ? RUNE_TABLE : MORSE_TABLE;
  const tokens = hex
    .split("")
    .map((digit) => table[HEX_CHARS.indexOf(digit)]);
  return tokens.join(" ");
}

/** 選択テーマの見た目文字列 → 暗号化バイト列（不正な形式なら null） */
export function themedStringToBytes(
  input: string,
  theme: CipherTheme,
): Uint8Array | null {
  const tokens = input.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return null;

  if (theme === "cyber") {
    const hex = tokens.join("").toLowerCase();
    if (!/^[0-9a-f]+$/.test(hex)) return null;
    return hexToBytes(hex);
  }

  const table = theme === "fantasy" ? RUNE_TABLE : MORSE_TABLE;
  let hex = "";
  for (const token of tokens) {
    const index = table.indexOf(token);
    if (index === -1) return null;
    hex += HEX_CHARS[index];
  }
  return hexToBytes(hex);
}

const ALL_THEMES: CipherTheme[] = ["cyber", "fantasy", "spy"];

/**
 * テーマを指定せず、貼り付けられた文字列の見た目から自動判定して復元する。
 * 3テーマは使用文字種が重ならない（HEX / ルーン文字 / 点と線）ため、
 * 受け取り側は暗号化に使われたテーマを覚えていなくても解読できる。
 */
export function detectThemeAndDecode(input: string): Uint8Array | null {
  for (const theme of ALL_THEMES) {
    const bytes = themedStringToBytes(input, theme);
    if (bytes) return bytes;
  }
  return null;
}
