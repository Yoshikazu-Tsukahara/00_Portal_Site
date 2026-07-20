import { COLOR_PALETTE } from "@/lib/colorPalette";

/** ツールボックスから置ける変数の種類 */
export type VariableKind = "date" | "number" | "list";

/** 日付ブロックの設定 */
export type DateSettings = {
  format: "yyyymmdd" | "yyyy-mm-dd" | "yyyy/mm/dd" | "yyyy年mm月dd日";
  increment: "fixed" | "daily";
  baseDate: string;
};

/** 番号ブロックの設定 */
export type NumberSettings = {
  style: "numeric" | "alpha";
  start: number;
  digits: number;
};

/** リストブロックの設定 */
export type ListSettings = {
  items: string;
};

/** 固定文字トークン */
export type TextToken = {
  id: string;
  type: "text";
  value: string;
};

/** 変数トークン（日付・番号・リスト） */
export type VariableToken = {
  id: string;
  type: VariableKind;
  /** 画面表示用の通し番号（日付1 の 1 など） */
  index: number;
  date: DateSettings;
  number: NumberSettings;
  list: ListSettings;
};

export type FormatToken = TextToken | VariableToken;

/**
 * フォルダ階層の1ノード。
 * tokens がその階層の命名規則、children が直下の子フォルダ定義。
 */
export type FolderNode = {
  id: string;
  tokens: FormatToken[];
  children: FolderNode[];
};

export function isVariableToken(token: FormatToken): token is VariableToken {
  return token.type !== "text";
}

/** 今日の日付を YYYY-MM-DD で返す */
export function todayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 空のフォルダノードを作成 */
export function createFolderNode(id: string): FolderNode {
  return { id, tokens: [], children: [] };
}

/** 変数ブロックの初期設定を返す */
export function createDefaultVariable(
  kind: VariableKind,
  id: string,
  index: number,
): VariableToken {
  return {
    id,
    type: kind,
    index,
    date: {
      format: "yyyymmdd",
      increment: "fixed",
      baseDate: todayIsoDate(),
    },
    number: {
      style: "numeric",
      start: 1,
      digits: 2,
    },
    list: {
      items: "企画,デザイン,開発",
    },
  };
}

/** 変数ブロックの表示メタ（色は共通5色パレットに固定） */
export const VARIABLE_META: Record<
  VariableKind,
  { label: string; short: string; color: string }
> = {
  date: {
    label: "日付",
    short: "日付",
    color: COLOR_PALETTE.blue,
  },
  number: {
    label: "番号",
    short: "番号",
    color: COLOR_PALETTE.green,
  },
  list: {
    label: "リスト",
    short: "リスト",
    color: COLOR_PALETTE.purple,
  },
};
