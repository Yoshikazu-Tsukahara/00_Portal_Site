"use client";

import { useCallback, useMemo, useState } from "react";
import JSZip from "jszip";

import AppShell from "@/components/AppShell";
import { fmt, useI18n } from "@/i18n";
import { useLocalStorageState } from "@/lib/localData";
import FileList from "./FileList";
import {
  createId,
  detectKind,
  downloadBlob,
  isMp3File,
  readImageDimensions,
  readMediaTags,
  writeMediaFile,
} from "./metadataUtils";
import { isWritableImage, readImageExif, writeImageFile } from "./imageExif";
import PresetBar from "./PresetBar";
import PropertyEditor from "./PropertyEditor";
import {
  APP_ID,
  EMPTY_FIELDS,
  STORAGE_KEY,
  type ArtworkState,
  type FieldPreset,
  type ImageEditState,
  type MediaEditorAppData,
  type MediaItem,
  type MetadataFields,
} from "./types";
import UploadZone from "./UploadZone";

function normalizeAppData(raw: unknown): MediaEditorAppData {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { presets: [] };
  }
  const obj = raw as { presets?: unknown };
  const presets = Array.isArray(obj.presets)
    ? obj.presets.filter(
        (p): p is FieldPreset =>
          !!p &&
          typeof p === "object" &&
          typeof (p as FieldPreset).id === "string" &&
          typeof (p as FieldPreset).name === "string",
      )
    : [];
  return { presets };
}

export default function MediaMetadataEditorPage() {
  const { t } = useI18n();
  const copy = t.apps.mediaMetadata;
  const [appData, setAppData, { hydrated }] =
    useLocalStorageState<MediaEditorAppData>(STORAGE_KEY, { presets: [] });
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(
    () => items.find((i) => i.id === selectedId) ?? null,
    [items, selectedId],
  );

  const readyCount = items.filter((i) => i.status === "ready").length;
  const canDownload = readyCount > 0 && !busy;

  const loadFile = useCallback(async (file: File): Promise<MediaItem> => {
    const id = createId();
    const kind = detectKind(file);
    const writable =
      isMp3File(file) || (kind === "image" && isWritableImage(file));
    const base: MediaItem = {
      id,
      file,
      kind,
      writable,
      fields: { ...EMPTY_FIELDS },
      originalFields: { ...EMPTY_FIELDS },
      imageEdit: null,
      originalImageEdit: null,
      artwork: {
        previewUrl: null,
        data: null,
        mime: "image/jpeg",
        dirty: false,
      },
      extra: {},
      status: "loading",
    };

    try {
      if (kind === "audio") {
        const { fields, artwork } = await readMediaTags(file);
        let artworkState: ArtworkState = {
          previewUrl: null,
          data: null,
          mime: "image/jpeg",
          dirty: false,
        };
        if (artwork) {
          const blob = new Blob([new Uint8Array(artwork.data)], {
            type: artwork.mime,
          });
          artworkState = {
            previewUrl: URL.createObjectURL(blob),
            data: artwork.data,
            mime: artwork.mime,
            dirty: false,
          };
        }
        return {
          ...base,
          fields,
          originalFields: { ...fields },
          artwork: artworkState,
          status: "ready",
        };
      }

      if (kind === "image") {
        const dim = await readImageDimensions(file);
        const imageEdit = await readImageExif(file);
        return {
          ...base,
          imageEdit,
          originalImageEdit: { ...imageEdit },
          extra: dim ?? {},
          artwork: {
            previewUrl: URL.createObjectURL(file),
            data: null,
            mime: file.type || "image/jpeg",
            dirty: false,
          },
          status: "ready",
        };
      }

      return {
        ...base,
        fields: { ...EMPTY_FIELDS, title: file.name.replace(/\.[^.]+$/, "") },
        originalFields: {
          ...EMPTY_FIELDS,
          title: file.name.replace(/\.[^.]+$/, ""),
        },
        status: "ready",
      };
    } catch {
      return { ...base, status: "error", error: "read-failed" };
    }
  }, []);

  async function handleFiles(files: File[]) {
    setError(null);
    setMessage(null);
    const loaded = await Promise.all(files.map((f) => loadFile(f)));
    setItems((prev) => {
      // 古いプレビュー URL は残す（個別削除時に revoke）
      const next = [...prev, ...loaded];
      return next;
    });
    setSelectedId((prev) => prev ?? loaded[0]?.id ?? null);
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.artwork.previewUrl) {
        URL.revokeObjectURL(target.artwork.previewUrl);
      }
      const next = prev.filter((i) => i.id !== id);
      if (selectedId === id) {
        setSelectedId(next[0]?.id ?? null);
      }
      return next;
    });
  }

  function clearAll() {
    for (const item of items) {
      if (item.artwork.previewUrl) URL.revokeObjectURL(item.artwork.previewUrl);
    }
    setItems([]);
    setSelectedId(null);
    setMessage(null);
    setError(null);
  }

  function updateSelectedFields(fields: MetadataFields) {
    if (!selectedId) return;
    setItems((prev) =>
      prev.map((i) => (i.id === selectedId ? { ...i, fields } : i)),
    );
  }

  function updateSelectedImageEdit(imageEdit: ImageEditState) {
    if (!selectedId) return;
    setItems((prev) =>
      prev.map((i) => (i.id === selectedId ? { ...i, imageEdit } : i)),
    );
  }

  function updateSelectedArtwork(artwork: ArtworkState) {
    if (!selectedId) return;
    setItems((prev) =>
      prev.map((i) => (i.id === selectedId ? { ...i, artwork } : i)),
    );
  }

  function clearSelectedArtwork() {
    if (!selectedId) return;
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== selectedId) return i;
        if (i.artwork.previewUrl) URL.revokeObjectURL(i.artwork.previewUrl);
        return {
          ...i,
          artwork: {
            previewUrl: null,
            data: null,
            mime: "image/jpeg",
            dirty: true,
          },
        };
      }),
    );
  }

  async function downloadOne(item: MediaItem) {
    if (item.kind === "image" && item.imageEdit) {
      const blob = await writeImageFile(item.file, item.imageEdit);
      downloadBlob(blob, item.file.name);
      return;
    }
    const art =
      item.artwork.data && item.artwork.data.byteLength > 0
        ? { data: item.artwork.data, mime: item.artwork.mime }
        : null;
    const blob = await writeMediaFile(item.file, item.fields, art);
    downloadBlob(blob, item.file.name);
  }

  async function handleDownloadSelected() {
    if (!selected || selected.status !== "ready" || !selected.writable) return;
    setBusy(true);
    setError(null);
    try {
      await downloadOne(selected);
      setMessage(copy.downloadOk);
    } catch {
      setError(copy.downloadFail);
    } finally {
      setBusy(false);
    }
  }

  async function handleDownloadAll() {
    const ready = items.filter((i) => i.status === "ready");
    if (ready.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      if (ready.length === 1) {
        await downloadOne(ready[0]);
      } else {
        const zip = new JSZip();
        for (const item of ready) {
          if (item.kind === "image" && item.imageEdit) {
            const blob = await writeImageFile(item.file, item.imageEdit);
            zip.file(item.file.name, blob);
          } else {
            const art =
              item.artwork.data && item.artwork.data.byteLength > 0
                ? { data: item.artwork.data, mime: item.artwork.mime }
                : null;
            const blob = await writeMediaFile(item.file, item.fields, art);
            zip.file(item.file.name, blob);
          }
        }
        const out = await zip.generateAsync({ type: "blob" });
        downloadBlob(out, "media-metadata-edited.zip");
      }
      setMessage(copy.downloadOk);
    } catch {
      setError(copy.downloadFail);
    } finally {
      setBusy(false);
    }
  }

  function applyPreset(preset: FieldPreset) {
    if (!selectedId) return;
    setItems((prev) =>
      prev.map((i) =>
        i.id === selectedId
          ? { ...i, fields: { ...i.fields, ...preset.fields } }
          : i,
      ),
    );
    setMessage(copy.presetApplied);
  }

  function savePreset(name: string) {
    if (!selected) return;
    const next: FieldPreset = {
      id: createId(),
      name,
      fields: { ...selected.fields },
      createdAt: new Date().toISOString(),
    };
    setAppData({ presets: [...appData.presets, next] });
  }

  function deletePreset(id: string) {
    setAppData({ presets: appData.presets.filter((p) => p.id !== id) });
  }

  if (!hydrated) {
    return (
      <AppShell title={copy.shell.title} description={copy.shell.description}>
        <p className="text-sm text-zinc-400">{copy.loading}</p>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={copy.shell.title}
      description={copy.shell.description}
      dataManager={{
        appId: APP_ID,
        fileNamePrefix: "media-metadata-editor",
        getData: () => ({ presets: appData.presets }),
        onImport: (raw) => {
          const next = normalizeAppData(raw);
          setAppData(next);
        },
      }}
      actions={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => void handleDownloadSelected()}
            disabled={!selected || !selected.writable || busy}
            className="btn-primary !px-3 !py-1.5 text-xs sm:text-sm"
          >
            {busy ? copy.downloading : copy.applyDownload}
          </button>
          <button
            type="button"
            onClick={() => void handleDownloadAll()}
            disabled={!canDownload}
            className="btn-secondary !px-3 !py-1.5 text-xs sm:text-sm"
          >
            {busy ? copy.downloading : copy.downloadAll}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        {/* ローカル完結の安心メッセージ */}
        <p className="rounded-md border border-zinc-200/80 bg-zinc-100/70 px-3.5 py-3 text-xs leading-relaxed text-zinc-600 sm:text-[13px]">
          {copy.privacyBanner}
        </p>

        <UploadZone onFiles={(f) => void handleFiles(f)} disabled={busy} />

        <PresetBar
          presets={appData.presets}
          currentFields={selected?.fields ?? null}
          onApply={applyPreset}
          onSave={savePreset}
          onDelete={deletePreset}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-zinc-500">
            {items.length === 0
              ? copy.statusEmpty
              : fmt(copy.statusCount, {
                  ready: readyCount,
                  total: items.length,
                })}
          </p>
          <div className="flex items-center gap-2">
            {error ? (
              <p className="text-xs text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="text-xs text-emerald-600" role="status">
                {message}
              </p>
            ) : null}
            {items.length > 0 ? (
              <button
                type="button"
                onClick={clearAll}
                className="text-[11px] text-zinc-400 transition-colors hover:text-zinc-700"
              >
                {copy.clearAll}
              </button>
            ) : null}
          </div>
        </div>

        <div className="grid min-h-[28rem] gap-3 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
          <aside className="flex max-h-[36rem] flex-col overflow-hidden rounded-md border border-zinc-200/80 bg-white shadow-sm">
            <p className="shrink-0 border-b border-zinc-100 px-3 py-2 text-[11px] font-medium text-zinc-500">
              {copy.fileList}
            </p>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <FileList
                items={items}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onRemove={removeItem}
              />
            </div>
          </aside>

          <section className="rounded-md border border-zinc-200/80 bg-white p-4 shadow-sm">
            {selected && selected.status === "ready" ? (
              <PropertyEditor
                item={selected}
                busy={busy}
                onFieldsChange={updateSelectedFields}
                onImageEditChange={updateSelectedImageEdit}
                onArtworkChange={updateSelectedArtwork}
                onClearArtwork={clearSelectedArtwork}
                onApplyDownload={() => void handleDownloadSelected()}
              />
            ) : selected?.status === "loading" ? (
              <p className="py-12 text-center text-sm text-zinc-400">
                {copy.loading}
              </p>
            ) : (
              <p className="py-12 text-center text-sm text-zinc-400">
                {copy.selectPrompt}
              </p>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
