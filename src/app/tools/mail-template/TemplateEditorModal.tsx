"use client";

import { useEffect, useId, useState } from "react";
import { getTagColorStyle } from "./tagColors";
import type { TagMasterItem, VariableMasterItem } from "./types";

export type Draft = {
  title: string;
  subject: string;
  body: string;
  enabledVariableIds: string[];
  tagIds: string[];
};

const EMPTY_DRAFT: Draft = {
  title: "",
  subject: "",
  body: "",
  enabledVariableIds: [],
  tagIds: [],
};

/** 新規・編集モーダル（変数選択＋ラベル紐付け） */
export default function TemplateEditorModal({
  open,
  mode,
  initial,
  masterVariables,
  tags,
  onClose,
  onSave,
}: {
  open: boolean;
  mode: "create" | "edit";
  initial: Draft | null;
  masterVariables: VariableMasterItem[];
  tags: TagMasterItem[];
  onClose: () => void;
  onSave: (draft: Draft) => void;
}) {
  const titleId = useId();
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  useEffect(() => {
    if (!open) return;
    setDraft(initial ?? EMPTY_DRAFT);
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const canSave =
    draft.title.trim().length > 0 &&
    (draft.subject.trim().length > 0 || draft.body.trim().length > 0);

  const enabledSet = new Set(draft.enabledVariableIds);
  const tagSet = new Set(draft.tagIds);

  function toggleVariable(item: VariableMasterItem, checked: boolean) {
    setDraft((d) => {
      const enabledVariableIds = checked
        ? Array.from(new Set([...d.enabledVariableIds, item.id]))
        : d.enabledVariableIds.filter((id) => id !== item.id);

      let body = d.body;
      const subject = d.subject;
      const token = `{{${item.key}}}`;

      if (checked) {
        const inText = subject.includes(token) || body.includes(token);
        if (!inText) {
          body = `${body.trimEnd()}\n${token}`;
        }
      }

      return { ...d, enabledVariableIds, subject, body };
    });
  }

  function toggleTag(tagId: string, checked: boolean) {
    setDraft((d) => ({
      ...d,
      tagIds: checked
        ? Array.from(new Set([...d.tagIds, tagId]))
        : d.tagIds.filter((id) => id !== tagId),
    }));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200/70 px-4 py-3">
          <h2 id={titleId} className="text-sm font-semibold text-zinc-900">
            {mode === "create" ? "新規テンプレート" : "テンプレート編集"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-zinc-400 transition-colors hover:text-zinc-700"
          >
            閉じる
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-4 py-3">
          <div>
            <label
              htmlFor="tpl-title"
              className="mb-1 block text-[11px] font-medium text-zinc-500"
            >
              タイトル
            </label>
            <input
              id="tpl-title"
              className="input-field w-full"
              value={draft.title}
              onChange={(e) =>
                setDraft((d) => ({ ...d, title: e.target.value }))
              }
              placeholder="例: お問い合わせへの初回返信"
            />
          </div>
          <div>
            <label
              htmlFor="tpl-subject"
              className="mb-1 block text-[11px] font-medium text-zinc-500"
            >
              件名
            </label>
            <input
              id="tpl-subject"
              className="input-field w-full"
              value={draft.subject}
              onChange={(e) =>
                setDraft((d) => ({ ...d, subject: e.target.value }))
              }
              placeholder="例: 【ご連絡】{{company}}様"
            />
          </div>
          <div>
            <label
              htmlFor="tpl-body"
              className="mb-1 block text-[11px] font-medium text-zinc-500"
            >
              本文
              <span className="ml-1 font-normal text-zinc-400">
                {"{{キー}} で差し込み"}
              </span>
            </label>
            <textarea
              id="tpl-body"
              rows={8}
              className="input-field w-full resize-y font-sans !leading-relaxed"
              value={draft.body}
              onChange={(e) =>
                setDraft((d) => ({ ...d, body: e.target.value }))
              }
              placeholder={"{{name}} 様\n\nお世話になっております。"}
            />
          </div>

          {/* ラベル紐付け */}
          <div className="rounded-md border border-zinc-200/80 bg-zinc-50/50 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium text-zinc-600">
                ラベル
                <span className="ml-1 font-normal text-zinc-400">
                  複数選択可
                </span>
              </p>
              <span className="text-[10px] tabular-nums text-zinc-400">
                {draft.tagIds.length} / {tags.length}
              </span>
            </div>
            {tags.length === 0 ? (
              <p className="text-[11px] text-zinc-400">
                ラベルが空です。先に「ラベル管理」で追加してください。
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => {
                  const checked = tagSet.has(tag.id);
                  const style = getTagColorStyle(tag.color);
                  return (
                    <label
                      key={tag.id}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors ${
                        checked
                          ? style.filterActive
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => toggleTag(tag.id, e.target.checked)}
                        className="sr-only"
                      />
                      <span
                        className={`size-1.5 rounded-full ${
                          checked ? "bg-white/90" : style.swatch
                        }`}
                        aria-hidden
                      />
                      {tag.name}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* 変数選択 */}
          <div className="rounded-md border border-zinc-200/80 bg-zinc-50/50 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium text-zinc-600">
                使用する変数
                <span className="ml-1 font-normal text-zinc-400">
                  マスタから選択
                </span>
              </p>
              <span className="text-[10px] tabular-nums text-zinc-400">
                {draft.enabledVariableIds.length} / {masterVariables.length}
              </span>
            </div>

            {masterVariables.length === 0 ? (
              <p className="text-[11px] text-zinc-400">
                変数マスタが空です。先にマスタへ追加してください。
              </p>
            ) : (
              <div className="grid max-h-48 grid-cols-1 gap-1.5 overflow-y-auto sm:grid-cols-2">
                {masterVariables.map((item) => {
                  const checked = enabledSet.has(item.id);
                  return (
                    <label
                      key={item.id}
                      className={`flex cursor-pointer items-start gap-2 rounded-md border px-2.5 py-2 transition-colors ${
                        checked
                          ? "border-zinc-900 bg-white"
                          : "border-zinc-200/80 bg-white/60 hover:border-zinc-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          toggleVariable(item, e.target.checked)
                        }
                        className="mt-0.5 size-3.5 accent-zinc-900"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-medium text-zinc-800">
                          {item.label}
                        </span>
                        <span className="block font-mono text-[10px] text-zinc-400">
                          {`{{${item.key}}}`}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-200/70 px-4 py-3">
          <button type="button" onClick={onClose} className="btn-secondary">
            キャンセル
          </button>
          <button
            type="button"
            disabled={!canSave}
            className="btn-primary"
            onClick={() => {
              if (!canSave) return;
              onSave({
                title: draft.title.trim(),
                subject: draft.subject.trim(),
                body: draft.body,
                enabledVariableIds: draft.enabledVariableIds,
                tagIds: draft.tagIds,
              });
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
