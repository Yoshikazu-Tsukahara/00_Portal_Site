"use client";

import type {
  CompressPreset,
  CompressSettings,
  OutputFormat,
} from "./imageUtils";

const PRESETS: {
  id: CompressPreset;
  label: string;
  hint: string;
  pill: string;
  activeText: string;
  activeHint: string;
}[] = [
  {
    id: "high",
    label: "オリジナル重視",
    hint: "品質90% · リサイズなし",
    pill: "bg-sky-600",
    activeText: "text-white",
    activeHint: "text-sky-100",
  },
  {
    id: "standard",
    label: "標準バランス",
    hint: "おすすめ · 品質70%",
    pill: "bg-emerald-600",
    activeText: "text-white",
    activeHint: "text-emerald-100",
  },
  {
    id: "light",
    label: "最高圧縮",
    hint: "ファイル最小化 · 品質40%",
    pill: "bg-amber-600",
    activeText: "text-white",
    activeHint: "text-amber-100",
  },
];

const FORMAT_OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: "original", label: "元形式を維持" },
  { value: "webp", label: "WebPに変換" },
  { value: "jpeg", label: "JPEGに変換" },
];

/** 3段階プリセット＋出力オプション */
export default function SettingsPanel({
  settings,
  onChange,
}: {
  settings: CompressSettings;
  onChange: (next: CompressSettings) => void;
}) {
  const activeIndex = Math.max(
    0,
    PRESETS.findIndex((p) => p.id === settings.preset),
  );
  const active = PRESETS[activeIndex] ?? PRESETS[1];

  return (
    <div className="space-y-2">
      <div className="rounded-2xl border border-zinc-200/70 bg-zinc-100/90 p-1">
        <div
          role="radiogroup"
          aria-label="圧縮プリセット"
          className="relative grid grid-cols-1 gap-1 sm:grid-cols-3 sm:gap-0"
        >
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-y-0 left-0 hidden rounded-xl shadow-sm transition-all duration-300 ease-out sm:block ${active.pill}`}
            style={{
              width: `calc(100% / ${PRESETS.length})`,
              transform: `translateX(${activeIndex * 100}%)`,
            }}
          />

          {PRESETS.map((preset) => {
            const selected = settings.preset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange({ ...settings, preset: preset.id })}
                className={`relative z-10 rounded-xl px-3 py-2.5 text-center transition-colors duration-300 ${
                  selected
                    ? `${preset.pill} ${preset.activeText} sm:bg-transparent`
                    : "bg-transparent text-zinc-600 hover:bg-white/60 hover:text-zinc-900 sm:hover:bg-transparent"
                }`}
              >
                <span className="block text-xs font-medium leading-tight">
                  {preset.label}
                </span>
                <span
                  className={`mt-0.5 block text-[10px] leading-tight transition-colors duration-300 ${
                    selected ? preset.activeHint : "text-zinc-400"
                  }`}
                >
                  {preset.hint}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-zinc-200/70 bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-700">
          <input
            type="checkbox"
            checked={settings.sequentialNames}
            onChange={(e) =>
              onChange({ ...settings, sequentialNames: e.target.checked })
            }
            className="size-3.5 rounded border-zinc-300 text-zinc-900 accent-zinc-900"
          />
          <span>
            ファイル名を連番にする
            <span className="ml-1 text-zinc-400">photo_1, photo_2…</span>
          </span>
        </label>

        <div className="flex items-center gap-2">
          <label
            htmlFor="output-format"
            className="shrink-0 text-[11px] font-medium text-zinc-500"
          >
            保存形式
          </label>
          <select
            id="output-format"
            value={settings.outputFormat}
            onChange={(e) =>
              onChange({
                ...settings,
                outputFormat: e.target.value as OutputFormat,
              })
            }
            className="input-field !w-auto !min-w-[10.5rem] !py-1.5 !text-xs"
          >
            {FORMAT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
