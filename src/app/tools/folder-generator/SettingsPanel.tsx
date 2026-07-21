"use client";

import type { ReactNode } from "react";
import { useCallback, useRef, useState } from "react";
import { fmt, useI18n } from "@/i18n";
import type { FolderGeneratorDict } from "@/i18n/apps/folderGenerator";
import { type VariableToken } from "./types";
import { extractColumnValuesFromFile } from "./parseSpreadsheet";
import { countListItems } from "./listUtils";
import { getVariableMeta } from "./variableMeta";

const labelClass = "mb-1 block text-xs font-medium text-zinc-500";

type SettingsCopy = FolderGeneratorDict["settings"];
type DateFormatsCopy = FolderGeneratorDict["dateFormats"];
type DateIncrementCopy = FolderGeneratorDict["dateIncrement"];
type NumberStyleCopy = FolderGeneratorDict["numberStyle"];

/** リスト用：Excel / CSV のドラッグ＆ドロップ取り込み */
function ListFileImport({
  copy,
  onImported,
}: {
  copy: SettingsCopy;
  onImported: (items: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      const lower = file.name.toLowerCase();
      const ok =
        lower.endsWith(".xlsx") ||
        lower.endsWith(".xls") ||
        lower.endsWith(".csv");
      if (!ok) {
        setError(copy.importInvalidType);
        setStatus(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      setStatus(null);
      try {
        const values = await extractColumnValuesFromFile(file);
        if (values.length === 0) {
          setError(copy.importNoData);
          return;
        }
        onImported(values.join(","));
        setStatus(fmt(copy.importDone, { count: values.length }));
      } catch {
        setError(copy.importFailed);
      } finally {
        setIsLoading(false);
      }
    },
    [copy, onImported],
  );

  return (
    <div className="mt-2">
      <p className={labelClass}>{copy.importHeading}</p>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void processFile(file);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-3 py-3 text-center transition-colors ${
          isDragging
            ? "border-zinc-950 bg-zinc-100"
            : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
        }`}
      >
        <p className="text-xs font-medium text-zinc-700">
          {isLoading ? copy.importLoading : copy.importDrop}
        </p>
        <p className="mt-0.5 text-[11px] text-zinc-400">{copy.importSub}</p>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void processFile(file);
            e.target.value = "";
          }}
        />
      </div>
      {status && (
        <p className="mt-1 text-[11px] text-emerald-600" role="status">
          {status}
        </p>
      )}
      {error && (
        <p className="mt-1 text-[11px] text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function VariableSettingsCard({
  token,
  settingsCopy,
  dateFormats,
  dateIncrement,
  numberStyle,
  variableKinds,
  onChange,
}: {
  token: VariableToken;
  settingsCopy: SettingsCopy;
  dateFormats: DateFormatsCopy;
  dateIncrement: DateIncrementCopy;
  numberStyle: NumberStyleCopy;
  variableKinds: FolderGeneratorDict["variableKinds"];
  onChange: (id: string, patch: Partial<VariableToken>) => void;
}) {
  const meta = getVariableMeta(variableKinds);
  const variableMeta = meta[token.type];
  const title = `${variableMeta.short}${token.index}`;

  return (
    <div className="rounded-md border border-zinc-200/60 bg-zinc-50/50 p-2.5">
      <h3
        className={`mb-1.5 inline-flex rounded border px-2 py-0.5 text-xs font-semibold ${variableMeta.color}`}
      >
        {title}
      </h3>

      {token.type === "date" && (
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor={`${token.id}-format`}>
              {settingsCopy.format}
            </label>
            <select
              id={`${token.id}-format`}
              className="input-field w-full !py-1.5"
              value={token.date.format}
              onChange={(e) =>
                onChange(token.id, {
                  date: {
                    ...token.date,
                    format: e.target.value as VariableToken["date"]["format"],
                  },
                })
              }
            >
              <option value="yyyymmdd">{dateFormats.yyyymmdd}</option>
              <option value="yyyy-mm-dd">{dateFormats.yyyymmddDash}</option>
              <option value="yyyy/mm/dd">{dateFormats.yyyymmddSlash}</option>
              <option value="yyyy年mm月dd日">{dateFormats.yyyymmddJa}</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor={`${token.id}-increment`}>
              {settingsCopy.increment}
            </label>
            <select
              id={`${token.id}-increment`}
              className="input-field w-full !py-1.5"
              value={token.date.increment}
              onChange={(e) =>
                onChange(token.id, {
                  date: {
                    ...token.date,
                    increment: e.target.value as "fixed" | "daily",
                  },
                })
              }
            >
              <option value="fixed">{dateIncrement.fixed}</option>
              <option value="daily">{dateIncrement.daily}</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor={`${token.id}-base`}>
              {settingsCopy.baseDate}
            </label>
            <input
              id={`${token.id}-base`}
              type="date"
              className="input-field w-full !py-1.5"
              value={token.date.baseDate}
              onChange={(e) =>
                onChange(token.id, {
                  date: { ...token.date, baseDate: e.target.value },
                })
              }
            />
          </div>
        </div>
      )}

      {token.type === "number" && (
        <div className="grid gap-2 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor={`${token.id}-style`}>
              {settingsCopy.numberStyle}
            </label>
            <select
              id={`${token.id}-style`}
              className="input-field w-full !py-1.5"
              value={token.number.style}
              onChange={(e) =>
                onChange(token.id, {
                  number: {
                    ...token.number,
                    style: e.target.value as "numeric" | "alpha",
                  },
                })
              }
            >
              <option value="numeric">{numberStyle.numeric}</option>
              <option value="alpha">{numberStyle.alpha}</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor={`${token.id}-start`}>
              {settingsCopy.startNumber}
            </label>
            <input
              id={`${token.id}-start`}
              type="number"
              min={0}
              className="input-field w-full !py-1.5"
              value={token.number.start}
              onChange={(e) =>
                onChange(token.id, {
                  number: {
                    ...token.number,
                    start: Number(e.target.value) || 0,
                  },
                })
              }
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`${token.id}-digits`}>
              {settingsCopy.digits}
            </label>
            <input
              id={`${token.id}-digits`}
              type="number"
              min={1}
              max={8}
              disabled={token.number.style === "alpha"}
              className="input-field w-full !py-1.5 disabled:opacity-50"
              value={token.number.digits}
              onChange={(e) =>
                onChange(token.id, {
                  number: {
                    ...token.number,
                    digits: Math.max(1, Number(e.target.value) || 1),
                  },
                })
              }
            />
          </div>
        </div>
      )}

      {token.type === "list" && (
        <div>
          <label className={labelClass} htmlFor={`${token.id}-list`}>
            {settingsCopy.listManual}
          </label>
          <textarea
            id={`${token.id}-list`}
            rows={2}
            className="input-field w-full"
            placeholder={settingsCopy.listPlaceholder}
            value={token.list.items}
            onChange={(e) =>
              onChange(token.id, {
                list: { items: e.target.value },
              })
            }
          />
          <p className="mt-1 text-[11px] text-zinc-400">
            {fmt(settingsCopy.listCount, {
              count: countListItems(token.list.items),
            })}
          </p>
          <ListFileImport
            copy={settingsCopy}
            onImported={(items) =>
              onChange(token.id, {
                list: { items },
              })
            }
          />
        </div>
      )}
    </div>
  );
}

/** 詳細設定エリア（ツリー全体の変数を重複なく表示） */
export default function SettingsPanel({
  variables,
  totalCount,
  totalCountLocked = false,
  includeGitkeep,
  onTotalCountChange,
  onUpdateVariable,
  onIncludeGitkeepChange,
  templateBar,
}: {
  variables: VariableToken[];
  totalCount: number;
  totalCountLocked?: boolean;
  includeGitkeep: boolean;
  onTotalCountChange: (n: number) => void;
  onUpdateVariable: (id: string, patch: Partial<VariableToken>) => void;
  onIncludeGitkeepChange: (v: boolean) => void;
  templateBar?: ReactNode;
}) {
  const { t } = useI18n();
  const appCopy = t.apps.folderGenerator;
  const settingsCopy = appCopy.settings;

  return (
    <section className="content-card !p-2.5 sm:!p-3">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">
            {settingsCopy.heading}
          </h2>
          <p className="mt-0.5 text-[11px] text-zinc-500">
            {settingsCopy.subheading}
          </p>
        </div>
      </div>

      {templateBar}

      <div className="mb-2 flex flex-wrap items-end gap-3">
        <div className="max-w-[7rem]">
          <label className={labelClass} htmlFor="total-count">
            {settingsCopy.totalCount}
          </label>
          <input
            id="total-count"
            type="number"
            min={1}
            max={500}
            readOnly={totalCountLocked}
            className={`input-field w-full !py-1.5 text-sm ${totalCountLocked ? "bg-zinc-50 text-zinc-600" : ""}`}
            value={totalCount}
            onChange={(e) =>
              onTotalCountChange(
                Math.min(500, Math.max(1, Number(e.target.value) || 1)),
              )
            }
          />
          {totalCountLocked ? (
            <p className="mt-0.5 text-[10px] text-zinc-400">
              {settingsCopy.totalCountLocked}
            </p>
          ) : null}
        </div>

        <label className="flex cursor-pointer items-center gap-1.5 pb-1 text-xs text-zinc-700">
          <input
            type="checkbox"
            checked={includeGitkeep}
            onChange={(e) => onIncludeGitkeepChange(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-950"
          />
          {settingsCopy.includeGitkeep}
        </label>
      </div>

      {variables.length === 0 ? (
        <p className="rounded-md border border-dashed border-zinc-200 px-3 py-3 text-center text-sm text-zinc-400">
          {settingsCopy.noVariables}
        </p>
      ) : (
        <div className="grid gap-2">
          {variables.map((token) => (
            <VariableSettingsCard
              key={token.id}
              token={token}
              settingsCopy={settingsCopy}
              dateFormats={appCopy.dateFormats}
              dateIncrement={appCopy.dateIncrement}
              numberStyle={appCopy.numberStyle}
              variableKinds={appCopy.variableKinds}
              onChange={onUpdateVariable}
            />
          ))}
        </div>
      )}
    </section>
  );
}
