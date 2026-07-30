"use client";

import { ImagePlus, Clapperboard } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ArtworkState, MediaMode } from "./types";

type Copy = {
  modeAudio: string;
  modeVideo: string;
  artworkTitle: string;
  artworkHint: string;
  artworkDrop: string;
  artworkDropSub: string;
  noArtwork: string;
  clearArtwork: string;
  videoTitle: string;
  videoHint: string;
  captureFrame: string;
  capturing: string;
  captureError: string;
  thumbPreview: string;
};

/** 中央カラム：音楽はジャケット、動画はプレイヤー＋フレームキャプチャ */
export default function MediaStage({
  mode,
  mediaUrl,
  fileName,
  fileMeta,
  artwork,
  copy,
  onArtworkFile,
  onCaptureFrame,
  onClearArtwork,
}: {
  mode: MediaMode;
  mediaUrl: string;
  fileName: string;
  fileMeta?: string;
  artwork: ArtworkState;
  copy: Copy;
  onArtworkFile: (file: File) => void;
  onCaptureFrame: (video: HTMLVideoElement) => Promise<void>;
  onClearArtwork: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const artInputRef = useRef<HTMLInputElement>(null);
  const [artDragging, setArtDragging] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  useEffect(() => {
    setCaptureError(null);
  }, [mediaUrl]);

  function acceptImage(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/") && !/\.(jpe?g|png)$/i.test(file.name)) {
      return;
    }
    onArtworkFile(file);
  }

  async function handleCapture() {
    const video = videoRef.current;
    if (!video || capturing) return;
    setCapturing(true);
    setCaptureError(null);
    try {
      if (video.readyState < 2) {
        await new Promise<void>((resolve, reject) => {
          const onCan = () => {
            cleanup();
            resolve();
          };
          const onErr = () => {
            cleanup();
            reject(new Error("video_error"));
          };
          const cleanup = () => {
            video.removeEventListener("loadeddata", onCan);
            video.removeEventListener("error", onErr);
          };
          video.addEventListener("loadeddata", onCan);
          video.addEventListener("error", onErr);
        });
      }
      await onCaptureFrame(video);
    } catch {
      setCaptureError(copy.captureError);
    } finally {
      setCapturing(false);
    }
  }

  return (
    <section className="flex h-full min-h-0 flex-col gap-4">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
          {mode === "audio" ? copy.modeAudio : copy.modeVideo}
        </p>
        <h2 className="mt-1 line-clamp-2 break-all text-sm font-semibold leading-snug text-zinc-900">
          {fileName}
        </h2>
        {fileMeta ? (
          <p className="mt-1 text-[11px] text-zinc-500">{fileMeta}</p>
        ) : null}
      </div>

      {mode === "audio" ? (
        <>
          <div className="relative flex min-h-[14rem] flex-1 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
            {artwork.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={artwork.previewUrl}
                alt=""
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-zinc-400">
                <ImagePlus className="h-10 w-10 opacity-60" aria-hidden />
                <p className="text-xs">{copy.noArtwork}</p>
              </div>
            )}
          </div>

          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                artInputRef.current?.click();
              }
            }}
            onClick={() => artInputRef.current?.click()}
            onDragEnter={(e) => {
              e.preventDefault();
              setArtDragging(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setArtDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setArtDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setArtDragging(false);
              acceptImage(e.dataTransfer.files?.[0]);
            }}
            className={`cursor-pointer rounded-md border border-dashed px-4 py-5 text-center transition ${
              artDragging
                ? "border-zinc-900 bg-zinc-100"
                : "border-zinc-300 bg-zinc-50/80 hover:border-zinc-400"
            }`}
          >
            <p className="text-sm font-medium text-zinc-800">{copy.artworkDrop}</p>
            <p className="mt-1 text-xs text-zinc-500">{copy.artworkDropSub}</p>
            <p className="mt-2 text-[11px] text-zinc-400">{copy.artworkHint}</p>
            <input
              ref={artInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => {
                acceptImage(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>

          {artwork.previewUrl ? (
            <button
              type="button"
              onClick={onClearArtwork}
              className="self-start text-xs text-zinc-500 underline-offset-2 hover:text-zinc-800 hover:underline"
            >
              {copy.clearArtwork}
            </button>
          ) : null}
        </>
      ) : (
        <>
          <div className="overflow-hidden rounded-md border border-zinc-200 bg-black shadow-inner">
            <video
              ref={videoRef}
              key={mediaUrl}
              src={mediaUrl}
              controls
              playsInline
              className="aspect-video w-full bg-black"
            />
          </div>
          <p className="text-xs leading-relaxed text-zinc-500">{copy.videoHint}</p>

          <button
            type="button"
            onClick={() => void handleCapture()}
            disabled={capturing}
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <Clapperboard className="h-4 w-4" aria-hidden />
            {capturing ? copy.capturing : copy.captureFrame}
          </button>
          {captureError ? (
            <p className="text-xs text-rose-600">{captureError}</p>
          ) : null}

          <div className="min-h-[8rem] overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
            <p className="border-b border-zinc-200 px-3 py-2 text-[11px] font-medium text-zinc-500">
              {copy.thumbPreview}
            </p>
            <div className="flex min-h-[7rem] items-center justify-center p-3">
              {artwork.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={artwork.previewUrl}
                  alt=""
                  className="max-h-40 max-w-full rounded object-contain"
                />
              ) : (
                <p className="text-xs text-zinc-400">{copy.noArtwork}</p>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
