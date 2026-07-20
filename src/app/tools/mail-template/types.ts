/** 全体で共有する変数マスタの1項目 */
export type VariableMasterItem = {
  id: string;
  /** 差し込みキー（{{key}}） */
  key: string;
  /** 表示用ラベル（例: 会社名） */
  label: string;
};

/** タグのカラーID（10色固定パレット） */
export type TagColorId =
  | "red"
  | "orange"
  | "amber"
  | "green"
  | "emerald"
  | "cyan"
  | "blue"
  | "indigo"
  | "purple"
  | "pink";

/** アプリ全体のタグ・ラベルマスタ */
export type TagMasterItem = {
  id: string;
  /** 表示名（例: 重要） */
  name: string;
  /** カラーパレットID */
  color: TagColorId;
};

/** メールテンプレート */
export type MailTemplate = {
  id: string;
  title: string;
  subject: string;
  body: string;
  /** このテンプレートで使用する変数マスタの ID */
  enabledVariableIds: string[];
  /** 紐付けたタグ・ラベルの ID（複数可） */
  tagIds: string[];
  /** お気に入り（ピン留め） */
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
};

export function createId(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
