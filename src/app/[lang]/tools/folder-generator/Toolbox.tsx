"use client";

import { useDraggable } from "@dnd-kit/core";
import { useI18n } from "@/i18n";
import { getVariableMeta } from "./variableMeta";
import type { VariableKind } from "./types";

const KINDS: VariableKind[] = ["date", "number", "list"];

function ToolboxItem({
  kind,
  label,
  color,
}: {
  kind: VariableKind;
  label: string;
  color: string;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `toolbox-${kind}`,
    data: { from: "toolbox", kind },
  });

  return (
    <button
      type="button"
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex w-full cursor-grab items-center rounded border px-2 py-1.5 text-xs font-medium transition-colors active:cursor-grabbing ${color} ${
        isDragging ? "opacity-40" : "hover:bg-white/60"
      }`}
    >
      {label}
    </button>
  );
}

/** 左（または上部）の変数ブロック一覧 */
export default function Toolbox() {
  const { t } = useI18n();
  const copy = t.apps.folderGenerator;
  const meta = getVariableMeta(copy.variableKinds);

  return (
    <section className="content-card !p-2">
      <h2 className="text-xs font-semibold text-zinc-900">{copy.toolbox.heading}</h2>
      <p className="mt-0.5 mb-1.5 text-[10px] leading-relaxed text-zinc-500">
        {copy.toolbox.hint}
      </p>
      <div className="flex flex-wrap gap-1.5 lg:flex-col">
        {KINDS.map((kind) => (
          <ToolboxItem
            key={kind}
            kind={kind}
            label={meta[kind].label}
            color={meta[kind].color}
          />
        ))}
      </div>
    </section>
  );
}
