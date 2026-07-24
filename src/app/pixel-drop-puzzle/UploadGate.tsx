"use client";



import { useState } from "react";

import type { PixelDropPuzzleDict } from "@/i18n/apps/pixelDropPuzzle";

import ImageCropModal from "./ImageCropModal";

import { loadImageFromFile, type LoadedGameImage } from "./imageUtil";

import { stageThemeStyle } from "./types";



export default function UploadGate({

  copy,

  onSelect,

  compact = false,

  sideRail = false,

  stage = 1,

  onRequestChangeFlow,

}: {

  copy: PixelDropPuzzleDict["upload"];

  onSelect?: (image: LoadedGameImage) => void;

  /** true の場合、既存画像がある状態からの「画像を変更」導線として小さく表示 */

  compact?: boolean;

  /** サイドレール用：全面オーバーレイを開く（プレイ停止） */

  sideRail?: boolean;

  /** アクセント色（ステージ連動） */

  stage?: number;

  /** サイドレールの「画像を変更」押下時 */

  onRequestChangeFlow?: () => void;

}) {

  const themeStyle = stageThemeStyle(stage);

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [pendingImage, setPendingImage] = useState<HTMLImageElement | null>(null);



  async function handleFile(file: File) {

    setBusy(true);

    setError(null);

    try {

      const img = await loadImageFromFile(file);

      setPendingImage(img);

    } catch {

      setError(copy.errorInvalidFile);

    } finally {

      setBusy(false);

    }

  }



  function closeCrop() {

    setPendingImage(null);

  }



  function confirmCrop(image: LoadedGameImage) {

    setPendingImage(null);

    onSelect?.(image);

  }



  if (sideRail) {

    return (

      <button

        type="button"

        className="pxd-records-rail__action"

        disabled={busy}

        onClick={() => onRequestChangeFlow?.()}

      >

        {busy ? copy.buttonBusy : copy.changeButton}

      </button>

    );

  }



  if (compact) {

    return (

      <>

        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-100">

          {busy ? copy.buttonBusy : copy.changeButton}

          <input

            type="file"

            accept="image/jpeg,image/png,image/webp,image/gif"

            className="hidden"

            disabled={busy}

            onChange={(e) => {

              const file = e.target.files?.[0];

              e.target.value = "";

              if (file) void handleFile(file);

            }}

          />

        </label>

        {pendingImage ? (

          <ImageCropModal

            copy={copy}

            image={pendingImage}

            themeStyle={themeStyle}

            onConfirm={confirmCrop}

            onCancel={closeCrop}

          />

        ) : null}

      </>

    );

  }



  return (

    <>

      <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-zinc-800 bg-black/30 px-6 py-12 text-center font-mono">

        <p className="text-3xl" aria-hidden>

          🧩

        </p>

        <div className="space-y-1.5">

          <p className="text-sm font-semibold tracking-wide text-zinc-100">{copy.title}</p>

          <p className="max-w-md text-xs leading-relaxed text-zinc-500">{copy.lead}</p>

        </div>



        <label className="pxd-upload-primary cursor-pointer rounded-lg px-6 py-2.5 text-sm font-bold tracking-wide">

          {busy ? copy.buttonBusy : copy.button}

          <input

            type="file"

            accept="image/jpeg,image/png,image/webp,image/gif"

            className="hidden"

            disabled={busy}

            onChange={(e) => {

              const file = e.target.files?.[0];

              e.target.value = "";

              if (file) void handleFile(file);

            }}

          />

        </label>



        {error ? <p className="text-xs text-red-400">{error}</p> : null}

        <p className="max-w-md text-[10px] leading-relaxed text-zinc-600">{copy.hint}</p>

      </div>



      {pendingImage ? (

        <ImageCropModal

          copy={copy}

          image={pendingImage}

          themeStyle={themeStyle}

          variant="fullscreen"

          onConfirm={confirmCrop}

          onCancel={closeCrop}

        />

      ) : null}

    </>

  );

}

