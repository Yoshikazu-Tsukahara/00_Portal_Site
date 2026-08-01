"use client";

import { useState } from "react";
import type { PwaInstallCopy } from "@/lib/pwa/installCopy";
import { usePwaInstall } from "@/lib/pwa";
import PwaInstallGuideModal from "@/components/PwaInstallGuideModal";

/** タイトル横のコンパクトな「ホームに追加」ボタン（共通） */
export default function PwaInstallButton({
  copy,
  className = "lunch-install-btn",
}: {
  copy: PwaInstallCopy;
  /** ボタン用クラス（未指定時はランチ貯金と同系） */
  className?: string;
}) {
  const { canShow, isIos, prepareAndPrompt } = usePwaInstall();
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideVariant, setGuideVariant] = useState<"ios" | "desktop">(
    "desktop",
  );
  const [busy, setBusy] = useState(false);

  if (!canShow) return null;

  async function handleClick() {
    if (isIos) {
      setGuideVariant("ios");
      setGuideOpen(true);
      return;
    }

    setBusy(true);
    try {
      const result = await prepareAndPrompt();
      if (result === "guide" || result === "unavailable") {
        // unavailable はリロード中のこともあり、その場合はモーダルを出さない
        if (result === "guide") {
          setGuideVariant("desktop");
          setGuideOpen(true);
        }
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={busy}
        className={className}
        aria-label={copy.buttonAria}
        title={copy.button}
      >
        <span aria-hidden className="text-[12px] leading-none sm:text-[13px]">
          📱
        </span>
        <span className="hidden sm:inline">{copy.buttonShort}</span>
        <span className="sm:hidden">{copy.buttonTiny}</span>
      </button>

      <PwaInstallGuideModal
        open={guideOpen}
        variant={guideVariant}
        copy={copy}
        onClose={() => setGuideOpen(false)}
      />
    </>
  );
}
