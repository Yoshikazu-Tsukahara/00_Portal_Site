"use client";

import { useEffect, useId, useState } from "react";
import { useI18n } from "@/i18n";
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
  const { t } = useI18n();
  const mt = t.apps.mailTemplate;
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
      className="fixed inset-0 z-50 flex items-end justify-center overflow-x-hidden bg-zinc-950/40 p-2 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-lg border border-zinc-200 bg-white shadow-xl sm:max-h-[90vh] sm:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b border-zinc-200/70 px-3 py-3 sm:px-4">
          <h2
            id={titleId}
            className="min-w-0 break-words text-sm font-semibold text-zinc-900"
          >
            {mode === "create" ? mt.editor.createTitle : mt.editor.editTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-xs text-zinc-400 transition-colors hover:text-zinc-700 active:bg-zinc-100 active:text-zinc-800 sm:min-h-0 sm:min-w-0 sm:px-2 sm:py-1"
          >
            {mt.editor.close}
          </button>
        </div>

        <div className="space-y-4 overflow-x-hidden overflow-y-auto px-3 py-3 sm:px-4">
          <div className="min-w-0">
            <label
              htmlFor="tpl-title"
              className="mb-1 block text-[11px] font-medium text-zinc-500"
            >
              {mt.editor.fieldTitle}
            </label>
            <input
              id="tpl-title"
              className="input-field min-h-11 w-full max-w-full md:min-h-0"
              value={draft.title}
              onChange={(e) =>
                setDraft((d) => ({ ...d, title: e.target.value }))
              }
              placeholder={mt.editor.titlePlaceholder}
            />
          </div>
          <div className="min-w-0">
            <label
              htmlFor="tpl-subject"
              className="mb-1 block text-[11px] font-medium text-zinc-500"
            >
              {mt.editor.fieldSubject}
            </label>
            <input
              id="tpl-subject"
              className="input-field min-h-11 w-full max-w-full md:min-h-0"
              value={draft.subject}
              onChange={(e) =>
                setDraft((d) => ({ ...d, subject: e.target.value }))
              }
              placeholder={mt.editor.subjectPlaceholder}
            />
          </div>
          <div className="min-w-0">
            <label
              htmlFor="tpl-body"
              className="mb-1 block text-[11px] font-medium text-zinc-500"
            >
              {mt.editor.fieldBody}
              <span className="ml-1 font-normal text-zinc-400">
                {mt.editor.bodyHint}
              </span>
            </label>
            <textarea
              id="tpl-body"
              rows={8}
              className="input-field w-full max-w-full resize-y font-sans !leading-relaxed"
              value={draft.body}
              onChange={(e) =>
                setDraft((d) => ({ ...d, body: e.target.value }))
              }
              placeholder={mt.editor.bodyPlaceholder}
            />
          </div>

          {/* ラベル紐付け */}
          <div className="rounded-md border border-zinc-200/80 bg-zinc-50/50 p-2 sm:p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="min-w-0 break-words text-[11px] font-medium text-zinc-600">
                {mt.editor.labels}
                <span className="ml-1 font-normal text-zinc-400">
                  {mt.editor.labelsMulti}
                </span>
              </p>
              <span className="shrink-0 text-[10px] tabular-nums text-zinc-400">
                {draft.tagIds.length} / {tags.length}
              </span>
            </div>
            {tags.length === 0 ? (
              <p className="break-words text-[11px] text-zinc-400">
                {mt.editor.labelsEmpty}
              </p>
            ) : (
              <div className="flex max-w-full flex-wrap gap-1.5">
                {tags.map((tag) => {
                  const checked = tagSet.has(tag.id);
                  const style = getTagColorStyle(tag.color);
                  return (
                    <label
                      key={tag.id}
                      className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors active:scale-[0.98] md:min-h-0 md:px-2 md:py-1 ${
                        checked
                          ? style.filterActive
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 active:bg-zinc-50"
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
                      <span className="break-words">{tag.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* 変数選択 */}
          <div className="rounded-md border border-zinc-200/80 bg-zinc-50/50 p-2 sm:p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="min-w-0 break-words text-[11px] font-medium text-zinc-600">
                {mt.editor.variables}
                <span className="ml-1 font-normal text-zinc-400">
                  {mt.editor.variablesHint}
                </span>
              </p>
              <span className="shrink-0 text-[10px] tabular-nums text-zinc-400">
                {draft.enabledVariableIds.length} / {masterVariables.length}
              </span>
            </div>

            {masterVariables.length === 0 ? (
              <p className="break-words text-[11px] text-zinc-400">
                {mt.editor.variablesEmpty}
              </p>
            ) : (
              <div className="grid max-h-48 grid-cols-1 gap-1.5 overflow-y-auto sm:grid-cols-2">
                {masterVariables.map((item) => {
                  const checked = enabledSet.has(item.id);
                  return (
                    <label
                      key={item.id}
                      className={`flex min-h-11 cursor-pointer items-start gap-2 rounded-md border px-2.5 py-2 transition-colors active:scale-[0.99] md:min-h-0 ${
                        checked
                          ? "border-[var(--accent-strong)] bg-white active:bg-[color-mix(in_srgb,var(--accent)_18%,white)]"
                          : "border-zinc-200/80 bg-white/60 hover:border-zinc-300 active:bg-zinc-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          toggleVariable(item, e.target.checked)
                        }
                        className="mt-0.5 size-4 accent-zinc-900 md:size-3.5"
                      />
                      <span className="min-w-0">
                        <span className="block break-words text-xs font-medium text-zinc-800">
                          {item.label}
                        </span>
                        <span className="block break-all font-mono text-[10px] text-zinc-400">
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

        <div className="flex flex-col-reverse gap-2 border-t border-zinc-200/70 px-3 py-3 sm:flex-row sm:justify-end sm:px-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary min-h-11 w-full active:scale-[0.98] active:bg-zinc-100 sm:min-h-0 sm:w-auto"
          >
            {mt.editor.cancel}
          </button>
          <button
            type="button"
            disabled={!canSave}
            className="btn-primary min-h-11 w-full active:scale-[0.98] active:brightness-95 sm:min-h-0 sm:w-auto"
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
            {mt.editor.save}
          </button>
        </div>
      </div>
    </div>
  );
}
