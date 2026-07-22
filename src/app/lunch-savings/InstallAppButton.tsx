"use client";

import { useState } from "react";
import type { LunchSavingsDict } from "@/i18n/apps/lunchSavings";
import InstallGuideModal from "./InstallGuideModal";
import { usePwaInstall } from "./usePwaInstall";

/** バックアップ横に置くコンパクトな「ホームに追加」ボタン */
export default function InstallAppButton({
  copy,
}: {
  copy: LunchSavingsDict["install"];
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
        className="lunch-install-btn"
        aria-label={copy.buttonAria}
        title={copy.button}
      >
        <span aria-hidden className="text-[12px] leading-none sm:text-[13px]">
          📱
        </span>
        <span>{copy.buttonShort}</span>
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
