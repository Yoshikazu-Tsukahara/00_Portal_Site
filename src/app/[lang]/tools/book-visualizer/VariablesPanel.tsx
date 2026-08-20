"use client";

import { Plus, Replace, Trash2 } from "lucide-react";

import { useI18n } from "@/i18n";
import type { BookVariable } from "./types";
import {
  createBookVariable,
  nextVariableId,
  sanitizeVariableId,
  variableToken,
} from "./variables";

type VariablesPanelProps = {
  variables: BookVariable[];
  onChange: (variables: BookVariable[]) => void;
};

/**
 * 名前変換変数の編集。
 * 本文には {{id}} を書き、閲覧時に読者入力で置換する。
 */
export default function VariablesPanel({
  variables,
  onChange,
}: VariablesPanelProps) {
  const { t } = useI18n();
  const copy = t.apps.bookVisualizer.edit.variables;

  function patchVariable(id: string, patch: Partial<BookVariable>) {
    onChange(
      variables.map((item) => {
        if (item.id !== id) return item;
        if (patch.id !== undefined) {
          const nextId = sanitizeVariableId(patch.id);
          if (!nextId || variables.some((other) => other.id === nextId && other.id !== id)) {
            return { ...item, ...patch, id: item.id };
          }
          return { ...item, ...patch, id: nextId };
        }
        return { ...item, ...patch };
      }),
    );
  }

  function addVariable() {
    onChange([...variables, createBookVariable(undefined, variables)]);
  }

  function removeVariable(id: string) {
    if (!window.confirm(copy.confirmRemove)) return;
    onChange(variables.filter((item) => item.id !== id));
  }

  return (
    <div className="flex h-0 min-h-0 flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto overscroll-contain p-3 sm:p-4">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <h2 className="flex items-center gap-1.5 text-xs font-semibold tracking-tight text-zinc-100">
          <Replace className="size-4 text-zinc-400" aria-hidden />
          {copy.heading}
        </h2>
        <button
          type="button"
          onClick={addVariable}
          className="bv-ui-btn bv-ui-btn--sm ml-auto"
        >
          <Plus className="size-4" aria-hidden />
          {copy.add}
        </button>
      </div>
      <p className="bv-ui-hint">{copy.lead}</p>
      <p className="rounded-lg border border-zinc-700/80 bg-zinc-900/50 px-2.5 py-2 text-[11px] leading-relaxed text-zinc-400">
        {copy.tokenHint}
      </p>

      {variables.length === 0 ? (
        <p className="bv-ui-empty">{copy.empty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {variables.map((variable) => (
            <li key={variable.id} className="bv-ui-card space-y-2">
              <div className="flex min-w-0 items-center gap-1.5">
                <code className="min-w-0 flex-1 truncate rounded bg-zinc-950/80 px-2 py-1 font-mono text-[11px] text-emerald-300/90">
                  {variableToken(variable.id)}
                </code>
                <button
                  type="button"
                  onClick={() => removeVariable(variable.id)}
                  title={copy.remove}
                  aria-label={copy.remove}
                  className="bv-ui-icon-btn bv-ui-icon-btn--sm"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
              <label className="flex min-w-0 flex-col gap-1">
                <span className="bv-ui-label">{copy.idLabel}</span>
                <input
                  type="text"
                  value={variable.id}
                  onChange={(event) =>
                    patchVariable(variable.id, { id: event.target.value })
                  }
                  placeholder={nextVariableId(variables)}
                  spellCheck={false}
                  className="bv-ui-field font-mono text-[12px]"
                />
              </label>
              <label className="flex min-w-0 flex-col gap-1">
                <span className="bv-ui-label">{copy.labelLabel}</span>
                <input
                  type="text"
                  value={variable.label}
                  onChange={(event) =>
                    patchVariable(variable.id, { label: event.target.value })
                  }
                  placeholder={copy.labelPlaceholder}
                  className="bv-ui-field"
                />
              </label>
              <label className="flex min-w-0 flex-col gap-1">
                <span className="bv-ui-label">{copy.defaultLabel}</span>
                <input
                  type="text"
                  value={variable.defaultValue}
                  onChange={(event) =>
                    patchVariable(variable.id, {
                      defaultValue: event.target.value,
                    })
                  }
                  placeholder={copy.defaultPlaceholder}
                  className="bv-ui-field"
                />
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
