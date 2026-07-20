"use client";

import { useI18n } from "@/i18n";
import type { FieldPreset, MetadataFields } from "./types";

/** お気に入りプリセットの適用・保存 UI */
export default function PresetBar({
  presets,
  currentFields,
  onApply,
  onSave,
  onDelete,
}: {
  presets: FieldPreset[];
  currentFields: MetadataFields | null;
  onApply: (preset: FieldPreset) => void;
  onSave: (name: string) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useI18n();
  const copy = t.apps.mediaMetadata;

  return (
    <section className="rounded-md border border-zinc-200/80 bg-white px-3 py-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-medium text-zinc-600">
          {copy.presetsHeading}
        </p>
        <button
          type="button"
          disabled={!currentFields}
          onClick={() => {
            const name = window.prompt(copy.presetNamePrompt);
            if (name?.trim()) onSave(name.trim());
          }}
          className="text-[11px] font-medium text-zinc-600 transition-colors hover:text-zinc-900 disabled:opacity-40"
        >
          {copy.savePreset}
        </button>
      </div>
      {presets.length === 0 ? (
        <p className="text-[11px] text-zinc-400">{copy.presetsEmpty}</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <li
              key={p.id}
              className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 pl-2.5 pr-1 py-0.5"
            >
              <button
                type="button"
                onClick={() => onApply(p)}
                className="text-[11px] font-medium text-zinc-700 hover:text-zinc-950"
              >
                {p.name}
              </button>
              <button
                type="button"
                onClick={() => onDelete(p.id)}
                className="rounded-full px-1.5 text-[10px] text-zinc-400 hover:bg-white hover:text-zinc-700"
                aria-label={copy.deletePreset}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
