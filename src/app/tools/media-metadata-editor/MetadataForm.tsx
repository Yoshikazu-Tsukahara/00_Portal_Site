"use client";

import { useMemo, useState, type InputHTMLAttributes } from "react";
import {
  getSuggestions,
  type HistoryKey,
  type InputHistoryMap,
} from "./inputHistory";
import type { MediaMode, MetadataFields } from "./types";

type Labels = {
  fileName: string;
  fileNameHint: string;
  title: string;
  artist: string;
  year: string;
  album: string;
  track: string;
  comment: string;
  heading: string;
  hint: string;
  removeHistory: string;
  removeHistoryAria: string;
};

const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/40";

const labelClass = "mb-1.5 block text-xs font-medium tracking-wide text-zinc-400";

/** 右カラム：モードに応じたメタデータ入力（履歴サジェスト付き） */
export default function MetadataForm({
  mode,
  fields,
  fileName,
  labels,
  history,
  disabled,
  onChange,
  onFileNameChange,
  onCommitHistory,
  onRemoveHistoryItem,
}: {
  mode: MediaMode;
  fields: MetadataFields;
  fileName: string;
  labels: Labels;
  history: InputHistoryMap;
  disabled?: boolean;
  onChange: (patch: Partial<MetadataFields>) => void;
  onFileNameChange: (name: string) => void;
  onCommitHistory: (key: HistoryKey, value: string) => void;
  onRemoveHistoryItem: (key: HistoryKey, value: string) => void;
}) {
  return (
    <section className="flex h-full min-h-0 flex-col">
      <header className="mb-4 shrink-0">
        <h2 className="text-sm font-semibold text-zinc-100">{labels.heading}</h2>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
          {labels.hint}
        </p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
        <div>
          <HistoryField
            id="meta-filename"
            historyKey="fileName"
            label={labels.fileName}
            value={fileName}
            disabled={disabled}
            history={history}
            labels={labels}
            onChange={onFileNameChange}
            onCommitHistory={onCommitHistory}
            onRemoveHistoryItem={onRemoveHistoryItem}
          />
          <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-600">
            {labels.fileNameHint}
          </p>
        </div>
        <HistoryField
          id="meta-title"
          historyKey="title"
          label={labels.title}
          value={fields.title}
          disabled={disabled}
          history={history}
          labels={labels}
          onChange={(v) => onChange({ title: v })}
          onCommitHistory={onCommitHistory}
          onRemoveHistoryItem={onRemoveHistoryItem}
        />
        <HistoryField
          id="meta-artist"
          historyKey="artist"
          label={labels.artist}
          value={fields.artist}
          disabled={disabled}
          history={history}
          labels={labels}
          onChange={(v) => onChange({ artist: v })}
          onCommitHistory={onCommitHistory}
          onRemoveHistoryItem={onRemoveHistoryItem}
        />
        <HistoryField
          id="meta-year"
          historyKey="year"
          label={labels.year}
          value={fields.year}
          disabled={disabled}
          history={history}
          labels={labels}
          inputMode="numeric"
          placeholder="2026"
          onChange={(v) =>
            onChange({ year: v.replace(/[^\d]/g, "").slice(0, 4) })
          }
          onCommitHistory={onCommitHistory}
          onRemoveHistoryItem={onRemoveHistoryItem}
        />

        {mode === "audio" ? (
          <>
            <HistoryField
              id="meta-album"
              historyKey="album"
              label={labels.album}
              value={fields.album}
              disabled={disabled}
              history={history}
              labels={labels}
              onChange={(v) => onChange({ album: v })}
              onCommitHistory={onCommitHistory}
              onRemoveHistoryItem={onRemoveHistoryItem}
            />
            <HistoryField
              id="meta-track"
              historyKey="track"
              label={labels.track}
              value={fields.track}
              disabled={disabled}
              history={history}
              labels={labels}
              placeholder="1"
              onChange={(v) => onChange({ track: v })}
              onCommitHistory={onCommitHistory}
              onRemoveHistoryItem={onRemoveHistoryItem}
            />
          </>
        ) : (
          <HistoryTextarea
            id="meta-comment"
            historyKey="comment"
            label={labels.comment}
            value={fields.comment}
            disabled={disabled}
            history={history}
            labels={labels}
            onChange={(v) => onChange({ comment: v })}
            onCommitHistory={onCommitHistory}
            onRemoveHistoryItem={onRemoveHistoryItem}
          />
        )}
      </div>
    </section>
  );
}

function HistoryField({
  id,
  historyKey,
  label,
  value,
  disabled,
  placeholder,
  inputMode,
  history,
  labels,
  onChange,
  onCommitHistory,
  onRemoveHistoryItem,
}: {
  id: string;
  historyKey: HistoryKey;
  label: string;
  value: string;
  disabled?: boolean;
  placeholder?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  history: InputHistoryMap;
  labels: Pick<Labels, "removeHistory" | "removeHistoryAria">;
  onChange: (v: string) => void;
  onCommitHistory: (key: HistoryKey, value: string) => void;
  onRemoveHistoryItem: (key: HistoryKey, value: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const suggestions = useMemo(
    () => getSuggestions(history, historyKey, value),
    [history, historyKey, value],
  );
  const showSuggestions = focused && !disabled && suggestions.length > 0;

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        disabled={disabled}
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          window.setTimeout(() => {
            setFocused(false);
            onCommitHistory(historyKey, value);
          }, 120);
        }}
        className={inputClass}
      />
      {showSuggestions ? (
        <SuggestionChips
          suggestions={suggestions}
          labels={labels}
          onPick={(s) => {
            onChange(s);
            onCommitHistory(historyKey, s);
            setFocused(false);
          }}
          onRemove={(s) => onRemoveHistoryItem(historyKey, s)}
        />
      ) : null}
    </div>
  );
}

function HistoryTextarea({
  id,
  historyKey,
  label,
  value,
  disabled,
  history,
  labels,
  onChange,
  onCommitHistory,
  onRemoveHistoryItem,
}: {
  id: string;
  historyKey: HistoryKey;
  label: string;
  value: string;
  disabled?: boolean;
  history: InputHistoryMap;
  labels: Pick<Labels, "removeHistory" | "removeHistoryAria">;
  onChange: (v: string) => void;
  onCommitHistory: (key: HistoryKey, value: string) => void;
  onRemoveHistoryItem: (key: HistoryKey, value: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const suggestions = useMemo(
    () => getSuggestions(history, historyKey, value),
    [history, historyKey, value],
  );
  const showSuggestions = focused && !disabled && suggestions.length > 0;

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <textarea
        id={id}
        rows={5}
        disabled={disabled}
        value={value}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          window.setTimeout(() => {
            setFocused(false);
            onCommitHistory(historyKey, value);
          }, 120);
        }}
        className={`${inputClass} min-h-[7.5rem] resize-y`}
      />
      {showSuggestions ? (
        <SuggestionChips
          suggestions={suggestions}
          labels={labels}
          onPick={(s) => {
            onChange(s);
            onCommitHistory(historyKey, s);
            setFocused(false);
          }}
          onRemove={(s) => onRemoveHistoryItem(historyKey, s)}
        />
      ) : null}
    </div>
  );
}

function SuggestionChips({
  suggestions,
  labels,
  onPick,
  onRemove,
}: {
  suggestions: string[];
  labels: Pick<Labels, "removeHistory" | "removeHistoryAria">;
  onPick: (value: string) => void;
  onRemove: (value: string) => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {suggestions.map((s) => (
        <span
          key={s}
          className="inline-flex max-w-full items-center overflow-hidden rounded-md border border-zinc-700 bg-zinc-900 text-[11px] text-zinc-300"
        >
          <button
            type="button"
            title={s}
            onMouseDown={(e) => {
              e.preventDefault();
              onPick(s);
            }}
            className="max-w-[14rem] truncate px-2 py-1 transition-colors hover:bg-zinc-800 hover:text-zinc-50"
          >
            {s}
          </button>
          <button
            type="button"
            title={labels.removeHistory}
            aria-label={labels.removeHistoryAria.replace("{value}", s)}
            onMouseDown={(e) => {
              e.preventDefault();
              onRemove(s);
            }}
            className="shrink-0 border-l border-zinc-700 px-1.5 py-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-rose-400"
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}
