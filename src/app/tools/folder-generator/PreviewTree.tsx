import type { TreePreviewLine } from "./generateFolderNames";

/** プレビュー：枝表示のフォルダツリー */
export default function PreviewTree({
  lines,
  hiddenCount,
}: {
  lines: TreePreviewLine[];
  hiddenCount: number;
}) {
  if (lines.length === 0) {
    return <p className="text-xs text-zinc-400">プレビューなし</p>;
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
        <p className="mt-1 text-[10px] text-zinc-400">他 {hiddenCount} 件</p>
      ) : null}
    </div>
  );
}
