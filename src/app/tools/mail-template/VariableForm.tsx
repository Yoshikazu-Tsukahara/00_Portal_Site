"use client";

import { useMemo, useState } from "react";
import { fmt, useI18n } from "@/i18n";
import {
  getSuggestions,
  pushInputHistory,
  removeInputHistoryItem,
  type InputHistoryMap,
} from "./inputHistory";
import type { VariableMasterItem } from "./types";

/** 1変数の入力＋履歴サジェスト */
function VariableInputField({
  item,
  value,
  history,
  onChange,
  onCommitHistory,
  onRemoveHistoryItem,
}: {
  item: VariableMasterItem;
  value: string;
  history: InputHistoryMap;
  onChange: (value: string) => void;
  onCommitHistory: (key: string, value: string) => void;
  onRemoveHistoryItem: (key: string, value: string) => void;
}) {
  const { t } = useI18n();
  const mt = t.apps.mailTemplate;
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo(
    () => getSuggestions(history, item.key, value),
    [history, item.key, value],
  );

  const showSuggestions = focused && suggestions.length > 0;

  return (
    <div className="min-w-0 max-w-full">
      <label
        htmlFor={`var-${item.key}`}
        className="mb-1 flex min-w-0 items-baseline gap-1.5 text-[11px] text-zinc-500"
      >
        <span className="truncate font-medium text-zinc-600">{item.label}</span>
        <span className="shrink-0 font-mono text-[10px] text-zinc-300">
          {`{{${item.key}}}`}
        </span>
      </label>
      <input
        id={`var-${item.key}`}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          window.setTimeout(() => {
            setFocused(false);
            onCommitHistory(item.key, value);
          }, 120);
        }}
        placeholder={item.label}
        className="input-field min-h-11 w-full max-w-full !py-2 !text-sm md:min-h-0 md:!py-1.5"
        autoComplete="off"
      />
      {showSuggestions ? (
        <div className="mt-1.5 flex max-w-full flex-wrap gap-1">
          {suggestions.map((s) => (
            <span
              key={s}
              className="inline-flex max-w-full items-stretch overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 text-[10px] text-zinc-600"
            >
              <button
                type="button"
                title={s}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(s);
                  onCommitHistory(item.key, s);
                  setFocused(false);
                }}
                className="min-h-11 max-w-[12rem] truncate px-2.5 py-1 transition-colors hover:bg-white hover:text-zinc-900 active:bg-zinc-100 md:min-h-0 md:py-0.5"
              >
                {s}
              </button>
              <button
                type="button"
                title={mt.variables.removeHistory}
                aria-label={fmt(mt.variables.removeHistoryAria, { value: s })}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onRemoveHistoryItem(item.key, s);
                }}
                className="flex min-h-11 min-w-11 shrink-0 items-center justify-center border-l border-zinc-200 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-red-600 active:bg-red-50 active:text-red-600 md:min-h-0 md:min-w-0 md:px-1.5 md:py-0.5"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** 有効変数のみ・モバイルは1列、sm以上で2列グリッド入力（履歴サジェスト付き） */
export default function VariableForm({
  variables,
  values,
  history,
  onChange,
  onHistoryChange,
}: {
  variables: VariableMasterItem[];
  values: Record<string, string>;
  history: InputHistoryMap;
  onChange: (key: string, value: string) => void;
  onHistoryChange: (next: InputHistoryMap) => void;
}) {
  const { t } = useI18n();
  const mt = t.apps.mailTemplate;

  if (variables.length === 0) {
    return (
      <p className="break-words text-xs text-zinc-400">
        {mt.variables.empty}
      </p>
    );
  }

  function commitHistory(key: string, value: string) {
    onHistoryChange(pushInputHistory(history, key, value));
  }

  function removeHistoryItem(key: string, value: string) {
    onHistoryChange(removeInputHistoryItem(history, key, value));
  }

  return (
    <div className="w-full max-w-full space-y-2">
      <p className="text-[11px] font-medium text-zinc-500">
        {mt.variables.heading}
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {variables.map((item) => (
          <VariableInputField
            key={item.id}
            item={item}
            value={values[item.key] ?? ""}
            history={history}
            onChange={(v) => onChange(item.key, v)}
            onCommitHistory={commitHistory}
            onRemoveHistoryItem={removeHistoryItem}
          />
        ))}
      </div>
    </div>
  );
}
