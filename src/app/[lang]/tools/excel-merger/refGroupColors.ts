import type { SheetEntry } from "./types";

/** 参照グループの薄い色（作業領域内。サイト全体のアクセントとは別） */
export type RefGroupTint = {
  bg: string;
  border: string;
  accent: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
};

/** つながっているカード同士で揃える。薄く、互いに見分けやすい色 */
const GROUP_TINTS: RefGroupTint[] = [
  {
    bg: "#eef2fa",
    border: "#c5cde0",
    accent: "#8a9bb8",
    badgeBg: "#e4eaf6",
    badgeBorder: "#b7c2d8",
    badgeText: "#3d4a66",
  },
  {
    bg: "#f7f1e8",
    border: "#dccbb0",
    accent: "#c4a574",
    badgeBg: "#f3eadc",
    badgeBorder: "#d4c09a",
    badgeText: "#6a542e",
  },
  {
    bg: "#eaf4f4",
    border: "#b3d0d0",
    accent: "#6fa3a3",
    badgeBg: "#dceeee",
    badgeBorder: "#a0c8c8",
    badgeText: "#2f5555",
  },
  {
    bg: "#f6ecec",
    border: "#d8b8b8",
    accent: "#c48989",
    badgeBg: "#f0e0e0",
    badgeBorder: "#d0a8a8",
    badgeText: "#6b3d3d",
  },
  {
    bg: "#eef0ff",
    border: "#c5cce8",
    accent: "#8b96c4",
    badgeBg: "#e4e8f8",
    badgeBorder: "#b8c0e0",
    badgeText: "#3d4470",
  },
  {
    bg: "#f4f0e6",
    border: "#d0c9a8",
    accent: "#b8ad70",
    badgeBg: "#ece8d4",
    badgeBorder: "#c8c090",
    badgeText: "#5a5428",
  },
];

/** 参照先がボード上にいないときの色（警告バッジと同系） */
const UNPAIRED_TINT: RefGroupTint = {
  bg: "#fbf6ee",
  border: "#ead9b8",
  accent: "#d4a574",
  badgeBg: "#fffbeb",
  badgeBorder: "#fcd34d",
  badgeText: "#92400e",
};

function resolveTarget(
  from: SheetEntry,
  targetName: string,
  all: SheetEntry[],
): SheetEntry | undefined {
  const key = targetName.trim().toLowerCase();
  if (!key) return undefined;
  const sameFile = all.find(
    (entry) =>
      entry.fileName === from.fileName &&
      entry.sheetName.toLowerCase() === key,
  );
  if (sameFile) return sameFile;
  return all.find((entry) => entry.sheetName.toLowerCase() === key);
}

function findRoot(
  id: string,
  parent: Map<string, string>,
): string {
  let current = parent.get(id) ?? id;
  while (parent.get(current) && parent.get(current) !== current) {
    current = parent.get(current) as string;
  }
  parent.set(id, current);
  return current;
}

/**
 * ボード上の参照関係から、カード id → 色を決める。
 * つながっているカードは同じ色。相手がボードにいない参照は警告色。
 */
export function buildRefTintById(
  entries: SheetEntry[],
): Record<string, RefGroupTint> {
  const parent = new Map<string, string>();
  for (const entry of entries) parent.set(entry.id, entry.id);

  const union = (a: string, b: string) => {
    const rootA = findRoot(a, parent);
    const rootB = findRoot(b, parent);
    if (rootA !== rootB) parent.set(rootA, rootB);
  };

  for (const entry of entries) {
    for (const name of entry.referencedSheetNames ?? []) {
      const target = resolveTarget(entry, name, entries);
      if (target && target.id !== entry.id) union(entry.id, target.id);
    }
  }

  const groups = new Map<string, SheetEntry[]>();
  for (const entry of entries) {
    const root = findRoot(entry.id, parent);
    const list = groups.get(root) ?? [];
    list.push(entry);
    groups.set(root, list);
  }

  const linked = [...groups.values()]
    .filter((group) => group.length >= 2)
    .sort((a, b) => {
      const label = (group: SheetEntry[]) =>
        group
          .map((entry) => `${entry.fileName}\0${entry.sheetName}`)
          .sort()
          .join("\n");
      return label(a).localeCompare(label(b), "ja");
    });

  const out: Record<string, RefGroupTint> = {};
  linked.forEach((group, index) => {
    const tint = GROUP_TINTS[index % GROUP_TINTS.length];
    for (const entry of group) out[entry.id] = tint;
  });

  for (const entry of entries) {
    if (out[entry.id]) continue;
    const hasOutbound = (entry.referencedSheetNames ?? []).length > 0 || entry.hasSheetRefs;
    if (hasOutbound) out[entry.id] = UNPAIRED_TINT;
  }

  return out;
}
