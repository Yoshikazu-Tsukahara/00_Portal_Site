import { COLOR_PALETTE } from "@/lib/colorPalette";
import type { FolderGeneratorDict } from "@/i18n/apps/folderGenerator";
import type { VariableKind } from "./types";

/** i18n 連動の変数ブロック表示メタ */
export function getVariableMeta(
  copy: FolderGeneratorDict["variableKinds"],
): Record<
  VariableKind,
  { label: string; short: string; color: string }
> {
  return {
    date: {
      label: copy.date.label,
      short: copy.date.short,
      color: COLOR_PALETTE.blue,
    },
    number: {
      label: copy.number.label,
      short: copy.number.short,
      color: COLOR_PALETTE.green,
    },
    list: {
      label: copy.list.label,
      short: copy.list.short,
      color: COLOR_PALETTE.purple,
    },
  };
}
