"use client";

import { useI18n } from "@/i18n";
import AvatarPicker from "./AvatarPicker";
import { ACCENT_CLASSES } from "./styles";
import {
  ACCENTS,
  DETAIL_FIELD_KEYS,
  MAX_CARD_VISIBLE_FIELDS,
  type Character,
  type DetailFieldKey,
} from "./types";

/** 選択中キャラクターの詳細エディタ（キャンバス表示チェック連動） */
export default function DetailEditor({
  character,
  onChange,
}: {
  character: Character | null;
  onChange: (next: Character) => void;
}) {
  const { t } = useI18n();
  const copy = t.apps.characterRelation;

  if (!character) {
    return (
      <div className="flex h-full min-h-[28rem] items-center justify-center rounded-md border border-zinc-200/80 bg-white shadow-sm">
        <p className="max-w-xs px-4 text-center text-sm text-zinc-400">
          {copy.detail.selectPrompt}
        </p>
      </div>
    );
  }

  const fieldLabels: Record<DetailFieldKey, string> = {
    note: copy.detailFields.note,
    nickname: copy.detailFields.nickname,
    age: copy.detailFields.age,
    gender: copy.detailFields.gender,
    appearance: copy.detailFields.appearance,
    goal: copy.detailFields.goal,
    secret: copy.detailFields.secret,
    relationMemo: copy.detailFields.relationMemo,
    backstory: copy.detailFields.backstory,
  };

  function patch(partial: Partial<Character>) {
    onChange({ ...character!, ...partial });
  }

  function patchDetails(key: DetailFieldKey, value: string) {
    patch({
      details: { ...character!.details, [key]: value },
    });
  }

  function toggleCardVisible(key: DetailFieldKey) {
    const current = character!.cardVisibleKeys;
    const on = current.includes(key);
    if (on) {
      patch({ cardVisibleKeys: current.filter((k) => k !== key) });
      return;
    }
    if (current.length >= MAX_CARD_VISIBLE_FIELDS) {
      window.alert(
        copy.detail.maxVisibleAlert.replace(
          "{max}",
          String(MAX_CARD_VISIBLE_FIELDS),
        ),
      );
      return;
    }
    patch({ cardVisibleKeys: [...current, key] });
  }

  const longKeys: DetailFieldKey[] = [
    "appearance",
    "goal",
    "secret",
    "relationMemo",
    "backstory",
    "note",
  ];

  return (
    <div className="flex h-full min-h-[28rem] flex-col overflow-hidden rounded-md border border-zinc-200/80 bg-white shadow-sm">
      <div className="shrink-0 border-b border-zinc-100 px-4 py-3">
        <p className="text-[11px] font-medium text-zinc-500">
          {copy.tabs.detail}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-zinc-900">
          {character.name || copy.detail.unnamed}
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
          {copy.detail.hint}
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        {/* 基本：名前・アバター・アクセント */}
        <section className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-[11px] text-zinc-500">
              {copy.fields.name}
            </span>
            <input
              type="text"
              value={character.name}
              onChange={(e) => patch({ name: e.target.value })}
              className="input-field w-full"
            />
          </label>

          <div>
            <span className="mb-1.5 block text-[11px] text-zinc-500">
              {copy.fields.avatar}
            </span>
            <AvatarPicker
              value={{
                avatarDataUrl: character.avatarDataUrl,
                avatarPreset: character.avatarPreset,
              }}
              onChange={(avatar) => patch(avatar)}
            />
          </div>

          <div>
            <span className="mb-1.5 block text-[11px] text-zinc-500">
              {copy.fields.accent}
            </span>
            <div className="flex flex-wrap gap-2">
              {ACCENTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => patch({ accent: a })}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                    character.accent === a
                      ? "border-zinc-900 bg-zinc-50 text-zinc-900"
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
        </section>

        {/* 詳細フィールド＋キャンバス表示チェック */}
        <section className="space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[11px] font-medium text-zinc-600">
              {copy.detail.profileHeading}
            </p>
            <p className="text-[10px] text-zinc-400">
              {copy.detail.visibleCount
                .replace("{count}", String(character.cardVisibleKeys.length))
                .replace("{max}", String(MAX_CARD_VISIBLE_FIELDS))}
            </p>
          </div>

          {DETAIL_FIELD_KEYS.map((key) => {
            const checked = character.cardVisibleKeys.includes(key);
            const isLong = longKeys.includes(key);
            return (
              <div
                key={key}
                className="rounded-md border border-zinc-100 bg-zinc-50/40 px-3 py-2.5"
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-zinc-600">
                    {fieldLabels[key]}
                  </span>
                  <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-zinc-500">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCardVisible(key)}
                      className="size-3.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                    />
                    {copy.detail.showOnCard}
                  </label>
                </div>
                {isLong ? (
                  <textarea
                    value={character.details[key]}
                    onChange={(e) => patchDetails(key, e.target.value)}
                    rows={key === "backstory" ? 4 : 2}
                    className="input-field w-full resize-y bg-white"
                    placeholder={copy.detailPlaceholders[key]}
                  />
                ) : (
                  <input
                    type="text"
                    value={character.details[key]}
                    onChange={(e) => patchDetails(key, e.target.value)}
                    className="input-field w-full bg-white"
                    placeholder={copy.detailPlaceholders[key]}
                  />
                )}
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
