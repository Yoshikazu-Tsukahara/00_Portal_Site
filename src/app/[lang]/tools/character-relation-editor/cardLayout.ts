import {
  isCompactCardField,
  truncateCardText,
  type CardDisplayItem,
  type Character,
  type DetailFieldKey,
} from "./types";

/** キャンバスカード用：名前・二つ名・年齢・性別とその他表示項目 */
export type CardLayoutData = {
  nickname: string | null;
  age: string | null;
  gender: string | null;
  /** 二つ名・年齢・性別以外の表示項目 */
  extras: CardDisplayItem[];
};

/** キャラクターカードのレイアウト用データを組み立てる */
export function getCardLayoutData(ch: Character): CardLayoutData {
  const visible = new Set(ch.cardVisibleKeys);
  const pick = (key: DetailFieldKey): string | null => {
    if (!visible.has(key)) return null;
    const value = ch.details[key]?.trim();
    return value ? truncateCardText(value) : null;
  };

  const extras: CardDisplayItem[] = [];
  for (const key of ch.cardVisibleKeys) {
    if (key === "nickname" || key === "age" || key === "gender") continue;
    const value = ch.details[key]?.trim();
    if (!value) continue;
    extras.push({
      key,
      text: truncateCardText(value),
      compact: isCompactCardField(key, value),
    });
  }

  return {
    nickname: pick("nickname"),
    age: pick("age"),
    gender: pick("gender"),
    extras,
  };
}

export function hasCardBodyContent(layout: CardLayoutData): boolean {
  return !!(
    layout.nickname ||
    layout.age ||
    layout.gender ||
    layout.extras.length > 0
  );
}
