/** テキスト・クレンジング＆一括置換ツールの型定義 */

/** 空行・改行の扱い */
export type LineBreakMode = "keep" | "collapse" | "remove";

/** 空白（スペース・タブ）の扱い */
export type WhitespaceMode = "keep" | "normalize" | "remove";

export type CleanOptions = {
  /** 制御文字を除去 */
  stripControlChars: boolean;
  /** 行末の空白を除去 */
  trimLineEnds: boolean;
  lineBreakMode: LineBreakMode;
  whitespaceMode: WhitespaceMode;
  /** 全角英数・記号を半角に */
  zenkakuToHankaku: boolean;
  /** HTMLタグを除去 */
  stripHtml: boolean;
  /** URLを削除 */
  stripUrls: boolean;
  /** メールアドレス除去＋ノイズ記号の整理 */
  tidyEmailsAndSymbols: boolean;
};

export type ReplaceRule = {
  id: string;
  find: string;
  replace: string;
  enabled: boolean;
};

/** ユーザー保存の置換ルールセット */
export type ReplacePreset = {
  id: string;
  name: string;
  rules: ReplaceRule[];
};

export type TextCleanerData = {
  options: CleanOptions;
  rules: ReplaceRule[];
  presets: ReplacePreset[];
  activePresetId: string | null;
};

export const DEFAULT_OPTIONS: CleanOptions = {
  stripControlChars: true,
  trimLineEnds: true,
  lineBreakMode: "collapse",
  whitespaceMode: "normalize",
  zenkakuToHankaku: false,
  stripHtml: false,
  stripUrls: false,
  tidyEmailsAndSymbols: false,
};

export function createId(prefix = "rule"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyRule(): ReplaceRule {
  return {
    id: createId(),
    find: "",
    replace: "",
    enabled: true,
  };
}

export function createPreset(
  name: string,
  rules: ReplaceRule[] = [],
): ReplacePreset {
  return {
    id: createId("preset"),
    name: name.trim() || "無題セット",
    rules: rules.map((r) => ({
      ...r,
      id: createId(),
    })),
  };
}
