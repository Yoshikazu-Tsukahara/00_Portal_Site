"use client";

import {
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useI18n } from "@/i18n";
import FileCard from "./FileCard";
import type { FileGroup } from "./fileGroups";

/** ファイル単位モードのグリッド（ドラッグで結合順を入替） */
export default function FileGroupList({
  groups,
  onRename,
  onRemove,
  onDuplicate,
}: {
  groups: FileGroup[];
  onRename: (sourceId: string, name: string) => void;
  onRemove: (sourceId: string) => void;
  onDuplicate: (sourceId: string) => void;
}) {
  const { t } = useI18n();
  const copy = t.apps.pdfEditor.fileList;

  if (groups.length === 0) {
    return (
      <div className="flex h-[60vh] max-h-[650px] items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50/30">
        <p className="text-sm text-zinc-400">{copy.noFiles}</p>
      </div>
    );
  }

  return (
    <div className="h-[60vh] max-h-[650px] overflow-y-auto rounded-lg border border-zinc-200/60 bg-zinc-50/30 p-3 [scrollbar-width:thin]">
      <SortableContext
        items={groups.map((g) => g.sourceId)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <FileCard
              key={group.sourceId}
              group={group}
              onRename={onRename}
              onRemove={onRemove}
              onDuplicate={onDuplicate}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
