import type { CleanOptions, ReplaceRule } from "./types";

/** 全角英数字・記号 → 半角（スペース含む） */
function toHankaku(text: string): string {
  return text
    .replace(/[\uFF01-\uFF5E]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xfee0),
    )
    .replace(/\u3000/g, " ");
}

/** HTMLタグ除去（簡易。属性付きタグも対象） */
function stripHtmlTags(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

/** http(s) / www で始まるURLを削除 */
function stripUrls(text: string): string {
  return text
    .replace(
      /https?:\/\/[^\s<>"')\]]+/gi,
      "",
    )
    .replace(
      /(?:^|[\s(])www\.[^\s<>"')\]]+/gi,
      (m) => (m.startsWith("www") ? "" : m[0] ?? ""),
    );
}

/**
 * メールアドレス除去＋装飾・連続記号の整理。
 * ゼロ幅文字や過剰な記号ノイズも軽減する。
 */
function tidyEmailsAndSymbols(text: string): string {
  let t = text;
  // メールアドレス
  t = t.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    "",
  );
  // ゼロ幅・BOM など
  t = t.replace(/[\u200B-\u200D\uFEFF\u2060]/g, "");
  // 装飾記号の連続を1つに（★☆■□◆◇●○※など）
  t = t.replace(/([★☆■□◆◇●○※◎]+)\1+/g, "$1");
  // 同じ句読点・記号の過剰連続（。。。は2つまで、!!! は1つに）
  t = t.replace(/([!！?？])\1{2,}/g, "$1");
  t = t.replace(/([.。])\1{3,}/g, "$1$1");
  // 「◆◆◆」のような区切り行を簡略
  t = t.replace(/^[-=_*・]{4,}\s*$/gm, "---");
  return t;
}

/**
 * クレンジングオプションと置換ルールを順に適用する。
 * 入力テキストは変更せず、結果だけ返す。
 */
export function cleanText(
  input: string,
  options: CleanOptions,
  rules: ReplaceRule[],
): string {
  let text = input;

  // 0. 特殊クレンジング（先に適用）
  if (options.stripHtml) {
    text = stripHtmlTags(text);
  }
  if (options.stripUrls) {
    text = stripUrls(text);
  }
  if (options.tidyEmailsAndSymbols) {
    text = tidyEmailsAndSymbols(text);
  }

  // 1. 制御文字（タブ・改行以外）を除去
  if (options.stripControlChars) {
    text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  }

  // 2. 全角 → 半角
  if (options.zenkakuToHankaku) {
    text = toHankaku(text);
  }

  // 3. 行末空白
  if (options.trimLineEnds) {
    text = text.replace(/[ \t\u3000]+$/gm, "");
  }

  // 4. 空白（スペース・タブ）
  if (options.whitespaceMode === "remove") {
    text = text.replace(/[ \t\u3000]+/g, "");
  } else if (options.whitespaceMode === "normalize") {
    text = text.replace(/[ \t\u3000]+/g, " ");
  }

  // 5. 改行・空行
  if (options.lineBreakMode === "remove") {
    text = text.replace(/[\r\n]+/g, "");
  } else if (options.lineBreakMode === "collapse") {
    text = text.replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n");
  } else {
    text = text.replace(/\r\n?/g, "\n");
  }

  // 6. 一括置換（有効かつ検索語ありのみ）
  for (const rule of rules) {
    if (!rule.enabled || !rule.find) continue;
    text = text.split(rule.find).join(rule.replace);
  }

  return text;
}

/** 差分の簡易サマリー（文字数） */
export function summarizeDiff(
  original: string,
  cleaned: string,
): { originalChars: number; cleanedChars: number; delta: number } {
  const originalChars = [...original].length;
  const cleanedChars = [...cleaned].length;
  return {
    originalChars,
    cleanedChars,
    delta: cleanedChars - originalChars,
  };
}

/** 差分チャンク（表示用） */
export type DiffChunk = {
  type: "equal" | "remove" | "add";
  text: string;
};

/**
 * 行単位の差分。変更行は文字単位でさらに分割する。
 * テキストが非常に長い場合は行単位のみ。
 */
export function computeDiffChunks(
  original: string,
  cleaned: string,
): DiffChunk[] {
  if (original === cleaned) {
    return original ? [{ type: "equal", text: original }] : [];
  }

  const a = original.replace(/\r\n?/g, "\n").split("\n");
  const b = cleaned.replace(/\r\n?/g, "\n").split("\n");
  const lineOps = lcsDiff(a, b);

  const chunks: DiffChunk[] = [];
  let i = 0;
  while (i < lineOps.length) {
    const op = lineOps[i]!;
    if (op.type === "equal") {
      chunks.push({
        type: "equal",
        text: op.value + (i < lineOps.length - 1 || op.value !== "" ? "\n" : ""),
      });
      // 末尾の余分な改行調整は後で
      i += 1;
      continue;
    }

    // 連続する remove / add をまとめて文字差分
    const removes: string[] = [];
    const adds: string[] = [];
    while (i < lineOps.length && lineOps[i]!.type !== "equal") {
      const cur = lineOps[i]!;
      if (cur.type === "remove") removes.push(cur.value);
      if (cur.type === "add") adds.push(cur.value);
      i += 1;
    }
    const remText = removes.join("\n");
    const addText = adds.join("\n");

    if (remText && addText && remText.length + addText.length < 4000) {
      const charChunks = lcsDiff([...remText], [...addText]).map((c) => ({
        type: c.type,
        text: c.value,
      }));
      chunks.push(...charChunks);
      chunks.push({ type: "equal", text: "\n" });
    } else {
      if (remText) chunks.push({ type: "remove", text: remText + "\n" });
      if (addText) chunks.push({ type: "add", text: addText + "\n" });
    }
  }

  // 末尾の単独改行を整える
  const last = chunks[chunks.length - 1];
  if (last?.type === "equal" && last.text === "\n" && chunks.length > 1) {
    // 元テキストが改行終わりでない場合は落とす
    if (!cleaned.endsWith("\n") && !original.endsWith("\n")) {
      chunks.pop();
    }
  }

  return mergeAdjacent(chunks);
}

type Op = { type: "equal" | "remove" | "add"; value: string };

/** 配列の LCS 差分（Myers 簡易版） */
function lcsDiff(a: string[], b: string[]): Op[] {
  const n = a.length;
  const m = b.length;
  // 短すぎる／長すぎる場合のガード
  if (n === 0 && m === 0) return [];
  if (n === 0) return b.map((value) => ({ type: "add" as const, value }));
  if (m === 0) return a.map((value) => ({ type: "remove" as const, value }));
  if (n * m > 250_000) {
    // 巨大テキストは先頭一致＋残りを丸ごと差分
    let i = 0;
    while (i < n && i < m && a[i] === b[i]) i += 1;
    const ops: Op[] = [];
    for (let k = 0; k < i; k++) ops.push({ type: "equal", value: a[k]! });
    for (let k = i; k < n; k++) ops.push({ type: "remove", value: a[k]! });
    for (let k = i; k < m; k++) ops.push({ type: "add", value: b[k]! });
    return ops;
  }

  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    Array(m + 1).fill(0),
  );
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i]![j] =
        a[i] === b[j]
          ? (dp[i + 1]![j + 1]! + 1)
          : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
    }
  }

  const ops: Op[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ type: "equal", value: a[i]! });
      i += 1;
      j += 1;
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
      ops.push({ type: "remove", value: a[i]! });
      i += 1;
    } else {
      ops.push({ type: "add", value: b[j]! });
      j += 1;
    }
  }
  while (i < n) {
    ops.push({ type: "remove", value: a[i]! });
    i += 1;
  }
  while (j < m) {
    ops.push({ type: "add", value: b[j]! });
    j += 1;
  }
  return ops;
}

function mergeAdjacent(chunks: DiffChunk[]): DiffChunk[] {
  const out: DiffChunk[] = [];
  for (const c of chunks) {
    if (!c.text) continue;
    const last = out[out.length - 1];
    if (last && last.type === c.type) {
      last.text += c.text;
    } else {
      out.push({ ...c });
    }
  }
  return out;
}
