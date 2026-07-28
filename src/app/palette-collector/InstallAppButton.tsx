"use client";

import { Smartphone } from "lucide-react";
import { useState } from "react";
import type { PaletteCollectorDict } from "@/i18n/apps/paletteCollector";
import { usePwaInstall } from "./usePwaInstall";

/** ライト基調に合わせたコンパクトな「ホームに追加」ボタン */
export default function InstallAppButton({
  copy,
}: {
  copy: PaletteCollectorDict["install"];
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
      aria-label={copy.buttonAria}
      title={copy.button}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium tracking-tight text-gray-700 shadow-sm transition-all duration-200 ease-out hover:-translate-y-px hover:border-gray-300 hover:text-gray-900 active:translate-y-0 disabled:cursor-wait disabled:opacity-60 sm:px-3 sm:py-1 sm:text-xs"
    >
      <Smartphone className="size-3" aria-hidden />
      <span>{copy.buttonShort}</span>
    </button>
  );
}
