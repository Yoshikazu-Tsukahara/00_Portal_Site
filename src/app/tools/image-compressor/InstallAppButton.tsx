"use client";

import { useState } from "react";
import type { ImageCompressorDict } from "@/i18n/apps/imageCompressor";
import InstallGuideModal from "./InstallGuideModal";
import { usePwaInstall } from "./usePwaInstall";

/** バックアップ横に置くコンパクトな「ホームに追加」ボタン */
export default function InstallAppButton({
  copy,
}: {
  copy: ImageCompressorDict["install"];
}) {
  const { canShow, isIos, canPrompt, promptInstall } = usePwaInstall();
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideVariant, setGuideVariant] = useState<"ios" | "desktop">("desktop");
  const [busy, setBusy] = useState(false);

  if (!canShow) return null;

  async function handleClick() {
    if (isIos) {
      setGuideVariant("ios");
      setGuideOpen(true);
      return;
    }

    if (canPrompt) {
      setBusy(true);
      try {
        const result = await promptInstall();
        if (result === "unavailable") {
          setGuideVariant("desktop");
          setGuideOpen(true);
        }
      } finally {
        setBusy(false);
      }
      return;
    }

    setGuideVariant("desktop");
    setGuideOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={busy}
        className="lunch-install-btn !px-2.5 !py-1 !text-[11px] active:scale-[0.98] sm:!px-3 sm:!py-1 sm:!text-xs"
        aria-label={copy.buttonAria}
        title={copy.button}
      >
        <span aria-hidden className="text-[12px] leading-none sm:text-[13px]">
          📱
        </span>
        <span className="hidden sm:inline">{copy.buttonShort}</span>
        <span className="sm:hidden">{copy.buttonTiny}</span>
      </button>

      <InstallGuideModal
        open={guideOpen}
        variant={guideVariant}
        copy={copy}
        onClose={() => setGuideOpen(false)}
      />
    </>
  );
}
