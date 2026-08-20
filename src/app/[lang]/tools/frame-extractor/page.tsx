"use client";

import JSZip from "jszip";
import { FolderOpen, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import AppShell from "@/components/AppShell";
import DesktopOnlyGate from "@/components/DesktopOnlyGate";
import { useI18n } from "@/i18n";
import { fmt } from "@/i18n/fmt";
import { trackToolUsed } from "@/lib/analytics";
import { useCompactLayout } from "@/lib/useCompactLayout";
import CapturePanel from "./CapturePanel";
import FilmStrip from "./FilmStrip";
import FrameControls from "./FrameControls";
import {
  FPS_PRESETS,
  MAX_BURST_FRAMES,
  fileStem,
  isVideoFile,
  loadPrefs,
  savePrefs,
  type CaptureFormat,
  type PlaybackRate,
  type StripThumb,
  type VideoSession,
} from "./types";
import {
  burstFileName,
  captureFilmStrip,
  captureFrameBlob,
  captureFileName,
  downloadBlob,
  formatTimecode,
  frameToTime,
  lastFrameIndex,
  seekVideo,
  seekVideoFast,
  timeToFrame,
} from "./videoEngine";

/** 1フレーム精密コマ送り＆画像切り出し（完全ローカル） */
export default function FrameExtractorPage() {
  const { t } = useI18n();
  const copy = t.apps.frameExtractor;
  const { compact } = useCompactLayout();

  const videoRef = useRef<HTMLVideoElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stripAbortRef = useRef<AbortController | null>(null);
  const burstAbortRef = useRef<AbortController | null>(null);
  /** Object URL はイベント／アンマウントでのみ破棄する */
  const objectUrlRef = useRef<string | null>(null);

  // シーク中にキーリピート連打が来ても、同時 seek せず「最後のターゲットへ順に追従」するための制御
  const seekingRef = useRef(false);
  const pendingSeekTimeRef = useRef<number | null>(null);
  const seekTargetTimeRef = useRef<number | null>(null);
  // 「どの中心フレームの前後フレームが完成しているか」
  const stripReadyCenterFrameRef = useRef<number | null>(null);

  // `openFile` が `refreshStrip` より先に宣言されているため、関数呼び出しは ref 経由にする
  const refreshStripInvokerRef = useRef<
    ((src: string, time: number) => Promise<void>) | null
  >(null);

  const [session, setSession] = useState<VideoSession | null>(null);
  const [dragging, setDragging] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoWidth, setVideoWidth] = useState(0);
  const [videoHeight, setVideoHeight] = useState(0);
  const [rate, setRate] = useState<PlaybackRate>(1);
  const [prefs, setPrefs] = useState(() => loadPrefs());
  const [fpsAutoEnabled, setFpsAutoEnabled] = useState(true);
  const [autoFpsValue, setAutoFpsValue] = useState<number | null>(null);
  const [thumbs, setThumbs] = useState<StripThumb[]>([]);
  const [stripLoading, setStripLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [bursting, setBursting] = useState(false);
  // シャープネスは圧縮ノイズも強調しやすいため、初期はOFFにする
  const [sharpenEnabled, setSharpenEnabled] = useState(false);
  const [burstCurrent, setBurstCurrent] = useState(0);
  const [burstIn, setBurstIn] = useState(0);
  const [burstOut, setBurstOut] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // step 計算に使う fps（自動 or 手動）
  const fps = fpsAutoEnabled && autoFpsValue ? autoFpsValue : prefs.fps;
  const format = prefs.format;
  const quality = prefs.quality;

  const lastFrame = lastFrameIndex(duration, fps);
  const currentFrame = Math.min(lastFrame, timeToFrame(currentTime, fps));
  const burstStartFrame = Math.min(
    timeToFrame(burstIn, fps),
    timeToFrame(burstOut, fps),
  );
  const burstEndFrame = Math.max(
    timeToFrame(burstIn, fps),
    timeToFrame(burstOut, fps),
  );
  const burstCount = session
    ? Math.max(0, burstEndFrame - burstStartFrame + 1)
    : 0;

  const fpsOptions = useMemo(() => {
    if (FPS_PRESETS.includes(fps as (typeof FPS_PRESETS)[number])) {
      return FPS_PRESETS;
    }
    return [...FPS_PRESETS, fps].sort((a, b) => a - b);
  }, [fps]);

  function patchPrefs(
    patch: Partial<{ format: CaptureFormat; quality: number; fps: number }>,
  ) {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      savePrefs(next);
      return next;
    });
  }

  const handleFpsAutoChange = useCallback((next: boolean) => {
    setFpsAutoEnabled(next);
    if (next) setAutoFpsValue(null);
  }, []);

  const clearSession = useCallback(() => {
    stripAbortRef.current?.abort();
    burstAbortRef.current?.abort();
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    seekingRef.current = false;
    pendingSeekTimeRef.current = null;
    seekTargetTimeRef.current = null;
    stripReadyCenterFrameRef.current = null;

    setSession(null);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setVideoWidth(0);
    setVideoHeight(0);
    setThumbs([]);
    setBurstIn(0);
    setBurstOut(0);
    setBursting(false);
    setBusy(false);
    setAutoFpsValue(null);
  }, []);

  useEffect(() => {
    return () => {
      stripAbortRef.current?.abort();
      burstAbortRef.current?.abort();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === fullscreenRef.current);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const openFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      setError(null);
      setMessage(null);
      if (!isVideoFile(file)) {
        setError(copy.unsupported);
        return;
      }
      clearSession();
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setSession({ file, url, name: file.name });
      trackToolUsed("frame_extractor", "load");
      // 初回の前後フレーム生成（矢印キーのゲート判定に必要）
      if (refreshStripInvokerRef.current) {
        void refreshStripInvokerRef.current(url, 0);
      } else {
        // `useEffect` で invokerRef をセットするため、念のため次ティックに再試行
        window.setTimeout(() => {
          void refreshStripInvokerRef.current?.(url, 0);
        }, 0);
      }
    },
    [clearSession, copy.unsupported],
  );

  const refreshStrip = useCallback(
    async (src: string, time: number) => {
      // state の `playing` は更新遅延があり得るため、実際の動画状態を優先する
      const v = videoRef.current;
      if (v && !v.paused) return;
      stripAbortRef.current?.abort();
      const ac = new AbortController();
      stripAbortRef.current = ac;
      setStripLoading(true);
      // 再生成中は古いサムネが残って「矢印操作がズレた」ように見えやすいため、先にクリアする
      setThumbs([]);
      stripReadyCenterFrameRef.current = null;
      try {
        const next = await captureFilmStrip(
          src,
          time,
          fps,
          videoRef.current?.duration || duration,
          ac.signal,
        );
        if (!ac.signal.aborted) {
          setThumbs(next);
          // FilmStrip が生成した中心の目標位置を記録（矢印キー無効化の判定に使う）
          stripReadyCenterFrameRef.current = timeToFrame(time, fps);
        }
      } catch (err) {
        if ((err as DOMException).name !== "AbortError") {
          setThumbs([]);
        }
      } finally {
        setStripLoading(false);
      }
    },
    [duration, fps],
  );

  // ref 経由で `openFile` から呼び出すための受け渡し（レンダー外で更新）
  useEffect(() => {
    refreshStripInvokerRef.current = refreshStrip;
  }, [refreshStrip]);

  // FilmStrip の再生成は、シーク完了（onSeeked）で即時開始するため
  // currentTime 監視のデバウンスは行わない。

  const seekTo = useCallback(async (time: number) => {
    const video = videoRef.current;
    if (!video) return;

    // 押し続け（キーリピート）時に、次のターゲット計算の基準になる値を即更新
    seekTargetTimeRef.current = time;

    // すでにシーク中なら「最後の狙い」だけ更新して戻る
    if (seekingRef.current) {
      pendingSeekTimeRef.current = time;
      return;
    }

    seekingRef.current = true;
    pendingSeekTimeRef.current = null;

    let target: number | null = time;
    try {
      // シーク完了→次の pending があれば、同じ call の中で順に追従
      while (target != null) {
        // 操作感優先：高速シーク（表示フレーム同期の厳密待ちを省略）
        await seekVideoFast(video, target);
        setCurrentTime(video.currentTime);
        setPlaying(false);

        target = pendingSeekTimeRef.current;
        pendingSeekTimeRef.current = null;
      }
    } catch {
      setError(copy.videoError);
    } finally {
      seekingRef.current = false;
      seekTargetTimeRef.current = video.currentTime;
    }
  }, [copy.videoError]);

  const stepFrame = useCallback(
    (delta: number) => {
      const video = videoRef.current;
      if (!video) return;

      // seekTo が並列になっても、次のターゲット計算は「狙いの時刻」を基準にする
      const baseTime = seekTargetTimeRef.current ?? video.currentTime;
      const frame = Math.min(
        lastFrameIndex(video.duration, fps),
        Math.max(0, timeToFrame(baseTime, fps) + delta),
      );
      void seekTo(frameToTime(frame, fps));
    },
    [fps, seekTo],
  );

  const nudge = useCallback(
    (seconds: number) => {
      const video = videoRef.current;
      if (!video) return;

      const baseTime = seekTargetTimeRef.current ?? video.currentTime;
      void seekTo(baseTime + seconds);
    },
    [seekTo],
  );

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || busy) return;
    if (video.paused) {
      video.playbackRate = rate;
      setThumbs([]);
      void video.play().catch(() => setError(copy.videoError));
    } else {
      video.pause();
    }
  }, [busy, copy.videoError, rate]);

  const toggleFullscreen = useCallback(async () => {
    const host = fullscreenRef.current;
    if (!host) return;
    try {
      if (document.fullscreenElement === host) {
        await document.exitFullscreen();
      } else if (!document.fullscreenElement) {
        await host.requestFullscreen();
      }
    } catch {
      // 失敗時は何もしない（ブラウザ制約）
    }
  }, []);

  const saveCurrentFrame = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !session || busy) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (!video.paused) video.pause();
      await seekVideo(video, video.currentTime);
      const blob = await captureFrameBlob(
        video,
        format,
        quality,
        sharpenEnabled,
      );
      const frame = timeToFrame(video.currentTime, fps);
      downloadBlob(
        blob,
        captureFileName(
          fileStem(session.name),
          video.currentTime,
          frame,
          format,
        ),
      );
      setMessage(copy.captureOk);
      trackToolUsed("frame_extractor", "save_frame");
    } catch {
      setError(copy.captureFail);
    } finally {
      setBusy(false);
    }
  }, [
    busy,
    copy.captureFail,
    copy.captureOk,
    format,
    fps,
    quality,
    session,
    sharpenEnabled,
  ]);

  const runBurst = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !session || busy) return;
    if (burstCount <= 0 || burstCount > MAX_BURST_FRAMES) return;

    const from = burstStartFrame;
    const to = burstEndFrame;
    const restore = video.currentTime;
    burstAbortRef.current?.abort();
    const ac = new AbortController();
    burstAbortRef.current = ac;

    setBusy(true);
    setBursting(true);
    setBurstCurrent(0);
    setError(null);
    setMessage(null);

    try {
      if (!video.paused) video.pause();
      const zip = new JSZip();
      let index = 1;
      for (let frame = from; frame <= to; frame += 1) {
        if (ac.signal.aborted) throw new DOMException("aborted", "AbortError");
        await seekVideo(video, frameToTime(frame, fps));
        const blob = await captureFrameBlob(
          video,
          format,
          quality,
          sharpenEnabled,
        );
        zip.file(burstFileName(fileStem(session.name), index, format), blob);
        setBurstCurrent(index);
        index += 1;
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, `${fileStem(session.name)}_frames.zip`);
      setMessage(fmt(copy.burstOk, { count: to - from + 1 }));
      trackToolUsed("frame_extractor", "burst_zip");
    } catch (err) {
      if ((err as DOMException).name !== "AbortError") {
        setError(copy.burstFail);
      }
    } finally {
      try {
        await seekVideo(video, restore);
        setCurrentTime(video.currentTime);
      } catch {
        // 復元失敗は無視
      }
      setBursting(false);
      setBusy(false);
    }
  }, [
    burstCount,
    burstEndFrame,
    burstStartFrame,
    busy,
    copy.burstFail,
    copy.burstOk,
    format,
    fps,
    quality,
    session,
    sharpenEnabled,
  ]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!session || busy) return;
      if (e.isComposing) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (target?.isContentEditable) return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
        return;
      }
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        void saveCurrentFrame();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (e.shiftKey) nudge(-0.5);
        else stepFrame(-1);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (e.shiftKey) nudge(0.5);
        else stepFrame(1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, nudge, saveCurrentFrame, session, stepFrame, togglePlay]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.playbackRate = rate;
  }, [rate, session]);

  function snapToPresetFps(raw: number): number | null {
    if (!Number.isFinite(raw) || raw <= 0) return null;
    let best: (typeof FPS_PRESETS)[number] = FPS_PRESETS[0];
    let bestDiff = Math.abs(raw - best);
    for (const c of FPS_PRESETS) {
      const diff = Math.abs(raw - c);
      if (diff < bestDiff) {
        best = c;
        bestDiff = diff;
      }
    }
    return bestDiff <= 1 ? best : best; // preset に近づける方針（差が大きい場合も値は返す）
  }

  function estimateFpsFromVideo(video: HTMLVideoElement): number | null {
    try {
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return null;
      const q = video.getVideoPlaybackQuality?.();
      if (!q) return null;
      const total = (q as VideoPlaybackQuality).totalVideoFrames;
      if (!Number.isFinite(total) || total <= 0) return null;
      const raw = total / duration;
      if (!Number.isFinite(raw) || raw <= 1 || raw >= 240) return null;
      return raw;
    } catch {
      return null;
    }
  }

  function onMeta() {
    const video = videoRef.current;
    if (!video) return;
    setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    setVideoWidth(video.videoWidth);
    setVideoHeight(video.videoHeight);
    setCurrentTime(video.currentTime);

    // 読み込み直後に fps を自動推定（手動上書きができるよう、prefs は変えない）
    if (fpsAutoEnabled && !autoFpsValue) {
      const raw = estimateFpsFromVideo(video);
      const snapped = raw !== null ? snapToPresetFps(raw) : null;
      if (snapped) setAutoFpsValue(snapped);
    }
  }

  useEffect(() => {
    if (!session || !fpsAutoEnabled || autoFpsValue) return;
    const video = videoRef.current;
    if (!video) return;
    const raw = estimateFpsFromVideo(video);
    const snapped = raw !== null ? snapToPresetFps(raw) : null;
    if (snapped) setAutoFpsValue(snapped);
  }, [session, fpsAutoEnabled, autoFpsValue]);

  const editor =
    session == null ? null : (
      <div
        className={
          compact
            ? "flex w-full min-w-0 flex-col gap-3"
            : "grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,22rem)]"
        }
      >
        <div
          ref={fullscreenRef}
          className={`flex min-w-0 flex-col gap-3 ${compact ? "" : "min-h-0"} ${
            isFullscreen ? "h-full w-full bg-black p-3 sm:p-4" : ""
          }`}
        >
          <div
            className={`flex overflow-hidden rounded-md border border-zinc-200 bg-black ${
              compact ? "" : "min-h-0 flex-1"
            }`}
          >
            <video
              ref={videoRef}
              key={session.url}
              src={session.url}
              playsInline
              className={`w-full bg-black object-contain ${
                compact
                  ? "aspect-video max-h-[40vh]"
                  : "h-full min-h-0 max-h-full flex-1"
              }`}
              onLoadedMetadata={onMeta}
              onDurationChange={onMeta}
              onPlay={() => {
                setPlaying(true);
                setThumbs([]);
              }}
              onPause={() => {
                setPlaying(false);
                const v = videoRef.current;
                if (v) {
                  setCurrentTime(v.currentTime);
                  // ユーザーのドラッグ等でのシークなら、次の矢印操作の基準を同期する
                  if (!seekingRef.current) {
                    seekTargetTimeRef.current = v.currentTime;
                  }
                }
              }}
              onTimeUpdate={() => {
                const v = videoRef.current;
                if (v) {
                  setCurrentTime(v.currentTime);
                  if (!seekingRef.current) {
                    seekTargetTimeRef.current = v.currentTime;
                  }
                }
              }}
              onSeeked={() => {
                const v = videoRef.current;
                if (v) {
                  setCurrentTime(v.currentTime);
                  if (!seekingRef.current) {
                    seekTargetTimeRef.current = v.currentTime;
                  }
                  // シーンバー操作やコマ送りでのシーク完了直後に、前後フレームを即再生成する
                  // 保存中（busy）や連写中（bursting）は無駄な再生成を避ける
                  if (!bursting && !busy) {
                    void refreshStrip(session.url, v.currentTime);
                  }
                }
              }}
              onError={() => setError(copy.videoError)}
              onClick={togglePlay}
            />
          </div>

          <div
            className={`shrink-0 rounded-md border border-zinc-200/80 bg-white px-3 py-3 sm:px-4 sm:py-3 ${
              isFullscreen ? "bg-zinc-950/90 text-zinc-100" : ""
            }`}
          >
            <p className="break-all text-[11px] font-medium text-zinc-500">
              {session.name}
            </p>
            <p
              className={`mt-1 font-display text-3xl tabular-nums leading-none tracking-tight sm:text-[2.35rem] ${
                isFullscreen ? "text-zinc-100" : "text-zinc-900"
              }`}
            >
              {formatTimecode(currentTime)}
            </p>
            <p
              className={`mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs ${
                isFullscreen ? "text-zinc-300" : "text-zinc-500"
              }`}
            >
              <span>
                {fmt(copy.frameLabel, {
                  current: currentFrame,
                  total: lastFrame,
                })}
              </span>
              {videoWidth > 0 ? (
                <span>
                  {fmt(copy.resolutionLabel, {
                    width: videoWidth,
                    height: videoHeight,
                  })}
                </span>
              ) : null}
            </p>
            <div className="mt-3">
              <FrameControls
                copy={copy}
                playing={playing}
                disabled={busy}
                rate={rate}
                fpsAutoEnabled={fpsAutoEnabled}
                onFpsAutoChange={handleFpsAutoChange}
                fps={fps}
                fpsOptions={fpsOptions}
                currentTime={currentTime}
                duration={duration}
                onTogglePlay={togglePlay}
                onStepFrame={stepFrame}
                onNudge={nudge}
                onRateChange={(next) => {
                  setRate(next);
                  const v = videoRef.current;
                  if (v) v.playbackRate = next;
                }}
                onFpsChange={(next) => patchPrefs({ fps: next })}
                onSeekTime={(time) => void seekTo(time)}
                isFullscreen={isFullscreen}
                onToggleFullscreen={() => void toggleFullscreen()}
              />
            </div>
            <p
              className={`mt-3 hidden text-[11px] leading-relaxed lg:block ${
                isFullscreen ? "text-zinc-400" : "text-zinc-400"
              }`}
            >
              {copy.shortcutsTitle}
              {" — "}
              {copy.shortcutPlay}
              {" / "}
              {copy.shortcutFrame}
              {" / "}
              {copy.shortcutHalf}
              {" / "}
              {copy.shortcutSave}
            </p>
          </div>
        </div>

        <div
          className={`flex min-w-0 flex-col gap-2 ${
            compact ? "" : "min-h-0"
          }`}
        >
          <FilmStrip
            copy={copy}
            thumbs={thumbs}
            currentFrame={currentFrame}
            playing={playing}
            loading={stripLoading}
            onSelect={(time) => void seekTo(time)}
          />
          <CapturePanel
            copy={copy}
            format={format}
            quality={quality}
            sharpenEnabled={sharpenEnabled}
            burstCount={burstCount}
            burstIn={Math.min(burstIn, burstOut)}
            burstOut={Math.max(burstIn, burstOut)}
            bursting={bursting}
            burstCurrent={burstCurrent}
            busy={busy}
            onFormatChange={(next) => patchPrefs({ format: next })}
            onQualityChange={(next) => patchPrefs({ quality: next })}
            onToggleSharpen={setSharpenEnabled}
            onSave={() => void saveCurrentFrame()}
            onMarkIn={() => setBurstIn(currentTime)}
            onMarkOut={() => setBurstOut(currentTime)}
            onBurst={() => void runBurst()}
            onCancelBurst={() => burstAbortRef.current?.abort()}
          />
        </div>
      </div>
    );

  return (
    <AppShell
      title={copy.shell.title}
      titleShort={copy.shell.titleShort}
      description={copy.shell.description}
      fillViewport
      actions={
        session ? (
          <div className="flex w-full max-w-full flex-nowrap items-center gap-1 sm:gap-2 md:w-auto md:justify-end">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              className="btn-secondary min-w-0 flex-1 !inline-flex !items-center justify-center gap-1.5 active:scale-[0.98] active:bg-zinc-100 sm:flex-none sm:!px-3 sm:!py-1.5 sm:text-sm"
            >
              <FolderOpen className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate">{copy.openFile}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                clearSession();
                setError(null);
                setMessage(null);
              }}
              disabled={busy}
              className="btn-secondary min-w-0 flex-1 !inline-flex !items-center justify-center gap-1.5 text-rose-600 hover:text-rose-700 active:scale-[0.98] active:bg-zinc-100 sm:flex-none sm:!px-3 sm:!py-1.5 sm:text-sm"
            >
              <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate">{copy.clearVideo}</span>
            </button>
          </div>
        ) : undefined
      }
    >
      <DesktopOnlyGate title={copy.shell.title}>
      <div
        className={`flex w-full max-w-full flex-col gap-3 overflow-x-clip ${
          compact ? "pb-4" : "min-h-0 flex-1"
        } ${
          dragging && session
            ? "rounded-md outline outline-2 outline-[var(--accent-strong)] outline-offset-2"
            : ""
        }`}
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
          if (e.currentTarget.contains(e.relatedTarget as Node)) return;
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          openFile(e.dataTransfer.files?.[0]);
        }}
      >
        {!session ? (
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
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-12 text-center transition-all duration-150 sm:px-6 sm:py-16 ${
              compact ? "min-h-[50vh]" : "min-h-0 flex-1"
            } ${
              dragging
                ? "border-[var(--accent-strong)] bg-[color-mix(in_srgb,var(--accent)_28%,white)]"
                : "border-zinc-300 bg-white hover:border-zinc-400"
            }`}
          >
            <p className="break-words text-base font-semibold text-zinc-900">
              {copy.dropHint}
            </p>
            <p className="mt-2 max-w-md break-words text-sm leading-relaxed text-zinc-500">
              {copy.dropSub}
            </p>
          </div>
        ) : (
          editor
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
          accept="video/*,.mp4,.webm,.mov,.mkv,.m4v,.ogv"
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            openFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      </DesktopOnlyGate>
    </AppShell>
  );
}
