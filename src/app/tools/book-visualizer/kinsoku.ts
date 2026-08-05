/**
 * 行分割の禁則・折り返し。
 *
 * 紙面の表示・入力はブラウザ（contenteditable）が行うので、ここは
 * ページ分割で「1 ページに何行入るか」を見積もるための計算。
 * ブラウザ標準の挙動にそろえてある。
 *
 * - CJK（日本語）: 字数ベース＋句読点などの追い出し禁則（単語単位ではない）
 * - Latin（欧文）: 空白／ハイフンでの単語単位折り返し
 */

/** 禁則でずらせる最大字数 */
export const KINSOKU_MAX_SHIFT = 3;

/** 折り返し方式 */
export type WrapMode = "cjk" | "latin";

/** 行頭に置かない文字（CJK） */
const LINE_START_FORBIDDEN = new Set(
  Array.from(
    ")]｝〕〉》」』】〙〗〟’”｠»" +
      "、。，．・：；！？!?‼⁇⁈⁉" +
      "‐゠–〜～ー" +
      "ゝゞ々〻ヽヾ" +
      "ぁぃぅぇぉっゃゅょゎゕゖ" +
      "ァィゥェォッャュョヮヵヶ" +
      "ㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇺㇻㇼㇽㇾㇿ" +
      "°′″‰℃％¢" +
      "､｡｣",
  ),
);

/** 行末に置かない文字（CJK） */
const LINE_END_FORBIDDEN = new Set(
  Array.from("([｛〔〈《「『【〘〖〝‘“｟«｢"),
);

export function isLineStartForbidden(char: string): boolean {
  return LINE_START_FORBIDDEN.has(char);
}

export function isLineEndForbidden(char: string): boolean {
  return LINE_END_FORBIDDEN.has(char);
}

function isSpace(char: string): boolean {
  return char === " " || char === "\t" || char === "\u00a0";
}

function isLatinBreakOpportunity(char: string): boolean {
  // 空白のあと、またはハイフンのあとで折り返せる
  return isSpace(char) || char === "-" || char === "–" || char === "—";
}

/**
 * 日本語: 字数ベース＋句読点の追い出し（単語単位ではない）。
 *
 * 表示はブラウザの行分割に任せるため、ここもブラウザ標準と同じ
 * 「追い出し」にそろえる。ページ分割の行数見積もりが実表示とずれない。
 */
export function wrapParagraphWithKinsoku(
  text: string,
  charsPerLine: number,
): { start: number; end: number }[] {
  const cpl = Math.max(1, charsPerLine);
  if (text.length === 0) {
    return [{ start: 0, end: 0 }];
  }

  const ranges: { start: number; end: number }[] = [];
  let i = 0;

  while (i < text.length) {
    let breakAt = Math.min(i + cpl, text.length);

    if (breakAt < text.length) {
      // 次行の頭が禁則文字 → その文字を次行へ送らず、1 字手前で折る
      let guard = 0;
      while (
        guard < KINSOKU_MAX_SHIFT &&
        breakAt > i + 1 &&
        isLineStartForbidden(text[breakAt] ?? "")
      ) {
        breakAt -= 1;
        guard += 1;
      }

      // 行末が開き括弧など → その文字ごと次行へ送る
      guard = 0;
      while (
        guard < KINSOKU_MAX_SHIFT &&
        breakAt > i + 1 &&
        isLineEndForbidden(text[breakAt - 1] ?? "")
      ) {
        breakAt -= 1;
        guard += 1;
      }
    }

    if (breakAt <= i) {
      breakAt = Math.min(i + 1, text.length);
    }

    ranges.push({ start: i, end: breakAt });
    i = breakAt;
  }

  return ranges;
}

/**
 * 欧文: 単語単位で折り返す。
 * - 原則、行内の最後の空白／ハイフンで区切る
 * - 単語が 1 行に収まらないときだけ強制分割
 */
export function wrapParagraphWestern(
  text: string,
  charsPerLine: number,
): { start: number; end: number }[] {
  const cpl = Math.max(1, charsPerLine);
  if (text.length === 0) {
    return [{ start: 0, end: 0 }];
  }

  const ranges: { start: number; end: number }[] = [];
  let i = 0;

  while (i < text.length) {
    // 行頭の空白はその行に含める（論理オフセットをずらさない）
    let breakAt = Math.min(i + cpl, text.length);

    if (breakAt < text.length) {
      // [i, breakAt) 内で最後の折り返し可能位置（空白・ハイフンの直後）
      let opportunity = -1;
      for (let j = breakAt - 1; j >= i; j -= 1) {
        if (isLatinBreakOpportunity(text[j] ?? "")) {
          opportunity = j + 1;
          break;
        }
      }

      // 単語の切れ目で折り返す（手前の行が短くなるのは欧文では自然）
      // 空白が無い＝ cpl を超える長い単語 → 字数で強制分割
      if (opportunity > i) breakAt = opportunity;
    }

    if (breakAt <= i) {
      breakAt = Math.min(i + 1, text.length);
    }

    ranges.push({ start: i, end: breakAt });
    i = breakAt;
  }

  return ranges;
}

/** wrapMode に応じて段落を折り返す */
export function wrapParagraph(
  text: string,
  charsPerLine: number,
  wrapMode: WrapMode = "cjk",
): { start: number; end: number }[] {
  if (wrapMode === "latin") {
    return wrapParagraphWestern(text, charsPerLine);
  }
  return wrapParagraphWithKinsoku(text, charsPerLine);
}
