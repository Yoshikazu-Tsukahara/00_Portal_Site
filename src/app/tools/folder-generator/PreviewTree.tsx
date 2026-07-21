"use client";

import { fmt, useI18n } from "@/i18n";
import type { TreePreviewLine } from "./generateFolderNames";

/** プレビュー：枝表示のフォルダツリー */
export default function PreviewTree({
  lines,
  hiddenCount,
}: {
  lines: TreePreviewLine[];
  hiddenCount: number;
}) {
  const { t } = useI18n();
  const copy = t.apps.folderGenerator.previewTree;

  if (lines.length === 0) {
    return <p className="text-xs text-zinc-400">{copy.empty}</p>;
  }

  return (
    <div>
      <ul className="space-y-0 font-mono text-xs leading-relaxed text-zinc-700">
        {lines.map((line) => (
          <li key={line.id} className="truncate whitespace-pre">
            {line.text}
          </li>
        ))}
      </ul>
      {hiddenCount > 0 ? (
        <p className="mt-1 text-[10px] text-zinc-400">
          {fmt(copy.more, { count: hiddenCount })}
        </p>
      ) : null}
    </div>
  );
}
