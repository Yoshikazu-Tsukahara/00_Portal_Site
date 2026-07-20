"use client";

import { useDraggable } from "@dnd-kit/core";
import { VARIABLE_META, type VariableKind } from "./types";

const KINDS: VariableKind[] = ["date", "number", "list"];

function ToolboxItem({ kind }: { kind: VariableKind }) {
  const meta = VARIABLE_META[kind];
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
      className={`flex w-full cursor-grab items-center rounded border px-2 py-1.5 text-xs font-medium transition-colors active:cursor-grabbing ${meta.color} ${
        isDragging ? "opacity-40" : "hover:bg-white/60"
      }`}
    >
      {meta.label}
    </button>
  );
}

/** 左（または上部）の変数ブロック一覧 */
export default function Toolbox() {
  return (
    <section className="content-card !p-2">
      <h2 className="text-xs font-semibold text-zinc-900">ツールボックス</h2>
      <p className="mt-0.5 mb-1.5 text-[10px] leading-relaxed text-zinc-500">
        ドラッグして追加
      </p>
      <div className="flex flex-wrap gap-1.5 lg:flex-col">
        {KINDS.map((kind) => (
          <ToolboxItem key={kind} kind={kind} />
        ))}
      </div>
    </section>
  );
}
