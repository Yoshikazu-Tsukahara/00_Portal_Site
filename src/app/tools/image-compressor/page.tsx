"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";

import AppShell from "@/components/AppShell";
import PrivacyNotice from "@/components/PrivacyNotice";
import { fmt, useI18n } from "@/i18n";
import { useLocalStorageState } from "@/lib/localData";
import ImageGrid from "./ImageGrid";
import ImageUploadZone from "./ImageUploadZone";
import InstallAppButton from "./InstallAppButton";
import SettingsPanel from "./SettingsPanel";
import TotalSummary from "./TotalSummary";
import {
  calcSizeReduction,
  compressImageFile,
  createImageItem,
  DEFAULT_SETTINGS,
  normalizeSettings,
  outputFileName,
  sequentialFileName,
  type CompressSettings,
  type ImageItem,
} from "./imageUtils";

const SETTINGS_KEY = "image-compressor-settings:v1";

export default function ImageCompressorPage() {
  const { t } = useI18n();
  const copy = t.apps.imageCompressor;
  const [items, setItems] = useState<ImageItem[]>([]);
  const [settings, setSettings, { hydrated: settingsHydrated }] =
    useLocalStorageState<CompressSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  const [isZipping, setIsZipping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const estimateSeq = useRef(0);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const resolvedSettings = useMemo(
    () => normalizeSettings(settings),
    [settings],
  );

  // 読み込み直後に正規化して書き戻す（古い形式の救済）
  useEffect(() => {
    if (!settingsHydrated) return;
    const normalized = normalizeSettings(settings);
    if (
      normalized.preset !== settings.preset ||
      normalized.sequentialNames !== settings.sequentialNames ||
      normalized.outputFormat !== settings.outputFormat
    ) {
      setSettings(normalized);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsHydrated]);

  function handleSettingsChange(next: CompressSettings) {
    setSettings(normalizeSettings(next));
  }

  const settingsRef = useRef(resolvedSettings);
  settingsRef.current = resolvedSettings;

  // 推定再計算用キー（依存配列の長さを常に1に固定）
  const estimateKey = useMemo(
    () =>
      `${resolvedSettings.preset}:${resolvedSettings.outputFormat}:${items
        .map((i) => i.id)
        .join(",")}`,
    [resolvedSettings.preset, resolvedSettings.outputFormat, items],
  );

  const readyCount = useMemo(
    () => items.filter((i) => i.status === "ready").length,
    [items],
  );
  const canDownload =
    items.length > 0 && readyCount === items.length && !isZipping;

  const totals = useMemo(() => {
    const originalTotal = items.reduce((sum, i) => sum + i.originalSize, 0);
    const ready =
      items.length > 0 &&
      items.every((i) => i.status === "ready" && i.estimatedSize !== null);
    const compressedTotal = ready
      ? items.reduce((sum, i) => sum + (i.estimatedSize ?? 0), 0)
      : null;
    const reduction =
      ready && compressedTotal !== null
        ? calcSizeReduction(originalTotal, compressedTotal)
        : null;
    return {
      originalTotal,
      compressedTotal,
      offPercent: reduction?.offPercent ?? null,
      ready,
    };
  }, [items]);

  const revokeAll = useCallback((list: ImageItem[]) => {
    for (const item of list) {
      URL.revokeObjectURL(item.previewUrl);
    }
  }, []);

  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) {
        URL.revokeObjectURL(item.previewUrl);
      }
    };
  }, []);

  // 設定変更・画像追加時に推定サイズを再算出
  useEffect(() => {
    const snapshot = itemsRef.current;
    if (snapshot.length === 0) return;

    const seq = ++estimateSeq.current;
    let cancelled = false;
    const currentSettings = settingsRef.current;

    async function run() {
      setItems((prev) =>
        prev.map((i) => ({ ...i, status: "pending", estimatedSize: null })),
      );

      for (const item of snapshot) {
        if (cancelled || seq !== estimateSeq.current) return;
        try {
          const result = await compressImageFile(
            item.file,
            currentSettings,
            item.previewUrl,
          );
          if (cancelled || seq !== estimateSeq.current) return;
          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? { ...i, estimatedSize: result.blob.size, status: "ready" }
                : i,
            ),
          );
        } catch {
          if (cancelled || seq !== estimateSeq.current) return;
          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? { ...i, estimatedSize: null, status: "error" }
                : i,
            ),
          );
        }
      }
    }

    const timer = window.setTimeout(run, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [estimateKey]);

  async function handleFiles(files: File[]) {
    setError(null);
    setMessage(null);
    try {
      const created = await Promise.all(files.map((f) => createImageItem(f)));
      setItems((prev) => [...prev, ...created]);
      setMessage(fmt(copy.messages.added, { count: created.length }));
    } catch {
      setError(copy.errors.loadFailed);
    }
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }

  function clearAll() {
    revokeAll(items);
    setItems([]);
    setMessage(null);
    setError(null);
  }

  async function handleZipDownload() {
    if (!canDownload) return;
    setError(null);
    setMessage(null);
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const usedNames = new Set<string>();

      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        const result = await compressImageFile(
          item.file,
          resolvedSettings,
          item.previewUrl,
        );

        let name: string;
        if (resolvedSettings.sequentialNames) {
          // 連番時はセーフティで元採用でも拡張子は結果の ext を使う
          name = sequentialFileName(i + 1, result.ext);
        } else {
          name = outputFileName(item.name, result.ext, result.usedOriginal);
        }

        if (usedNames.has(name)) {
          const base = name.replace(/\.[^.]+$/, "");
          const ext = name.split(".").pop() ?? "jpg";
          let n = 2;
          while (usedNames.has(`${base}_${n}.${ext}`)) n += 1;
          name = `${base}_${n}.${ext}`;
        }
        usedNames.add(name);
        zip.file(name, result.blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "compressed-images.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage(fmt(copy.messages.zipped, { count: items.length }));
    } catch {
      setError(copy.errors.zipFailed);
    } finally {
      setIsZipping(false);
    }
  }

  const totalSummary = (
    <TotalSummary
      originalTotal={totals.originalTotal}
      compressedTotal={totals.compressedTotal}
      offPercent={totals.offPercent}
      ready={totals.ready}
      count={items.length}
    />
  );

  const statusText =
    items.length === 0
      ? copy.addImages
      : readyCount < items.length
        ? fmt(copy.status.estimating, { count: items.length })
        : fmt(copy.status.ready, { count: items.length });

  return (
    <AppShell
      title={copy.shell.title}
      description={copy.shell.description}
      isPwa
      afterDataManager={<InstallAppButton copy={copy.install} />}
      dataManager={{
        appId: "image-compressor",
        fileNamePrefix: "image-compressor",
        getData: () => ({ settings: resolvedSettings }),
        onImport: (raw) => {
          if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
            return false;
          }
          const obj = raw as { settings?: unknown };
          const next = normalizeSettings(
            (obj.settings ?? raw) as Partial<CompressSettings>,
          );
          setSettings(next);
        },
      }}
      actions={
        <div className="flex h-8 w-full max-w-full flex-nowrap items-stretch justify-end gap-1.5 sm:gap-2 md:w-auto">
          <div className="hidden min-w-0 sm:flex sm:items-center">
            {totalSummary}
          </div>
          <button
            type="button"
            onClick={handleZipDownload}
            disabled={!canDownload}
            className="btn-primary h-full shrink-0 !px-3 !py-0 text-xs leading-none active:scale-[0.98] active:bg-zinc-800 disabled:active:scale-100 sm:text-sm"
            aria-disabled={!canDownload}
          >
            <span className="sm:hidden">
              {isZipping ? copy.zippingShort : copy.downloadZipShort}
            </span>
            <span className="hidden sm:inline">
              {isZipping ? copy.zipping : copy.downloadZip}
            </span>
          </button>
        </div>
      }
    >
      <div className="w-full max-w-full min-w-0 space-y-3 overflow-x-hidden">
        <PrivacyNotice />
        {/* モバイルではヘッダー下に総削減率を表示 */}
        <div className="sm:hidden">{totalSummary}</div>

        <ImageUploadZone onFiles={handleFiles} disabled={isZipping} />

        <SettingsPanel
          settings={resolvedSettings}
          onChange={handleSettingsChange}
        />

        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <p className="min-w-0 break-words text-xs text-zinc-500">
            {statusText}
          </p>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {error ? (
              <p className="break-words text-xs text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            {message ? (
              <p
                className="break-words text-xs text-emerald-600"
                role="status"
              >
                {message}
              </p>
            ) : null}
            {items.length > 0 ? (
              <button
                type="button"
                onClick={clearAll}
                className="min-h-11 px-1 text-[11px] text-zinc-400 transition-colors hover:text-zinc-700 active:text-zinc-800 sm:min-h-0"
              >
                {copy.clearAll}
              </button>
            ) : null}
          </div>
        </div>

        <ImageGrid items={items} onRemove={removeItem} />

        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleZipDownload}
            disabled={!canDownload}
            className="btn-primary min-h-11 w-full active:scale-[0.98] sm:min-h-0 sm:w-auto"
            aria-disabled={!canDownload}
          >
            {isZipping ? copy.zipping : copy.downloadZip}
          </button>
          {!canDownload && items.length === 0 ? (
            <p className="text-[11px] text-zinc-400">{copy.status.zipHint}</p>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
