"use client";

import { useEffect, useState } from "react";
import {
  listTemplates,
  saveTemplate,
  type SavedTemplate,
} from "./templateStorage";
import type { FolderNode } from "./types";

/** マイテンプレート：保存・呼び出し（コンパクト） */
export default function TemplateBar({
  root,
  totalCount,
  includeGitkeep,
  onLoad,
  /** 外部からのバックアップ復元時などに一覧を再読込 */
  refreshToken = 0,
}: {
  root: FolderNode;
  totalCount: number;
  includeGitkeep: boolean;
  onLoad: (template: SavedTemplate) => void;
  refreshToken?: number;
}) {
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setTemplates(listTemplates());
  }, [refreshToken]);

  function refresh() {
    setTemplates(listTemplates());
  }

  function handleSave() {
    setStatus(null);
    try {
      saveTemplate(name, { root, totalCount, includeGitkeep });
      refresh();
      setStatus("保存済");
      setTimeout(() => setStatus(null), 2000);
    } catch {
      setStatus("名前未入力");
    }
  }

  function handleLoad() {
    if (!selectedId) return;
    const t = templates.find((x) => x.id === selectedId);
    if (!t) return;
    onLoad(t);
    setStatus("読込済");
    setTimeout(() => setStatus(null), 2000);
  }

  return (
    <div className="mb-2 flex flex-wrap items-center gap-1.5 border-b border-zinc-100 pb-2">
      <select
        id="template-select"
        className="input-field max-w-[9rem] flex-1 !py-1 text-xs"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
      >
        <option value="">テンプレート</option>
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleLoad}
        disabled={!selectedId}
        className="btn-secondary !px-2 !py-1 text-[10px] disabled:opacity-40"
      >
        読込
      </button>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="名前"
        className="input-field w-24 !py-1 text-xs"
        aria-label="テンプレート名"
      />
      <button
        type="button"
        onClick={handleSave}
        className="btn-secondary !px-2 !py-1 text-[10px]"
      >
        保存
      </button>
      {status ? (
        <span className="text-[10px] text-zinc-400">{status}</span>
      ) : null}
    </div>
  );
}
