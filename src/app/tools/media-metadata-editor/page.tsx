"use client";

import JSZip from "jszip";
import { Download, FolderOpen, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import AppShell from "@/components/AppShell";
import { LanguageToggle, useI18n } from "@/i18n";
import FileRail from "./FileRail";
import MediaStage from "./MediaStage";
import MetadataForm from "./MetadataForm";
import {
  artworkFromImageFile,
  captureVideoFrame,
  detectMediaMode,
  formatBytes,
  isMp3File,
  loadMediaSession,
  revokeArtwork,
  revokeSession,
  sanitizeDownloadName,
  withOriginalExtension,
} from "./mediaCore";
import {
  loadInputHistory,
  pushInputHistory,
  removeInputHistoryItem,
  type HistoryKey,
  type InputHistoryMap,
} from "./inputHistory";
import { downloadBlob, writeMediaFile } from "./metadataUtils";
import { EMPTY_ARTWORK, type MediaSession, type MetadataFields } from "./types";

/** 音楽 / 動画メタデータ編集（複数ファイル・クライアント完結） */
export default function MediaMetadataEditorPage() {
  const { t } = useI18n();
  const copy = t.apps.mediaMetadata;
  const [items, setItems] = useState<MediaSession[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [inputHistory, setInputHistory] = useState<InputHistoryMap>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<MediaSession[]>([]);
  itemsRef.current = items;

  const selected = useMemo(
    () => items.find((i) => i.id === selectedId) ?? null,
    [items, selectedId],
  );

  useEffect(() => {
    setInputHistory(loadInputHistory());
  }, []);

  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) revokeSession(item);
    };
  }, []);

  function commitHistory(key: HistoryKey, value: string) {
    setInputHistory((prev) => pushInputHistory(prev, key, value));
  }

  function removeHistoryItem(key: HistoryKey, value: string) {
    setInputHistory((prev) => removeInputHistoryItem(prev, key, value));
  }

  const addFiles = useCallback(
    async (list: FileList | File[] | null) => {
      if (!list) return;
      const files = Array.from(list);
      if (files.length === 0) return;

      setError(null);
      setMessage(null);
      setBusy(true);

      const loaded: MediaSession[] = [];
      let skipped = 0;
      let failed = 0;

      for (const file of files) {
        if (!detectMediaMode(file)) {
          skipped += 1;
          continue;
        }
        try {
          loaded.push(await loadMediaSession(file));
        } catch {
          failed += 1;
        }
      }

      if (loaded.length > 0) {
        setItems((prev) => [...prev, ...loaded]);
        setSelectedId((prev) => prev ?? loaded[0].id);
      }

      if (failed > 0 && loaded.length === 0) setError(copy.loadError);
      else if (skipped > 0 && loaded.length === 0) setError(copy.unsupported);
      else if (skipped > 0) setMessage(copy.unsupportedSome);

      setBusy(false);
    },
    [copy.loadError, copy.unsupported, copy.unsupportedSome],
  );

  function updateSelected(updater: (item: MediaSession) => MediaSession) {
    if (!selectedId) return;
    setItems((prev) =>
      prev.map((item) => (item.id === selectedId ? updater(item) : item)),
    );
  }

  function updateFields(patch: Partial<MetadataFields>) {
    updateSelected((item) => ({
      ...item,
      fields: { ...item.fields, ...patch },
    }));
  }

  function updateFileName(name: string) {
    updateSelected((item) => ({
      ...item,
      displayName: name,
    }));
  }

  function resolveExportName(item: MediaSession): string {
    const withExt = withOriginalExtension(item.displayName, item.file.name);
    return sanitizeDownloadName(withExt, item.file.name);
  }

  async function handleArtworkFile(file: File) {
    try {
      const art = await artworkFromImageFile(file);
      updateSelected((item) => {
        revokeArtwork(item.artwork);
        return { ...item, artwork: art };
      });
    } catch {
      setError(copy.loadError);
    }
  }

  async function handleCaptureFrame(video: HTMLVideoElement) {
    const art = await captureVideoFrame(video);
    updateSelected((item) => {
      revokeArtwork(item.artwork);
      return { ...item, artwork: art };
    });
  }

  function clearArtwork() {
    updateSelected((item) => {
      revokeArtwork(item.artwork);
      return { ...item, artwork: { ...EMPTY_ARTWORK } };
    });
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) revokeSession(target);
      const next = prev.filter((i) => i.id !== id);
      setSelectedId((cur) => {
        if (cur !== id) return cur;
        return next[0]?.id ?? null;
      });
      return next;
    });
    setError(null);
    setMessage(null);
  }

  function clearAll() {
    setItems((prev) => {
      for (const item of prev) revokeSession(item);
      return [];
    });
    setSelectedId(null);
    setError(null);
    setMessage(null);
  }

  async function exportSessions(targets: MediaSession[]) {
    if (targets.length === 0 || busy) return;
    setError(null);
    setMessage(null);

    const writable = targets.filter(
      (item) => item.mode === "audio" && isMp3File(item.file),
    );
    const hadVideo = targets.some((item) => item.mode === "video");

    if (writable.length === 0) {
      setMessage(hadVideo ? copy.export.videoSoon : copy.export.fail);
      return;
    }

    setBusy(true);
    try {
      if (writable.length === 1) {
        const item = writable[0];
        const blob = await writeMediaFile(
          item.file,
          item.fields,
          item.artwork.data
            ? { data: item.artwork.data, mime: item.artwork.mime }
            : null,
        );
        downloadBlob(blob, resolveExportName(item));
        setMessage(
          hadVideo && targets.length > 1
            ? `${copy.export.ok}（${copy.export.videoSkipped}）`
            : copy.export.ok,
        );
      } else {
        const zip = new JSZip();
        const usedNames = new Set<string>();
        for (const item of writable) {
          const blob = await writeMediaFile(
            item.file,
            item.fields,
            item.artwork.data
              ? { data: item.artwork.data, mime: item.artwork.mime }
              : null,
          );
          let name = resolveExportName(item);
          // ZIP 内の同名衝突を避ける
          if (usedNames.has(name.toLowerCase())) {
            const dot = name.lastIndexOf(".");
            const stem = dot > 0 ? name.slice(0, dot) : name;
            const ext = dot > 0 ? name.slice(dot) : "";
            let n = 2;
            while (usedNames.has(`${stem}-${n}${ext}`.toLowerCase())) n += 1;
            name = `${stem}-${n}${ext}`;
          }
          usedNames.add(name.toLowerCase());
          zip.file(name, blob);
        }
        const out = await zip.generateAsync({ type: "blob" });
        downloadBlob(out, "media-metadata-edited.zip");
        setMessage(
          hadVideo ? `${copy.export.okZip}（${copy.export.videoSkipped}）` : copy.export.okZip,
        );
      }
    } catch {
      setError(copy.export.fail);
    } finally {
      setBusy(false);
    }
  }

  const hasItems = items.length > 0;

  return (
    <AppShell
      title={copy.shell.title}
      description={copy.shell.description}
      wide
      fillViewport
      actions={<LanguageToggle />}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-xl shadow-black/20">
        <div className="flex flex-wrap items-center gap-3 border-b border-zinc-800/90 px-4 py-3 sm:px-5">
          <p className="min-w-0 flex-1 text-xs leading-relaxed text-zinc-400">
            {copy.privacyBanner}
          </p>
          {hasItems ? (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white disabled:opacity-50"
              >
                <FolderOpen className="h-3.5 w-3.5" aria-hidden />
                {copy.addFiles}
              </button>
              <button
                type="button"
                onClick={clearAll}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-rose-500/50 hover:text-rose-300 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                {copy.clearAll}
              </button>
            </div>
          ) : null}
        </div>

        {!hasItems ? (
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              void addFiles(e.dataTransfer.files);
            }}
            className={`m-4 flex min-h-0 flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center transition sm:m-6 ${
              dragging
                ? "border-amber-400 bg-amber-500/10"
                : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-500"
            }`}
          >
            <p className="text-base font-semibold text-zinc-100">
              {busy ? "…" : copy.dropHint}
            </p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
              {copy.dropSub}
            </p>
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-[13.5rem_minmax(0,1.1fr)_minmax(17rem,0.9fr)]">
            <div className="min-h-0 overflow-hidden border-b border-zinc-800 p-3 lg:border-b-0 lg:border-r">
              <FileRail
                items={items}
                selectedId={selectedId}
                copy={copy.fileList}
                disabled={busy}
                onSelect={setSelectedId}
                onRemove={removeItem}
              />
            </div>

            {selected ? (
              <>
                <div className="min-h-0 overflow-y-auto border-b border-zinc-800 p-4 sm:p-5 lg:border-b-0 lg:border-r">
                  <MediaStage
                    mode={selected.mode}
                    mediaUrl={selected.mediaUrl}
                    fileName={selected.displayName || selected.file.name}
                    fileMeta={formatBytes(selected.file.size)}
                    artwork={selected.artwork}
                    copy={{
                      modeAudio: copy.modeAudio,
                      modeVideo: copy.modeVideo,
                      ...copy.stage,
                    }}
                    onArtworkFile={(f) => void handleArtworkFile(f)}
                    onCaptureFrame={handleCaptureFrame}
                    onClearArtwork={clearArtwork}
                  />
                </div>

                <div className="flex min-h-0 flex-col p-4 sm:p-5">
                  <MetadataForm
                    mode={selected.mode}
                    fields={selected.fields}
                    fileName={selected.displayName}
                    labels={copy.form}
                    history={inputHistory}
                    disabled={busy}
                    onChange={updateFields}
                    onFileNameChange={updateFileName}
                    onCommitHistory={commitHistory}
                    onRemoveHistoryItem={removeHistoryItem}
                  />

                  <div className="mt-auto shrink-0 space-y-2 border-t border-zinc-800 pt-4">
                    <p className="text-[11px] leading-relaxed text-zinc-500">
                      {copy.export.hint}
                    </p>
                    <button
                      type="button"
                      onClick={() => void exportSessions([selected])}
                      disabled={busy}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" aria-hidden />
                      {busy ? copy.export.downloading : copy.export.button}
                    </button>
                    {items.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => void exportSessions(items)}
                        disabled={busy}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-600 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {copy.export.buttonAll}
                      </button>
                    ) : null}
                  </div>
                </div>
              </>
            ) : (
              <div className="col-span-full flex items-center justify-center p-10 text-sm text-zinc-500 lg:col-span-2">
                {copy.selectPrompt}
              </div>
            )}
          </div>
        )}

        {(error || message) && (
          <div
            className={`border-t px-4 py-2.5 text-xs sm:px-5 ${
              error
                ? "border-rose-900/60 bg-rose-950/40 text-rose-300"
                : "border-zinc-800 bg-zinc-900/80 text-zinc-300"
            }`}
            role="status"
          >
            {error || message}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,video/*,.mp3,.m4a,.wav,.flac,.ogg,.mp4,.webm,.mov,.mkv,.m4v"
          multiple
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    </AppShell>
  );
}
