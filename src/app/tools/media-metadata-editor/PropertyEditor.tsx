"use client";

import { useRef, useState } from "react";
import { useI18n } from "@/i18n";
import type {
  ArtworkState,
  ImageEditState,
  MediaItem,
  MetadataFields,
} from "./types";

const TEXT_KEYS: (keyof MetadataFields)[] = [
  "title",
  "artist",
  "album",
  "albumArtist",
  "genre",
  "track",
];

/** プロパティ編集フォーム＋ジャケット／画像 Exif＋適用ダウンロード */
export default function PropertyEditor({
  item,
  busy,
  onFieldsChange,
  onImageEditChange,
  onArtworkChange,
  onClearArtwork,
  onApplyDownload,
}: {
  item: MediaItem;
  busy?: boolean;
  onFieldsChange: (fields: MetadataFields) => void;
  onImageEditChange: (edit: ImageEditState) => void;
  onArtworkChange: (artwork: ArtworkState) => void;
  onClearArtwork: () => void;
  onApplyDownload: () => void;
}) {
  const { t } = useI18n();
  const copy = t.apps.mediaMetadata;
  const artInputRef = useRef<HTMLInputElement>(null);
  const [artDragging, setArtDragging] = useState(false);

  const labels: Record<keyof MetadataFields, string> = {
    title: copy.fields.title,
    artist: copy.fields.artist,
    album: copy.fields.album,
    albumArtist: copy.fields.albumArtist,
    genre: copy.fields.genre,
    year: copy.fields.year,
    track: copy.fields.track,
    comment: copy.fields.comment,
  };

  const canEditAudio = item.kind === "audio";
  const canEditImage = item.kind === "image" && item.imageEdit != null;
  const canRewrite = item.writable;
  const imageEdit = item.imageEdit;

  const isDirtyAudio =
    item.artwork.dirty ||
    TEXT_KEYS.some((k) => item.fields[k] !== item.originalFields[k]) ||
    item.fields.year !== item.originalFields.year ||
    item.fields.comment !== item.originalFields.comment;

  const isDirtyImage =
    !!imageEdit &&
    !!item.originalImageEdit &&
    (imageEdit.title !== item.originalImageEdit.title ||
      imageEdit.description !== item.originalImageEdit.description ||
      imageEdit.comment !== item.originalImageEdit.comment ||
      imageEdit.copyright !== item.originalImageEdit.copyright ||
      imageEdit.datetime !== item.originalImageEdit.datetime ||
      imageEdit.stripExif !== item.originalImageEdit.stripExif);

  const isDirty = canEditAudio ? isDirtyAudio : isDirtyImage;

  async function handleArtworkFile(file: File | null) {
    if (!file) return;
    const okType =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/webp" ||
      /\.(jpe?g|png|webp)$/i.test(file.name);
    if (!okType) return;

    const data = await file.arrayBuffer();
    if (item.artwork.previewUrl) {
      URL.revokeObjectURL(item.artwork.previewUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    onArtworkChange({
      previewUrl,
      data,
      mime: file.type || "image/jpeg",
      dirty: true,
    });
  }

  function setField<K extends keyof MetadataFields>(key: K, value: string) {
    onFieldsChange({ ...item.fields, [key]: value });
  }

  function setImageField<K extends keyof ImageEditState>(
    key: K,
    value: ImageEditState[K],
  ) {
    if (!imageEdit) return;
    onImageEditChange({ ...imageEdit, [key]: value });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ファイル基本情報 */}
      <section className="rounded-md border border-zinc-200/80 bg-zinc-50/60 px-3 py-3">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <p className="text-[11px] font-medium text-zinc-600">
            {copy.fileInfo}
          </p>
          {isDirty ? (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800">
              {copy.dirtyBadge}
            </span>
          ) : null}
          {imageEdit?.hasGps ? (
            <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700">
              {copy.gpsDetected}
            </span>
          ) : null}
        </div>
        <dl className="grid grid-cols-[7rem_1fr] gap-x-2 gap-y-1 text-[12px]">
          <dt className="text-zinc-400">{copy.infoName}</dt>
          <dd className="truncate text-zinc-800">{item.file.name}</dd>
          <dt className="text-zinc-400">{copy.infoType}</dt>
          <dd className="text-zinc-800">{item.file.type || "—"}</dd>
          <dt className="text-zinc-400">{copy.infoModified}</dt>
          <dd className="text-zinc-800">
            {new Date(item.file.lastModified).toLocaleString()}
          </dd>
          {item.extra.width != null && item.extra.height != null ? (
            <>
              <dt className="text-zinc-400">{copy.infoDimensions}</dt>
              <dd className="text-zinc-800">
                {item.extra.width} × {item.extra.height}
              </dd>
            </>
          ) : null}
        </dl>
        <p
          className={`mt-2 text-[11px] leading-relaxed ${
            canRewrite ? "text-zinc-500" : "text-amber-700/90"
          }`}
        >
          {item.kind === "image"
            ? copy.writeImageNote
            : canRewrite
              ? copy.writeMp3Note
              : copy.writeLimitedNote}
        </p>
      </section>

      {/* 画像プレビュー */}
      {item.kind === "image" && item.artwork.previewUrl ? (
        <section>
          <p className="mb-2 text-[11px] font-medium text-zinc-600">
            {copy.imagePreview}
          </p>
          <div className="overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.artwork.previewUrl}
              alt=""
              className="mx-auto max-h-56 w-full object-contain"
            />
          </div>
        </section>
      ) : null}

      {/* 画像 Exif 編集 */}
      {canEditImage && imageEdit ? (
        <section>
          <p className="mb-1 text-[11px] font-medium text-zinc-600">
            {copy.imageProperties}
          </p>
          <p className="mb-3 text-[11px] leading-relaxed text-zinc-400">
            {copy.imagePropertiesHint}
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-1 block text-[11px] text-zinc-500">
                {copy.imageFields.title}
              </span>
              <input
                type="text"
                value={imageEdit.title}
                onChange={(e) => setImageField("title", e.target.value)}
                disabled={imageEdit.stripExif}
                className="input-field w-full disabled:opacity-50"
                autoComplete="off"
              />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-1 block text-[11px] text-zinc-500">
                {copy.imageFields.description}
              </span>
              <textarea
                value={imageEdit.description}
                onChange={(e) => setImageField("description", e.target.value)}
                disabled={imageEdit.stripExif}
                rows={2}
                className="input-field w-full resize-y disabled:opacity-50"
              />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-1 block text-[11px] text-zinc-500">
                {copy.imageFields.comment}
              </span>
              <textarea
                value={imageEdit.comment}
                onChange={(e) => setImageField("comment", e.target.value)}
                disabled={imageEdit.stripExif}
                rows={2}
                className="input-field w-full resize-y disabled:opacity-50"
              />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-1 block text-[11px] text-zinc-500">
                {copy.imageFields.copyright}
              </span>
              <input
                type="text"
                value={imageEdit.copyright}
                onChange={(e) => setImageField("copyright", e.target.value)}
                disabled={imageEdit.stripExif}
                className="input-field w-full disabled:opacity-50"
                autoComplete="off"
              />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-1 block text-[11px] text-zinc-500">
                {copy.imageFields.datetime}
              </span>
              <input
                type="datetime-local"
                value={imageEdit.datetime}
                onChange={(e) => setImageField("datetime", e.target.value)}
                disabled={imageEdit.stripExif}
                className="input-field w-full disabled:opacity-50"
              />
            </label>
          </div>

          <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-md border border-zinc-200 bg-zinc-50/80 px-3 py-3">
            <input
              type="checkbox"
              checked={imageEdit.stripExif}
              onChange={(e) => setImageField("stripExif", e.target.checked)}
              className="mt-0.5 size-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
            />
            <span>
              <span className="block text-[12px] font-medium text-zinc-800">
                {copy.stripExifLabel}
              </span>
              <span className="mt-0.5 block text-[11px] leading-relaxed text-zinc-500">
                {copy.stripExifHint}
              </span>
            </span>
          </label>
        </section>
      ) : null}

      {/* 音声メタデータフォーム */}
      {canEditAudio ? (
        <section>
          <p className="mb-1 text-[11px] font-medium text-zinc-600">
            {copy.properties}
          </p>
          <p className="mb-3 text-[11px] leading-relaxed text-zinc-400">
            {copy.propertiesHint}
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {TEXT_KEYS.map((key) => (
              <label
                key={key}
                className={
                  key === "title" || key === "album" ? "sm:col-span-2" : ""
                }
              >
                <span className="mb-1 block text-[11px] text-zinc-500">
                  {labels[key]}
                </span>
                <input
                  type="text"
                  value={item.fields[key]}
                  onChange={(e) => setField(key, e.target.value)}
                  className="input-field w-full"
                  autoComplete="off"
                />
              </label>
            ))}
            <label>
              <span className="mb-1 block text-[11px] text-zinc-500">
                {labels.year}
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={1800}
                max={2100}
                placeholder="YYYY"
                value={item.fields.year}
                onChange={(e) => setField("year", e.target.value)}
                className="input-field w-full"
              />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-1 block text-[11px] text-zinc-500">
                {labels.comment}
              </span>
              <textarea
                value={item.fields.comment}
                onChange={(e) => setField("comment", e.target.value)}
                rows={3}
                className="input-field w-full resize-y"
              />
            </label>
          </div>
        </section>
      ) : null}

      {/* ジャケット D&D（音声） */}
      {item.kind === "audio" ? (
        <section>
          <p className="mb-1 text-[11px] font-medium text-zinc-600">
            {copy.artwork}
          </p>
          <p className="mb-3 text-[11px] leading-relaxed text-zinc-400">
            {copy.artworkHint}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <div className="flex size-36 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 sm:size-40">
              {item.artwork.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.artwork.previewUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <span className="px-2 text-center text-[11px] text-zinc-400">
                  {copy.noArtwork}
                </span>
              )}
            </div>

            <div
              role="button"
              tabIndex={canRewrite ? 0 : -1}
              aria-disabled={!canRewrite}
              onKeyDown={(e) => {
                if (!canRewrite) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  artInputRef.current?.click();
                }
              }}
              onClick={() => {
                if (canRewrite) artInputRef.current?.click();
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (canRewrite) setArtDragging(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (canRewrite) setArtDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setArtDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setArtDragging(false);
                if (!canRewrite) return;
                const f = e.dataTransfer.files?.[0] ?? null;
                void handleArtworkFile(f);
              }}
              className={`flex min-h-[9rem] flex-1 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-3 py-4 text-center transition-colors ${
                !canRewrite
                  ? "cursor-not-allowed border-zinc-200 bg-zinc-50 opacity-60"
                  : artDragging
                    ? "border-zinc-950 bg-zinc-100"
                    : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              <p className="text-sm font-medium text-zinc-800">
                {copy.artworkDrop}
              </p>
              <p className="mt-1 text-[11px] text-zinc-400">
                {copy.artworkDropSub}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <span className="btn-secondary pointer-events-none !px-3 !py-1.5 text-xs">
                  {copy.changeArtwork}
                </span>
                {item.artwork.previewUrl ? (
                  <button
                    type="button"
                    disabled={!canRewrite}
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearArtwork();
                    }}
                    className="btn-secondary !px-3 !py-1.5 text-xs"
                  >
                    {copy.clearArtwork}
                  </button>
                ) : null}
              </div>
              <input
                ref={artInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                className="hidden"
                disabled={!canRewrite}
                onChange={(e) => {
                  void handleArtworkFile(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
              />
            </div>
          </div>
        </section>
      ) : null}

      {/* 適用してダウンロード */}
      <section className="sticky bottom-0 -mx-1 border-t border-zinc-100 bg-white/95 px-1 pt-4 backdrop-blur-sm">
        <button
          type="button"
          onClick={onApplyDownload}
          disabled={!canRewrite || busy}
          className="btn-primary w-full !py-2.5 text-sm"
        >
          {busy ? copy.downloading : copy.applyDownload}
        </button>
        <p className="mt-2 text-center text-[11px] leading-relaxed text-zinc-400">
          {copy.applyDownloadHint}
        </p>
      </section>
    </div>
  );
}
