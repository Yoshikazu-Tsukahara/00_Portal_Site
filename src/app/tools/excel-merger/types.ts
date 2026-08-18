/** 他シート参照の種類（数式・グラフ・名前定義など） */
export type SheetRefKind =
  | "formula"
  | "chart"
  | "name"
  | "validation"
  | "pivot"
  | "link"
  | "cf";

/**
 * 1 シート = 1 カードの表示用データ。
 * シートの実データ（WorkSheet オブジェクト）は page 側の Map が id で保持する。
 */
export type SheetEntry = {
  /** 並べ替え・削除用の一意キー */
  id: string;
  /** 読み込み元のファイル名（拡張子込み）。列を移しても変わらない */
  fileName: string;
  /** 元のシート名 */
  sheetName: string;
  /** データ範囲の行数（空シートは 0） */
  rowCount: number;
  /** データ範囲の列数（空シートは 0） */
  columnCount: number;
  /** 他シート参照がある。抽出すると数式やグラフが壊れうる */
  hasSheetRefs: boolean;
  /** 参照先シート名（カード表示用。取れないこともある） */
  referencedSheetNames: string[];
  /** 参照先ごとの種類（数式・グラフ・名前定義など） */
  refKindByTarget: Record<string, SheetRefKind[]>;
};

/** 読み込みできる Excel ファイル数（＝カンバンの列数）の上限 */
export const MAX_COLUMNS = 5;

/** 読み込んだ Excel 1 ファイル分の縦列 */
export type FileColumn = {
  /** 列そのものの一意キー（ドロップ先の判定に使う） */
  id: string;
  /** 列ヘッダーに出すファイル名（この列を書き出すときの名前） */
  fileName: string;
  /** 上から順のシート id */
  sheetIds: string[];
};
