"use client";

import { useState } from "react";
import type { RobotFreethrowDict } from "@/i18n/apps/robotFreethrow";
import { usePwaInstall } from "./usePwaInstall";

/** タイトル横のコンパクトな「ホームに追加」ボタン */
export default function InstallAppButton({
  copy,
}: {
  copy: RobotFreethrowDict["install"];
}) {
  const { canShow, isIos, canPrompt, promptInstall } = usePwaInstall();
  const [busy, setBusy] = useState(false);

  if (!canShow) return null;

  async function handleClick() {
    if (isIos) {
      window.alert(copy.iosHint);
      return;
    }
    if (canPrompt) {
      setBusy(true);
      try {
        const result = await promptInstall();
        if (result === "unavailable") {
          window.alert(copy.button);
        }
      } finally {
        setBusy(false);
      }
      return;
    }
    window.alert(copy.button);
  }

  return (
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
  );
}
