"use client";

import { Download, FolderOpen, Save, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import AppShell from "@/components/AppShell";
import { useI18n } from "@/i18n";
import { trackToolUsed } from "@/lib/analytics";
import { useCompactLayout } from "@/lib/useCompactLayout";
import FileRail from "./FileRail";
import MediaStage from "./MediaStage";
import MetadataForm from "./MetadataForm";
import {
  artworkFromImageFile,
  captureVideoFrame,
  detectMediaMode,
  fileLooksLikeMp3,
  formatBytes,
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
import {
  downloadBlob,
  normalizeArtworkToJpeg,
  writeMediaFile,
} from "./metadataUtils";
import { canWriteVideoMetadata, writeVideoFile } from "./videoMetadata";
import { EMPTY_ARTWORK, type MediaSession, type MetadataFields } from "./types";

/** 音楽 / 動画メタデータ編集（複数ファイル・クライアント完結） */
export default function MediaMetadataEditorPage() {
  const { t } = useI18n();
  const copy = t.apps.mediaMetadata;
  const { compact } = useCompactLayout();
  /** スマホ／縦型: 一覧と編集をページ切替 */
  const [mobilePane, setMobilePane] = useState<"list" | "detail">("list");
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

  useEffect(() => {
    if (!compact) setMobilePane("list");
  }, [compact]);

  // 編集対象が消えたら一覧へ戻す
  useEffect(() => {
    if (compact && mobilePane === "detail" && !selected) {
      setMobilePane("list");
    }
  }, [compact, mobilePane, selected]);

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
        // スマホでは追加後も一覧のまま（タップで編集へ）
        if (compact) setMobilePane("list");
      }

      if (failed > 0 && loaded.length === 0) setError(copy.loadError);
      else if (skipped > 0 && loaded.length === 0) setError(copy.unsupported);
      else if (skipped > 0) setMessage(copy.unsupportedSome);

      setBusy(false);
    },
    [compact, copy.loadError, copy.unsupported, copy.unsupportedSome],
  );

  function selectFile(id: string) {
    setSelectedId(id);
    if (compact) setMobilePane("detail");
  }

  function backToList() {
    setMobilePane("list");
  }

  function updateSelected(updater: (item: MediaSession) => MediaSession) {
    if (!selectedId) return;
    setItems((prev) =>
      prev.map((item) => (item.id === selectedId ? updater(item) : item)),
    );
  }

  function markDirty(updater: (item: MediaSession) => MediaSession) {
    updateSelected((item) => {
      const next = updater(item);
      return { ...next, dirty: true };
    });
  }

  function updateFields(patch: Partial<MetadataFields>) {
    markDirty((item) => ({
      ...item,
      fields: { ...item.fields, ...patch },
    }));
  }

  function updateFileName(name: string) {
    markDirty((item) => ({
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
      const raw = await artworkFromImageFile(file);
      const jpeg = await normalizeArtworkToJpeg(raw.data!, raw.mime);
      const art = {
        previewUrl: URL.createObjectURL(
          new Blob([new Uint8Array(jpeg)], { type: "image/jpeg" }),
        ),
        data: jpeg,
        mime: "image/jpeg",
        dirty: true,
      };
      revokeArtwork(raw);
      markDirty((item) => {
        revokeArtwork(item.artwork);
        return { ...item, artwork: art };
      });
    } catch {
      setError(copy.loadError);
    }
  }

  async function handleCaptureFrame(video: HTMLVideoElement) {
    const art = await captureVideoFrame(video);
    markDirty((item) => {
      revokeArtwork(item.artwork);
      return { ...item, artwork: art };
    });
  }

  function clearArtwork() {
    markDirty((item) => {
      revokeArtwork(item.artwork);
      return { ...item, artwork: { ...EMPTY_ARTWORK, dirty: true } };
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
    setMobilePane("list");
    setError(null);
    setMessage(null);
  }

  async function handleSave() {
    if (!selected || busy) return;
    setError(null);
    setMessage(null);

    const snapshot = selected;
    setBusy(true);
    try {
      const fileName = resolveExportName(snapshot);

      commitHistory("fileName", snapshot.displayName);
      commitHistory("title", snapshot.fields.title);
      commitHistory("artist", snapshot.fields.artist);
      commitHistory("year", snapshot.fields.year);
      commitHistory("album", snapshot.fields.album);
      commitHistory("track", snapshot.fields.track);
      commitHistory("comment", snapshot.fields.comment);

      let blob: Blob;
      let embedKind: "mp3" | "video" | "rename-only" = "rename-only";

      const artworkPayload = snapshot.artwork.data
        ? { data: snapshot.artwork.data, mime: snapshot.artwork.mime }
        : null;

      if (
        snapshot.mode === "audio" &&
        (await fileLooksLikeMp3(snapshot.file))
      ) {
        blob = await writeMediaFile(
          snapshot.file,
          snapshot.fields,
          artworkPayload,
        );
        embedKind = "mp3";
      } else if (
        snapshot.mode === "video" &&
        canWriteVideoMetadata(snapshot.file)
      ) {
        let videoArt = artworkPayload;
        if (artworkPayload) {
          const jpeg = await normalizeArtworkToJpeg(
            artworkPayload.data,
            artworkPayload.mime,
          );
          videoArt = { data: jpeg, mime: "image/jpeg" };
        }
        blob = await writeVideoFile(snapshot.file, snapshot.fields, videoArt);
        embedKind = "video";
      } else {
        blob = snapshot.file.slice(
          0,
          snapshot.file.size,
          snapshot.file.type || undefined,
        );
      }

      if (!blob || blob.size === 0) {
        throw new Error("empty_output");
      }

      const savedOutput = { blob, fileName };
      const targetId = snapshot.id;
      setItems((prev) =>
        prev.map((item) =>
          item.id === targetId
            ? {
                ...item,
                dirty: false,
                savedOutput,
                artwork: { ...item.artwork, dirty: false },
              }
            : item,
        ),
      );

      if (embedKind === "rename-only") {
        setMessage(
          snapshot.mode === "video"
            ? copy.export.saveOkUnsupportedVideo
            : copy.export.saveOkNonMp3,
        );
      } else {
        setMessage(copy.export.saveOk);
      }
      trackToolUsed("media_metadata_editor", "save");
    } catch (err) {
      console.error(err);
      setError(copy.export.fail);
    } finally {
      setBusy(false);
    }
  }

  function handleDownload() {
    if (!selected || busy) return;
    setError(null);
    setMessage(null);

    if (!selected.savedOutput) {
      setMessage(copy.export.needSave);
      return;
    }
    if (selected.dirty) {
      setMessage(copy.export.dirtyNeedSave);
      return;
    }

    try {
      downloadBlob(selected.savedOutput.blob, selected.savedOutput.fileName);
      setMessage(copy.export.ok);
      trackToolUsed("media_metadata_editor", "download");
    } catch (err) {
      console.error(err);
      setError(copy.export.fail);
    }
  }

  const hasItems = items.length > 0;
  const canDownload = Boolean(
    selected?.savedOutput && !selected.dirty && !busy,
  );
  const showList = !compact || mobilePane === "list";
  const showDetail = !compact || mobilePane === "detail";

  const editorBody = selected ? (
    <>
      <div
        className={`rounded-md border border-zinc-200/80 bg-white p-3 shadow-sm sm:p-5 ${
          compact ? "" : "min-h-0 overflow-y-auto overscroll-auto"
        }`}
      >
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

      <div
        className={`flex flex-col rounded-md border border-zinc-200/80 bg-white p-3 shadow-sm sm:p-5 ${
          compact ? "" : "min-h-0"
        }`}
      >
        <MetadataForm
          mode={selected.mode}
          fields={selected.fields}
          fileName={selected.displayName}
          labels={copy.form}
          history={inputHistory}
          disabled={busy}
          expand={compact}
          onChange={updateFields}
          onFileNameChange={updateFileName}
          onRemoveHistoryItem={removeHistoryItem}
        />

        <div className="mt-4 shrink-0 space-y-2 border-t border-zinc-100 pt-4">
          <p className="text-[11px] leading-relaxed text-zinc-500">
            {copy.export.hint}
          </p>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={busy}
            className="btn-primary inline-flex w-full min-h-11 items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" aria-hidden />
            {busy ? copy.export.saving : copy.export.save}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!canDownload}
            className="btn-secondary inline-flex w-full min-h-11 items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" aria-hidden />
            {copy.export.download}
          </button>
        </div>
      </div>
    </>
  ) : (
    <div className="flex items-center justify-center rounded-md border border-zinc-200/80 bg-white p-10 text-sm text-zinc-500 shadow-sm">
      {copy.selectPrompt}
    </div>
  );

  return (
    <AppShell
      title={copy.shell.title}
      description={copy.shell.description}
      fillViewport={!compact}
      actions={
        hasItems ? (
          <div className="flex w-full max-w-full flex-nowrap items-center gap-1 sm:gap-2 md:w-auto md:justify-end">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              className="btn-secondary min-w-0 flex-1 !inline-flex !items-center justify-center gap-1.5 active:scale-[0.98] active:bg-zinc-100 sm:flex-none sm:!px-3 sm:!py-1.5 sm:text-sm"
            >
              <FolderOpen className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate">{copy.addFiles}</span>
            </button>
            <button
              type="button"
              onClick={clearAll}
              disabled={busy}
              className="btn-secondary min-w-0 flex-1 !inline-flex !items-center justify-center gap-1.5 text-rose-600 hover:text-rose-700 active:scale-[0.98] active:bg-zinc-100 sm:flex-none sm:!px-3 sm:!py-1.5 sm:text-sm"
            >
              <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate">{copy.clearAll}</span>
            </button>
            {compact && mobilePane === "detail" ? (
              <button
                type="button"
                onClick={backToList}
                className="btn-secondary min-w-0 flex-1 !px-2 !py-1.5 text-[11px] leading-tight active:scale-[0.98] active:bg-zinc-100 sm:flex-none sm:!px-3 sm:text-sm"
              >
                {copy.fileList.backToList}
              </button>
            ) : null}
          </div>
        ) : undefined
      }
    >
      <div
        className={`flex w-full max-w-full flex-col gap-3 overflow-x-clip ${
          compact ? "" : "min-h-0 flex-1 overflow-x-hidden"
        }`}
      >
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
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-12 text-center transition sm:px-6 sm:py-16 ${
              compact ? "min-h-[50vh]" : "min-h-0 flex-1"
            } ${
              dragging
                ? "border-[var(--accent-strong)] bg-[color-mix(in_srgb,var(--accent)_28%,white)]"
                : "border-zinc-300 bg-white hover:border-zinc-400"
            }`}
          >
            <p className="break-words text-base font-semibold text-zinc-900">
              {busy ? "…" : copy.dropHint}
            </p>
            <p className="mt-2 max-w-md break-words text-sm leading-relaxed text-zinc-500">
              {copy.dropSub}
            </p>
          </div>
        ) : compact ? (
          <div className="flex w-full max-w-full flex-col gap-3 pb-6">
            {showList ? (
              <div className="w-full">
                <FileRail
                  items={items}
                  selectedId={selectedId}
                  copy={copy.fileList}
                  disabled={busy}
                  expand
                  onSelect={selectFile}
                  onRemove={removeItem}
                />
              </div>
            ) : null}
            {showDetail ? (
              <div className="flex w-full min-w-0 flex-col gap-3">
                {editorBody}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,14rem)_minmax(0,1.1fr)_minmax(16rem,0.9fr)]">
            {showList ? (
              <div className="min-h-0 max-h-[min(40vh,22rem)] lg:max-h-none">
                <FileRail
                  items={items}
                  selectedId={selectedId}
                  copy={copy.fileList}
                  disabled={busy}
                  onSelect={selectFile}
                  onRemove={removeItem}
                />
              </div>
            ) : null}

            {showDetail ? (
              selected ? (
                <>
                  <div className="min-h-0 overflow-y-auto overscroll-auto rounded-md border border-zinc-200/80 bg-white p-4 shadow-sm sm:p-5">
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

                  <div className="flex min-h-0 flex-col rounded-md border border-zinc-200/80 bg-white p-4 shadow-sm sm:p-5">
                    <MetadataForm
                      mode={selected.mode}
                      fields={selected.fields}
                      fileName={selected.displayName}
                      labels={copy.form}
                      history={inputHistory}
                      disabled={busy}
                      onChange={updateFields}
                      onFileNameChange={updateFileName}
                      onRemoveHistoryItem={removeHistoryItem}
                    />

                    <div className="mt-auto shrink-0 space-y-2 border-t border-zinc-100 pt-4">
                      <p className="text-[11px] leading-relaxed text-zinc-500">
                        {copy.export.hint}
                      </p>
                      <button
                        type="button"
                        onClick={() => void handleSave()}
                        disabled={busy}
                        className="btn-primary inline-flex w-full items-center justify-center gap-2"
                      >
                        <Save className="h-4 w-4" aria-hidden />
                        {busy ? copy.export.saving : copy.export.save}
                      </button>
                      <button
                        type="button"
                        onClick={handleDownload}
                        disabled={!canDownload}
                        className="btn-secondary inline-flex w-full items-center justify-center gap-2"
                      >
                        <Download className="h-4 w-4" aria-hidden />
                        {copy.export.download}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="col-span-full flex items-center justify-center rounded-md border border-zinc-200/80 bg-white p-10 text-sm text-zinc-500 shadow-sm lg:col-span-2">
                  {copy.selectPrompt}
                </div>
              )
            ) : null}
          </div>
        )}

        {(error || message) && (
          <div
            className={`shrink-0 break-words rounded-md border px-3.5 py-2.5 text-xs ${
              error
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-zinc-200 bg-zinc-50 text-zinc-600"
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
