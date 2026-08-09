"use client";

import { useRef } from "react";
import { useI18n } from "@/i18n";
import AvatarBubble from "./AvatarBubble";
import {
  AVATAR_PRESETS,
  PresetAvatarIcon,
  type AvatarPresetId,
} from "./DefaultAvatars";
import { fileToAvatarDataUrl } from "./types";

type AvatarValue = {
  avatarDataUrl: string;
  avatarPreset: AvatarPresetId | "";
};

/** デフォルトアイコン選択 + 画像アップロード */
export default function AvatarPicker({
  value,
  onChange,
}: {
  value: AvatarValue;
  onChange: (next: AvatarValue) => void;
}) {
  const { t } = useI18n();
  const copy = t.apps.characterRelation;
  const fileRef = useRef<HTMLInputElement>(null);

  const labels: Record<AvatarPresetId, string> = {
    man: copy.avatarPresets.man,
    woman: copy.avatarPresets.woman,
    boy: copy.avatarPresets.boy,
    girl: copy.avatarPresets.girl,
    org: copy.avatarPresets.org,
    company: copy.avatarPresets.company,
    other: copy.avatarPresets.other,
  };

  async function handleAvatar(file: File | null) {
    if (!file) return;
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      onChange({ avatarDataUrl: dataUrl, avatarPreset: "" });
    } catch {
      window.alert(copy.detail.avatarError);
    }
  }

  function selectPreset(id: AvatarPresetId) {
    onChange({ avatarDataUrl: "", avatarPreset: id });
  }

  const hasCustom = !!value.avatarDataUrl;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <AvatarBubble
          src={value.avatarDataUrl}
          preset={value.avatarPreset}
          size="lg"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="btn-secondary !px-3 !py-1.5 text-xs"
          >
            {copy.fields.avatarUpload}
          </button>
          {hasCustom || value.avatarPreset ? (
            <button
              type="button"
              onClick={() => onChange({ avatarDataUrl: "", avatarPreset: "" })}
              className="btn-secondary !px-3 !py-1.5 text-xs"
            >
              {copy.fields.avatarClear}
            </button>
          ) : null}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            void handleAvatar(e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
        />
      </div>

      <div>
        <p className="mb-1.5 text-[11px] text-zinc-500">
          {copy.fields.avatarPresets}
        </p>
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
          {AVATAR_PRESETS.map((id) => {
            const active = !hasCustom && value.avatarPreset === id;
            return (
              <button
                key={id}
                type="button"
                title={labels[id]}
                onClick={() => selectPreset(id)}
                className={`flex flex-col items-center gap-1 rounded-md border px-1 py-1.5 transition-colors ${
                  active
                    ? "border-[var(--accent-strong)] bg-[color-mix(in_srgb,var(--accent)_22%,white)] text-zinc-900"
                    : "border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50/80"
                }`}
              >
                <span className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-zinc-100 p-1.5">
                  <PresetAvatarIcon id={id} />
                </span>
                <span className="max-w-full truncate text-[9px] leading-tight">
                  {labels[id]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-zinc-400">{copy.fields.avatarHint}</p>
    </div>
  );
}
