"use client";

import {
  useMemo,
  useState,
  type InputHTMLAttributes,
} from "react";
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

const labelClass = "mb-1.5 block text-xs font-medium text-zinc-600";

/** 右カラム：モードに応じたメタデータ入力（履歴は入力欄直下のドロップダウン） */
export default function MetadataForm({
  mode,
  fields,
  fileName,
  labels,
  history,
  disabled,
  onChange,
  onFileNameChange,
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
  onRemoveHistoryItem: (key: HistoryKey, value: string) => void;
}) {
  return (
    <section className="flex h-full min-h-0 flex-col">
      <header className="mb-3 shrink-0">
        <h2 className="text-sm font-semibold text-zinc-900">{labels.heading}</h2>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
          {labels.hint}
        </p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
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
            onRemoveHistoryItem={onRemoveHistoryItem}
          />
          <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
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
              onRemoveHistoryItem={onRemoveHistoryItem}
            />
          </>
        ) : (
          <HistoryField
            id="meta-comment"
            historyKey="comment"
            label={labels.comment}
            value={fields.comment}
            disabled={disabled}
            history={history}
            labels={labels}
            multiline
            onChange={(v) => onChange({ comment: v })}
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
  multiline,
  history,
  labels,
  onChange,
  onRemoveHistoryItem,
}: {
  id: string;
  historyKey: HistoryKey;
  label: string;
  value: string;
  disabled?: boolean;
  placeholder?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  multiline?: boolean;
  history: InputHistoryMap;
  labels: Pick<Labels, "removeHistory" | "removeHistoryAria">;
  onChange: (v: string) => void;
  onRemoveHistoryItem: (key: HistoryKey, value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const suggestions = useMemo(
    () => getSuggestions(history, historyKey, value, 8),
    [history, historyKey, value],
  );
  const show = open && !disabled && suggestions.length > 0;

  return (
    <div className="relative">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          rows={4}
          disabled={disabled}
          value={value}
          autoComplete="off"
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 150);
          }}
          className="input-field min-h-[6.5rem] w-full resize-y"
        />
      ) : (
        <input
          id={id}
          type="text"
          disabled={disabled}
          value={value}
          placeholder={placeholder}
          inputMode={inputMode}
          autoComplete="off"
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 150);
          }}
          className="input-field w-full"
        />
      )}

      {show ? (
        <ul
          className="absolute left-0 right-0 top-[calc(100%-0.15rem)] z-30 max-h-40 overflow-y-auto rounded-md border border-zinc-200 bg-white py-0.5 shadow-lg"
          role="listbox"
        >
          {suggestions.map((s) => (
            <li
              key={s}
              className="flex items-stretch border-b border-zinc-100 last:border-b-0"
            >
              <button
                type="button"
                title={s}
                className="min-w-0 flex-1 truncate px-2.5 py-1.5 text-left text-xs text-zinc-700 hover:bg-zinc-50"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(s);
                  setOpen(false);
                }}
              >
                {s}
              </button>
              <button
                type="button"
                title={labels.removeHistory}
                aria-label={labels.removeHistoryAria.replace("{value}", s)}
                className="shrink-0 px-2.5 text-sm leading-none text-zinc-400 hover:bg-zinc-50 hover:text-rose-600"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onRemoveHistoryItem(historyKey, s);
                }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
