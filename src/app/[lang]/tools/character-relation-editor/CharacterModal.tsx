"use client";

import { useEffect, useId, useState } from "react";
import { useI18n } from "@/i18n";
import AvatarPicker from "./AvatarPicker";
import { ACCENT_CLASSES } from "./styles";
import { ACCENTS, type AvatarPresetId, type Character } from "./types";

type Draft = {
  name: string;
  avatarDataUrl: string;
  avatarPreset: AvatarPresetId | "";
  accent: Character["accent"];
  note: string;
};

/** キャラクター新規追加モーダル */
export default function CharacterModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (draft: Draft) => void;
}) {
  const { t } = useI18n();
  const copy = t.apps.characterRelation;
  const titleId = useId();
  const [draft, setDraft] = useState<Draft>({
    name: "",
    avatarDataUrl: "",
    avatarPreset: "other",
    accent: "zinc",
    note: "",
  });

  useEffect(() => {
    if (!open) return;
    setDraft({
      name: "",
      avatarDataUrl: "",
      avatarPreset: "other",
      accent: "zinc",
      note: "",
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-zinc-950/40 p-4 sm:items-center"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
          <h2
            id={titleId}
            className="text-sm font-semibold tracking-tight text-zinc-900"
          >
            {copy.modal.createTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700"
            aria-label={copy.close}
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 px-4 py-4">
          <label className="block">
            <span className="mb-1 block text-[11px] text-zinc-500">
              {copy.fields.name}
            </span>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              className="input-field w-full"
              placeholder={copy.fields.namePlaceholder}
              autoFocus
            />
          </label>

          <div>
            <span className="mb-1.5 block text-[11px] text-zinc-500">
              {copy.fields.avatar}
            </span>
            <AvatarPicker
              value={{
                avatarDataUrl: draft.avatarDataUrl,
                avatarPreset: draft.avatarPreset,
              }}
              onChange={(avatar) => setDraft((d) => ({ ...d, ...avatar }))}
            />
          </div>

          <label className="block">
            <span className="mb-1 block text-[11px] text-zinc-500">
              {copy.detailFields.note}
            </span>
            <input
              type="text"
              value={draft.note}
              onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
              className="input-field w-full"
              placeholder={copy.fields.notePlaceholder}
            />
          </label>

          <div>
            <span className="mb-1.5 block text-[11px] text-zinc-500">
              {copy.fields.accent}
            </span>
            <div className="flex flex-wrap gap-2">
              {ACCENTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, accent: a }))}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                    draft.accent === a
                      ? "border-[var(--accent-strong)] bg-[color-mix(in_srgb,var(--accent)_22%,white)] text-zinc-900"
                      : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                  }`}
                >
                  <span
                    className={`size-2 rounded-full ${ACCENT_CLASSES[a].dot}`}
                  />
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-100 px-4 py-3">
          <button type="button" onClick={onClose} className="btn-secondary">
            {copy.cancel}
          </button>
          <button
            type="button"
            disabled={!draft.name.trim()}
            onClick={() =>
              onSave({
                ...draft,
                name: draft.name.trim(),
              })
            }
            className="btn-primary"
          >
            {copy.save}
          </button>
        </div>
      </div>
    </div>
  );
}
