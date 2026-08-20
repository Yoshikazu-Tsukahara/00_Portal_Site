import { createId, type ReplaceRule } from "./types";

/** ワンクリック適用用の組み込みパターン集（LocalStorage には保存しない） */
export type BuiltinPack = {
  id: string;
  name: string;
  description: string;
  rules: Omit<ReplaceRule, "id">[];
};

export const BUILTIN_PACKS: BuiltinPack[] = [
  {
    id: "business",
    name: "ビジネス用",
    description: "会社名・敬称の略記など",
    rules: [
      { find: "株式会社", replace: "(株)", enabled: true },
      { find: "有限会社", replace: "(有)", enabled: true },
      { find: "合同会社", replace: "(同)", enabled: true },
      { find: "様方", replace: "様", enabled: true },
    ],
  },
  {
    id: "blog",
    name: "ブログ原稿用",
    description: "全角スペース・装飾の整理",
    rules: [
      { find: "　", replace: " ", enabled: true },
      { find: "・・・", replace: "…", enabled: true },
      { find: "－－", replace: "—", enabled: true },
      { find: "！！", replace: "！", enabled: true },
    ],
  },
  {
    id: "quote",
    name: "引用記号の統一",
    description: "カギ括弧・引用符の正規化",
    rules: [
      { find: "“", replace: "「", enabled: true },
      { find: "”", replace: "」", enabled: true },
      { find: "‘", replace: "『", enabled: true },
      { find: "’", replace: "』", enabled: true },
    ],
  },
];

/** 組み込みパックを ReplaceRule[] に変換 */
export function rulesFromBuiltinPack(pack: BuiltinPack): ReplaceRule[] {
  return pack.rules.map((r) => ({
    ...r,
    id: createId(),
  }));
}
