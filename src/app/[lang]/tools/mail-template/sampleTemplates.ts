import type { MailTemplateDefaults } from "@/i18n/apps/mailTemplate";
import type { MailTemplate, TagMasterItem, VariableMasterItem } from "./types";
import { createId } from "./types";

function idsByKeys(
  master: VariableMasterItem[],
  keys: string[],
): string[] {
  const set = new Set(keys);
  return master.filter((v) => set.has(v.key)).map((v) => v.id);
}

function tagIdsByIndices(tags: TagMasterItem[], indices: number[]): string[] {
  return indices
    .map((i) => tags[i]?.id)
    .filter((id): id is string => id !== undefined);
}

/** 初期サンプル（変数・タグ ID を参照） */
export function createSampleTemplates(
  master: VariableMasterItem[],
  tags: TagMasterItem[] = [],
  defs: MailTemplateDefaults["templates"] = [],
): MailTemplate[] {
  const now = Date.now();

  return defs.map((def, index) => ({
    id: createId("tpl"),
    title: def.title,
    subject: def.subject,
    body: def.body,
    enabledVariableIds: idsByKeys(master, def.variableKeys),
    tagIds: tagIdsByIndices(tags, def.tagIndices),
    pinned: false,
    createdAt: now + index,
    updatedAt: now + index,
  }));
}
