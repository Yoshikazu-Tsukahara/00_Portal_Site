"use client";

import { useMemo, useState, useId } from "react";
import JSZip from "jszip";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import AppShell from "@/components/AppShell";
import { useI18n } from "@/i18n";
import Toolbox from "./Toolbox";
import FormatBuilder, { DragOverlayBadge } from "./FormatBuilder";
import SettingsPanel from "./SettingsPanel";
import {
  countExpandedFolders,
  formatTreePreviewLines,
  generateFolderTree,
  type ExpandedFolder,
} from "./generateFolderNames";
import PreviewTree from "./PreviewTree";
import TemplateBar from "./TemplateBar";
import {
  listTemplates,
  parseImportedTemplates,
  replaceAllTemplates,
  type SavedTemplate,
} from "./templateStorage";
import { canGenerateZip, countListItems } from "./validation";
import {
  createDefaultVariable,
  createFolderNode,
  isVariableToken,
  type FolderNode,
  type VariableKind,
  type VariableToken,
} from "./types";
import {
  addChildNode,
  collectUniqueVariables,
  findNode,
  findNodeIdByToken,
  nextIndexInTree,
  removeNode,
  removeTokenFromTree,
  rootHasList,
  updateNode,
  updateTokenInTree,
} from "./treeUtils";

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function clampTotalFromList(items: string): number {
  return Math.min(500, Math.max(0, countListItems(items)));
}

/** 展開木を JSZip に再帰的に追加 */
function addTreeToZip(
  zip: JSZip,
  trees: ExpandedFolder[],
  includeGitkeep: boolean,
  parentPath = "",
): void {
  for (const folder of trees) {
    const path = parentPath ? `${parentPath}/${folder.name}` : folder.name;
    zip.folder(path);
    if (includeGitkeep) {
      zip.file(`${path}/.gitkeep`, "");
    }
    if (folder.children.length > 0) {
      addTreeToZip(zip, folder.children, includeGitkeep, path);
    }
  }
}

export default function FolderGeneratorPage() {
  const { t } = useI18n();
  const copy = t.apps.folderGenerator;
  const dndId = useId();
  const [root, setRoot] = useState<FolderNode>(() =>
    createFolderNode(createId("root")),
  );
  const [activeNodeId, setActiveNodeId] = useState<string>("");
  const [totalCount, setTotalCount] = useState(5);
  const [includeGitkeep, setIncludeGitkeep] = useState(false);
  const [activeDrag, setActiveDrag] = useState<{
    kind: VariableKind;
    index?: number;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [templateRefreshToken, setTemplateRefreshToken] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const collisionDetection: CollisionDetection = (args) => {
    const pointerHits = pointerWithin(args);
    if (pointerHits.length > 0) return pointerHits;
    return closestCenter(args);
  };

  const variables = useMemo(() => collectUniqueVariables(root), [root]);

  // 初回のみアクティブ行をルートに合わせる
  const resolvedActiveId = activeNodeId && findNode(root, activeNodeId)
    ? activeNodeId
    : root.id;

  const preview = useMemo(() => {
    const tree = generateFolderTree(root, Math.min(totalCount, 5));
    return formatTreePreviewLines(tree, 10);
  }, [root, totalCount]);

  const canGenerate = useMemo(
    () => canGenerateZip(root, totalCount) && !isGenerating,
    [root, totalCount, isGenerating],
  );

  const hasRootList = useMemo(() => rootHasList(root), [root]);

  function ensureActiveNode(nextRoot: FolderNode, preferredId?: string) {
    const id = preferredId ?? activeNodeId;
    if (findNode(nextRoot, id)) {
      setActiveNodeId(id);
      return;
    }
    setActiveNodeId(nextRoot.id);
  }

  function addVariableToNode(nodeId: string, kind: VariableKind) {
    const index = nextIndexInTree(root, kind);
    const token = createDefaultVariable(kind, createId(kind), index);
    setRoot((prev) => {
      const next = updateNode(prev, nodeId, (node) => ({
        ...node,
        tokens: [
          ...node.tokens,
          createDefaultVariable(kind, token.id, nextIndexInTree(prev, kind)),
        ],
      }));
      return next;
    });
    setActiveNodeId(nodeId);
    // 親ルートのリストなら総数連動
    if (kind === "list" && nodeId === root.id) {
      setTotalCount(clampTotalFromList(token.list.items));
    }
  }

  function addVariable(kind: VariableKind) {
    const targetId = findNode(root, resolvedActiveId)
      ? resolvedActiveId
      : root.id;
    addVariableToNode(targetId, kind);
  }

  function addText(nodeId: string) {
    setRoot((prev) =>
      updateNode(prev, nodeId, (node) => ({
        ...node,
        tokens: [
          ...node.tokens,
          { id: createId("text"), type: "text", value: "_" },
        ],
      })),
    );
    setActiveNodeId(nodeId);
  }

  function addChild(parentId: string) {
    const child = createFolderNode(createId("node"));
    setRoot((prev) => addChildNode(prev, parentId, child));
    setActiveNodeId(child.id);
  }

  function handleRemoveNode(nodeId: string) {
    setRoot((prev) => {
      const next = removeNode(prev, nodeId);
      ensureActiveNode(next, prev.id);
      return next;
    });
  }

  function removeToken(tokenId: string) {
    setRoot((prev) => removeTokenFromTree(prev, tokenId));
  }

  function changeText(tokenId: string, value: string) {
    setRoot((prev) =>
      updateTokenInTree(prev, tokenId, (t) =>
        t.type === "text" ? { ...t, value } : t,
      ),
    );
  }

  function updateVariable(id: string, patch: Partial<VariableToken>) {
    const nodeIdBefore = findNodeIdByToken(root, id);
    setRoot((prev) =>
      updateTokenInTree(prev, id, (t) => {
        if (!isVariableToken(t)) return t;
        return {
          ...t,
          ...patch,
          date: patch.date ? { ...t.date, ...patch.date } : t.date,
          number: patch.number ? { ...t.number, ...patch.number } : t.number,
          list: patch.list ? { ...t.list, ...patch.list } : t.list,
        };
      }),
    );

    // 親ルート上のリスト変更時のみ、親フォルダ総数へ反映
    if (patch.list && nodeIdBefore === root.id) {
      setTotalCount(clampTotalFromList(patch.list.items));
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current;
    if (data?.from === "toolbox" && data.kind) {
      setActiveDrag({ kind: data.kind as VariableKind });
      return;
    }
    const tokenId = String(event.active.id);
    for (const v of variables) {
      if (v.id === tokenId) {
        setActiveDrag({ kind: v.type, index: v.index });
        return;
      }
    }
    setActiveDrag(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over) return;

    const data = active.data.current;
    const overId = String(over.id);

    // ツールボックス → 行へのドロップ
    if (data?.from === "toolbox" && data.kind) {
      const kind = data.kind as VariableKind;
      let targetNodeId: string | null = null;

      if (overId.startsWith("format-area-")) {
        targetNodeId = overId.replace("format-area-", "");
      } else {
        targetNodeId = findNodeIdByToken(root, overId);
      }

      if (!targetNodeId || !findNode(root, targetNodeId)) return;

      const dropOnArea = overId.startsWith("format-area-");
      const insertBeforeTokenId = dropOnArea ? null : overId;
      const index = nextIndexInTree(root, kind);
      const neu = createDefaultVariable(kind, createId(kind), index);

      setRoot((prev) => {
        const token = createDefaultVariable(
          kind,
          neu.id,
          nextIndexInTree(prev, kind),
        );
        return updateNode(prev, targetNodeId!, (node) => {
          if (!insertBeforeTokenId) {
            return { ...node, tokens: [...node.tokens, token] };
          }
          const idx = node.tokens.findIndex((t) => t.id === insertBeforeTokenId);
          if (idx === -1) return { ...node, tokens: [...node.tokens, token] };
          const next = [...node.tokens];
          next.splice(idx, 0, token);
          return { ...node, tokens: next };
        });
      });
      setActiveNodeId(targetNodeId);
      if (kind === "list" && targetNodeId === root.id) {
        setTotalCount(clampTotalFromList(neu.list.items));
      }
      return;
    }

    // 同一行内の並べ替え
    const fromNodeId = findNodeIdByToken(root, String(active.id));
    const toNodeId =
      overId.startsWith("format-area-")
        ? overId.replace("format-area-", "")
        : findNodeIdByToken(root, overId);

    if (!fromNodeId || !toNodeId || fromNodeId !== toNodeId) return;
    if (active.id === over.id) return;

    setRoot((prev) =>
      updateNode(prev, fromNodeId, (node) => {
        const oldIndex = node.tokens.findIndex((t) => t.id === active.id);
        const newIndex = node.tokens.findIndex((t) => t.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return node;
        return { ...node, tokens: arrayMove(node.tokens, oldIndex, newIndex) };
      }),
    );
  }

  function loadTemplate(template: SavedTemplate) {
    setRoot(structuredClone(template.root));
    setTotalCount(template.totalCount);
    setIncludeGitkeep(template.includeGitkeep);
    setActiveNodeId(template.root.id);
    setMessage(null);
    setError(null);
  }

  async function handleGenerate() {
    setMessage(null);
    setError(null);

    if (!canGenerateZip(root, totalCount)) {
      setError("入力内容を確認");
      return;
    }

    const tree = generateFolderTree(root, totalCount);
    const folderCount = countExpandedFolders(tree);
    if (folderCount === 0) {
      setError(
        "フォルダ名を生成できません",
      );
      return;
    }

    setIsGenerating(true);
    try {
      const zip = new JSZip();
      addTreeToZip(zip, tree, includeGitkeep);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "folders.zip";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      setMessage(`${folderCount} 件のフォルダを出力`);
    } catch {
      setError("ZIP出力に失敗");
    } finally {
      setIsGenerating(false);
    }
  }

  const generateButton = (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={!canGenerate}
      className="btn-primary"
      aria-disabled={!canGenerate}
    >
      {isGenerating ? copy.exporting : copy.exportZip}
    </button>
  );

  return (
    <AppShell
      title={copy.shell.title}
      description={copy.shell.description}
      dataManager={{
        appId: "folder-generator",
        fileNamePrefix: "folder-generator",
        getData: () => ({ templates: listTemplates() }),
        onImport: (raw) => {
          const templates = parseImportedTemplates(raw);
          if (templates === null) return false;
          replaceAllTemplates(templates);
          setTemplateRefreshToken((n) => n + 1);
        },
      }}
      actions={
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="btn-primary !px-3 !py-1.5 text-xs sm:text-sm"
          aria-disabled={!canGenerate}
        >
          {isGenerating ? copy.exporting : copy.exportZip}
        </button>
      }
    >
      <DndContext
        id={dndId}
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveDrag(null)}
      >
        <div className="grid gap-2 lg:grid-cols-[160px_1fr]">
          <div className="space-y-1.5">
            <Toolbox />
            <div className="space-y-1 px-0.5">
              <p className="text-[10px] text-zinc-400">
                {copy.addToRow}
              </p>
              <div className="flex flex-wrap gap-1">
                {(
                  [
                    ["date", "日付"],
                    ["number", "番号"],
                    ["list", "リスト"],
                  ] as const
                ).map(([kind, label]) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => addVariable(kind)}
                    className="btn-secondary !px-1.5 !py-0.5 text-[10px]"
                  >
                    ＋ {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <FormatBuilder
              root={root}
              activeNodeId={resolvedActiveId}
              onSelectNode={setActiveNodeId}
              onChangeText={changeText}
              onRemoveToken={removeToken}
              onAddText={addText}
              onAddChild={addChild}
              onRemoveNode={handleRemoveNode}
            />

            <section className="rounded-lg border border-zinc-200/60 bg-white px-2.5 py-2 shadow-sm">
              <h2 className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                {copy.preview}
              </h2>
              <PreviewTree
                lines={preview.lines}
                hiddenCount={preview.hiddenCount}
              />
            </section>
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeDrag ? (
            <DragOverlayBadge kind={activeDrag.kind} index={activeDrag.index} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="mt-2">
        <SettingsPanel
          variables={variables}
          totalCount={totalCount}
          totalCountLocked={hasRootList}
          includeGitkeep={includeGitkeep}
          onTotalCountChange={setTotalCount}
          onUpdateVariable={updateVariable}
          onIncludeGitkeepChange={setIncludeGitkeep}
          templateBar={
            <TemplateBar
              root={root}
              totalCount={totalCount}
              includeGitkeep={includeGitkeep}
              onLoad={loadTemplate}
              refreshToken={templateRefreshToken}
            />
          }
        />
      </div>

      <div className="mt-3 flex flex-col gap-1.5 sm:flex-row sm:items-center">
        {generateButton}
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="text-sm text-emerald-600" role="status">
            {message}
          </p>
        )}
        {!canGenerate && !isGenerating && (
          <p className="text-[11px] text-zinc-400">
            {copy.previewHint}
          </p>
        )}
      </div>
    </AppShell>
  );
}
