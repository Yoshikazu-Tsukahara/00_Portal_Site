"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import AppShell from "@/components/AppShell";
import { fmt, useI18n } from "@/i18n";
import { useCompactLayout } from "@/lib/useCompactLayout";
import {
  cleanText,
  computeDiffChunks,
  summarizeDiff,
} from "./cleanText";
import DiffView from "./DiffView";
import { BUILTIN_PACKS, rulesFromBuiltinPack } from "./presets";
import {
  loadTextCleanerData,
  parseImportedData,
  saveTextCleanerData,
} from "./storage";
import {
  createEmptyRule,
  createPreset,
  type CleanOptions,
  type LineBreakMode,
  type ReplacePreset,
  type ReplaceRule,
  type WhitespaceMode,
} from "./types";

type PreviewTab = "result" | "diff";

export default function TextCleanerPage() {
  const { t } = useI18n();
  const copy = t.apps.textCleaner;
  const { showSideColumn } = useCompactLayout();
  const [input, setInput] = useState("");
  const [options, setOptions] = useState<CleanOptions | null>(null);
  const [rules, setRules] = useState<ReplaceRule[]>([]);
  const [presets, setPresets] = useState<ReplacePreset[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewTab, setPreviewTab] = useState<PreviewTab>("result");
  const [presetNameDraft, setPresetNameDraft] = useState("");

  useEffect(() => {
    const data = loadTextCleanerData();
    setOptions(data.options);
    setRules(data.rules);
    setPresets(data.presets);
    setActivePresetId(data.activePresetId);
    setHydrated(true);
  }, []);

  const persist = useCallback(
    (next: {
      options: CleanOptions;
      rules: ReplaceRule[];
      presets: ReplacePreset[];
      activePresetId: string | null;
    }) => {
      setOptions(next.options);
      setRules(next.rules);
      setPresets(next.presets);
      setActivePresetId(next.activePresetId);
      saveTextCleanerData(next);
    },
    [],
  );

  const updateOptions = useCallback(
    (patch: Partial<CleanOptions>) => {
      if (!options) return;
      persist({
        options: { ...options, ...patch },
        rules,
        presets,
        activePresetId,
      });
    },
    [options, rules, presets, activePresetId, persist],
  );

  /** ルール変更時、アクティブプリセットにも同期 */
  const updateRules = useCallback(
    (nextRules: ReplaceRule[]) => {
      if (!options) return;
      const nextPresets = activePresetId
        ? presets.map((p) =>
            p.id === activePresetId ? { ...p, rules: nextRules } : p,
          )
        : presets;
      persist({
        options,
        rules: nextRules,
        presets: nextPresets,
        activePresetId,
      });
    },
    [options, presets, activePresetId, persist],
  );

  const cleaned = useMemo(() => {
    if (!options) return "";
    return cleanText(input, options, rules);
  }, [input, options, rules]);

  const stats = useMemo(() => summarizeDiff(input, cleaned), [input, cleaned]);

  const diffChunks = useMemo(() => {
    if (previewTab !== "diff" || !input) return [];
    return computeDiffChunks(input, cleaned);
  }, [input, cleaned, previewTab]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(cleaned);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.alert("コピーに失敗しました。ブラウザの権限を確認してください。");
    }
  }

  function addRule() {
    updateRules([...rules, createEmptyRule()]);
  }

  function patchRule(id: string, patch: Partial<ReplaceRule>) {
    updateRules(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function removeRule(id: string) {
    if (!window.confirm(copy.confirm.deleteRule)) return;
    updateRules(rules.filter((r) => r.id !== id));
  }

  function applyBuiltinPack(packId: string, mode: "replace" | "append") {
    const pack = BUILTIN_PACKS.find((p) => p.id === packId);
    if (!pack || !options) return;
    const incoming = rulesFromBuiltinPack(pack);
    const nextRules =
      mode === "replace" ? incoming : [...rules, ...incoming];
    updateRules(nextRules);
  }

  function switchPreset(id: string) {
    if (!options) return;
    const preset = presets.find((p) => p.id === id);
    if (!preset) return;
    persist({
      options,
      rules: preset.rules.map((r) => ({ ...r })),
      presets,
      activePresetId: id,
    });
  }

  function saveCurrentAsPreset() {
    if (!options) return;
    const name = presetNameDraft.trim();
    if (!name) {
      window.alert("セット名を入力してください。");
      return;
    }
    const neu = createPreset(name, rules);
    persist({
      options,
      rules: neu.rules,
      presets: [...presets, neu],
      activePresetId: neu.id,
    });
    setPresetNameDraft("");
  }

  function renameActivePreset(name: string) {
    if (!options || !activePresetId) return;
    const nextPresets = presets.map((p) =>
      p.id === activePresetId ? { ...p, name: name.trim() || p.name } : p,
    );
    persist({ options, rules, presets: nextPresets, activePresetId });
  }

  function deleteActivePreset() {
    if (!options || !activePresetId) return;
    if (!window.confirm(copy.confirm.deleteSet)) return;
    const nextPresets = presets.filter((p) => p.id !== activePresetId);
    persist({
      options,
      rules,
      presets: nextPresets,
      activePresetId: null,
    });
  }

  function clearActivePresetLink() {
    if (!options) return;
    persist({ options, rules, presets, activePresetId: null });
  }

  if (!hydrated || !options) {
    return (
      <AppShell
        title={copy.shell.title}
        description={copy.loading}
        fillViewport
      >
        <p className="text-sm text-zinc-400">{copy.loading}</p>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={copy.shell.title}
      description={copy.shell.description}
      fillViewport
      dataManager={{
        appId: "text-cleaner",
        fileNamePrefix: "text-cleaner",
        getData: () => ({ options, rules, presets, activePresetId }),
        onImport: (raw) => {
          const next = parseImportedData(raw);
          if (!next) return false;
          saveTextCleanerData(next);
          setOptions(next.options);
          setRules(next.rules);
          setPresets(next.presets);
          setActivePresetId(next.activePresetId);
        },
      }}
    >
      <div
        className={`grid min-h-0 flex-1 gap-3 ${
          showSideColumn
            ? "grid-cols-2 gap-4 overflow-hidden"
            : "grid-cols-1"
        }`}
      >
        {/* 入力＋設定（スマホ／縦型は1列で上に） */}
        <section className="flex min-h-0 flex-col gap-3 overflow-y-auto overscroll-auto rounded-lg border border-zinc-200/80 bg-white p-3 sm:p-4">
          <div className="shrink-0">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label
                htmlFor="text-cleaner-input"
                className="text-[11px] font-medium text-zinc-500"
              >
                {copy.input.heading}
              </label>
              {input ? (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(copy.confirm.clearInput)) setInput("");
                  }}
                  className="text-[10px] text-zinc-400 transition-colors hover:text-zinc-700"
                >
                  {copy.input.clear}
                </button>
              ) : null}
            </div>
            <textarea
              id="text-cleaner-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={copy.input.placeholder}
              className="input-field min-h-[9rem] w-full resize-y font-mono text-[13px] leading-relaxed lg:min-h-[11rem]"
              spellCheck={false}
            />
          </div>

          {/* 特殊クレンジング */}
          <fieldset className="shrink-0 space-y-2 border-t border-zinc-100 pt-3">
            <legend className="text-[11px] font-medium text-zinc-500">
              {copy.special.heading}
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ["stripHtml", copy.special.stripHtml, options.stripHtml],
                  ["stripUrls", copy.special.stripUrls, options.stripUrls],
                  [
                    "tidyEmailsAndSymbols",
                    copy.special.tidyMail,
                    options.tidyEmailsAndSymbols,
                  ],
                ] as const
              ).map(([key, label, on]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateOptions({ [key]: !on })}
                  aria-pressed={on}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all duration-200 ${
                    on
                      ? "border-[var(--accent-strong)] bg-[var(--accent)] text-zinc-900 shadow-none"
                      : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 hover:bg-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="shrink-0 space-y-2.5 border-t border-zinc-100 pt-3">
            <legend className="text-[11px] font-medium text-zinc-500">
              {copy.settings.heading}
            </legend>

            <label className="flex cursor-pointer items-start gap-2.5 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={options.stripControlChars}
                onChange={(e) =>
                  updateOptions({ stripControlChars: e.target.checked })
                }
                className="mt-0.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-950"
              />
              <span>
                <span className="font-medium">{copy.settings.controlChars}</span>
                <span className="mt-0.5 block text-[11px] text-zinc-400">
                  {copy.settings.controlCharsHint}
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-2.5 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={options.trimLineEnds}
                onChange={(e) =>
                  updateOptions({ trimLineEnds: e.target.checked })
                }
                className="mt-0.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-950"
              />
              <span className="font-medium">{copy.settings.trimLineEnds}</span>
            </label>

            <label className="flex cursor-pointer items-start gap-2.5 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={options.zenkakuToHankaku}
                onChange={(e) =>
                  updateOptions({ zenkakuToHankaku: e.target.checked })
                }
                className="mt-0.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-950"
              />
              <span className="font-medium">
                {copy.settings.toHalfWidth}
              </span>
            </label>

            <div className="space-y-1.5">
              <p className="text-[11px] font-medium text-zinc-500">
                {copy.settings.newlines}
              </p>
              <div className="flex flex-col gap-1.5">
                {(
                  [
                    ["keep", copy.settings.keepNewlines],
                    ["collapse", copy.settings.collapseBlank],
                    ["remove", copy.settings.removeNewlines],
                  ] as const satisfies ReadonlyArray<
                    readonly [LineBreakMode, string]
                  >
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700"
                  >
                    <input
                      type="radio"
                      name="lineBreakMode"
                      checked={options.lineBreakMode === value}
                      onChange={() => updateOptions({ lineBreakMode: value })}
                      className="border-zinc-300 text-zinc-900 focus:ring-zinc-950"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-[11px] font-medium text-zinc-500">
                {copy.settings.whitespace}
              </p>
              <div className="flex flex-col gap-1.5">
                {(
                  [
                    ["keep", copy.settings.keepNewlines],
                    ["normalize", copy.settings.collapseSpaces],
                    ["remove", copy.settings.removeSpaces],
                  ] as const satisfies ReadonlyArray<
                    readonly [WhitespaceMode, string]
                  >
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700"
                  >
                    <input
                      type="radio"
                      name="whitespaceMode"
                      checked={options.whitespaceMode === value}
                      onChange={() => updateOptions({ whitespaceMode: value })}
                      className="border-zinc-300 text-zinc-900 focus:ring-zinc-950"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </fieldset>

          {/* プリセット */}
          <div className="shrink-0 space-y-2.5 border-t border-zinc-100 pt-3">
            <p className="text-[11px] font-medium text-zinc-500">
              {copy.presets.heading}
            </p>

            <div className="space-y-1.5">
              <p className="text-[10px] text-zinc-400">
                {copy.presets.patterns}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {BUILTIN_PACKS.map((pack) => (
                  <div key={pack.id} className="flex overflow-hidden rounded-md border border-zinc-200">
                    <button
                      type="button"
                      title={`${pack.description}（現在のルールに追加）`}
                      onClick={() => applyBuiltinPack(pack.id, "append")}
                      className="bg-zinc-50 px-2 py-1 text-[10px] font-medium text-zinc-700 transition-colors hover:bg-white"
                    >
                      {pack.name}＋
                    </button>
                    <button
                      type="button"
                      title="現在のルールをこのパターンで置き換え"
                      onClick={() => {
                        if (
                          rules.length > 0 &&
                          !window.confirm(
                            `現在のルールを「${pack.name}」で置き換えますか？`,
                          )
                        ) {
                          return;
                        }
                        applyBuiltinPack(pack.id, "replace");
                      }}
                      className="border-l border-zinc-200 bg-white px-1.5 py-1 text-[10px] text-zinc-400 transition-colors hover:text-zinc-700"
                    >
                      {copy.presets.replace}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 rounded-md border border-zinc-100 bg-zinc-50/70 p-2">
              <p className="text-[10px] text-zinc-400">
                {copy.presets.savedSets}
              </p>
              {presets.length === 0 ? (
                <p className="text-[11px] text-zinc-400">
                  {copy.presets.noneYet}
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {presets.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => switchPreset(p.id)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        activePresetId === p.id
                          ? "border-[var(--accent-strong)] bg-[var(--accent)] text-zinc-900"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                      }`}
                    >
                      {p.name}
                      <span className="ml-1 text-[9px] opacity-60">
                        {p.rules.length}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <input
                  type="text"
                  value={presetNameDraft}
                  onChange={(e) => setPresetNameDraft(e.target.value)}
                  placeholder={copy.presets.setNamePlaceholder}
                  className="input-field min-w-[8rem] flex-1 !py-1 !text-xs"
                />
                <button
                  type="button"
                  onClick={saveCurrentAsPreset}
                  className="btn-secondary !px-2 !py-1 text-[10px]"
                >
                  {copy.presets.saveCurrent}
                </button>
                {activePresetId ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const p = presets.find((x) => x.id === activePresetId);
                        const name = window.prompt(
                          "セット名を変更",
                          p?.name ?? "",
                        );
                        if (name !== null) renameActivePreset(name);
                      }}
                      className="text-[10px] text-zinc-400 hover:text-zinc-700"
                    >
                      {copy.presets.rename}
                    </button>
                    <button
                      type="button"
                      onClick={deleteActivePreset}
                      className="text-[10px] text-zinc-400 hover:text-red-600"
                    >
                      {copy.presets.delete}
                    </button>
                    <button
                      type="button"
                      onClick={clearActivePresetLink}
                      className="text-[10px] text-zinc-400 hover:text-zinc-700"
                    >
                      {copy.presets.deselect}
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {/* ルール一覧 */}
          <div className="shrink-0 space-y-2 border-t border-zinc-100 pt-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium text-zinc-500">
                {copy.rules.heading}
                {activePresetId ? (
                  <span className="ml-1.5 font-normal text-zinc-400">
                    （
                    {presets.find((p) => p.id === activePresetId)?.name ??
                      "セット"}
                    を編集中）
                  </span>
                ) : null}
              </p>
              <button
                type="button"
                onClick={addRule}
                className="btn-secondary !px-2 !py-1 text-[10px]"
              >
                {copy.rules.add}
              </button>
            </div>

            {rules.length === 0 ? (
              <p className="text-[11px] leading-relaxed text-zinc-400">
                例：「株式会社」→「(株)」。パターン集から追加もできます。
              </p>
            ) : (
              <ul className="space-y-2">
                {rules.map((rule) => (
                  <li
                    key={rule.id}
                    className="rounded-md border border-zinc-100 bg-zinc-50/80 p-2"
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <label className="flex items-center gap-1.5 text-[11px] text-zinc-600">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={(e) =>
                            patchRule(rule.id, { enabled: e.target.checked })
                          }
                          className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-950"
                        />
                        {copy.rules.enabled}
                      </label>
                      <button
                        type="button"
                        onClick={() => removeRule(rule.id)}
                        className="text-[10px] text-zinc-400 transition-colors hover:text-red-600"
                      >
                        {copy.rules.delete}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      <input
                        type="text"
                        value={rule.find}
                        onChange={(e) =>
                          patchRule(rule.id, { find: e.target.value })
                        }
                        placeholder={copy.rules.find}
                        className="input-field !py-1.5 !text-xs"
                      />
                      <input
                        type="text"
                        value={rule.replace}
                        onChange={(e) =>
                          patchRule(rule.id, { replace: e.target.value })
                        }
                        placeholder={copy.rules.replaceWith}
                        className="input-field !py-1.5 !text-xs"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* プレビュー／差分＋コピー（2列時は右、1列時は下） */}
        <section
          className={`flex min-h-0 flex-col gap-3 rounded-lg border border-zinc-200/80 bg-white p-3 sm:p-4 ${
            showSideColumn ? "overflow-hidden" : ""
          }`}
        >
          <div className="flex shrink-0 flex-wrap items-start justify-between gap-2">
            <div>
              <div className="inline-flex w-fit shrink-0 items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 p-0.5">
                {(
                  [
                    ["result", copy.preview.result],
                    ["diff", copy.preview.diff],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPreviewTab(id)}
                    className={`min-w-[3.25rem] rounded px-2.5 py-1 text-center text-[11px] font-medium transition-colors ${
                      previewTab === id
                        ? "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[10px] text-zinc-400">
                {fmt(copy.preview.stats, {
                  from: stats.originalChars.toLocaleString(),
                  to: stats.cleanedChars.toLocaleString(),
                })}
                {stats.delta !== 0 ? (
                  <span className="ml-1 text-zinc-500">
                    （{stats.delta > 0 ? "+" : ""}
                    {stats.delta.toLocaleString()}）
                  </span>
                ) : null}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!cleaned}
              className="btn-primary !px-3 !py-1.5 text-xs"
            >
              {copied ? copy.preview.copied : copy.preview.copy}
            </button>
          </div>

          <div className="min-h-[16rem] flex-1 overflow-auto rounded-md border border-zinc-100 bg-zinc-50/60 p-3 lg:min-h-0">
            {previewTab === "result" ? (
              cleaned ? (
                <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-zinc-800">
                  {cleaned}
                </pre>
              ) : (
                <p className="text-sm text-zinc-400">
                  {copy.preview.emptyLeft}
                </p>
              )
            ) : input || cleaned ? (
              <DiffView chunks={diffChunks} />
            ) : (
              <p className="text-sm text-zinc-400">
                {copy.preview.emptyReady}
              </p>
            )}
          </div>

          {copied ? (
            <p
              className="shrink-0 text-center text-[11px] font-medium text-emerald-600"
              role="status"
            >
              {copy.preview.toastCopied}
            </p>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
