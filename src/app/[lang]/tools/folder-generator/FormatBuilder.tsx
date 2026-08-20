"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { fmt, useI18n } from "@/i18n";
import type { FolderGeneratorDict } from "@/i18n/apps/folderGenerator";
import {
  type FolderNode,
  type FormatToken,
  type VariableKind,
} from "./types";
import { flattenNodes } from "./treeUtils";
import { getVariableMeta } from "./variableMeta";

type FormatCopy = FolderGeneratorDict["format"];

function SortableToken({
  token,
  copy,
  onChangeText,
  onRemove,
}: {
  token: FormatToken;
  copy: FormatCopy;
  onChangeText: (id: string, value: string) => void;
  onRemove: (id: string) => void;
}) {
  const { t } = useI18n();
  const meta = getVariableMeta(t.apps.folderGenerator.variableKinds);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: token.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (token.type === "text") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`group relative flex items-center ${isDragging ? "z-10 opacity-60" : ""}`}
      >
        <button
          type="button"
          className="cursor-grab touch-none px-0.5 text-[10px] text-zinc-300 hover:text-zinc-500 active:cursor-grabbing"
          aria-label={copy.reorder}
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </button>
        <input
          type="text"
          value={token.value}
          onChange={(e) => onChangeText(token.id, e.target.value)}
          placeholder={copy.textPlaceholder}
          className="input-field h-6 min-w-[3rem] max-w-[8rem] px-1.5 py-0 text-xs"
        />
        <button
          type="button"
          onClick={() => onRemove(token.id)}
          className="rounded px-0.5 text-xs text-zinc-400 opacity-0 hover:text-red-500 group-hover:opacity-100"
          aria-label={copy.delete}
        >
          ×
        </button>
      </div>
    );
  }

  const variableMeta = meta[token.type];
  const label = `${variableMeta.short}${token.index}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center ${isDragging ? "z-10 opacity-60" : ""}`}
    >
      <span
        className={`inline-flex h-6 cursor-grab items-center gap-1 rounded border px-1.5 text-xs font-medium active:cursor-grabbing ${variableMeta.color}`}
        {...attributes}
        {...listeners}
      >
        <span className="text-[9px] opacity-50">⋮⋮</span>
        {label}
      </span>
      <button
        type="button"
        onClick={() => onRemove(token.id)}
        className="rounded px-0.5 text-xs text-zinc-400 opacity-0 hover:text-red-500 group-hover:opacity-100"
        aria-label={fmt(copy.deleteToken, { label })}
      >
        ×
      </button>
    </div>
  );
}

/** 1階層分の組み立て行（親 / 子） */
function FormatRow({
  node,
  depth,
  isActive,
  copy,
  onSelect,
  onChangeText,
  onRemoveToken,
  onAddText,
  onAddChild,
  onRemoveNode,
}: {
  node: FolderNode;
  depth: number;
  isActive: boolean;
  copy: FormatCopy;
  onSelect: (nodeId: string) => void;
  onChangeText: (tokenId: string, value: string) => void;
  onRemoveToken: (tokenId: string) => void;
  onAddText: (nodeId: string) => void;
  onAddChild: (parentId: string) => void;
  onRemoveNode: (nodeId: string) => void;
}) {
  const droppableId = `format-area-${node.id}`;
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });
  const isRoot = depth === 0;

  return (
    <div
      className="flex items-stretch gap-1"
      style={{ paddingLeft: depth * 16 }}
    >
      {depth > 0 ? (
        <span
          aria-hidden
          className="mt-2 w-3 shrink-0 border-l border-b border-zinc-200"
          style={{ height: 12 }}
        />
      ) : null}

      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(node.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(node.id);
          }
        }}
        className={`group flex min-w-0 flex-1 items-center gap-1 rounded border px-1.5 py-1 transition-colors ${
          isActive
            ? "border-zinc-400 bg-white ring-1 ring-zinc-900/10"
            : isOver
              ? "border-zinc-400 bg-zinc-100"
              : "border-zinc-200/80 bg-zinc-50/40 hover:border-zinc-300"
        }`}
      >
        <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
          {isRoot ? copy.parent : copy.child}
        </span>

        <div
          ref={setNodeRef}
          className="flex min-h-6 min-w-0 flex-1 flex-wrap items-center gap-1"
        >
          {node.tokens.length === 0 ? (
            <span className="text-[11px] text-zinc-400">{copy.empty}</span>
          ) : (
            <SortableContext
              items={node.tokens.map((t) => t.id)}
              strategy={horizontalListSortingStrategy}
            >
              {node.tokens.map((token) => (
                <SortableToken
                  key={token.id}
                  token={token}
                  copy={copy}
                  onChangeText={onChangeText}
                  onRemove={onRemoveToken}
                />
              ))}
            </SortableContext>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            title={copy.addTextTitle}
            onClick={(e) => {
              e.stopPropagation();
              onAddText(node.id);
              onSelect(node.id);
            }}
            className="rounded px-1.5 py-0.5 text-[10px] text-zinc-500 hover:bg-white hover:text-zinc-800"
          >
            {copy.addText}
          </button>
          <button
            type="button"
            title={copy.addChildTitle}
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(node.id);
            }}
            className="rounded px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 hover:bg-white hover:text-zinc-900"
          >
            {copy.addChild}
          </button>
          {!isRoot ? (
            <button
              type="button"
              title={copy.delete}
              onClick={(e) => {
                e.stopPropagation();
                onRemoveNode(node.id);
              }}
              className="rounded px-1 py-0.5 text-[10px] text-zinc-400 opacity-0 hover:text-red-500 group-hover:opacity-100"
            >
              ×
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** フォーマット組み立てエリア（ツリー型） */
export default function FormatBuilder({
  root,
  activeNodeId,
  onSelectNode,
  onChangeText,
  onRemoveToken,
  onAddText,
  onAddChild,
  onRemoveNode,
}: {
  root: FolderNode;
  activeNodeId: string;
  onSelectNode: (nodeId: string) => void;
  onChangeText: (tokenId: string, value: string) => void;
  onRemoveToken: (tokenId: string) => void;
  onAddText: (nodeId: string) => void;
  onAddChild: (parentId: string) => void;
  onRemoveNode: (nodeId: string) => void;
}) {
  const { t } = useI18n();
  const copy = t.apps.folderGenerator.format;
  const rows = flattenNodes(root);

  return (
    <section className="content-card !p-2.5 sm:!p-3">
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">{copy.heading}</h2>
          <p className="text-[11px] text-zinc-500">{copy.hint}</p>
        </div>
      </div>

      <div className="space-y-1">
        {rows.map(({ node, depth }) => (
          <FormatRow
            key={node.id}
            node={node}
            depth={depth}
            isActive={activeNodeId === node.id}
            copy={copy}
            onSelect={onSelectNode}
            onChangeText={onChangeText}
            onRemoveToken={onRemoveToken}
            onAddText={onAddText}
            onAddChild={onAddChild}
            onRemoveNode={onRemoveNode}
          />
        ))}
      </div>
    </section>
  );
}

/** ドラッグ中のオーバーレイ表示用バッジ */
export function DragOverlayBadge({
  kind,
  index,
}: {
  kind: VariableKind;
  index?: number;
}) {
  const { t } = useI18n();
  const meta = getVariableMeta(t.apps.folderGenerator.variableKinds);
  const variableMeta = meta[kind];
  const label = index ? `${variableMeta.short}${index}` : variableMeta.label;

  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-1 text-xs font-medium shadow-lg ${variableMeta.color}`}
    >
      {label}
    </span>
  );
}
