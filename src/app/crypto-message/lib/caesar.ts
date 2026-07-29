// シーザー暗号（文字ずらし）ロジック。
// ひらがな・カタカナ・英字（半角/全角）をそれぞれ独立した「輪」として扱い、
// 輪の中だけで循環シフトする。漢字・記号・数字はそのまま（シフトしない）。
// → シフト量スライダーを動かすと、ひらがな部分だけがガチャガチャ変化する。

type CharRange = { start: number; end: number };

const RANGES: CharRange[] = [
  { start: 0x3041, end: 0x3096 }, // ひらがな ぁ〜ゖ
  { start: 0x30a1, end: 0x30f6 }, // カタカナ ァ〜ヶ
  { start: 0x41, end: 0x5a }, // 半角英大文字 A-Z
  { start: 0x61, end: 0x7a }, // 半角英小文字 a-z
  { start: 0xff21, end: 0xff3a }, // 全角英大文字 Ａ-Ｚ
  { start: 0xff41, end: 0xff5a }, // 全角英小文字 ａ-ｚ
];

/** 1文字をシフト。対応レンジ外の文字（漢字・記号・数字など）はそのまま返す */
function shiftChar(char: string, shift: number): string {
  const code = char.codePointAt(0);
  if (code === undefined) return char;

  for (const range of RANGES) {
    if (code >= range.start && code <= range.end) {
      const size = range.end - range.start + 1;
      const offset = ((code - range.start + shift) % size + size) % size;
      return String.fromCodePoint(range.start + offset);
    }
  }
  return char;
}

/** テキスト全体をシフト量 shift（-13〜+13想定）でずらす */
export function caesarShift(text: string, shift: number): string {
  return Array.from(text)
    .map((char) => shiftChar(char, shift))
    .join("");
}

export type FrequencyEntry = { char: string; count: number };

/**
 * 文字の出現頻度を集計（空白・改行は除外、多い順）。
 * 「解読チャレンジ」の補助グラフ用。
 */
export function charFrequency(text: string, limit = 12): FrequencyEntry[] {
  const counts = new Map<string, number>();
  for (const char of Array.from(text)) {
    if (/\s/.test(char)) continue;
    counts.set(char, (counts.get(char) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([char, count]) => ({ char, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
