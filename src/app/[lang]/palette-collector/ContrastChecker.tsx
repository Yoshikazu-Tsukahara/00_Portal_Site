"use client";

import { Check, X } from "lucide-react";
import { useMemo } from "react";
import type { PaletteCollectorDict } from "@/i18n/apps/paletteCollector";
import { judgeContrast, normalizeHex } from "./colorMath";
import type { PaletteColorEntry } from "./types";

/** 文字色のクイック選択（パレット外） */
const TEXT_PRESET_HEX = ["#000000", "#ffffff", "#374151", "#f9fafb"] as const;

function Badge({
  label,
  pass,
  passLabel,
  failLabel,
}: {
  label: string;
  pass: boolean;
  passLabel: string;
  failLabel: string;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-1 rounded-lg px-2 py-1.5 ${
        pass
          ? "bg-emerald-50 text-emerald-700"
          : "bg-rose-50 text-rose-600"
      }`}
    >
      <span className="font-medium">{label}</span>
      <span className="inline-flex items-center gap-0.5 font-semibold">
        {pass ? (
          <Check className="size-3" aria-hidden />
        ) : (
          <X className="size-3" aria-hidden />
        )}
        {pass ? passLabel : failLabel}
      </span>
    </div>
  );
}

export default function ContrastChecker({
  colors,
  textHex,
  bgId,
  onChangeTextHex,
  onChangeBg,
  copy,
}: {
  colors: PaletteColorEntry[];
  textHex: string;
  bgId: string | null;
  onChangeTextHex: (hex: string) => void;
  onChangeBg: (id: string) => void;
  copy: PaletteCollectorDict["contrast"];
}) {
  const normalizedText = normalizeHex(textHex) ?? "#000000";

  const presetLabels: Record<(typeof TEXT_PRESET_HEX)[number], string> =
    useMemo(
      () => ({
        "#000000": copy.textPresetBlack,
        "#ffffff": copy.textPresetWhite,
        "#374151": copy.textPresetGray,
        "#f9fafb": copy.textPresetOffWhite,
      }),
      [copy],
    );

  const bgEntry =
    colors.find((c) => c.id === bgId) ?? colors[0] ?? null;

  const judgement =
    bgEntry && normalizedText
      ? judgeContrast(normalizedText, bgEntry.hex)
      : null;

  const isPresetText = TEXT_PRESET_HEX.some(
    (h) => normalizeHex(h) === normalizedText,
  );

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm sm:p-4">
      <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
        {copy.heading}
      </h2>
      <p className="mt-0.5 text-[11px] text-gray-500 sm:text-xs">
        {copy.description}
      </p>

      {colors.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-gray-200 py-6 text-center text-xs text-gray-400">
          {copy.needPaletteColor}
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-4">
          <div className="min-w-0">
            <p className="mb-1.5 text-[10px] font-medium text-gray-500">
              {copy.textColorLabel}
            </p>
              <div className="flex flex-wrap items-center gap-2.5">
                {TEXT_PRESET_HEX.map((hex) => {
                  const active = normalizeHex(hex) === normalizedText;
                  return (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => onChangeTextHex(hex)}
                      title={presetLabels[hex]}
                      aria-pressed={active}
                      className={`relative z-0 flex h-8 min-w-[2.75rem] items-center justify-center rounded-full px-2 text-[10px] font-semibold outline outline-2 outline-offset-2 transition-transform hover:scale-105 ${
                        active
                          ? "z-[1] outline-gray-900"
                          : "outline-transparent"
                      }`}
                      style={{
                        backgroundColor: hex,
                        color: hex === "#ffffff" || hex === "#f9fafb" ? "#111" : "#fff",
                      }}
                    >
                      {presetLabels[hex]}
                    </button>
                  );
                })}
                <label
                  className={`relative z-0 ml-0.5 flex size-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full outline outline-2 outline-offset-2 transition-transform hover:scale-105 ${
                    !isPresetText
                      ? "z-[1] outline-gray-900"
                      : "outline-gray-300"
                  }`}
                  title={copy.textCustomLabel}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{ backgroundColor: normalizedText }}
                  />
                  <span className="pointer-events-none relative z-[1] text-[9px] font-bold text-white mix-blend-difference">
                    #
                  </span>
                  <input
                    type="color"
                    value={normalizedText}
                    onChange={(e) => onChangeTextHex(e.target.value)}
                    aria-label={copy.textCustomLabel}
                    className="absolute inset-0 size-full cursor-pointer opacity-0"
                  />
                </label>
              </div>
              <p className="mt-1 font-mono text-[10px] text-gray-400">
                {normalizedText.toUpperCase()}
              </p>
          </div>

          <div className="min-w-0">
            <p className="mb-1.5 text-[10px] font-medium text-gray-500">
              {copy.bgColorLabel}
            </p>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(1.75rem,1fr))] gap-1.5">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onChangeBg(c.id)}
                    title={c.hex}
                    aria-pressed={bgEntry?.id === c.id}
                    className={`aspect-square w-full max-w-8 justify-self-start rounded-full ring-2 ring-offset-2 ring-offset-white transition-transform hover:scale-110 ${
                      bgEntry?.id === c.id ? "ring-gray-900" : "ring-transparent"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
          </div>

          {bgEntry && judgement ? (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <div
                className="flex h-16 items-center justify-center rounded-lg text-lg font-bold"
                style={{
                  backgroundColor: bgEntry.hex,
                  color: normalizedText,
                }}
              >
                {copy.previewSample}
              </div>
              <p className="mt-2.5 text-center text-xl font-bold tabular-nums text-gray-900">
                {judgement.ratio.toFixed(2)}
                <span className="ml-1 text-xs font-medium text-gray-400">
                  : 1
                </span>
              </p>
              <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
                <Badge
                  label={copy.aaNormal}
                  pass={judgement.aaNormal}
                  passLabel={copy.pass}
                  failLabel={copy.fail}
                />
                <Badge
                  label={copy.aaLarge}
                  pass={judgement.aaLarge}
                  passLabel={copy.pass}
                  failLabel={copy.fail}
                />
                <Badge
                  label={copy.aaaNormal}
                  pass={judgement.aaaNormal}
                  passLabel={copy.pass}
                  failLabel={copy.fail}
                />
                <Badge
                  label={copy.aaaLarge}
                  pass={judgement.aaaLarge}
                  passLabel={copy.pass}
                  failLabel={copy.fail}
                />
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
