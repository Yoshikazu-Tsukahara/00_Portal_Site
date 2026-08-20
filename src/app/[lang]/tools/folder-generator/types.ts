
/** ツールボックスから置ける変数の種類 */
export type VariableKind = "date" | "number" | "list";

/** 日付フォーマット（/ はフォルダ名に使えないため _ 区切りを用意） */
export type DateFormat =
  | "yyyymmdd"
  | "yyyy-mm-dd"
  | "yyyy_mm_dd"
  | "yyyy年mm月dd日";

/** 日付ブロックの設定 */
export type DateSettings = {
  format: DateFormat;
  increment: "fixed" | "daily";
  baseDate: string;
};

/** 旧フォーマット（yyyy/mm/dd）などを現行値へ正規化 */
export function normalizeDateFormat(format: string): DateFormat {
  if (format === "yyyy/mm/dd") return "yyyy_mm_dd";
  if (
    format === "yyyymmdd" ||
    format === "yyyy-mm-dd" ||
    format === "yyyy_mm_dd" ||
    format === "yyyy年mm月dd日"
  ) {
    return format;
  }
  return "yyyymmdd";
}

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

/** 保存済みツリーの日付フォーマットを現行値へ揃える */
export function normalizeFolderTree(node: FolderNode): FolderNode {
  return {
    ...node,
    tokens: node.tokens.map((token) => {
      if (!isVariableToken(token) || token.type !== "date") return token;
      return {
        ...token,
        date: {
          ...token.date,
          format: normalizeDateFormat(token.date.format),
        },
      };
    }),
    children: node.children.map(normalizeFolderTree),
  };
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
  options?: { listItems?: string },
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
      items: options?.listItems ?? "Planning,Design,Development",
    },
  };
}
