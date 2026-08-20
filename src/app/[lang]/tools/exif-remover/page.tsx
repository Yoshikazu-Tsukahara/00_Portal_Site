"use client";

import { Download, LoaderCircle, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";

import AppShell from "@/components/AppShell";
import { fmt, useI18n } from "@/i18n";
import { trackToolUsed } from "@/lib/analytics";
import ImageDropZone from "./ImageDropZone";
import ResultGrid from "./ResultGrid";
import {
  createPendingItem,
  downloadBlob,
  isImageFile,
  revokeItem,
  stripExifFromFile,
  uniqueFileName,
  type SafeImageItem,
} from "./stripExif";

type WorkItem = SafeImageItem & { file: File };

/** 写真の位置情報（Exif）を Canvas 再出力で削除するツール（複数対応） */
export default function ExifRemoverPage() {
  const { t } = useI18n();
  const copy = t.apps.exifRemover;
  const [items, setItems] = useState<WorkItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const itemsRef = useRef<WorkItem[]>([]);
  const pumpingRef = useRef(false);
  const abortedRef = useRef(false);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    abortedRef.current = false;
    return () => {
      abortedRef.current = true;
      for (const item of itemsRef.current) revokeItem(item);
    };
  }, []);

  const doneCount = useMemo(
    () => items.filter((i) => i.status === "done").length,
    [items],
  );
  const busyCount = useMemo(
    () =>
      items.filter(
        (i) => i.status === "pending" || i.status === "processing",
      ).length,
    [items],
  );
  const errorCount = useMemo(
    () => items.filter((i) => i.status === "error").length,
    [items],
  );
  const isBusy = busyCount > 0 || isZipping;
  const readyItems = useMemo(
    () => items.filter((i) => i.status === "done" && i.blob),
    [items],
  );
  const canSave = readyItems.length > 0 && !isBusy;

  /** 待ち行列を先頭から1件ずつ処理する */
  async function processQueue() {
    if (pumpingRef.current) return;
    pumpingRef.current = true;

    try {
      while (!abortedRef.current) {
        const next = itemsRef.current.find((i) => i.status === "pending");
        if (!next) break;

        setItems((prev) => {
          const updated = prev.map((i) =>
            i.id === next.id ? { ...i, status: "processing" as const } : i,
          );
          itemsRef.current = updated;
          return updated;
        });

        try {
          const blob = await stripExifFromFile(next.file);
          if (abortedRef.current) break;

          const previewUrl = URL.createObjectURL(blob);
          setItems((prev) => {
            if (!prev.some((i) => i.id === next.id)) {
              URL.revokeObjectURL(previewUrl);
              return prev;
            }
            const updated = prev.map((i) => {
              if (i.id !== next.id) return i;
              URL.revokeObjectURL(i.previewUrl);
              return {
                ...i,
                blob,
                previewUrl,
                status: "done" as const,
              };
            });
            itemsRef.current = updated;
            return updated;
          });
        } catch {
          if (abortedRef.current) break;
          setItems((prev) => {
            if (!prev.some((i) => i.id === next.id)) return prev;
            const updated = prev.map((i) =>
              i.id === next.id ? { ...i, status: "error" as const } : i,
            );
            itemsRef.current = updated;
            return updated;
          });
        }
      }
    } finally {
      pumpingRef.current = false;
    }
  }

  function handleFiles(files: File[]) {
    setError(null);
    const images = files.filter(isImageFile);
    const skipped = files.length - images.length;

    if (images.length === 0) {
      setError(copy.errors.notImage);
      return;
    }

    if (skipped > 0) {
      setError(fmt(copy.errors.notImageSome, { count: skipped }));
    }

    const created: WorkItem[] = images.map((file) => ({
      ...createPendingItem(file),
      file,
    }));

    setItems((prev) => {
      const updated = [...prev, ...created];
      itemsRef.current = updated;
      return updated;
    });
    trackToolUsed("exif_remover", "strip", { count: created.length });
    void processQueue();
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) revokeItem(target);
      const updated = prev.filter((i) => i.id !== id);
      itemsRef.current = updated;
      return updated;
    });
  }

  function clearAll() {
    for (const item of itemsRef.current) revokeItem(item);
    itemsRef.current = [];
    setItems([]);
    setError(null);
  }

  function downloadOne(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item?.blob || item.status !== "done") return;
    downloadBlob(item.blob, item.downloadName);
    trackToolUsed("exif_remover", "download", { mode: "single" });
  }

  async function handleSaveAll() {
    if (!canSave) return;
    setError(null);

    if (readyItems.length === 1) {
      const item = readyItems[0];
      if (!item.blob) return;
      downloadBlob(item.blob, item.downloadName);
      trackToolUsed("exif_remover", "download", { mode: "single" });
      return;
    }

    setIsZipping(true);
    try {
      const zip = new JSZip();
      const used = new Set<string>();
      for (const item of readyItems) {
        if (!item.blob) continue;
        zip.file(uniqueFileName(item.downloadName, used), item.blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, "safe-images.zip");
      trackToolUsed("exif_remover", "download", {
        mode: "zip",
        count: readyItems.length,
      });
    } catch {
      setError(copy.errors.zipFailed);
    } finally {
      setIsZipping(false);
    }
  }

  const statusText = (() => {
    if (items.length === 0) return copy.status.idle;
    if (busyCount > 0) {
      return fmt(copy.status.processingProgress, {
        done: doneCount,
        total: items.length,
      });
    }
    if (doneCount === items.length && doneCount > 0) {
      return doneCount === 1
        ? copy.status.done
        : fmt(copy.status.doneMany, { count: doneCount });
    }
    if (doneCount > 0 && errorCount > 0) {
      return fmt(copy.status.partial, {
        done: doneCount,
        failed: errorCount,
      });
    }
    if (errorCount === items.length) return copy.status.error;
    return copy.status.idle;
  })();

  const saveLabel = isZipping
    ? copy.actions.zipping
    : readyItems.length <= 1
      ? copy.actions.download
      : fmt(copy.actions.downloadAll, { count: readyItems.length });

  return (
    <AppShell title={copy.shell.title} description={copy.shell.description}>
      <div className="flex w-full max-w-full min-w-0 flex-col gap-4 overflow-x-hidden pb-6">
        <ImageDropZone
          onFiles={handleFiles}
          disabled={isZipping}
          compact={items.length > 0}
        />

        <p className="break-words text-sm leading-relaxed text-zinc-600">
          {copy.privacyNote}
        </p>

        <div
          className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-zinc-200 bg-white px-4 py-3"
          role="status"
          aria-live="polite"
        >
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              {copy.status.label}
            </p>
            <p
              className={`mt-1 break-words text-sm font-medium ${
                errorCount > 0 && busyCount === 0 && doneCount === 0
                  ? "text-rose-700"
                  : "text-zinc-800"
              }`}
            >
              {statusText}
            </p>
            {error ? (
              <p className="mt-1 break-words text-xs text-rose-600" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          {items.length > 0 ? (
            <button
              type="button"
              onClick={clearAll}
              disabled={isZipping}
              className="btn-secondary !inline-flex min-h-11 shrink-0 items-center gap-1.5 !px-3 !py-1.5 text-xs text-zinc-600 active:scale-[0.98] sm:min-h-0"
            >
              <Trash2 className="size-3.5 shrink-0" aria-hidden />
              {copy.actions.clear}
            </button>
          ) : null}
        </div>

        {items.length > 0 ? (
          <>
            <ResultGrid
              items={items}
              onRemove={removeItem}
              onDownload={downloadOne}
            />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => void handleSaveAll()}
                disabled={!canSave}
                className="btn-primary inline-flex min-h-11 w-full items-center justify-center gap-2 active:scale-[0.98] sm:w-auto"
              >
                {isZipping || busyCount > 0 ? (
                  <LoaderCircle
                    className="size-4 shrink-0 animate-spin"
                    aria-hidden
                  />
                ) : (
                  <Download className="size-4 shrink-0" aria-hidden />
                )}
                {saveLabel}
              </button>
              {readyItems.length > 1 ? (
                <p className="text-[11px] text-zinc-400">
                  {copy.actions.zipHint}
                </p>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
